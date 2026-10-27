export type PayeeKey = 'electricity' | 'airtime' | 'school' | 'stokvel' | 'spaza';

export interface PayeeInfo {
  name: string;
  category: string;
  defaultAmount: number;
  iconName: string;
}

export interface Mandate {
  txLimit: number; // Single transaction limit (e.g. R500)
  monthlyLimit: number; // Monthly total limit (e.g. R1000)
  categories: string[];
  active: boolean;
  untilDate: string;
  standingSchedules?: Array<{
    payeeKey: PayeeKey;
    name: string;
    amount: number;
    frequency: string;
    nextDueInDays: number;
  }>;
}

export type DecisionOutcome = 'SETTLED' | 'STEP_UP' | 'BLOCKED';

export interface PaymentDecision {
  id: string;
  payeeKey: PayeeKey;
  payeeName: string;
  category: string;
  amount: number;
  outcome: DecisionOutcome;
  riskScore: number;
  reasons: string[];
  ruleViolation?: string;
  transactionId?: string;
  timestamp: string;
  approvedViaPin?: boolean;
}

export interface AuditEntry {
  id: string;
  who: 'NOMSA' | 'AGENT' | 'SERVICE' | 'MOMO';
  event: string;
  details: string;
  time: string;
  hash: string;
  previousHash: string;
  payload?: Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  sender: 'nomsa' | 'agent' | 'system';
  text: string;
  timestamp: string;
  badge?: string;
}

export interface SimulationFlags {
  simSwapped: boolean;
  nightHours: boolean;
  newDevice: boolean;
  highVelocity: boolean;
}

export interface PendingAuthorization {
  payeeKey: PayeeKey;
  payeeName: string;
  category: string;
  amount: number;
  riskScore: number;
  reasons: string[];
}
