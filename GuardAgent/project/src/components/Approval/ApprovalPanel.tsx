import { useStore, approveAction, denyAction } from '@/lib/store';
import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle, Clock, Fingerprint, Lock } from 'lucide-react';
import { CAPABILITY_LABELS } from '@/lib/policy';
import type { ApprovalRequest } from '@/lib/types';

export function ApprovalPanel() {
  const state = useStore();
  const pending = state.approvals.filter(a => a.status === 'PENDING');
  const resolved = state.approvals.filter(a => a.status !== 'PENDING');

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="panel-title">Human Approvals</h3>
            <p className="text-sm text-ink-gray mt-1">High-risk actions requiring human authorization</p>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-bg-elevated text-[10px] font-mono text-ink-muted">
            <Clock size={10} />
            {pending.length} PENDING
          </div>
        </div>
        <p className="text-xs text-ink-muted mt-2">
          When policy returns REQUIRE_APPROVAL, the runtime pauses execution and waits for a human decision.
          Approval tokens are HMAC-bound to the exact run, tool, capability, and arguments hash.
        </p>
      </div>

      {pending.length === 0 && resolved.length === 0 ? (
        <div className="glass rounded-2xl p-6">
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-ok/10 border border-ok/20 flex items-center justify-center mb-3">
              <ShieldCheck size={20} className="text-ok-bright" />
            </div>
            <div className="text-sm text-ink-gray font-medium">NO APPROVALS REQUIRED</div>
            <div className="text-xs text-ink-muted mt-1">No high-risk actions are awaiting authorization.</div>
          </div>
        </div>
      ) : (
        <>
          {pending.map(approval => (
            <ApprovalRequestCard key={approval.id} approval={approval} />
          ))}

          {resolved.length > 0 && (
            <div className="glass rounded-2xl p-4">
              <div className="text-[10px] font-mono font-semibold tracking-wider text-ink-muted uppercase mb-3">Resolved Approvals</div>
              <div className="space-y-2">
                {resolved.map(approval => (
                  <div key={approval.id} className="flex items-center justify-between p-3 rounded-lg bg-bg-secondary/50">
                    <div className="flex items-center gap-2">
                      {approval.status === 'APPROVED' ? <CheckCircle2 size={14} className="text-ok-bright" /> : <XCircle size={14} className="text-threat-bright" />}
                      <span className="text-xs font-mono text-ink-gray">{approval.tool}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-ink-muted">{CAPABILITY_LABELS[approval.capability]}</span>
                      <span className={`text-[10px] font-mono font-bold ${approval.status === 'APPROVED' ? 'text-ok-bright' : 'text-threat-bright'}`}>
                        {approval.status}
                      </span>
                      {approval.token && (
                        <span className="text-[9px] font-mono text-ink-dim">{approval.token.slice(0, 12)}...</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ApprovalRequestCard({ approval }: { approval: ApprovalRequest }) {
  return (
    <div className="glass-elevated rounded-2xl p-5 relative overflow-hidden animate-slide-up">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-warn/50 to-transparent" />

      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-warn/10 border border-warn/30">
          <ShieldAlert size={20} className="text-warn-bright" />
        </div>
        <div>
          <div className="text-[10px] font-mono font-semibold tracking-wider text-warn-bright uppercase">High-Risk Action</div>
          <div className="text-sm font-bold text-ink-white">Awaiting Human Approval</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <Detail label="Tool" value={approval.tool} />
        <Detail label="Capability" value={CAPABILITY_LABELS[approval.capability]} />
        <Detail label="Requested By" value="AI Agent" />
        <Detail label="Taint" value={approval.taint} color={approval.taint === 'CLEAN' ? 'text-ok-bright' : 'text-warn-bright'} />
        <Detail label="Action" value={approval.action} />
        <Detail label="Args Hash" value={approval.argsHash} mono />
      </div>

      {/* HMAC binding info */}
      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-bg-secondary/50 mb-4">
        <Lock size={12} className="text-ink-muted" />
        <span className="text-[10px] font-mono text-ink-muted">
          Token bound to: {approval.runId.slice(0, 12)} · {approval.tool} · {approval.capability} · {approval.argsHash}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2.5">
        <button
          onClick={() => approveAction(approval.id)}
          className="btn-ok flex-1 py-3 group"
        >
          <Fingerprint size={18} className="group-hover:scale-110 transition-transform" />
          <span className="font-semibold">Approve Action</span>
        </button>
        <button
          onClick={() => denyAction(approval.id)}
          className="btn-threat flex-1 py-3 group"
        >
          <XCircle size={18} className="group-hover:scale-110 transition-transform" />
          <span className="font-semibold">Deny Action</span>
        </button>
      </div>
    </div>
  );
}

function Detail({ label, value, mono, color }: { label: string; value: string; mono?: boolean; color?: string }) {
  return (
    <div className="p-2.5 rounded-lg bg-bg-secondary/50">
      <div className="text-[10px] font-mono text-ink-muted uppercase tracking-wider mb-0.5">{label}</div>
      <div className={`text-sm ${mono ? 'font-mono' : 'font-medium'} ${color ?? 'text-ink-white'}`}>{value}</div>
    </div>
  );
}
