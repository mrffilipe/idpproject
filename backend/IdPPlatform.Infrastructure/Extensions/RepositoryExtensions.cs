using IdPPlatform.Domain.Repositories;
using IdPPlatform.Infrastructure.Persistence.Repositories;
using Microsoft.Extensions.DependencyInjection;

namespace IdPPlatform.Infrastructure.Extensions;

public static class RepositoryExtensions
{
    public static IServiceCollection AddRepositories(this IServiceCollection services)
    {
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<ITenantRepository, TenantRepository>();
        services.AddScoped<ITenantRoleRepository, TenantRoleRepository>();
        services.AddScoped<ITenantMembershipRepository, TenantMembershipRepository>();
        services.AddScoped<IExternalIdentityRepository, ExternalIdentityRepository>();
        services.AddScoped<IApplicationRepository, ApplicationRepository>();
        services.AddScoped<IApplicationClientRepository, ApplicationClientRepository>();
        services.AddScoped<IAuthSessionRepository, AuthSessionRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
        services.AddScoped<ITenantInviteRepository, TenantInviteRepository>();

        return services;
    }
}
