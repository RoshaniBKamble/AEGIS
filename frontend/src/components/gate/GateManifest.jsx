import { Cpu, ShieldAlert } from "lucide-react";
import { RiskChip } from "@/components/StatusDot";
import { CATEGORIES } from "@/lib/policy";

export const gateReason = (policy, action) => {
  const cat = CATEGORIES.find((c) => c.id === action.category);
  if (action.risk === "critical") return "Critical risk — always requires a fresh human proof";
  if (action.category === "irreversible") return "Irreversible step — always requires a fresh human proof";
  if (policy.categories[action.category] === "human") return `${cat?.label || "This category"} is set to Human Gate`;
  return `Risk exceeds your auto-approve ceiling (${policy.autoRiskCeiling})`;
};

export const GateManifest = ({ action, policy }) => (
  <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-black/40" data-testid="gate-manifest">
    <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">Pending action · {action.category.replace("_", " ")}</span>
      <RiskChip risk={action.risk} testId="gate-risk" />
    </div>
    <div className="px-5 py-4">
      <div className="font-display text-xl font-medium tracking-tight text-white" data-testid="gate-action-title">{action.title}</div>
      {action.summary && <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-400">{action.summary}</p>}
      <div className="mt-4 space-y-1.5 font-mono text-[11.5px]">
        {Object.entries(action.params || {}).map(([k, v]) => (
          <div key={k} className="flex justify-between gap-6"><span className="text-slate-500">{k}</span><span className="truncate text-slate-100">{v}</span></div>
        ))}
      </div>
    </div>
    <div className="space-y-1.5 border-t border-white/[0.06] bg-white/[0.015] px-5 py-3 text-[11.5px]">
      <div className="flex items-center gap-2 text-amber-200/90"><ShieldAlert className="h-3.5 w-3.5" />{gateReason(policy, action)}</div>
      <div className="flex items-center gap-2 font-mono text-[10.5px] text-slate-500"><Cpu className="h-3.5 w-3.5" />planned in 0G enclave · {action.requestId}</div>
    </div>
  </div>
);
