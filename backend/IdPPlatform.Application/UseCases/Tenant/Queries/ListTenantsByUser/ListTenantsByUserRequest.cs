using IdPPlatform.Application.Common;

namespace IdPPlatform.Application.UseCases.Tenant.Queries.ListTenantsByUser;

public sealed record ListTenantsByUserRequest : PagedRequest
{
    public required Guid UserId { get; init; }
}
