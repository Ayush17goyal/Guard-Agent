import { useStore } from '@/lib/store';
import type { AuditEvent } from '@/lib/types';
import { useState } from 'react';
import { EventInspector } from './EventInspector';
import { Shield, Bot, Globe, Filter, Tag, CheckCircle2, XCircle, AlertCircle, Send, FileText, Play, Activity, Zap, Ban } from 'lucide-react';

const EVENT_ICONS: Record<string, typeof Shield> = {
  AGENT_INIT: Bot,
  EXTERNAL_READ: Globe,
  TAINT_CHANGED: Filter,
  TOOL_REQUESTED: Play,
  CAPABILITY_LOOKUP: Tag,
  TAINT_CHECK: Filter,
  POLICY_EVALUATED: Shield,
  APPROVAL_REQUIRED: AlertCircle,
  APPROVAL_GRANTED: CheckCircle2,
  APPROVAL_DENIED: XCircle,
  TOOL_BLOCKED: Ban,
  TOOL_ALLOWED: CheckCircle2,
  EXFILTRATION_BLOCKED: Shield,
  EXFILTRATION_SUCCESS: Send,
  ATTACK_COMPLETED: Zap,
  SYSTEM_READY: Activity,
  INTERCEPTOR_ACTIVE: Shield,
};

const SEVERITY_COLORS: Record<string, string> = {
  info: 'text-accent-cyan',
  warn: 'text-warn-bright',
  threat: 'text-threat-bright',
  ok: 'text-ok-bright',
};

const SEVERITY_DOT: Record<string, string> = {
  info: 'bg-accent-cyan',
  warn: 'bg-warn',
  threat: 'bg-threat',
  ok: 'bg-ok',
};

function formatTime(ts: number): string {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
}

export function EventStream({ compact = false }: { compact?: boolean }) {
  const state = useStore();
  const [selected, setSelected] = useState<AuditEvent | null>(null);

  return (
    <div className="glass rounded-2xl p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="panel-title">Security Event Stream</h3>
          <p className="text-xs text-ink-muted mt-0.5">Live audit trail — {state.events.length} events</p>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-bg-elevated text-[10px] font-mono text-ink-muted">
          <span className={`status-dot ${state.runStatus === 'RUNNING' ? 'bg-accent-cyan animate-pulse' : 'bg-ink-dim'}`} />
          {state.runStatus === 'RUNNING' ? 'LIVE' : 'IDLE'}
        </div>
      </div>

      {state.events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 rounded-full bg-bg-elevated border border-line flex items-center justify-center mb-3">
            <Activity size={20} className="text-ink-muted" />
          </div>
          <div className="text-sm text-ink-gray font-medium">SYSTEM READY</div>
          <div className="text-xs text-ink-muted mt-1">Waiting for agent activity...</div>
        </div>
      ) : (
        <div className={`space-y-1 overflow-y-auto ${compact ? 'max-h-64' : 'max-h-96'}`}>
          {state.events.map(evt => {
            const Icon = EVENT_ICONS[evt.type] ?? Activity;
            const isSelected = selected?.id === evt.id;
            return (
              <button
                key={evt.id}
                onClick={() => setSelected(evt)}
                className={`w-full flex items-start gap-2.5 p-2.5 rounded-lg text-left transition-all animate-slide-in ${
                  isSelected ? 'bg-accent-cyan/5 border border-accent-cyan/20' : 'hover:bg-bg-elevated border border-transparent'
                }`}
              >
                <span className="text-[10px] font-mono text-ink-muted mt-0.5 shrink-0 w-14">{formatTime(evt.timestamp)}</span>
                <div className={`flex items-center justify-center w-6 h-6 rounded shrink-0 ${SEVERITY_COLORS[evt.severity]}`}>
                  <Icon size={13} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono font-medium text-ink-white">{evt.message}</div>
                  {evt.detail && (
                    <div className="text-[10px] font-mono text-ink-muted truncate">{evt.detail}</div>
                  )}
                </div>
                <span className={`status-dot mt-1.5 shrink-0 ${SEVERITY_DOT[evt.severity]}`} />
              </button>
            );
          })}
        </div>
      )}

      {selected && (
        <EventInspector event={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
