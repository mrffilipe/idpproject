using IdPPlatform.Application.Common;

namespace IdPPlatform.Application.UseCases.User.Queries.ListUserMemberships;

public sealed record ListUserMembershipsRequest : PagedRequest
{
    public required Guid UserId { get; init; }
}
