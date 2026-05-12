namespace IdPPlatform.Application.UseCases.User.Queries.GetUserById;

public sealed record GetUserByIdRequest
{
    public required Guid UserId { get; init; }
}
