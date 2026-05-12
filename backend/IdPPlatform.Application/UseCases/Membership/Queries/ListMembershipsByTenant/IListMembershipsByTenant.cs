using IdPPlatform.Application.Common;
using IdPPlatform.Application.UseCases.Membership.Dtos;

namespace IdPPlatform.Application.UseCases.Membership.Queries.ListMembershipsByTenant;

public interface IListMembershipsByTenant
{
    Task<PagedResult<MembershipDto>> ExecuteAsync(ListMembershipsByTenantRequest request, CancellationToken cancellationToken = default);
}
