namespace IdPPlatform.Application.Services.Auth;

public sealed record RefreshTokenRequest
{
    public required string RefreshToken { get; init; }
}
