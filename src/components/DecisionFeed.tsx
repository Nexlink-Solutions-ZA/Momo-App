import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  XCircle,
  HelpCircle,
  PlusCircle,
  Zap,
  Phone,
  GraduationCap,
  Users,
  Store,
  Layers,
} from 'lucide-react';
import { PaymentDecision, PayeeKey } from '../types/index.ts';
import { PAYEES, formatRand } from '../logic/mandateEngine.ts';

interface DecisionFeedProps {
  decisions: PaymentDecision[];
  totalSettled: number;
  totalStopped: number;
  onProposePayment: (payeeKey: PayeeKey, amount: number) => void;
}

export const DecisionFeed: React.FC<DecisionFeedProps> = ({
  decisions,
  totalSettled,
  totalStopped,
  onProposePayment,
}) => {
  const [customPayee, setCustomPayee] = useState<PayeeKey>('electricity');
  const [customAmount, setCustomAmount] = useState<number>(150);
  const [showCustomBar, setShowCustomBar] = useState(false);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customAmount <= 0) return;
    onProposePayment(customPayee, customAmount);
  };

  const getPayeeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap':
        return <Zap className="w-3.5 h-3.5 text-[#FFCC00]" />;
      case 'Phone':
        return <Phone className="w-3.5 h-3.5 text-blue-400" />;
      case 'GraduationCap':
        return <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Users':
        return <Users className="w-3.5 h-3.5 text-purple-400" />;
      case 'Store':
        return <Store className="w-3.5 h-3.5 text-orange-400" />;
      default:
        return <HelpCircle className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="bg-[#101522] border border-slate-800 rounded-2xl p-4 flex flex-col h-[770px]">
      {/* Header & Stats Banner */}
      <div className="pb-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Every Decision</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {decisions.length} proposals
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            What the agent asked to pay, and what the mandate service decided.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold">
          <div className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Settled: {formatRand(totalSettled)}</span>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Stopped: {formatRand(totalStopped)}</span>
          </div>
        </div>
      </div>

      {/* Custom Test Proposal Drawer / Toggle */}
      <div className="py-2.5 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-300">
            Simulation Playground
          </span>
          <button
            type="button"
            onClick={() => setShowCustomBar(!showCustomBar)}
            className="text-xs text-[#FFCC00] hover:underline font-semibold flex items-center gap-1"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{showCustomBar ? 'Hide Proposer' : 'Test Custom Bill'}</span>
          </button>
        </div>

        {showCustomBar && (
          <form
            onSubmit={handleCustomSubmit}
            className="mt-2.5 p-2.5 bg-slate-900/80 rounded-xl border border-slate-700/80 flex flex-wrap items-center gap-2 text-xs"
          >
            <label className="flex items-center gap-1 text-slate-300">
              <span>Payee:</span>
              <select
                value={customPayee}
                onChange={(e) => setCustomPayee(e.target.value as PayeeKey)}
                className="bg-black/60 border border-slate-700 rounded-md px-2 py-1 text-white focus:outline-none focus:border-[#FFCC00]"
              >
                {Object.entries(PAYEES).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.name} ({info.category})
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-1 text-slate-300">
              <span>Amount (R):</span>
              <input
                type="number"
                min={10}
                max={2000}
                value={customAmount}
                onChange={(e) => setCustomAmount(Number(e.target.value))}
                className="w-20 bg-black/60 border border-slate-700 rounded-md px-2 py-1 text-white text-right focus:outline-none focus:border-[#FFCC00]"
              />
            </label>

            <button
              type="submit"
              className="ml-auto px-3 py-1 bg-[#FFCC00] hover:bg-[#E5B800] text-slate-950 font-bold rounded-md transition-colors"
            >
              Propose to Gateway
            </button>
          </form>
        )}
      </div>

      {/* Decisions Stream */}
      <div className="flex-1 overflow-y-auto space-y-3 pt-3 pr-1">
        {decisions.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
            <Layers className="w-10 h-10 stroke-1 text-slate-600" />
            <h4 className="text-sm font-semibold text-slate-400">
              No Proposals Yet
            </h4>
            <p className="text-xs max-w-xs">
              Grant a permission in the phone simulator, then click the Next Scene button or chat with the agent to observe mandate decisions.
            </p>
          </div>
        ) : (
          decisions.map((dec) => {
            const isSettled = dec.outcome === 'SETTLED';
            const isBlocked = dec.outcome === 'BLOCKED';
            const isStepUp = dec.outcome === 'STEP_UP';
            const payee = PAYEES[dec.payeeKey];

            return (
              <div
                key={dec.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isSettled
                    ? 'bg-[#121929]/90 border-emerald-800/40 hover:border-emerald-700/60'
                    : isBlocked
                    ? 'bg-[#1A131C]/90 border-rose-800/50 hover:border-rose-700/70'
                    : 'bg-[#1A1813]/90 border-amber-800/50'
                }`}
              >
                {/* Header row: Payee & Amount */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-800/90 flex items-center justify-center shrink-0 border border-slate-700/60">
                      {getPayeeIcon(payee?.iconName || '')}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white leading-tight">
                        {dec.payeeName}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {dec.category} · {dec.timestamp}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold font-mono text-white">
                      {formatRand(dec.amount)}
                    </span>
                    <div className="mt-0.5">
                      {isSettled && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 tracking-wider">
                          Settled
                        </span>
                      )}
                      {isBlocked && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 tracking-wider">
                          Blocked
                        </span>
                      )}
                      {isStepUp && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 tracking-wider">
                          PIN Step-Up
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Risk score bar & context */}
                <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">Risk Score:</span>
                    <span
                      className={`font-mono font-bold ${
                        dec.riskScore >= 0.7
                          ? 'text-rose-400'
                          : dec.riskScore >= 0.25
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {dec.riskScore.toFixed(2)}
                    </span>
                    <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full ${
                          dec.riskScore >= 0.7
                            ? 'bg-rose-500'
                            : dec.riskScore >= 0.25
                            ? 'bg-amber-400'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.round(dec.riskScore * 100)}%` }}
                      />
                    </div>
                  </div>

                  {dec.transactionId && (
                    <span className="text-[10px] font-mono text-slate-500">
                      MoMo: {dec.transactionId}
                    </span>
                  )}
                </div>

                {/* Reason tags */}
                {dec.reasons && dec.reasons.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {dec.reasons.map((r, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-900/90 text-slate-300 border border-slate-800"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                )}

                {/* Rule violation explanation */}
                {dec.ruleViolation && (
                  <div className="mt-2 text-[11px] text-rose-300 font-medium bg-rose-950/30 p-2 rounded-lg border border-rose-900/40">
                    {dec.ruleViolation}
                  </div>
                )}

                {/* The Signature Pitch Callout for Blocked Payments (Slide 7) */}
                {isBlocked && (
                  <div className="mt-2.5 pt-2 border-t border-rose-900/40 text-[11px] text-rose-300 flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1 text-rose-400">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                      <span>{formatRand(dec.amount)} never left her wallet.</span>
                    </span>
                    <span className="text-slate-400 font-medium">
                      MoMo API was never called.
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
