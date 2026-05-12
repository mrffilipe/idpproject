using IdPPlatform.Domain.Entities;

namespace IdPPlatform.Domain.Repositories;

public interface IRefreshTokenRepository
{
    Task AddAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default);

    Task<RefreshToken?> GetByTokenHashWithSessionAndUserAsync(
        string tokenHash,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<RefreshToken>> ListActiveBySessionAsync(Guid sessionId, CancellationToken cancellationToken = default);
}
