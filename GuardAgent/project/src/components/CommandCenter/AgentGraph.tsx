import { User, Bot, Globe, Filter, Shield, Database, KeyRound, Send, Server, Lock } from 'lucide-react';
import { useStore } from '@/lib/store';
import type { Capability } from '@/lib/types';

interface GraphNode {
  id: string;
  label: string;
  icon: typeof User;
  x: number;
  y: number;
  category: 'source' | 'process' | 'firewall' | 'tool' | 'sink';
}

const NODES: GraphNode[] = [
  { id: 'user', label: 'USER', icon: User, x: 50, y: 8, category: 'source' },
  { id: 'agent', label: 'AI AGENT', icon: Bot, x: 50, y: 24, category: 'process' },
  { id: 'external', label: 'EXTERNAL CONTENT', icon: Globe, x: 50, y: 40, category: 'process' },
  { id: 'taint', label: 'TAINT ENGINE', icon: Filter, x: 50, y: 56, category: 'process' },
  { id: 'firewall', label: 'GUARDAGENT', icon: Shield, x: 50, y: 72, category: 'firewall' },
  { id: 'crm', label: 'CRM', icon: Database, x: 20, y: 90, category: 'tool' },
  { id: 'secrets', label: 'SECRETS', icon: KeyRound, x: 38, y: 90, category: 'tool' },
  { id: 'db', label: 'DATABASE', icon: Server, x: 56, y: 90, category: 'tool' },
  { id: 'network', label: 'NETWORK', icon: Send, x: 74, y: 90, category: 'tool' },
  { id: 'attacker', label: 'ATTACKER', icon: Lock, x: 88, y: 90, category: 'sink' },
];

const EDGES: [string, string][] = [
  ['user', 'agent'],
  ['agent', 'external'],
  ['external', 'taint'],
  ['taint', 'firewall'],
  ['firewall', 'crm'],
  ['firewall', 'secrets'],
  ['firewall', 'db'],
  ['firewall', 'network'],
  ['firewall', 'attacker'],
];

const NODE_COLORS: Record<GraphNode['category'], { bg: string; border: string; text: string; icon: string }> = {
  source: { bg: 'bg-bg-elevated', border: 'border-line', text: 'text-ink-white', icon: 'text-ink-gray' },
  process: { bg: 'bg-bg-elevated', border: 'border-line-bright', text: 'text-ink-white', icon: 'text-accent-cyan' },
  firewall: { bg: 'bg-accent-cyan/10', border: 'border-accent-cyan/40', text: 'text-accent-cyan', icon: 'text-accent-cyan' },
  tool: { bg: 'bg-bg-elevated', border: 'border-line', text: 'text-ink-gray', icon: 'text-ink-muted' },
  sink: { bg: 'bg-threat/5', border: 'border-threat/20', text: 'text-threat-bright', icon: 'text-threat-bright' },
};

export function AgentGraph() {
  const state = useStore();

  // Determine which nodes are active
  const isActive = (id: string): boolean => {
    if (state.runStatus === 'IDLE') return id === 'user' || id === 'agent';
    if (state.mode === 'VULNERABLE') {
      if (state.runStatus === 'COMPLETED') return true; // all active (data leaked)
      return ['user', 'agent', 'external', 'taint'].includes(id);
    }
    // Protected
    if (state.runStatus === 'RUNNING') return ['user', 'agent', 'external', 'taint', 'firewall'].includes(id);
    if (state.runStatus === 'COMPLETED') return ['user', 'agent', 'external', 'taint', 'firewall'].includes(id);
    return ['user', 'agent'].includes(id);
  };

  const isBlocked = (id: string): boolean => {
    if (state.mode === 'PROTECTED' && state.runStatus === 'COMPLETED') {
      return ['crm', 'secrets', 'db', 'network', 'attacker'].includes(id);
    }
    return false;
  };

  const isPathBlocked = (from: string, to: string): boolean => {
    if (state.mode === 'PROTECTED' && state.runStatus === 'COMPLETED' && from === 'firewall') return true;
    return false;
  };

  const isPathActive = (from: string, to: string): boolean => {
    if (state.runStatus === 'IDLE') return false;
    if (state.mode === 'VULNERABLE' && state.runStatus === 'COMPLETED') return true;
    // Protected: flow reaches firewall but not beyond
    if (state.mode === 'PROTECTED') {
      const order = ['user', 'agent', 'external', 'taint', 'firewall'];
      const fi = order.indexOf(from);
      const ti = order.indexOf(to);
      if (fi >= 0 && ti >= 0) return true;
      return false;
    }
    return isActive(from) && isActive(to);
  };

  const getNodeById = (id: string) => NODES.find(n => n.id === id)!;

  return (
    <div className="glass rounded-2xl p-4 sm:p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="panel-title">Agent Security Flow</h3>
          <p className="text-xs text-ink-muted mt-0.5">Request path through the runtime firewall</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="flex items-center gap-1 text-ok-bright"><span className="status-dot bg-ok" /> ACTIVE</span>
          <span className="flex items-center gap-1 text-threat-bright"><span className="status-dot bg-threat" /> BLOCKED</span>
        </div>
      </div>

      <div className="relative aspect-[4/5] sm:aspect-[5/4] max-h-[500px]">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          {/* Edges */}
          {EDGES.map(([from, to]) => {
            const f = getNodeById(from);
            const t = getNodeById(to);
            const active = isPathActive(from, to);
            const blocked = isPathBlocked(from, to);
            const color = blocked ? '#EF4444' : active ? '#22D3EE' : '#1E293B';
            return (
              <g key={`${from}-${to}`}>
                <line
                  x1={f.x} y1={f.y} x2={t.x} y2={t.y}
                  stroke={color}
                  strokeWidth={active ? 0.6 : 0.3}
                  strokeOpacity={active ? 0.6 : 0.3}
                  strokeDasharray={active ? '0' : '1 1'}
                />
                {active && !blocked && (
                  <line
                    x1={f.x} y1={f.y} x2={t.x} y2={t.y}
                    stroke="#22D3EE"
                    strokeWidth={0.4}
                    strokeDasharray="2 3"
                    className="animate-dash-flow"
                    opacity={0.8}
                  />
                )}
                {blocked && (
                  <line
                    x1={f.x} y1={f.y} x2={t.x} y2={t.y}
                    stroke="#EF4444"
                    strokeWidth={0.4}
                    strokeDasharray="1 1"
                    opacity={0.4}
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Nodes */}
        {NODES.map(node => {
          const Icon = node.icon;
          const active = isActive(node.id);
          const blocked = isBlocked(node.id);
          const colors = NODE_COLORS[node.category];
          const isFirewall = node.category === 'firewall';

          return (
            <div
              key={node.id}
              className={`absolute flex flex-col items-center gap-1 transition-all duration-500`}
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div
                className={`
                  relative flex items-center justify-center rounded-xl border-2 transition-all duration-300
                  ${active ? `${colors.bg} ${colors.border}` : 'bg-bg-secondary border-line opacity-40'}
                  ${isFirewall && active ? 'shadow-[0_0_30px_rgba(34,211,238,0.3)]' : ''}
                  ${blocked ? 'border-threat/50 opacity-50' : ''}
                  ${isFirewall ? 'w-14 h-14 sm:w-16 sm:h-16' : 'w-10 h-10 sm:w-12 sm:h-12'}
                `}
              >
                <Icon
                  size={isFirewall ? 28 : 18}
                  className={active ? colors.icon : 'text-ink-dim'}
                  strokeWidth={2}
                />
                {isFirewall && active && state.runStatus === 'RUNNING' && (
                  <div className="absolute inset-0 rounded-xl border-2 border-accent-cyan/40 animate-pulse-ring" />
                )}
                {blocked && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-threat flex items-center justify-center">
                    <span className="text-[8px] font-bold text-white">✕</span>
                  </div>
                )}
              </div>
              <span className={`text-[8px] sm:text-[9px] font-mono font-semibold tracking-wider ${active ? colors.text : 'text-ink-dim'} whitespace-nowrap`}>
                {node.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Flow legend */}
      <div className="mt-4 pt-3 border-t border-line/50 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-mono text-ink-muted">
        <span>USER → AGENT → CONTENT → TAINT → FIREWALL → TOOL</span>
      </div>
    </div>
  );
}
