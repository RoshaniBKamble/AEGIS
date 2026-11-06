import { Link } from "react-router-dom";
import { Cpu, Fingerprint, Zap, Ban, ShieldCheck, Activity } from "lucide-react";
import { useAegis } from "@/context/AegisContext";
import { policyHash, policyMode } from "@/lib/policy";
import { EVENT_META } from "@/components/audit/eventMeta";

const Card = ({ title, children, testId }) => (
  <div className="glass-panel rounded-2xl p-4" data-testid={testId}>
    <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">{title}</div>
    {children}
  </div>
);

export const SessionPanel = () => {
  const { lastProof, audit, policy } = useAegis();
  const gates = audit.filter((e) => e.kind.startsWith("human_"));
  const stats = [
    { label: "Verified", v: gates.filter((e) => e.kind === "human_approved").length, icon: Fingerprint, c: "text-emerald-300" },
    { label: "Auto", v: audit.filter((e) => e.kind === "auto").length, icon: Zap, c: "text-cyan-300" },
    { label: "Stopped", v: gates.length - gates.filter((e) => e.kind === "human_approved").length + audit.filter((e) => e.kind === "blocked").length, icon: Ban, c: "text-rose-300" },
  ];
  return (
    <aside className="hidden w-[300px] shrink-0 space-y-4 overflow-y-auto border-l border-white/[0.06] p-5 xl:block">
      <Card title="Latest 0G proof" testId="session-latest-proof">
        {lastProof ? (
          <div className="space-y-1.5 font-mono text-[10.5px]">
            <div className="flex items-center gap-2 text-emerald-300"><ShieldCheck className="h-3.5 w-3.5" />Enclave attested</div>
            <div className="text-slate-400">{lastProof.request_id}</div>
            <div className="truncate text-slate-600">{lastProof.attestation}</div>
            <div className="flex justify-between text-slate-500"><span>{lastProof.node}</span><span>{lastProof.latency_ms} ms</span></div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[13px] text-slate-500"><Cpu className="h-4 w-4" />No inference yet this session</div>
        )}
      </Card>
      <Card title="Human gate" testId="session-gate-stats">
        <div className="grid grid-cols-3 gap-2">
          {stats.map(({ label, v, icon: Icon, c }) => (
            <div key={label} className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-2.5">
              <Icon className={`h-3.5 w-3.5 ${c}`} />
              <div className="mt-2 font-display text-xl text-white">{v}</div>
              <div className="text-[10px] text-slate-500">{label}</div>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Active policy" testId="session-policy">
        <div className="flex items-baseline justify-between">
          <span className="font-display text-lg text-white">{policyMode(policy)}</span>
          <Link to="/app/policy" className="text-xs text-cyan-300 hover:text-cyan-200" data-testid="session-edit-policy">Edit</Link>
        </div>
        <div className="mt-1 text-[12px] text-slate-500">Auto-approve up to <span className="text-slate-300">{policy.autoRiskCeiling}</span> risk</div>
        <div className="mt-2 font-mono text-[10px] text-slate-600">hash {policyHash(policy)}</div>
      </Card>
      <Card title="Recent activity" testId="session-recent-activity">
        {audit.length === 0 && <div className="flex items-center gap-2 text-[13px] text-slate-500"><Activity className="h-4 w-4" />Nothing recorded yet</div>}
        <div className="space-y-2.5">
          {audit.slice(0, 6).map((e) => {
            const m = EVENT_META[e.kind] || EVENT_META.inference;
            return (
              <div key={e.id} className="flex items-start gap-2.5 text-[12px]">
                <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${m.dot}`} />
                <div className="min-w-0"><div className="truncate text-slate-300">{e.title}</div><div className="text-[10px] text-slate-600">{m.label}</div></div>
              </div>
            );
          })}
        </div>
      </Card>
    </aside>
  );
};
