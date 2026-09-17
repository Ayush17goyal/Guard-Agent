import { useStore } from '@/lib/store';
import { Mail, ShieldCheck, AlertTriangle, Send } from 'lucide-react';
import { useState } from 'react';
import { PayloadInspector } from './PayloadInspector';

export function AttackerInbox({ compact = false }: { compact?: boolean }) {
  const state = useStore();
  const [selected, setSelected] = useState<string | null>(null);

  const payloads = state.attackerPayloads;
  const hasLeaked = payloads.some(p => p.status === 'EXFILTRATED');

  return (
    <div className={`glass rounded-2xl p-4 sm:p-6 relative overflow-hidden ${hasLeaked ? 'border-threat/30' : ''}`}>
      {hasLeaked && <div className="absolute inset-0 grid-bg-fine opacity-20 pointer-events-none" />}

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="panel-title">Attacker Endpoint</h3>
            <p className="text-xs text-ink-muted mt-0.5">Intercepted external endpoint — DEMO DATA</p>
          </div>
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-mono font-semibold ${
            hasLeaked ? 'bg-threat/20 text-threat-bright' : 'bg-ok/10 text-ok-bright'
          }`}>
            <span className={`status-dot ${hasLeaked ? 'bg-threat animate-pulse' : 'bg-ok'}`} />
            {hasLeaked ? 'PAYLOAD RECEIVED' : 'MONITORING'}
          </div>
        </div>

        {payloads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-bg-elevated border border-line flex items-center justify-center mb-3">
              <ShieldCheck size={20} className="text-ok-bright" />
            </div>
            <div className="text-sm text-ink-gray font-medium">NO PAYLOAD RECEIVED</div>
            <div className="text-xs text-ink-muted mt-1 max-w-xs">
              Protected runtime is currently preventing outbound exfiltration.
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {payloads.map(payload => {
              const isLeaked = payload.status === 'EXFILTRATED';
              return (
                <button
                  key={payload.id}
                  onClick={() => setSelected(payload.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    isLeaked
                      ? 'bg-threat/5 border-threat/20 hover:border-threat/40'
                      : 'bg-ok/5 border-ok/20 hover:border-ok/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      {isLeaked ? <Mail size={14} className="text-threat-bright" /> : <AlertTriangle size={14} className="text-ok-bright" />}
                      <span className="text-xs font-mono font-semibold text-ink-white">{payload.tool}</span>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      isLeaked ? 'bg-threat/20 text-threat-bright' : 'bg-ok/20 text-ok-bright'
                    }`}>
                      {isLeaked ? 'EXFILTRATED' : 'BLOCKED'}
                    </span>
                  </div>
                  {isLeaked ? (
                    <pre className={`text-[10px] font-mono text-ink-gray whitespace-pre-wrap ${compact ? 'line-clamp-3' : ''}`}>
                      {payload.data}
                    </pre>
                  ) : (
                    <div className="text-xs text-ink-muted font-mono">
                      <Send size={10} className="inline mr-1" />
                      Request intercepted — no data transmitted
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selected && (
        <PayloadInspector
          payload={payloads.find(p => p.id === selected)!}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
