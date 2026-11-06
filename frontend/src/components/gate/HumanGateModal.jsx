import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Globe, X, Check, Loader2 } from "lucide-react";
import { useAegis } from "@/context/AegisContext";
import { OrbScanner } from "@/components/gate/OrbScanner";
import { GateManifest } from "@/components/gate/GateManifest";
import { requestHumanProof, verifyOnServer } from "@/lib/worldid";

const COPY = {
  request: { eyebrow: "Human Gate · protocol engaged", title: "Human verification required", body: "AEGIS has paused before an action it will not take alone. Prove you are a unique, present human with World ID to release it. The proof is single-use and bound to this exact action.", tone: "text-amber-300" },
  scanning: { eyebrow: "World ID · awaiting proof", title: "Confirm in World App", body: "A zero-knowledge proof is being generated. Your identity never leaves your device — AEGIS only learns that a verified human approved this action.", tone: "text-cyan-300" },
  verified: { eyebrow: "Proof accepted", title: "Human confirmed.", body: "Releasing the action to the agent. Execution continues inside the 0G enclave.", tone: "text-emerald-300" },
  denied: { eyebrow: "Gate closed", title: "Action denied.", body: "AEGIS is standing down. Nothing was executed and nothing left the enclave.", tone: "text-rose-300" },
  rejected: { eyebrow: "Proof invalid", title: "Verification failed.", body: "The World ID proof could not be validated. The action has been aborted for your safety.", tone: "text-rose-300" },
  expired: { eyebrow: "Window elapsed", title: "Verification expired.", body: "No proof arrived in time. The gate sealed itself and the action was aborted.", tone: "text-slate-300" },
};

const STEPS = ["Proof request signed", "Zero-knowledge proof generated", "Merkle root verified"];
const mmss = (s) => `00:${String(Math.max(0, s)).padStart(2, "0")}`;

const GateOverlay = ({ gate, timeout, policy, onResolve }) => {
  const [phase, setPhase] = useState("request");
  const [left, setLeft] = useState(timeout);
  const [step, setStep] = useState(0);
  const [simulateFail, setSimulateFail] = useState(false);
  const finish = useCallback((next, outcome, proof, delay) => { setPhase(next); setTimeout(() => onResolve(outcome, proof), delay); }, [onResolve]);

  useEffect(() => {
    if (phase !== "request") return;
    if (left <= 0) { finish("expired", "expired", null, 1800); return; }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, left, finish]);

  useEffect(() => {
    if (phase !== "scanning") return;
    const t = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length)), 850);
    return () => clearInterval(t);
  }, [phase]);

  const approve = async () => {
    setPhase("scanning");
    try {
      const proof = await requestHumanProof({ signal: gate.action.id, forceInvalid: simulateFail });
      const res = await verifyOnServer(proof);
      if (res.success) finish("verified", "approved", { ...proof, verified_at_block: res.verified_at_block }, 1900);
      else finish("rejected", "rejected", proof, 2200);
    } catch {
      finish("rejected", "rejected", null, 2200);
    }
  };
  const deny = () => finish("denied", "denied", null, 1700);
  const cancel = useCallback(() => onResolve("cancelled", null), [onResolve]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && phase === "request") cancel(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, cancel]);

  const c = COPY[phase];
  const progress = phase === "request" ? left / timeout : phase === "expired" ? 0 : 1;
  const tint = { request: "251,191,36", scanning: "34,211,238", verified: "52,211,153", denied: "244,63,94", rejected: "244,63,94", expired: "100,116,139" }[phase];

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4" data-testid="human-gate-modal"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.5 } }}>
      <div className="absolute inset-0 bg-[#020309]/85 backdrop-blur-2xl" />
      <div className="absolute inset-0 transition-[background] duration-700" style={{ background: `radial-gradient(60% 50% at 30% 50%, rgba(${tint},0.14), transparent 70%)` }} />
      <motion.div className="absolute inset-x-0 top-0 h-[7vh] bg-black" initial={{ y: "-100%" }} animate={{ y: 0 }} exit={{ y: "-100%" }} transition={{ duration: 0.7, ease: [0.7, 0, 0.2, 1] }} />
      <motion.div className="absolute inset-x-0 bottom-0 h-[7vh] bg-black" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ duration: 0.7, ease: [0.7, 0, 0.2, 1] }} />
      <motion.div className="pointer-events-none absolute inset-x-0 h-px bg-amber-200/80 shadow-[0_0_30px_6px_rgba(251,191,36,0.6)]"
        initial={{ top: "0%", opacity: 1 }} animate={{ top: "100%", opacity: 0 }} transition={{ duration: 1.1, ease: "easeInOut" }} />

      <motion.div className="relative grid w-full max-w-5xl items-center gap-10 rounded-[28px] border border-white/[0.08] bg-[#060814]/80 p-6 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] md:grid-cols-[auto_1fr] md:p-10"
        initial={{ opacity: 0, scale: 0.94, y: 20, filter: "blur(12px)" }} animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 0.97, filter: "blur(8px)" }} transition={{ delay: 0.25, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
        <div className="absolute inset-0 -z-0 rounded-[28px] opacity-60" style={{ background: `linear-gradient(135deg, rgba(${tint},0.12), transparent 40%, rgba(139,92,246,0.10))` }} />
        {phase === "request" && (
          <button onClick={cancel} data-testid="gate-cancel-x" className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-slate-400 transition-colors hover:text-white">
            <X className="h-4 w-4" />
          </button>
        )}
        <div className="relative flex flex-col items-center">
          <OrbScanner phase={phase} progress={progress} />
          <div className="mt-2 font-mono text-3xl tracking-[0.15em] text-white" data-testid="gate-countdown">{phase === "request" ? mmss(left) : phase === "scanning" ? "··:··" : mmss(0)}</div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">{phase === "request" ? "until auto-abort" : "window sealed"}</div>
        </div>

        <div className="relative min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={phase} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }}>
              <div className={`flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.3em] ${c.tone}`} data-testid="gate-phase">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />{c.eyebrow}
              </div>
              <h2 className="mt-3 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-white lg:text-5xl" data-testid="gate-title">{c.title}</h2>
              <p className="mt-4 max-w-lg text-[14.5px] leading-relaxed text-slate-400">{c.body}</p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-7">
            {phase === "scanning" ? (
              <div className="space-y-3 rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.03] p-5" data-testid="gate-scan-steps">
                {STEPS.map((s, i) => (
                  <div key={s} className={`flex items-center gap-3 text-sm transition-colors duration-300 ${i < step ? "text-cyan-100" : "text-slate-600"}`}>
                    {i < step ? <Check className="h-4 w-4 text-emerald-300" /> : i === step ? <Loader2 className="h-4 w-4 animate-spin text-cyan-300" /> : <span className="h-4 w-4 rounded-full border border-slate-700" />}
                    {s}
                  </div>
                ))}
              </div>
            ) : <GateManifest action={gate.action} policy={policy} />}
          </div>

          {phase === "request" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button onClick={approve} data-testid="gate-approve-btn"
                  className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-white px-7 py-3.5 text-[15px] font-semibold text-black shadow-[0_0_50px_-8px_rgba(255,255,255,0.6)] transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]">
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-cyan-200/60 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <Globe className="relative h-5 w-5" /><span className="relative">Verify with World ID</span>
                </button>
                <button onClick={deny} data-testid="gate-deny-btn"
                  className="rounded-full border border-rose-400/30 px-6 py-3.5 text-[14px] font-medium text-rose-200 transition-colors duration-200 hover:bg-rose-500/10">Deny action</button>
                <button onClick={cancel} data-testid="gate-cancel-btn" className="px-3 py-3.5 text-[13px] text-slate-500 transition-colors hover:text-slate-200">Cancel</button>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4 text-[11px] text-slate-500">
                <span className="font-mono uppercase tracking-[0.18em]">Demo · World ID proof is simulated</span>
                <label className="flex cursor-pointer items-center gap-2" data-testid="gate-simulate-fail-toggle">
                  <input type="checkbox" checked={simulateFail} onChange={(e) => setSimulateFail(e.target.checked)} className="accent-rose-500" />
                  Simulate invalid proof
                </label>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export const HumanGateModal = () => {
  const { gate, resolveGate, policy } = useAegis();
  return (
    <AnimatePresence>
      {gate && <GateOverlay key={gate.action.id} gate={gate} timeout={policy.gateTimeout} policy={policy} onResolve={resolveGate} />}
    </AnimatePresence>
  );
};
