namespace IdPPlatform.Application.UseCases.Tenant.Commands.CreateTenant;

public sealed record CreateTenantRequest
{
    public required string Name { get; init; }

    public required string Key { get; init; }

    public required Guid ActorUserId { get; init; }

    public Guid? InitialAdministratorUserId { get; init; }
}
