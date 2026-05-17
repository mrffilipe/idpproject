using IdPPlatform.Application.UseCases.Application.Commands.CreateApplication;
using IdPPlatform.Application.UseCases.Application.Commands.CreateApplicationClient;
using IdPPlatform.Application.UseCases.Application.Commands.ProvisionApplicationTenant;
using IdPPlatform.Application.UseCases.Auth.Commands.SubscribeTenant;
using IdPPlatform.Infrastructure.UseCases.Auth.Commands;
using IdPPlatform.Application.UseCases.Membership.Commands.CreateMembership;
using IdPPlatform.Application.UseCases.Membership.Commands.RevokeMembership;
using IdPPlatform.Application.UseCases.Membership.Commands.UpdateMembershipRole;
using IdPPlatform.Application.UseCases.Platform.Commands.BootstrapPlatform;
using IdPPlatform.Application.UseCases.Tenant.Commands.CreateTenant;
using IdPPlatform.Application.UseCases.Tenant.Commands.AcceptInvite;
using IdPPlatform.Application.UseCases.Tenant.Commands.InviteMember;
using IdPPlatform.Application.UseCases.Tenant.Commands.UpdateTenant;
using IdPPlatform.Application.UseCases.TenantRole.Commands.CreateTenantRole;
using IdPPlatform.Application.UseCases.TenantRole.Commands.UpdateTenantRole;
using IdPPlatform.Application.UseCases.User.Commands.CreateUser;
using IdPPlatform.Application.UseCases.User.Commands.LinkExternalIdentity;
using IdPPlatform.Application.UseCases.User.Commands.UpdateUser;
using IdPPlatform.Infrastructure.UseCases.Platform.Commands;
using Microsoft.Extensions.DependencyInjection;

namespace IdPPlatform.Infrastructure.Extensions;

public static class UseCaseExtensions
{
    public static IServiceCollection AddUseCases(this IServiceCollection services)
    {
        services.AddScoped<ICreateUser, CreateUser>();
        services.AddScoped<IUpdateUser, UpdateUser>();
        services.AddScoped<ILinkExternalIdentity, LinkExternalIdentity>();

        services.AddScoped<ICreateTenant, CreateTenant>();
        services.AddScoped<IUpdateTenant, UpdateTenant>();
        services.AddScoped<IInviteMember, InviteMember>();
        services.AddScoped<IAcceptInvite, AcceptInvite>();
        services.AddScoped<ICreateTenantRole, CreateTenantRole>();
        services.AddScoped<IUpdateTenantRole, UpdateTenantRole>();

        services.AddScoped<ICreateMembership, CreateMembership>();
        services.AddScoped<IUpdateMembershipRole, UpdateMembershipRole>();
        services.AddScoped<IRevokeMembership, RevokeMembership>();

        services.AddScoped<ICreateApplication, CreateApplication>();
        services.AddScoped<ICreateApplicationClient, CreateApplicationClient>();
        services.AddScoped<IProvisionApplicationTenant, ProvisionApplicationTenant>();
        services.AddScoped<ISubscribeTenant, SubscribeTenant>();
        services.AddScoped<IBootstrapPlatform, BootstrapPlatform>();

        return services;
    }
}
