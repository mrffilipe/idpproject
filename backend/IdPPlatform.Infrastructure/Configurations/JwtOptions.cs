using Microsoft.IdentityModel.Tokens;

namespace IdPPlatform.Infrastructure.Configurations;

public sealed class JwtOptions
{
    public const string Section = "Jwt";

    public required string Issuer { get; init; }
    public required string Audience { get; init; }
    public required string SigningKey { get; init; }
    public int AccessTokenMinutes { get; init; } = 15;
    public int RefreshTokenDays { get; init; } = 30;

    public SymmetricSecurityKey GetSigningKey()
    {
        return new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(SigningKey));
    }
}
