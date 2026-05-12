namespace IdPPlatform.Application.UseCases.User.Commands.UpdateUser;

public interface IUpdateUser
{
    Task ExecuteAsync(UpdateUserRequest request, CancellationToken cancellationToken = default);
}
