using IdPPlatform.Application.Common;
using IdPPlatform.Application.UseCases.Application.Dtos;

namespace IdPPlatform.Application.UseCases.Application.Queries.ListApplications;

public interface IListApplications
{
    Task<PagedResult<ApplicationDto>> ExecuteAsync(ListApplicationsRequest request, CancellationToken cancellationToken = default);
}
