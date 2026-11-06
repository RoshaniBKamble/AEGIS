import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, ScrollText } from "lucide-react";
import { useAegis } from "@/context/AegisContext";
import { EVENT_META } from "@/components/audit/eventMeta";

const FILTERS = [
  { id: "all", label: "All events" },
  { id: "worldid", label: "World ID" },
  { id: "auto", label: "Auto-approved" },
  { id: "zerog", label: "0G inferences" },
  { id: "blocked", label: "Stopped" },
];

const Ref = ({ k, v }) => v ? (
  <span className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-black/30 px-2 py-0.5 font-mono text-[10px] text-slate-400">
    <span className="text-slate-600">{k}</span>{String(v).length > 22 ? `${String(v).slice(0, 20)}…` : v}
  </span>
) : null;

const Entry = ({ e, i }) => {
  const m = EVENT_META[e.kind] || EVENT_META.inference;
  const d = new Date(e.ts);
  return (
    <motion.div layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ delay: Math.min(i, 12) * 0.03 }}
      className="relative grid grid-cols-[72px_1fr] gap-6 pb-8" data-testid={`audit-entry-${i}`}>
      <div className="pt-1 text-right font-mono text-[11px] text-slate-500">
        {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        <div className="text-[10px] text-slate-700">{d.toLocaleDateString([], { month: "short", day: "numeric" })}</div>
      </div>
      <div className="relative">
        <span className={`absolute -left-[31px] top-1.5 flex h-3 w-3 items-center justify-center rounded-full border bg-[#05070F] ${m.ring}`}><span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} /></span>
        <div className="glass-panel rounded-2xl p-4 transition-colors duration-200 hover:border-white/15">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-[14.5px] text-white">{e.title}</div>
            <span className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] ${m.ring}`} data-testid={`audit-entry-kind-${i}`}>{m.label}</span>
          </div>
          {e.detail && <div className="mt-1 text-[12.5px] text-slate-500">{e.detail}</div>}
          {e.action && <div className="mt-1 text-[12.5px] text-slate-500">{e.action.category.replace("_", " ")} · {e.action.risk} risk{e.waited ? ` · decided in ${(e.waited / 1000).toFixed(1)}s` : ""}</div>}
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Ref k="0g" v={e.requestId} />
            <Ref k="attest" v={e.attestation} />
            <Ref k="nullifier" v={e.proof?.nullifier_hash} />
            <Ref k="block" v={e.proof?.verified_at_block} />
            <Ref k="tx" v={e.receipt?.ref} />
            {e.latency != null && <Ref k="latency" v={`${e.latency}ms`} />}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function Audit() {
  const { audit } = useAegis();
  const [filter, setFilter] = useState("all");
  const list = useMemo(() => audit.filter((e) => filter === "all" || (EVENT_META[e.kind]?.filter === filter)), [audit, filter]);
  const exportJson = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(audit, null, 2)], { type: "application/json" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `aegis-audit-${Date.now()}.json` });
    a.click(); URL.revokeObjectURL(url);
  };
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl px-6 py-10 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-cyan-300/70">Activity & audit</div>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em] text-white">Every decision, on the record.</h1>
          </div>
          <button onClick={exportJson} disabled={!audit.length} data-testid="audit-export-btn" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-[13px] text-slate-300 transition-colors hover:bg-white/5 disabled:opacity-30">
            <Download className="h-3.5 w-3.5" />Export JSON
          </button>
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button key={f.id} onClick={() => setFilter(f.id)} data-testid={`audit-filter-${f.id}`}
              className={`rounded-full border px-4 py-1.5 text-[12.5px] transition-colors duration-200 ${filter === f.id ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-100" : "border-white/[0.07] text-slate-500 hover:text-slate-200"}`}>{f.label}</button>
          ))}
        </div>
        <div className="relative mt-10 pl-[30px]">
          {list.length > 0 && <div className="absolute bottom-8 left-[103px] top-2 w-px bg-gradient-to-b from-cyan-400/40 via-violet-500/20 to-transparent" />}
          {list.length === 0 ? (
            <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/10 py-20 text-center" data-testid="audit-empty-state">
              <ScrollText className="h-8 w-8 text-slate-600" strokeWidth={1.4} />
              <div className="mt-4 font-display text-lg text-white">No events yet</div>
              <div className="mt-1 max-w-sm text-[13px] text-slate-500">Give your agent a task from the Console. Every inference, policy decision and human proof lands here.</div>
            </div>
          ) : <div className="ml-[73px]"><AnimatePresence>{list.map((e, i) => <Entry key={e.id} e={e} i={i} />)}</AnimatePresence></div>}
        </div>
      </div>
    </div>
  );
}
