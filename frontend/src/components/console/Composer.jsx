import { useState } from "react";
import { ArrowUp, Lock } from "lucide-react";
import { useAegis } from "@/context/AegisContext";
import { AGENT_STATES } from "@/components/StatusDot";

export const Composer = () => {
  const { send, busy, agentState } = useAegis();
  const [text, setText] = useState("");
  const submit = () => {
    const t = text.trim();
    if (!t || busy) return;
    send(t);
    setText("");
  };
  return (
    <div className="px-6 pb-6 pt-2 lg:px-10">
      <div className="group relative mx-auto max-w-3xl">
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-cyan-400/30 via-blue-500/20 to-violet-500/30 opacity-40 blur-[2px] transition-opacity duration-300 group-focus-within:opacity-100" />
        <div className="relative flex items-end gap-3 rounded-2xl border border-white/[0.08] bg-[#090c18]/90 p-3 backdrop-blur-xl">
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={1} data-testid="composer-input"
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
            placeholder={busy ? `${AGENT_STATES[agentState].label}…` : "Give AEGIS an instruction — e.g. “Send 0.4 ETH to mira.eth for the studio deposit”"}
            className="max-h-40 min-h-[44px] flex-1 resize-none bg-transparent px-2 py-2.5 text-[14.5px] text-slate-100 placeholder:text-slate-600 focus:outline-none" />
          <button onClick={submit} disabled={busy || !text.trim()} data-testid="composer-send-btn"
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-[0_0_24px_-4px_rgba(34,211,238,0.7)] transition-[transform,opacity] duration-200 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:shadow-none">
            <ArrowUp className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-2.5 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600">
          <Lock className="h-3 w-3" />Reasoning sealed in 0G Private Computer · sensitive actions require World ID
        </div>
      </div>
    </div>
  );
};
