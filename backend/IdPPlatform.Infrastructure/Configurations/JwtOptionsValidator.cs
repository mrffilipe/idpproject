using Microsoft.Extensions.Options;

namespace IdPPlatform.Infrastructure.Configurations;

public sealed class JwtOptionsValidator : IValidateOptions<JwtOptions>
{
    public ValidateOptionsResult Validate(string? name, JwtOptions options)
    {
        var errors = new List<string>();
        if (string.IsNullOrWhiteSpace(options.Issuer))
        {
            errors.Add("Jwt:Issuer is required.");
        }

        if (string.IsNullOrWhiteSpace(options.Audience))
        {
            errors.Add("Jwt:Audience is required.");
        }

        if (string.IsNullOrWhiteSpace(options.SigningKey))
        {
            errors.Add("Jwt:SigningKey is required.");
        }

        return errors.Count == 0 ? ValidateOptionsResult.Success : ValidateOptionsResult.Fail(errors);
    }
}
