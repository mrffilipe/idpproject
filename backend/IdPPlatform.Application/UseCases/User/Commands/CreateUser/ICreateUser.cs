namespace IdPPlatform.Application.UseCases.User.Commands.CreateUser;

public interface ICreateUser
{
    Task<Guid> ExecuteAsync(CreateUserRequest request, CancellationToken cancellationToken = default);
}
