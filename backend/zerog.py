"""0G Private Computer inference adapter.

DEMO MODE: the reasoning model is called through a hosted LLM gateway and the
0G envelope (request id, enclave attestation, provider address) is simulated
so the full product flow works without a funded 0G account.

TO CONNECT REAL 0G PRIVATE COMPUTER:
  1. Create a wallet and fund a 0G Compute ledger account.
  2. Use the 0G Serving Broker (`@0glabs/0g-serving-broker`, or a small Node
     sidecar) to list providers and call `broker.inference.getServiceMetadata`
     to obtain the provider `endpoint` and `model`.
  3. For each request, get signed headers with
     `broker.inference.getRequestHeaders(provider, content)` and POST an
     OpenAI-compatible `/chat/completions` request to `endpoint`.
  4. Verify the TEE-signed response with
     `broker.inference.processResponse(provider, content, chatID)` and return
     the real chat id + signature in `_envelope()` / `done` below.
  Set AEGIS_DEMO_MODE=false and ZG_PROVIDER_ADDRESS / ZG_BROKER_URL in .env.
"""
import hashlib
import json
import os
import secrets
import time
import uuid
from typing import AsyncIterator, Optional

from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone

ACTION_MARKER = "<<ACTION>>"
CATEGORIES = {"read", "message", "data_access", "transaction", "payment", "irreversible"}
RISKS = {"low", "medium", "high", "critical"}

SYSTEM_PROMPT = """You are AEGIS, a sovereign personal AI agent running inside a verified private compute enclave on 0G. You act on behalf of exactly one human. You plan and execute tasks, but every consequential action is executed only after it passes the human's autonomy policy and, when required, a fresh World ID human verification.

Voice: confident, precise, calm, a little cinematic but never theatrical. Short paragraphs. No emojis. No markdown headings or bold. You may use a short dash list (max 4 steps) for plans. Keep replies under 110 words.

When the request implies a concrete action in the world (sending a message or email, moving funds, signing a transaction, a payment decision, accessing private data, deleting anything or any irreversible step, or a read-only lookup on the user's accounts), briefly state your plan, then end the reply with exactly one final line:
<<ACTION>>{"title": "...", "summary": "...", "category": "...", "risk": "...", "params": {"key": "value"}}
- title: imperative, max 60 chars
- summary: one sentence
- category: one of read | message | data_access | transaction | payment | irreversible
- risk: one of low | medium | high | critical
- params: 2 to 5 short string key/value pairs (e.g. recipient, amount, network, scope, channel)
Risk guide: read-only lookups are low; messages to other people are medium; private data access is high; moving funds or payments are high, critical when large; deletions and irreversible steps are critical.
Never claim the action is done in this turn: it is pending policy evaluation. For plain conversation or questions, just answer and omit the action line."""

EVENT_PROMPTS = {
    "approved": 'SYSTEM EVENT: The human proved they are present with a fresh World ID proof (nullifier {nullifier}). The action "{title}" was executed. Execution reference {receipt}. Confirm completion in 1-3 sentences with a specific, plausible result, and note it was human-verified.',
    "auto": 'SYSTEM EVENT: The action "{title}" (risk {risk}) was auto-approved by the autonomy policy and executed. Execution reference {receipt}. Report the result in 1-3 sentences with specific, plausible details.',
    "blocked": 'SYSTEM EVENT: The action "{title}" was blocked by the human\'s autonomy policy, because its category is set to Block. Nothing was executed. Explain briefly and tell them they can change this in the Policy editor.',
    "denied": 'SYSTEM EVENT: The human explicitly DENIED the action "{title}" at the Human Gate. Abort cleanly: confirm nothing was executed and nothing left the enclave, and offer one safer alternative.',
    "cancelled": 'SYSTEM EVENT: The human dismissed the World ID verification for "{title}" without deciding. Abort cleanly, confirm nothing was executed, and say the action can be re-requested any time.',
    "expired": 'SYSTEM EVENT: The verification window for "{title}" expired with no human proof. The gate closed automatically and the action was aborted. Explain this calmly in 1-2 sentences.',
    "rejected": 'SYSTEM EVENT: The World ID proof submitted for "{title}" failed validation. The action was aborted for safety. Explain briefly and suggest retrying verification.',
}


def _hex(n: int) -> str:
    return secrets.token_hex(n)


class ZeroGPrivateComputer:
    def __init__(self) -> None:
        self.api_key = os.environ.get("EMERGENT_LLM_KEY")
        self.provider = os.environ.get("AGENT_MODEL_PROVIDER", "anthropic")
        self.model = os.environ.get("AGENT_MODEL_NAME", "claude-sonnet-5-5")
        self.demo = os.environ.get("AEGIS_DEMO_MODE", "true").lower() == "true"
        self.node = f"0g-pc-{hashlib.sha1(self.model.encode()).hexdigest()[:6]}"
        self.provider_address = "0x" + hashlib.sha256(self.node.encode()).hexdigest()[:40]

    def status(self) -> dict:
        return {
            "online": bool(self.api_key),
            "demo_mode": self.demo,
            "network": "0G Galileo Testnet" if self.demo else "0G Mainnet",
            "node": self.node,
            "provider_address": self.provider_address,
            "tee": "Intel TDX + NVIDIA H100 CC",
            "model": self.model,
        }

    def _envelope(self) -> dict:
        return {
            "request_id": f"0g-req-{uuid.uuid4().hex[:12]}",
            "node": self.node,
            "provider_address": self.provider_address,
            "tee": "Intel TDX + NVIDIA H100 CC",
            "model": self.model,
            "simulated": self.demo,
        }

    @staticmethod
    def build_prompt(messages: list, event: Optional[dict]) -> str:
        lines = [f"{'HUMAN' if m['role'] == 'user' else 'AEGIS'}: {m['text']}" for m in messages]
        transcript = "\n\n".join(lines) or "(no prior messages)"
        if not event:
            return f"Conversation so far:\n\n{transcript}\n\nRespond as AEGIS to the latest HUMAN message."
        action = event.get("action") or {}
        proof = event.get("proof") or {}
        template = EVENT_PROMPTS.get(event.get("outcome"), EVENT_PROMPTS["cancelled"])
        note = template.format(
            title=action.get("title", "the action"),
            risk=action.get("risk", "unknown"),
            nullifier=(proof.get("nullifier_hash") or "n/a")[:18],
            receipt=(event.get("receipt") or {}).get("ref", "n/a")[:18],
        )
        return f"Conversation so far:\n\n{transcript}\n\n{note}\nDo not output an action line."

    @staticmethod
    def parse_action(text: str) -> Optional[dict]:
        if ACTION_MARKER not in text:
            return None
        raw = text.split(ACTION_MARKER, 1)[1].strip().strip("`").strip()
        if raw.startswith("json"):
            raw = raw[4:].strip()
        try:
            data = json.loads(raw[: raw.rfind("}") + 1])
        except (ValueError, TypeError):
            return None
        category = data.get("category") if data.get("category") in CATEGORIES else "data_access"
        risk = data.get("risk") if data.get("risk") in RISKS else "high"
        params = {str(k): str(v) for k, v in (data.get("params") or {}).items()}
        return {
            "title": str(data.get("title", "Pending action"))[:80],
            "summary": str(data.get("summary", "")),
            "category": category,
            "risk": risk,
            "params": params,
        }

    async def stream(self, session_id: str, messages: list, event: Optional[dict]) -> AsyncIterator[dict]:
        envelope = self._envelope()
        started = time.perf_counter()
        yield {"type": "meta", **envelope}

        chat = LlmChat(api_key=self.api_key, session_id=f"{session_id}-{envelope['request_id']}", system_message=SYSTEM_PROMPT)
        chat.with_model(self.provider, self.model)

        full, sent = "", 0
        async for ev in chat.stream_message(UserMessage(text=self.build_prompt(messages, event))):
            if isinstance(ev, TextDelta):
                full += ev.content
                safe = self._safe_len(full)
                if safe > sent:
                    yield {"type": "delta", "text": full[sent:safe]}
                    sent = safe
            elif isinstance(ev, StreamDone):
                break

        visible = full.split(ACTION_MARKER, 1)[0].rstrip()
        if len(visible) > sent:
            yield {"type": "delta", "text": visible[sent:]}
        yield {
            "type": "done",
            "text": visible,
            "action": None if event else self.parse_action(full),
            "proof": {
                "attestation": "0x" + hashlib.sha256((envelope["request_id"] + full).encode()).hexdigest(),
                "signature": "0x" + _hex(32),
                "latency_ms": int((time.perf_counter() - started) * 1000),
            },
        }

    @staticmethod
    def _safe_len(full: str) -> int:
        idx = full.find(ACTION_MARKER)
        if idx >= 0:
            return idx
        for k in range(len(ACTION_MARKER) - 1, 0, -1):
            if full.endswith(ACTION_MARKER[:k]):
                return len(full) - k
        return len(full)
