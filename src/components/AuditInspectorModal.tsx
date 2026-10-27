import React from 'react';
import { X, ShieldCheck, Hash, Clock, User, Link, Copy, Check } from 'lucide-react';
import { AuditEntry } from '../types/index.ts';

interface AuditInspectorModalProps {
  entry: AuditEntry | null;
  entryIndex: number;
  onClose: () => void;
}

export const AuditInspectorModal: React.FC<AuditInspectorModalProps> = ({
  entry,
  entryIndex,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!entry) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(entry, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#101524] border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#0C101C] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#FFCC00]/15 text-[#FFCC00]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Cryptographic Block #{entryIndex + 1}
              </h3>
              <p className="text-[11px] text-slate-400">
                MoMo Mandate SHA-256 Non-Repudiation Proof
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 font-mono text-xs">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 font-sans">
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                Actor / Principal
              </span>
              <span className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                <User className="w-3.5 h-3.5 text-[#FFCC00]" />
                {entry.who}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                Event Signature
              </span>
              <span className="text-sm font-bold text-emerald-400 mt-0.5 block truncate">
                {entry.event}
              </span>
            </div>
          </div>

          {/* Details */}
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold font-sans block mb-1">
              Event Details (Canonical Payload)
            </span>
            <div className="p-3 bg-black/50 border border-slate-800 rounded-lg text-slate-200 break-words leading-relaxed">
              {entry.details}
            </div>
          </div>

          {/* Timestamp */}
          <div className="flex items-center gap-2 text-slate-400 font-sans text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>Timestamp: <strong className="text-white font-mono">{entry.time}</strong></span>
          </div>

          {/* Previous Hash Link */}
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold font-sans flex items-center gap-1 mb-1">
              <Link className="w-3 h-3 text-[#FFCC00]" />
              <span>Previous Block Hash (p)</span>
            </span>
            <div className="p-2.5 bg-black/60 border border-slate-800 rounded-lg text-[11px] text-slate-400 break-all select-all">
              {entry.previousHash}
            </div>
          </div>

          {/* Current Block Hash */}
          <div>
            <span className="text-[10px] text-[#FFCC00] uppercase font-semibold font-sans flex items-center gap-1 mb-1">
              <Hash className="w-3 h-3" />
              <span>Current Block Hash (h = SHA-256(p + who + event + details + time))</span>
            </span>
            <div className="p-2.5 bg-[#FFCC00]/5 border border-[#FFCC00]/30 rounded-lg text-[11px] text-[#FFCC00] break-all select-all font-bold">
              {entry.hash}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#0C101C] border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy JSON Entry</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#FFCC00] hover:bg-[#E5B800] text-slate-950 font-bold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
