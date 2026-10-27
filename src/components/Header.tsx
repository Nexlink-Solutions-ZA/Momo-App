import React from 'react';
import {
  RotateCcw,
  Play,
  CheckCircle2,
  BookOpen,
  ShieldAlert,
  Moon,
  Smartphone,
  Info,
} from 'lucide-react';
import { SimulationFlags } from '../types/index.ts';

interface HeaderProps {
  flags: SimulationFlags;
  onToggleFlag: (key: keyof SimulationFlags) => void;
  currentStep: number;
  totalSteps: number;
  nextSceneLabel: string;
  onNextScene: () => void;
  onReplayLast: () => void;
  onReset: () => void;
  onOpenDeck: () => void;
  hasLastPayment: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  flags,
  onToggleFlag,
  currentStep,
  totalSteps,
  nextSceneLabel,
  onNextScene,
  onReplayLast,
  onReset,
  onOpenDeck,
  hasLastPayment,
}) => {
  const isComplete = currentStep >= totalSteps;

  return (
    <header className="border-b border-slate-800 bg-[#0B0F19]/95 backdrop-blur-md sticky top-0 z-30 px-4 py-2.5 sm:px-6 shadow-md">
      <div className="max-w-[1700px] mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand Zone */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FFCC00] text-slate-950 flex items-center justify-center font-extrabold text-lg shadow-sm shrink-0">
            🐘
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-extrabold text-base tracking-tight text-white whitespace-nowrap">
              MoMo Agent Pay
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#FFCC00]/15 text-[#FFCC00] border border-[#FFCC00]/30 tracking-wider">
              POC
            </span>
            <span className="text-xs text-slate-400 hidden xl:inline">
              · MTN Hackathon 2026
            </span>
          </div>
        </div>

        {/* Risk Signal Switches */}
        <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
          <span className="text-[11px] text-slate-400 font-medium px-2 hidden md:inline">
            Risk Signals:
          </span>

          <button
            type="button"
            onClick={() => onToggleFlag('simSwapped')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
              flags.simSwapped
                ? 'bg-rose-950 border-rose-500 text-rose-300 shadow-sm'
                : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            aria-pressed={flags.simSwapped}
          >
            <ShieldAlert className={`w-3.5 h-3.5 ${flags.simSwapped ? 'text-rose-400' : 'text-slate-500'}`} />
            <span className="whitespace-nowrap">SIM swapped</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleFlag('nightHours')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
              flags.nightHours
                ? 'bg-amber-950 border-amber-500 text-amber-300 shadow-sm'
                : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            aria-pressed={flags.nightHours}
          >
            <Moon className={`w-3.5 h-3.5 ${flags.nightHours ? 'text-amber-400' : 'text-slate-500'}`} />
            <span className="whitespace-nowrap">Night 02:00</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleFlag('newDevice')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
              flags.newDevice
                ? 'bg-blue-950 border-blue-500 text-blue-300 shadow-sm'
                : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            aria-pressed={flags.newDevice}
          >
            <Smartphone className={`w-3.5 h-3.5 ${flags.newDevice ? 'text-blue-400' : 'text-slate-500'}`} />
            <span className="whitespace-nowrap">New device</span>
          </button>
        </div>

        {/* Guided Tour & Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onNextScene}
            disabled={isComplete}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
              isComplete
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-[#FFCC00] hover:bg-[#E5B800] text-slate-950 active:scale-95 shadow-[#FFCC00]/20'
            }`}
          >
            {isComplete ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Scenes Completed</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Next Scene: {nextSceneLabel}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onReplayLast}
            disabled={!hasLastPayment}
            title="Replay last payment"
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onReset}
            title="Reset simulation"
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
          >
            Reset
          </button>

          <button
            type="button"
            onClick={onOpenDeck}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FFCC00]/10 hover:bg-[#FFCC00]/20 text-[#FFCC00] border border-[#FFCC00]/30 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Showcase & Deck</span>
          </button>
        </div>
      </div>
    </header>
  );
};
