import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Hash,
  Shield,
  ShieldCheck,
  ShieldOff,
  Clock,
  Send,
  Zap,
  Phone,
  GraduationCap,
  Users,
  Store,
  Wifi,
  Signal,
  Battery,
  AlertCircle,
  CalendarClock,
  KeyRound,
} from 'lucide-react';
import {
  Mandate,
  ChatMessage,
  PendingAuthorization,
  PayeeKey,
} from '../types/index.ts';
import { formatRand } from '../logic/mandateEngine.ts';

interface PhoneSimulatorProps {
  mandate: Mandate | null;
  spentThisMonth: number;
  chatMessages: ChatMessage[];
  pendingAuth: PendingAuthorization | null;
  activeTab: 'chat' | 'ussd';
  onTabChange: (tab: 'chat' | 'ussd') => void;
  onSendMessage: (text: string) => void;
  onGrantMandate: (pin: string) => boolean | Promise<boolean>;
  onApprovePending: (pin: string) => boolean | Promise<boolean>;
  onDeclinePending: () => void;
  onTriggerStandingPayment: () => void;
  isUssdDialed: boolean;
  onDialUssd: () => void;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  mandate,
  spentThisMonth,
  chatMessages,
  pendingAuth,
  activeTab,
  onTabChange,
  onSendMessage,
  onGrantMandate,
  onApprovePending,
  onDeclinePending,
  onTriggerStandingPayment,
  isUssdDialed,
  onDialUssd,
}) => {
  const [inputText, setInputText] = useState('');
  const [ussdPin, setUssdPin] = useState('');
  const [ussdError, setUssdError] = useState('');
  const [stepUpPin, setStepUpPin] = useState('');
  const [stepUpError, setStepUpError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, pendingAuth]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleUssdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ussdPin !== '1234') {
      setUssdError('Incorrect PIN. Demo PIN is 1234.');
      return;
    }
    setUssdError('');
    setUssdPin('');
    onGrantMandate('1234');
  };

  const handleStepUpApprove = (e: React.FormEvent) => {
    e.preventDefault();
    if (stepUpPin !== '1234') {
      setStepUpError('Incorrect PIN. Demo PIN is 1234.');
      return;
    }
    setStepUpError('');
    const success = onApprovePending(stepUpPin);
    if (success) {
      setStepUpPin('');
    }
  };

  const handleStepUpDecline = () => {
    setStepUpError('');
    setStepUpPin('');
    onDeclinePending();
  };

  const budgetPercent = mandate
    ? Math.min(100, Math.round((spentThisMonth / mandate.monthlyLimit) * 100))
    : 0;
  const remainingBudget = mandate ? Math.max(0, mandate.monthlyLimit - spentThisMonth) : 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Phone Shell */}
      <div className="bg-[#111723] rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col h-[670px] relative">
        {/* Phone Notch / Status Bar */}
        <div className="bg-[#0B0F18] px-4 py-2 flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-1.5 font-semibold text-slate-300">
            <span>MTN SA</span>
            <span className="text-slate-600">·</span>
            <span>23:45</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Signal className="w-3 h-3 text-slate-300" />
            <Wifi className="w-3 h-3 text-slate-300" />
            <div className="flex items-center gap-1">
              <span className="text-[10px]">88%</span>
              <Battery className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Tab Switcher inside phone */}
        <div className="px-3 pt-2 pb-1.5 bg-[#0F1420] border-b border-slate-800/80 flex gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => onTabChange('chat')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'chat'
                ? 'bg-[#FFCC00] text-slate-950 shadow-sm'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat (Household Agent)</span>
          </button>
          <button
            type="button"
            onClick={() => onTabChange('ussd')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'ussd'
                ? 'bg-[#FFCC00] text-slate-950 shadow-sm'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            <span>USSD (*130*AGENT#)</span>
          </button>
        </div>

        {/* Active Tab View */}
        {activeTab === 'ussd' ? (
          <div className="flex-1 p-4 bg-[#0A0D15] font-mono flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 text-xs text-slate-300">
                <div className="flex items-center gap-2 mb-2 text-slate-400 font-semibold border-b border-slate-800 pb-1">
                  <span>USSD SERVICE CODE</span>
                  <span className="text-[#FFCC00]">*130*AGENT#</span>
                </div>

                {!isUssdDialed ? (
                  <div className="space-y-3 py-2 text-center">
                    <p className="text-slate-400">
                      Standard MTN USSD Mandate Gateway for delegating bill payment authority to your AI assistant.
                    </p>
                    <button
                      type="button"
                      onClick={onDialUssd}
                      className="w-full py-2.5 px-4 bg-[#FFCC00] hover:bg-[#E5B800] text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition-transform active:scale-95"
                    >
                      <Hash className="w-4 h-4" />
                      <span>Dial *130*AGENT#</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 py-1">
                    <p className="text-slate-200 leading-relaxed font-sans text-xs">
                      Allow <strong className="text-white">Household Agent</strong> to pay electricity, airtime, school fees, and stokvel up to <strong className="text-[#FFCC00]">R1,000/month</strong>, maximum <strong className="text-[#FFCC00]">R500/payment</strong>, valid for 90 days?
                    </p>
                    <p className="text-[11px] text-slate-400 font-sans">
                      Enter your MoMo PIN to confirm. You can revoke anytime by texting STOP.
                    </p>

                    <form onSubmit={handleUssdSubmit} className="space-y-2 pt-2">
                      <div className="flex gap-2">
                        <input
                          type="password"
                          inputMode="numeric"
                          maxLength={6}
                          value={ussdPin}
                          onChange={(e) => {
                            setUssdPin(e.target.value);
                            setUssdError('');
                          }}
                          placeholder="Enter PIN (1234)"
                          aria-label="MoMo USSD PIN"
                          className="flex-1 bg-black/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-center tracking-widest text-white placeholder:text-slate-600 focus:outline-none focus:border-[#FFCC00]"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-[#FFCC00] hover:bg-[#E5B800] text-slate-950 font-bold rounded-lg text-xs transition-colors shrink-0"
                        >
                          Send
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-sans">
                        <span>Demo PIN: <strong>1234</strong></span>
                        <button
                          type="button"
                          onClick={() => setUssdPin('1234')}
                          className="text-[#FFCC00] hover:underline"
                        >
                          Auto-fill 1234
                        </button>
                      </div>

                      {ussdError && (
                        <p className="text-xs text-rose-400 font-sans mt-1">{ussdError}</p>
                      )}
                    </form>
                  </div>
                )}
              </div>

              {mandate && mandate.active && (
                <div className="p-3 bg-emerald-950/30 border border-emerald-800/50 rounded-lg text-xs font-sans space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Standing Mandate Active</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Authorized via USSD session. Valid through {mandate.untilDate}.
                  </p>
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-500 text-center font-sans">
              MTN MoMo Emulated USSD Gateway · Zero network charges
            </div>
          </div>
        ) : (
          /* WhatsApp / Chat Tab */
          <div className="flex-1 flex flex-col justify-between bg-[#0B0F19] overflow-hidden relative">
            {/* Chat header banner */}
            <div className="bg-[#121824] px-3 py-2 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#FFCC00] text-slate-950 flex items-center justify-center font-bold text-xs">
                  HA
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-none">
                    Household Agent
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    pays Nomsa's bills within her limits
                  </p>
                </div>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-medium">
                Connected
              </span>
            </div>

            {/* Chat message stream */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
              {chatMessages.map((msg) => {
                const isMe = msg.sender === 'nomsa';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed shadow-sm ${
                        isMe
                          ? 'bg-[#005C4B] text-emerald-50 rounded-tr-none'
                          : 'bg-[#182030] text-slate-200 border border-slate-800 rounded-tl-none'
                      }`}
                    >
                      {msg.badge && (
                        <div className="text-[9px] font-bold uppercase tracking-wider text-[#FFCC00] mb-0.5">
                          {msg.badge}
                        </div>
                      )}
                      <div>{msg.text}</div>
                      <div
                        className={`text-[9px] mt-1 text-right ${
                          isMe ? 'text-emerald-200/60' : 'text-slate-500'
                        }`}
                      >
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* In-Phone Step-Up PIN Modal (Slide 5: "Her PIN, on her phone") */}
            {pendingAuth && (
              <div className="absolute inset-x-0 bottom-0 bg-[#161F30] border-t-2 border-[#FFCC00] p-4 shadow-2xl z-20 rounded-t-2xl animate-in slide-in-from-bottom-6 duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-700/80 mb-2">
                  <div className="flex items-center gap-1.5 text-[#FFCC00] font-bold text-xs uppercase tracking-wider">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>MoMo Payment Approval</span>
                  </div>
                  <span className="text-[10px] text-slate-400">PIN Step-Up</span>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-white">
                    Approve <span className="text-[#FFCC00] font-bold">{formatRand(pendingAuth.amount)}</span> to{' '}
                    <span>{pendingAuth.payeeName}</span>?
                  </p>

                  <p className="text-[11px] text-slate-300">
                    Your agent is asking because{' '}
                    <span className="text-amber-300 font-medium">
                      {pendingAuth.reasons.join('. ')}
                    </span>.
                  </p>

                  <form onSubmit={handleStepUpApprove} className="space-y-2 pt-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="password"
                        inputMode="numeric"
                        maxLength={6}
                        value={stepUpPin}
                        onChange={(e) => {
                          setStepUpPin(e.target.value);
                          setStepUpError('');
                        }}
                        placeholder="Enter PIN (1234)"
                        aria-label="Approval PIN"
                        autoFocus
                        className="flex-1 bg-black/50 border border-slate-600 rounded-lg px-3 py-2 text-center tracking-widest text-white text-sm focus:outline-none focus:border-[#FFCC00]"
                      />
                      <button
                        type="button"
                        onClick={handleStepUpDecline}
                        className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
                      >
                        Decline
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-[#FFCC00] hover:bg-[#E5B800] text-slate-950 font-bold text-xs shadow-md transition-colors"
                      >
                        Approve
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Emulated prompt · Demo PIN is <strong>1234</strong></span>
                      <button
                        type="button"
                        onClick={() => setStepUpPin('1234')}
                        className="text-[#FFCC00] hover:underline"
                      >
                        Fill 1234
                      </button>
                    </div>

                    {stepUpError && (
                      <p className="text-xs text-rose-400">{stepUpError}</p>
                    )}
                  </form>
                </div>
              </div>
            )}

            {/* Quick Action Suggestion Chips */}
            <div className="px-3 pt-2 pb-1 flex flex-wrap gap-1.5 border-t border-slate-800/80 bg-[#0F1422] shrink-0">
              {[
                { label: 'pay R150 electricity', hint: 'within limits' },
                { label: 'pay R300 school', hint: 'school fees' },
                { label: 'pay R100 spaza', hint: 'unauthorized cat' },
                { label: 'status', hint: 'check limits' },
                { label: 'STOP', hint: 'kill-switch' },
              ].map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => onSendMessage(chip.label)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                    chip.label === 'STOP'
                      ? 'bg-rose-950/40 border-rose-800/80 text-rose-300 hover:bg-rose-900/60'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Message input bar */}
            <form
              onSubmit={handleSend}
              className="p-2.5 bg-[#121826] border-t border-slate-800 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Message Household Agent..."
                aria-label="Message Household Agent"
                className="flex-1 bg-black/40 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#FFCC00]"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2 rounded-lg bg-[#FFCC00] hover:bg-[#E5B800] text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                aria-label="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Bottom Permission & Mandate Summary Card (Direct from slide 4 & 6) */}
      <div className="bg-[#121724] border border-slate-800 rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Her Permission
            </h3>
            <span className="text-[10px] text-slate-500">· Mandate Engine</span>
          </div>
          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
              mandate?.active
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                : 'bg-rose-950 text-rose-400 border border-rose-800'
            }`}
          >
            {mandate?.active ? 'Active' : 'Switched Off'}
          </span>
        </div>

        {mandate ? (
          <div className="space-y-2">
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-slate-200">
                Spent <strong className="text-[#FFCC00] font-bold">{formatRand(spentThisMonth)}</strong> of{' '}
                <strong className="text-white">{formatRand(mandate.monthlyLimit)}</strong> this month
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {budgetPercent}%
              </span>
            </div>

            {/* Budget Progress Bar */}
            <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-[#FFCC00] transition-all duration-300"
                style={{ width: `${budgetPercent}%` }}
              />
            </div>

            {/* Mandate Parameters */}
            <div className="text-[11px] text-slate-400 flex flex-wrap gap-x-3 gap-y-1 pt-0.5">
              <span>Up to <strong>{formatRand(mandate.txLimit)}</strong>/payment</span>
              <span>·</span>
              <span>Remaining: <strong className="text-emerald-400">{formatRand(remainingBudget)}</strong></span>
              <span>·</span>
              <span>Until: <strong>{mandate.untilDate}</strong></span>
            </div>

            {/* Allowed Categories */}
            <div className="flex flex-wrap items-center gap-1 pt-1">
              <span className="text-[10px] text-slate-500 uppercase mr-1">Categories:</span>
              {mandate.categories.map((cat) => (
                <span
                  key={cat}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/80"
                >
                  {cat}
                </span>
              ))}
            </div>

            {/* Standing Scheduled Payment preview (Slide 6) */}
            {mandate.standingSchedules && mandate.standingSchedules.length > 0 && (
              <div className="pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <CalendarClock className="w-3.5 h-3.5 text-[#FFCC00]" />
                    <span>Standing Payment Schedule</span>
                  </div>
                  <button
                    type="button"
                    onClick={onTriggerStandingPayment}
                    className="text-[10px] text-[#FFCC00] hover:underline font-semibold"
                  >
                    Run Now
                  </button>
                </div>
                {mandate.standingSchedules.map((sched, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900/70 p-2 rounded-lg border border-slate-800 text-[11px] flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-white">
                        {formatRand(sched.amount)} to {sched.name}
                      </div>
                      <div className="text-slate-500 text-[10px]">
                        {sched.frequency} · next in {sched.nextDueInDays} days
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
                      Auto
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-500">
            No mandate granted yet. Switch to the USSD tab to dial *130*AGENT#.
          </p>
        )}
      </div>
    </div>
  );
};
