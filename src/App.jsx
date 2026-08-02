import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from "recharts";
import {
  Inbox, LayoutGrid, FileText, Users, Plug, Settings, Mail, RefreshCw,
  AlertTriangle, CheckCircle2, Search, Bell, ChevronRight, TrendingUp,
  Clock, DollarSign, Percent, ArrowUpRight, X, Loader2, WifiOff, LogOut,
  Zap, ShieldAlert, MessageCircle,
} from "lucide-react";

const WHATSAPP_CONTACT = "https://wa.me/2348026892077";

// The one place the backend URL lives now — no field for the user to see or type.
const API_BASE_URL = "https://chaser-backend-production.up.railway.app";

// =====================================================================
// Demo fallback data — used only when no live API is reachable, so the
// artifact is still explorable before you've deployed the backend.
// =====================================================================

const DEMO_OVERVIEW = {
  cashCollectedThisMonthCents: 26800000,
  outstandingCents: 59950000,
  openInvoiceCount: 214,
  avgDaysSalesOutstanding: 34.2,
  recoveryRate: 0.964,
  aging: { current: 31200000, "1-30": 14800000, "31-60": 7600000, "61-90": 4100000, "90+": 2250000 },
  cashTrend: [
    { month: "Feb", collectedCents: 18200000 }, { month: "Mar", collectedCents: 19800000 },
    { month: "Apr", collectedCents: 17600000 }, { month: "May", collectedCents: 22100000 },
    { month: "Jun", collectedCents: 24400000 }, { month: "Jul", collectedCents: 26800000 },
  ],
};

const DEMO_INBOX = [
  { id: "1", type: "matched", customerName: "Northwind Foods", detail: "Remittance doc uploaded to Coupa — matched to INV-3311", createdAt: new Date(Date.now() - 2 * 60000).toISOString() },
  { id: "2", type: "reminder", customerName: "Talus Manufacturing", detail: "3rd reminder sent — invoice 41 days past due", createdAt: new Date(Date.now() - 18 * 60000).toISOString() },
  { id: "3", type: "escalated", customerName: "Redline Freight Co.", detail: "No response after 3 touches — routed to collections specialist", createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: "4", type: "paid", customerName: "Ambient Retail Group", detail: "$18,420 received via Stripe — invoice closed", createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: "5", type: "reminder", customerName: "Boreal Supply", detail: "Friendly nudge sent — invoice due in 3 days", createdAt: new Date(Date.now() - 10800000).toISOString() },
];

const DEMO_INVOICES = [
  { id: "a", number: "INV-3311", customerName: "Northwind Foods", amountCents: 2480000, dueDate: "2026-07-12", status: "matched", daysPastDue: 0 },
  { id: "b", number: "INV-3298", customerName: "Talus Manufacturing", amountCents: 912000, dueDate: "2026-06-16", status: "reminder", daysPastDue: 41 },
  { id: "c", number: "INV-2984", customerName: "Quickline Logistics", amountCents: 1560000, dueDate: "2026-06-02", status: "escalated", daysPastDue: 55 },
  { id: "d", number: "INV-3340", customerName: "Ambient Retail Group", amountCents: 1842000, dueDate: "2026-07-20", status: "paid", daysPastDue: 0 },
  { id: "e", number: "INV-3105", customerName: "Redline Freight Co.", amountCents: 3120000, dueDate: "2026-05-30", status: "escalated", daysPastDue: 58 },
];

const DEMO_CUSTOMERS = [
  { id: "1", name: "Redline Freight Co.", openCents: 3120000, openInvoiceCount: 1, worstDaysPastDue: 58 },
  { id: "2", name: "Quickline Logistics", openCents: 1560000, openInvoiceCount: 1, worstDaysPastDue: 55 },
  { id: "3", name: "Talus Manufacturing", openCents: 912000, openInvoiceCount: 1, worstDaysPastDue: 41 },
  { id: "4", name: "Northwind Foods", openCents: 2480000, openInvoiceCount: 1, worstDaysPastDue: 0 },
];

const DEMO_INTEGRATIONS = [
  { provider: "stripe", connected: true, lastSyncedAt: new Date().toISOString() },
  { provider: "quickbooks", connected: true, lastSyncedAt: new Date().toISOString() },
  { provider: "netsuite", connected: true, lastSyncedAt: new Date().toISOString() },
  { provider: "billcom", connected: false, lastSyncedAt: null },
  { provider: "coupa", connected: false, lastSyncedAt: null },
];

const PROVIDER_LABEL = { stripe: "Stripe", quickbooks: "QuickBooks", netsuite: "NetSuite", billcom: "Bill.com", coupa: "Coupa" };
const PROVIDER_ROLE = { stripe: "Payments", quickbooks: "Accounting", netsuite: "ERP", billcom: "AP/AR", coupa: "Supplier portal" };
const PROVIDER_FIELDS = {
  stripe: [{ key: "secretKey", label: "Secret key", placeholder: "sk_live_..." }],
  quickbooks: [{ key: "accessToken", label: "Access token" }, { key: "realmId", label: "Realm ID" }],
  netsuite: [{ key: "accountId", label: "Account ID" }, { key: "tokenId", label: "Token ID" }, { key: "tokenSecret", label: "Token secret" }],
  billcom: [{ key: "orgId", label: "Org ID" }, { key: "devKey", label: "Developer key" }],
  coupa: [{ key: "clientId", label: "Client ID" }, { key: "clientSecret", label: "Client secret" }],
};

const STAMP = {
  reminder: { label: "REMINDER SENT", color: "#3FB78A", icon: Mail },
  matched: { label: "MATCHED", color: "#5CA9E8", icon: RefreshCw },
  escalated: { label: "ESCALATED", color: "#E8A33D", icon: AlertTriangle },
  paid: { label: "PAID", color: "#3FB78A", icon: CheckCircle2 },
  current: { label: "ON TRACK", color: "#8B9AAE", icon: Clock },
  disputed: { label: "DISPUTED", color: "#E85D4D", icon: ShieldAlert },
};

const nav = [
  { key: "overview", label: "Overview", icon: LayoutGrid },
  { key: "inbox", label: "Inbox", icon: Inbox },
  { key: "invoices", label: "Invoices", icon: FileText },
  { key: "customers", label: "Customers", icon: Users },
  { key: "integrations", label: "Integrations", icon: Plug },
];

// ---------- Helpers ----------

const dollars = (cents) => (cents ?? 0) / 100;
const money = (cents) => {
  const n = dollars(cents);
  return n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toFixed(0)}`;
};
const moneyFull = (cents) => `$${dollars(cents).toLocaleString(undefined, { minimumFractionDigits: 0 })}`;
const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
};

async function apiRequest(apiUrl, token, path, opts = {}) {
  const res = await fetch(`${apiUrl.replace(/\/$/, "")}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = typeof json.message === "string" ? json.message : (json.error ? JSON.stringify(json.error) : `Request failed (${res.status})`);
    const err = new Error(message);
    err.code = typeof json.error === "string" ? json.error : undefined; // e.g. "EMAIL_NOT_VERIFIED"
    err.status = res.status;
    throw err;
  }
  return json;
}

// ---------- Small UI pieces ----------

function StampBadge({ type, size = "sm" }) {
  const s = STAMP[type] || STAMP.current;
  const Icon = s.icon;
  const pad = size === "sm" ? "3px 8px" : "5px 11px";
  const fs = size === "sm" ? 10.5 : 11.5;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, padding: pad,
      fontFamily: "'IBM Plex Mono', monospace", fontSize: fs, fontWeight: 600,
      letterSpacing: "0.06em", color: s.color, border: `1.5px solid ${s.color}`,
      borderRadius: 4, transform: "rotate(-1.2deg)", background: `${s.color}14`, whiteSpace: "nowrap",
    }}>
      <Icon size={size === "sm" ? 11 : 12} strokeWidth={2.4} />
      {s.label}
    </span>
  );
}

function MetricCard({ label, value, sub, icon: Icon, accent }) {
  return (
    <div style={{ background: "#16243A", border: "1px solid #24354F", borderRadius: 10, padding: "18px 20px", flex: 1, minWidth: 190 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: "#8B9AAE", textTransform: "uppercase" }}>{label}</span>
        <Icon size={15} color={accent} strokeWidth={2.2} />
      </div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 26, fontWeight: 600, color: "#EDEAE0", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: accent, marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}>{sub}</div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: "#0F1B2D", border: "1px solid #2E4463", borderRadius: 8, padding: "10px 13px", fontFamily: "'IBM Plex Mono', monospace" }}>
      <div style={{ color: "#8B9AAE", fontSize: 11, marginBottom: 4 }}>{label}</div>
      <div style={{ color: "#3FB78A", fontSize: 12.5, fontWeight: 600 }}>Collected: {moneyFull(payload[0].value)}</div>
    </div>
  );
}

function InboxRow({ event, compact }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: compact ? "10px 0" : "14px 4px", borderBottom: "1px solid #24354F" }}>
      <StampBadge type={event.type} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, color: "#EDEAE0", fontWeight: 600 }}>{event.customerName}</div>
        <div style={{ fontSize: 12.5, color: "#8B9AAE", marginTop: 2 }}>{event.detail}</div>
      </div>
      <div style={{ fontSize: 11, color: "#5A6B84", fontFamily: "'IBM Plex Mono', monospace", flexShrink: 0 }}>{timeAgo(event.createdAt)}</div>
    </div>
  );
}

function Panel({ children, style }) {
  return <div style={{ background: "#16243A", border: "1px solid #24354F", borderRadius: 10, padding: "20px 22px", ...style }}>{children}</div>;
}

function Modal({ title, onClose, children }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(11,21,36,0.7)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#16243A", border: "1px solid #24354F", borderRadius: 12,
        padding: "22px 24px", width: 380, maxWidth: "90vw",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: 17, color: "#EDEAE0", fontWeight: 600 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={16} color="#8B9AAE" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalField({ label, ...props }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 12 }}>
      <span style={{ fontSize: 11, color: "#8B9AAE", fontWeight: 600 }}>{label}</span>
      <input
        {...props}
        style={{
          background: "#0B1524", border: "1px solid #24354F", borderRadius: 6, padding: "9px 10px",
          color: "#EDEAE0", fontSize: 13, fontFamily: "'Inter', sans-serif", outline: "none",
        }}
      />
    </label>
  );
}

function CenterState({ icon: Icon, text }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: "50px 0", color: "#5A6B84" }}>
      <Icon size={22} />
      <span style={{ fontSize: 13 }}>{text}</span>
    </div>
  );
}

const linkBtn = { background: "none", border: "none", color: "#5CA9E8", fontSize: 12.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 3, cursor: "pointer", fontFamily: "'Inter', sans-serif" };
const td = { padding: "12px 8px", borderBottom: "1px solid #1E2E46", fontSize: 13 };

// =====================================================================
// Connect screen — login / sign up against the live API, or skip to demo
// =====================================================================

function ConnectScreen({ onConnected, onDemo }) {
  const [mode, setMode] = useState("login");
  const [orgName, setOrgName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [verificationPending, setVerificationPending] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState(null);
  const [resendStatus, setResendStatus] = useState("idle"); // idle | sending | sent

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setUnverifiedEmail(null);
    try {
      const path = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const body = mode === "login" ? { email, password } : { orgName, name, email, password };
      const json = await apiRequest(API_BASE_URL, null, path, { method: "POST", body: JSON.stringify(body) });

      if (mode === "signup" && json.requiresVerification) {
        setVerificationPending(true);
        return;
      }
      onConnected({ apiUrl: API_BASE_URL, token: json.token, user: json.user });
    } catch (err) {
      if (err.code === "EMAIL_NOT_VERIFIED") {
        setUnverifiedEmail(email);
      } else {
        setError(
          err.message?.includes("fetch") || err.message?.includes("Failed")
            ? `Couldn't reach the server. Please try again in a moment.`
            : err.message
        );
      }
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setResendStatus("sending");
    try {
      await apiRequest(API_BASE_URL, null, "/api/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email: unverifiedEmail }),
      });
      setResendStatus("sent");
    } catch {
      setResendStatus("idle");
    }
  };

  const backToLogin = () => {
    setVerificationPending(false);
    setMode("login");
    setPassword("");
  };

  if (verificationPending) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 600, background: "#0F1B2D", borderRadius: 12, border: "1px solid #1E2E46" }}>
        <div style={{ width: 360, padding: "36px 32px", textAlign: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#3FB78A22", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
            <Mail size={22} color="#3FB78A" />
          </div>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 19, color: "#EDEAE0", margin: "0 0 8px 0" }}>Check your email</h2>
          <p style={{ fontSize: 13, color: "#8B9AAE", lineHeight: 1.6, marginBottom: 24 }}>
            We sent a verification link to <strong style={{ color: "#EDEAE0" }}>{email}</strong>. Click it to activate your account, then come back and log in.
          </p>
          <button onClick={backToLogin} style={{
            width: "100%", background: "#233450", border: "1px solid #2E4463", color: "#EDEAE0",
            fontSize: 13, fontWeight: 600, padding: "10px 0", borderRadius: 7, cursor: "pointer",
          }}>
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 600, background: "#0F1B2D", borderRadius: 12, border: "1px solid #1E2E46" }}>
      <div style={{ width: 360, padding: "36px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 22 }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: "#3FB78A", display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(-3deg)" }}>
            <CheckCircle2 size={15} color="#0B1524" strokeWidth={3} />
          </div>
          <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 19, color: "#EDEAE0" }}>Invoice Chaser</span>
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 18, background: "#0B1524", borderRadius: 7, padding: 3 }}>
          {["login", "signup"].map((m) => (
            <button key={m} onClick={() => { setMode(m); setUnverifiedEmail(null); setError(""); }} style={{
              flex: 1, padding: "7px 0", border: "none", borderRadius: 5, cursor: "pointer",
              fontSize: 12.5, fontWeight: 600, fontFamily: "'Inter', sans-serif",
              background: mode === m ? "#233450" : "transparent", color: mode === m ? "#EDEAE0" : "#8B9AAE",
            }}>{m === "login" ? "Log in" : "Sign up"}</button>
          ))}
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {mode === "signup" && (
            <>
              <Field label="Company name" value={orgName} onChange={setOrgName} required />
              <Field label="Your name" value={name} onChange={setName} required />
            </>
          )}
          <Field label="Email" value={email} onChange={setEmail} type="email" required />
          <Field label="Password" value={password} onChange={setPassword} type="password" required />

          {unverifiedEmail && (
            <div style={{ fontSize: 12.5, color: "#E8A33D", background: "#E8A33D14", border: "1px solid #E8A33D33", borderRadius: 6, padding: "10px 12px" }}>
              <div style={{ marginBottom: 8 }}>Your email isn't verified yet. Check your inbox for the link, or:</div>
              <button type="button" onClick={resend} disabled={resendStatus !== "idle"} style={{
                background: "none", border: "1px solid #E8A33D66", color: "#E8A33D", fontSize: 12, fontWeight: 600,
                padding: "6px 10px", borderRadius: 5, cursor: resendStatus === "idle" ? "pointer" : "default",
              }}>
                {resendStatus === "idle" && "Resend verification email"}
                {resendStatus === "sending" && "Sending..."}
                {resendStatus === "sent" && "Sent — check your inbox"}
              </button>
            </div>
          )}

          {error && (
            <div style={{ fontSize: 12, color: "#E85D4D", background: "#E85D4D14", border: "1px solid #E85D4D33", borderRadius: 6, padding: "8px 10px" }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={busy} style={{
            marginTop: 4, background: "#3FB78A", border: "none", color: "#0B1524", fontWeight: 700,
            fontSize: 13.5, padding: "10px 0", borderRadius: 7, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            {busy && <Loader2 size={14} className="spin" />}
            {mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0" }}>
          <div style={{ flex: 1, height: 1, background: "#24354F" }} />
          <span style={{ fontSize: 11, color: "#5A6B84" }}>or</span>
          <div style={{ flex: 1, height: 1, background: "#24354F" }} />
        </div>

        <button onClick={onDemo} style={{
          width: "100%", background: "transparent", border: "1px solid #24354F", color: "#8B9AAE",
          fontSize: 12.5, padding: "9px 0", borderRadius: 7, cursor: "pointer", fontFamily: "'Inter', sans-serif",
        }}>
          Explore with demo data instead
        </button>

        <a href={WHATSAPP_CONTACT} target="_blank" rel="noopener noreferrer" style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          marginTop: 14, fontSize: 12, color: "#5A6B84", textDecoration: "none", fontFamily: "'Inter', sans-serif",
        }}>
          <MessageCircle size={13} /> Need help? Chat with us on WhatsApp
        </a>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder, required }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <span style={{ fontSize: 11, color: "#8B9AAE", fontWeight: 600 }}>{label}</span>
      <input
        type={type} value={value} required={required} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: "#0B1524", border: "1px solid #24354F", borderRadius: 6, padding: "9px 10px",
          color: "#EDEAE0", fontSize: 13, fontFamily: "'Inter', sans-serif", outline: "none",
        }}
      />
    </label>
  );
}

// =====================================================================
// Dashboard views — each fetches its own slice of live data
// =====================================================================

function Overview({ apiUrl, token, mode, setTab }) {
  const [data, setData] = useState(mode === "demo" ? DEMO_OVERVIEW : null);
  const [events, setEvents] = useState(mode === "demo" ? DEMO_INBOX.slice(0, 3) : []);
  const [loading, setLoading] = useState(mode !== "demo");

  useEffect(() => {
    if (mode === "demo") return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      apiRequest(apiUrl, token, "/api/overview"),
      apiRequest(apiUrl, token, "/api/inbox"),
    ]).then(([ov, ib]) => {
      if (cancelled) return;
      setData(ov);
      setEvents(ib.events.slice(0, 3));
    }).catch(() => {}).finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [apiUrl, token, mode]);

  if (loading || !data) return <CenterState icon={Loader2} text="Loading overview..." />;

  return (
    <div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 22 }}>
        <MetricCard label="Cash collected — this month" value={money(data.cashCollectedThisMonthCents)} sub={<><TrendingUp size={12} /> live from connected accounts</>} icon={DollarSign} accent="#3FB78A" />
        <MetricCard label="Outstanding AR" value={money(data.outstandingCents)} sub={`across ${data.openInvoiceCount} open invoices`} icon={FileText} accent="#8B9AAE" />
        <MetricCard label="Avg. days sales outstanding" value={data.avgDaysSalesOutstanding} icon={Clock} accent="#5CA9E8" sub="days from issue to close" />
        <MetricCard label="Recovery rate" value={`${(data.recoveryRate * 100).toFixed(1)}%`} sub="of invoices reach $0 balance" icon={Percent} accent="#5CA9E8" />
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <Panel style={{ flex: "2 1 420px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
            <h3 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: 17, color: "#EDEAE0", fontWeight: 600 }}>Cash collected</h3>
            <span style={{ fontSize: 11.5, color: "#8B9AAE", fontFamily: "'IBM Plex Mono', monospace" }}>last 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={data.cashTrend.map((d) => ({ month: d.month, collected: dollars(d.collectedCents) }))} margin={{ top: 20, right: 6, left: -14, bottom: 0 }}>
              <defs>
                <linearGradient id="collectedFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3FB78A" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#3FB78A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 5" stroke="#24354F" vertical={false} />
              <XAxis dataKey="month" stroke="#8B9AAE" fontSize={11.5} fontFamily="'IBM Plex Mono', monospace" tickLine={false} axisLine={{ stroke: "#24354F" }} />
              <YAxis stroke="#8B9AAE" fontSize={11} fontFamily="'IBM Plex Mono', monospace" tickLine={false} axisLine={false} tickFormatter={(v) => money(v * 100)} width={48} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="collected" stroke="#3FB78A" strokeWidth={2.5} fill="url(#collectedFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel style={{ flex: "1 1 260px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontFamily: "'Fraunces', serif", fontSize: 17, color: "#EDEAE0", fontWeight: 600 }}>Aging book</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={Object.entries(data.aging).map(([bucket, amountCents]) => ({ bucket, amountCents }))}
              layout="vertical" margin={{ left: 6, right: 16 }}
            >
              <XAxis type="number" hide />
              <YAxis dataKey="bucket" type="category" stroke="#8B9AAE" fontSize={11.5} fontFamily="'IBM Plex Mono', monospace" tickLine={false} axisLine={false} width={54} />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
                content={({ active, payload }) => active && payload?.length ? (
                  <div style={{ background: "#0F1B2D", border: "1px solid #2E4463", borderRadius: 8, padding: "8px 12px", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#EDEAE0" }}>
                    {moneyFull(payload[0].value)}
                  </div>
                ) : null}
              />
              <Bar dataKey="amountCents" radius={[0, 4, 4, 0]} barSize={16}>
                {Object.keys(data.aging).map((bucket, i) => (
                  <Cell key={i} fill={bucket === "90+" ? "#E85D4D" : bucket === "61-90" || bucket === "31-60" ? "#E8A33D" : "#3FB78A"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <Panel style={{ marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: 17, color: "#EDEAE0", fontWeight: 600 }}>Latest from your AR team</h3>
          <button onClick={() => setTab("inbox")} style={linkBtn}>Open inbox <ChevronRight size={14} /></button>
        </div>
        {events.length === 0 ? <CenterState icon={Inbox} text="No activity yet" /> : events.map((e) => <InboxRow key={e.id} event={e} compact />)}
      </Panel>
    </div>
  );
}

function InboxView({ apiUrl, token, mode }) {
  const [filter, setFilter] = useState("all");
  const [events, setEvents] = useState(mode === "demo" ? DEMO_INBOX : []);
  const [loading, setLoading] = useState(mode !== "demo");

  useEffect(() => {
    if (mode === "demo") {
      setEvents(filter === "all" ? DEMO_INBOX : DEMO_INBOX.filter((e) => e.type === filter));
      return;
    }
    let cancelled = false;
    setLoading(true);
    apiRequest(apiUrl, token, `/api/inbox?type=${filter}`)
      .then((json) => !cancelled && setEvents(json.events))
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [apiUrl, token, mode, filter]);

  return (
    <Panel>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <h3 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: 18, color: "#EDEAE0", fontWeight: 600 }}>One inbox, everything chased</h3>
        <div style={{ display: "flex", gap: 6 }}>
          {["all", "reminder", "matched", "escalated", "paid"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={{
              background: filter === f ? "#233450" : "transparent", border: "1px solid #24354F",
              color: filter === f ? "#EDEAE0" : "#8B9AAE", borderRadius: 6, padding: "5px 10px",
              fontSize: 11.5, fontFamily: "'IBM Plex Mono', monospace", textTransform: "capitalize", cursor: "pointer",
            }}>{f}</button>
          ))}
        </div>
      </div>
      {loading ? <CenterState icon={Loader2} text="Loading inbox..." /> :
        events.length === 0 ? <CenterState icon={Inbox} text="Nothing here yet" /> :
        events.map((e) => <InboxRow key={e.id} event={e} />)}
    </Panel>
  );
}

function AddInvoiceModal({ apiUrl, token, onClose, onCreated }) {
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [customerId, setCustomerId] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");
  const [number, setNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest(apiUrl, token, "/api/customers")
      .then((json) => setCustomers(json.customers))
      .catch(() => {})
      .finally(() => setLoadingCustomers(false));
  }, [apiUrl, token]);

  const isNewCustomer = customerId === "__new__";

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const body = {
        number,
        amountCents: Math.round(parseFloat(amount) * 100),
        dueDate,
        ...(isNewCustomer
          ? { customerName: newCustomerName, customerEmail: newCustomerEmail }
          : { customerId }),
      };
      await apiRequest(apiUrl, token, "/api/invoices", { method: "POST", body: JSON.stringify(body) });
      onCreated();
      onClose();
    } catch (err) {
      setError(err.message || "Couldn't create invoice");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title="Add invoice" onClose={onClose}>
      <form onSubmit={submit}>
        <label style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: "#8B9AAE", fontWeight: 600 }}>Customer</span>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            required
            disabled={loadingCustomers}
            style={{
              background: "#0B1524", border: "1px solid #24354F", borderRadius: 6, padding: "9px 10px",
              color: "#EDEAE0", fontSize: 13, fontFamily: "'Inter', sans-serif", outline: "none",
            }}
          >
            <option value="" disabled>{loadingCustomers ? "Loading..." : "Select a customer"}</option>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            <option value="__new__">+ New customer...</option>
          </select>
        </label>

        {isNewCustomer && (
          <>
            <ModalField label="Company name" value={newCustomerName} onChange={(e) => setNewCustomerName(e.target.value)} required />
            <ModalField label="Billing email" type="email" value={newCustomerEmail} onChange={(e) => setNewCustomerEmail(e.target.value)} required />
          </>
        )}

        <ModalField label="Invoice number" placeholder="INV-1001" value={number} onChange={(e) => setNumber(e.target.value)} required />
        <ModalField label="Amount (USD)" type="number" step="0.01" min="0.01" placeholder="1500.00" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        <ModalField label="Due date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />

        {error && (
          <div style={{ fontSize: 12, color: "#E85D4D", background: "#E85D4D14", border: "1px solid #E85D4D33", borderRadius: 6, padding: "8px 10px", marginBottom: 12 }}>
            {error}
          </div>
        )}
        <button type="submit" disabled={busy} style={{
          width: "100%", background: "#3FB78A", border: "none", color: "#0B1524", fontWeight: 700,
          fontSize: 13.5, padding: "10px 0", borderRadius: 7, cursor: "pointer",
        }}>
          {busy ? "Adding..." : "Add invoice"}
        </button>
      </form>
    </Modal>
  );
}

function InvoicesView({ apiUrl, token, mode }) {
  const [q, setQ] = useState("");
  const [invoices, setInvoices] = useState(mode === "demo" ? DEMO_INVOICES : []);
  const [loading, setLoading] = useState(mode !== "demo");
  const [actioning, setActioning] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const load = useCallback(() => {
    if (mode === "demo") {
      const ql = q.toLowerCase();
      setInvoices(DEMO_INVOICES.filter((i) => (i.customerName + i.number).toLowerCase().includes(ql)));
      return;
    }
    setLoading(true);
    apiRequest(apiUrl, token, `/api/invoices?q=${encodeURIComponent(q)}`)
      .then((json) => setInvoices(json.invoices))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [apiUrl, token, mode, q]);

  useEffect(() => { load(); }, [load]);

  const act = async (id, action) => {
    if (mode === "demo") return;
    setActioning(id + action);
    try {
      await apiRequest(apiUrl, token, `/api/invoices/${id}/${action}`, { method: "POST" });
      load();
    } catch {} finally {
      setActioning(null);
    }
  };

  return (
    <Panel>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 10, flexWrap: "wrap" }}>
        <h3 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: 18, color: "#EDEAE0", fontWeight: 600 }}>Open invoices</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#0F1B2D", border: "1px solid #24354F", borderRadius: 6, padding: "6px 10px" }}>
            <Search size={13} color="#5A6B84" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customer or invoice..."
              style={{ background: "none", border: "none", outline: "none", color: "#EDEAE0", fontSize: 12.5, fontFamily: "'Inter', sans-serif", width: 200 }} />
          </div>
          <button onClick={() => setShowAdd(true)} disabled={mode === "demo"} style={{
            display: "flex", alignItems: "center", gap: 6, background: "#233450", border: "1px solid #2E4463",
            color: "#EDEAE0", fontSize: 12.5, fontWeight: 600, padding: "8px 14px", borderRadius: 7,
            cursor: mode === "demo" ? "default" : "pointer", opacity: mode === "demo" ? 0.5 : 1, whiteSpace: "nowrap",
          }}>
            + Add invoice
          </button>
        </div>
      </div>
      {loading ? <CenterState icon={Loader2} text="Loading invoices..." /> : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Invoice", "Customer", "Amount", "Due", "Status", "Actions"].map((h) => (
                <th key={h} style={{ textAlign: "left", fontSize: 10.5, letterSpacing: "0.07em", textTransform: "uppercase", color: "#5A6B84", fontWeight: 600, padding: "0 8px 10px 8px", borderBottom: "1px solid #24354F" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td style={td}><span style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#8B9AAE" }}>{inv.number}</span></td>
                <td style={{ ...td, color: "#EDEAE0", fontWeight: 600 }}>{inv.customerName}</td>
                <td style={{ ...td, fontFamily: "'IBM Plex Mono', monospace", color: "#EDEAE0" }}>{moneyFull(inv.amountCents)}</td>
                <td style={{ ...td, color: "#8B9AAE" }}>{new Date(inv.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  {inv.daysPastDue > 0 && <span style={{ color: "#E8A33D", marginLeft: 6, fontSize: 11 }}>· {inv.daysPastDue}d late</span>}
                </td>
                <td style={td}><StampBadge type={inv.status} /></td>
                <td style={{ ...td, display: "flex", gap: 6 }}>
                  {inv.status !== "paid" && (
                    <>
                      <ActionBtn label="Nudge" icon={Zap} busy={actioning === inv.id + "remind"} onClick={() => act(inv.id, "remind")} />
                      <ActionBtn label="Escalate" icon={AlertTriangle} busy={actioning === inv.id + "escalate"} onClick={() => act(inv.id, "escalate")} />
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showAdd && <AddInvoiceModal apiUrl={apiUrl} token={token} onClose={() => setShowAdd(false)} onCreated={load} />}
    </Panel>
  );
}

function ActionBtn({ label, icon: Icon, onClick, busy }) {
  return (
    <button onClick={onClick} disabled={busy} title={label} style={{
      display: "flex", alignItems: "center", gap: 4, background: "#0F1B2D", border: "1px solid #24354F",
      color: "#8B9AAE", borderRadius: 5, padding: "4px 7px", fontSize: 10.5, cursor: "pointer", fontFamily: "'Inter', sans-serif",
    }}>
      {busy ? <Loader2 size={11} className="spin" /> : <Icon size={11} />}
    </button>
  );
}

function AddCustomerModal({ apiUrl, token, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      await apiRequest(apiUrl, token, "/api/customers", { method: "POST", body: JSON.stringify({ name, email }) });
      onCreated();
      onClose();
    } catch (err) {
      setError(err.message || "Couldn't create customer");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title="Add customer" onClose={onClose}>
      <form onSubmit={submit}>
        <ModalField label="Company name" value={name} onChange={(e) => setName(e.target.value)} required />
        <ModalField label="Billing email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        {error && (
          <div style={{ fontSize: 12, color: "#E85D4D", background: "#E85D4D14", border: "1px solid #E85D4D33", borderRadius: 6, padding: "8px 10px", marginBottom: 12 }}>
            {error}
          </div>
        )}
        <button type="submit" disabled={busy} style={{
          width: "100%", background: "#3FB78A", border: "none", color: "#0B1524", fontWeight: 700,
          fontSize: 13.5, padding: "10px 0", borderRadius: 7, cursor: "pointer",
        }}>
          {busy ? "Adding..." : "Add customer"}
        </button>
      </form>
    </Modal>
  );
}

function CustomersView({ apiUrl, token, mode }) {
  const [customers, setCustomers] = useState(mode === "demo" ? DEMO_CUSTOMERS : []);
  const [loading, setLoading] = useState(mode !== "demo");
  const [showAdd, setShowAdd] = useState(false);

  const load = useCallback(() => {
    if (mode === "demo") return;
    setLoading(true);
    apiRequest(apiUrl, token, "/api/customers")
      .then((json) => setCustomers(json.customers))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [apiUrl, token, mode]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
        <button onClick={() => setShowAdd(true)} disabled={mode === "demo"} style={{
          display: "flex", alignItems: "center", gap: 6, background: "#233450", border: "1px solid #2E4463",
          color: "#EDEAE0", fontSize: 12.5, fontWeight: 600, padding: "8px 14px", borderRadius: 7,
          cursor: mode === "demo" ? "default" : "pointer", opacity: mode === "demo" ? 0.5 : 1,
        }}>
          + Add customer
        </button>
      </div>

      {loading ? <CenterState icon={Loader2} text="Loading customers..." /> :
        !customers.length ? <CenterState icon={Users} text="No customers yet — add your first one above" /> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
          {customers.map((c) => (
            <Panel key={c.id} style={{ padding: "16px 18px" }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: "#EDEAE0", marginBottom: 8 }}>{c.name}</div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 20, color: "#EDEAE0", marginBottom: 4 }}>{moneyFull(c.openCents)}</div>
              <div style={{ fontSize: 11.5, color: "#8B9AAE" }}>{c.openInvoiceCount} open invoice{c.openInvoiceCount !== 1 ? "s" : ""}</div>
              {c.worstDaysPastDue > 0 && (
                <div style={{ marginTop: 10, fontSize: 11, color: c.worstDaysPastDue > 45 ? "#E85D4D" : "#E8A33D", display: "flex", alignItems: "center", gap: 4 }}>
                  <AlertTriangle size={12} /> {c.worstDaysPastDue} days past due
                </div>
              )}
            </Panel>
          ))}
        </div>
      )}

      {showAdd && <AddCustomerModal apiUrl={apiUrl} token={token} onClose={() => setShowAdd(false)} onCreated={load} />}
    </div>
  );
}

function IntegrationsView({ apiUrl, token, mode }) {
  const [integrations, setIntegrations] = useState(mode === "demo" ? DEMO_INTEGRATIONS : []);
  const [loading, setLoading] = useState(mode !== "demo");
  const [editing, setEditing] = useState(null);
  const [creds, setCreds] = useState({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(() => {
    if (mode === "demo") return;
    setLoading(true);
    apiRequest(apiUrl, token, "/api/integrations")
      .then((json) => setIntegrations(json.integrations))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [apiUrl, token, mode]);

  useEffect(() => { load(); }, [load]);

  const connect = async (provider) => {
    setBusy(true); setMsg("");
    try {
      await apiRequest(apiUrl, token, `/api/integrations/${provider}/connect`, { method: "POST", body: JSON.stringify({ credentials: creds }) });
      setEditing(null); setCreds({}); load();
    } catch (err) { setMsg(err.message); } finally { setBusy(false); }
  };

  const sync = async (provider) => {
    setBusy(true); setMsg("");
    try {
      const res = await apiRequest(apiUrl, token, `/api/integrations/${provider}/sync`, { method: "POST" });
      setMsg(`${PROVIDER_LABEL[provider]}: synced — ${res.newInvoices} new invoices, ${res.paymentsMatched}/${res.paymentsSeen} payments matched.`);
      load();
    } catch (err) { setMsg(err.message); } finally { setBusy(false); }
  };

  if (loading) return <CenterState icon={Loader2} text="Loading integrations..." />;

  return (
    <div>
      {msg && <div style={{ marginBottom: 14, fontSize: 12.5, color: "#8B9AAE", background: "#16243A", border: "1px solid #24354F", borderRadius: 8, padding: "9px 12px" }}>{msg}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 14 }}>
        {integrations.map((it) => (
          <Panel key={it.provider} style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#EDEAE0" }}>{PROVIDER_LABEL[it.provider]}</div>
                <div style={{ fontSize: 11.5, color: "#8B9AAE", marginTop: 2 }}>{PROVIDER_ROLE[it.provider]}</div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", padding: "3px 8px", borderRadius: 20, color: it.connected ? "#3FB78A" : "#5A6B84", background: it.connected ? "#3FB78A1A" : "#5A6B841A" }}>
                {it.connected ? "CONNECTED" : "NOT CONNECTED"}
              </span>
            </div>

            {it.connected ? (
              <button onClick={() => sync(it.provider)} disabled={busy || mode === "demo"} style={{ marginTop: 14, background: "#233450", border: "1px solid #2E4463", color: "#EDEAE0", fontSize: 12, padding: "6px 12px", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <RefreshCw size={12} /> Sync now
              </button>
            ) : editing === it.provider ? (
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                {PROVIDER_FIELDS[it.provider].map((f) => (
                  <input key={f.key} placeholder={f.label} type="password"
                    onChange={(e) => setCreds((c) => ({ ...c, [f.key]: e.target.value }))}
                    style={{ background: "#0B1524", border: "1px solid #24354F", borderRadius: 5, padding: "6px 8px", color: "#EDEAE0", fontSize: 12, fontFamily: "'Inter', sans-serif" }} />
                ))}
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => connect(it.provider)} disabled={busy} style={{ flex: 1, background: "#3FB78A", border: "none", color: "#0B1524", fontWeight: 700, fontSize: 12, padding: "6px 0", borderRadius: 5, cursor: "pointer" }}>
                    {busy ? "Connecting..." : "Connect"}
                  </button>
                  <button onClick={() => { setEditing(null); setCreds({}); }} style={{ background: "transparent", border: "1px solid #24354F", color: "#8B9AAE", fontSize: 12, padding: "6px 10px", borderRadius: 5, cursor: "pointer" }}>Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setEditing(it.provider)} disabled={mode === "demo"} style={{ marginTop: 14, background: "#233450", border: "1px solid #2E4463", color: "#EDEAE0", fontSize: 12, padding: "6px 12px", borderRadius: 6, cursor: mode === "demo" ? "default" : "pointer", opacity: mode === "demo" ? 0.5 : 1 }}>
                Connect
              </button>
            )}
          </Panel>
        ))}
      </div>
    </div>
  );
}

// =====================================================================
// App shell
// =====================================================================

export default function ChaserApp() {
  const [session, setSession] = useState(null); // { apiUrl, token, user } | null
  const [mode, setMode] = useState(null); // 'live' | 'demo'
  const [tab, setTab] = useState("overview");
  const [showBanner, setShowBanner] = useState(true);

  const handleConnected = ({ apiUrl, token, user }) => {
    setSession({ apiUrl, token, user });
    setMode("live");
  };
  const handleDemo = () => {
    setSession({ apiUrl: "", token: "", user: { name: "Demo" } });
    setMode("demo");
  };
  const logout = () => { setSession(null); setMode(null); setTab("overview"); };

  const titles = { overview: "Overview", inbox: "Inbox", invoices: "Invoices", customers: "Customers", integrations: "Integrations" };

  const shellStyle = {
    fontFamily: "'Inter', sans-serif", background: "#0F1B2D", minHeight: 600, color: "#EDEAE0",
    borderRadius: 12, overflow: "hidden", border: "1px solid #1E2E46",
  };
  const fontImport = (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
      * { box-sizing: border-box; }
      button:hover { opacity: 0.85; }
      input::placeholder { color: #5A6B84; }
      .spin { animation: spin 0.8s linear infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }
    `}</style>
  );

  if (!session) {
    return (
      <div style={shellStyle}>
        {fontImport}
        <ConnectScreen onConnected={handleConnected} onDemo={handleDemo} />
      </div>
    );
  }

  return (
    <div style={{ ...shellStyle, display: "flex" }}>
      {fontImport}

      <div style={{ width: 210, background: "#0B1524", borderRight: "1px solid #1E2E46", padding: "20px 14px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 8px", marginBottom: 22 }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: "#3FB78A", display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(-3deg)" }}>
            <CheckCircle2 size={15} color="#0B1524" strokeWidth={3} />
          </div>
          <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 17 }}>Invoice Chaser</span>
        </div>

        <div style={{
          display: "flex", alignItems: "center", gap: 6, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.05em",
          padding: "5px 8px", borderRadius: 5, marginBottom: 16,
          color: mode === "live" ? "#3FB78A" : "#E8A33D", background: mode === "live" ? "#3FB78A14" : "#E8A33D14",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: mode === "live" ? "#3FB78A" : "#E8A33D" }} />
          {mode === "live" ? "LIVE" : "DEMO DATA"}
        </div>

        {nav.map((n) => {
          const Icon = n.icon;
          const active = tab === n.key;
          return (
            <button key={n.key} onClick={() => setTab(n.key)} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 10px", marginBottom: 3,
              background: active ? "#16243A" : "transparent", border: "none", borderRadius: 7,
              color: active ? "#EDEAE0" : "#8B9AAE", fontSize: 13.5, fontWeight: active ? 600 : 500, cursor: "pointer", textAlign: "left",
            }}>
              <Icon size={15} strokeWidth={2.2} /> {n.label}
            </button>
          );
        })}

        <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid #1E2E46", display: "flex", flexDirection: "column", gap: 2 }}>
          <a href={WHATSAPP_CONTACT} target="_blank" rel="noopener noreferrer" style={{
            display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 10px",
            color: "#8B9AAE", fontSize: 13, textDecoration: "none",
          }}>
            <MessageCircle size={15} /> Contact support
          </a>
          <button onClick={logout} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 10px", background: "transparent", border: "none", color: "#8B9AAE", fontSize: 13, cursor: "pointer" }}>
            <LogOut size={15} /> {mode === "live" ? "Log out" : "Exit demo"}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, padding: "22px 28px", overflowY: "auto", maxHeight: 720 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h1 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 600 }}>{titles[tab]}</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Bell size={16} color="#8B9AAE" />
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#233450", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
              {(session.user?.name || "?").split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase()}
            </div>
          </div>
        </div>

        {mode === "demo" && showBanner && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(90deg, #2A2A1B, #16243A)", border: "1px solid #544A2A", borderRadius: 10, padding: "12px 18px", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
              <WifiOff size={16} color="#E8A33D" />
              You're viewing demo data.
            </div>
            <button onClick={() => setShowBanner(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={15} color="#8B9AAE" /></button>
          </div>
        )}

        {tab === "overview" && <Overview apiUrl={session.apiUrl} token={session.token} mode={mode} setTab={setTab} />}
        {tab === "inbox" && <InboxView apiUrl={session.apiUrl} token={session.token} mode={mode} />}
        {tab === "invoices" && <InvoicesView apiUrl={session.apiUrl} token={session.token} mode={mode} />}
        {tab === "customers" && <CustomersView apiUrl={session.apiUrl} token={session.token} mode={mode} />}
        {tab === "integrations" && <IntegrationsView apiUrl={session.apiUrl} token={session.token} mode={mode} />}
      </div>
    </div>
  );
}
