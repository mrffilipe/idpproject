namespace IdPPlatform.Application.UseCases.Membership.Commands.UpdateMembershipRole;

public interface IUpdateMembershipRole
{
    Task ExecuteAsync(UpdateMembershipRoleRequest request, CancellationToken cancellationToken = default);
}
