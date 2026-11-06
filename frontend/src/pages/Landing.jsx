import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Cpu, Fingerprint, HardDrive, Lock } from "lucide-react";
import { NeuralField } from "@/components/NeuralField";
import { Logo } from "@/components/Logo";

const ease = [0.16, 1, 0.3, 1];
const rise = (d) => ({ initial: { opacity: 0, y: 24, filter: "blur(8px)" }, animate: { opacity: 1, y: 0, filter: "blur(0px)" }, transition: { delay: d, duration: 0.9, ease } });

const LAYERS = [
  { n: "01", icon: Cpu, title: "Thinks in private", body: "Every plan and every reply is computed inside 0G Private Computer — a verified enclave. Each call returns a request ID and an attestation you can audit." },
  { n: "02", icon: Lock, title: "Obeys your policy", body: "You define what runs on its own. Free, low-risk work flows through. Anything above your ceiling is stopped before it reaches the world." },
  { n: "03", icon: Fingerprint, title: "Waits for a human", body: "Money, messages, private data, irreversible steps — the agent pauses and asks for a fresh World ID proof. No proof, no action." },
];

const GatePreview = () => (
  <motion.div initial={{ opacity: 0, y: 40, rotateX: 12 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ delay: 0.9, duration: 1.2, ease }}
    className="float-slow relative hidden w-[380px] lg:block" style={{ perspective: 1000 }}>
    <div className="absolute -inset-10 rounded-full bg-amber-400/10 blur-3xl" />
    <div className="glass-panel relative overflow-hidden rounded-3xl p-6">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-amber-300"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-300" />Human gate engaged</div>
      <div className="mt-5 flex items-center gap-5">
        <div className="relative h-20 w-20 shrink-0">
          <span className="absolute inset-0 animate-[spin_9s_linear_infinite] rounded-full border border-dashed border-amber-300/50" />
          <span className="absolute inset-2 animate-[spin_4s_linear_infinite_reverse] rounded-full border border-violet-400/50 border-t-transparent" />
          <span className="absolute inset-5 flex items-center justify-center rounded-full bg-[#0b1024] shadow-[0_0_30px_rgba(251,191,36,0.35)]"><Fingerprint className="h-5 w-5 text-amber-200" /></span>
        </div>
        <div>
          <div className="text-[15px] font-medium text-white">Transfer 2.4 ETH</div>
          <div className="mt-0.5 font-mono text-[11px] text-slate-500">to mira.eth · Base</div>
          <div className="mt-2 inline-flex rounded-full border border-rose-400/40 bg-rose-500/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-rose-300">critical</div>
        </div>
      </div>
      <div className="mt-6 h-1 overflow-hidden rounded-full bg-white/5"><div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-amber-300 to-violet-500" /></div>
      <div className="mt-4 flex justify-between font-mono text-[10px] text-slate-500"><span>0g-req-7f3a91c2e0b4</span><span>00:31</span></div>
    </div>
  </motion.div>
);

export default function Landing() {
  const navigate = useNavigate();
  const launch = () => navigate("/app");
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-void text-slate-100">
      <section className="relative flex min-h-screen flex-col overflow-hidden">
        <NeuralField density={110} />
        <div className="pointer-events-none absolute left-[-10%] top-[10%] h-[620px] w-[620px] rounded-full bg-blue-600/20 blur-[150px] orb-drift" />
        <div className="pointer-events-none absolute bottom-[-20%] right-[5%] h-[560px] w-[560px] rounded-full bg-violet-600/20 blur-[150px] orb-drift-rev" />
        <div className="pointer-events-none absolute right-[30%] top-[20%] h-[260px] w-[260px] rounded-full bg-cyan-400/10 blur-[110px]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#05070F_85%)]" />
        <div className="grain" />

        <motion.nav {...rise(0.1)} className="relative z-10 flex items-center justify-between px-6 py-6 lg:px-14">
          <Logo />
          <div className="hidden items-center gap-9 text-[13px] text-slate-400 md:flex">
            <a href="#layers" className="transition-colors hover:text-white" data-testid="nav-how-it-works">How it works</a>
            <a href="#gate" className="transition-colors hover:text-white" data-testid="nav-human-gate">Human Gate</a>
          </div>
          <button onClick={launch} data-testid="nav-launch-btn" className="rounded-full border border-white/15 px-5 py-2 text-[13px] text-white transition-colors duration-200 hover:bg-white/10">Launch</button>
        </motion.nav>

        <div className="relative z-10 flex flex-1 items-center px-6 lg:px-14">
          <div className="flex w-full items-center justify-between gap-12">
            <div className="max-w-3xl">
              <motion.div {...rise(0.2)} className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.05] px-3.5 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.24em] text-cyan-200">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#22d3ee]" />Sovereign agent · 0G × World ID
              </motion.div>
              <motion.h1 {...rise(0.35)} className="mt-8 font-display text-5xl font-semibold leading-[0.95] tracking-[-0.045em] text-white sm:text-6xl lg:text-[88px]" data-testid="hero-headline">
                Your AI.<br /><span className="text-gradient">Under Your Control.</span>
              </motion.h1>
              <motion.p {...rise(0.55)} className="mt-8 max-w-xl text-base leading-relaxed text-slate-400 md:text-lg">
                AEGIS is a personal agent that reasons inside verified private compute and acts on your behalf — but never crosses a line
                without you. Every consequential action waits for a fresh proof that a real human said yes.
              </motion.p>
              <motion.div {...rise(0.7)} className="mt-11 flex flex-wrap items-center gap-4">
                <button onClick={launch} data-testid="hero-launch-agent-btn"
                  className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-8 py-4 text-[15px] font-semibold text-white shadow-[0_0_60px_-10px_rgba(59,107,255,0.9)] transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]">
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <span className="relative">Launch Agent</span><ArrowRight className="relative h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
                <a href="#gate" data-testid="hero-learn-more" className="px-2 py-4 text-[14px] text-slate-400 transition-colors hover:text-white">See the Human Gate →</a>
              </motion.div>
            </div>
            <GatePreview />
          </div>
        </div>

        <motion.div {...rise(1)} className="relative z-10 grid grid-cols-1 gap-4 border-t border-white/[0.06] px-6 py-6 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500 sm:grid-cols-3 lg:px-14">
          <span className="flex items-center gap-2.5"><Cpu className="h-3.5 w-3.5 text-cyan-300" />Inference · 0G Private Computer</span>
          <span className="flex items-center gap-2.5"><Fingerprint className="h-3.5 w-3.5 text-violet-300" />Human proof · World ID</span>
          <span className="flex items-center gap-2.5"><HardDrive className="h-3.5 w-3.5 text-blue-300" />History · your device only</span>
        </motion.div>
      </section>

      <section id="layers" className="relative px-6 py-32 lg:px-14">
        <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-cyan-300/70">Architecture of control</div>
        <h2 className="mt-5 max-w-2xl font-display text-3xl font-semibold tracking-[-0.03em] text-white md:text-5xl">Three layers between intent and action.</h2>
        <div className="mt-20 grid gap-px overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.06] md:grid-cols-3">
          {LAYERS.map(({ n, icon: Icon, title, body }, i) => (
            <motion.div key={n} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ delay: i * 0.12, duration: 0.8, ease }}
              className="group relative bg-[#06080f] p-10 transition-colors duration-300 hover:bg-[#080b16]" data-testid={`layer-card-${n}`}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-slate-600">{n}</span>
                <Icon className="h-5 w-5 text-slate-500 transition-colors duration-300 group-hover:text-cyan-300" strokeWidth={1.5} />
              </div>
              <h3 className="mt-16 font-display text-2xl font-medium tracking-tight text-white">{title}</h3>
              <p className="mt-4 text-[14.5px] leading-relaxed text-slate-400">{body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="gate" className="relative overflow-hidden px-6 pb-36 pt-10 lg:px-14">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400/[0.06] blur-[140px]" />
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease }} className="relative max-w-4xl">
          <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-amber-300/80">The Human Gate</div>
          <p className="mt-6 font-display text-3xl font-medium leading-[1.15] tracking-[-0.03em] text-white md:text-5xl">
            The moment it matters, your agent stops — and <span className="text-gradient-warm">waits for you.</span>
          </p>
          <p className="mt-8 max-w-xl text-[15px] leading-relaxed text-slate-400">Approve with World ID and it continues. Deny, dismiss, or let the window run out — and it aborts cleanly, explains why, and records everything.</p>
          <button onClick={launch} data-testid="gate-section-launch-btn" className="mt-10 inline-flex items-center gap-3 rounded-full bg-white px-7 py-3.5 text-[14px] font-semibold text-black transition-transform duration-200 hover:scale-[1.03]">
            Try the full flow <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.06] px-6 py-8 text-[12px] text-slate-600 lg:px-14">
        <Logo />
        <span className="font-mono uppercase tracking-[0.2em]">© 2026 Aegis Labs · demo network</span>
      </footer>
    </div>
  );
}
