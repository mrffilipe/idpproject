namespace IdPPlatform.Application.UseCases.Tenant.Commands.UpdateTenant;

public sealed record UpdateTenantRequest
{
    public required Guid TenantId { get; init; }

    public required string Name { get; init; }
}
