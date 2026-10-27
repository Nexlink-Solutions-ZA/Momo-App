import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Download,
  CheckCircle,
  XCircle,
  FileText,
  Hash,
  ExternalLink,
} from 'lucide-react';
import { AuditEntry } from '../types/index.ts';
import { AuditInspectorModal } from './AuditInspectorModal.tsx';

interface AuditLogViewProps {
  logEntries: AuditEntry[];
  verificationResult: {
    status: 'idle' | 'verifying' | 'valid' | 'invalid';
    verifiedCount: number;
    brokenIndex?: number;
  };
  onVerifyChain: () => void;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({
  logEntries,
  verificationResult,
  onVerifyChain,
}) => {
  const [filterActor, setFilterActor] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEntry, setSelectedEntry] = useState<{
    entry: AuditEntry;
    index: number;
  } | null>(null);

  const filteredEntries = logEntries.filter((entry) => {
    if (filterActor !== 'ALL' && entry.who !== filterActor) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        entry.who.toLowerCase().includes(q) ||
        entry.event.toLowerCase().includes(q) ||
        entry.details.toLowerCase().includes(q) ||
        entry.hash.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExportJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(logEntries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `momo-agent-pay-audit-${Date.now()}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getActorBadge = (who: string) => {
    switch (who) {
      case 'NOMSA':
        return 'text-[#FFCC00] bg-[#FFCC00]/10 border-[#FFCC00]/30';
      case 'AGENT':
        return 'text-blue-400 bg-blue-950/40 border-blue-800/40';
      case 'SERVICE':
        return 'text-purple-400 bg-purple-950/40 border-purple-800/40';
      case 'MOMO':
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="bg-[#101522] border border-slate-800 rounded-2xl p-4 flex flex-col h-[770px]">
      {/* Header & Verification Trigger */}
      <div className="pb-3 border-b border-slate-800 flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#FFCC00]" />
              <span>The Audit Log</span>
            </h2>
            <p className="text-xs text-slate-400">
              Append-only, SHA-256 hash-chained. Written before MoMo is called.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportJson}
            title="Download audit trail as JSON"
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Verification Bar */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onVerifyChain}
            disabled={verificationResult.status === 'verifying' || logEntries.length === 0}
            className="px-3 py-1.5 bg-[#FFCC00] hover:bg-[#E5B800] text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Hash className="w-3.5 h-3.5" />
            <span>
              {verificationResult.status === 'verifying' ? 'Verifying...' : 'Verify Chain'}
            </span>
          </button>

          <div className="flex-1">
            {verificationResult.status === 'valid' && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-950/50 px-2 py-1 rounded-md border border-emerald-800/60">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">
                  Chain intact ({verificationResult.verifiedCount} entries verified)
                </span>
              </span>
            )}

            {verificationResult.status === 'invalid' && (
              <span className="text-xs text-rose-400 font-semibold flex items-center gap-1 bg-rose-950/50 px-2 py-1 rounded-md border border-rose-800/60">
                <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>Chain broken at #{verificationResult.brokenIndex}</span>
              </span>
            )}

            {verificationResult.status === 'idle' && (
              <span className="text-xs text-slate-500 font-mono">
                {logEntries.length} blocks registered
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="py-2.5 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1 text-[11px]">
          {['ALL', 'NOMSA', 'AGENT', 'SERVICE', 'MOMO'].map((actor) => (
            <button
              key={actor}
              type="button"
              onClick={() => setFilterActor(actor)}
              className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                filterActor === actor
                  ? 'bg-slate-200 text-slate-950'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {actor}
            </button>
          ))}
        </div>

        <div className="relative w-36">
          <Search className="w-3 h-3 text-slate-500 absolute left-2 top-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search log..."
            className="w-full bg-black/40 border border-slate-700/80 rounded-md pl-6 pr-2 py-0.5 text-[11px] text-white placeholder:text-slate-500 focus:outline-none focus:border-[#FFCC00]"
          />
        </div>
      </div>

      {/* Audit Log Entries List */}
      <div className="flex-1 overflow-y-auto space-y-2 pt-2.5 font-mono pr-1 text-xs">
        {filteredEntries.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2 font-sans">
            <FileText className="w-8 h-8 stroke-1 text-slate-600" />
            <p className="text-xs">
              No audit records match the current filter.
            </p>
          </div>
        ) : (
          filteredEntries
            .slice()
            .reverse()
            .map((entry, revIdx) => {
              const actualIdx = filteredEntries.length - 1 - revIdx;
              const shortHash = `#${entry.hash.slice(0, 8)}`;
              const shortPrev = `#${entry.previousHash.slice(0, 6)}`;

              return (
                <div
                  key={entry.id}
                  onClick={() =>
                    setSelectedEntry({ entry, index: actualIdx })
                  }
                  className="p-2.5 bg-[#0C101A] hover:bg-[#131929] border border-slate-800/80 hover:border-slate-700 rounded-xl cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <div className="flex items-center gap-1.5 font-sans">
                      <span
                        className={`font-bold px-1.5 py-0.2 rounded text-[10px] border ${getActorBadge(
                          entry.who
                        )}`}
                      >
                        {entry.who}
                      </span>
                      <span className="font-semibold text-slate-200">
                        {entry.event}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      <span>{entry.time}</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#FFCC00]" />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 font-sans break-words line-clamp-2">
                    {entry.details}
                  </p>

                  <div className="mt-1.5 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="truncate max-w-[140px] text-[#FFCC00]/80">
                      {shortHash}
                    </span>
                    <span className="truncate max-w-[120px] text-slate-600">
                      prev: {shortPrev}
                    </span>
                  </div>
                </div>
              );
            })
        )}
      </div>

      {/* Cryptographic Inspector Modal */}
      {selectedEntry && (
        <AuditInspectorModal
          entry={selectedEntry.entry}
          entryIndex={selectedEntry.index}
          onClose={() => setSelectedEntry(null)}
        />
      )}
    </div>
  );
};
