using IdPPlatform.API.Common;
using IdPPlatform.Application.Services.UserScope;
using IdPPlatform.Application.UseCases.Tenant.Commands.CreateTenant;
using IdPPlatform.Application.UseCases.Tenant.Commands.AcceptInvite;
using IdPPlatform.Application.UseCases.Tenant.Commands.InviteMember;
using IdPPlatform.Application.UseCases.Tenant.Commands.UpdateTenant;
using IdPPlatform.Application.UseCases.Tenant.Queries.GetTenantById;
using IdPPlatform.Application.UseCases.Tenant.Queries.ListTenantsByUser;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IdPPlatform.API.Controllers;

[Authorize]
public sealed class TenantsController : V1ApiControllerBase
{
    private readonly IUserScope _userScope;
    private readonly ICreateTenant _createTenant;
    private readonly IUpdateTenant _updateTenant;
    private readonly IInviteMember _inviteMember;
    private readonly IAcceptInvite _acceptInvite;
    private readonly IGetTenantById _getTenantById;
    private readonly IListTenantsByUser _listTenantsByUser;

    public TenantsController(
        IUserScope userScope,
        ICreateTenant createTenant,
        IUpdateTenant updateTenant,
        IInviteMember inviteMember,
        IAcceptInvite acceptInvite,
        IGetTenantById getTenantById,
        IListTenantsByUser listTenantsByUser)
    {
        _userScope = userScope;
        _createTenant = createTenant;
        _updateTenant = updateTenant;
        _inviteMember = inviteMember;
        _acceptInvite = acceptInvite;
        _getTenantById = getTenantById;
        _listTenantsByUser = listTenantsByUser;
    }

    [HttpPost]
    public async Task<IActionResult> CreateTenant([FromBody] CreateTenantBody body, CancellationToken cancellationToken)
    {
        var id = await _createTenant.ExecuteAsync(
            new CreateTenantRequest
            {
                Name = body.Name,
                Key = body.Key
            },
            cancellationToken);

        return CreatedAtAction(nameof(GetTenantById), new { id, version = "1.0" }, new { id });
    }

    [HttpGet]
    public async Task<IActionResult> ListTenantsByUser(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await _listTenantsByUser.ExecuteAsync(
            new ListTenantsByUserRequest
            {
                UserId = _userScope.UserId,
                Page = page,
                PageSize = pageSize
            },
            cancellationToken);

        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetTenantById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _getTenantById.ExecuteAsync(
            new GetTenantByIdRequest
            {
                TenantId = id
            },
            cancellationToken);

        return result is null ? NotFound() : Ok(result);
    }

    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> UpdateTenant(
        Guid id,
        [FromBody] UpdateTenantBody body,
        CancellationToken cancellationToken)
    {
        await _updateTenant.ExecuteAsync(
            new UpdateTenantRequest
            {
                TenantId = id,
                Name = body.Name
            },
            cancellationToken);

        return NoContent();
    }

    [HttpPost("{id:guid}/invites")]
    public async Task<IActionResult> InviteMember(
        Guid id,
        [FromBody] InviteMemberBody body,
        CancellationToken cancellationToken)
    {
        var inviteId = await _inviteMember.ExecuteAsync(
            new InviteMemberRequest
            {
                TenantId = id,
                Email = body.Email,
                Roles = body.Roles,
                InvitedByUserId = _userScope.UserId
            },
            cancellationToken);

        return Ok(new { id = inviteId });
    }

    [AllowAnonymous]
    [HttpPost("/v{version:apiVersion}/invites/accept")]
    public async Task<IActionResult> AcceptInvite([FromBody] AcceptInviteBody body, CancellationToken cancellationToken)
    {
        var membershipId = await _acceptInvite.ExecuteAsync(
            new AcceptInviteRequest
            {
                InviteToken = body.Token,
                IdentityToken = body.IdentityToken
            },
            cancellationToken);

        return Ok(new { membershipId });
    }

    public sealed record CreateTenantBody(string Name, string Key);
    public sealed record UpdateTenantBody(string Name);
    public sealed record InviteMemberBody(string Email, IReadOnlyCollection<string> Roles);
    public sealed record AcceptInviteBody(string Token, string IdentityToken);
}
