using IdPPlatform.Application.UseCases.Tenant.Dtos;
using IdPPlatform.Application.UseCases.Tenant.Queries.GetTenantById;
using IdPPlatform.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace IdPPlatform.Infrastructure.Queries.Tenant;

public sealed class GetTenantById : IGetTenantById
{
    private readonly ApplicationDbContext _context;

    public GetTenantById(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<TenantDto?> ExecuteAsync(GetTenantByIdRequest request, CancellationToken cancellationToken = default)
    {
        return await _context.Tenants
            .AsNoTracking()
            .Where(x => x.Id == request.TenantId)
            .Select(x => new TenantDto
            {
                Id = x.Id,
                Name = x.Name,
                Key = x.Key
            })
            .FirstOrDefaultAsync(cancellationToken);
    }
}
