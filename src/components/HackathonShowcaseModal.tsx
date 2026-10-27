import React, { useState } from 'react';
import {
  X,
  Shield,
  Zap,
  TrendingUp,
  Cpu,
  Users,
  CheckCircle2,
  FileText,
  Lock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface HackathonShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HackathonShowcaseModal: React.FC<HackathonShowcaseModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'architecture' | 'pilot' | 'team'>('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#0D121F] border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0A0E18] border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFCC00] text-slate-950 flex items-center justify-center font-black text-2xl shadow-md">
              🐘
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  MoMo Agent Pay
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#FFCC00]/15 text-[#FFCC00] border border-[#FFCC00]/30 uppercase tracking-wider">
                  Team 032 Elephants
                </span>
              </div>
              <p className="text-xs text-slate-400">
                MTN Group Technology Hackathon 2026 · Showcase, 28 October
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 bg-[#0E1424] border-b border-slate-800 flex gap-2 overflow-x-auto shrink-0">
          {[
            { id: 'overview', label: 'Problem & Thesis' },
            { id: 'architecture', label: 'Architecture & Benchmarks' },
            { id: 'pilot', label: '6 Steps to Pilot' },
            { id: 'team', label: 'Team 032' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[#FFCC00] text-[#FFCC00]'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Thesis Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-[#12192B] border border-slate-700/80">
                <span className="text-xs font-bold uppercase tracking-wider text-[#FFCC00]">
                  Core System Thesis
                </span>
                <h3 className="text-xl font-extrabold text-white mt-1 italic tracking-tight">
                  “The agent proposes. The mandate service disposes.”
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  A consent, standing mandate and adaptive risk layer enabling AI agents to pay on MTN MoMo safely without granting models unrestricted custody of customer funds.
                </p>
              </div>

              {/* The Problem Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#FFCC00]" />
                    <span>The Customer Pain (Nomsa)</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Nomsa pays 4 bills every month: electricity on the 1st, airtime for her mother weekly, school fees in January, stokvel on the 25th. Every single one, she types out in a manual USSD session by hand.
                  </p>
                  <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-800">
                    <strong>70.8 million</strong> monthly active MoMo users. <strong>13 billion</strong> transactions in H1 2026 (~50,000/minute).
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>The Current Limitation</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Every MTN assistant goes read-only the moment money appears. Not because AI cannot propose payments, but because MoMo currently has no primitive for delegated agent permissions.
                  </p>
                  <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-800">
                    Mastercard launched card-based agent payments in 2025. MoMo Agent Pay establishes the first mobile-money equivalent.
                  </div>
                </div>
              </div>

              {/* The Economic Impact */}
              <div className="p-4 rounded-xl bg-[#091522] border border-blue-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                    MTN Strategic Target
                  </span>
                  <div className="text-2xl font-black text-white mt-0.5">
                    37.4% → 50%+
                  </div>
                  <p className="text-xs text-slate-300">
                    Advanced services share of MoMo revenue target by 2030. Agent-initiated recurring payments unlock dormant wallets (3m of 11m in SA, 5m of 30m+ in Nigeria).
                  </p>
                </div>
                <div className="text-right sm:border-l sm:border-blue-900/50 sm:pl-4 shrink-0">
                  <div className="text-lg font-extrabold text-[#FFCC00]">R30bn</div>
                  <div className="text-[11px] text-slate-400">Projected AI value creation (3-5 yrs)</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="space-y-6">
              {/* Architecture flow */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white">
                  Payment Lifecycle & Enforcement Pipeline
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-mono font-bold text-[#FFCC00] block mb-1">
                      01. PROPOSAL
                    </span>
                    <strong className="text-white block">LLM Assistant</strong>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Claude / Gemini parses user intent and proposes payment amount & payee. Zero direct custody.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-mono font-bold text-blue-400 block mb-1">
                      02. HARD LIMITS
                    </span>
                    <strong className="text-white block">Mandate Service</strong>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Sub-millisecond checks: active mandate, category scope, tx cap (R500), monthly cap (R1000).
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-mono font-bold text-amber-400 block mb-1">
                      03. RISK GATE
                    </span>
                    <strong className="text-white block">Adaptive Engine</strong>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Evaluates SIM swap, night timing, first payee, velocity. Risk ≥ 0.70 blocks; ≥ 0.25 steps-up.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-mono font-bold text-emerald-400 block mb-1">
                      04. SETTLEMENT
                    </span>
                    <strong className="text-white block">MoMo API</strong>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Only called after SHA-256 audit block is recorded. If blocked, MoMo API is never invoked.
                    </p>
                  </div>
                </div>
              </div>

              {/* Benchmarks Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <div className="text-2xl font-black text-[#FFCC00] font-mono">6.9 ms</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">p50 decision latency</div>
                  <div className="text-[10px] text-slate-500">(p95 11.3 ms)</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <div className="text-2xl font-black text-white font-mono">340 / s</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Decisions per second</div>
                  <div className="text-[10px] text-slate-500">Untuned 4-vCPU box</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <div className="text-2xl font-black text-emerald-400 font-mono">0 tokens</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">LLM tokens on execution</div>
                  <div className="text-[10px] text-slate-500">Deterministic gateway</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <div className="text-2xl font-black text-blue-400 font-mono">90.5%</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Synthetic fraud stopped</div>
                  <div className="text-[10px] text-slate-500">Rules + Risk model</div>
                </div>
              </div>

              {/* Cryptographic Non-repudiation */}
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1.5">
                <h5 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-[#FFCC00]" />
                  <span>Tamper-Evident SHA-256 Ledger</span>
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Every proposal, PIN confirmation, block decision, and MoMo settlement ID is committed to a hash-chained cryptographic ledger before funds can move. If any record is modified, the hash chain breaks instantly upon verification.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'pilot' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white">
                Six Things That Turn This POC into an MTN Pilot (Slide 12)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  {
                    num: '1',
                    title: 'Named Product Owner',
                    desc: 'In MTN Group Fintech to champion the agentic commerce track.',
                  },
                  {
                    num: '2',
                    title: 'Pre-Approval in Production',
                    desc: 'Confirmed for initial launch markets (Eswatini: 558k users, Zambia: 4.16m users).',
                  },
                  {
                    num: '3',
                    title: 'SIM Swap API Access',
                    desc: 'Connect our demo switch directly to the live Chenosis SIM Swap API.',
                  },
                  {
                    num: '4',
                    title: 'Labelled Fraud Extract',
                    desc: 'From one OpCo to replace synthetic data with empirical production patterns.',
                  },
                  {
                    num: '5',
                    title: 'Azure In-Country Environment',
                    desc: 'For local compliance, POPIA/data sovereignty, and production load-testing.',
                  },
                  {
                    num: '6',
                    title: 'Regulatory-Sandbox Pilot',
                    desc: 'MoMo first under South African Reserve Bank (SARB) or Bank of Zambia guidelines.',
                  },
                ].map((item) => (
                  <div
                    key={item.num}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#FFCC00] text-slate-950 font-black flex items-center justify-center shrink-0">
                      {item.num}
                    </div>
                    <div>
                      <h5 className="font-bold text-white text-xs">{item.title}</h5>
                      <p className="text-slate-400 text-[11px] mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Team 032 Elephants</h4>
                  <p className="text-xs text-slate-400">South Africa · Eswatini · Zambia</p>
                </div>
                <span className="text-xs text-[#FFCC00] font-semibold">
                  MTN Technology Hackathon 2026
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  {
                    initials: 'VM',
                    name: 'Vuyani Mofolo',
                    role: 'Lead, Product',
                    bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                  },
                  {
                    initials: 'MT',
                    name: 'Matthews Thekiso',
                    role: 'Full Stack Engineer',
                    bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
                  },
                  {
                    initials: 'EM',
                    name: 'Emmanuel Mukanku',
                    role: 'Full Stack Engineer',
                    bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
                  },
                  {
                    initials: 'SM',
                    name: 'Shepard Mwamba',
                    role: 'Machine Learning',
                    bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
                  },
                ].map((member) => (
                  <div
                    key={member.name}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center border text-xs shrink-0 ${member.bg}`}
                    >
                      {member.initials}
                    </div>
                    <div>
                      <h5 className="font-bold text-white">{member.name}</h5>
                      <p className="text-slate-400 text-[11px]">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-slate-500 italic pt-2">
                "Everything in the entry is assigned to MTN under clause 8 of the T&Cs. The agent proposes. The mandate service disposes."
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#0A0E18] border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400 font-sans">
            Built for MTN Group Technology Hackathon 2026 Showcase
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#FFCC00] hover:bg-[#E5B800] text-slate-950 font-bold rounded-lg text-xs transition-colors"
          >
            Back to Interactive POC
          </button>
        </div>
      </div>
    </div>
  );
};
