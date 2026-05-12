using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using IdPPlatform.Application.Services.TokenIssuer;
using IdPPlatform.Infrastructure.Configurations;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace IdPPlatform.Infrastructure.Services.TokenIssuer;

public sealed class TokenIssuer : ITokenIssuer
{
    private readonly JwtOptions _options;

    public TokenIssuer(IOptions<JwtOptions> options)
    {
        _options = options.Value;
    }

    public string Issue(TokenClaims claims)
    {
        var descriptor = new SecurityTokenDescriptor
        {
            Issuer = _options.Issuer,
            Audience = _options.Audience,
            Expires = DateTime.UtcNow.AddMinutes(_options.AccessTokenMinutes),
            SigningCredentials = new SigningCredentials(_options.GetSigningKey(), SecurityAlgorithms.HmacSha256),
            Subject = new ClaimsIdentity(BuildClaims(claims))
        };

        var handler = new JwtSecurityTokenHandler();
        var token = handler.CreateToken(descriptor);
        return handler.WriteToken(token);
    }

    private static IEnumerable<Claim> BuildClaims(TokenClaims claims)
    {
        yield return new Claim("sub", claims.UserId.ToString("D"));
        yield return new Claim("uid", claims.UserId.ToString("D"));
        yield return new Claim("sid", claims.SessionId.ToString("D"));
        yield return new Claim("email", claims.Email);

        if (claims.TenantId.HasValue)
        {
            yield return new Claim("tid", claims.TenantId.Value.ToString("D"));
        }

        if (claims.MembershipId.HasValue)
        {
            yield return new Claim("mid", claims.MembershipId.Value.ToString("D"));
        }

        foreach (var role in claims.TenantRoles.Select(x => x.Trim().ToLowerInvariant()).Where(x => x.Length > 0).Distinct())
        {
            yield return new Claim("trole", role);
            yield return new Claim(ClaimTypes.Role, role);
        }

        foreach (var method in claims.Amr)
        {
            yield return new Claim("amr", method);
        }
    }
}
