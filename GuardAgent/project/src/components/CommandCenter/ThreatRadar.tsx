import { Shield, Users, KeyRound, Database, Network, Terminal, Trash2, Send, Globe, Lock } from 'lucide-react';
import { useStore } from '@/lib/store';
import type { Capability } from '@/lib/types';
import { CAPABILITY_LABELS } from '@/lib/policy';

interface RadarNode {
  id: string;
  label: string;
  capability: Capability;
  icon: typeof Shield;
  angle: number;
}

const RADAR_NODES: RadarNode[] = [
  { id: 'public', label: 'PUBLIC', capability: 'PUBLIC_READ', icon: Globe, angle: 0 },
  { id: 'crm', label: 'CRM', capability: 'CRM_READ', icon: Users, angle: 45 },
  { id: 'crm-s', label: 'CRM SENS', capability: 'CRM_SENSITIVE_READ', icon: Lock, angle: 90 },
  { id: 'files', label: 'FILES', capability: 'FILE_READ', icon: KeyRound, angle: 135 },
  { id: 'secrets', label: 'SECRETS', capability: 'SECRET_READ', icon: KeyRound, angle: 180 },
  { id: 'db', label: 'DATABASE', capability: 'DATABASE_WRITE', icon: Database, angle: 225 },
  { id: 'destruct', label: 'DELETE', capability: 'DESTRUCTIVE_WRITE', icon: Trash2, angle: 270 },
  { id: 'net', label: 'NETWORK', capability: 'NETWORK_REQUEST', icon: Network, angle: 315 },
];

export function ThreatRadar() {
  const state = useStore();

  // Find which capability is currently being intercepted
  const activeCapability = state.lastDecision?.capability;
  const isBlocked = state.lastDecision?.decision === 'DENY';

  const radius = 38; // percentage from center

  return (
    <div className="glass rounded-2xl p-4 sm:p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="panel-title">Threat Radar</h3>
          <p className="text-xs text-ink-muted mt-0.5">Capability interception map</p>
        </div>
        {activeCapability && (
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-mono font-semibold ${isBlocked ? 'bg-threat/20 text-threat-bright' : 'bg-ok/20 text-ok-bright'}`}>
            <span className="status-dot animate-pulse" />
            {isBlocked ? 'BLOCKED' : 'ALLOWED'}
          </div>
        )}
      </div>

      <div className="relative aspect-square max-w-[320px] mx-auto">
        {/* Radar rings */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          {[20, 35, 50].map(r => (
            <circle key={r} cx="50" cy="50" r={r} fill="none" stroke="#1E293B" strokeWidth="0.3" />
          ))}
          {/* Cross lines */}
          <line x1="50" y1="0" x2="50" y2="100" stroke="#1E293B" strokeWidth="0.2" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="#1E293B" strokeWidth="0.2" />
          <line x1="14" y1="14" x2="86" y2="86" stroke="#1E293B" strokeWidth="0.2" />
          <line x1="86" y1="14" x2="14" y2="86" stroke="#1E293B" strokeWidth="0.2" />

          {/* Sweep */}
          {state.runStatus === 'RUNNING' && (
            <g className="animate-spin-slow" style={{ transformOrigin: 'center' }}>
              <defs>
                <linearGradient id="sweepGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22D3EE" stopOpacity="0" />
                  <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              <path d="M 50 50 L 50 0 A 50 50 0 0 1 85 15 Z" fill="url(#sweepGrad)" />
            </g>
          )}

          {/* Threat lines to center */}
          {activeCapability && RADAR_NODES.filter(n => n.capability === activeCapability).map(node => {
            const x = 50 + Math.cos((node.angle - 90) * Math.PI / 180) * radius;
            const y = 50 + Math.sin((node.angle - 90) * Math.PI / 180) * radius;
            return (
              <line
                key={node.id}
                x1={x} y1={y} x2="50" y2="50"
                stroke={isBlocked ? '#EF4444' : '#22D3EE'}
                strokeWidth="0.8"
                strokeDasharray="2 1.5"
                className="animate-dash-flow"
                opacity={0.8}
              />
            );
          })}
        </svg>

        {/* Center: GuardAgent */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className={`relative flex items-center justify-center w-12 h-12 rounded-full bg-bg-elevated border-2 ${
            state.runStatus === 'RUNNING' ? 'border-accent-cyan shadow-[0_0_20px_rgba(34,211,238,0.4)]' : 'border-line'
          }`}>
            <Shield size={22} className={state.runStatus === 'RUNNING' ? 'text-accent-cyan' : 'text-ink-muted'} />
            {state.runStatus === 'RUNNING' && (
              <div className="absolute inset-0 rounded-full border-2 border-accent-cyan/40 animate-pulse-ring" />
            )}
          </div>
        </div>

        {/* Capability nodes */}
        {RADAR_NODES.map(node => {
          const Icon = node.icon;
          const x = 50 + Math.cos((node.angle - 90) * Math.PI / 180) * radius;
          const y = 50 + Math.sin((node.angle - 90) * Math.PI / 180) * radius;
          const isActive = activeCapability === node.capability;
          const isDanger = isActive && isBlocked;

          return (
            <div
              key={node.id}
              className="absolute z-5"
              style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div className={`flex flex-col items-center gap-0.5 transition-all duration-300`}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${
                  isDanger
                    ? 'bg-threat/20 border-threat/50 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-threat-pulse'
                    : isActive
                      ? 'bg-accent-cyan/10 border-accent-cyan/40 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                      : 'bg-bg-elevated border-line'
                }`}>
                  <Icon size={14} className={isDanger ? 'text-threat-bright' : isActive ? 'text-accent-cyan' : 'text-ink-muted'} />
                </div>
                <span className={`text-[7px] font-mono font-semibold tracking-wider ${
                  isDanger ? 'text-threat-bright' : isActive ? 'text-accent-cyan' : 'text-ink-muted'
                }`}>
                  {node.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active capability detail */}
      {activeCapability && (
        <div className="mt-4 pt-3 border-t border-line/50 text-center">
          <div className="text-[10px] font-mono text-ink-muted uppercase tracking-wider">Active Capability</div>
          <div className={`text-sm font-mono font-semibold mt-1 ${isBlocked ? 'text-threat-bright' : 'text-ok-bright'}`}>
            {CAPABILITY_LABELS[activeCapability]}
          </div>
        </div>
      )}
    </div>
  );
}
