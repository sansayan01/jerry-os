# Task Orchestrator Protocol

## Overview

Hybrid task orchestration system for Jerry. Uses parallel execution for independent checkpoints and sequential execution for dependent ones.

## When to Use

- Task requires > 5 files
- Task expected to take > 10 minutes
- Task has multiple independent components

## Workflow

### Step 1: Task Analysis

When receiving a large task:

1. Analyze task scope
2. Break into phases
3. Identify checkpoints within phases
4. Determine dependencies between checkpoints
5. Mark checkpoints as parallel or sequential

### Step 2: Phase Planning

For each phase, determine:

```
Phase: Auth System
├── Checkpoint 1.1: Auth middleware (independent) → Parallel
├── Checkpoint 1.2: JWT utilities (independent) → Parallel
└── Checkpoint 1.3: Auth routes (depends on 1.1, 1.2) → Sequential

Phase: API Routes
├── Checkpoint 2.1: User routes (independent of Auth phase) → Parallel (if phase 1 done)
├── Checkpoint 2.2: Task routes (independent) → Parallel
└── Checkpoint 2.3: Integration (depends on all above) → Sequential
```

### Step 3: Agent Spawning

For parallel checkpoints:
```json
{
  "phase": "auth-system",
  "parallel": true,
  "checkpoints": [
    {"id": "auth-middleware", "spawn": "agent-auth-mw"},
    {"id": "jwt-utils", "spawn": "agent-jwt"}
  ]
}
```

For sequential checkpoints:
```json
{
  "phase": "auth-integration",
  "parallel": false,
  "dependsOn": ["auth-system"],
  "checkpoints": [
    {"id": "auth-routes", "spawn": "agent-auth-routes", "after": ["auth-middleware", "jwt-utils"]}
  ]
}
```

### Step 4: Progress Tracking

After each checkpoint:
1. Update `memory/task-orchestrator.json`
2. Update `memory/checkpoint.json`
3. Log to `memory/YYYY-MM-DD.md`

Track:
- Which checkpoints complete
- Which agents finish
- Any failures or timeouts

### Step 5: Failure Recovery

If agent times out or fails:
1. Check `retryCount` for that checkpoint
2. If `retryCount < retryLimit`: Re-spawn agent
3. If `retryCount >= retryLimit`: Mark as failed, notify user
4. Continue with remaining checkpoints

### Step 6: Cleanup

After task completion:
1. Kill all spawned agents
2. Move agents to `completedAgents` array
3. Archive task to `memory/completed-tasks/`
4. Clear `currentTask`

## Dependency Rules

### Independent (Can Run Parallel)

- No file overlap
- No shared resources
- Different modules/features

Example:
- `auth.js` and `users.js` → Independent (different files)
- `middleware/auth.js` and `routes/auth.js` → Independent (different directories)

### Dependent (Must Run Sequential)

- Uses output from previous checkpoint
- Modifies same files
- Requires previous step to be complete

Example:
- `prisma schema` → `prisma generate` → Dependent
- `routes/users.js` → `tests/users.test.js` → Dependent

## Max Parallel Agents

Default: 3

Why? Too many parallel agents can:
- Overload context
- Cause file conflicts
- Make tracking harder

## Timeout Handling

- Default checkpoint timeout: 15 minutes
- Heartbeat check: Every 30 seconds
- If no heartbeat for 2 minutes: Mark as stalled, re-spawn

## Example: AXIOM PRO Backend

```
Task: Build AXIOM PRO Backend

Phase 1: Foundation (Sequential)
└── Checkpoint 1.1: Prisma schema
    → Spawn: agent-prisma
    → Status: Complete
    → Kill: agent-prisma

Phase 2: Core (Parallel)
├── Checkpoint 2.1: Auth middleware → agent-auth-mw (running)
├── Checkpoint 2.2: Error handling → agent-errors (running)
└── Checkpoint 2.3: Validation → agent-validate (running)
    → Track all, wait for completion

Phase 3: API Routes (Parallel after Phase 2)
├── Checkpoint 3.1: Auth routes → agent-auth-routes
├── Checkpoint 3.2: User routes → agent-user-routes
├── Checkpoint 3.3: Team routes → agent-team-routes
└── Checkpoint 3.4: Task routes → agent-task-routes
    → All independent, run parallel

Phase 4: Integration (Sequential)
└── Checkpoint 4.1: WebSocket integration
    → Depends on all above
    → Spawn: agent-ws
```

## Updating Checkpoints

After EVERY action:

```json
{
  "currentTask": {
    "id": "axiom-backend",
    "updatedAt": "2026-03-26T00:20:00+05:30"
  },
  "phases": [
    {
      "id": "phase-1",
      "status": "completed",
      "checkpoints": [
        {"id": "prisma", "status": "completed"}
      ]
    }
  ],
  "activeAgents": [
    {
      "agentId": "agent-auth-mw",
      "checkpointId": "auth-mw",
      "status": "running",
      "lastHeartbeat": "2026-03-26T00:20:00+05:30"
    }
  ]
}
```

## Summary

| Phase Type | Approach | Tracking |
|------------|----------|----------|
| Independent | Parallel | Track all simultaneously |
| Dependent | Sequential | Track one at a time |
| Mixed | Hybrid | Track groups |

**Key Principle:** Jerry orchestrates, agents execute. Progress is tracked at every step.
