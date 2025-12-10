using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using BusinessObjects;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Repositories;
using WebAPI.Injection;
using WebAPI.Middlewares;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());

});

// Thêm validation middleware
builder.Services.AddValidationMiddleware();

builder.Services.AddSwaggerGen(options =>
{
    var securitySchema = new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Please enter JWT with Bearer prefix in this field",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = JwtBearerDefaults.AuthenticationScheme,
        Reference = new OpenApiReference
        {
            Type = ReferenceType.SecurityScheme,
            Id = JwtBearerDefaults.AuthenticationScheme
        }
    };
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Claim API",
        Version = "v1",
    });

    // Add Bearer Token config in Swagger
    options.AddSecurityDefinition(JwtBearerDefaults.AuthenticationScheme, securitySchema);

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            securitySchema, Array.Empty<string>()
        }
        }
    );
});

//SETUP INJECTION SERVICE
builder.Services.ServicesInjection(builder.Configuration);

//SETUP SERVICE IDENTITY: Allow non alphanumeric
builder.Services.AddIdentityCore<User>(opt =>
{
    opt.Password.RequireNonAlphanumeric = false;
    opt.User.RequireUniqueEmail = false;
    opt.Password.RequireUppercase = false;
    opt.Password.RequireLowercase = false;
})
    .AddRoles<Role>()
    .AddEntityFrameworkStores<ClaimRequestDbContext>()
    .AddDefaultTokenProviders();

// Authentication and JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"]!))
        };
    });

//ADD AUTHORIZATION
builder.Services.AddAuthorization();
builder.Services.Configure<IdentityOptions>(options =>
{
    options.ClaimsIdentity.UserIdClaimType = "uid";
    options.ClaimsIdentity.RoleClaimType = "role";
});
// Add data protection services
//builder.Services.AddDataProtection();

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddRouting(options => options.LowercaseUrls = true);

builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicyDevelopement",
        policy =>
        {
            policy
                .AllowAnyOrigin()
                .AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin();
        }); 
});

var app = builder.Build();

//SCOPE FOR MIGRATION
var scope = app.Services.CreateScope();
var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(config =>
    {
        // Always keep token after reload or refresh browser
        config.SwaggerEndpoint("/swagger/v1/swagger.json", "Claim Request V1");
        config.ConfigObject.AdditionalItems.Add("persistAuthorization", "true");
        config.InjectJavascript("/custom-swagger.js");
    });
    try
    {
        app.ApplyMigrations(logger);
    }
    catch (Exception e)
    {
        logger.LogError(e, "An problem occurred during migration!");
    }
}
var context = scope.ServiceProvider.GetRequiredService<ClaimRequestDbContext>();
try
{
    await DBInitializer.Initialize(context, userManager);
}
catch (Exception e)
{
    logger.LogError(e, "An problem occurred seed data!");
}

app.UseExceptionHandler(_ => { });
app.UseHttpsRedirection();

app.UseRouting();

app.UseCors("CorsPolicyDevelopement");

app.UseAuthentication();
app.UseAuthorization();

app.UseMiddleware<JwtMiddleware>();
app.MapControllers();

app.Run();