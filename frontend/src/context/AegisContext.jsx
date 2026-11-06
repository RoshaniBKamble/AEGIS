import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { idbClear, idbGet, idbSet, loadLocal, saveLocal } from "@/lib/storage";
import { DEFAULT_POLICY, evaluatePolicy } from "@/lib/policy";
import { streamInference } from "@/lib/zerog";
import { randomHex } from "@/lib/worldid";

const AegisContext = createContext(null);
export const useAegis = () => useContext(AegisContext);

const uid = (p) => `${p}_${Math.random().toString(36).slice(2, 10)}`;
const DEFAULT_PROFILE = { name: "Operator", handle: "sovereign.eth", worldId: { connected: true, level: "orb", since: Date.now() } };
const GATE_STATUS = { approved: "executed", denied: "denied", cancelled: "cancelled", expired: "expired", rejected: "rejected" };

const sessionId = () => {
  let s = localStorage.getItem("aegis.session");
  if (!s) { s = uid("ses"); localStorage.setItem("aegis.session", s); }
  return s;
};

const toWire = (m) => ({
  role: m.role,
  text: (m.text || "") + (m.action ? `\n[action "${m.action.title}" — ${m.action.status}]` : ""),
});

export function AegisProvider({ children }) {
  const [hydrated, setHydrated] = useState(false);
  const [messages, setMessages] = useState([]);
  const [audit, setAudit] = useState([]);
  const [policy, setPolicy] = useState(() => loadLocal("aegis.policy", DEFAULT_POLICY));
  const [profile, setProfile] = useState(() => loadLocal("aegis.profile", DEFAULT_PROFILE));
  const [agentState, setAgentState] = useState("idle");
  const [gate, setGate] = useState(null);
  const [lastProof, setLastProof] = useState(null);
  const messagesRef = useRef([]);
  const policyRef = useRef(policy);
  const gateRef = useRef(null);

  useEffect(() => {
    Promise.all([idbGet("messages"), idbGet("audit")])
      .then(([m, a]) => {
        if (m) setMessages(m.map((x) => ({ ...x, streaming: false, action: x.action?.status === "awaiting" ? { ...x.action, status: "expired" } : x.action })));
        if (a) setAudit(a);
      })
      .catch(() => toast.error("Local vault unavailable — history will not persist"))
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    messagesRef.current = messages;
    if (hydrated && !messages.some((m) => m.streaming)) idbSet("messages", messages).catch(() => {});
  }, [messages, hydrated]);
  useEffect(() => { if (hydrated) idbSet("audit", audit).catch(() => {}); }, [audit, hydrated]);
  useEffect(() => { policyRef.current = policy; saveLocal("aegis.policy", policy); }, [policy]);
  useEffect(() => { saveLocal("aegis.profile", profile); }, [profile]);

  const patchMessage = (id, fn) => setMessages((ms) => ms.map((m) => (m.id === id ? { ...m, ...fn(m) } : m)));
  const logAudit = (entry) => setAudit((a) => [{ id: uid("evt"), ts: Date.now(), ...entry }, ...a].slice(0, 500));

  const runInference = useCallback(async (history, event = null) => {
    const id = uid("msg");
    setMessages((ms) => [...ms, { id, role: "agent", text: "", streaming: true, ts: Date.now(), proof: null, event: event ? { outcome: event.outcome, receipt: event.receipt } : null }]);
    setAgentState(event && ["approved", "auto"].includes(event.outcome) ? "executing" : "thinking");
    let proof = null;
    let action = null;
    try {
      await streamInference({ session_id: sessionId(), messages: history.slice(-16).map(toWire), event }, {
        onMeta: (meta) => { proof = { ...meta, status: "running" }; patchMessage(id, () => ({ proof })); },
        onDelta: (t) => patchMessage(id, (m) => ({ text: m.text + t })),
        onDone: (d) => {
          action = d.action;
          proof = { ...proof, ...d.proof, status: "verified" };
          patchMessage(id, () => ({ streaming: false, text: d.text, proof }));
        },
      });
      setLastProof(proof);
      logAudit({ kind: "inference", title: event ? `Agent follow-up · ${event.outcome}` : "Private inference completed", requestId: proof.request_id, attestation: proof.attestation, latency: proof.latency_ms });
      if (action && !event) handleAction(action, id, proof);
      else setAgentState("idle");
    } catch (e) {
      patchMessage(id, () => ({ streaming: false, error: e.message || "Private inference failed", proof: proof && { ...proof, status: "failed" } }));
      logAudit({ kind: "error", title: "Inference failed", detail: e.message, requestId: proof?.request_id });
      setAgentState("idle");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAction = (raw, msgId, proof) => {
    const decision = evaluatePolicy(policyRef.current, raw);
    const action = { ...raw, id: uid("act"), decision, requestId: proof.request_id, status: decision === "human" ? "awaiting" : decision === "deny" ? "blocked" : "auto_approved" };
    patchMessage(msgId, () => ({ action }));
    if (decision === "human") {
      gateRef.current = { action, msgId, openedAt: Date.now() };
      setGate(gateRef.current);
      setAgentState("awaiting_human");
      logAudit({ kind: "gate_open", title: action.title, action, requestId: action.requestId });
      return;
    }
    if (decision === "deny") {
      logAudit({ kind: "blocked", title: action.title, action, requestId: action.requestId });
      runInference(messagesRef.current, { outcome: "blocked", action });
      return;
    }
    const receipt = { ref: randomHex(16), at: Date.now() };
    patchMessage(msgId, () => ({ action: { ...action, receipt } }));
    logAudit({ kind: "auto", title: action.title, action, receipt, requestId: action.requestId });
    runInference(messagesRef.current, { outcome: "auto", action, receipt });
  };

  const resolveGate = useCallback((outcome, proof = null) => {
    const g = gateRef.current;
    if (!g) return;
    gateRef.current = null;
    setGate(null);
    const receipt = outcome === "approved" ? { ref: randomHex(16), at: Date.now() } : null;
    patchMessage(g.msgId, (m) => ({ action: { ...m.action, status: GATE_STATUS[outcome], proof, receipt } }));
    logAudit({ kind: `human_${outcome}`, title: g.action.title, action: g.action, proof, receipt, requestId: g.action.requestId, waited: Date.now() - g.openedAt });
    runInference(messagesRef.current, { outcome, action: g.action, proof, receipt });
  }, [runInference]);

  const send = useCallback((text) => {
    const msg = { id: uid("msg"), role: "user", text, ts: Date.now() };
    setMessages((ms) => [...ms, msg]);
    runInference([...messagesRef.current, msg]);
  }, [runInference]);

  const retry = useCallback((id) => {
    const history = messagesRef.current.filter((m) => m.id !== id);
    setMessages(history);
    runInference(history);
  }, [runInference]);

  const clearSession = () => setMessages([]);
  const clearAll = async () => {
    await idbClear();
    localStorage.clear();
    setMessages([]); setAudit([]); setPolicy(DEFAULT_POLICY); setProfile(DEFAULT_PROFILE);
  };

  const busy = agentState !== "idle";
  const value = { hydrated, messages, audit, policy, setPolicy, profile, setProfile, agentState, busy, gate, lastProof, send, retry, resolveGate, clearSession, clearAll, setAudit };
  return <AegisContext.Provider value={value}>{children}</AegisContext.Provider>;
}
