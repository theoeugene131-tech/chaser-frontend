import React, { useState } from "react";

const API = "https://chaser-backend-6jsv.onrender.com";
async function request(path, token, options = {}) {
  const response = await fetch(API + path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || body.error || `Request failed (${response.status})`);
  return body;
}
const cardStyle = { background: "#14243a", border: "1px solid #263b53", borderRadius: 12, padding: 19 };
const labelStyle = { color: "#8ea2b8", fontSize: 12 };
const numberStyle = { color: "#edf3f7", fontSize: 30, fontWeight: 800, letterSpacing: "-1px", marginTop: 9 };

export default function OwnerDashboard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function login(e) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const auth = await request("/api/auth/login", "", { method: "POST", body: JSON.stringify({ email, password }) });
      const analytics = await request("/api/analytics/owner", auth.token);
      setToken(auth.token);
      setData(analytics);
    } catch (err) {
      setError(err.message || "Could not open owner dashboard.");
    } finally { setBusy(false); }
  }
  async function refresh() {
    setBusy(true); setError("");
    try { setData(await request("/api/analytics/owner", token)); }
    catch (err) { setError(err.message || "Could not refresh analytics."); }
    finally { setBusy(false); }
  }

  if (!data) return (
    <main style={{ minHeight: "100vh", background: "#0b1524", color: "#edf3f7", display: "grid", placeItems: "center", padding: 20, fontFamily: "Inter, system-ui, sans-serif" }}>
      <form onSubmit={login} style={{ width: "min(420px, 100%)", background: "#101e31", border: "1px solid #2a4058", borderRadius: 16, padding: 28 }}>
        <a href="/" style={{ color: "#60d6a8", textDecoration: "none", fontSize: 12, fontWeight: 700 }}>← Invoice Chaser</a>
        <h1 style={{ fontSize: 28, margin: "22px 0 8px", letterSpacing: "-1px" }}>Owner analytics</h1>
        <p style={{ color: "#9bacc0", fontSize: 13, lineHeight: 1.6, margin: "0 0 22px" }}>Sign in with your owner account. Access is checked by the backend, not by the page alone.</p>
        <label style={{ display: "block", color: "#9bacc0", fontSize: 12, marginBottom: 7 }}>Owner email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="username" style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #2a4058", background: "#0b1524", color: "#edf3f7", marginBottom: 15 }} />
        <label style={{ display: "block", color: "#9bacc0", fontSize: 12, marginBottom: 7 }}>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #2a4058", background: "#0b1524", color: "#edf3f7", marginBottom: 15 }} />
        {error && <div style={{ color: "#ff9388", background: "#4a252c", padding: 10, borderRadius: 8, fontSize: 12, marginBottom: 14 }}>{error}</div>}
        <button disabled={busy} style={{ width: "100%", padding: 12, borderRadius: 8, border: 0, background: "#3fb78a", color: "#081522", fontWeight: 800, cursor: "pointer" }}>{busy ? "Checking access…" : "Sign in securely"}</button>
      </form>
    </main>
  );

  const metrics = [
    ["Unique visitors", data.visitors, "Tracked sessions in last 30 days"],
    ["Page views", data.pageViews, "Landing page views in last 30 days"],
    ["Button clicks", data.clicks, "Tracked CTA and navigation clicks"],
    ["New registrations", data.registrations, "Accounts created in last 30 days"],
    ["Total users", data.registeredUsers, "All registered accounts"],
    ["Organisations", data.organizations, "Workspaces created"],
    ["Paying customers", data.payingCustomers, "Based on recorded subscription status"],
  ];
  const eventCounts = Object.entries(data.eventCounts || {}).sort((a,b) => b[1]-a[1]);
  return (
    <main style={{ minHeight: "100vh", background: "#0b1524", color: "#edf3f7", padding: "28px max(20px, calc((100% - 1180px) / 2))", fontFamily: "Inter, system-ui, sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
        <div><a href="/" style={{ color: "#60d6a8", textDecoration: "none", fontSize: 12, fontWeight: 700 }}>← Invoice Chaser</a><h1 style={{ fontSize: 30, letterSpacing: "-1.2px", margin: "12px 0 5px" }}>Owner analytics</h1><p style={{ color: "#8ea2b8", margin: 0, fontSize: 13 }}>Real events collected by your app · Last 30 days</p></div>
        <button onClick={refresh} disabled={busy} style={{ background: "#1a3047", color: "#edf3f7", border: "1px solid #2b4058", borderRadius: 8, padding: "10px 14px", cursor: "pointer" }}>{busy ? "Refreshing…" : "Refresh data ↻"}</button>
      </header>
      {error && <div style={{ color: "#ffb1a7", background: "#4a252c", padding: 12, borderRadius: 8, marginBottom: 18 }}>{error}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 13, marginBottom: 24 }}>
        {metrics.map(([label, value, sub]) => <section key={label} style={cardStyle}><div style={labelStyle}>{label}</div><div style={numberStyle}>{Number(value || 0).toLocaleString()}</div><div style={{ color: "#71879f", fontSize: 11, lineHeight: 1.5, marginTop: 7 }}>{sub}</div></section>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 15 }}>
        <section style={cardStyle}><h2 style={{ margin: "0 0 16px", fontSize: 16 }}>Most-used tracked events</h2>{eventCounts.length ? eventCounts.slice(0, 12).map(([name, count]) => <div key={name} style={{ display: "flex", justifyContent: "space-between", gap: 12, borderTop: "1px solid #263b53", padding: "11px 0", fontSize: 12 }}><span style={{ color: "#aebed0", overflowWrap: "anywhere" }}>{name}</span><strong>{count}</strong></div>) : <p style={{ color: "#8ea2b8", fontSize: 13 }}>No tracked events yet. Visits and clicks will appear here after deployment.</p>}</section>
        <section style={cardStyle}><h2 style={{ margin: "0 0 16px", fontSize: 16 }}>Recent activity</h2>{data.recentEvents.length ? data.recentEvents.slice(0, 15).map((event, i) => <div key={event.createdAt + event.event + i} style={{ borderTop: "1px solid #263b53", padding: "10px 0" }}><div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 12 }}><strong style={{ overflowWrap: "anywhere" }}>{event.event}</strong><span style={{ color: "#71879f", whiteSpace: "nowrap" }}>{new Date(event.createdAt).toLocaleString()}</span></div><div style={{ color: "#8ea2b8", fontSize: 11, marginTop: 4 }}>{event.path}{event.target ? ` · ${event.target}` : ""}</div></div>) : <p style={{ color: "#8ea2b8", fontSize: 13 }}>No activity recorded yet.</p>}</section>
      </div>
      <p style={{ color: "#657b92", fontSize: 11, lineHeight: 1.6, marginTop: 22 }}>Privacy note: this basic analytics setup records event names, page paths, referrer, and a random browser session identifier. It does not intentionally collect names, email addresses, or full IP addresses. Add an appropriate privacy notice before public launch.</p>
    </main>
  );
}
