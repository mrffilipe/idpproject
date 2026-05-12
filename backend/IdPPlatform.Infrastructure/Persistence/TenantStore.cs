using Microsoft.EntityFrameworkCore;
using TenancyKit.Abstractions;

namespace IdPPlatform.Infrastructure.Persistence;

public sealed class TenantStore : ITenantStore<TenantInfoAdapter>
{
    private readonly ApplicationDbContext _context;

    public TenantStore(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<TenantInfoAdapter>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var tenants = await _context.Tenants
            .AsNoTracking()
            .Where(x => x.IsActive)
            .ToListAsync(cancellationToken);
        return tenants.Select(x => new TenantInfoAdapter(x)).ToList();
    }

    public async Task<TenantInfoAdapter?> GetByIdentifierAsync(string identifier, CancellationToken cancellationToken = default)
    {
        var normalized = identifier.Trim().ToLowerInvariant();
        var tenant = await _context.Tenants
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Key == normalized && x.IsActive, cancellationToken);

        return tenant is null ? null : new TenantInfoAdapter(tenant);
    }
}
