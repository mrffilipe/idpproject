using IdPPlatform.Domain.Entities;

namespace IdPPlatform.Domain.Repositories;

public interface IApplicationRepository
{
    Task AddAsync(Application application, CancellationToken cancellationToken = default);
}
