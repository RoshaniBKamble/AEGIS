import { motion } from "framer-motion";
import { Fingerprint, ShieldCheck, Ban, Clock, XCircle, Zap, Lock, AlertTriangle } from "lucide-react";
import { RiskChip } from "@/components/StatusDot";

const STATUS = {
  awaiting: { label: "Paused · awaiting human", icon: Lock, cls: "text-amber-300 border-amber-400/30 bg-amber-400/10", glow: "shadow-[0_0_40px_-12px_rgba(251,191,36,0.5)]" },
  executed: { label: "World ID verified · executed", icon: Fingerprint, cls: "text-emerald-300 border-emerald-400/30 bg-emerald-400/10", glow: "shadow-[0_0_40px_-14px_rgba(52,211,153,0.6)]" },
  auto_approved: { label: "Auto-approved by policy", icon: Zap, cls: "text-cyan-300 border-cyan-400/30 bg-cyan-400/10", glow: "" },
  blocked: { label: "Blocked by policy", icon: Ban, cls: "text-rose-300 border-rose-400/30 bg-rose-500/10", glow: "" },
  denied: { label: "Denied by human", icon: XCircle, cls: "text-rose-300 border-rose-400/30 bg-rose-500/10", glow: "" },
  cancelled: { label: "Verification cancelled", icon: XCircle, cls: "text-slate-300 border-white/15 bg-white/5", glow: "" },
  expired: { label: "Verification expired", icon: Clock, cls: "text-slate-300 border-white/15 bg-white/5", glow: "" },
  rejected: { label: "Proof rejected", icon: AlertTriangle, cls: "text-rose-300 border-rose-400/30 bg-rose-500/10", glow: "" },
};

export const ActionCard = ({ action, testId }) => {
  const s = STATUS[action.status] || STATUS.awaiting;
  const Icon = s.icon;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} data-testid={testId}
      className={`mt-4 max-w-xl overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] ${s.glow}`}>
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-2.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">Action intent · {action.category.replace("_", " ")}</span>
        <RiskChip risk={action.risk} testId={`${testId}-risk`} />
      </div>
      <div className="px-4 py-3.5">
        <div className="text-[15px] font-medium text-white">{action.title}</div>
        {action.summary && <div className="mt-1 text-[13px] text-slate-400">{action.summary}</div>}
        {Object.keys(action.params || {}).length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 font-mono text-[11px]">
            {Object.entries(action.params).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2 border-b border-dashed border-white/[0.05] pb-1">
                <span className="text-slate-500">{k}</span><span className="truncate text-slate-200">{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] bg-black/20 px-4 py-2.5">
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] ${s.cls}`} data-testid={`${testId}-status`}>
          <Icon className="h-3 w-3" />{s.label}
        </span>
        {(action.receipt || action.proof) && (
          <span className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
            <ShieldCheck className="h-3 w-3" />{action.receipt ? `tx ${action.receipt.ref.slice(0, 14)}…` : `nullifier ${action.proof.nullifier_hash.slice(0, 12)}…`}
          </span>
        )}
      </div>
    </motion.div>
  );
};
