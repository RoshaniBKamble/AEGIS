# AEGIS backend API regression tests: health, 0G status, agent think SSE, World ID verify
import json
import os

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")


def _sse(resp):
    events = []
    for line in resp.iter_lines(decode_unicode=True):
        if line and line.startswith("data: "):
            events.append(json.loads(line[6:]))
    return events


# Health
def test_root():
    r = requests.get(f"{BASE_URL}/api/", timeout=20)
    assert r.status_code == 200
    assert r.json() == {"service": "aegis", "status": "ok"}


# 0G status
def test_zerog_status():
    r = requests.get(f"{BASE_URL}/api/zerog/status", timeout=20)
    assert r.status_code == 200
    d = r.json()
    assert d["online"] is True
    assert d["demo_mode"] is True
    assert d["provider_address"].startswith("0x") and len(d["provider_address"]) == 42
    assert d["node"].startswith("0g-pc-")


# Agent think - plain conversation
def test_think_plain():
    body = {"session_id": "TEST_ses1", "messages": [{"role": "user", "text": "In one sentence, what are you?"}]}
    r = requests.post(f"{BASE_URL}/api/agent/think", json=body, stream=True, timeout=90)
    assert r.status_code == 200
    assert "text/event-stream" in r.headers.get("content-type", "")
    ev = _sse(r)
    types = [e["type"] for e in ev]
    assert types[0] == "meta"
    assert ev[0]["request_id"].startswith("0g-req-")
    assert "error" not in types, ev
    assert types[-1] == "done"
    done = ev[-1]
    assert len(done["text"]) > 5
    assert "<<ACTION>>" not in done["text"]
    assert done["proof"]["attestation"].startswith("0x")
    assert "delta" in types


# Agent think - action extraction
def test_think_action_transfer():
    body = {"session_id": "TEST_ses2", "messages": [{"role": "user", "text": "Send 0.5 ETH to mira.eth for the studio deposit"}]}
    r = requests.post(f"{BASE_URL}/api/agent/think", json=body, stream=True, timeout=90)
    ev = _sse(r)
    done = ev[-1]
    assert done["type"] == "done", ev
    a = done["action"]
    assert a is not None
    assert a["category"] in ("transaction", "payment")
    assert a["risk"] in ("high", "critical", "medium")
    assert isinstance(a["params"], dict)
    assert "<<ACTION>>" not in done["text"]


def test_think_action_read():
    body = {"session_id": "TEST_ses3", "messages": [{"role": "user", "text": "Check my wallet balances across Base and Arbitrum"}]}
    r = requests.post(f"{BASE_URL}/api/agent/think", json=body, stream=True, timeout=90)
    done = _sse(r)[-1]
    assert done["type"] == "done"
    assert done["action"] is not None
    assert done["action"]["category"] == "read"
    assert done["action"]["risk"] == "low"


# Agent think - follow-up event must not emit action
@pytest.mark.parametrize("outcome", ["denied", "approved"])
def test_think_event_no_action(outcome):
    body = {"session_id": "TEST_ses4", "messages": [{"role": "user", "text": "Send 0.5 ETH to mira.eth"}],
            "event": {"outcome": outcome, "action": {"title": "Send 0.5 ETH to mira.eth", "risk": "high"},
                      "proof": {"nullifier_hash": "0xabc"}, "receipt": {"ref": "0x1234"}}}
    r = requests.post(f"{BASE_URL}/api/agent/think", json=body, stream=True, timeout=90)
    done = _sse(r)[-1]
    assert done["type"] == "done"
    assert done["action"] is None
    assert len(done["text"]) > 5


# Validation
def test_think_validation():
    r = requests.post(f"{BASE_URL}/api/agent/think", json={"session_id": "", "messages": []}, timeout=20)
    assert r.status_code == 422
    r = requests.post(f"{BASE_URL}/api/agent/think", json={"session_id": "x", "messages": [{"role": "bad", "text": "x"}]}, timeout=20)
    assert r.status_code == 422
    r = requests.post(f"{BASE_URL}/api/agent/think", json={"session_id": "x", "messages": [], "event": {"outcome": "nope", "action": {}}}, timeout=20)
    assert r.status_code == 422


# World ID verify
def test_worldid_valid():
    p = {"proof": "0xabc123", "merkle_root": "0x1", "nullifier_hash": "0xnull", "action": "aegis-gate", "signal": "act_1"}
    r = requests.post(f"{BASE_URL}/api/worldid/verify", json=p, timeout=20)
    assert r.status_code == 200
    d = r.json()
    assert d["success"] is True and d["code"] is None
    assert d["nullifier_hash"] == "0xnull"
    assert isinstance(d["verified_at_block"], int)


def test_worldid_invalid():
    p = {"proof": "0xdeadbeef", "merkle_root": "0x1", "nullifier_hash": "0xnull", "action": "aegis-gate"}
    r = requests.post(f"{BASE_URL}/api/worldid/verify", json=p, timeout=20)
    d = r.json()
    assert d["success"] is False and d["code"] == "invalid_proof"


def test_worldid_missing_fields():
    r = requests.post(f"{BASE_URL}/api/worldid/verify", json={"proof": "0x1"}, timeout=20)
    assert r.status_code == 422
