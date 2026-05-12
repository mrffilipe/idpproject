using IdPPlatform.Application.Common;

namespace IdPPlatform.Application.UseCases.Membership.Queries.ListMembershipsByTenant;

public sealed record ListMembershipsByTenantRequest : PagedRequest
{
    public required Guid TenantId { get; init; }
}
