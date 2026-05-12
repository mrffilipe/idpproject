using IdPPlatform.Application.Common;
using IdPPlatform.Application.UseCases.User.Dtos;

namespace IdPPlatform.Application.UseCases.User.Queries.ListUserMemberships;

public interface IListUserMemberships
{
    Task<PagedResult<UserMembershipDto>> ExecuteAsync(ListUserMembershipsRequest request, CancellationToken cancellationToken = default);
}
