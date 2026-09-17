import { Play, Bug, ShieldCheck, RotateCcw, Zap } from 'lucide-react';
import { useStore, runSimulation, resetSimulation } from '@/lib/store';
import { SecurityStatus } from './SecurityStatus';
import { AgentGraph } from './AgentGraph';
import { ThreatRadar } from './ThreatRadar';
import { TaintState } from './TaintState';
import { InterceptorViz } from './InterceptorViz';
import { EventStream } from '@/components/Audit/EventStream';
import { AttackerInbox } from '@/components/Attacker/AttackerInbox';

export function CommandCenter() {
  const state = useStore();
  const isRunning = state.runStatus === 'RUNNING';

  return (
    <div className="space-y-4">
      {/* Hero status + metrics */}
      <SecurityStatus />

      {/* Demo controls */}
      <div className="glass rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="flex items-center gap-2 flex-1">
          <Zap size={18} className="text-accent-cyan" />
          <div>
            <div className="text-sm font-semibold text-ink-white">Live Attack Demo</div>
            <div className="text-xs text-ink-muted">Run a full attack simulation to see GuardAgent in action</div>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => runSimulation('VULNERABLE')}
            disabled={isRunning}
            className="btn-threat flex-1 sm:flex-initial"
          >
            <Bug size={16} />
            Run Vulnerable
          </button>
          <button
            onClick={() => runSimulation('PROTECTED')}
            disabled={isRunning}
            className="btn-cyan flex-1 sm:flex-initial"
          >
            <ShieldCheck size={16} />
            Run Protected
          </button>
          <button
            onClick={resetSimulation}
            disabled={isRunning}
            className="btn-ghost"
            aria-label="Reset simulation"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Agent graph (spans 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <AgentGraph />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InterceptorViz />
            <AttackerInbox compact />
          </div>
        </div>

        {/* Right: Radar + Taint + Events */}
        <div className="space-y-4">
          <ThreatRadar />
          <TaintState />
          <EventStream compact />
        </div>
      </div>
    </div>
  );
}
