using IdPPlatform.API.Common;
using IdPPlatform.Application.Services.Auth;
using IdPPlatform.Application.Services.UserScope;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace IdPPlatform.API.Controllers;

[Route("v{version:apiVersion}/auth")]
public sealed class AuthController : V1ApiControllerBase
{
    private readonly IAuth _auth;
    private readonly IUserScope _userScope;

    public AuthController(IAuth auth, IUserScope userScope)
    {
        _auth = auth;
        _userScope = userScope;
    }

    [HttpPost("exchange")]
    [AllowAnonymous]
    [EnableRateLimiting("auth_exchange")]
    public async Task<IActionResult> ExchangeToken([FromBody] ExchangeTokenBody body, CancellationToken cancellationToken)
    {
        var request = new ExchangeTokenRequest
        {
            IdentityToken = body.IdentityToken,
            ClientId = body.ClientId,
            ClientSecret = body.ClientSecret,
            RedirectUri = body.RedirectUri,
            RequestedScopes = body.RequestedScopes ?? [],
            CodeChallenge = body.CodeChallenge,
            CodeChallengeMethod = body.CodeChallengeMethod,
            UserAgent = Request.Headers.UserAgent.ToString(),
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString()
        };
        var result = await _auth.ExchangeTokenAsync(request, cancellationToken);
        return Ok(result);
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    [EnableRateLimiting("auth_refresh")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenBody body, CancellationToken cancellationToken)
    {
        var result = await _auth.RefreshTokenAsync(
            new RefreshTokenRequest
            {
                RefreshToken = body.RefreshToken
            },
            cancellationToken);
        return Ok(result);
    }

    [Authorize]
    [HttpPost("subscribe")]
    public async Task<IActionResult> SubscribeTenant([FromBody] SubscribeTenantBody body, CancellationToken cancellationToken)
    {
        var result = await _auth.SubscribeTenantAsync(
            new SubscribeTenantRequest
            {
                TenantName = body.TenantName,
                TenantKey = body.TenantKey,
                PlanCode = body.PlanCode,
                ExternalCustomerId = body.ExternalCustomerId,
            },
            cancellationToken);
        return Ok(result);
    }

    [Authorize]
    [HttpPost("switch-tenant")]
    public async Task<IActionResult> SwitchTenant([FromBody] SwitchTenantBody body, CancellationToken cancellationToken)
    {
        var result = await _auth.SwitchTenantAsync(
            new SwitchTenantRequest
            {
                TenantId = body.TenantId,
                RefreshToken = body.RefreshToken
            },
            cancellationToken);
        return Ok(result);
    }

    [Authorize]
    [HttpGet("sessions")]
    public async Task<IActionResult> ListActiveSessions(CancellationToken cancellationToken)
    {
        var result = await _auth.ListActiveSessionsAsync(_userScope.UserId, cancellationToken);
        return Ok(result);
    }

    [Authorize]
    [HttpDelete("sessions/{sessionId:guid}")]
    public async Task<IActionResult> RevokeSession(Guid sessionId, CancellationToken cancellationToken)
    {
        await _auth.RevokeSessionAsync(
            _userScope.UserId,
            sessionId,
            cancellationToken);
        return NoContent();
    }

    [HttpPost("logout")]
    [AllowAnonymous]
    public async Task<IActionResult> Logout([FromBody] RefreshTokenBody body, CancellationToken cancellationToken)
    {
        await _auth.LogoutAsync(body.RefreshToken, cancellationToken);
        return NoContent();
    }

    public sealed record ExchangeTokenBody(
        string IdentityToken,
        string ClientId,
        string? ClientSecret,
        string? RedirectUri,
        string[]? RequestedScopes,
        string? CodeChallenge,
        string? CodeChallengeMethod);
    public sealed record RefreshTokenBody(string RefreshToken);
    public sealed record SubscribeTenantBody(
        string TenantName,
        string TenantKey,
        string? PlanCode,
        string? ExternalCustomerId);
    public sealed record SwitchTenantBody(Guid TenantId, string? RefreshToken);
}
