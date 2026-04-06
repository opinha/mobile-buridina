# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Mobile**: Expo (React Native) — Aldeias App

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/scripts run seed` — seed database with initial data

## Aldeias App Architecture

### Purpose
Indigenous village member certification system. The mobile app is for **reading/verifying** members only — all registration is done server-side or via admin API.

### Mobile App (`artifacts/aldeias-app`)
- **Home screen**: Lists all aldeias, search bar to find members by name
- **Aldeia detail**: Lists all members of an aldeia  
- **Member card**: Full identification card with QR Code
- **QR Scanner**: Scans member QR codes and shows verified member info
- **Offline/Online sync**: Uses AsyncStorage for offline cache, auto-syncs every 5 minutes when online, syncs on app foreground

### API (`artifacts/api-server`)
Routes:
- `GET /api/aldeias` — list aldeias (supports `updatedAfter` query param)
- `GET /api/aldeias/:id` — get single aldeia
- `POST /api/aldeias` — create aldeia (admin)
- `GET /api/membros` — list membros (supports `aldeiaId`, `search`, `updatedAfter`)
- `GET /api/membros/:id` — get single membro
- `POST /api/membros` — create membro (admin)

### DB Schema
- `aldeias`: id, nome, descricao, localizacao, createdAt, updatedAt
- `membros`: id, aldeiaId, nomeEtnico, nomeSocial, endereco, fotoUrl, createdAt, updatedAt

### Sync Strategy
The mobile app fetches ALL aldeias and membros on startup and every 5 minutes (when online). Data is cached in AsyncStorage for offline use. Network status is monitored via `@react-native-community/netinfo`.

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
