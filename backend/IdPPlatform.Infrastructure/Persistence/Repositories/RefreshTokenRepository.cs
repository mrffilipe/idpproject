using IdPPlatform.Domain.Entities;
using IdPPlatform.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace IdPPlatform.Infrastructure.Persistence.Repositories;

public sealed class RefreshTokenRepository : IRefreshTokenRepository
{
    private readonly ApplicationDbContext _context;

    public RefreshTokenRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public Task AddAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default)
    {
        return _context.RefreshTokens
            .AddAsync(refreshToken, cancellationToken)
            .AsTask();
    }

    public Task<RefreshToken?> GetByTokenHashWithSessionAndUserAsync(
        string tokenHash,
        CancellationToken cancellationToken = default)
    {
        return _context.RefreshTokens
            .Include(x => x.Session)
            .ThenInclude(s => s.User)
            .FirstOrDefaultAsync(x => x.TokenHash == tokenHash, cancellationToken);
    }

    public async Task<IReadOnlyList<RefreshToken>> ListActiveBySessionAsync(Guid sessionId, CancellationToken cancellationToken = default)
    {
        return await _context.RefreshTokens
            .Where(x => x.SessionId == sessionId && !x.IsRevoked && x.ExpiresAt > DateTime.UtcNow)
            .ToListAsync(cancellationToken);
    }
}
