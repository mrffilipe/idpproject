using IdPPlatform.Domain.Repositories;
using AppEntity = IdPPlatform.Domain.Entities.Application;

namespace IdPPlatform.Infrastructure.Persistence.Repositories;

public sealed class ApplicationRepository : IApplicationRepository
{
    private readonly ApplicationDbContext _context;

    public ApplicationRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public Task AddAsync(AppEntity application, CancellationToken cancellationToken = default)
    {
        return _context.Applications
            .AddAsync(application, cancellationToken)
            .AsTask();
    }
}
