namespace IdPPlatform.Application.UseCases.Membership.Commands.CreateMembership;

public interface ICreateMembership
{
    Task<Guid> ExecuteAsync(CreateMembershipRequest request, CancellationToken cancellationToken = default);
}
