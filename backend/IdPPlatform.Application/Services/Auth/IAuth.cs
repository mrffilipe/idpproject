namespace IdPPlatform.Application.Services.Auth;

public interface IAuth
{
    Task<AuthResult> ExchangeTokenAsync(ExchangeTokenRequest request, CancellationToken cancellationToken = default);

    Task<AuthResult> RefreshTokenAsync(RefreshTokenRequest request, CancellationToken cancellationToken = default);

    Task<AuthResult> SwitchTenantAsync(SwitchTenantRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Onboarding SaaS: cria tenant vinculado à Application da sessão OAuth atual (sem expor applicationId ao client).
    /// </summary>
    Task<AuthResult> SubscribeTenantAsync(SubscribeTenantRequest request, CancellationToken cancellationToken = default);

    Task LogoutAsync(string refreshToken, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<AuthSessionDto>> ListActiveSessionsAsync(Guid userId, CancellationToken cancellationToken = default);

    Task RevokeSessionAsync(
        Guid userId,
        Guid sessionId,
        CancellationToken cancellationToken = default);
}
