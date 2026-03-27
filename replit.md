# Ether Bound Idle

## Overview

Full-featured idle MMORPG with a clean split architecture: separate `/backend` and `/frontend` directories, ready for deployment on a custom server.

## Stack

- **Frontend**: React + Vite + Tailwind CSS v3 (dark sci-fi theme)
- **Backend**: Express 5 + TypeScript + Drizzle ORM
- **Database**: PostgreSQL (Supabase)
- **Node.js**: 24
- **External Server**: `http://46.224.121.242:3000`

## Structure

```text
/
├── backend/                    # Express API server
│   ├── src/
│   │   ├── index.ts            # Entry point (port binding)
│   │   ├── app.ts              # Express app setup, middleware, routes
│   │   ├── db/
│   │   │   ├── index.ts        # Drizzle DB connection (DATABASE_URL)
│   │   │   └── schema.ts       # All table definitions
│   │   ├── lib/
│   │   │   ├── auth.ts         # Session management (cookie/bearer)
│   │   │   ├── gameData.ts     # Game constants, loot gen, enemy data
│   │   │   ├── logger.ts       # Pino logger
│   │   │   └── supabase.ts     # Supabase client
│   │   ├── middleware/
│   │   │   └── auth.ts         # Auth middleware (req.user)
│   │   ├── models/
│   │   │   └── character.ts    # toClientCharacter() mapper
│   │   ├── routes/
│   │   │   ├── auth.ts         # /api/auth/* endpoints
│   │   │   ├── entities.ts     # Generic CRUD /api/entities/:entity
│   │   │   ├── functions.ts    # All game logic endpoints /api/functions/*
│   │   │   └── health.ts       # /api/healthz
│   │   └── services/
│   │       └── authHelpers.ts  # requireAuth, requireAdmin, requireCharacterOwner
│   ├── package.json
│   └── tsconfig.json
├── frontend/                   # React + Vite client
│   ├── src/
│   │   ├── api/
│   │   │   └── base44Client.js # Server-only API client
│   │   ├── components/         # UI components (dashboard, game, guild, etc.)
│   │   ├── hooks/              # React hooks
│   │   ├── lib/                # Auth, idle engine, game config, etc.
│   │   ├── pages/              # Route pages (Battle, Inventory, etc.)
│   │   ├── App.jsx             # Root app with routing
│   │   └── main.jsx            # React entry point
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── postcss.config.js
├── artifacts/                  # Legacy monorepo (being replaced)
│   ├── api-server/
│   └── game/
└── replit.md
```

## API Endpoints (Backend)

All under `/api`:
- `GET /api/test` — Health check
- `GET /api/healthz` — Health check
- Auth: `GET /api/auth/user`, `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/logout`
- Entities: `GET/POST /api/entities/:entity`, `GET/PATCH/DELETE /api/entities/:entity/:id`
- Functions: `POST /api/functions/:name` — fight, getPlayer, sellItem, upgradeItemSafe, upgradeItemStar, awakenItem, lifeSkills, processGemLab, claimGemLabGems, upgradeGemLab, transmuteGold, completeTrade, manageParty, manageFriends, getLeaderboard, dungeonAction, processServerProgression, catchUpOfflineProgress, unifiedPlayerProgression, gameConfigManager, claimDailyLogin, etc.

## Entity Names

Character, Item, Guild, Quest, Trade, Party, PartyActivity, PartyInvite, Presence, PlayerSession, ChatMessage, Mail, Resource, FriendRequest, Friendship, TradeSession, DungeonSession, GemLab, PrivateMessage

## Key Design Decisions

- **Server-authoritative**: All game logic (combat, loot, upgrades) validated on backend
- **Items schema**: No subtype/levelReq/sellPrice/setName columns — stored in `extraData` JSONB; `setId` column holds setKey
- **GemLab**: Uses `gem_labs` table (characterId, data JSONB) — NOT character.gemLab JSONB
- **Gear upgrades**: Safe = 300*(upgrade+1)*rarityMult gold, +5%; Star = ceil(5*1.5^star*rarityMult) gems, +15%/destroy, max 7; Awaken = 50 gems (star 7), +50%
- **Fight**: regionKey from char.currentRegion, isBoss/isElite from ENEMIES definition
- **Auth**: Session-based with cookie + Bearer token fallback
- **Admin**: requireAdmin checks userRolesTable (role "admin" or "moderator")

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_ANON_KEY` — Supabase anonymous key
- `PORT` — Server port (default 3000 for backend, 5173 for frontend)

## Running Locally

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev

# Build frontend for deployment
cd frontend && npm run build  # outputs to frontend/dist/
```
