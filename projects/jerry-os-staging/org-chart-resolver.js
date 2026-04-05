// Dynamic Org Chart Resolver
// Fetches real agent data from Paperclip API, merges with static structure
// Falls back to static org-chart.json if Paperclip is unavailable

const fetch = globalThis.fetch;

const PAPERCLIP_COMPANY = 'd42f9f5e-d5d3-42d0-bfb3-f3e2322d4fd4';
const PAPERCLIP_API = 'http://127.0.0.1:3100';

// Static org chart structure (fallback)
const STATIC_MAP = require('./data/org-chart.json');

/**
 * Fetch live agents from Paperclip API
 * Returns array of { name, role, status, lastHeartbeatAt, icon }
 */
async function getLiveAgents() {
    try {
        const res = await fetch(`${PAPERCLIP_API}/api/companies/${PAPERCLIP_COMPANY}/agents`, {
            signal: AbortSignal.timeout(5000)
        });
        if (!res.ok) return [];

        const json = await res.json();
        const agents = Array.isArray(json) ? json : (json.value || json.agents || []);

        return agents
            .filter(a => a && a.name && a.role !== 'deleted')
            .map(a => ({
                id: a.id || a.name.toLowerCase().replace(/\s+/g, '-'),
                name: a.name,
                role: (a.role || 'agent').toLowerCase(),
                status: a.status || 'unknown',
                lastHeartbeatAt: a.lastHeartbeatAt || null,
                model: a.model || null,
                heartbeatInterval: a.runtimeConfig?.heartbeat?.intervalSec || null
            }));
    } catch (err) {
        console.warn('[org-chart] Paperclip fetch failed:', err.message);
        return [];
    }
}

/**
 * Format a date string into a relative time like "2h ago"
 */
function formatTimeAgo(dateStr) {
    if (!dateStr) return 'Never';
    const then = new Date(dateStr).getTime();
    const now = Date.now();
    const diff = now - then;
    if (diff < 0) return 'Just now';
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
}

/**
 * Map a role string to the org chart display name
 */
function getRoleDisplay(role) {
    const roleMap = {
        'ceo': { name: 'CEO', icon: 'crown', dept: 'executive', color: '#eab308' },
        'general': { name: 'Executive Assistant', icon: 'bot', dept: 'executive', color: '#10b981' },
        'engineer': { name: 'Engineer', icon: 'code', dept: 'engineering', color: '#3b82f6' },
        'deleted': { name: 'Archived', icon: 'archive', dept: 'unknown', color: '#6b7280' }
    };
    return roleMap[role] || { name: role, icon: 'circle', dept: 'unknown', color: '#6b7280' };
}

/**
 * Build a dynamic org chart from live Paperclip agents
 * Groups by department (from role) with status indicators
 */
async function buildOrgChart() {
    const liveAgents = await getLiveAgents();

    // If Paperclip is unavailable, return static fallback
    if (liveAgents.length === 0) {
        console.log('[org-chart] Using static fallback (Paperclip unavailable)');
        return { source: 'static', ...STATIC_MAP };
    }

    // Group agents by department
    const departments = {};
    for (const agent of liveAgents) {
        const roleInfo = getRoleDisplay(agent.role);
        const dept = roleInfo.dept;

        if (!departments[dept]) {
            departments[dept] = {
                name: dept.charAt(0).toUpperCase() + dept.slice(1),
                agents: []
            };
        }

        departments[dept].agents.push({
            id: agent.id,
            name: agent.name,
            role: roleInfo.name,
            roleKey: agent.role,
            status: agent.status,
            icon: roleInfo.icon,
            statusColor: getStatusColor(agent.status),
            color: roleInfo.color,
            lastHeartbeatAt: agent.lastHeartbeatAt,
            model: agent.model,
            heartbeatInterval: agent.heartbeatInterval
        });
    }

    // Build hierarchy (CEO at top, then other depts)
    const hierarchy = [];
    const deptOrder = ['executive', 'engineering', 'unknown'];

    for (const deptName of deptOrder) {
        if (departments[deptName]) {
            hierarchy.push(departments[deptName]);
        }
    }
    // Any remaining departments
    for (const [deptName, dept] of Object.entries(departments)) {
        if (!deptOrder.includes(deptName)) {
            hierarchy.push(dept);
        }
    }

    // Stats
    const activeCount = liveAgents.filter(a => a.status === 'active' || a.status === 'running' || a.status === 'idle').length;
    const errorCount = liveAgents.filter(a => a.status === 'error').length;
    const pausedCount = liveAgents.filter(a => a.status === 'paused').length;

    // Map live agents into the frontend-expected structure
    const director = {
        id: 'director',
        name: 'Sayan',
        role: 'Founder, Rapid Crafters, Final authority on all decisions.',
        badge: 'The Human',
        icon: 'crown',
        model: 'qwen3.6-plus'
    };

    // Find Jerry as executive
    const jerryAgent = liveAgents.find(a => a.name.toLowerCase().includes('jerry'));
    const executive = {
        id: 'executive',
        name: jerryAgent ? jerryAgent.name : 'Jerry',
        role: 'Orchestration layer. Delegates to chiefs, manages crons, runs ops.',
        badge: 'Executive Assistant',
        icon: 'bot',
        status: jerryAgent ? jerryAgent.status.toUpperCase() : 'UNKNOWN',
        stats: [
            jerryAgent && jerryAgent.lastHeartbeatAt ? `Last HB: ${formatTimeAgo(jerryAgent.lastHeartbeatAt)}` : 'No heartbeat',
            '24/7 Monitoring'
        ],
        model: jerryAgent ? (jerryAgent.model || 'local') : 'qwen3.6-plus'
    };

    // Build agents array from CEO, CTO, and other non-Jerry agents
    const agentsData = liveAgents
        .filter(a => !a.name.toLowerCase().includes('jerry'))
        .map(a => {
            const roleInfo = getRoleDisplay(a.role);
            return {
                id: a.name.toLowerCase().replace(/\s+/g, '-'),
                name: a.name,
                role: roleInfo.name,
                description: `${a.role} agent`,
                icon: roleInfo.icon,
                status: a.status === 'error' ? 'ERROR' : a.status === 'running' ? 'ACTIVE' : a.status === 'idle' ? 'STANDBY' : 'PAUSED',
                subAgentsCount: 0,
                subAgents: [],
                activity: a.lastHeartbeatAt ? `Last heartbeat: ${formatTimeAgo(a.lastHeartbeatAt)}` : 'No heartbeat yet',
                model: a.model || 'qwen3.6-plus'
            };
        });

    return {
        source: 'live',
        updatedAt: new Date().toISOString(),
        director,
        executive,
        agents: agentsData,
        stats: {
            total: liveAgents.length,
            active: activeCount,
            error: errorCount,
            paused: pausedCount
        },
        // Also include departments for alternative views
        departments: hierarchy,
        agentsRaw: liveAgents
    };
}

function getStatusColor(status) {
    const colors = {
        'active': '#10b981',
        'idle': '#f59e0b',
        'running': '#10b981',
        'error': '#ef4444',
        'paused': '#6b7280',
        'unknown': '#6b7280'
    };
    return colors[status] || '#6b7280';
}

module.exports = { buildOrgChart, getLiveAgents };
