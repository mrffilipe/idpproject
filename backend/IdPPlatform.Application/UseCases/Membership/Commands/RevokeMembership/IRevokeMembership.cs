namespace IdPPlatform.Application.UseCases.Membership.Commands.RevokeMembership;

public interface IRevokeMembership
{
    Task ExecuteAsync(RevokeMembershipRequest request, CancellationToken cancellationToken = default);
}
