import { Check, AlertTriangle, ShieldAlert, Skull, Filter } from 'lucide-react';
import { useStore } from '@/lib/store';
import { TAINT_INFO } from '@/lib/policy';
import type { TaintState } from '@/lib/types';

const TAINT_ORDER: TaintState[] = ['CLEAN', 'EXTERNAL_UNVERIFIED', 'SENSITIVE', 'HIGH_RISK'];

const TAINT_ICONS: Record<TaintState, typeof Check> = {
  CLEAN: Check,
  EXTERNAL_UNVERIFIED: AlertTriangle,
  SENSITIVE: ShieldAlert,
  HIGH_RISK: Skull,
};

export function TaintState() {
  const state = useStore();
  const currentIndex = TAINT_ORDER.indexOf(state.taint);

  return (
    <div className="glass rounded-2xl p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="panel-title">Context Integrity</h3>
          <p className="text-xs text-ink-muted mt-0.5">Taint state progression</p>
        </div>
        <Filter size={16} className={state.taint === 'CLEAN' ? 'text-ok-bright' : state.taint === 'HIGH_RISK' ? 'text-threat-bright' : 'text-warn-bright'} />
      </div>

      {/* Progression bar */}
      <div className="relative mb-6">
        <div className="flex items-center justify-between mb-2">
          {TAINT_ORDER.map((t, i) => {
            const Icon = TAINT_ICONS[t];
            const isActive = i === currentIndex;
            const isPassed = i < currentIndex;
            const info = TAINT_INFO[t];
            const color = isActive ? info.color : isPassed ? info.color : 'ink-dim';

            return (
              <div key={t} className="flex flex-col items-center flex-1 relative z-10">
                <div className={`
                  flex items-center justify-center w-9 h-9 rounded-full border-2 transition-all duration-500
                  ${isActive ? `bg-${info.color}/10 border-${info.color}/50 shadow-[0_0_15px_rgba(34,211,238,0.2)] scale-110` : ''}
                  ${isPassed ? `bg-${info.color}/5 border-${info.color}/30` : ''}
                  ${!isActive && !isPassed ? 'bg-bg-secondary border-line' : ''}
                `}>
                  <Icon size={16} className={`text-${color}`} />
                </div>
              </div>
            );
          })}
        </div>
        {/* Connector line */}
        <div className="absolute top-[18px] left-[16%] right-[16%] h-0.5 bg-line -z-0">
          <div
            className="h-full transition-all duration-700"
            style={{
              width: `${(currentIndex / (TAINT_ORDER.length - 1)) * 100}%`,
              background: currentIndex > 0
                ? `linear-gradient(90deg, #10B981, ${currentIndex >= 2 ? '#F59E0B' : '#F59E0B'})`
                : 'transparent',
            }}
          />
        </div>
      </div>

      {/* Current state detail */}
      <div className="space-y-1.5">
        {TAINT_ORDER.map((t, i) => {
          const isActive = i === currentIndex;
          const info = TAINT_INFO[t];
          if (!isActive && i > currentIndex) return null;

          return (
            <div
              key={t}
              className={`flex items-start gap-2 p-2 rounded-lg transition-all duration-300 ${
                isActive ? `bg-${info.color}/5 border border-${info.color}/20` : 'opacity-50'
              }`}
            >
              <span className={`status-dot mt-1.5 bg-${info.color} ${isActive ? 'animate-pulse' : ''}`} />
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-mono font-semibold text-${info.color}`}>{t}</div>
                <div className="text-[11px] text-ink-muted">{info.description}</div>
              </div>
              {isActive && (
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-${info.color}/10 text-${info.color}`}>
                  CURRENT
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
