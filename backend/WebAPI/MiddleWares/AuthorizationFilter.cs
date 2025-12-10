using DTOs.Enums;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security;
using System.Security.Claims;

namespace WebAPI.Middlewares
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class AuthorizationFilter : Attribute, IAuthorizationFilter
    {
        private readonly IList<RoleEnums> _roles;

        public AuthorizationFilter(params RoleEnums[] roles)
        {
            _roles = roles ?? Array.Empty<RoleEnums>();
        }

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var user = context.HttpContext.User;

            if (!user.Identity?.IsAuthenticated ?? true)
            {
                throw new UnauthorizedAccessException();
            }

            var userRole = user.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(userRole) ||
                !Enum.TryParse<RoleEnums>(userRole, true, out var parsedRole) ||
                (_roles.Any() && !_roles.Contains(parsedRole)))
            {
                throw new SecurityException();
            }
        }
    }
}
