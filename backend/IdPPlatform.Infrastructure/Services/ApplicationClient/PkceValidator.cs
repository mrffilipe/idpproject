using IdPPlatform.Application.Services.ApplicationClients;
using IdPPlatform.Application.Exceptions;
using IdPPlatform.Domain.Enums;
using IdPPlatform.Domain.Exceptions;

namespace IdPPlatform.Infrastructure.Services.ApplicationClients;

public sealed class PkceValidator : IPkceValidator
{
    public void ValidateForExchange(
        ClientType clientType,
        string? codeChallenge,
        string? codeChallengeMethod)
    {
        if (clientType != ClientType.Public)
        {
            return;
        }

        if (string.IsNullOrWhiteSpace(codeChallenge))
        {
            throw new InvalidClientException(ApplicationErrorMessages.Pkce.CodeChallengeRequired);
        }

        if (codeChallenge.Length is < 43 or > 128)
        {
            throw new InvalidClientException(ApplicationErrorMessages.Pkce.CodeChallengeLength);
        }

        var normalizedMethod = string.IsNullOrWhiteSpace(codeChallengeMethod)
            ? "S256"
            : codeChallengeMethod.Trim().ToUpperInvariant();

        if (normalizedMethod is not ("S256" or "PLAIN"))
        {
            throw new InvalidClientException(ApplicationErrorMessages.Pkce.CodeChallengeMethodUnsupported);
        }
    }
}
