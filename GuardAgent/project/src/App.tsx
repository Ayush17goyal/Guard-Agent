import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import type { ViewId } from '@/lib/views';
import { BiometricLogin } from '@/components/Auth/BiometricLogin';
import { Navigation } from '@/components/shared/Navigation';
import { CommandPalette } from '@/components/shared/CommandPalette';
import { CommandCenter } from '@/components/CommandCenter/CommandCenter';
import { AttackLab } from '@/components/AttackLab/AttackLab';
import { PolicyEngine } from '@/components/Policy/PolicyEngine';
import { EventStream } from '@/components/Audit/EventStream';
import { ApprovalPanel } from '@/components/Approval/ApprovalPanel';

function App() {
  const state = useStore();
  const [view, setView] = useState<ViewId>('command');
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Cmd/Ctrl+K to open command palette
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen(o => !o);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (!state.auth.authenticated) {
    return <BiometricLogin />;
  }

  const renderView = () => {
    switch (view) {
      case 'command': return <CommandCenter />;
      case 'attacklab': return <AttackLab />;
      case 'policy': return <PolicyEngine />;
      case 'audit': return <EventStream />;
      case 'approvals': return <ApprovalPanel />;
      default: return <CommandCenter />;
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary grid-bg relative">
      {/* Ambient background glow */}
      <div className="fixed inset-0 radial-glow pointer-events-none z-0" />
      <div className="fixed top-0 left-0 w-[400px] h-[300px] bg-accent-cyan/3 blur-[100px] rounded-full pointer-events-none z-0" />

      <div className="relative z-10">
        <Navigation
          active={view}
          onNavigate={setView}
          onOpenPalette={() => setPaletteOpen(true)}
        />

        <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 sm:py-6">
          {renderView()}
        </main>

        <footer className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 mt-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono text-ink-muted">
            <div className="flex items-center gap-3">
              <span>GuardAgent · Runtime Firewall for AI Agents</span>
              <span className="text-line">|</span>
              <span>DEMO ENVIRONMENT — ALL DATA IS FAKE</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-accent-cyan">THE LLM CAN ASK.</span>
              <span>THE RUNTIME DECIDES.</span>
            </div>
          </div>
        </footer>
      </div>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onNavigate={setView}
      />
    </div>
  );
}

export default App;
