# Workspace

## Overview

pnpm workspace monorepo using TypeScript. This project is **Ether Bound Idle** — a full-featured idle MMORPG migrated from Base44 to Replit. It uses Replit Auth for authentication, PostgreSQL + Drizzle for persistence, and Express API routes replacing Base44 serverless functions.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Frontend**: React + Vite + Tailwind CSS v3 (dark sci-fi theme)
- **Auth**: Replit Auth (OIDC with PKCE)
- **Build**: esbuild (API server), Vite (frontend)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (auth, entities, game functions)
│   └── game/               # React + Vite frontend (idle MMORPG)
├── lib/
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Key Architecture

### Frontend (artifacts/game)

- **Tailwind v3** with dark sci-fi theme using CSS custom properties (NOT v4)
- Uses `@tailwind base/components/utilities` directives, postcss.config.js, tailwind.config.js
- **Base44 Compatibility Layer**: `src/api/base44Client.js` is a drop-in replacement for the Base44 SDK that calls our Express API instead. The 45+ game files that imported base44 work without modification.
- **Auth**: `src/lib/AuthContext.jsx` uses Replit Auth (cookie-based sessions via `/api/auth/user`)
- **API URL pattern**: `import.meta.env.BASE_URL.replace(/\/$/, '') + '/../api'` resolves to `/api`
- **Game pages**: Battle, Inventory, Shop, Quests, Dungeons, LifeSkills, GearUpgrading, SkillTree, GuildPage, Social, Dashboard, Leaderboard, Profile, AdminPanel, GameConfig
- **Key libs**: react-router-dom, @tanstack/react-query, framer-motion, recharts, lucide-react, shadcn/ui components

### API Server (artifacts/api-server)

- **Auth routes** (`routes/auth.ts`): Replit OIDC login/callback/logout with PKCE, session cookies
- **Entity CRUD** (`routes/entities.ts`): Generic CRUD for 13 game entities (Character, Item, Guild, Quest, Trade, Party, etc.) with snake_case↔camelCase field mapping and ownership verification
- **Game functions** (`routes/functions.ts`): 20+ game functions (sellItem, dungeonAction, lifeSkills, gemLab, dailyLogin, shopRotation, questManagement, etc.) with admin authorization on privileged endpoints
- **Auth middleware** (`middlewares/authMiddleware.ts`): Session hydration with OIDC token refresh

### Database (lib/db)

- **Schema** (`schema/game.ts`): 15 tables — characters, items, guilds, quests, trades, parties, party_activities, party_invites, presences, player_sessions, chat_messages, mail, resources, game_config, user_roles
- **JSONB columns** for flexible game data: equipment, skills, achievements, life_skills, gem_lab, dungeon_data, skill_tree_data
- Uses `drizzle-kit push` for dev schema sync

## Security

- Entity mutations (PATCH/DELETE) verify ownership via `verifyOwnership()` which checks the `createdBy` or related character's owner
- Admin endpoints (getAllUsers, getAllCharacters, updateUserRole, managePlayer, gameConfigManager update) require admin/moderator role via `requireAdmin()`
- All data endpoints require authentication

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly`

## Dev Commands

- `pnpm --filter @workspace/api-server run dev` — run API server
- `pnpm --filter @workspace/game run dev` — run game frontend
- `pnpm --filter @workspace/db run push` — push schema to PostgreSQL
