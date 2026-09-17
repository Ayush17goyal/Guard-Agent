import { Bug, ShieldCheck, RotateCcw, Zap, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useStore, runSimulation, resetSimulation } from '@/lib/store';

export function AttackSimulator() {
  const state = useStore();
  const isRunning = state.runStatus === 'RUNNING';

  return (
    <div className="glass rounded-2xl p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="panel-title">Attack Simulator</h3>
          <p className="text-xs text-ink-muted mt-0.5">Run a complete attack sequence against vulnerable and protected runtimes</p>
        </div>
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-mono font-semibold ${
          state.runStatus === 'RUNNING' ? 'bg-accent-cyan/10 text-accent-cyan' :
          state.runStatus === 'COMPLETED' ? (state.mode === 'VULNERABLE' ? 'bg-threat/20 text-threat-bright' : 'bg-ok/20 text-ok-bright') :
          'bg-bg-elevated text-ink-muted'
        }`}>
          {state.runStatus === 'RUNNING' && <Loader2 size={10} className="animate-spin" />}
          {state.runStatus}
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <button
          onClick={() => runSimulation('VULNERABLE')}
          disabled={isRunning}
          className="btn-threat py-3.5 group disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isRunning && state.mode === 'VULNERABLE' ? <Loader2 size={18} className="animate-spin" /> : <Bug size={18} className="group-hover:scale-110 transition-transform" />}
          <span className="font-semibold">Run Vulnerable Agent</span>
          <span className="text-[10px] font-mono opacity-70 block">NO FIREWALL</span>
        </button>

        <button
          onClick={() => runSimulation('PROTECTED')}
          disabled={isRunning}
          className="btn-cyan py-3.5 group disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isRunning && state.mode === 'PROTECTED' ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} className="group-hover:scale-110 transition-transform" />}
          <span className="font-semibold">Run Protected Agent</span>
          <span className="text-[10px] font-mono opacity-70 block">FIREWALL ON</span>
        </button>

        <button
          onClick={resetSimulation}
          disabled={isRunning}
          className="btn-ghost py-3.5 group disabled:opacity-40"
        >
          <RotateCcw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
          <span className="font-semibold">Reset Simulation</span>
          <span className="text-[10px] font-mono opacity-70 block">CLEAR STATE</span>
        </button>
      </div>

      {/* Quick demo button */}
      <button
        onClick={() => runSimulation('PROTECTED')}
        disabled={isRunning}
        className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-accent-cyan/10 via-accent-blue/10 to-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan font-semibold text-sm hover:from-accent-cyan/20 hover:to-accent-cyan/20 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] transition-all disabled:opacity-40 group flex items-center justify-center gap-2"
      >
        <Zap size={18} className="group-hover:scale-110 transition-transform" />
        RUN LIVE ATTACK — Protected Mode Demo
      </button>

      {/* Result summary */}
      {state.runStatus === 'COMPLETED' && (
        <div className={`mt-4 p-4 rounded-xl border animate-slide-up ${
          state.mode === 'VULNERABLE' ? 'bg-threat/5 border-threat/20' : 'bg-ok/5 border-ok/20'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {state.mode === 'VULNERABLE' ? (
              <><XCircle size={18} className="text-threat-bright" /><span className="text-sm font-bold text-threat-bright">DATA LEAKED</span></>
            ) : (
              <><CheckCircle2 size={18} className="text-ok-bright" /><span className="text-sm font-bold text-ok-bright">ATTACK NEUTRALIZED</span></>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-lg font-bold font-mono text-ink-white">{state.threatsBlocked}</div>
              <div className="text-[10px] font-mono text-ink-muted uppercase">Attacks Blocked</div>
            </div>
            <div>
              <div className={`text-lg font-bold font-mono ${state.mode === 'VULNERABLE' ? 'text-threat-bright' : 'text-ok-bright'}`}>
                {state.mode === 'VULNERABLE' ? '4' : '0'}
              </div>
              <div className="text-[10px] font-mono text-ink-muted uppercase">Records Exposed</div>
            </div>
            <div>
              <div className={`text-lg font-bold font-mono ${state.mode === 'VULNERABLE' ? 'text-threat-bright' : 'text-ok-bright'}`}>
                {state.mode === 'VULNERABLE' ? '1' : '0'}
              </div>
              <div className="text-[10px] font-mono text-ink-muted uppercase">Exfiltration Events</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
