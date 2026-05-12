namespace IdPPlatform.Application.Services.TokenIssuer;

public interface ITokenIssuer
{
    string Issue(TokenClaims claims);
}
