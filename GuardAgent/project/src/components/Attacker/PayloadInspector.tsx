import { X, Send, ShieldCheck, Code2 } from 'lucide-react';
import type { AttackerPayload } from '@/lib/types';

export function PayloadInspector({
  payload,
  onClose,
}: {
  payload: AttackerPayload;
  onClose: () => void;
}) {
  const isLeaked = payload.status === 'EXFILTRATED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg glass-elevated rounded-2xl p-5">
        <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-lg text-ink-muted hover:text-ink-white hover:bg-bg-elevated transition-all" aria-label="Close">
          <X size={16} />
        </button>

        <div className="flex items-center gap-2 mb-4">
          {isLeaked ? <Send size={16} className="text-threat-bright" /> : <ShieldCheck size={16} className="text-ok-bright" />}
          <h4 className="text-sm font-semibold text-ink-white">
            {isLeaked ? 'Intercepted Request' : 'Blocked Request'}
          </h4>
        </div>

        <div className="space-y-3">
          <div>
            <div className="text-[10px] font-mono text-ink-muted uppercase tracking-wider mb-1">Tool</div>
            <span className="text-sm font-mono font-semibold text-ink-white">{payload.tool}</span>
          </div>

          <div>
            <div className="text-[10px] font-mono text-ink-muted uppercase tracking-wider mb-1">Status</div>
            <span className={`text-sm font-mono font-bold ${isLeaked ? 'text-threat-bright' : 'text-ok-bright'}`}>
              {payload.status}
            </span>
          </div>

          {payload.data && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Code2 size={14} className="text-ink-muted" />
                <span className="text-[10px] font-mono text-ink-muted uppercase tracking-wider">
                  {isLeaked ? 'Exfiltrated Payload' : 'Intended Payload'}
                </span>
              </div>
              <div className="rounded-lg bg-bg-primary border border-line p-3 max-h-64 overflow-y-auto">
                <pre className="text-xs font-mono text-ink-gray whitespace-pre-wrap">{payload.data}</pre>
              </div>
            </div>
          )}

          {isLeaked && (
            <div className="p-3 rounded-lg bg-threat/5 border border-threat/20">
              <div className="text-xs text-threat-bright font-mono">
                Sensitive CRM records were transmitted to the attacker endpoint.
              </div>
              <div className="text-[10px] text-ink-muted mt-1">All data is fake — demo environment only.</div>
            </div>
          )}

          {!isLeaked && (
            <div className="p-3 rounded-lg bg-ok/5 border border-ok/20">
              <div className="text-xs text-ok-bright font-mono">
                GuardAgent intercepted the request. No data left the runtime.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
