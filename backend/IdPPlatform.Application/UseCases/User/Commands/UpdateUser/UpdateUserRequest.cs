namespace IdPPlatform.Application.UseCases.User.Commands.UpdateUser;

public sealed record UpdateUserRequest
{
    public required Guid UserId { get; init; }

    public required string DisplayName { get; init; }

    public string? PhotoUrl { get; init; }
}
