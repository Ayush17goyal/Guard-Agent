import { Shield, ShieldAlert, ShieldCheck, Activity, Lock, Eye, Ban, Clock } from 'lucide-react';
import { useStore, getSecurityStatus } from '@/lib/store';
import type { SecurityStatus } from '@/lib/types';

function MetricCard({ icon: Icon, label, value, color }: { icon: typeof Activity; label: string; value: string | number; color: string }) {
  return (
    <div className="glass rounded-xl p-3 sm:p-4 flex flex-col gap-1.5 hover:border-line-bright/50 transition-all">
      <div className="flex items-center gap-2">
        <Icon size={14} className={color} />
        <span className="text-[10px] font-mono font-semibold tracking-wider text-ink-muted uppercase">{label}</span>
      </div>
      <span className={`text-lg sm:text-xl font-bold font-mono ${color}`}>{value}</span>
    </div>
  );
}

export function SecurityStatus() {
  const state = useStore();
  const status: SecurityStatus = getSecurityStatus();

  const isProtected = status === 'PROTECTED';
  const isAttack = status === 'UNDER_ATTACK';

  const StatusIcon = isProtected ? ShieldCheck : isAttack ? ShieldAlert : Shield;
  const statusColor = isProtected ? 'text-ok-bright' : isAttack ? 'text-threat-bright' : 'text-warn-bright';
  const statusBg = isProtected ? 'from-ok/10' : isAttack ? 'from-threat/10' : 'from-warn/10';

  return (
    <div className="relative">
      {/* Hero status banner */}
      <div className={`relative overflow-hidden rounded-2xl glass border ${isAttack ? 'border-threat/30' : 'border-accent-cyan/20'} p-5 sm:p-6`}>
        {/* Background effect */}
        <div className={`absolute inset-0 bg-gradient-to-r ${statusBg} to-transparent pointer-events-none`} />
        {isAttack && (
          <div className="absolute inset-0 grid-bg-fine opacity-30 pointer-events-none" />
        )}

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono font-semibold tracking-wider text-ink-muted uppercase mb-1">
              GuardAgent Security Status
            </div>
            <div className="flex items-center gap-3">
              <StatusIcon className={statusColor} size={32} strokeWidth={2} />
              <h2 className={`text-2xl sm:text-3xl font-bold ${statusColor} tracking-tight`}>
                {isProtected ? 'PROTECTED' : isAttack ? 'UNDER ATTACK' : 'AUTHENTICATION REQUIRED'}
              </h2>
            </div>
            <p className="text-sm text-ink-gray mt-1.5">
              {isProtected
                ? 'Runtime firewall online. All tool calls intercepted and policy-enforced.'
                : isAttack
                  ? 'Active threat detected. GuardAgent interceptor is evaluating requests.'
                  : 'Authenticate to activate runtime protection.'}
            </p>
          </div>

          {/* Core principle */}
          <div className="hidden md:block text-right">
            <div className="text-xs font-mono text-ink-muted leading-relaxed">
              <div>THE LLM CAN ASK.</div>
              <div className="text-accent-cyan">THE RUNTIME DECIDES.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 mt-3">
        <MetricCard icon={Activity} label="Runtime" value={state.mode === 'IDLE' ? 'IDLE' : state.mode} color={state.mode === 'VULNERABLE' ? 'text-threat-bright' : state.mode === 'PROTECTED' ? 'text-ok-bright' : 'text-ink-gray'} />
        <MetricCard icon={Eye} label="Taint" value={state.taint} color={state.taint === 'CLEAN' ? 'text-ok-bright' : state.taint === 'HIGH_RISK' ? 'text-threat-bright' : 'text-warn-bright'} />
        <MetricCard icon={Lock} label="Active Agent" value={state.runStatus === 'RUNNING' ? 'ACTIVE' : 'IDLE'} color={state.runStatus === 'RUNNING' ? 'text-accent-cyan' : 'text-ink-gray'} />
        <MetricCard icon={Eye} label="Tools Monitored" value={state.toolsMonitored} color="text-ink-white" />
        <MetricCard icon={Ban} label="Threats Blocked" value={state.threatsBlocked} color={state.threatsBlocked > 0 ? 'text-ok-bright' : 'text-ink-gray'} />
        <MetricCard icon={Clock} label="Pending Approvals" value={state.approvals.filter(a => a.status === 'PENDING').length} color={state.approvals.some(a => a.status === 'PENDING') ? 'text-warn-bright' : 'text-ink-gray'} />
      </div>
    </div>
  );
}
