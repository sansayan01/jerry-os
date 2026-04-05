# MEMORY.md - Long-Term Memory

## Active Projects

### AXIOM PRO Enterprise Transformation
**Status:** In Progress (Backend + Frontend Structure Complete)
**Started:** 2026-03-24
**Target:** D:\Sayan\Projects\todo

**What it is:** Transforming a single-file HTML todo app into a multi-tenant SaaS enterprise application.

**Tech Stack:**
- Backend: Node.js + Express + Prisma + PostgreSQL + Redis
- Frontend: React + TypeScript + Tailwind + Zustand
- Real-time: Socket.io
- Auth: JWT + Google/Microsoft OAuth

**Completed:**
- Backend structure: Express server, Prisma schema, auth middleware, API routes
- Frontend structure: React contexts (Auth, Socket), hooks, services, components, pages
- Integration testing: Backend and frontend running, database created

**Pending:**
- JWT authentication system
- OAuth integration (Google/Microsoft)
- WebSocket real-time sync
- Admin dashboard
- Documentation

**Key Learnings:**
- Task orchestrator pattern works well for parallel development phases
- Checkpoint system helps track progress across sessions
- Provider duplication bug in main.tsx was fixed (2026-03-27)

**Last Updated:** 2026-03-28

---

## Jerry-OS System
**Status:** Operational
**Ports:** Production (8980), Staging (8981)

**Cron Jobs:**
- 00:00 - OS Documentation Update
- 02:00 - GitHub Backup
- 03:00 - Self-Improvement Build (GLM5)
- 06:00 - Daily Brief

**Agent Hierarchy:** 4 primary chiefs + 10 sub-agents under Jerry

---

## Key Decisions

1. **Task Orchestration Pattern (2026-03-26)**
   - Use checkpoint.json for tracking current step
   - Use task-orchestrator.json for phases and agents
   - Parallel checkpoints when no file overlap
   - Max 3 parallel agents

2. **Memory System (2026-03-28)**
   - Daily notes in memory/YYYY-MM-DD.md
   - Curated learnings in MEMORY.md
   - Update every few days during heartbeats

---

## Preferences

- Sayan's timezone: Asia/Calcutta (GMT+5:30)
- Preferred editor: VS Code
- Delegation model: Jerry orchestrates, agents execute
- Communication: Surface-only updates, proactive but sparse
