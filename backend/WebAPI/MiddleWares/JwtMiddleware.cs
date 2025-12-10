using Microsoft.IdentityModel.Tokens;
using Repositories.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

namespace WebAPI.Middlewares
{
    public class JwtMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IConfiguration _appSettings;

        public JwtMiddleware(RequestDelegate next, IConfiguration appSettings)
        {
            _next = next;
            _appSettings = appSettings;
        }

        public async Task Invoke(HttpContext context, IUserRepository accountRepository)
        {
            var path = context.Request.Path.ToString().ToLower();
            if (path.Contains("/login") || path.Contains("/register"))
            {
                await _next(context);
                return;
            }

            var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
            if (token != null)
            {
                await AttachAccountToContext(context, token, accountRepository);
            }

            await _next(context);
        }

        private async Task AttachAccountToContext(HttpContext context, string token, IUserRepository userRepository)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.UTF8.GetBytes(_appSettings["Jwt:Secret"]);
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                var jwtToken = (JwtSecurityToken)validatedToken;
                var accountId = jwtToken.Claims.First(x => x.Type == "uid").Value;

                // Attach account to context on successful jwt validation
                context.Items["User"] = await userRepository.GetUserByIdAsync(Guid.Parse(accountId));
            }
            catch
            {
                // Do nothing if JWT validation fails
                // Account is not attached to context so request won't have access to secure routes
            }
        }
    }
}