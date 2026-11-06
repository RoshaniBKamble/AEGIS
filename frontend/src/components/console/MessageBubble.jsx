import { motion } from "framer-motion";
import { RotateCcw, AlertTriangle } from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { ThinkingIndicator } from "@/components/console/ThinkingIndicator";
import { InferenceBadge } from "@/components/console/InferenceBadge";
import { ActionCard } from "@/components/console/ActionCard";

const time = (ts) => new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const FOLLOW_LABEL = {
  approved: "Executing with human proof", auto: "Executing under policy", blocked: "Policy enforcement",
  denied: "Action aborted", cancelled: "Action aborted", expired: "Gate expired", rejected: "Proof rejected",
};

export const MessageBubble = ({ msg, index, onRetry }) => {
  if (msg.role === "user") {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end" data-testid={`message-user-${index}`}>
        <div className="max-w-[78%]">
          <div className="rounded-2xl rounded-tr-md border border-blue-400/20 bg-gradient-to-br from-blue-500/[0.18] to-violet-500/[0.12] px-4 py-3 text-[14.5px] leading-relaxed text-slate-100 shadow-[0_10px_40px_-20px_rgba(59,107,255,0.8)]">
            {msg.text}
          </div>
          <div className="mt-1.5 text-right font-mono text-[10px] text-slate-600">{time(msg.ts)}</div>
        </div>
      </motion.div>
    );
  }
  const waiting = msg.streaming && !msg.text;
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4" data-testid={`message-agent-${index}`}>
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03]"><LogoMark size={20} /></div>
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
          <span className="text-slate-300">Aegis</span>
          {msg.event && <span className="text-violet-300/80">· {FOLLOW_LABEL[msg.event.outcome]}</span>}
          <span>· {time(msg.ts)}</span>
        </div>
        {waiting && <ThinkingIndicator label={msg.event?.outcome === "approved" || msg.event?.outcome === "auto" ? "Executing inside the 0G enclave…" : undefined} />}
        {msg.text && (
          <div className={`whitespace-pre-wrap text-[14.5px] leading-[1.7] text-slate-200 ${msg.streaming ? "caret" : ""}`} data-testid={`message-agent-text-${index}`}>{msg.text}</div>
        )}
        {msg.error && (
          <div className="mt-2 flex items-center gap-3 rounded-xl border border-rose-400/20 bg-rose-500/[0.06] px-4 py-3 text-sm text-rose-200" data-testid={`message-error-${index}`}>
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span className="flex-1">The 0G enclave could not complete this request. {msg.error}</span>
            <button onClick={() => onRetry(msg.id)} data-testid={`message-retry-${index}`} className="inline-flex items-center gap-1 rounded-full border border-rose-300/30 px-3 py-1 text-xs hover:bg-rose-400/10">
              <RotateCcw className="h-3 w-3" />Retry
            </button>
          </div>
        )}
        {msg.action && <ActionCard action={msg.action} testId={`action-card-${index}`} />}
        {!waiting && <InferenceBadge proof={msg.proof} testId={`inference-badge-${index}`} />}
      </div>
    </motion.div>
  );
};
