using IdPPlatform.Application.Services.TenantRoles;
using IdPPlatform.Application.Services.UnitOfWork;
using IdPPlatform.Domain.Exceptions;
using IdPPlatform.Domain.Repositories;

namespace IdPPlatform.Application.UseCases.Membership.Commands.UpdateMembershipRole;

public sealed class UpdateMembershipRole : IUpdateMembershipRole
{
    private readonly ITenantMembershipRepository _memberships;
    private readonly ITenantRoleResolver _roleResolver;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateMembershipRole(
        ITenantMembershipRepository memberships,
        ITenantRoleResolver roleResolver,
        IUnitOfWork unitOfWork)
    {
        _memberships = memberships;
        _roleResolver = roleResolver;
        _unitOfWork = unitOfWork;
    }

    public async Task ExecuteAsync(UpdateMembershipRoleRequest request, CancellationToken cancellationToken = default)
    {
        var membership = await _memberships.GetForUpdateWithRolesAsync(request.MembershipId, cancellationToken)
            ?? throw new DomainNotFoundException(DomainErrorMessages.TenantMembership.MembershipNotFound);

        var roles = await _roleResolver.ResolveActiveRolesAsync(
            membership.TenantId,
            request.Roles,
            cancellationToken);
        membership.ReplaceRoles(roles);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
