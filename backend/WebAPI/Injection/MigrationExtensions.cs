using Microsoft.EntityFrameworkCore;
using Repositories;

namespace WebAPI.Injection
{
    public static class MigrationExtensions
    {
        public static void ApplyMigrations(this IApplicationBuilder app, ILogger _logger)
        {
            try
            {
                using IServiceScope scope = app.ApplicationServices.CreateScope();

                using ClaimRequestDbContext dbContext =
                    scope.ServiceProvider.GetRequiredService<ClaimRequestDbContext>();

                dbContext.Database.Migrate();
            }
            catch (Exception e)
            {
                _logger.LogError(e, "An problem occurred during migration!");
            }
        }
    }
}
