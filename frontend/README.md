# IdP Platform — Frontend (painel web)

SPA em **React 19**, **TypeScript** e **Vite**, com **Material UI**, **React Router 7 (Data Mode)** e **Axios** para integração com a API do IdP Platform.

Documentação de produto: [docs/README.md](../docs/README.md), [ENTITY_AND_FLOW_GUIDE.md](../docs/ENTITY_AND_FLOW_GUIDE.md). Backend: [backend/README.md](../backend/README.md).

## Requisitos

- Node.js compatível com a versão no `package.json`
- Variáveis de ambiente configuradas via `.env` (use [`.env.example`](./.env.example) como base)
- Backend rodando e acessível pela URL informada em `VITE_API_BASE_URL`

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

- `VITE_API_BASE_URL`: URL base do backend (ex.: `http://localhost:5000`)
- `VITE_API_VERSION`: versão da API no path (ex.: `1.0` para gerar `/v1.0/...`)
- `VITE_API_TIMEOUT_MS`: timeout das requisições Axios em ms
- `VITE_OAUTH_CLIENT_ID`: fallback de client usado no exchange (o login usa `GET /platform/status` quando disponível)
- `VITE_FIREBASE_API_KEY`: API key do projeto Firebase
- `VITE_FIREBASE_AUTH_DOMAIN`: domínio auth Firebase
- `VITE_FIREBASE_PROJECT_ID`: project id Firebase
- `VITE_FIREBASE_APP_ID`: app id web Firebase

Todas as variáveis de configuração de API usadas pelo frontend têm origem no `.env`.

## Comandos

```bash
npm install
npm run dev      # servidor de desenvolvimento
npm run build    # build de produção (tsc + vite build)
npm run preview  # preview local do build
```

## Relação com o backend

- A camada HTTP usa `src/config/axios.ts` com:
  - `baseURL` e timeout vindos de env
  - interceptor para Bearer token
  - refresh token automático em `401` com retry da request
- A autenticação usa Firebase (`src/config/firebase.ts`) para obter ID token e, em seguida, exchange no backend com PKCE.
- Os endpoints estão organizados por domínio em `src/services/`:
  - `authService`, `platformService`, `usersService`, `tenantsService`, `membershipsService`
  - `tenantRolesService`, `applicationsService`, `auditLogsService`, `wellKnownService`
- A versão da API é centralizada em `src/services/httpPaths.ts` e derivada de `VITE_API_VERSION`.

## Estrutura (resumo)

| Pasta | Conteúdo |
|-------|----------|
| `src/pages/` | Páginas e fluxos (bootstrap, login, tenants, memberships, roles, apps, auditoria, jwks) |
| `src/components/` | Layout base (`AppLayout`) e componentes compartilhados |
| `src/contexts/` | `AuthContext`, `TenantContext` |
| `src/services/` | Chamadas HTTP por domínio |
| `src/config/` | Configuração de ambiente e instâncias Axios |
| `src/routes.tsx` | Definição do router em Data Mode |
| `src/routes/loaders.ts` | Loaders de autenticação e proteção de rotas |
| `src/theme/` | Tema MUI global |
| `src/types/` | Tipos de request/response e contratos comuns |
| `src/utils/` | Storage de sessão/tenant, tratamento de erro e utilitários |

## Rotas e cobertura funcional

O frontend cobre os recursos da API em telas/fluxos para:

- bootstrap inicial irreversível (`/bootstrap`) em wizard de 2 etapas:
  - etapa 1: autenticação Firebase/Google
  - etapa 2: configuração editável de tenant/application/client
- autenticação e sessões
- perfil do usuário
- tenants (criar, listar, buscar, atualizar, convite, switch tenant)
- memberships (criar, listar, atualizar roles, revogar)
- tenant roles (listar, criar, atualizar)
- applications (criar, listar, detalhar, criar client)
- audit logs
- JWKS (`/.well-known/jwks.json`)
