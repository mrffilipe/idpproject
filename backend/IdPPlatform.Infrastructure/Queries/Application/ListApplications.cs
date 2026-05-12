using IdPPlatform.Application.Common;
using IdPPlatform.Application.UseCases.Application.Dtos;
using IdPPlatform.Application.UseCases.Application.Queries.ListApplications;
using IdPPlatform.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace IdPPlatform.Infrastructure.Queries.Application;

public sealed class ListApplications : IListApplications
{
    private readonly ApplicationDbContext _context;

    public ListApplications(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<ApplicationDto>> ExecuteAsync(
        ListApplicationsRequest request,
        CancellationToken cancellationToken = default)
    {
        var page = request.Page <= 0 ? 1 : request.Page;
        var pageSize = request.PageSize <= 0 ? 20 : request.PageSize;
        var query = _context.Applications
            .AsNoTracking();
        var total = await query.CountAsync(cancellationToken);

        var skip = (page - 1) * pageSize;
        var items = await query
            .OrderBy(x => x.Name)
            .Skip(skip)
            .Take(pageSize)
            .Select(x => new ApplicationDto
            {
                Id = x.Id,
                Name = x.Name,
                Slug = x.Slug,
                Type = x.Type
            })
            .ToListAsync(cancellationToken);

        return new PagedResult<ApplicationDto>
        {
            Items = items,
            Total = total,
            Page = page,
            PageSize = pageSize
        };
    }
}
