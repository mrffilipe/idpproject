namespace IdPPlatform.Infrastructure.Configurations;

public sealed class RateLimitOptions
{
    public const string Section = "RateLimit";

    public int ExchangePermitLimit { get; init; } = 5;
    public int ExchangeWindowMinutes { get; init; } = 5;
    public int RefreshPermitLimit { get; init; } = 20;
    public int RefreshWindowMinutes { get; init; } = 5;
}
