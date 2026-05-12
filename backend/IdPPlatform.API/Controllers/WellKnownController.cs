using System.Text;
using IdPPlatform.Infrastructure.Configurations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace IdPPlatform.API.Controllers;

[ApiController]
[AllowAnonymous]
public sealed class WellKnownController : ControllerBase
{
    private readonly JwtOptions _jwtOptions;

    public WellKnownController(IOptions<JwtOptions> jwtOptions)
    {
        _jwtOptions = jwtOptions.Value;
    }

    [HttpGet("/.well-known/jwks.json")]
    public IActionResult Jwks()
    {
        var key = Base64UrlEncode(Encoding.UTF8.GetBytes(_jwtOptions.SigningKey));
        return Ok(new
        {
            keys = new[]
            {
                new
                {
                    kty = "oct",
                    alg = "HS256",
                    use = "sig",
                    kid = "idpplatform-hs256",
                    k = key
                }
            }
        });
    }

    private static string Base64UrlEncode(byte[] data)
    {
        return Convert.ToBase64String(data).Replace('+', '-').Replace('/', '_').TrimEnd('=');
    }
}
