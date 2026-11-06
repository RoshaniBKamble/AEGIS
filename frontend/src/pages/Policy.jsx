import { useState } from "react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { useAegis } from "@/context/AegisContext";
import { CATEGORIES, PRESETS, RISKS, evaluatePolicy, policyHash, policyMode } from "@/lib/policy";
import { RiskChip } from "@/components/StatusDot";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

const RULES = [
  { id: "auto", label: "Auto", on: "bg-cyan-400/15 text-cyan-200 border-cyan-400/40" },
  { id: "human", label: "Human Gate", on: "bg-amber-400/15 text-amber-200 border-amber-400/40" },
  { id: "deny", label: "Block", on: "bg-rose-500/15 text-rose-200 border-rose-400/40" },
];

const Section = ({ eyebrow, title, children, right }) => (
  <section className="glass-panel rounded-3xl p-6 md:p-8">
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.26em] text-slate-500">{eyebrow}</div>
        <h2 className="mt-2 font-display text-xl font-medium text-white">{title}</h2>
      </div>
      {right}
    </div>
    {children}
  </section>
);

const Presets = () => {
  const { policy, setPolicy } = useAegis();
  const mode = policyMode(policy);
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {Object.entries(PRESETS).map(([id, p]) => {
        const active = mode === p.name;
        return (
          <button key={id} data-testid={`policy-preset-${id}`} onClick={() => { setPolicy((cur) => ({ ...cur, preset: id, autoRiskCeiling: p.autoRiskCeiling, categories: { ...p.categories } })); toast.success(`${p.name} policy applied`); }}
            className={`relative overflow-hidden rounded-2xl border p-5 text-left transition-colors duration-300 ${active ? "border-cyan-400/40 bg-cyan-400/[0.05]" : "border-white/[0.06] bg-white/[0.015] hover:border-white/15"}`}>
            {active && <motion.span layoutId="preset-glow" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />}
            <div className="font-display text-lg text-white">{p.name}</div>
            <div className="mt-1 text-[13px] text-slate-400">{p.tagline}</div>
            <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600">auto ≤ {p.autoRiskCeiling}</div>
          </button>
        );
      })}
    </div>
  );
};

const CategoryRow = ({ cat }) => {
  const { policy, setPolicy } = useAegis();
  const Icon = Icons[cat.icon];
  const value = policy.categories[cat.id];
  const set = (rule) => setPolicy((p) => ({ ...p, categories: { ...p.categories, [cat.id]: rule } }));
  return (
    <div className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between" data-testid={`policy-row-${cat.id}`}>
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03]"><Icon className="h-4 w-4 text-slate-300" strokeWidth={1.6} /></div>
        <div><div className="text-[14.5px] text-white">{cat.label}</div><div className="text-[12.5px] text-slate-500">{cat.hint}</div></div>
      </div>
      <div className="flex rounded-full border border-white/[0.07] bg-black/30 p-1">
        {RULES.map((r) => {
          const locked = cat.id === "irreversible" && r.id === "auto";
          return (
            <button key={r.id} disabled={locked} onClick={() => set(r.id)} data-testid={`policy-rule-${cat.id}-${r.id}`}
              className={`rounded-full border px-3.5 py-1.5 text-[12px] transition-colors duration-200 ${value === r.id ? r.on : "border-transparent text-slate-500 hover:text-slate-200"} ${locked ? "cursor-not-allowed opacity-30" : ""}`}>
              {r.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const Simulator = () => {
  const { policy } = useAegis();
  const [cat, setCat] = useState("transaction");
  const [risk, setRisk] = useState("medium");
  const d = evaluatePolicy(policy, { category: cat, risk });
  const out = { auto: ["Runs automatically", "text-cyan-300"], human: ["Pauses for World ID", "text-amber-300"], deny: ["Blocked outright", "text-rose-300"] }[d];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => setCat(c.id)} data-testid={`sim-cat-${c.id}`} className={`rounded-full border px-3 py-1 text-[12px] transition-colors ${cat === c.id ? "border-white/30 bg-white/10 text-white" : "border-white/[0.06] text-slate-500"}`}>{c.label}</button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {RISKS.map((r) => <button key={r} onClick={() => setRisk(r)} data-testid={`sim-risk-${r}`} className={`rounded-full transition-opacity ${risk === r ? "opacity-100" : "opacity-40"}`}><RiskChip risk={r} /></button>)}
      </div>
      <div className="rounded-2xl border border-white/[0.06] bg-black/30 p-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-600">Decision</div>
        <motion.div key={d} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`mt-2 font-display text-2xl ${out[1]}`} data-testid="sim-decision">{out[0]}</motion.div>
      </div>
    </div>
  );
};

export default function Policy() {
  const { policy, setPolicy } = useAegis();
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl space-y-6 px-6 py-10 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-cyan-300/70">Autonomy policy</div>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em] text-white">Draw the line.</h1>
            <p className="mt-3 max-w-xl text-[14.5px] text-slate-400">Decide what AEGIS may do alone. Changes apply instantly to the next action it plans.</p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-black/30 px-4 py-2.5 text-right" data-testid="policy-hash">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600">{policyMode(policy)} · policy hash</div>
            <div className="font-mono text-[12px] text-cyan-200">{policyHash(policy)}</div>
          </div>
        </div>

        <Section eyebrow="Presets" title="Start from a stance"><Presets /></Section>

        <Section eyebrow="Risk ceiling" title="Auto-approve free actions up to">
          <div className="flex rounded-full border border-white/[0.07] bg-black/30 p-1 md:w-fit">
            {["low", "medium", "high"].map((r) => (
              <button key={r} onClick={() => setPolicy((p) => ({ ...p, autoRiskCeiling: r }))} data-testid={`policy-ceiling-${r}`}
                className={`flex-1 rounded-full px-6 py-2 text-[13px] capitalize transition-colors duration-200 ${policy.autoRiskCeiling === r ? "bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-white" : "text-slate-500 hover:text-slate-200"}`}>{r} risk</button>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 text-[12.5px] text-slate-500"><Icons.Lock className="h-3.5 w-3.5 text-amber-300" />Hard floor: critical-risk and irreversible actions always require a fresh World ID proof. This cannot be disabled.</div>
        </Section>

        <Section eyebrow="Category rules" title="How each kind of action is handled">
          <div className="divide-y divide-white/[0.05]">{CATEGORIES.map((c) => <CategoryRow key={c.id} cat={c} />)}</div>
        </Section>

        <div className="grid gap-6 lg:grid-cols-2">
          <Section eyebrow="Verification window" title={`${policy.gateTimeout} seconds to respond`}>
            <Slider value={[policy.gateTimeout]} min={15} max={120} step={5} onValueChange={([v]) => setPolicy((p) => ({ ...p, gateTimeout: v }))} data-testid="policy-timeout-slider" />
            <p className="mt-4 text-[12.5px] text-slate-500">If no proof arrives within the window, the gate seals itself and the action is aborted.</p>
          </Section>
          <Section eyebrow="Simulator" title="Test a hypothetical action"><Simulator /></Section>
        </div>
      </div>
    </div>
  );
}
