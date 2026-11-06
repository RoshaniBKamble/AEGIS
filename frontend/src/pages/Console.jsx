import { useEffect, useRef } from "react";
import { Cpu, Eraser } from "lucide-react";
import { useAegis } from "@/context/AegisContext";
import { MessageBubble } from "@/components/console/MessageBubble";
import { Composer } from "@/components/console/Composer";
import { EmptyState } from "@/components/console/EmptyState";
import { SessionPanel } from "@/components/console/SessionPanel";
import { StatusDot, AGENT_STATES } from "@/components/StatusDot";

const Header = () => {
  const { agentState, clearSession, messages, busy } = useAegis();
  const s = AGENT_STATES[agentState];
  return (
    <header className="flex items-center justify-between gap-4 border-b border-white/[0.06] px-6 py-4 lg:px-10">
      <div className="flex items-center gap-4">
        <div>
          <div className="font-display text-[15px] font-medium text-white">Agent Console</div>
          <div className="flex items-center gap-2 text-[12px] text-slate-500" data-testid="console-agent-state"><StatusDot tone={s.tone} pulse={s.pulse} />{s.label}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.05] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-200 md:inline-flex" data-testid="console-zerog-badge">
          <Cpu className="h-3.5 w-3.5" />Verified private inference on 0G
        </span>
        <span className="rounded-full border border-amber-400/20 bg-amber-400/[0.06] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-amber-200" data-testid="console-demo-badge">Demo mode</span>
        {messages.length > 0 && (
          <button onClick={clearSession} disabled={busy} data-testid="console-clear-btn" title="Clear conversation"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] text-slate-400 transition-colors hover:text-white disabled:opacity-30">
            <Eraser className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </header>
  );
};

export default function Console() {
  const { messages, retry, hydrated } = useAegis();
  const bottom = useRef(null);
  const last = messages[messages.length - 1];
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages.length, last?.text, last?.action?.status]);

  return (
    <div className="flex h-full">
      <section className="flex min-w-0 flex-1 flex-col">
        <Header />
        <div className="flex-1 overflow-y-auto px-6 lg:px-10" data-testid="console-message-list">
          {hydrated && messages.length === 0 ? <EmptyState /> : (
            <div className="mx-auto max-w-3xl space-y-8 py-10">
              {messages.map((m, i) => <MessageBubble key={m.id} msg={m} index={i} onRetry={retry} />)}
              <div ref={bottom} />
            </div>
          )}
        </div>
        <Composer />
      </section>
      <SessionPanel />
    </div>
  );
}
