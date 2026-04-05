# Jerry OS Dynamic Data Rewrite - Architecture Plan

## Current State (Broken)

`dynamic-data.js` generates fake random data using `Math.random()`:
- Models: Fake names, fake request counts, simulated uptime
- Sessions: Hardcoded fake data with random token counts
- Crons: Calculated next-run dates but fake status
- Lab: Static hardcoded JSON
- No connection to any real API

## Architecture — 3 Phases

### Phase 1: Data Source Layer (Foundation)

Create `data-sources.js` — a unified module that pulls real data from:

| Source | Data | API/Method |
|---|---|---|
| **OpenClaw Gateway** | Sessions, models, agents, channels | `ws://127.0.0.1:18789` HTTP endpoints |
| **OpenClaw CLI** | Session details, status, memory info | `openclaw status`, `openclaw sessions`, `openclaw gateway` |
| **Paperclip** | Agent status, tasks, team health | `http://127.0.0.1:3100/api/*` |
| **File System** | Memory files, org chart, briefs | `readDir`, file stats |
| **Server Runtime** | Uptime, memory, process info | Node.js `process` module |

**Design rules:**
- Each data source is independent — if one fails, others still work
- Cache results for 15 seconds to avoid hammering APIs
- Fallback to last-known-good if source is temporarily down
- All data is typed and validated

### Phase 2: Rewrite `dynamic-data.js`

Replace the entire file with a new implementation:

#### API Endpoints (all real data):

| Endpoint | Old Behavior | New Behavior |
|---|---|---|
| `GET /api/model` | Fake random names | Real model config from `openclaw.json` + active model from gateway |
| `GET /api/sessions` | Fake hardcoded data | Real sessions from `openclaw sessions` + Paperclip agent activity |
| `GET /api/crons` | Fake calculated dates | Real cron schedule from `cron-jobs.js` + actual last-run timestamps |
| `GET /api/lab` | Static fake JSON | Real server metrics, build status from actual process health |
| `GET /api/dashboard` | New endpoint | Combined health: agents + models + sessions + paperclip agents |
| `GET /api/memory` | New endpoint | Latest memory files, key entries from MEMORY.md |
| `GET /api/org-chart` | Static file | Keep as-is (it reads from file, already works) |

#### Key changes:

```
OLD: Math.random() for everything
NEW: Real API calls → Cache 15s → Serve JSON
```

**Caching strategy:**
```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ Data Source │ ──► │ LRU Cache    │ ──► │ API Response│
│ (OpenClaw)  │     │ (15s TTL)    │     │ (JSON)      │
│ (Paperclip) │ ──► │              │     │             │
│ (FS)        │     │ Fallback:    │     │             │
└─────────────┘     │ last-known   │     └─────────────┘
                    │ good         │
                    └──────────────┘
```

### Phase 3: Frontend Updates (Minimal)

- No redesign — keep all CSS/HTML intact
- Update JS render functions to handle real data shapes
- Add "loading" states and "offline" indicators
- Auto-refresh every 30 seconds via existing `dynamic-data.js` polling pattern

## Implementation Breakdown

### 1. `data-sources.js` (new file)
- `getOpenClawSessions()` → Parse sessions from CLI/FS
- `getOpenClawModels()` → Parse model config from `openclaw.json`
- `getOpenClawGatewayStatus()` → Check gateway health
- `getPaperclipAgents()` → Fetch from Paperclip API
- `getPaperclipTasks()` → Fetch open/in-progress/done counts
- `getServerMetrics()` → Uptime, memory, load
- `getFilesystemMetrics()` → Memory file count/size, last modified

### 2. `dynamic-data.js` (rewritten)
- Delete all `Math.random()` code
- Replace with calls to `data-sources.js`
- Add 15-second LRU cache
- Keep same export interface so existing `server.js` works without changes
- Add WebSocket SSE for live updates (bonus)

### 3. Frontend updates (incremental)
- Test each endpoint with real data
- Fix any rendering breaks
- Add loading/offline states

## Files to Touch

| File | Action | Agent |
|---|---|---|
| `data-sources.js` | CREATE | Agent 1 |
| `dynamic-data.js` | REWRITE | Agent 2 |
| `index.html` / `app.js` / `neo-executive.js` | UPDATE (render fixes) | Agent 3 |

## Success Criteria

1. `/api/model` returns real model names from config
2. `/api/sessions` returns actual OpenClaw sessions
3. `/api/crons` shows real last-run times from actual cron execution
4. `/api/lab` shows real server uptime and memory
5. Dashboard auto-refreshes every 30s with changing data
6. No `Math.random()` in data layer
7. If Paperclip is down, graceful fallback (no blank dashboard)

## Timeline

- **Agent 1**: `data-sources.js` — 30 min
- **Agent 2**: Rewrite `dynamic-data.js` — 45 min
- **Agent 3**: Frontend rendering updates — 30 min
- **Total**: ~2 hours
