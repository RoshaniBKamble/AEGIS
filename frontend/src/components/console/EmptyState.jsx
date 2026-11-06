import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useAegis } from "@/context/AegisContext";
import { RiskChip } from "@/components/StatusDot";

const PROMPTS = [
  { text: "Send 0.5 ETH to mira.eth for the studio deposit", risk: "high", tag: "transaction" },
  { text: "Email my landlord that rent will be two days late", risk: "medium", tag: "message" },
  { text: "Pull my lab results to book a cardiology checkup", risk: "high", tag: "private data" },
  { text: "Check my wallet balances across Base and Arbitrum", risk: "low", tag: "read-only" },
  { text: "Permanently delete my old cloud backups from 2021", risk: "critical", tag: "irreversible" },
];

export const EmptyState = () => {
  const { send } = useAegis();
  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col justify-center px-2 py-10" data-testid="console-empty-state">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-cyan-300/70">Session sealed · ready</div>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
          Command your agent.<br /><span className="text-gradient">You keep the final say.</span>
        </h1>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-slate-400">
          AEGIS plans inside a verified private enclave. Free, low-risk work runs on its own — anything that moves money,
          speaks for you, or can't be undone waits for a fresh proof that you are human.
        </p>
      </motion.div>
      <div className="mt-10 space-y-2">
        {PROMPTS.map((p, i) => (
          <motion.button key={p.text} onClick={() => send(p.text)} data-testid={`suggestion-${i}`}
            initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.07, duration: 0.45 }}
            className="group flex w-full items-center gap-4 rounded-xl border border-white/[0.05] bg-white/[0.015] px-4 py-3.5 text-left transition-colors duration-200 hover:border-cyan-400/25 hover:bg-cyan-400/[0.03]">
            <span className="w-24 shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-600">{p.tag}</span>
            <span className="flex-1 text-[14px] text-slate-300 group-hover:text-white">{p.text}</span>
            <RiskChip risk={p.risk} />
            <ArrowRight className="h-4 w-4 -translate-x-1 text-slate-600 opacity-0 transition-[transform,opacity] duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
          </motion.button>
        ))}
      </div>
    </div>
  );
};
