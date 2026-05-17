# IdP Platform

Plataforma de **identidade e acesso (IdP)** para um ecossistema de aplicações: centraliza autenticação, emite tokens próprios, organiza **multi-tenant** (organizações), **membros**, **papéis**, **aplicações OAuth** e expõe **JWKS** para validação de JWT.

Este repositório contém o **backend** (API .NET) e o **frontend** (painel web React). Juntos formam o produto que administradores e desenvolvedores usam para operar o IdP e integrar clientes.

---

## Visão geral conceitual

| Conceito | O que é neste projeto |
|----------|------------------------|
| **Identidade externa** | O utilizador autentica-se com **Firebase Authentication** (por exemplo e-mail/password ou outro método configurado no Firebase). A API valida o *ID token* do Firebase. |
| **Sessão e tokens da plataforma** | Após validar o Firebase, a API emite **JWT de acesso** e **refresh token** da própria plataforma, com regras de sessão e rate limiting nos endpoints de auth. |
| **Tenant** | Organização ou espaço isolado. Utilizadores podem pertencer a vários tenants e **alternar o tenant ativo** (contexto para autorização e dados). |
| **Membership e roles** | Ligação de um utilizador a um tenant, com **papéis** configuráveis por tenant. |
| **Administração de plataforma** | Utilizadores com claim `prole=plat_admin` gerem tenants e applications globais (modelo tipo realm admin). |
| **Applications e clients** | Aplicações registadas no IdP com **clientes OAuth** (públicos ou confidenciais). O fluxo de *exchange* exige contexto de cliente (incluindo **PKCE** para clientes públicos). |
| **Auditoria** | Registo de eventos relevantes para rastreio e conformidade. |
| **JWKS** | Chaves públicas em `/.well-known/jwks.json` para que outros serviços validem JWT emitidos por esta API. |

O **frontend** é um painel administrativo (SPA) que consome a API versionada em URL (`/v1.0/...`, conforme configuração). O **backend** implementa a API, persistência em **PostgreSQL** (EF Core + Npgsql), integração **Firebase Admin**, e-mail via **AWS SES** (configurável), e **TenancyKit** para resolver o tenant a partir de claims.

Para documentação detalhada, consulte o índice em **[docs/README.md](docs/README.md)** (produto, backend e frontend).

---

## Estrutura do repositório

```
backend/     → API ASP.NET Core 8 (Clean Architecture: Domain, Application, Infrastructure, API)
frontend/    → SPA React 19 + TypeScript + Vite + Material UI
```

---

## Pré-requisitos

| Ferramenta | Uso |
|------------|-----|
| [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) | Compilar e executar o backend |
| [Node.js](https://nodejs.org/) (versão compatível com `frontend/package.json`) | Instalar dependências e executar o frontend |
| [PostgreSQL](https://www.postgresql.org/download/) 14+ | Base de dados do backend |
| [Redis](https://redis.io/downloads/) | Cache de resolução de tenant |
| [Firebase](https://firebase.google.com/) | Projeto com Authentication; credenciais para o Admin SDK |
| (Opcional) [AWS CLI / credenciais](https://aws.amazon.com/cli/) | Envio de e-mail (SES) em ambientes que usem SES de verdade |

Ferramenta global para migrações:

```bash
dotnet tool install --global dotnet-ef
```

(se já tiver instalado, pode atualizar com `dotnet tool update --global dotnet-ef`)

---

## Configuração e execução do backend

Diretório de trabalho: `backend/`.

### 1. Base de dados

1. Crie uma base PostgreSQL (por exemplo `idpplatform_db`).
2. Edite `IdPPlatform.API/appsettings.Development.json` e ajuste `Database:ConnectionString` ao seu servidor, utilizador, palavra-passe e nome da base.

O ficheiro de exemplo no repositório usa um formato semelhante a:

`Host=localhost;Port=5432;Database=idpplatform_db;Username=...;Password=...`

### 2. Firebase e credenciais Google

Em `appsettings.Development.json`, defina `Firebase:ProjectId` com o ID do projeto Firebase (fallback para quando a variável de ambiente não estiver definida).

O código inicializa o Firebase Admin com **Application Default Credentials** (`GoogleCredential.GetApplicationDefault()`) e resolve `ProjectId` pela ordem:

1. `GOOGLE_CLOUD_PROJECT` (variável de ambiente)  
2. `Firebase:ProjectId` (appsettings)

Em desenvolvimento, configure uma destas formas para credenciais:

- Variável de ambiente `GOOGLE_APPLICATION_CREDENTIALS` apontando para um ficheiro JSON de **conta de serviço** do Google Cloud com permissões para o projeto Firebase; ou  
- `gcloud auth application-default login` (quando aplicável ao teu fluxo).

Notas importantes:

- `gcloud config set project ...` ajusta o projeto padrão do CLI, mas **não** exporta variáveis para o processo `.NET`.
- Se quiser alinhar automaticamente com o projeto ativo do gcloud, exporte `GOOGLE_CLOUD_PROJECT` com o valor de `gcloud config get-value project`.
- Sem credenciais válidas, a verificação de tokens Firebase falhará.

### 3. JWT e secções de runtime

No mesmo `appsettings.Development.json`, ajuste `Jwt` (`Issuer`, `Audience`, `SigningKey` forte em produção).

Refine `Session`, `RateLimit`, `Invite`, `Email` e `Redis` conforme [backend/README.md](backend/README.md).

### 4. Bootstrap inicial seguro (plataforma virgem)

Após aplicar migrações, a base fica somente com **schema** (sem seeds de negócio). Toda configuração inicial é feita via UI.

Com banco novo:

1. Suba backend e frontend normalmente.
2. O frontend redireciona para `/bootstrap` enquanto `requiresBootstrap=true`.
3. Faça login com Google/Firebase na etapa 1 do wizard.
4. Na etapa 2, confirme/ajuste tenant, application e OAuth client iniciais.
5. O backend cria **root admin**, tenant, roles, application e client numa transação única e fecha o bootstrap de forma irreversível.
6. Depois disso, `/platform/bootstrap` e `/bootstrap` ficam bloqueados para sempre, e o fluxo segue para `/login`.

### 5. AWS SES e variáveis de ambiente

O serviço de e-mail usa `Email:FromAddress` e `Email:Region` do appsettings e obtém credenciais pela cadeia padrão do AWS SDK.

Variáveis úteis (documentadas em `EnvironmentVariablesDocumentation` nos appsettings):

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN` (credenciais temporárias)
- `AWS_PROFILE`
- `AWS_REGION`

### 6. Migrações EF Core

A partir da pasta `backend/`:

```bash
dotnet ef database update --project IdPPlatform.Infrastructure --startup-project IdPPlatform.API
```

### 7. Executar a API

```bash
dotnet run --project IdPPlatform.API
```

Por defeito o perfil de lançamento expõe a API em **http://localhost:5000** (ver `IdPPlatform.API/Properties/launchSettings.json`).

- **Swagger (Development):** http://localhost:5000/swagger  
- **JWKS:** http://localhost:5000/.well-known/jwks.json  

---

## Configuração e execução do frontend

Diretório de trabalho: `frontend/`.

### 1. Variáveis de ambiente

Copie o exemplo e edite os valores:

```bash
copy .env.example .env
```

No Windows PowerShell pode usar `Copy-Item .env.example .env`.

Variáveis (ver também [frontend/.env.example](frontend/.env.example)):

| Variável | Descrição |
|----------|-----------|
| `VITE_API_BASE_URL` | URL base da API (ex.: `http://localhost:5000`) |
| `VITE_API_VERSION` | Segmento de versão na URL (ex.: `1.0` → pedidos em `/v1.0/...`) |
| `VITE_API_TIMEOUT_MS` | Timeout HTTP em milissegundos |
| `VITE_OAUTH_CLIENT_ID` | Fallback de client usado no exchange (o login prioriza `GET /platform/status`) |
| `VITE_FIREBASE_API_KEY` | Chave API do projeto Firebase |
| `VITE_FIREBASE_AUTH_DOMAIN` | Domínio Auth do Firebase |
| `VITE_FIREBASE_PROJECT_ID` | Project ID Firebase |
| `VITE_FIREBASE_APP_ID` | App ID Web do Firebase |

A URL e a versão devem corresponder ao backend em execução.

### 2. Instalar dependências e arrancar

```bash
npm install
npm run dev
```

O Vite está configurado para a porta **3000** (`frontend/vite.config.ts`). Abra o URL indicado no terminal (normalmente http://localhost:3000).

Comandos úteis:

```bash
npm run build    # build de produção
npm run preview  # pré-visualizar o build localmente
```

---

## Ordem sugerida no dia a dia

1. Arrancar **PostgreSQL** e **Redis** e garantir a configuração de conexão.  
2. Aplicar **migrações** se o esquema mudou.  
3. Executar o **backend** (`dotnet run --project IdPPlatform.API`).  
4. Configurar **`.env`** do frontend e executar **`npm run dev`**.  
5. Se for primeira execução, concluir `/bootstrap` (irreversível) para definir o root admin.  
6. Depois, autenticar no `/login` com Firebase + exchange PKCE.

---

## Documentação complementar

| Documento | Descrição |
|-----------|-----------|
| [docs/README.md](docs/README.md) | Índice central |
| [docs/PRODUCT_DOCUMENTATION.md](docs/PRODUCT_DOCUMENTATION.md) | Visão de produto |
| [docs/ENTITY_AND_FLOW_GUIDE.md](docs/ENTITY_AND_FLOW_GUIDE.md) | Entidades e fluxos |
| [backend/README.md](backend/README.md) | API, execução e segurança |
| [docs/backend/DOMAIN.md](docs/backend/DOMAIN.md) | Camada de domínio |
| [docs/backend/APPLICATION.md](docs/backend/APPLICATION.md) | Services e use cases |
| [frontend/README.md](frontend/README.md) | Painel web |

O contrato OpenAPI usado pelo frontend pode ser consultado em [frontend/swagger.json](frontend/swagger.json) (quando atualizado em conjunto com a API).
