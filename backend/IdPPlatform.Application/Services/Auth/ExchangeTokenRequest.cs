namespace IdPPlatform.Application.Services.Auth;

public sealed record ExchangeTokenRequest
{
    public required string IdentityToken { get; init; }

    public required string ClientId { get; init; }

    public string? ClientSecret { get; init; }

    public string? RedirectUri { get; init; }

    public required string[] RequestedScopes { get; init; }

    public string? CodeChallenge { get; init; }

    public string? CodeChallengeMethod { get; init; }

    public string? UserAgent { get; init; }

    public string? IpAddress { get; init; }
}
