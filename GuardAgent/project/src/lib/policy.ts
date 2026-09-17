import type { Capability, Decision, TaintState, ToolDef } from './types';

export const TOOLS: ToolDef[] = [
  { name: 'search_web', capability: 'PUBLIC_READ', description: 'Search public web content' },
  { name: 'read_crm', capability: 'CRM_READ', description: 'Read customer records' },
  { name: 'query_sensitive_crm', capability: 'CRM_SENSITIVE_READ', description: 'Query sensitive CRM fields' },
  { name: 'read_file', capability: 'FILE_READ', description: 'Read a file from disk' },
  { name: 'read_secret', capability: 'SECRET_READ', description: 'Read a stored secret' },
  { name: 'database_write', capability: 'DATABASE_WRITE', description: 'Write to the database' },
  { name: 'delete_record', capability: 'DESTRUCTIVE_WRITE', description: 'Permanently delete a record' },
  { name: 'send_http_request', capability: 'NETWORK_REQUEST', description: 'Send an outbound HTTP request' },
  { name: 'exfiltrate_data', capability: 'DATA_EXFILTRATION', description: 'Transmit data to external endpoint' },
  { name: 'execute_code', capability: 'CODE_EXECUTION', description: 'Execute arbitrary code' },
];

export const CAPABILITY_LABELS: Record<Capability, string> = {
  PUBLIC_READ: 'Public Read',
  CRM_READ: 'CRM Read',
  CRM_SENSITIVE_READ: 'CRM Sensitive Read',
  FILE_READ: 'File Read',
  SECRET_READ: 'Secret Read',
  DATABASE_WRITE: 'Database Write',
  DESTRUCTIVE_WRITE: 'Destructive Write',
  NETWORK_REQUEST: 'Network Request',
  DATA_EXFILTRATION: 'Data Exfiltration',
  CODE_EXECUTION: 'Code Execution',
};

export const CAPABILITY_ICONS: Record<Capability, string> = {
  PUBLIC_READ: 'Globe',
  CRM_READ: 'Users',
  CRM_SENSITIVE_READ: 'Lock',
  FILE_READ: 'FileText',
  SECRET_READ: 'KeyRound',
  DATABASE_WRITE: 'Database',
  DESTRUCTIVE_WRITE: 'Trash2',
  NETWORK_REQUEST: 'Network',
  DATA_EXFILTRATION: 'Send',
  CODE_EXECUTION: 'Terminal',
};

export const TAINT_STATES: TaintState[] = ['CLEAN', 'EXTERNAL_UNVERIFIED', 'SENSITIVE', 'HIGH_RISK'];

export const TAINT_INFO: Record<TaintState, { label: string; description: string; color: string }> = {
  CLEAN: { label: 'Clean', description: 'Safe context — no untrusted content', color: 'ok' },
  EXTERNAL_UNVERIFIED: { label: 'External Unverified', description: 'Untrusted external content present', color: 'warn' },
  SENSITIVE: { label: 'Sensitive', description: 'Sensitive data present in context', color: 'warn' },
  HIGH_RISK: { label: 'High Risk', description: 'High-risk context — strict enforcement', color: 'threat' },
};

// Deterministic policy: maps (capability, taint) -> decision
// This is the trusted runtime policy engine — the frontend visualizes it, never overrides it.
const POLICY_MATRIX: Record<Capability, Partial<Record<TaintState, Decision>>> = {
  PUBLIC_READ: { CLEAN: 'ALLOW', EXTERNAL_UNVERIFIED: 'ALLOW', SENSITIVE: 'ALLOW', HIGH_RISK: 'ALLOW' },
  CRM_READ: { CLEAN: 'ALLOW', EXTERNAL_UNVERIFIED: 'ALLOW', SENSITIVE: 'ALLOW', HIGH_RISK: 'REQUIRE_APPROVAL' },
  CRM_SENSITIVE_READ: { CLEAN: 'ALLOW', EXTERNAL_UNVERIFIED: 'DENY', SENSITIVE: 'DENY', HIGH_RISK: 'DENY' },
  FILE_READ: { CLEAN: 'ALLOW', EXTERNAL_UNVERIFIED: 'ALLOW', SENSITIVE: 'REQUIRE_APPROVAL', HIGH_RISK: 'DENY' },
  SECRET_READ: { CLEAN: 'REQUIRE_APPROVAL', EXTERNAL_UNVERIFIED: 'DENY', SENSITIVE: 'DENY', HIGH_RISK: 'DENY' },
  DATABASE_WRITE: { CLEAN: 'REQUIRE_APPROVAL', EXTERNAL_UNVERIFIED: 'DENY', SENSITIVE: 'DENY', HIGH_RISK: 'DENY' },
  DESTRUCTIVE_WRITE: { CLEAN: 'REQUIRE_APPROVAL', EXTERNAL_UNVERIFIED: 'DENY', SENSITIVE: 'DENY', HIGH_RISK: 'DENY' },
  NETWORK_REQUEST: { CLEAN: 'ALLOW', EXTERNAL_UNVERIFIED: 'DENY', SENSITIVE: 'DENY', HIGH_RISK: 'DENY' },
  DATA_EXFILTRATION: { CLEAN: 'DENY', EXTERNAL_UNVERIFIED: 'DENY', SENSITIVE: 'DENY', HIGH_RISK: 'DENY' },
  CODE_EXECUTION: { CLEAN: 'REQUIRE_APPROVAL', EXTERNAL_UNVERIFIED: 'DENY', SENSITIVE: 'DENY', HIGH_RISK: 'DENY' },
};

export function evaluatePolicy(capability: Capability, taint: TaintState): { decision: Decision; reason: string } {
  const decision = POLICY_MATRIX[capability]?.[taint] ?? 'DENY';
  const reason = decision === 'ALLOW'
    ? 'POLICY_PASS'
    : decision === 'REQUIRE_APPROVAL'
      ? 'HIGH_RISK_REQUIRES_APPROVAL'
      : 'TAINT_POLICY_VIOLATION';
  return { decision, reason };
}

export function getTool(name: string): ToolDef | undefined {
  return TOOLS.find(t => t.name === name);
}

export function getCapability(name: string): Capability | undefined {
  return TOOLS.find(t => t.name === name)?.capability;
}

// Deterministic arg hash (not cryptographic — for demo binding only)
export function hashArgs(args: Record<string, unknown>): string {
  const json = JSON.stringify(args, Object.keys(args).sort());
  let h = 0x811c9dc5;
  for (let i = 0; i < json.length; i++) {
    h ^= json.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

// HMAC-style approval token (deterministic demo HMAC using a per-session secret)
let _sessionSecret = '';
export function initSessionSecret(): void {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  _sessionSecret = Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function issueApprovalToken(runId: string, tool: string, capability: Capability, argsHash: string): string {
  const payload = `${runId}:${tool}:${capability}:${argsHash}:${_sessionSecret}`;
  let h = 0;
  for (let i = 0; i < payload.length; i++) {
    h = (h * 31 + payload.charCodeAt(i)) | 0;
  }
  return `tok_${(h >>> 0).toString(16).padStart(8, '0')}`;
}

export function verifyApprovalToken(token: string, runId: string, tool: string, capability: Capability, argsHash: string): boolean {
  const expected = issueApprovalToken(runId, tool, capability, argsHash);
  return token === expected;
}
