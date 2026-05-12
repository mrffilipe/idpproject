using IdPPlatform.Application.Services.UnitOfWork;
using IdPPlatform.Infrastructure.Persistence;

namespace IdPPlatform.Infrastructure.Services.UnitOfWork;

public sealed class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}
