namespace IdPPlatform.Application.UseCases.Application.Queries.GetApplicationById;

public sealed record GetApplicationByIdRequest
{
    public required Guid ApplicationId { get; init; }
}
