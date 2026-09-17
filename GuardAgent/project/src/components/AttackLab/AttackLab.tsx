import { useStore } from '@/lib/store';
import { AttackSimulator } from './AttackSimulator';
import { AttackSequence } from './AttackSequence';
import { AgentComparison } from './AgentComparison';
import { InterceptorViz } from '@/components/CommandCenter/InterceptorViz';
import { AttackerInbox } from '@/components/Attacker/AttackerInbox';
import { EventStream } from '@/components/Audit/EventStream';

export function AttackLab() {
  return (
    <div className="space-y-4">
      <AttackSimulator />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AttackSequence />
        <AgentComparison />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <InterceptorViz />
        <AttackerInbox />
      </div>

      <EventStream />
    </div>
  );
}
