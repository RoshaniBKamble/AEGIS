const TONES = {
  cyan: "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.9)]",
  green: "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]",
  amber: "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.9)]",
  red: "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.9)]",
  violet: "bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.9)]",
  slate: "bg-slate-500",
};

export const StatusDot = ({ tone = "cyan", pulse = false }) => (
  <span className="relative inline-flex h-2 w-2">
    {pulse && <span className={`absolute inset-0 animate-ping rounded-full opacity-60 ${TONES[tone]}`} />}
    <span className={`relative inline-flex h-2 w-2 rounded-full ${TONES[tone]}`} />
  </span>
);

export const AGENT_STATES = {
  idle: { label: "Standing by", tone: "green", pulse: false },
  thinking: { label: "Reasoning on 0G", tone: "cyan", pulse: true },
  executing: { label: "Executing", tone: "violet", pulse: true },
  awaiting_human: { label: "Awaiting human", tone: "amber", pulse: true },
};

export const RISK_STYLE = {
  low: "text-emerald-300 border-emerald-400/30 bg-emerald-400/10",
  medium: "text-cyan-300 border-cyan-400/30 bg-cyan-400/10",
  high: "text-amber-300 border-amber-400/30 bg-amber-400/10",
  critical: "text-rose-300 border-rose-400/40 bg-rose-500/10",
};

export const RiskChip = ({ risk, testId }) => (
  <span data-testid={testId} className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] ${RISK_STYLE[risk] || RISK_STYLE.high}`}>
    {risk} risk
  </span>
);
