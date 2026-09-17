import { useEffect, useRef, useState } from 'react';
import { Search, CornerDownLeft, ArrowRight, FlaskConical, Shield, ScrollText, CheckSquare, LayoutDashboard, RotateCcw, Bug, ShieldCheck, Mail, Eye } from 'lucide-react';
import type { ViewId } from '@/lib/views';
import { runSimulation, resetSimulation } from '@/lib/store';
import type { AgentMode } from '@/lib/types';

interface Command {
  id: string;
  label: string;
  hint: string;
  icon: typeof Search;
  action: () => void;
  group: string;
}

export function CommandPalette({
  open,
  onClose,
  onNavigate,
}: {
  open: boolean;
  onClose: () => void;
  onNavigate: (id: ViewId) => void;
}) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const commands: Command[] = [
    { id: 'nav-command', label: 'Go to Command Center', hint: 'Navigate', icon: LayoutDashboard, action: () => onNavigate('command'), group: 'Navigation' },
    { id: 'nav-attacklab', label: 'Go to Attack Lab', hint: 'Navigate', icon: FlaskConical, action: () => onNavigate('attacklab'), group: 'Navigation' },
    { id: 'nav-policy', label: 'Go to Policy Engine', hint: 'Navigate', icon: Shield, action: () => onNavigate('policy'), group: 'Navigation' },
    { id: 'nav-audit', label: 'Go to Audit Stream', hint: 'Navigate', icon: ScrollText, action: () => onNavigate('audit'), group: 'Navigation' },
    { id: 'nav-approvals', label: 'Go to Approvals', hint: 'Navigate', icon: CheckSquare, action: () => onNavigate('approvals'), group: 'Navigation' },
    { id: 'run-vuln', label: 'Run Vulnerable Agent', hint: 'Simulation', icon: Bug, action: () => { runSimulation('VULNERABLE'); onNavigate('attacklab'); }, group: 'Actions' },
    { id: 'run-protected', label: 'Run Protected Agent', hint: 'Simulation', icon: ShieldCheck, action: () => { runSimulation('PROTECTED'); onNavigate('attacklab'); }, group: 'Actions' },
    { id: 'reset', label: 'Reset Simulation', hint: 'Simulation', icon: RotateCcw, action: () => resetSimulation(), group: 'Actions' },
    { id: 'view-attacker', label: 'View Attacker Inbox', hint: 'Inspect', icon: Mail, action: () => onNavigate('attacklab'), group: 'Inspect' },
    { id: 'view-crm', label: 'View CRM Data', hint: 'Inspect', icon: Eye, action: () => onNavigate('policy'), group: 'Inspect' },
  ];

  const filtered = commands.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.group.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
      else if (e.key === 'Enter' && filtered[selected]) {
        filtered[selected].action();
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, filtered, selected, onClose]);

  if (!open) return null;

  const groups = [...new Set(filtered.map(c => c.group))];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 animate-fade-in" role="dialog" aria-modal="true" aria-label="Command palette">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg glass-elevated rounded-2xl shadow-2xl overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-line">
          <Search size={18} className="text-ink-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0); }}
            placeholder="Type a command..."
            className="flex-1 bg-transparent text-ink-white placeholder-ink-muted text-sm outline-none"
          />
          <kbd className="text-[10px] font-mono text-ink-muted px-1.5 py-0.5 rounded border border-line">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2">
          {groups.map(group => (
            <div key={group}>
              <div className="px-2 py-1.5 text-[10px] font-mono font-semibold tracking-wider text-ink-muted uppercase">
                {group}
              </div>
              {filtered.filter(c => c.group === group).map(cmd => {
                const idx = filtered.indexOf(cmd);
                const isSelected = idx === selected;
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.id}
                    onClick={() => { cmd.action(); onClose(); }}
                    onMouseEnter={() => setSelected(idx)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                      isSelected ? 'bg-accent-cyan/10 text-accent-cyan' : 'text-ink-gray hover:bg-bg-elevated'
                    }`}
                  >
                    <Icon size={16} className={isSelected ? 'text-accent-cyan' : 'text-ink-muted'} />
                    <span className="flex-1 text-left">{cmd.label}</span>
                    <span className="text-[10px] font-mono text-ink-muted">{cmd.hint}</span>
                    {isSelected && <CornerDownLeft size={14} className="text-accent-cyan" />}
                  </button>
                );
              })}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-ink-muted">No commands found.</div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-line text-[10px] font-mono text-ink-muted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><ArrowRight size={10} /> Navigate</span>
            <span className="flex items-center gap-1"><CornerDownLeft size={10} /> Select</span>
          </div>
          <span>GuardAgent Command</span>
        </div>
      </div>
    </div>
  );
}
