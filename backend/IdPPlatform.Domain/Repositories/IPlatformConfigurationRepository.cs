using IdPPlatform.Domain.Entities;

namespace IdPPlatform.Domain.Repositories;

public interface IPlatformConfigurationRepository
{
    Task<PlatformConfiguration?> GetForUpdateAsync(CancellationToken cancellationToken = default);
    Task AddAsync(PlatformConfiguration platformConfiguration, CancellationToken cancellationToken = default);
}
