using IdPPlatform.Application.UseCases.Application.Dtos;
using IdPPlatform.Application.UseCases.Application.Queries.GetApplicationById;
using IdPPlatform.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace IdPPlatform.Infrastructure.Queries.Application;

public sealed class GetApplicationById : IGetApplicationById
{
    private readonly ApplicationDbContext _context;

    public GetApplicationById(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ApplicationDto?> ExecuteAsync(
        GetApplicationByIdRequest request,
        CancellationToken cancellationToken = default)
    {
        return await _context.Applications
            .AsNoTracking()
            .Where(x => x.Id == request.ApplicationId)
            .Select(x => new ApplicationDto
            {
                Id = x.Id,
                Name = x.Name,
                Slug = x.Slug,
                Type = x.Type
            })
            .FirstOrDefaultAsync(cancellationToken);
    }
}
