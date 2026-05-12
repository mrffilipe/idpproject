namespace IdPPlatform.Application.UseCases.TenantRole.Commands.CreateTenantRole;

public sealed record CreateTenantRoleRequest
{
    public required Guid TenantId { get; init; }

    public required string Key { get; init; }

    public required string Name { get; init; }

    public string? Description { get; init; }
}
