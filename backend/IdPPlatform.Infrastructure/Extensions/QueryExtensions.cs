using IdPPlatform.Application.UseCases.Application.Queries.GetApplicationById;
using IdPPlatform.Application.UseCases.Application.Queries.ListApplications;
using IdPPlatform.Application.UseCases.AuditLogs.Queries.ListAuditLogs;
using IdPPlatform.Application.UseCases.Membership.Queries.ListMembershipsByTenant;
using IdPPlatform.Application.UseCases.Tenant.Queries.GetTenantById;
using IdPPlatform.Application.UseCases.Tenant.Queries.ListTenantsByUser;
using IdPPlatform.Application.UseCases.TenantRole.Queries.ListTenantRoles;
using IdPPlatform.Application.UseCases.User.Queries.GetUserByEmail;
using IdPPlatform.Application.UseCases.User.Queries.GetUserById;
using IdPPlatform.Application.UseCases.User.Queries.ListUserMemberships;
using IdPPlatform.Infrastructure.Queries.Application;
using IdPPlatform.Infrastructure.Queries.AuditLogs;
using IdPPlatform.Infrastructure.Queries.Membership;
using IdPPlatform.Infrastructure.Queries.Tenant;
using IdPPlatform.Infrastructure.Queries.TenantRole;
using IdPPlatform.Infrastructure.Queries.User;
using Microsoft.Extensions.DependencyInjection;

namespace IdPPlatform.Infrastructure.Extensions;

public static class QueryExtensions
{
    public static IServiceCollection AddQueries(this IServiceCollection services)
    {
        services.AddScoped<IGetUserById, GetUserById>();
        services.AddScoped<IGetUserByEmail, GetUserByEmail>();
        services.AddScoped<IListUserMemberships, ListUserMemberships>();

        services.AddScoped<IGetTenantById, GetTenantById>();
        services.AddScoped<IListTenantsByUser, ListTenantsByUser>();
        services.AddScoped<IListTenantRoles, ListTenantRoles>();

        services.AddScoped<IListMembershipsByTenant, ListMembershipsByTenant>();

        services.AddScoped<IGetApplicationById, GetApplicationById>();
        services.AddScoped<IListApplications, ListApplications>();
        services.AddScoped<IListAuditLogs, ListAuditLogs>();

        return services;
    }
}
