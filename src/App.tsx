/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header.tsx';
import { PhoneSimulator } from './components/PhoneSimulator.tsx';
import { DecisionFeed } from './components/DecisionFeed.tsx';
import { AuditLogView } from './components/AuditLogView.tsx';
import { HackathonShowcaseModal } from './components/HackathonShowcaseModal.tsx';
import {
  Mandate,
  PaymentDecision,
  AuditEntry,
  ChatMessage,
  SimulationFlags,
  PendingAuthorization,
  PayeeKey,
} from './types/index.ts';
import {
  PAYEES,
  DEFAULT_MANDATE,
  evaluateProposal,
  createAuditEntry,
  verifyAuditChain,
  formatRand,
} from './logic/mandateEngine.ts';

const SCENES = [
  'Grant permission by USSD',
  'Pay R200 electricity (asks for PIN)',
  'Pay R150 electricity (settles)',
  'SIM swapped, pay R300 school (blocked)',
  'Say STOP (kill-switch)',
];

export default function App() {
  // Application State
  const [mandate, setMandate] = useState<Mandate | null>(null);
  const [spentThisMonth, setSpentThisMonth] = useState<number>(0);
  const [knownPayees, setKnownPayees] = useState<Set<PayeeKey>>(new Set());
  const [recentPaymentTimestamps, setRecentPaymentTimestamps] = useState<number[]>([]);
  const [decisions, setDecisions] = useState<PaymentDecision[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const lastHashRef = React.useRef<string>('0');
  const [lastPayment, setLastPayment] = useState<{ key: PayeeKey; amount: number } | null>(null);

  // Phone State
  const [phoneTab, setPhoneTab] = useState<'chat' | 'ussd'>('chat');
  const [isUssdDialed, setIsUssdDialed] = useState<boolean>(false);
  const [pendingAuth, setPendingAuth] = useState<PendingAuthorization | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Simulation Controls & Guided Steps
  const [flags, setFlags] = useState<SimulationFlags>({
    simSwapped: false,
    nightHours: false,
    newDevice: false,
    highVelocity: false,
  });
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [showDeckModal, setShowDeckModal] = useState<boolean>(false);

  // Verification State
  const [verificationResult, setVerificationResult] = useState<{
    status: 'idle' | 'verifying' | 'valid' | 'invalid';
    verifiedCount: number;
    brokenIndex?: number;
  }>({ status: 'idle', verifiedCount: 0 });

  // Reset demo state
  const resetDemo = useCallback(() => {
    setMandate(null);
    setSpentThisMonth(0);
    setKnownPayees(new Set());
    setRecentPaymentTimestamps([]);
    setDecisions([]);
    setAuditLog([]);
    lastHashRef.current = '0';
    auditQueueRef.current = Promise.resolve();
    setLastPayment(null);
    setPhoneTab('chat');
    setIsUssdDialed(false);
    setPendingAuth(null);
    setFlags({
      simSwapped: false,
      nightHours: false,
      newDevice: false,
      highVelocity: false,
    });
    setCurrentStep(0);
    setVerificationResult({ status: 'idle', verifiedCount: 0 });

    const initialTime = new Date().toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
    setChatMessages([
      {
        id: 'msg-init-1',
        sender: 'agent',
        text: 'Hi Nomsa. Once you give me a permission via USSD, I can pay your bills inside your limits. Try “pay R200 electricity”.',
        timestamp: initialTime,
      },
    ]);
  }, []);

  useEffect(() => {
    resetDemo();
  }, [resetDemo]);

  // Sequential queue for cryptographic audit ledger
  const auditQueueRef = React.useRef<Promise<unknown>>(Promise.resolve());

  // Append entry to cryptographic ledger strictly in sequence
  const logAudit = useCallback(
    (
      who: 'NOMSA' | 'AGENT' | 'SERVICE' | 'MOMO',
      event: string,
      details: string,
      payload?: Record<string, unknown>
    ): Promise<string> => {
      return new Promise<string>((resolve) => {
        auditQueueRef.current = auditQueueRef.current.then(async () => {
          const entry = await createAuditEntry(
            lastHashRef.current,
            who,
            event,
            details,
            undefined,
            payload
          );
          lastHashRef.current = entry.hash;
          setAuditLog((prev) => [...prev, entry]);
          resolve(entry.hash);
        });
      });
    },
    []
  );

  const addAgentMessage = (text: string, badge?: string) => {
    const time = new Date().toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg-agent-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        sender: 'agent',
        text,
        timestamp: time,
        badge,
      },
    ]);
  };

  const addUserMessage = (text: string) => {
    const time = new Date().toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg-nomsa-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        sender: 'nomsa',
        text,
        timestamp: time,
      },
    ]);
  };

  // USSD Grant Mandate Flow
  const handleGrantMandate = async (pin: string): Promise<boolean> => {
    if (pin !== '1234') return false;

    const newMandate: Mandate = { ...DEFAULT_MANDATE, active: true };
    setMandate(newMandate);
    setIsUssdDialed(false);

    await logAudit(
      'NOMSA',
      'mandate.granted',
      'via USSD session *130*AGENT#, R500 tx cap, R1000 monthly cap, 90 days',
      { txLimit: 500, monthlyLimit: 1000, categories: newMandate.categories }
    );
    await logAudit(
      'MOMO',
      'momo.preapproval.successful',
      'standing pre-approval token issued for Household Agent, valid 90 days'
    );

    setPhoneTab('chat');
    addAgentMessage(
      'Permission set! I can pay electricity, airtime, school fees, and stokvel inside your limits. Reply STOP at any time to pause me.',
      'MANDATE ACTIVE'
    );
    return true;
  };

  // Settle Payment on MoMo Gateway
  const settlePayment = async (
    payeeKey: PayeeKey,
    amount: number,
    riskScore: number,
    reasons: string[],
    isApprovedViaPin: boolean = false
  ) => {
    const payee = PAYEES[payeeKey];
    const txnId = `mock-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    await logAudit(
      'SERVICE',
      'payment.submitted',
      `risk ${riskScore.toFixed(2)} · dispatching to MoMo rails for settlement`,
      { amount, payee: payee.name, risk: riskScore }
    );

    const newDecision: PaymentDecision = {
      id: `dec-${Date.now()}`,
      payeeKey,
      payeeName: payee.name,
      category: payee.category,
      amount,
      outcome: 'SETTLED',
      riskScore,
      reasons,
      transactionId: txnId,
      timestamp,
      approvedViaPin: isApprovedViaPin,
    };

    setDecisions((prev) => [newDecision, ...prev]);
    setSpentThisMonth((prev) => prev + amount);
    setKnownPayees((prev) => new Set(prev).add(payeeKey));
    setRecentPaymentTimestamps((prev) => [...prev, Date.now()]);

    await logAudit('MOMO', 'payment.settled', `tx:${txnId} · settled R${amount} to ${payee.name}`);

    const remaining = mandate ? Math.max(0, mandate.monthlyLimit - (spentThisMonth + amount)) : 0;
    addAgentMessage(
      `Paid ${formatRand(amount)} to ${payee.name}. ${formatRand(remaining)} remaining this month. Reply STOP to pause me.`,
      'PAYMENT SETTLED'
    );
  };

  // Propose Payment to Mandate Gateway
  const handleProposePayment = async (
    payeeKey: PayeeKey,
    amount: number,
    flagOverrides?: Partial<SimulationFlags>
  ) => {
    setLastPayment({ key: payeeKey, amount });
    const activeFlags = { ...flags, ...flagOverrides };
    const payee = PAYEES[payeeKey] || {
      name: 'Unknown Payee',
      category: 'Unknown',
      defaultAmount: amount,
      iconName: 'HelpCircle',
    };

    await logAudit(
      'AGENT',
      'payment.proposed',
      `R${amount} ${payee.name} [category: ${payee.category}]`
    );

    const evalResult = evaluateProposal({
      mandate,
      spentThisMonth,
      knownPayees,
      recentPaymentTimestamps,
      flags: activeFlags,
      payeeKey,
      amount,
    });

    const timestamp = new Date().toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    if (evalResult.outcome === 'BLOCKED') {
      const newDecision: PaymentDecision = {
        id: `dec-${Date.now()}`,
        payeeKey,
        payeeName: payee.name,
        category: payee.category,
        amount,
        outcome: 'BLOCKED',
        riskScore: evalResult.riskScore,
        reasons: evalResult.reasons,
        ruleViolation: evalResult.ruleViolation,
        timestamp,
      };

      setDecisions((prev) => [newDecision, ...prev]);

      if (evalResult.isHardBlock) {
        await logAudit(
          'SERVICE',
          'payment.blocked',
          `hard rule violation: ${evalResult.ruleViolation}`
        );
        addAgentMessage(
          `I cannot pay ${formatRand(amount)} to ${payee.name}: ${evalResult.ruleViolation} Your limits stay as you set them.`,
          'GATEWAY BLOCKED'
        );
      } else {
        await logAudit(
          'SERVICE',
          'payment.blocked',
          `risk ${evalResult.riskScore.toFixed(2)}: ${evalResult.reasons.join('; ')}`
        );
        addAgentMessage(
          `I stopped ${formatRand(amount)} to ${payee.name}. ${evalResult.reasons.join('. ')}. Your money has not moved.`,
          'RISK AGENT BLOCKED'
        );
      }
      return;
    }

    if (evalResult.outcome === 'STEP_UP') {
      await logAudit(
        'SERVICE',
        'payment.step_up',
        `risk ${evalResult.riskScore.toFixed(2)} · prompting customer for PIN approval`
      );

      setPendingAuth({
        payeeKey,
        payeeName: payee.name,
        category: payee.category,
        amount,
        riskScore: evalResult.riskScore,
        reasons: evalResult.reasons,
      });

      setPhoneTab('chat');
      return;
    }

    // Settled automatically
    await settlePayment(payeeKey, amount, evalResult.riskScore, evalResult.reasons, false);
  };

  // Step-Up Approvals
  const handleApprovePending = async (pin: string): Promise<boolean> => {
    if (pin !== '1234' || !pendingAuth) return false;

    const current = pendingAuth;
    setPendingAuth(null);

    await logAudit('NOMSA', 'pin.confirmed', `first payment to ${current.payeeName} approved with PIN`);
    await settlePayment(
      current.payeeKey,
      current.amount,
      current.riskScore,
      ['Nomsa approved with PIN', ...current.reasons],
      true
    );
    return true;
  };

  const handleDeclinePending = async () => {
    if (!pendingAuth) return;
    const current = pendingAuth;
    setPendingAuth(null);

    const timestamp = new Date().toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const newDecision: PaymentDecision = {
      id: `dec-${Date.now()}`,
      payeeKey: current.payeeKey,
      payeeName: current.payeeName,
      category: current.category,
      amount: current.amount,
      outcome: 'BLOCKED',
      riskScore: current.riskScore,
      reasons: current.reasons,
      ruleViolation: 'Nomsa declined the PIN approval request on her phone.',
      timestamp,
    };

    setDecisions((prev) => [newDecision, ...prev]);
    await logAudit('NOMSA', 'pin.declined', `declined R${current.amount} to ${current.payeeName}`);
    addAgentMessage('Understood, I did not authorize or pay the bill.', 'DECLINED');
  };

  // User chat input dispatch
  const handleSendMessage = async (text: string) => {
    addUserMessage(text);

    // 1. Kill-Switch STOP check (Slide 5)
    if (/^stop$/i.test(text.trim())) {
      if (mandate) {
        setMandate({ ...mandate, active: false });
      }
      setPendingAuth(null);
      await logAudit('NOMSA', 'mandate.revoked', 'customer sent STOP keyword');
      addAgentMessage(
        'Done. I am switched off and cannot pay anything. Dial *130*AGENT# to switch me on again.',
        'MANDATE REVOKED'
      );
      return;
    }

    // 2. Status inquiry
    if (/^status$/i.test(text.trim())) {
      if (!mandate || !mandate.active) {
        addAgentMessage('I am currently switched off. Dial *130*AGENT# to activate me.');
      } else {
        const left = mandate.monthlyLimit - spentThisMonth;
        addAgentMessage(
          `You have spent ${formatRand(spentThisMonth)} of your ${formatRand(
            mandate.monthlyLimit
          )} monthly cap. You have ${formatRand(left)} left until ${mandate.untilDate}.`
        );
      }
      return;
    }

    // 3. Payment command regex parser
    const match = text.match(/pay\s+r?(\d+)\s+([a-zA-Z]+)/i);
    if (match) {
      const amount = parseInt(match[1], 10);
      const payeeInput = match[2].toLowerCase();

      let matchedKey: PayeeKey | null = null;
      if (payeeInput.includes('elec') || payeeInput.includes('power')) matchedKey = 'electricity';
      else if (payeeInput.includes('air') || payeeInput.includes('mama')) matchedKey = 'airtime';
      else if (payeeInput.includes('school') || payeeInput.includes('fees') || payeeInput.includes('thuto'))
        matchedKey = 'school';
      else if (payeeInput.includes('stok') || payeeInput.includes('vel')) matchedKey = 'stokvel';
      else if (payeeInput.includes('spaza') || payeeInput.includes('fresh')) matchedKey = 'spaza';

      if (matchedKey) {
        await handleProposePayment(matchedKey, amount);
        return;
      }
    }

    addAgentMessage(
      'I can pay electricity, airtime, school fees, or stokvel inside your limits. Try saying "pay R150 electricity" or "pay R300 school".'
    );
  };

  // Guided Walkthrough Stepper (Pitch Scenes)
  const handleNextScene = async () => {
    const step = currentStep;
    if (step >= SCENES.length) return;

    if (step === 0) {
      // Scene 0: USSD Grant
      setPhoneTab('ussd');
      setIsUssdDialed(true);
      await handleGrantMandate('1234');
      setCurrentStep(1);
    } else if (step === 1) {
      // Scene 1: Pay R200 electricity (first payment -> asks for PIN)
      if (!mandate || !mandate.active) {
        await handleGrantMandate('1234');
      }
      await handleProposePayment('electricity', 200);
      setCurrentStep(2);
    } else if (step === 2) {
      // Scene 2: Pay R150 electricity (settles)
      // Auto-confirm step 1 PIN if still open
      if (pendingAuth) {
        handleApprovePending('1234');
      }
      await handleProposePayment('electricity', 150);
      setCurrentStep(3);
    } else if (step === 3) {
      // Scene 3: SIM swap flag + pay R300 school (blocked)
      setFlags((prev) => ({ ...prev, simSwapped: true }));
      await handleProposePayment('school', 300, { simSwapped: true });
      setCurrentStep(4);
    } else if (step === 4) {
      // Scene 4: Say STOP
      await handleSendMessage('STOP');
      setCurrentStep(5);
    }
  };

  const handleReplayLast = async () => {
    if (!lastPayment) return;
    await handleProposePayment(lastPayment.key, lastPayment.amount);
  };

  const handleVerifyChain = async () => {
    setVerificationResult({ status: 'verifying', verifiedCount: 0 });
    setTimeout(async () => {
      const result = await verifyAuditChain(auditLog);
      if (result.valid) {
        setVerificationResult({
          status: 'valid',
          verifiedCount: result.verifiedCount,
        });
      } else {
        setVerificationResult({
          status: 'invalid',
          verifiedCount: result.verifiedCount,
          brokenIndex: result.brokenIndex,
        });
      }
    }, 250);
  };

  const handleTriggerStandingPayment = async () => {
    await handleProposePayment('electricity', 100);
  };

  const totalSettled = decisions
    .filter((d) => d.outcome === 'SETTLED')
    .reduce((acc, d) => acc + d.amount, 0);

  const totalStopped = decisions
    .filter((d) => d.outcome === 'BLOCKED')
    .reduce((acc, d) => acc + d.amount, 0);

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col font-sans">
      {/* Top Bar */}
      <Header
        flags={flags}
        onToggleFlag={(key) => setFlags((prev) => ({ ...prev, [key]: !prev[key] }))}
        currentStep={currentStep}
        totalSteps={SCENES.length}
        nextSceneLabel={SCENES[currentStep] || 'Complete'}
        onNextScene={handleNextScene}
        onReplayLast={handleReplayLast}
        onReset={resetDemo}
        onOpenDeck={() => setShowDeckModal(true)}
        hasLastPayment={lastPayment !== null}
      />

      {/* Main 3-Column Cockpit Layout */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto px-4 py-4 sm:px-6 sm:py-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Column 1: Her Phone */}
        <section className="lg:col-span-4 flex flex-col">
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-[#FFCC00]">
              Her Phone (Nomsa)
            </h2>
            <span className="text-[11px] text-slate-400">
              Customer Touchpoint & Consent
            </span>
          </div>

          <PhoneSimulator
            mandate={mandate}
            spentThisMonth={spentThisMonth}
            chatMessages={chatMessages}
            pendingAuth={pendingAuth}
            activeTab={phoneTab}
            onTabChange={setPhoneTab}
            onSendMessage={handleSendMessage}
            onGrantMandate={handleGrantMandate}
            onApprovePending={handleApprovePending}
            onDeclinePending={handleDeclinePending}
            onTriggerStandingPayment={handleTriggerStandingPayment}
            isUssdDialed={isUssdDialed}
            onDialUssd={() => {
              setPhoneTab('ussd');
              setIsUssdDialed(true);
            }}
          />
        </section>

        {/* Column 2: Every Decision */}
        <section className="lg:col-span-4 flex flex-col">
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">
              Every Decision
            </h2>
            <span className="text-[11px] text-slate-400">
              Mandate & Risk Gateway
            </span>
          </div>

          <DecisionFeed
            decisions={decisions}
            totalSettled={totalSettled}
            totalStopped={totalStopped}
            onProposePayment={handleProposePayment}
          />
        </section>

        {/* Column 3: The Audit Log */}
        <section className="lg:col-span-4 flex flex-col">
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-blue-400">
              The Audit Log
            </h2>
            <span className="text-[11px] text-slate-400">
              Cryptographic Ledger
            </span>
          </div>

          <AuditLogView
            logEntries={auditLog}
            verificationResult={verificationResult}
            onVerifyChain={handleVerifyChain}
          />
        </section>
      </main>

      {/* Showcase & Pitch Deck Modal */}
      <HackathonShowcaseModal
        isOpen={showDeckModal}
        onClose={() => setShowDeckModal(false)}
      />
    </div>
  );
}
