import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Clock, Fingerprint } from "lucide-react";

const PALETTE = {
  request: { a: "#FBBF24", b: "#8B5CF6", glow: "rgba(251,191,36,0.35)" },
  scanning: { a: "#22D3EE", b: "#3B6BFF", glow: "rgba(34,211,238,0.45)" },
  verified: { a: "#34D399", b: "#22D3EE", glow: "rgba(52,211,153,0.55)" },
  denied: { a: "#F43F5E", b: "#8B5CF6", glow: "rgba(244,63,94,0.45)" },
  rejected: { a: "#F43F5E", b: "#F59E0B", glow: "rgba(244,63,94,0.45)" },
  expired: { a: "#64748B", b: "#334155", glow: "rgba(100,116,139,0.25)" },
};

const R = 140;
const C = 2 * Math.PI * R;

const Burst = ({ color }) => (
  <>
    {Array.from({ length: 16 }).map((_, i) => {
      const ang = (i / 16) * Math.PI * 2;
      return (
        <motion.span key={i} className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 12px ${color}` }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }} animate={{ x: Math.cos(ang) * 190, y: Math.sin(ang) * 190, opacity: 0, scale: 0.3 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }} />
      );
    })}
  </>
);

const CenterIcon = ({ phase, color }) => {
  const Icon = { verified: Check, denied: X, rejected: X, expired: Clock }[phase] || Fingerprint;
  return (
    <AnimatePresence mode="wait">
      <motion.div key={phase} initial={{ scale: 0.4, opacity: 0, rotate: -20 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} exit={{ scale: 0.6, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}>
        <Icon className="h-12 w-12" style={{ color, filter: `drop-shadow(0 0 14px ${color})` }} strokeWidth={phase === "request" || phase === "scanning" ? 1.2 : 2.2} />
      </motion.div>
    </AnimatePresence>
  );
};

export const OrbScanner = ({ phase, progress }) => {
  const p = PALETTE[phase];
  const fast = phase === "scanning";
  const still = phase === "expired";
  return (
    <motion.div className="relative flex h-[320px] w-[320px] items-center justify-center" data-testid="gate-orb"
      animate={phase === "denied" || phase === "rejected" ? { x: [0, -10, 9, -6, 4, 0] } : { x: 0 }} transition={{ duration: 0.5 }}>
      <div className="absolute inset-6 rounded-full blur-3xl transition-colors duration-700" style={{ background: p.glow }} />
      <svg className="absolute inset-0" viewBox="0 0 320 320">
        <circle cx="160" cy="160" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
        <motion.circle cx="160" cy="160" r={R} fill="none" stroke={p.a} strokeWidth="2.5" strokeLinecap="round"
          strokeDasharray={C} animate={{ strokeDashoffset: C * (1 - progress) }} transition={{ duration: 0.9, ease: "linear" }}
          transform="rotate(-90 160 160)" style={{ filter: `drop-shadow(0 0 6px ${p.a})` }} />
        {Array.from({ length: 72 }).map((_, i) => {
          const a = (i / 72) * Math.PI * 2;
          const r1 = 118, r2 = i % 6 === 0 ? 108 : 113;
          return <line key={i} x1={160 + Math.cos(a) * r1} y1={160 + Math.sin(a) * r1} x2={160 + Math.cos(a) * r2} y2={160 + Math.sin(a) * r2} stroke="rgba(255,255,255,0.14)" strokeWidth="1" />;
        })}
      </svg>
      <motion.div className="absolute inset-[34px] rounded-full border border-dashed" style={{ borderColor: `${p.b}66` }}
        animate={still ? {} : { rotate: 360 }} transition={{ repeat: Infinity, duration: fast ? 3 : 16, ease: "linear" }} />
      <motion.div className="absolute inset-[58px] rounded-full border" style={{ borderColor: `${p.a}55`, borderTopColor: "transparent", borderBottomColor: "transparent" }}
        animate={still ? {} : { rotate: -360 }} transition={{ repeat: Infinity, duration: fast ? 1.6 : 9, ease: "linear" }} />
      <motion.div className="relative flex h-[150px] w-[150px] items-center justify-center overflow-hidden rounded-full"
        style={{ background: `radial-gradient(circle at 35% 30%, ${p.a}33, transparent 55%), radial-gradient(circle at 50% 50%, #0b1024 30%, #03040a 75%)`, boxShadow: `inset 0 0 40px ${p.a}33, 0 0 60px -10px ${p.glow}` }}
        animate={still ? { scale: 0.96, opacity: 0.7 } : { scale: [1, 1.04, 1] }} transition={{ repeat: still ? 0 : Infinity, duration: fast ? 1 : 2.8 }}>
        <div className="absolute inset-0 rounded-full opacity-40" style={{ background: `conic-gradient(from 0deg, transparent, ${p.b}55, transparent 30%, ${p.a}44, transparent 60%)` }} />
        {fast && (
          <motion.div className="absolute inset-x-0 h-[2px]" style={{ background: p.a, boxShadow: `0 0 18px 4px ${p.a}` }}
            animate={{ top: ["8%", "92%", "8%"] }} transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }} />
        )}
        <CenterIcon phase={phase} color={p.a} />
      </motion.div>
      {phase === "verified" && <Burst color={p.a} />}
    </motion.div>
  );
};
