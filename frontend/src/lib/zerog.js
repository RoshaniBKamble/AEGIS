// Client for the agent intelligence layer. Every agent reply is produced by the
// backend's 0G Private Computer adapter (see backend/zerog.py) and streamed back
// as server-sent events: meta (0G request envelope) -> delta (tokens) -> done (proof).
const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export async function streamInference(body, { onMeta, onDelta, onDone }) {
  const res = await fetch(`${API}/agent/think`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok || !res.body) throw new Error(`0G node responded ${res.status}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finished = false;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buffer.indexOf("\n\n")) >= 0) {
      const chunk = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      if (!chunk.startsWith("data: ")) continue;
      const ev = JSON.parse(chunk.slice(6));
      if (ev.type === "meta") onMeta(ev);
      else if (ev.type === "delta") onDelta(ev.text);
      else if (ev.type === "done") { finished = true; onDone(ev); }
      else if (ev.type === "error") throw new Error(ev.message || "Private inference failed");
    }
  }
  if (!finished) throw new Error("Inference stream closed before completion");
}

export async function fetchZeroGStatus() {
  const res = await fetch(`${API}/zerog/status`);
  if (!res.ok) throw new Error("0G status unavailable");
  return res.json();
}
