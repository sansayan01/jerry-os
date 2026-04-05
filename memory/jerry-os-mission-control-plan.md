# Jerry OS Mission Control — Feature Plan

## Video Inspiration: "Build an AI-Powered Agency Dashboard (Openclaw Bootcamp Ep1)"
- Channel: Clearmud
- Link: https://www.youtube.com/live/jf9D4Oh7RwI

## Features to Implement

### 1. Active Agents Dashboard
- Real-time agent status (online/offline/error)
- Agent cards with role, model, tasks, memory
- Click to view agent details
- Visual hierarchy (Jerry → Chiefs → Sub-agents)

### 2. Client Management
- Client profiles (name, avatar, contact info)
- Active projects per client
- Client-specific dashboards
- Per-client agent assignment

### 3. Task Management System
- Open/in-progress/done task counters
- Task feed (recent activity)
- Priority levels (critical/high/medium/low)
- Assign tasks to specific agents

### 4. Memory System Visualization
- Per-agent memory files
- Shared memory
- Memory health indicator
- Search across memories

### 5. Communication Hub
- Inter-agent messaging
- Agent-to-human communication
- Notifications and alerts

### 6. Performance Metrics
- Token usage per agent
- Response time tracking
- Cost tracking per agent/client
- Uptime monitoring

### 7. Project Board
- Kanban view (Todo/In Progress/Done)
- Project milestones
- Timeline/Gantt visualization

### 8. Real-Time Activity Feed
- Live event log
- Agent actions (start/complete/error)
- Filter by agent/action type

### 9. Voice Briefs (TTS)
- Daily standup summary
- Agent status spoken aloud
- Emergency alerts via voice

### 10. Chief of Staff Layer
- 3 AI chiefs managing sub-agents
- Each chief has their own dashboard
- Cross-chief visibility

## Current Status
- Basic dashboard exists (port 8980)
- Dynamic data works (all 6 endpoints)
- Org chart is dynamic (pulls from Paperclip)
- No client management yet
- No task board yet
- No voice briefs yet
- No memory dashboard visual
- No activity feed
