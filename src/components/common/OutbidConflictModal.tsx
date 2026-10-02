"use client";

import { AlertTriangle, ArrowRight, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface OutbidConflictModalProps {
  isOpen: boolean;
  amountDollars: number;
  categoryName: string;
  onClose: () => void;
  message?: string;
}

export function OutbidConflictModal({
  isOpen,
  amountDollars,
  categoryName,
  onClose,
  message,
}: OutbidConflictModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const displayMessage =
    message || `Somebody else has bid with $${amountDollars.toLocaleString()} in ${categoryName}`;

  const handleReturnToBoard = () => {
    onClose();
    router.push("/");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 shadow-2xl relative text-[var(--foreground)] animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="conflict-title"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--subtle-bg)] transition cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Badge & Icon */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 id="conflict-title" className="text-base font-bold text-[var(--foreground)]">
              Bid Not Accepted
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Timestamp Race Condition
            </p>
          </div>
        </div>

        {/* The Exact Required Popup Notification Message */}
        <div className="p-4 my-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400">
          <p className="text-sm font-bold tracking-tight text-center">
            &ldquo;{displayMessage}&rdquo;
          </p>
        </div>

        {/* Context & Reassurance */}
        <div className="space-y-2 text-xs text-[var(--text-muted)] mb-6">
          <p>
            Another user completed their payment moments before yours with an <strong>earlier verified timestamp</strong>.
          </p>
          <p className="text-[11px] text-[var(--text-dim)]">
            Following platform rules, only the first payment by timestamp is accepted for each outbid slot. Your payment was <strong>not accepted</strong> and no funds were captured.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={handleReturnToBoard}
            className="w-full py-3 px-4 rounded-xl bg-[var(--brand-blue)] hover:bg-[var(--brand-blue-hover)] text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>View Updated Leaderboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 text-xs text-[var(--text-muted)] hover:text-[var(--foreground)] transition cursor-pointer text-center"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
