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
| **Applications e clients** | Aplicações registadas no IdP com **clientes OAuth** (públicos ou confidenciais). O fluxo de *exchange* exige contexto de cliente (incluindo **PKCE** para clientes públicos). |
| **Auditoria** | Registo de eventos relevantes para rastreio e conformidade. |
| **JWKS** | Chaves públicas em `/.well-known/jwks.json` para que outros serviços validem JWT emitidos por esta API. |

O **frontend** é um painel administrativo (SPA) que consome a API versionada em URL (`/v1.0/...`, conforme configuração). O **backend** implementa a API, persistência em **MySQL** (EF Core), integração **Firebase Admin**, e-mail via **AWS SES** (configurável), e **TenancyKit** para resolver o tenant a partir de claims.

Para detalhes de API, exemplos de *exchange* e convenções de código do backend, consulte [backend/README.md](backend/README.md). Para estrutura de pastas e serviços HTTP do SPA, consulte [frontend/README.md](frontend/README.md).

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
| [MySQL](https://dev.mysql.com/downloads/mysql/) 8.x | Base de dados do backend |
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

1. Crie uma base MySQL (por exemplo `idpplatform_db`).
2. Edite `IdPPlatform.API/appsettings.Development.json` e ajuste `Database:ConnectionString` ao seu servidor, utilizador, palavra-passe e nome da base.

O ficheiro de exemplo no repositório usa um formato semelhante a:

`Server=localhost;Port=3306;Database=idpplatform_db;Uid=...;Pwd=...;CharSet=utf8mb4;`

### 2. Firebase e credenciais Google

Em `appsettings.Development.json`, defina `Firebase:ProjectId` com o ID do projeto Firebase.

O código inicializa o Firebase Admin com **Application Default Credentials** (`GoogleCredential.GetApplicationDefault()`). Em desenvolvimento, configure uma destas formas:

- Variável de ambiente `GOOGLE_APPLICATION_CREDENTIALS` apontando para um ficheiro JSON de **conta de serviço** do Google Cloud com permissões para o projeto Firebase; ou  
- `gcloud auth application-default login` (quando aplicável ao teu fluxo).

Sem credenciais válidas, a verificação de tokens Firebase falhará.

### 3. JWT e restantes secções

No mesmo `appsettings.Development.json`, ajuste `Jwt` (`Issuer`, `Audience`, `SigningKey` forte em produção). Opcionalmente refine `Session`, `RateLimit`, `Invite` e `Email` conforme [backend/README.md](backend/README.md).

### 4. Migrações EF Core

A partir da pasta `backend/`:

```bash
dotnet ef database update --project IdPPlatform.Infrastructure --startup-project IdPPlatform.API
```

### 5. Executar a API

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

1. Arrancar **MySQL** e garantir que a connection string está correta.  
2. Aplicar **migrações** se o esquema mudou.  
3. Executar o **backend** (`dotnet run --project IdPPlatform.API`).  
4. Configurar **`.env`** do frontend e executar **`npm run dev`**.  
5. Autenticar no painel com um utilizador que exista no **Firebase** e que consiga completar o fluxo de *exchange* conforme as regras da API (cliente OAuth, PKCE quando aplicável).

---

## Documentação complementar

- [backend/README.md](backend/README.md) — camadas do projeto, endpoints resumidos, corpo mínimo do `POST /v1/auth/exchange`, rate limits e notas de segurança.  
- [frontend/README.md](frontend/README.md) — estrutura de pastas, serviços HTTP e relação com o backend.

O contrato OpenAPI usado pelo frontend pode ser consultado em [frontend/swagger.json](frontend/swagger.json) (quando atualizado em conjunto com a API).
