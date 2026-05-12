# IdP Platform Backend

Backend do microsservico de autenticacao centralizada para o ecossistema de aplicacoes.

## Stack

- .NET 8 Web API
- Clean Architecture (Domain/Application/Infrastructure/API)
- EF Core + MySQL
- TenancyKit (claims tenant resolver + EF store)
- Firebase Authentication (token verification + exchange)
- Swagger/OpenAPI

## Organizacao das camadas

- `Application` mantem contratos, requests, DTOs e use cases.
- Queries concretas, repositorios, configuracoes EF e servicos externos ficam em `Infrastructure`.
- Mensagens de erro ficam centralizadas em constantes (`DomainErrorMessages`, `ApplicationErrorMessages`, `ApiErrorMessages`).
- Repositorios usam `AddAsync` para criacao, `GetForUpdateAsync` para busca rastreada por id, `GetBy<ParamName>Async` para outros parametros, `AlreadyExistsAsync` para existencia e sufixo `With<RelationshipName>Async` quando carregam relacionamentos.
- Use cases, queries e actions usam `Get*` para item unico e `List*` para colecoes ou resultados paginados.

## Como executar localmente

1. Ajuste `IdPPlatform.API/appsettings.Development.json` com conexao do banco e dados reais de JWT/Firebase.
2. Rode as migracoes:
   - `dotnet ef database update --project IdPPlatform.Infrastructure --startup-project IdPPlatform.API`
3. Execute a API:
   - `dotnet run --project IdPPlatform.API`

## Swagger

Com a API em execucao:

- `http://localhost:5000/swagger`

## Endpoints principais

- `POST /v1/auth/exchange`
- `POST /v1/auth/refresh`
- `POST /v1/auth/switch-tenant`
- `POST /v1/auth/logout`
- `GET /v1/auth/sessions`
- `DELETE /v1/auth/sessions/{sessionId}`
- `GET /v1/users/me`
- `GET /v1/users/me/memberships?page=1&pageSize=20`
- `GET /v1/tenants?page=1&pageSize=20`
- `POST /v1/tenants`
- `GET /v1/tenants/{tenantId}/roles?page=1&pageSize=20`
- `POST /v1/tenants/{tenantId}/roles`
- `POST /v1/tenants/{tenantId}/memberships`
- `GET /v1/tenants/{tenantId}/memberships?page=1&pageSize=20`
- `POST /v1/tenants/{tenantId}/invites`
- `POST /v1/invites/accept`
- `GET /v1/applications?page=1&pageSize=20`
- `POST /v1/applications`
- `GET /v1/auditlogs?page=1&pageSize=20`
- `GET /.well-known/jwks.json`

## Novos requisitos de seguranca no Exchange

`POST /v1/auth/exchange` agora requer contexto de client OAuth.

Body minimo:

```json
{
  "identityToken": "<firebase_id_token>",
  "clientId": "crm-web",
  "clientSecret": "optional-for-public-clients",
  "redirectUri": "https://app.example.com/callback",
  "requestedScopes": ["openid", "profile", "email"],
  "codeChallenge": "pkce-code-challenge",
  "codeChallengeMethod": "S256"
}
```

Notas:

- `clientId` e validado contra `application_clients`.
- `clientSecret` e obrigatorio para clients `Confidential`.
- `codeChallenge` e obrigatorio para clients `Public` (PKCE).
- Endpoints de auth possuem rate limiting por IP.

## Configuracoes novas

Adicione/ajuste no `appsettings.Development.json`:

```json
{
  "Session": {
    "MaxSessionsPerUser": 5
  },
  "RateLimit": {
    "ExchangePermitLimit": 5,
    "ExchangeWindowMinutes": 5,
    "RefreshPermitLimit": 20,
    "RefreshWindowMinutes": 5
  },
  "Invite": {
    "ExpirationHours": 72
  },
  "Email": {
    "FromAddress": "noreply@idpplatform.local",
    "Region": "us-east-1"
  }
}
```

## Migracao de banco

Migrations geradas:

- `SecurityAuditSessionsAndInvites`
- `FlexibleTenantRoles`

Para aplicar:

- `dotnet ef database update --project IdPPlatform.Infrastructure --startup-project IdPPlatform.API`
