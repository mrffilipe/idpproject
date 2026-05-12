using FirebaseAdmin;
using FirebaseAdmin.Auth;
using Google.Apis.Auth.OAuth2;
using IdPPlatform.Infrastructure.Configurations;
using IdPPlatform.Infrastructure.Persistence;
using IdPPlatform.Infrastructure.Persistence.Interceptors;
using Amazon;
using Amazon.SimpleEmailV2;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace IdPPlatform.Infrastructure.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddOptions<DatabaseOptions>()
            .Bind(configuration.GetSection(DatabaseOptions.Section))
            .ValidateOnStart();
        services.AddSingleton<IValidateOptions<DatabaseOptions>, DatabaseOptionsValidator>();

        services.AddOptions<JwtOptions>()
            .Bind(configuration.GetSection(JwtOptions.Section))
            .ValidateOnStart();
        services.AddSingleton<IValidateOptions<JwtOptions>, JwtOptionsValidator>();

        services.AddOptions<SessionOptions>()
            .Bind(configuration.GetSection(SessionOptions.Section));

        services.AddOptions<RateLimitOptions>()
            .Bind(configuration.GetSection(RateLimitOptions.Section));

        services.AddOptions<InviteOptions>()
            .Bind(configuration.GetSection(InviteOptions.Section));

        services.AddOptions<EmailOptions>()
            .Bind(configuration.GetSection(EmailOptions.Section));

        services.AddOptions<FirebaseOptions>()
            .Bind(configuration.GetSection(FirebaseOptions.Section))
            .ValidateOnStart();

        services.AddHttpContextAccessor();
        services.AddSingleton<IAmazonSimpleEmailServiceV2>(serviceProvider =>
        {
            var options = serviceProvider.GetRequiredService<IOptions<EmailOptions>>().Value;
            var region = RegionEndpoint.GetBySystemName(options.Region);
            return new AmazonSimpleEmailServiceV2Client(region);
        });

        services.AddScoped<TenantStore>();
        services.AddDbContext(configuration);
        services.AddJwtAuthentication();
        services.AddFirebase();
        services.AddRepositories();
        services.AddQueries();
        services.AddUseCases();
        services.AddServices();

        return services;
    }

    private static IServiceCollection AddDbContext(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetSection(DatabaseOptions.Section)["ConnectionString"];
        services.AddScoped<AuditInterceptor>();

        services.AddDbContext<ApplicationDbContext>((serviceProvider, options) =>
        {
            options.UseMySql(
                connectionString,
                new MySqlServerVersion(new Version(
                    8,
                    0,
                    36)));
            options.AddInterceptors(serviceProvider.GetRequiredService<AuditInterceptor>());
        });
        return services;
    }

    private static IServiceCollection AddJwtAuthentication(this IServiceCollection services)
    {
        services
            .AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer();

        services.AddOptions<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme)
            .Configure<IOptions<JwtOptions>>((options, jwt) =>
            {
                options.MapInboundClaims = false;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = jwt.Value.Issuer,
                    ValidateAudience = true,
                    ValidAudience = jwt.Value.Audience,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = jwt.Value.GetSigningKey(),
                    ValidateLifetime = true,
                    NameClaimType = "sub",
                    RoleClaimType = "trole",
                    ClockSkew = TimeSpan.FromMinutes(1)
                };
            });

        return services;
    }

    private static IServiceCollection AddFirebase(this IServiceCollection services)
    {
        services.AddSingleton(_ =>
        {
            if (FirebaseApp.DefaultInstance is not null)
            {
                return FirebaseApp.DefaultInstance;
            }

            return FirebaseApp.Create(new AppOptions
            {
                Credential = GoogleCredential.GetApplicationDefault()
            });
        });

        services.AddSingleton(_ => FirebaseAuth.DefaultInstance);
        return services;
    }
}
