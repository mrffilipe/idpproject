using IdPPlatform.Application.Services.TenantRoles;
using IdPPlatform.Application.Services.UnitOfWork;
using IdPPlatform.Domain.Entities;
using IdPPlatform.Domain.Exceptions;
using IdPPlatform.Domain.Repositories;

namespace IdPPlatform.Application.UseCases.Membership.Commands.CreateMembership;

public sealed class CreateMembership : ICreateMembership
{
    private readonly ITenantMembershipRepository _memberships;
    private readonly ITenantRoleResolver _roleResolver;
    private readonly IUnitOfWork _unitOfWork;

    public CreateMembership(
        ITenantMembershipRepository memberships,
        ITenantRoleResolver roleResolver,
        IUnitOfWork unitOfWork)
    {
        _memberships = memberships;
        _roleResolver = roleResolver;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> ExecuteAsync(CreateMembershipRequest request, CancellationToken cancellationToken = default)
    {
        var existing = await _memberships.GetByUserIdAndTenantIdWithRolesAsync(
            request.UserId,
            request.TenantId,
            cancellationToken);
        if (existing is not null && existing.IsActive)
        {
            throw new DomainBusinessRuleException(DomainErrorMessages.TenantMembership.MembershipAlreadyExists);
        }

        var roles = await _roleResolver.ResolveActiveRolesAsync(
            request.TenantId,
            request.Roles,
            cancellationToken);
        var membership = new TenantMembership(
            request.TenantId,
            request.UserId,
            roles);
        await _memberships.AddAsync(membership, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return membership.Id;
    }
}
