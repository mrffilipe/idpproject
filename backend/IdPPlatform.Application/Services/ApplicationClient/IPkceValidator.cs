using IdPPlatform.Domain.Enums;

namespace IdPPlatform.Application.Services.ApplicationClients;

public interface IPkceValidator
{
    void ValidateForExchange(
        ClientType clientType,
        string? codeChallenge,
        string? codeChallengeMethod);
}
