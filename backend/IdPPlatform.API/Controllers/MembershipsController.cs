using IdPPlatform.API.Common;
using IdPPlatform.Application.UseCases.Membership.Commands.CreateMembership;
using IdPPlatform.Application.UseCases.Membership.Commands.RevokeMembership;
using IdPPlatform.Application.UseCases.Membership.Commands.UpdateMembershipRole;
using IdPPlatform.Application.UseCases.Membership.Queries.ListMembershipsByTenant;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IdPPlatform.API.Controllers;

[Authorize]
public sealed class MembershipsController : V1ApiControllerBase
{
    private readonly ICreateMembership _createMembership;
    private readonly IUpdateMembershipRole _updateMembershipRole;
    private readonly IRevokeMembership _revokeMembership;
    private readonly IListMembershipsByTenant _listMembershipsByTenant;

    public MembershipsController(
        ICreateMembership createMembership,
        IUpdateMembershipRole updateMembershipRole,
        IRevokeMembership revokeMembership,
        IListMembershipsByTenant listMembershipsByTenant)
    {
        _createMembership = createMembership;
        _updateMembershipRole = updateMembershipRole;
        _revokeMembership = revokeMembership;
        _listMembershipsByTenant = listMembershipsByTenant;
    }

    [HttpPost("/v{version:apiVersion}/tenants/{tenantId:guid}/memberships")]
    public async Task<IActionResult> CreateMembership(
        Guid tenantId,
        [FromBody] CreateMembershipBody body,
        CancellationToken cancellationToken)
    {
        var id = await _createMembership.ExecuteAsync(
            new CreateMembershipRequest
            {
                UserId = body.UserId,
                TenantId = tenantId,
                Roles = body.Roles
            },
            cancellationToken);

        return Ok(new { id });
    }

    [HttpGet("/v{version:apiVersion}/tenants/{tenantId:guid}/memberships")]
    public async Task<IActionResult> ListMembershipsByTenant(
        Guid tenantId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await _listMembershipsByTenant.ExecuteAsync(
            new ListMembershipsByTenantRequest
            {
                TenantId = tenantId,
                Page = page,
                PageSize = pageSize
            },
            cancellationToken);

        return Ok(result);
    }

    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> UpdateMembershipRole(
        Guid id,
        [FromBody] UpdateMembershipRoleBody body,
        CancellationToken cancellationToken)
    {
        await _updateMembershipRole.ExecuteAsync(
            new UpdateMembershipRoleRequest
            {
                MembershipId = id,
                Roles = body.Roles
            },
            cancellationToken);

        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> RevokeMembership(Guid id, CancellationToken cancellationToken)
    {
        await _revokeMembership.ExecuteAsync(
            new RevokeMembershipRequest
            {
                MembershipId = id
            },
            cancellationToken);

        return NoContent();
    }

    public sealed record CreateMembershipBody(Guid UserId, IReadOnlyCollection<string> Roles);
    public sealed record UpdateMembershipRoleBody(IReadOnlyCollection<string> Roles);
}
