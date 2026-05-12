using IdPPlatform.Domain.Entities;

namespace IdPPlatform.Application.Services.ApplicationClients;

public interface IApplicationClientValidator
{
    Task<ApplicationClient> ValidateAsync(
        string clientId,
        string? clientSecret,
        string? redirectUri,
        IReadOnlyCollection<string> requestedScopes,
        string? codeChallenge,
        string? codeChallengeMethod,
        CancellationToken cancellationToken = default);
}
