// World ID human verification.
//
// DEMO MODE: `requestHumanProof` simulates the IDKit / Agent Pass flow and
// returns a proof-shaped object that the backend accepts in demo mode.
//
// TO CONNECT REAL WORLD ID:
//   1. `yarn add @worldcoin/idkit` and create an app + incognito action
//      ("aegis-human-gate") in the World Developer Portal.
//   2. Replace `requestHumanProof` with IDKit:
//        <IDKitWidget app_id={APP_ID} action="aegis-human-gate"
//          signal={action.id} verification_level={VerificationLevel.Orb}
//          handleVerify={(proof) => verifyOnServer(proof)} onSuccess={...} />
//      or the `useIDKit` hook for a headless flow inside HumanGateModal.
//   3. Use the action id as the signal so each proof is bound to one action.
//   4. Keep `verifyOnServer` — the backend forwards the proof to the
//      Developer Portal verify endpoint (see backend/server.py).
const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
export const WORLD_ID_ACTION = "aegis-human-gate";

const hex = (bytes) =>
  "0x" + Array.from(crypto.getRandomValues(new Uint8Array(bytes)), (b) => b.toString(16).padStart(2, "0")).join("");

export const requestHumanProof = async ({ signal, forceInvalid = false }) => {
  await new Promise((r) => setTimeout(r, 2400));
  return {
    proof: forceInvalid ? "0xdead" + hex(30).slice(2) : hex(32),
    merkle_root: hex(32),
    nullifier_hash: hex(32),
    verification_level: "orb",
    action: WORLD_ID_ACTION,
    signal,
  };
};

export const verifyOnServer = async (proof) => {
  const res = await fetch(`${API}/worldid/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(proof),
  });
  if (!res.ok) throw new Error("Verifier unreachable");
  return res.json();
};

export const randomHex = hex;
