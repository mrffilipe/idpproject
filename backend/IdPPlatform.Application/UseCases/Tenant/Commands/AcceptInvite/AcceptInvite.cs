using IdPPlatform.Application.Services.ExternalIdentityProvider;
using IdPPlatform.Application.Services.RefreshTokenHasher;
using IdPPlatform.Application.Services.UnitOfWork;
using IdPPlatform.Domain.Entities;
using IdPPlatform.Domain.Exceptions;
using IdPPlatform.Domain.Repositories;
using IdPPlatform.Domain.ValueObjects;

namespace IdPPlatform.Application.UseCases.Tenant.Commands.AcceptInvite;

public sealed class AcceptInvite : IAcceptInvite
{
    private readonly IExternalIdentityProvider _externalIdentityProvider;
    private readonly IRefreshTokenHasher _hasher;
    private readonly ITenantInviteRepository _invites;
    private readonly IUserRepository _users;
    private readonly ITenantMembershipRepository _memberships;
    private readonly IUnitOfWork _unitOfWork;

    public AcceptInvite(
        IExternalIdentityProvider externalIdentityProvider,
        IRefreshTokenHasher hasher,
        ITenantInviteRepository invites,
        IUserRepository users,
        ITenantMembershipRepository memberships,
        IUnitOfWork unitOfWork)
    {
        _externalIdentityProvider = externalIdentityProvider;
        _hasher = hasher;
        _invites = invites;
        _users = users;
        _memberships = memberships;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> ExecuteAsync(AcceptInviteRequest request, CancellationToken cancellationToken = default)
    {
        var tokenHash = _hasher.Hash(request.InviteToken);
        var invite = await _invites.GetByTokenHashWithRolesAsync(tokenHash, cancellationToken)
            ?? throw new DomainNotFoundException(DomainErrorMessages.TenantInvite.InviteNotFound);

        if (invite.IsConsumed())
        {
            throw new DomainBusinessRuleException(DomainErrorMessages.TenantInvite.AlreadyConsumed);
        }

        if (invite.IsExpired())
        {
            throw new DomainBusinessRuleException(DomainErrorMessages.TenantInvite.Expired);
        }

        var externalIdentity = await _externalIdentityProvider.ValidateAsync(request.IdentityToken, cancellationToken);
        if (!string.Equals(
            externalIdentity.Email,
            invite.Email.Value,
            StringComparison.OrdinalIgnoreCase))
        {
            throw new DomainBusinessRuleException(DomainErrorMessages.TenantInvite.EmailMismatch);
        }

        var user = await _users.GetByEmailAsync(externalIdentity.Email, cancellationToken);
        if (user is null)
        {
            user = new IdPPlatform.Domain.Entities.User(
                new EmailAddress(externalIdentity.Email),
                externalIdentity.Email.Split('@')[0]);
            await _users.AddAsync(user, cancellationToken);
        }

        var membership = await _memberships.GetByUserIdAndTenantIdWithRolesAsync(
            user.Id,
            invite.TenantId,
            cancellationToken);
        if (membership is null || !membership.IsActive)
        {
            membership = new TenantMembership(
                invite.TenantId,
                user.Id,
                invite.Roles.Select(x => x.Role));
            await _memberships.AddAsync(membership, cancellationToken);
        }
        else
        {
            membership.MergeRoles(invite.Roles.Select(x => x.Role));
        }

        invite.Consume();
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return membership.Id;
    }
}
