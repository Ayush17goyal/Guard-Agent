import { Command, LayoutDashboard, FlaskConical, Shield, ScrollText, CheckSquare, LogOut, Settings, Fingerprint } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { useStore, logout, getSecurityStatus } from '@/lib/store';
import type { ViewId } from '@/lib/views';

const NAV_ITEMS: { id: ViewId; label: string; icon: typeof Command }[] = [
  { id: 'command', label: 'Command Center', icon: LayoutDashboard },
  { id: 'attacklab', label: 'Attack Lab', icon: FlaskConical },
  { id: 'policy', label: 'Policy Engine', icon: Shield },
  { id: 'audit', label: 'Audit Stream', icon: ScrollText },
  { id: 'approvals', label: 'Approvals', icon: CheckSquare },
];

export function Navigation({
  active,
  onNavigate,
  onOpenPalette,
}: {
  active: ViewId;
  onNavigate: (id: ViewId) => void;
  onOpenPalette: () => void;
}) {
  const state = useStore();
  const status = getSecurityStatus();

  const statusColor =
    status === 'PROTECTED' ? 'bg-ok text-ok-bright'
      : status === 'UNDER_ATTACK' ? 'bg-threat/20 text-threat-bright'
        : 'bg-warn/20 text-warn-bright';

  return (
    <header className="sticky top-0 z-40 glass border-b border-line/60">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Left: Logo + nav */}
          <div className="flex items-center gap-6">
            <Logo size="sm" />

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map(item => {
                const Icon = item.icon;
                const isActive = active === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20'
                        : 'text-ink-gray hover:text-ink-white hover:bg-bg-elevated border border-transparent'
                    }`}
                  >
                    <Icon size={15} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right: status + auth + actions */}
          <div className="flex items-center gap-3">
            {/* Command palette trigger */}
            <button
              onClick={onOpenPalette}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-ink-muted border border-line hover:border-accent-cyan/30 hover:text-ink-gray transition-all font-mono"
            >
              <Command size={13} />
              <span>Cmd K</span>
            </button>

            {/* Runtime status */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold ${statusColor}`}>
              <span className="status-dot animate-pulse" />
              {status === 'PROTECTED' ? 'PROTECTED' : status === 'UNDER_ATTACK' ? 'UNDER ATTACK' : 'AUTH REQUIRED'}
            </div>

            {/* Auth identity */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-bg-elevated border border-line">
              <Fingerprint size={14} className="text-accent-cyan" />
              <span className="text-xs font-mono text-ink-gray">
                {state.auth.method === 'otp' ? 'TOKEN 180726' : state.auth.method === 'webauthn' ? 'BIO VERIFIED' : 'PASSPHRASE'}
              </span>
            </div>

            <button className="p-1.5 rounded-lg text-ink-muted hover:text-ink-white hover:bg-bg-elevated transition-all" aria-label="Settings">
              <Settings size={16} />
            </button>
            <button onClick={logout} className="p-1.5 rounded-lg text-ink-muted hover:text-threat-bright hover:bg-threat/10 transition-all" aria-label="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="lg:hidden flex items-center gap-1 pb-2 overflow-x-auto">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20'
                    : 'text-ink-gray hover:text-ink-white hover:bg-bg-elevated border border-transparent'
                }`}
              >
                <Icon size={14} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
