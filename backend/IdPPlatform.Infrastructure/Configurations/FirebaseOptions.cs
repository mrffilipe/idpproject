namespace IdPPlatform.Infrastructure.Configurations;

public sealed class FirebaseOptions
{
    public const string Section = "Firebase";

    public required string ProjectId { get; init; }
}
