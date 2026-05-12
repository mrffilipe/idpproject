namespace IdPPlatform.Application.UseCases.Tenant.Queries.GetTenantById;

public sealed record GetTenantByIdRequest
{
    public required Guid TenantId { get; init; }
}
