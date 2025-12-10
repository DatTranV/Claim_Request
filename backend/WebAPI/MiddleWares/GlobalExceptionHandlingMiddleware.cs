using AutoMapper;
using Microsoft.AspNetCore.Diagnostics;
using System.Diagnostics;
using System.Net;
using System.Security;

namespace WebAPI.Middlewares
{
    public class GlobalExceptionHandlingMiddleware(ILogger<GlobalExceptionHandlingMiddleware> logger) : IExceptionHandler
    {
        private readonly ILogger<GlobalExceptionHandlingMiddleware> _logger = logger;

        public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
        {
            var traceId = Activity.Current?.Id ?? httpContext.TraceIdentifier;

            _logger.LogError(exception, "Could not process a request on machine {MachineName} with traceId: {traceId}", Environment.MachineName, traceId);

            var (statusCode, title) = MapException(exception);
            var response = new
            {
                IsSuccess = false,
                status = statusCode,
                message = title,
                extensions = new Dictionary<string, object?>
                {
                    {"traceId", traceId }
                }
            };
            httpContext.Response.ContentType = "application/json";
            //httpContext.Response.StatusCode = statusCode;
            httpContext.Response.StatusCode = (int)HttpStatusCode.OK;
            await httpContext.Response.WriteAsJsonAsync(response, cancellationToken);

            return true;
        }

        private static (int StatusCode, string Title) MapException(Exception exception)
        {
            return exception switch
            {
                UnauthorizedAccessException => (StatusCodes.Status401Unauthorized, "Unauthorized Access"),
                SecurityException => (StatusCodes.Status403Forbidden, "You have no permission on this"),

                ArgumentNullException => (StatusCodes.Status400BadRequest, "Bad Request: " + exception.Message),
                ArgumentException => (StatusCodes.Status400BadRequest, exception.Message),
                DirectoryNotFoundException => (StatusCodes.Status404NotFound, "Directory not found"),

                AutoMapperMappingException => (StatusCodes.Status500InternalServerError, "Mapping Configuration Error"),

                _ => (StatusCodes.Status500InternalServerError, "We made a mistake but we are working on it"),
            };
        }
    }
}

