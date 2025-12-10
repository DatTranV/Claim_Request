using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Repositories.Commons;

namespace WebAPI.Middlewares
{
    public class ValidationFilterAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext context)
        {
            if (!context.ModelState.IsValid)
            {
                var errorMessages = new Dictionary<string, List<string>>();

                foreach (var modelStateEntry in context.ModelState.Where(e => e.Value != null && e.Value.Errors.Count > 0))
                {
                    var key = modelStateEntry.Key;
                    var errors = modelStateEntry.Value.Errors.Select(error => error.ErrorMessage).ToList();
                    errorMessages.Add(key, errors);
                }

                var message = "Invalid Data: " + string.Join(", ",
                    errorMessages.SelectMany(e => e.Value).Distinct());
                throw new ArgumentException(message);
            }
        }
    }

    public static class ValidationMiddlewareExtensions
    {
        public static IServiceCollection AddValidationMiddleware(this IServiceCollection services)
        {
            services.Configure<ApiBehaviorOptions>(options =>
            {
                options.SuppressModelStateInvalidFilter = true;
            });

            services.AddMvcCore(options =>
            {
                options.Filters.Add<ValidationFilterAttribute>();
            });

            return services;
        }
    }
}