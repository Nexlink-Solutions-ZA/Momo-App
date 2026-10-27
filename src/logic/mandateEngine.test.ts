import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateProposal,
  createAuditEntry,
  verifyAuditChain,
  DEFAULT_MANDATE,
  calculateSha256,
} from './mandateEngine.ts';
import { SimulationFlags } from '../types/index.ts';

const baseFlags: SimulationFlags = {
  simSwapped: false,
  nightHours: false,
  newDevice: false,
  highVelocity: false,
};

test('mandateEngine: blocks proposal when mandate is null or inactive', () => {
  const result = evaluateProposal({
    mandate: null,
    spentThisMonth: 0,
    knownPayees: new Set(),
    recentPaymentTimestamps: [],
    flags: baseFlags,
    payeeKey: 'electricity',
    amount: 200,
  });

  assert.equal(result.outcome, 'BLOCKED');
  assert.equal(result.isHardBlock, true);
  assert.match(result.ruleViolation || '', /permission/i);
});

test('mandateEngine: blocks category outside authorized mandate', () => {
  const result = evaluateProposal({
    mandate: DEFAULT_MANDATE,
    spentThisMonth: 0,
    knownPayees: new Set(),
    recentPaymentTimestamps: [],
    flags: baseFlags,
    payeeKey: 'spaza', // Spaza is not in Electricity, Airtime, School, Stokvel
    amount: 100,
  });

  assert.equal(result.outcome, 'BLOCKED');
  assert.equal(result.isHardBlock, true);
  assert.match(result.ruleViolation || '', /Spaza/i);
});

test('mandateEngine: blocks amount exceeding single transaction cap', () => {
  const result = evaluateProposal({
    mandate: DEFAULT_MANDATE, // txLimit is 500
    spentThisMonth: 0,
    knownPayees: new Set(),
    recentPaymentTimestamps: [],
    flags: baseFlags,
    payeeKey: 'electricity',
    amount: 600, // > 500
  });

  assert.equal(result.outcome, 'BLOCKED');
  assert.equal(result.isHardBlock, true);
  assert.match(result.ruleViolation || '', /per-payment limit/i);
});

test('mandateEngine: blocks amount exceeding remaining monthly budget', () => {
  const result = evaluateProposal({
    mandate: DEFAULT_MANDATE, // monthlyLimit is 1000
    spentThisMonth: 850,
    knownPayees: new Set(['electricity']),
    recentPaymentTimestamps: [],
    flags: baseFlags,
    payeeKey: 'electricity',
    amount: 200, // 850 + 200 = 1050 > 1000
  });

  assert.equal(result.outcome, 'BLOCKED');
  assert.equal(result.isHardBlock, true);
  assert.match(result.ruleViolation || '', /monthly limit/i);
});

test('mandateEngine: requires step-up PIN on first payment to payee', () => {
  const result = evaluateProposal({
    mandate: DEFAULT_MANDATE,
    spentThisMonth: 0,
    knownPayees: new Set(), // empty set -> electricity is first time
    recentPaymentTimestamps: [],
    flags: baseFlags,
    payeeKey: 'electricity',
    amount: 200,
  });

  assert.equal(result.outcome, 'STEP_UP');
  assert.ok(result.reasons.some((r) => r.includes('first payment')));
});

test('mandateEngine: blocks with high risk score when SIM swapped yesterday', () => {
  const result = evaluateProposal({
    mandate: DEFAULT_MANDATE,
    spentThisMonth: 0,
    knownPayees: new Set(),
    recentPaymentTimestamps: [],
    flags: { ...baseFlags, simSwapped: true },
    payeeKey: 'school',
    amount: 300,
  });

  assert.equal(result.outcome, 'BLOCKED');
  assert.equal(result.isHardBlock, false);
  assert.ok(result.riskScore >= 0.7);
  assert.ok(result.reasons.some((r) => r.includes('SIM card was changed')));
});

test('mandateEngine: settles automatically when within limits, known payee, low risk', () => {
  const result = evaluateProposal({
    mandate: DEFAULT_MANDATE,
    spentThisMonth: 200,
    knownPayees: new Set(['electricity']),
    recentPaymentTimestamps: [],
    flags: baseFlags,
    payeeKey: 'electricity',
    amount: 150,
  });

  assert.equal(result.outcome, 'SETTLED');
  assert.ok(result.riskScore < 0.25);
  assert.ok(result.reasons.some((r) => r.includes('Within limits, low risk')));
});

test('mandateEngine: generates and verifies cryptographic hash chain', async () => {
  let prevHash = '0';
  const entries = [];

  const entry1 = await createAuditEntry(
    prevHash,
    'NOMSA',
    'mandate.granted',
    'via ussd, R500 tx cap, R1000 monthly cap, 90 days',
    '10:00:01'
  );
  entries.push(entry1);
  prevHash = entry1.hash;

  const entry2 = await createAuditEntry(
    prevHash,
    'AGENT',
    'payment.proposed',
    'R200 Prepaid electricity',
    '10:00:02'
  );
  entries.push(entry2);
  prevHash = entry2.hash;

  const verification = await verifyAuditChain(entries);
  assert.equal(verification.valid, true);
  assert.equal(verification.verifiedCount, 2);

  // If someone tampers with entry1 details:
  const tamperedEntries = [
    { ...entry1, details: 'tampered fake authorization' },
    entry2,
  ];
  const tamperedVerification = await verifyAuditChain(tamperedEntries);
  assert.equal(tamperedVerification.valid, false);
});
