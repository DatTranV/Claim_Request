using BusinessObjects;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Quartz;
using Repositories;
using Repositories.Commons;
using Repositories.Interfaces;
using Repositories.Repositories;
using Services.Gmail;
using Services.Interfaces;
using Services.Mapper;
using Services.Services;
using WebAPI.Middlewares;

namespace WebAPI.Injection
{
    public static class DependencyInjection
    {
        public static IServiceCollection ServicesInjection(this IServiceCollection services, IConfiguration configuration)
        {
            // CONNECT TO DATABASE
            services.AddDbContext<ClaimRequestDbContext>(options =>
            {
                options.UseSqlServer(configuration.GetConnectionString("DefaultConnection"));
            });
            //sign up for middleware
            services.AddExceptionHandler<GlobalExceptionHandlingMiddleware>();
            //services.AddScoped<AuthorizationFilter>();

            //others
            services.AddScoped<ICurrentTime, CurrentTime>();
            services.AddHttpContextAccessor();
            services.AddAutoMapper(typeof(MapperConfigProfile).Assembly);
            services.AddScoped<IClaimsService, ClaimsService>();
            services.AddScoped<IAuditTrailService, AuditTrailService>();

            // add repositories
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IClaimRepository, ClaimRepository>();
            services.AddScoped<IClaimDetailRepository, ClaimDetailRepository>();
            services.AddScoped<IAuditTrailRepository, AuditTrailRepository>();
            services.AddScoped<IProjectEnrollmentRepository, ProjectEnrollmentRepository>();
            services.AddScoped<IProjectRepository, ProjectRepository>();

            // add generic repositories
            //ex: 
            //services.AddScoped<IGenericRepository<TEntity>, GenericRepository<TEntity>>();
            services.AddScoped<IGenericRepository<ClaimRequest>, GenericRepository<ClaimRequest>>();
            services.AddScoped<IGenericRepository<ClaimDetail>, GenericRepository<ClaimDetail>>();
            services.AddScoped<IGenericRepository<AuditTrail>, GenericRepository<AuditTrail>>();
            services.AddScoped<IGenericRepository<ProjectEnrollment>, GenericRepository<ProjectEnrollment>>();
            services.AddScoped<IGenericRepository<Project>, GenericRepository<Project>>();
            
            // add signInManager
            services.AddScoped<SignInManager<User>>();

            // add services
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IClaimService, ClaimService>();
            services.AddScoped<IClaimDetailService, ClaimDetailService>();
            //services.AddScoped<IAuditTrailService, AuditTrailService>();
            services.AddScoped<IProjectService, ProjectService>();
            services.AddScoped<IEmailService, EmailService>();
            services.AddScoped<IProjectEnrollmentService, ProjectEnrollmentService>();

            // email service
            services.AddSingleton<EmailQueue>();
            services.AddScoped<EmailService>();
            services.AddQuartz();
            services.AddHostedService<EmailReminderService>();
            services.AddQuartzHostedService(q => q.WaitForJobsToComplete = true);
            services.AddHostedService<EmailBackgroundService>();
            services.Configure<SmtpSettings>(configuration.GetSection("SmtpSettings"));



            // add unitOfWork
            services.AddScoped<IUnitOfWork, UnitOfWork>();

            return services;
        }
    }
}
