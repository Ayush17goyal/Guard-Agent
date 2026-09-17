import { useStore } from '@/lib/store';
import { CheckCircle2, XCircle, Shield, ShieldOff, Database, Send } from 'lucide-react';

export function AgentComparison() {
  const state = useStore();

  const vulnerableActive = state.mode === 'VULNERABLE';
  const protectedActive = state.mode === 'PROTECTED';

  return (
    <div className="glass rounded-2xl p-4 sm:p-6">
      <div className="text-center mb-5">
        <h3 className="panel-title mb-1">Same Agent. Same Attack. Different Runtime.</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Vulnerable */}
        <div className={`relative rounded-xl border-2 p-4 transition-all duration-300 ${
          vulnerableActive ? 'border-threat/40 bg-threat/5' : 'border-line bg-bg-secondary'
        }`}>
          {vulnerableActive && <div className="absolute inset-0 grid-bg-fine opacity-20 rounded-xl pointer-events-none" />}
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <ShieldOff size={18} className={vulnerableActive ? 'text-threat-bright' : 'text-ink-muted'} />
              <span className={`text-sm font-bold ${vulnerableActive ? 'text-threat-bright' : 'text-ink-muted'}`}>VULNERABLE AGENT</span>
            </div>

            <div className="space-y-2">
              <ComparisonRow
                icon={Shield}
                label="Attack"
                value={vulnerableActive && state.runStatus === 'COMPLETED' ? 'SUCCESS' : vulnerableActive ? 'ACTIVE' : '—'}
                color={vulnerableActive ? 'text-threat-bright' : 'text-ink-muted'}
                positive={false}
              />
              <ComparisonRow
                icon={Database}
                label="CRM Data"
                value={vulnerableActive && state.runStatus === 'COMPLETED' ? 'LEAKED' : '—'}
                color={vulnerableActive && state.runStatus === 'COMPLETED' ? 'text-threat-bright' : 'text-ink-muted'}
                positive={false}
              />
              <ComparisonRow
                icon={Send}
                label="Exfiltration"
                value={vulnerableActive && state.runStatus === 'COMPLETED' ? 'SUCCESS' : '—'}
                color={vulnerableActive && state.runStatus === 'COMPLETED' ? 'text-threat-bright' : 'text-ink-muted'}
                positive={false}
              />
            </div>

            {vulnerableActive && state.runStatus === 'COMPLETED' && (
              <div className="mt-3 flex items-center gap-2 text-xs text-threat-bright animate-fade-in">
                <XCircle size={14} />
                <span className="font-mono">DATA LEAKED TO ATTACKER</span>
              </div>
            )}
          </div>
        </div>

        {/* Protected */}
        <div className={`relative rounded-xl border-2 p-4 transition-all duration-300 ${
          protectedActive ? 'border-ok/40 bg-ok/5' : 'border-line bg-bg-secondary'
        }`}>
          {protectedActive && <div className="absolute inset-0 radial-glow rounded-xl pointer-events-none" />}
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={18} className={protectedActive ? 'text-ok-bright' : 'text-ink-muted'} />
              <span className={`text-sm font-bold ${protectedActive ? 'text-ok-bright' : 'text-ink-muted'}`}>PROTECTED AGENT</span>
            </div>

            <div className="space-y-2">
              <ComparisonRow
                icon={Shield}
                label="Attack"
                value={protectedActive && state.runStatus === 'COMPLETED' ? 'BLOCKED' : protectedActive ? 'ACTIVE' : '—'}
                color={protectedActive ? 'text-ok-bright' : 'text-ink-muted'}
                positive
              />
              <ComparisonRow
                icon={Database}
                label="CRM Data"
                value={protectedActive && state.runStatus === 'COMPLETED' ? 'PROTECTED' : '—'}
                color={protectedActive && state.runStatus === 'COMPLETED' ? 'text-ok-bright' : 'text-ink-muted'}
                positive
              />
              <ComparisonRow
                icon={Send}
                label="Exfiltration"
                value={protectedActive && state.runStatus === 'COMPLETED' ? 'BLOCKED' : '—'}
                color={protectedActive && state.runStatus === 'COMPLETED' ? 'text-ok-bright' : 'text-ink-muted'}
                positive
              />
            </div>

            {protectedActive && state.runStatus === 'COMPLETED' && (
              <div className="mt-3 flex items-center gap-2 text-xs text-ok-bright animate-fade-in">
                <CheckCircle2 size={14} />
                <span className="font-mono">NO DATA LEFT THE RUNTIME</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* VS divider */}
      <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 mt-2">
        <div className="w-10 h-10 rounded-full glass-elevated flex items-center justify-center text-xs font-mono font-bold text-ink-gray border border-line">
          VS
        </div>
      </div>
    </div>
  );
}

function ComparisonRow({
  icon: Icon,
  label,
  value,
  color,
  positive,
}: {
  icon: typeof Shield;
  label: string;
  value: string;
  color: string;
  positive: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-bg-secondary/50">
      <div className="flex items-center gap-2">
        <Icon size={14} className="text-ink-muted" />
        <span className="text-xs text-ink-gray">{label}</span>
      </div>
      <span className={`text-xs font-mono font-semibold ${color}`}>
        {value !== '—' && (
          <span className={`mr-1.5 inline-block w-1.5 h-1.5 rounded-full ${positive ? 'bg-ok' : 'bg-threat'}`} />
        )}
        {value}
      </span>
    </div>
  );
}
