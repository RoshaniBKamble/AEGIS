export const EVENT_META = {
  inference: { label: "0G private inference", dot: "bg-cyan-400", ring: "border-cyan-400/40 text-cyan-300", filter: "zerog" },
  gate_open: { label: "Human gate engaged", dot: "bg-amber-400", ring: "border-amber-400/40 text-amber-300", filter: "worldid" },
  human_approved: { label: "World ID verified", dot: "bg-emerald-400", ring: "border-emerald-400/50 text-emerald-300", filter: "worldid" },
  human_denied: { label: "Denied by human", dot: "bg-rose-500", ring: "border-rose-400/40 text-rose-300", filter: "blocked" },
  human_cancelled: { label: "Verification cancelled", dot: "bg-slate-400", ring: "border-white/20 text-slate-300", filter: "blocked" },
  human_expired: { label: "Verification expired", dot: "bg-slate-400", ring: "border-white/20 text-slate-300", filter: "blocked" },
  human_rejected: { label: "Proof rejected", dot: "bg-rose-500", ring: "border-rose-400/40 text-rose-300", filter: "blocked" },
  auto: { label: "Auto-approved by policy", dot: "bg-blue-400", ring: "border-blue-400/40 text-blue-300", filter: "auto" },
  blocked: { label: "Blocked by policy", dot: "bg-rose-500", ring: "border-rose-400/40 text-rose-300", filter: "blocked" },
  error: { label: "Inference error", dot: "bg-rose-500", ring: "border-rose-400/40 text-rose-300", filter: "zerog" },
};
