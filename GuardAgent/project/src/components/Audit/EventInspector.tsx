import { X, Clock, Tag } from 'lucide-react';
import type { AuditEvent } from '@/lib/types';

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', { hour12: false });
}

export function EventInspector({ event, onClose }: { event: AuditEvent; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg glass-elevated rounded-2xl p-5">
        <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-lg text-ink-muted hover:text-ink-white hover:bg-bg-elevated transition-all" aria-label="Close">
          <X size={16} />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Tag size={16} className="text-accent-cyan" />
          <h4 className="text-sm font-semibold text-ink-white">Event Inspector</h4>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-ink-muted" />
            <span className="text-xs font-mono text-ink-gray">{formatTime(event.timestamp)}.{String(event.timestamp).slice(-3)}</span>
          </div>

          <div>
            <div className="text-[10px] font-mono text-ink-muted uppercase tracking-wider mb-1">Type</div>
            <span className="text-sm font-mono font-semibold text-ink-white">{event.type}</span>
          </div>

          <div>
            <div className="text-[10px] font-mono text-ink-muted uppercase tracking-wider mb-1">Message</div>
            <span className="text-sm text-ink-white">{event.message}</span>
          </div>

          <div>
            <div className="text-[10px] font-mono text-ink-muted uppercase tracking-wider mb-1">Severity</div>
            <span className={`text-sm font-mono font-semibold ${
              event.severity === 'ok' ? 'text-ok-bright'
                : event.severity === 'threat' ? 'text-threat-bright'
                : event.severity === 'warn' ? 'text-warn-bright'
                : 'text-accent-cyan'
            }`}>{event.severity.toUpperCase()}</span>
          </div>

          {event.detail && (
            <div>
              <div className="text-[10px] font-mono text-ink-muted uppercase tracking-wider mb-1">Detail</div>
              <div className="rounded-lg bg-bg-primary border border-line p-3">
                <pre className="text-xs font-mono text-ink-gray whitespace-pre-wrap break-words">{event.detail}</pre>
              </div>
            </div>
          )}

          <div>
            <div className="text-[10px] font-mono text-ink-muted uppercase tracking-wider mb-1">Event ID</div>
            <span className="text-[10px] font-mono text-ink-dim">{event.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
