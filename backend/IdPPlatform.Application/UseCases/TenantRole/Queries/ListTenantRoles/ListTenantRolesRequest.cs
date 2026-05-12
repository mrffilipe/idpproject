using IdPPlatform.Application.Common;

namespace IdPPlatform.Application.UseCases.TenantRole.Queries.ListTenantRoles;

public sealed record ListTenantRolesRequest : PagedRequest
{
    public required Guid TenantId { get; init; }

    public bool IncludeInactive { get; init; }
}
