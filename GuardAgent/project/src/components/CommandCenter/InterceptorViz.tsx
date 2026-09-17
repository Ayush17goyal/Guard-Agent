import { Bot, Search, Tag, Filter, Shield, CheckCircle, FileText, Play } from 'lucide-react';
import { useStore } from '@/lib/store';

interface PipelineStep {
  id: string;
  label: string;
  icon: typeof Bot;
}

const STEPS: PipelineStep[] = [
  { id: 'request', label: 'LLM Request', icon: Bot },
  { id: 'validate', label: 'Validate', icon: Search },
  { id: 'capability', label: 'Capability Lookup', icon: Tag },
  { id: 'taint', label: 'Taint Check', icon: Filter },
  { id: 'policy', label: 'Policy Evaluation', icon: Shield },
  { id: 'approval', label: 'Approval Check', icon: CheckCircle },
  { id: 'audit', label: 'Audit', icon: FileText },
  { id: 'execute', label: 'Execute / Block', icon: Play },
];

export function InterceptorViz() {
  const state = useStore();

  // Map recent events to active steps
  const recentTypes = state.events.slice(0, 8).map(e => e.type);
  const activeStep = (() => {
    if (state.runStatus !== 'RUNNING') return -1;
    if (recentTypes.includes('TOOL_BLOCKED') || recentTypes.includes('TOOL_ALLOWED')) return 7;
    if (recentTypes.includes('APPROVAL_REQUIRED')) return 5;
    if (recentTypes.includes('POLICY_EVALUATED')) return 4;
    if (recentTypes.includes('TAINT_CHECK')) return 3;
    if (recentTypes.includes('CAPABILITY_LOOKUP')) return 2;
    if (recentTypes.includes('TOOL_REQUESTED')) return 1;
    return 0;
  })();

  const lastDecision = state.lastDecision;

  return (
    <div className="glass rounded-2xl p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="panel-title">Runtime Interceptor</h3>
          <p className="text-xs text-ink-muted mt-0.5">Mandatory security choke point</p>
        </div>
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-mono font-semibold ${
          state.interceptorActive ? 'bg-accent-cyan/10 text-accent-cyan' : 'bg-bg-elevated text-ink-muted'
        }`}>
          <span className={`status-dot ${state.interceptorActive ? 'bg-accent-cyan animate-pulse' : 'bg-ink-dim'}`} />
          {state.interceptorActive ? 'ACTIVE' : 'STANDBY'}
        </div>
      </div>

      {/* Pipeline */}
      <div className="flex flex-col gap-1">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isActive = i === activeStep;
          const isPassed = activeStep > i;
          const isBlocked = (step.id === 'execute' && state.lastDecision?.decision === 'DENY');
          const isAllowed = (step.id === 'execute' && state.lastDecision?.decision === 'ALLOW');

          return (
            <div key={step.id} className="flex items-center gap-2">
              {/* Step node */}
              <div className={`
                relative flex items-center justify-center w-10 h-10 rounded-lg border-2 transition-all duration-300 shrink-0
                ${isActive ? 'bg-accent-cyan/10 border-accent-cyan/50 shadow-[0_0_15px_rgba(34,211,238,0.3)]' : ''}
                ${isPassed && !isBlocked ? 'bg-ok/5 border-ok/30' : ''}
                ${isBlocked ? 'bg-threat/10 border-threat/50' : ''}
                ${!isActive && !isPassed && !isBlocked ? 'bg-bg-secondary border-line' : ''}
              `}>
                <Icon size={16} className={
                  isActive ? 'text-accent-cyan'
                    : isPassed && !isBlocked ? 'text-ok-bright'
                      : isBlocked ? 'text-threat-bright'
                        : 'text-ink-muted'
                } />
                {isActive && (
                  <div className="absolute inset-0 rounded-lg border-2 border-accent-cyan/30 animate-pulse-ring" />
                )}
              </div>

              {/* Label */}
              <div className="flex-1 flex items-center justify-between">
                <span className={`text-xs font-mono font-medium ${
                  isActive ? 'text-accent-cyan' : isPassed ? 'text-ink-gray' : 'text-ink-muted'
                }`}>
                  {step.label}
                </span>
                {isActive && <span className="text-[9px] font-mono text-accent-cyan animate-pulse">PROCESSING</span>}
                {isPassed && !isBlocked && <span className="text-[9px] font-mono text-ok-bright">PASSED</span>}
                {isBlocked && <span className="text-[9px] font-mono text-threat-bright font-bold">BLOCKED</span>}
              </div>

              {/* Connector */}
              {i < STEPS.length - 1 && (
                <div className={`w-0.5 h-3 ml-[19px] -mt-3 -mb-1 rounded-full ${
                  isPassed ? 'bg-ok/30' : 'bg-line'
                }`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Decision result */}
      {lastDecision && (
        <div className={`mt-4 p-3 rounded-lg border animate-slide-up ${
          lastDecision.decision === 'DENY' ? 'bg-threat/5 border-threat/20' :
          lastDecision.decision === 'ALLOW' ? 'bg-ok/5 border-ok/20' :
          'bg-warn/5 border-warn/20'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono text-ink-muted uppercase tracking-wider">Last Decision</div>
              <div className="text-sm font-mono font-semibold mt-0.5">
                <span className="text-ink-gray">{lastDecision.tool}</span>
                <span className="text-ink-muted mx-1.5">→</span>
                <span className={
                  lastDecision.decision === 'DENY' ? 'text-threat-bright' :
                  lastDecision.decision === 'ALLOW' ? 'text-ok-bright' : 'text-warn-bright'
                }>{lastDecision.decision}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono text-ink-muted">{lastDecision.capability}</div>
              <div className="text-[10px] font-mono text-ink-dim">{lastDecision.reason}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
