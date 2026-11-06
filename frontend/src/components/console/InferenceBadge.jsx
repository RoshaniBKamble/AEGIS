import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldCheck, ChevronDown, Loader2, ShieldAlert } from "lucide-react";

const Field = ({ k, v }) => (
  <div className="flex justify-between gap-4 py-1">
    <span className="text-slate-500">{k}</span>
    <span className="truncate text-right text-slate-300">{v}</span>
  </div>
);

export const InferenceBadge = ({ proof, testId }) => {
  const [open, setOpen] = useState(false);
  if (!proof) return null;
  const running = proof.status === "running";
  const failed = proof.status === "failed";
  return (
    <div className="mt-3" data-testid={testId}>
      <button onClick={() => !running && setOpen((o) => !o)} data-testid={`${testId}-toggle`}
        className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 font-mono text-[10px] tracking-wide transition-colors duration-200 ${failed ? "border-rose-400/30 text-rose-300" : "border-cyan-400/20 bg-cyan-400/[0.04] text-cyan-200/90 hover:border-cyan-300/40"}`}>
        {running ? <Loader2 className="h-3 w-3 animate-spin" /> : failed ? <ShieldAlert className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3 text-emerald-300" />}
        <span>{running ? "Running verified private inference on 0G…" : failed ? "0G inference failed" : "Verified private inference · 0G"}</span>
        <span className="text-slate-500">{proof.request_id}</span>
        {!running && !failed && <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mt-2 max-w-md rounded-xl border border-white/[0.06] bg-black/40 p-3 font-mono text-[10.5px]" data-testid={`${testId}-details`}>
              <Field k="request" v={proof.request_id} />
              <Field k="node" v={proof.node} />
              <Field k="provider" v={`${proof.provider_address?.slice(0, 10)}…${proof.provider_address?.slice(-6)}`} />
              <Field k="enclave" v={proof.tee} />
              <Field k="model" v={proof.model} />
              <Field k="attestation" v={`${proof.attestation?.slice(0, 18)}…`} />
              <Field k="latency" v={`${proof.latency_ms} ms`} />
              {proof.simulated && <div className="mt-2 border-t border-white/5 pt-2 text-amber-300/70">demo envelope · attestation simulated</div>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
