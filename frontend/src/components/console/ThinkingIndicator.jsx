import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const hex = () => Math.random().toString(16).slice(2, 10);

export const ThinkingIndicator = ({ label = "Running verified private inference on 0G…" }) => {
  const [stream, setStream] = useState(hex());
  useEffect(() => {
    const t = setInterval(() => setStream(hex() + hex()), 90);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex items-center gap-4" data-testid="thinking-indicator">
      <div className="relative h-9 w-9">
        <motion.span className="absolute inset-0 rounded-full border border-cyan-400/60 border-t-transparent"
          animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }} />
        <motion.span className="absolute inset-1.5 rounded-full border border-violet-400/60 border-b-transparent"
          animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} />
        <span className="absolute inset-[14px] rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(34,211,238,0.9)]" />
      </div>
      <div>
        <div className="shimmer-text text-sm font-medium">{label}</div>
        <div className="font-mono text-[10px] tracking-wider text-slate-600">enclave · 0x{stream}</div>
      </div>
    </div>
  );
};
