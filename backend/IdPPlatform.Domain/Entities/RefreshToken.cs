using IdPPlatform.Domain.Common;
using IdPPlatform.Domain.Exceptions;

namespace IdPPlatform.Domain.Entities;

public class RefreshToken : BaseEntity
{
    public Guid SessionId { get; private set; }
    public AuthSession Session { get; private set; } = null!;

    public string TokenHash { get; private set; } = string.Empty;
    public DateTime ExpiresAt { get; private set; }
    public DateTime? RevokedAt { get; private set; }
    public bool IsRevoked => RevokedAt.HasValue;

    private RefreshToken()
    {
    }

    public RefreshToken(
        Guid sessionId,
        string tokenHash,
        DateTime expiresAt)
    {
        if (sessionId == Guid.Empty || string.IsNullOrWhiteSpace(tokenHash))
        {
            throw new DomainValidationException(DomainErrorMessages.RefreshToken.DataInvalid);
        }

        SessionId = sessionId;
        TokenHash = tokenHash.Trim();
        ExpiresAt = expiresAt;
    }

    public void Revoke()
    {
        if (IsRevoked)
        {
            return;
        }

        RevokedAt = DateTime.UtcNow;
    }
}
