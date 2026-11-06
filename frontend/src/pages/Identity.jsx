import { useEffect, useState } from "react";
import { Cpu, Fingerprint, HardDrive, Trash2, CheckCircle2, XCircle, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { useAegis } from "@/context/AegisContext";
import { fetchZeroGStatus } from "@/lib/zerog";
import { randomHex } from "@/lib/worldid";
import { StatusDot } from "@/components/StatusDot";
import { EVENT_META } from "@/components/audit/eventMeta";

const Panel = ({ icon: Icon, title, status, children, testId }) => (
  <section className="glass-panel rounded-3xl p-6" data-testid={testId}>
    <div className="mb-5 flex items-center justify-between">
      <div className="flex items-center gap-3"><Icon className="h-4 w-4 text-slate-400" strokeWidth={1.6} /><h2 className="font-display text-lg text-white">{title}</h2></div>
      {status}
    </div>
    {children}
  </section>
);

const KV = ({ k, v }) => (
  <div className="flex justify-between gap-6 border-b border-dashed border-white/[0.05] py-2 text-[13px]"><span className="text-slate-500">{k}</span><span className="truncate font-mono text-[12px] text-slate-200">{v}</span></div>
);

const Profile = () => {
  const { profile, setProfile } = useAegis();
  const field = (k, label) => (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600">{label}</span>
      <input value={profile[k]} onChange={(e) => setProfile((p) => ({ ...p, [k]: e.target.value }))} data-testid={`profile-${k}-input`}
        className="mt-1.5 w-full rounded-xl border border-white/[0.08] bg-black/30 px-4 py-2.5 text-[14px] text-white focus:border-cyan-400/40 focus:outline-none" />
    </label>
  );
  return (
    <Panel icon={User} title="Profile" testId="identity-profile">
      <div className="flex items-center gap-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 font-display text-xl font-semibold text-white">{(profile.name || "?").slice(0, 2).toUpperCase()}</div>
        <div className="grid flex-1 gap-3 sm:grid-cols-2">{field("name", "Display name")}{field("handle", "Handle")}</div>
      </div>
    </Panel>
  );
};

const WorldIdPanel = () => {
  const { profile, setProfile } = useAegis();
  const w = profile.worldId;
  const toggle = () => {
    // Real integration: open IDKit with a "connect" action and store the returned nullifier.
    setProfile((p) => ({ ...p, worldId: w.connected ? { connected: false } : { connected: true, level: "orb", since: Date.now(), nullifier: randomHex(16) } }));
    toast(w.connected ? "World ID unlinked" : "World ID linked (demo)");
  };
  return (
    <Panel icon={Fingerprint} title="World ID" testId="identity-worldid"
      status={<span className="flex items-center gap-2 text-[12px] text-slate-300" data-testid="identity-worldid-status"><StatusDot tone={w.connected ? "green" : "red"} pulse={w.connected} />{w.connected ? "Linked" : "Not linked"}</span>}>
      <KV k="Verification level" v={w.connected ? "Orb · unique human" : "—"} />
      <KV k="Linked since" v={w.connected ? new Date(w.since).toLocaleDateString() : "—"} />
      <KV k="Gate policy" v="Fresh proof per action" />
      <button onClick={toggle} data-testid="identity-worldid-toggle" className="mt-5 rounded-full border border-white/10 px-4 py-2 text-[13px] text-slate-200 transition-colors hover:bg-white/5">{w.connected ? "Unlink World ID" : "Link World ID"}</button>
    </Panel>
  );
};

const ZeroGPanel = () => {
  const [s, setS] = useState(null);
  const [err, setErr] = useState(false);
  useEffect(() => { fetchZeroGStatus().then(setS).catch(() => setErr(true)); }, []);
  const status = err ? <span className="flex items-center gap-1.5 text-[12px] text-rose-300"><XCircle className="h-3.5 w-3.5" />Unreachable</span>
    : !s ? <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
    : <span className="flex items-center gap-1.5 text-[12px] text-emerald-300" data-testid="identity-zerog-status"><CheckCircle2 className="h-3.5 w-3.5" />{s.online ? "Connected" : "Offline"}</span>;
  return (
    <Panel icon={Cpu} title="0G Private Computer" status={status} testId="identity-zerog">
      {s ? (<>
        <KV k="Network" v={s.network} /><KV k="Node" v={s.node} /><KV k="Provider" v={`${s.provider_address.slice(0, 12)}…`} /><KV k="Enclave" v={s.tee} /><KV k="Model" v={s.model} />
        {s.demo_mode && <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/[0.05] px-3 py-2 text-[12px] text-amber-200/90">Demo mode — 0G attestation envelope is simulated.</div>}
      </>) : err ? <div className="text-[13px] text-slate-500">Could not reach the inference gateway.</div> : <div className="h-32 animate-pulse rounded-xl bg-white/[0.03]" />}
    </Panel>
  );
};

const History = () => {
  const { audit } = useAegis();
  const items = audit.filter((e) => e.kind.startsWith("human_"));
  return (
    <Panel icon={Fingerprint} title="Verification history" testId="identity-history">
      {items.length === 0 ? <div className="text-[13px] text-slate-500" data-testid="identity-history-empty">No human verifications yet.</div> : (
        <div className="space-y-2">
          {items.slice(0, 12).map((e, i) => (
            <div key={e.id} className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.05] bg-white/[0.015] px-4 py-2.5" data-testid={`identity-history-item-${i}`}>
              <div className="min-w-0"><div className="truncate text-[13.5px] text-white">{e.title}</div><div className="font-mono text-[10px] text-slate-600">{new Date(e.ts).toLocaleString()}{e.proof ? ` · ${e.proof.nullifier_hash.slice(0, 14)}…` : ""}</div></div>
              <span className={`shrink-0 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] ${EVENT_META[e.kind].ring}`}>{EVENT_META[e.kind].label}</span>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
};

export default function Identity() {
  const { clearAll } = useAegis();
  const wipe = async () => { await clearAll(); toast.success("Local vault wiped"); };
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl space-y-6 px-6 py-10 lg:px-10">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-cyan-300/70">Settings & identity</div>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em] text-white">Who's in control.</h1>
        </div>
        <Profile />
        <div className="grid gap-6 lg:grid-cols-2"><WorldIdPanel /><ZeroGPanel /></div>
        <History />
        <Panel icon={HardDrive} title="Local vault" testId="identity-vault">
          <p className="text-[13.5px] text-slate-400">Conversations and the audit log live in this browser's IndexedDB; policy and profile live in localStorage. Nothing is stored on a server.</p>
          <button onClick={wipe} data-testid="identity-wipe-btn" className="mt-5 inline-flex items-center gap-2 rounded-full border border-rose-400/30 px-4 py-2 text-[13px] text-rose-200 transition-colors hover:bg-rose-500/10"><Trash2 className="h-3.5 w-3.5" />Wipe all local data</button>
        </Panel>
      </div>
    </div>
  );
}
