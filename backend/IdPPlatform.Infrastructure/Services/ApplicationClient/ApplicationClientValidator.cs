using System.Text.Json;
using IdPPlatform.Application.Exceptions;
using IdPPlatform.Application.Services.ApplicationClients;
using IdPPlatform.Domain.Entities;
using IdPPlatform.Domain.Enums;
using IdPPlatform.Domain.Exceptions;
using IdPPlatform.Domain.Repositories;

namespace IdPPlatform.Infrastructure.Services.ApplicationClients;

public sealed class ApplicationClientValidator : IApplicationClientValidator
{
    private readonly IApplicationClientRepository _clients;
    private readonly IPkceValidator _pkceValidator;

    public ApplicationClientValidator(IApplicationClientRepository clients, IPkceValidator pkceValidator)
    {
        _clients = clients;
        _pkceValidator = pkceValidator;
    }

    public async Task<ApplicationClient> ValidateAsync(
        string clientId,
        string? clientSecret,
        string? redirectUri,
        IReadOnlyCollection<string> requestedScopes,
        string? codeChallenge,
        string? codeChallengeMethod,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(clientId))
        {
            throw new InvalidClientException(ApplicationErrorMessages.OAuthClient.ClientIdRequired);
        }

        var client = await _clients.GetByClientIdAsync(clientId.Trim(), cancellationToken);
        if (client is null)
        {
            throw new InvalidClientException(ApplicationErrorMessages.OAuthClient.ClientIdInvalid);
        }

        ValidateClientSecret(client, clientSecret);
        ValidateRedirectUri(client, redirectUri);
        ValidateScopes(client, requestedScopes);
        _pkceValidator.ValidateForExchange(
            client.ClientType,
            codeChallenge,
            codeChallengeMethod);

        return client;
    }

    private static void ValidateClientSecret(ApplicationClient client, string? clientSecret)
    {
        if (client.ClientType == ClientType.Public)
        {
            return;
        }

        if (string.IsNullOrWhiteSpace(clientSecret) || string.IsNullOrWhiteSpace(client.ClientSecretHash))
        {
            throw new InvalidClientException(ApplicationErrorMessages.OAuthClient.ClientSecretRequired);
        }

        var valid = client.ClientSecretHash.StartsWith("$2", StringComparison.Ordinal)
            ? BCrypt.Net.BCrypt.Verify(clientSecret, client.ClientSecretHash)
            : string.Equals(
                clientSecret,
                client.ClientSecretHash,
                StringComparison.Ordinal);
        if (!valid)
        {
            throw new InvalidClientException(ApplicationErrorMessages.OAuthClient.ClientSecretInvalid);
        }
    }

    private static void ValidateRedirectUri(ApplicationClient client, string? redirectUri)
    {
        if (string.IsNullOrWhiteSpace(redirectUri))
        {
            return;
        }

        var allowed = DeserializeStringArray(client.RedirectUris);
        if (!allowed.Contains(redirectUri.Trim(), StringComparer.OrdinalIgnoreCase))
        {
            throw new InvalidClientException(ApplicationErrorMessages.OAuthClient.RedirectUriNotAllowed);
        }
    }

    private static void ValidateScopes(ApplicationClient client, IReadOnlyCollection<string> requestedScopes)
    {
        if (requestedScopes.Count == 0)
        {
            return;
        }

        var allowed = DeserializeStringArray(client.AllowedScopes);
        var denied = requestedScopes
            .Where(scope => !string.IsNullOrWhiteSpace(scope))
            .Select(scope => scope.Trim())
            .Where(scope => !allowed.Contains(scope, StringComparer.OrdinalIgnoreCase))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (denied.Count > 0)
        {
            throw new InvalidClientException(string.Format(
                ApplicationErrorMessages.OAuthClient.RequestedScopesNotAllowed,
                string.Join(", ", denied)));
        }
    }

    private static HashSet<string> DeserializeStringArray(string rawJson)
    {
        try
        {
            var values = JsonSerializer.Deserialize<string[]>(rawJson) ?? [];
            return values
                .Where(value => !string.IsNullOrWhiteSpace(value))
                .Select(value => value.Trim())
                .ToHashSet(StringComparer.OrdinalIgnoreCase);
        }
        catch (JsonException)
        {
            throw new InvalidClientException(ApplicationErrorMessages.OAuthClient.ConfigurationInvalid);
        }
    }
}
