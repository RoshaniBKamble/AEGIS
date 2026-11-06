import { NavLink, useLocation, useNavigate, useOutlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, Fingerprint, Shield, SlidersHorizontal, TerminalSquare, Cpu, ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { StatusDot, AGENT_STATES } from "@/components/StatusDot";
import { HumanGateModal } from "@/components/gate/HumanGateModal";
import { useAegis } from "@/context/AegisContext";
import { policyMode } from "@/lib/policy";

const NAV = [
  { to: "/app", label: "Console", icon: TerminalSquare, end: true, id: "console" },
  { to: "/app/policy", label: "Autonomy Policy", icon: SlidersHorizontal, id: "policy" },
  { to: "/app/audit", label: "Audit Log", icon: Activity, id: "audit" },
  { to: "/app/identity", label: "Identity", icon: Fingerprint, id: "identity" },
];

const Row = ({ label, children, testId }) => (
  <div className="flex items-center justify-between py-2.5 text-[13px]" data-testid={testId}>
    <span className="text-slate-500">{label}</span>
    <span className="flex items-center gap-2 text-slate-200">{children}</span>
  </div>
);

const StatusPanel = () => {
  const { agentState, policy, profile, lastProof } = useAegis();
  const s = AGENT_STATES[agentState];
  return (
    <div className="glass-panel rounded-2xl p-4">
      <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">Agent telemetry</div>
      <div className="divide-y divide-white/[0.05]">
        <Row label="Status" testId="sidebar-agent-status"><StatusDot tone={s.tone} pulse={s.pulse} />{s.label}</Row>
        <Row label="Mode" testId="sidebar-agent-mode"><Shield className="h-3.5 w-3.5 text-violet-300" />{policyMode(policy)}</Row>
        <Row label="World ID" testId="sidebar-worldid-status">
          <StatusDot tone={profile.worldId.connected ? "green" : "red"} />{profile.worldId.connected ? "Orb linked" : "Not linked"}
        </Row>
        <Row label="Intelligence" testId="sidebar-zerog-status"><Cpu className="h-3.5 w-3.5 text-cyan-300" />0G Private</Row>
      </div>
      {lastProof && (
        <div className="mt-3 rounded-lg border border-cyan-400/10 bg-cyan-400/[0.03] px-3 py-2 font-mono text-[10px] text-cyan-300/80" data-testid="sidebar-last-proof">
          last · {lastProof.request_id}
        </div>
      )}
    </div>
  );
};

export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const outlet = useOutlet();
  return (
    <div className="relative flex h-screen overflow-hidden bg-void text-slate-100">
      <div className="pointer-events-none absolute -left-40 top-[-20%] h-[520px] w-[520px] rounded-full bg-blue-600/10 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-[-30%] right-[-10%] h-[620px] w-[620px] rounded-full bg-violet-600/10 blur-[160px]" />
      <div className="grain" />
      <aside className="relative z-10 hidden w-[272px] shrink-0 flex-col border-r border-white/[0.06] bg-black/20 p-5 backdrop-blur-xl lg:flex">
        <button onClick={() => navigate("/")} data-testid="sidebar-logo-home" className="mb-10 text-left"><Logo /></button>
        <nav className="space-y-1">
          {NAV.map(({ to, label, icon: Icon, end, id }) => (
            <NavLink key={to} to={to} end={end} data-testid={`nav-${id}`}
              className={({ isActive }) => `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-200 ${isActive ? "bg-white/[0.06] text-white" : "text-slate-400 hover:bg-white/[0.03] hover:text-slate-200"}`}>
              {({ isActive }) => (<>
                {isActive && <motion.span layoutId="nav-glow" className="absolute inset-y-2 left-0 w-[2px] rounded-full bg-gradient-to-b from-cyan-300 to-violet-500" />}
                <Icon className="h-4 w-4" strokeWidth={1.6} />{label}
              </>)}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto space-y-3">
          <StatusPanel />
          <div className="flex items-center justify-between px-1 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600">
            <span>v1.4 · demo network</span><ArrowUpRight className="h-3 w-3" />
          </div>
        </div>
      </aside>
      <MobileNav />
      <main className="relative z-10 flex-1 overflow-hidden pb-14 lg:pb-0">
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} className="h-full"
            initial={{ opacity: 0, y: 10, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -6, filter: "blur(4px)" }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
            {outlet}
          </motion.div>
        </AnimatePresence>
      </main>
      <HumanGateModal />
    </div>
  );
}

const MobileNav = () => (
  <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-white/[0.06] bg-black/70 py-2 backdrop-blur-xl lg:hidden">
    {NAV.map(({ to, label, icon: Icon, end, id }) => (
      <NavLink key={to} to={to} end={end} data-testid={`mobile-nav-${id}`}
        className={({ isActive }) => `flex flex-col items-center gap-1 px-3 py-1 text-[10px] ${isActive ? "text-cyan-300" : "text-slate-500"}`}>
        <Icon className="h-4 w-4" />{label.split(" ")[0]}
      </NavLink>
    ))}
  </nav>
);
