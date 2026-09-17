import { useStore } from '@/lib/store';
import { CAPABILITY_LABELS, evaluatePolicy, CAPABILITY_ICONS } from '@/lib/policy';
import type { Capability, Decision, TaintState } from '@/lib/types';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { SecurityDecision } from './SecurityDecision';

const CAPABILITIES: Capability[] = [
  'PUBLIC_READ', 'CRM_READ', 'CRM_SENSITIVE_READ', 'FILE_READ',
  'SECRET_READ', 'DATABASE_WRITE', 'DESTRUCTIVE_WRITE',
  'NETWORK_REQUEST', 'DATA_EXFILTRATION', 'CODE_EXECUTION',
];

function getDecisionColor(d: Decision): string {
  return d === 'ALLOW' ? 'text-ok-bright border-ok/30 bg-ok/5'
    : d === 'DENY' ? 'text-threat-bright border-threat/30 bg-threat/5'
    : 'text-warn-bright border-warn/30 bg-warn/5';
}

function getDecisionDot(d: Decision): string {
  return d === 'ALLOW' ? 'bg-ok' : d === 'DENY' ? 'bg-threat' : 'bg-warn';
}

export function PolicyEngine() {
  const state = useStore();
  const [selected, setSelected] = useState<Capability | null>(null);

  const taint = state.taint;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass rounded-2xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="panel-title">Policy Engine</h3>
            <p className="text-sm text-ink-gray mt-1">Deterministic authorization at runtime</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-elevated border border-line">
            <span className="text-[10px] font-mono text-ink-muted uppercase">Current Taint</span>
            <span className={`text-xs font-mono font-semibold ${
              taint === 'CLEAN' ? 'text-ok-bright' : taint === 'HIGH_RISK' ? 'text-threat-bright' : 'text-warn-bright'
            }`}>{taint}</span>
          </div>
        </div>
        <p className="text-xs text-ink-muted mt-2">
          Click any capability to see the policy decision for the current taint state.
          The LLM proposes tool calls — the runtime decides if they execute.
        </p>
      </div>

      {/* Capability grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {CAPABILITIES.map(cap => {
          const { decision } = evaluatePolicy(cap, taint);
          const Icon = (Icons as unknown as Record<string, LucideIcon>)[CAPABILITY_ICONS[cap]] ?? Icons.Shield;
          const isSelected = selected === cap;

          return (
            <button
              key={cap}
              onClick={() => setSelected(cap)}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 text-left ${getDecisionColor(decision)} ${
                isSelected ? 'ring-2 ring-accent-cyan/40 scale-105' : 'hover:scale-105'
              }`}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-bg-elevated">
                <Icon size={18} className="text-ink-white" />
              </div>
              <div className="text-center">
                <div className="text-xs font-mono font-semibold text-ink-white">{CAPABILITY_LABELS[cap]}</div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`status-dot ${getDecisionDot(decision)}`} />
                <span className={`text-[10px] font-mono font-bold ${getDecisionColor(decision).split(' ')[0]}`}>{decision}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail panel */}
      {selected && (
        <SecurityDecision
          capability={selected}
          taint={taint}
          onClose={() => setSelected(null)}
        />
      )}

      {/* Policy legend */}
      <div className="glass rounded-xl p-4">
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="status-dot bg-ok" />
            <span className="font-mono text-ok-bright">ALLOW</span>
            <span className="text-ink-muted">— Policy permits execution</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="status-dot bg-warn" />
            <span className="font-mono text-warn-bright">REQUIRE APPROVAL</span>
            <span className="text-ink-muted">— Human must authorize</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="status-dot bg-threat" />
            <span className="font-mono text-threat-bright">DENY</span>
            <span className="text-ink-muted">— Blocked before execution</span>
          </div>
        </div>
      </div>
    </div>
  );
}
