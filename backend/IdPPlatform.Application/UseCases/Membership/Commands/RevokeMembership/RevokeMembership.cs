using IdPPlatform.Application.Services.UnitOfWork;
using IdPPlatform.Domain.Exceptions;
using IdPPlatform.Domain.Repositories;

namespace IdPPlatform.Application.UseCases.Membership.Commands.RevokeMembership;

public sealed class RevokeMembership : IRevokeMembership
{
    private readonly ITenantMembershipRepository _memberships;
    private readonly IUnitOfWork _unitOfWork;

    public RevokeMembership(ITenantMembershipRepository memberships, IUnitOfWork unitOfWork)
    {
        _memberships = memberships;
        _unitOfWork = unitOfWork;
    }

    public async Task ExecuteAsync(RevokeMembershipRequest request, CancellationToken cancellationToken = default)
    {
        var membership = await _memberships.GetForUpdateWithRolesAsync(request.MembershipId, cancellationToken)
            ?? throw new DomainNotFoundException(DomainErrorMessages.TenantMembership.MembershipNotFound);

        membership.Revoke();
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
