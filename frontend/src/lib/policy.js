export const RISKS = ["low", "medium", "high", "critical"];
export const riskRank = (r) => RISKS.indexOf(r);

export const CATEGORIES = [
  { id: "read", label: "Read-only lookups", hint: "Balances, calendars, summaries", icon: "Eye" },
  { id: "message", label: "Outbound messages", hint: "Email, chat, social posts", icon: "Send" },
  { id: "data_access", label: "Private data access", hint: "Health, identity, documents", icon: "FileLock2" },
  { id: "transaction", label: "On-chain transactions", hint: "Transfers, swaps, signing", icon: "ArrowLeftRight" },
  { id: "payment", label: "Payment decisions", hint: "Purchases, subscriptions, invoices", icon: "CreditCard" },
  { id: "irreversible", label: "Irreversible steps", hint: "Deletion, revocation, closing accounts", icon: "Flame" },
];

export const PRESETS = {
  guardian: {
    name: "Guardian",
    tagline: "Every consequential step needs you.",
    autoRiskCeiling: "low",
    categories: { read: "auto", message: "human", data_access: "human", transaction: "human", payment: "human", irreversible: "human" },
  },
  balanced: {
    name: "Balanced",
    tagline: "Free, low-risk work runs on its own.",
    autoRiskCeiling: "medium",
    categories: { read: "auto", message: "auto", data_access: "human", transaction: "human", payment: "human", irreversible: "human" },
  },
  operator: {
    name: "Operator",
    tagline: "Maximum autonomy below critical.",
    autoRiskCeiling: "high",
    categories: { read: "auto", message: "auto", data_access: "auto", transaction: "auto", payment: "human", irreversible: "human" },
  },
};

export const DEFAULT_POLICY = { preset: "guardian", gateTimeout: 45, ...PRESETS.guardian };

// Returns "auto" | "human" | "deny". Critical and irreversible actions can never auto-run.
export const evaluatePolicy = (policy, action) => {
  const rule = policy.categories[action.category] || "human";
  if (rule === "deny") return "deny";
  if (action.risk === "critical" || action.category === "irreversible") return "human";
  if (rule === "human") return "human";
  return riskRank(action.risk) <= riskRank(policy.autoRiskCeiling) ? "auto" : "human";
};

export const policyMode = (policy) => {
  const p = PRESETS[policy.preset];
  const same = p && p.autoRiskCeiling === policy.autoRiskCeiling &&
    Object.entries(p.categories).every(([k, v]) => policy.categories[k] === v);
  return same ? p.name : "Custom";
};

export const policyHash = (policy) => {
  const s = JSON.stringify({ c: policy.categories, r: policy.autoRiskCeiling, t: policy.gateTimeout });
  let h1 = 0x811c9dc5, h2 = 0x1b873593;
  for (let i = 0; i < s.length; i++) {
    h1 = Math.imul(h1 ^ s.charCodeAt(i), 16777619);
    h2 = Math.imul(h2 ^ s.charCodeAt(i), 2246822507);
  }
  return "0x" + (h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0");
};
