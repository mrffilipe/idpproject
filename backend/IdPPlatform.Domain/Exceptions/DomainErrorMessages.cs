namespace IdPPlatform.Domain.Exceptions;

public static class DomainErrorMessages
{
    public static class TenantEntity
    {
        public const string TenantIdRequired = "TenantId is required.";
    }

    public static class Tenant
    {
        public const string NameRequired = "Tenant name is required.";
        public const string KeyAlreadyExists = "Tenant key already exists.";
        public const string TenantNotFound = "Tenant not found.";
    }

    public static class TenantKey
    {
        public const string Required = "Tenant key is required.";
        public const string InvalidFormat = "Tenant key format is invalid.";
    }

    public static class TenantRole
    {
        public const string KeyRequired = "Tenant role key is required.";
        public const string KeyInvalidFormat = "Tenant role key format is invalid.";
        public const string NameRequired = "Tenant role name is required.";
        public const string NameMaxLength = "Tenant role name max length is 120.";
        public const string DescriptionMaxLength = "Tenant role description max length is 500.";
        public const string AtLeastOneRoleRequired = "At least one tenant role is required.";
        public const string RoleTenantMismatch = "Tenant role does not belong to this tenant.";
        public const string InactiveRole = "Tenant role is inactive.";
        public const string DuplicateRole = "Tenant roles cannot contain duplicates.";
        public const string RoleNotFound = "Tenant role not found.";
        public const string RoleAlreadyExists = "Tenant role key already exists.";
        public const string CannotChangeRevokedMembershipRoles = "Cannot change roles for a revoked membership.";
    }

    public static class User
    {
        public const string DisplayNameRequired = "Display name is required.";
        public const string UserNotFound = "User not found.";
        public const string UserInactive = "User is inactive.";
        public const string EmailAlreadyExists = "User email already exists.";
    }

    public static class EmailAddress
    {
        public const string Required = "Email is required.";
        public const string MaxLength = "Email max length is 255.";
        public const string InvalidFormat = "Email format is invalid.";
    }

    public static class ExternalIdentity
    {
        public const string UserIdRequired = "UserId is required.";
        public const string ProviderDataRequired = "Provider and provider user id are required.";
    }

    public static class TenantMembership
    {
        public const string UserIdRequired = "UserId is required.";
        public const string MembershipAlreadyExists = "Membership already exists.";
        public const string MembershipNotFound = "Membership not found.";
    }

    public static class TenantInvite
    {
        public const string InvitedByUserIdRequired = "InvitedByUserId is required.";
        public const string TokenHashRequired = "Invite token hash is required.";
        public const string InviteNotFound = "Invite not found.";
        public const string AlreadyConsumed = "Invite was already consumed.";
        public const string Expired = "Invite has expired.";
        public const string EmailMismatch = "Invite email does not match authenticated user.";
    }

    public static class Application
    {
        public const string NameAndSlugRequired = "Application name and slug are required.";
    }

    public static class ApplicationClient
    {
        public const string DataInvalid = "Application client data is invalid.";
    }

    public static class ApplicationTenant
    {
        public const string DataInvalid = "Application tenant data is invalid.";
        public const string MappingAlreadyExists = "Application tenant mapping already exists.";
    }

    public static class AuthSession
    {
        public const string UserIdRequired = "UserId is required.";
        public const string TenantContextInvalid = "Tenant context is invalid.";
        public const string SessionNotFound = "Session not found.";
    }

    public static class RefreshToken
    {
        public const string DataInvalid = "Refresh token data is invalid.";
    }

    public static class PlatformConfiguration
    {
        public const string NotFound = "Platform configuration not found.";
        public const string AlreadyBootstrapped = "Platform bootstrap has already been completed.";
        public const string RootUserIdRequired = "Root user id is required.";
        public const string OauthClientIdRequired = "OAuth client id is required.";
    }
}
