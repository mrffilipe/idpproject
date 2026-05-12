namespace IdPPlatform.Application.Exceptions;

public static class ApplicationErrorMessages
{
    public static class ExternalIdentity
    {
        public const string InvalidToken = "Invalid external identity token.";
        public const string EmailMissing = "External identity token does not include email.";
    }

    public static class OAuthClient
    {
        public const string ClientIdRequired = "client_id is required.";
        public const string ClientIdInvalid = "client_id is invalid.";
        public const string ClientSecretRequired = "client_secret is required for confidential clients.";
        public const string ClientSecretInvalid = "client_secret is invalid.";
        public const string RedirectUriNotAllowed = "redirect_uri is not allowed for this client.";
        public const string ConfigurationInvalid = "Client configuration is invalid.";
        public const string RequestedScopesNotAllowed = "Requested scopes are not allowed: {0}.";
    }

    public static class Pkce
    {
        public const string CodeChallengeRequired = "Public clients must send code_challenge.";
        public const string CodeChallengeLength = "code_challenge must be between 43 and 128 characters.";
        public const string CodeChallengeMethodUnsupported = "Unsupported code_challenge_method.";
    }

    public static class Auth
    {
        public const string UserHasNoClientTenantMembership = "User has no active membership for this client tenant.";
        public const string InvalidRefreshToken = "Invalid refresh token.";
        public const string RefreshTokenExpiredOrRevoked = "Refresh token expired or revoked.";
        public const string SessionInactive = "Session is not active.";
        public const string AuthenticatedSessionRequired = "Authenticated session is required.";
        public const string UserHasNoTenantAccess = "User has no access to this tenant.";
        public const string SessionNotFound = "Session not found.";
        public const string UserNotFound = "User not found.";
        public const string CannotRevokeAnotherUserSession = "You do not have permission to revoke this session.";
    }
}
