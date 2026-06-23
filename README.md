# Buridina — Sistema de Certificação de Membros de Aldeias

Este é um monorepo baseado em **pnpm workspaces** e **TypeScript** que compõe o ecossistema **Buridina**, um sistema voltado para o cadastro, votação, aprovação e verificação de membros de comunidades/aldeias indígenas.

---

## 🏗️ Estrutura do Monorepo

O projeto está dividido em subprojetos organizados em `artifacts/` (aplicativos e servidores) e `lib/` (bibliotecas compartilhadas e especificações):

```
├── artifacts/
│   ├── aldeias-app/       # Aplicativo mobile em Expo (React Native) para verificação offline/online
│   ├── aldeias-web/       # Dashboard administrativo web em React (Vite) para cadastro e votação
│   └── api-server/        # Servidor backend Express que expõe a API REST e gerencia as regras
├── lib/
│   ├── db/                # Camada de banco de dados (Drizzle ORM + schemas do PostgreSQL)
│   ├── api-spec/          # Especificação OpenAPI (openapi.yaml) e configuração do Orval
│   ├── api-zod/           # Esquemas de validação Zod gerados automaticamente
│   └── api-client-react/  # Cliente de API e React Query Hooks gerados a partir da especificação
└── scripts/               # Scripts de utilidade e semeadura (seeding) de dados
```

---

## 🛠️ Stack Tecnológica Geral

- **Gerenciador de Monorepo**: `pnpm workspaces`
- **Linguagem**: `TypeScript` (v5.9+)
- **Runtime**: `Node.js` (v24+)
- **Banco de Dados**: `PostgreSQL` + `Drizzle ORM` (com fallback local para banco em memória `pg-mem` caso não haja conexão Supabase configurada)
- **Geração de Código API**: `Orval` (para geração de hooks de requisição React e esquemas Zod)

---

## 📱 Componentes do Sistema

### 1. Aplicativo Mobile (`artifacts/aldeias-app`)
*O app mobile é focado na leitura, consulta e verificação rápida de membros. Todo o fluxo de cadastro e votação ocorre no painel web ou via API.*
- **Tecnologias**: Expo, React Native, TypeScript, AsyncStorage.
- **Funcionalidades**:
  - **Tela Principal (Home)**: Lista de aldeias cadastradas e barra de pesquisa para busca de membros por nome.
  - **Detalhes da Aldeia**: Exibe todos os membros associados à aldeia selecionada.
  - **Cartão do Membro**: Exibição completa da ficha de identificação com QR Code gerado para leitura rápida.
  - **Leitor de QR Code**: Utiliza a câmera do celular para ler o QR Code do cartão do membro e exibir instantaneamente o seu status de certificação (Aprovado, Pendente ou Rejeitado).
- **Estratégia de Sincronização**:
  - Monitoramento do estado da internet via `@react-native-community/netinfo`.
  - Cache local dos dados obtidos do servidor em `AsyncStorage` para funcionamento offline.
  - Sincronização automática em segundo plano a cada 5 minutos (quando conectado) e sempre que o aplicativo é trazido para o primeiro plano (foreground).

### 2. Painel Administrativo Web (`artifacts/aldeias-web`)
*O painel web é a interface central de tomada de decisão, voltado para os administradores regionais, avaliadores e administradores master.*
- **Tecnologias**: React, Vite, TypeScript, Tailwind CSS, Lucide React.
- **Funcionalidades**:
  - Autenticação e controle de acesso por papéis (roles).
  - Cadastro de novas aldeias (`CadastroAldeia`) e novos membros (`CadastroMembro`).
  - Painel de votação nas telas de detalhes (`AldeiaDetail` e `MembroDetail`), onde avaliadores e master podem computar votos para certificar membros.

### 3. Servidor de API (`artifacts/api-server`)
*Servidor Express responsável por processar todas as regras de negócio, votação e autenticação.*
- **Tecnologias**: Express 5, Node.js, Drizzle ORM, `pg-mem` (para ambiente de desenvolvimento local).
- **Principais Endpoints**:
  - `POST /api/login`: Autentica o usuário e retorna o seu papel (`master`, `admin` ou `avaliador`).
  - `GET /api/aldeias`: Lista as aldeias (permite o parâmetro `updatedAfter` para sincronização incremental no mobile).
  - `POST /api/aldeias`: Cria uma nova aldeia (permissão restrita).
  - `GET /api/membros`: Lista os membros (permite filtragem por `aldeiaId`, query de texto `search`, data `updatedAfter` e `status`). Retorna os dados do membro juntamente com seu histórico de votos.
  - `POST /api/membros`: Cadastra um membro.
  - `POST /api/membros/:id/voto`: Registra ou atualiza um voto de aprovação ou rejeição para o membro.
  - `POST /api/membros/:id/decidir`: Força a alteração de status de um membro manualmente.

---

## ⚖️ Regras de Negócio e Fluxo de Votação

O status de certificação de um membro (`status` em `membros`) pode ser `"pending"`, `"approved"` ou `"rejected"`. O fluxo de transição é governado pelas seguintes regras:

1. **Cadastro Direto**:
   - Se o membro for adicionado por um usuário com papel de **Master** (identificado pelo header `x-user-role: master`), o cadastro é aprovado diretamente (`status = "approved"`).
   - Se **não existirem avaliadores** cadastrados no sistema no momento da criação, o cadastro do membro também é aprovado de forma direta (`status = "approved"`).
   - Caso contrário, o membro é criado com o status `"pending"`.
2. **Sistema de Votação**:
   - Usuários com o papel de **Avaliador** podem submeter votos (`"aprovar"` ou `"rejeitar"`) para membros pendentes.
   - **Aprovação Direta por Master**: Se um usuário com papel **Master** votar para `"aprovar"` um membro, o status dele transiciona imediatamente para `"approved"`.
   - **Consenso de Avaliadores**: Se um membro atingir **2 ou mais votos** de `"aprovar"`, seu status passa a ser `"approved"`.
   - **Consenso de Rejeição**: Se um membro atingir **2 ou mais votos** de `"rejeitar"`, seu status passa a ser `"rejected"`.

---

## 🗄️ Esquema do Banco de Dados (`lib/db`)

O banco possui as seguintes tabelas e campos principais mapeados com Drizzle ORM:

- **`usuarios`**: `id` (UUID), `username` (único), `password` (em texto plano para testes locais), `role` (`"master" | "admin" | "avaliador"`), `nome`, `createdAt`, `updatedAt`.
- **`aldeias`**: `id` (UUID), `nome`, `descricao`, `localizacao`, `createdAt`, `updatedAt`.
- **`membros`**: `id` (UUID), `aldeiaId` (referenciando `aldeias`), `nomeEtnico`, `nomeSocial`, `endereco`, `fotoUrl`, `status` (`"pending" | "approved" | "rejected"`), `createdAt`, `updatedAt`.
- **`votos`**: `id` (UUID), `membroId` (referenciando `membros`), `avaliadorNome`, `voto` (`"aprovar" | "rejeitar"`), `createdAt`.

---

## 🔑 Credenciais Padrão para Testes

O servidor realiza uma semeadura automática lenta (*lazy seeding*) ao receber a primeira requisição de login, garantindo a existência dos seguintes usuários padrão:

| Usuário (E-mail) | Senha | Função / Nível de Acesso (Role) | Nome Completo |
| :--- | :--- | :--- | :--- |
| `master@aldeias.com` | `teste123` | **`master`** (Super Administrador) | Master Administrator |
| `admin@aldeias.com` | `teste123` | **`admin`** (Administrador Regional) | Administrador Regional |
| `avaliador@aldeias.com` | `teste123` | **`avaliador`** (Avaliador Técnico) | Avaliador Principal |

---

## ⚙️ Configuração e Execução

### Pré-requisitos
Certifique-se de ter instalado o [PNPM](https://pnpm.io/) e o [Node.js](https://nodejs.org/) instalados em sua máquina.

### Configuração do Ambiente (`.env`)
Crie um arquivo `.env` na raiz do projeto contendo as seguintes variáveis:
```env
DATABASE_URL="postgresql://usuario:senha@host:porta/banco?pgbouncer=true"
PORT=3000
```
*Nota: Se o `DATABASE_URL` não for configurado ou falhar ao conectar, a biblioteca `@workspace/db` usará o `pg-mem` (banco de dados PostgreSQL em memória), que é totalmente funcional para testes rápidos, mas zera os dados sempre que o servidor reinicia.*

### Principais Comandos

No diretório raiz do projeto, você pode executar os seguintes comandos:

```bash
# Instalar dependências de todos os projetos
pnpm install

# Executar verificação de tipos (TypeScript) em todos os pacotes
pnpm run typecheck

# Compilar todos os pacotes do monorepo
pnpm run build

# Executar a API em ambiente de desenvolvimento (localhost:3000)
pnpm run dev:api

# Executar o painel administrativo web em desenvolvimento (Vite)
pnpm run dev:web

# Iniciar o Expo para desenvolvimento do app mobile
pnpm run dev:app

# Executar o app no emulador Android
pnpm run app:android

# Gerar o build de produção do app (.apk)
pnpm run app:build

# Gerar dados falsos (semeadura de teste via script manual)
pnpm --filter @workspace/scripts run seed

# Regenerar hooks de API e esquemas Zod a partir do openapi.yaml
pnpm --filter @workspace/api-spec run codegen
```
