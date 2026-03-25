# HEARTBEAT.md

## ⚠️ FIRST: Check Resume Protocol

**Before anything else:**
1. Read `memory/checkpoint.json`
2. If active task exists with `currentStep.status != "completed"`:
   - **RESUME IMMEDIATELY** — execute `nextAction`
   - Do NOT reply HEARTBEAT_OK, continue the work

## ⚠️ SECOND: Check Task Orchestration

**If large task in progress:**
1. Read `memory/task-orchestrator.json`
2. Check `activeAgents` array
3. If any agent has `status: "running"` for > 15 minutes:
   - Check agent status via `subagents list`
   - If stalled, re-spawn from last checkpoint
4. If all checkpoints in a phase complete:
   - Move to next phase
   - Update orchestrator file

## Heartbeat Checklist

If no task to resume, check these (rotate through):

- [ ] Any blockers in checkpoint that need user input?
- [ ] Active task progress — update checkpoint if needed
- [ ] Task orchestration — check agent status, re-spawn if needed
- [ ] Memory maintenance (every few days)

## When to Stay Quiet (HEARTBEAT_OK)

- No active task OR task is completed
- No blockers needing user input
- Nothing urgent to report
- Late night hours (23:00-08:00)

## Remember

**Work is continuous. Sessions are not.**
If checkpoint shows work in progress → CONTINUE IT.
If orchestrator shows agents running → TRACK THEM.
