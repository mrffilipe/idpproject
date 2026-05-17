using IdPPlatform.API.Common;
using IdPPlatform.Application.UseCases.Platform.Commands.BootstrapPlatform;
using IdPPlatform.Application.UseCases.Platform.Queries.GetPlatformStatus;
using IdPPlatform.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace IdPPlatform.API.Controllers;

[Route("v{version:apiVersion}/platform")]
public sealed class PlatformController : V1ApiControllerBase
{
    private readonly IGetPlatformStatus _getPlatformStatus;
    private readonly IBootstrapPlatform _bootstrapPlatform;

    public PlatformController(
        IGetPlatformStatus getPlatformStatus,
        IBootstrapPlatform bootstrapPlatform)
    {
        _getPlatformStatus = getPlatformStatus;
        _bootstrapPlatform = bootstrapPlatform;
    }

    [HttpGet("status")]
    [AllowAnonymous]
    public async Task<IActionResult> GetStatus(CancellationToken cancellationToken)
    {
        var result = await _getPlatformStatus.ExecuteAsync(cancellationToken);
        return Ok(result);
    }

    [HttpPost("bootstrap")]
    [AllowAnonymous]
    [EnableRateLimiting("platform_bootstrap")]
    public async Task<IActionResult> Bootstrap(
        [FromBody] BootstrapPlatformBody body,
        CancellationToken cancellationToken)
    {
        var result = await _bootstrapPlatform.ExecuteAsync(
            new BootstrapPlatformRequest
            {
                IdentityToken = body.IdentityToken,
                TenantName = body.TenantName,
                TenantKey = body.TenantKey,
                ApplicationName = body.ApplicationName,
                ApplicationSlug = body.ApplicationSlug,
                ApplicationType = body.ApplicationType,
                ClientId = body.ClientId,
                ClientType = body.ClientType,
                ClientSecret = body.ClientSecret,
                RedirectUris = body.RedirectUris ?? [],
                AllowedScopes = body.AllowedScopes ?? [],
                AccessTokenTtlSeconds = body.AccessTokenTtlSeconds,
                UserAgent = Request.Headers.UserAgent.ToString(),
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString()
            },
            cancellationToken);

        return Ok(result);
    }

    public sealed record BootstrapPlatformBody(
        string IdentityToken,
        string TenantName,
        string TenantKey,
        string ApplicationName,
        string ApplicationSlug,
        ApplicationType ApplicationType,
        string ClientId,
        ClientType ClientType,
        string? ClientSecret,
        string[]? RedirectUris,
        string[]? AllowedScopes,
        int AccessTokenTtlSeconds);
}
