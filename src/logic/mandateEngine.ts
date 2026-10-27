import {
  Mandate,
  PayeeKey,
  PayeeInfo,
  PaymentDecision,
  SimulationFlags,
  AuditEntry,
} from '../types/index.ts';

export const PAYEES: Record<PayeeKey, PayeeInfo> = {
  electricity: {
    name: 'Prepaid electricity (City Power)',
    category: 'Electricity',
    defaultAmount: 200,
    iconName: 'Zap',
  },
  airtime: {
    name: 'Airtime for Mama',
    category: 'Airtime',
    defaultAmount: 50,
    iconName: 'Phone',
  },
  school: {
    name: 'Thuto Primary school fees',
    category: 'School',
    defaultAmount: 300,
    iconName: 'GraduationCap',
  },
  stokvel: {
    name: 'Stokvel contribution',
    category: 'Stokvel',
    defaultAmount: 400,
    iconName: 'Users',
  },
  spaza: {
    name: 'Kasi Fresh spaza',
    category: 'Spaza',
    defaultAmount: 100,
    iconName: 'Store',
  },
};

export const DEFAULT_MANDATE: Mandate = {
  txLimit: 500,
  monthlyLimit: 1000,
  categories: ['Electricity', 'Airtime', 'School', 'Stokvel'],
  active: true,
  untilDate: '24 Jan 2027',
  standingSchedules: [
    {
      payeeKey: 'electricity',
      name: 'Prepaid electricity (City Power)',
      amount: 100,
      frequency: 'Every month',
      nextDueInDays: 29,
    },
  ],
};

export async function calculateSha256(content: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const msgUint8 = new TextEncoder().encode(content);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  try {
    const nodeCrypto = await import('node:crypto');
    return nodeCrypto.createHash('sha256').update(content).digest('hex');
  } catch {
    // Simple deterministic fallback if crypto is unavailable
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(64, '0');
  }
}

export interface EvaluationInput {
  mandate: Mandate | null;
  spentThisMonth: number;
  knownPayees: Set<PayeeKey>;
  recentPaymentTimestamps: number[];
  flags: SimulationFlags;
  payeeKey: PayeeKey;
  amount: number;
}

export interface EvaluationResult {
  outcome: 'SETTLED' | 'STEP_UP' | 'BLOCKED';
  riskScore: number;
  reasons: string[];
  ruleViolation?: string;
  payeeName: string;
  category: string;
  isHardBlock: boolean;
}

export function evaluateProposal(input: EvaluationInput): EvaluationResult {
  const {
    mandate,
    spentThisMonth,
    knownPayees,
    recentPaymentTimestamps,
    flags,
    payeeKey,
    amount,
  } = input;

  const payee = PAYEES[payeeKey] || {
    name: 'Unknown Payee',
    category: 'Other',
    defaultAmount: amount,
    iconName: 'HelpCircle',
  };

  // 1. Hard Rule Checks (The Mandate Rules - 0 tokens, sub-millisecond)
  if (!mandate || !mandate.active) {
    return {
      outcome: 'BLOCKED',
      riskScore: 1.0,
      reasons: ['No active standing mandate found or mandate was revoked with STOP'],
      ruleViolation: 'You have not given me a permission, or it is switched off.',
      payeeName: payee.name,
      category: payee.category,
      isHardBlock: true,
    };
  }

  if (!mandate.categories.includes(payee.category)) {
    return {
      outcome: 'BLOCKED',
      riskScore: 1.0,
      reasons: [`Category "${payee.category}" is outside the authorized mandate scope`],
      ruleViolation: `You have not allowed me to pay this kind of payee (${payee.category}).`,
      payeeName: payee.name,
      category: payee.category,
      isHardBlock: true,
    };
  }

  if (amount > mandate.txLimit) {
    return {
      outcome: 'BLOCKED',
      riskScore: 1.0,
      reasons: [`Requested R${amount} exceeds the R${mandate.txLimit} single payment limit`],
      ruleViolation: `That is above your R${mandate.txLimit} per-payment limit.`,
      payeeName: payee.name,
      category: payee.category,
      isHardBlock: true,
    };
  }

  if (spentThisMonth + amount > mandate.monthlyLimit) {
    return {
      outcome: 'BLOCKED',
      riskScore: 1.0,
      reasons: [
        `Adding R${amount} to spent R${spentThisMonth} exceeds monthly cap of R${mandate.monthlyLimit}`,
      ],
      ruleViolation: `That would go over your monthly limit (R${spentThisMonth} of R${mandate.monthlyLimit} already used).`,
      payeeName: payee.name,
      category: payee.category,
      isHardBlock: true,
    };
  }

  // 2. Risk Evaluation Engine (Deterministic lightweight score + behavioral context)
  const isFirstPayment = !knownPayees.has(payeeKey);
  const reasons: string[] = [];

  let risk = 0.05 + 0.03 * (amount / mandate.txLimit);

  if (isFirstPayment) {
    risk += 0.2;
    reasons.push('It is the first payment to this payee');
  }

  if (flags.simSwapped) {
    risk += 0.6;
    reasons.push('Your SIM card was changed recently');
  }

  if (flags.nightHours) {
    risk += 0.25;
    reasons.push('Payment requested in the middle of the night (02:00)');
  }

  if (flags.newDevice) {
    risk += 0.2;
    reasons.push('Triggered from an unfamiliar or new device');
  }

  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  const recentCount = recentPaymentTimestamps.filter((t) => t > oneHourAgo).length;
  if (flags.highVelocity || recentCount >= 3) {
    risk += 0.15;
    reasons.push('High transaction velocity: multiple payments within the last hour');
  }

  // Normalize risk
  risk = Math.min(0.99, Math.max(0.01, Math.round(risk * 100) / 100));

  // 3. Risk Threshold Decisions
  if (risk >= 0.7) {
    return {
      outcome: 'BLOCKED',
      riskScore: risk,
      reasons,
      payeeName: payee.name,
      category: payee.category,
      isHardBlock: false,
    };
  }

  if (isFirstPayment || risk >= 0.25) {
    return {
      outcome: 'STEP_UP',
      riskScore: risk,
      reasons,
      payeeName: payee.name,
      category: payee.category,
      isHardBlock: false,
    };
  }

  // If low risk and within limits: automatically settled
  reasons.push('Within limits, low risk');
  return {
    outcome: 'SETTLED',
    riskScore: risk,
    reasons,
    payeeName: payee.name,
    category: payee.category,
    isHardBlock: false,
  };
}

export async function createAuditEntry(
  previousHash: string,
  who: 'NOMSA' | 'AGENT' | 'SERVICE' | 'MOMO',
  event: string,
  details: string,
  customTime?: string,
  payload?: Record<string, unknown>
): Promise<AuditEntry> {
  const time =
    customTime ||
    new Date().toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  const rawString = `${previousHash}${who}${event}${details}${time}`;
  const hash = await calculateSha256(rawString);

  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    who,
    event,
    details,
    time,
    hash,
    previousHash,
    payload,
  };
}

export async function verifyAuditChain(
  entries: AuditEntry[]
): Promise<{ valid: boolean; verifiedCount: number; brokenIndex?: number }> {
  let expectedPrev = '0';
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (entry.previousHash !== expectedPrev) {
      return { valid: false, verifiedCount: i, brokenIndex: i };
    }
    const computedHash = await calculateSha256(
      `${expectedPrev}${entry.who}${entry.event}${entry.details}${entry.time}`
    );
    if (computedHash !== entry.hash) {
      return { valid: false, verifiedCount: i, brokenIndex: i };
    }
    expectedPrev = entry.hash;
  }
  return { valid: true, verifiedCount: entries.length };
}

export function formatRand(amount: number): string {
  return `R${amount.toLocaleString('en-ZA')}`;
}
