export type TaintState = 'CLEAN' | 'EXTERNAL_UNVERIFIED' | 'SENSITIVE' | 'HIGH_RISK';

export type Capability =
  | 'PUBLIC_READ'
  | 'CRM_READ'
  | 'CRM_SENSITIVE_READ'
  | 'FILE_READ'
  | 'SECRET_READ'
  | 'DATABASE_WRITE'
  | 'DESTRUCTIVE_WRITE'
  | 'NETWORK_REQUEST'
  | 'DATA_EXFILTRATION'
  | 'CODE_EXECUTION';

export type Decision = 'ALLOW' | 'DENY' | 'REQUIRE_APPROVAL';

export type AgentMode = 'VULNERABLE' | 'PROTECTED' | 'IDLE';

export type RunStatus = 'IDLE' | 'RUNNING' | 'COMPLETED' | 'BLOCKED';

export type SecurityStatus = 'PROTECTED' | 'UNDER_ATTACK' | 'AUTHENTICATION_REQUIRED';

export interface ToolDef {
  name: string;
  capability: Capability;
  description: string;
}

export interface ToolRequest {
  id: string;
  runId: string;
  tool: string;
  capability: Capability;
  args: Record<string, unknown>;
  argsHash: string;
  decision: Decision;
  reason: string;
  executed: boolean;
  timestamp: number;
}

export interface AuditEvent {
  id: string;
  type: EventType;
  message: string;
  detail?: string;
  timestamp: number;
  severity: 'info' | 'warn' | 'threat' | 'ok';
}

export type EventType =
  | 'AGENT_INIT'
  | 'EXTERNAL_READ'
  | 'TAINT_CHANGED'
  | 'TOOL_REQUESTED'
  | 'CAPABILITY_LOOKUP'
  | 'TAINT_CHECK'
  | 'POLICY_EVALUATED'
  | 'APPROVAL_REQUIRED'
  | 'APPROVAL_GRANTED'
  | 'APPROVAL_DENIED'
  | 'TOOL_BLOCKED'
  | 'TOOL_ALLOWED'
  | 'EXFILTRATION_BLOCKED'
  | 'EXFILTRATION_SUCCESS'
  | 'ATTACK_COMPLETED'
  | 'SYSTEM_READY'
  | 'INTERCEPTOR_ACTIVE';

export interface ApprovalRequest {
  id: string;
  runId: string;
  tool: string;
  capability: Capability;
  argsHash: string;
  args: Record<string, unknown>;
  action: string;
  taint: TaintState;
  token: string | null;
  status: 'PENDING' | 'APPROVED' | 'DENIED' | 'EXPIRED';
  createdAt: number;
}

export interface AttackerPayload {
  id: string;
  tool: string;
  data: string;
  status: 'EXFILTRATED' | 'BLOCKED';
  timestamp: number;
}

export interface SimStep {
  id: string;
  label: string;
  detail: string;
  progress: number;
  threatLevel: 'safe' | 'warn' | 'threat';
}

export interface AuthState {
  authenticated: boolean;
  method: 'otp' | 'webauthn' | 'fallback' | null;
  credentialId: string | null;
  username: string | null;
}
