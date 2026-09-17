import { useStore } from '@/lib/store';
import { CheckCircle2, XCircle, AlertTriangle, Loader2, ArrowDown } from 'lucide-react';

export function AttackSequence() {
  const state = useStore();
  const steps = state.simSteps;

  if (steps.length === 0) {
    return (
      <div className="glass rounded-2xl p-6">
        <h3 className="panel-title mb-2">Attack Sequence</h3>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-bg-elevated border border-line flex items-center justify-center mb-3">
            <AlertTriangle size={20} className="text-ink-muted" />
          </div>
          <div className="text-sm text-ink-gray font-medium">No simulation running</div>
          <div className="text-xs text-ink-muted mt-1">Run an attack to see the step-by-step sequence</div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="panel-title">Attack Sequence</h3>
          <p className="text-xs text-ink-muted mt-0.5">{state.mode === 'VULNERABLE' ? 'Vulnerable runtime — no enforcement' : 'Protected runtime — GuardAgent active'}</p>
        </div>
        <div className="text-[10px] font-mono text-ink-muted">
          {steps.length} / 6 STEPS
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="h-1.5 rounded-full bg-bg-secondary overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              state.mode === 'VULNERABLE' ? 'bg-gradient-to-r from-threat to-threat-bright' : 'bg-gradient-to-r from-accent-cyan to-ok'
            }`}
            style={{ width: `${steps[steps.length - 1]?.progress ?? 0}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5 text-[10px] font-mono text-ink-muted">
          <span>{steps[steps.length - 1]?.progress ?? 0}%</span>
          <span>{state.runStatus}</span>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-1.5">
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1;
          const isRunning = isLast && state.runStatus === 'RUNNING';
          const isThreat = step.threatLevel === 'threat';
          const isSafe = step.threatLevel === 'safe';
          const isWarn = step.threatLevel === 'warn';

          const Icon = isThreat ? (step.progress === 100 && state.mode === 'VULNERABLE' ? XCircle : AlertTriangle)
            : isSafe ? (step.progress === 100 ? CheckCircle2 : AlertTriangle)
            : AlertTriangle;
          const color = isRunning ? 'text-accent-cyan'
            : isThreat ? (state.mode === 'VULNERABLE' ? 'text-threat-bright' : 'text-ok-bright')
            : isSafe ? 'text-ok-bright'
            : 'text-warn-bright';
          const bg = isRunning ? 'bg-accent-cyan/5 border-accent-cyan/20'
            : isThreat ? (state.mode === 'VULNERABLE' ? 'bg-threat/5 border-threat/20' : 'bg-ok/5 border-ok/20')
            : isSafe ? 'bg-ok/5 border-ok/20'
            : 'bg-warn/5 border-warn/20';

          return (
            <div key={step.id} className="animate-slide-in">
              <div className={`flex items-center gap-3 p-3 rounded-lg border ${bg} ${isRunning ? 'animate-glow-pulse' : ''}`}>
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-bg-elevated shrink-0">
                  {isRunning ? <Loader2 size={16} className="animate-spin text-accent-cyan" /> : <Icon size={16} className={color} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-semibold ${color}`}>{step.label}</div>
                  <div className="text-xs text-ink-muted">{step.detail}</div>
                </div>
                <div className="text-[10px] font-mono text-ink-muted">{step.progress}%</div>
              </div>
              {i < steps.length - 1 && (
                <div className="flex justify-center py-0.5">
                  <ArrowDown size={12} className="text-ink-dim" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
