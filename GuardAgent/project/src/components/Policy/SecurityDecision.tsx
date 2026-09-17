import { X, Shield, CheckCircle2, XCircle, AlertCircle, Code2 } from 'lucide-react';
import { CAPABILITY_LABELS, evaluatePolicy, CAPABILITY_ICONS } from '@/lib/policy';
import { useStore } from '@/lib/store';
import type { Capability, TaintState } from '@/lib/types';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export function SecurityDecision({
  capability,
  taint,
  onClose,
}: {
  capability: Capability;
  taint: TaintState;
  onClose: () => void;
}) {
  const state = useStore();
  const { decision, reason } = evaluatePolicy(capability, taint);
  const Icon = (Icons as unknown as Record<string, LucideIcon>)[CAPABILITY_ICONS[capability]] ?? Shield;

  // Find matching tool request if any
  const matchingRequest = state.toolRequests.find(r => r.capability === capability);

  const decisionConfig = {
    ALLOW: { icon: CheckCircle2, color: 'text-ok-bright', bg: 'bg-ok/5 border-ok/20', label: 'ALLOW' },
    DENY: { icon: XCircle, color: 'text-threat-bright', bg: 'bg-threat/5 border-threat/20', label: 'DENY' },
    REQUIRE_APPROVAL: { icon: AlertCircle, color: 'text-warn-bright', bg: 'bg-warn/5 border-warn/20', label: 'REQUIRE APPROVAL' },
  }[decision];

  const DecisionIcon = decisionConfig.icon;

  return (
    <div className="glass-elevated rounded-2xl p-5 animate-slide-up relative overflow-hidden">
      <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-lg text-ink-muted hover:text-ink-white hover:bg-bg-elevated transition-all" aria-label="Close">
        <X size={16} />
      </button>

      <div className="flex items-center gap-2 mb-4">
        <Shield size={16} className="text-accent-cyan" />
        <h4 className="text-sm font-semibold text-ink-white">Security Decision</h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Left: Decision details */}
        <div className="space-y-3">
          <div>
            <div className="text-[10px] font-mono text-ink-muted uppercase tracking-wider mb-1">Capability</div>
            <div className="flex items-center gap-2">
              <Icon size={16} className="text-ink-gray" />
              <span className="text-sm font-mono font-semibold text-ink-white">{CAPABILITY_LABELS[capability]}</span>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-mono text-ink-muted uppercase tracking-wider mb-1">Current Taint</div>
            <span className={`text-sm font-mono font-semibold ${
              taint === 'CLEAN' ? 'text-ok-bright' : taint === 'HIGH_RISK' ? 'text-threat-bright' : 'text-warn-bright'
            }`}>{taint}</span>
          </div>

          <div className={`p-3 rounded-lg border ${decisionConfig.bg}`}>
            <div className="text-[10px] font-mono text-ink-muted uppercase tracking-wider mb-1">Decision</div>
            <div className="flex items-center gap-2">
              <DecisionIcon size={20} className={decisionConfig.color} />
              <span className={`text-lg font-bold font-mono ${decisionConfig.color}`}>{decisionConfig.label}</span>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-mono text-ink-muted uppercase tracking-wider mb-1">Reason</div>
            <span className="text-sm font-mono text-ink-gray">{reason}</span>
          </div>

          <div>
            <div className="text-[10px] font-mono text-ink-muted uppercase tracking-wider mb-1">Execution</div>
            <span className={`text-sm font-mono font-semibold ${decision === 'ALLOW' ? 'text-ok-bright' : 'text-threat-bright'}`}>
              {decision === 'ALLOW' ? 'EXECUTED' : 'BLOCKED'}
            </span>
          </div>
        </div>

        {/* Right: Arguments / code viewer */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Code2 size={14} className="text-ink-muted" />
            <span className="text-[10px] font-mono text-ink-muted uppercase tracking-wider">Arguments</span>
          </div>
          <div className="rounded-lg bg-bg-primary border border-line p-3 overflow-x-auto">
            <pre className="text-xs font-mono text-ink-gray leading-relaxed">
              {matchingRequest
                ? JSON.stringify(matchingRequest.args, null, 2)
                : `{\n  "capability": "${capability}",\n  "taint": "${taint}",\n  "decision": "${decision}"\n}`}
            </pre>
          </div>

          {matchingRequest && (
            <div className="mt-3 flex items-center gap-2 text-[10px] font-mono text-ink-muted">
              <span>runId: {matchingRequest.runId.slice(0, 16)}...</span>
              <span>argsHash: {matchingRequest.argsHash}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
