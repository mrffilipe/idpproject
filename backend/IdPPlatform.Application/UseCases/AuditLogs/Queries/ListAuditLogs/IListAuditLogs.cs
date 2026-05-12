using IdPPlatform.Application.Common;
using IdPPlatform.Application.UseCases.AuditLogs.Dtos;

namespace IdPPlatform.Application.UseCases.AuditLogs.Queries.ListAuditLogs;

public interface IListAuditLogs
{
    Task<PagedResult<AuditLogItemDto>> ExecuteAsync(ListAuditLogsRequest request, CancellationToken cancellationToken = default);
}
