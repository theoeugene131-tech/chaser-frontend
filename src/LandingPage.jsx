import React, { useEffect } from "react";

const API = "https://chaser-backend-6jsv.onrender.com";
function sessionId() {
  try {
    let id = localStorage.getItem("ic_analytics_session");
    if (!id) {
      id = `ic_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
      localStorage.setItem("ic_analytics_session", id);
    }
    return id;
  } catch {
    return `ic_${Date.now().toString(36)}`;
  }
}
function track(event, target) {
  try {
    const payload = {
      event,
      target,
      path: window.location.pathname,
      referrer: document.referrer || "",
      sessionId: sessionId(),
    };
    fetch(`${API}/api/analytics/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

const features = [
  ["01", "Keep every invoice visible", "See what is outstanding, what is overdue, and which customers need attention."],
  ["02", "Follow up with confidence", "Prepare clear payment reminders and log follow-ups, notes, and customer promises."],
  ["03", "Record payments accurately", "Track full and partial payments against the right invoice and see the balance still due."],
];

export default function LandingPage() {
  useEffect(() => { track("page_view", "landing"); }, []);
  const action = (target, href) => {
    track(`click_${target}`, target);
    window.location.href = href;
  };
  const button = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9,
    padding: "13px 19px", borderRadius: 9, fontWeight: 750, fontSize: 14,
    textDecoration: "none", cursor: "pointer", transition: "transform .15s ease",
  };
  return (
    <div style={{ minHeight: "100vh", background: "#0b1524", color: "#edf3f7", fontFamily: "Inter, system-ui, sans-serif", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        .ic-wrap { width: min(1120px, calc(100% - 40px)); margin: 0 auto; }
        .ic-link:hover { color: #61d8ad !important; }
        .ic-cta:hover { transform: translateY(-2px); }
        .ic-card { transition: transform .18s ease, border-color .18s ease; }
        .ic-card:hover { transform: translateY(-3px); border-color: #3fb78a !important; }
        @media (max-width: 760px) {
          .ic-hero { grid-template-columns: 1fr !important; padding-top: 56px !important; }
          .ic-preview { display: none; }
          .ic-feature-grid { grid-template-columns: 1fr !important; }
          .ic-navlinks { gap: 12px !important; }
          .ic-navlinks .ic-login { display: none; }
        }
      `}</style>
      <header style={{ borderBottom: "1px solid #1c2d42", background: "rgba(11,21,36,.92)" }}>
        <div className="ic-wrap" style={{ minHeight: 76, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18 }}>
          <a href="/" onClick={() => track("click_logo", "logo")} style={{ display: "flex", alignItems: "center", gap: 10, color: "#edf3f7", textDecoration: "none", fontSize: 18, fontWeight: 800, letterSpacing: "-.5px" }}>
            <span style={{ width: 32, height: 32, display: "grid", placeItems: "center", background: "#3fb78a", color: "#0b1524", borderRadius: 9, fontSize: 20 }}>✓</span>
            Invoice Chaser
          </a>
          <nav className="ic-navlinks" style={{ display: "flex", alignItems: "center", gap: 25, fontSize: 13, fontWeight: 600 }}>
            <a className="ic-link" href="#features" onClick={() => track("click_features_nav", "features_nav")} style={{ color: "#b4c2d2", textDecoration: "none" }}>Features</a>
            <a className="ic-link" href="#how-it-works" onClick={() => track("click_how_nav", "how_nav")} style={{ color: "#b4c2d2", textDecoration: "none" }}>How it works</a>
            <a className="ic-link ic-login" href="/app" onClick={(e) => { e.preventDefault(); action("login_nav", "/app"); }} style={{ color: "#b4c2d2", textDecoration: "none" }}>Log in</a>
            <button className="ic-cta" onClick={() => action("start_trial_nav", "/app")} style={{ ...button, background: "#3fb78a", color: "#081522", border: 0, padding: "10px 14px" }}>Get started <span>↗</span></button>
          </nav>
        </div>
      </header>

      <main>
        <section className="ic-wrap ic-hero" style={{ display: "grid", gridTemplateColumns: "1.02fr .98fr", gap: 54, alignItems: "center", paddingTop: 92, paddingBottom: 86 }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid #2b4a4a", borderRadius: 30, padding: "7px 11px", color: "#7ee0b8", fontSize: 11, fontWeight: 800, letterSpacing: ".09em", textTransform: "uppercase", marginBottom: 25 }}>
              <span style={{ width: 7, height: 7, borderRadius: 10, background: "#3fb78a" }} /> Smarter accounts receivable
            </div>
            <h1 style={{ fontSize: "clamp(42px, 5.2vw, 66px)", letterSpacing: "-2.8px", lineHeight: 1.04, margin: "0 0 22px", fontWeight: 800 }}>
              Get paid faster.<br /><span style={{ color: "#60d6a8" }}>Chase less.</span>
            </h1>
            <p style={{ color: "#a9b9ca", fontSize: 17, lineHeight: 1.75, maxWidth: 510, margin: "0 0 30px" }}>
              Bring your outstanding invoices, customer follow-ups, and payment records into one clear workspace — so nothing slips through the cracks.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <button className="ic-cta" onClick={() => action("start_trial_hero", "/app")} style={{ ...button, background: "#3fb78a", color: "#081522", border: "1px solid #3fb78a" }}>Start your 14-day trial <span>→</span></button>
              <a className="ic-cta" href="#features" onClick={() => track("click_explore_features", "explore_features")} style={{ ...button, background: "#132238", color: "#e4edf5", border: "1px solid #2b4058" }}>Explore features</a>
            </div>
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 18, marginTop: 27, color: "#8296ab", fontSize: 12 }}>
              <span>✓ Invoice visibility</span><span>✓ Payment tracking</span><span>✓ Manual follow-ups</span>
            </div>
            <p style={{ color: "#6f8298", fontSize: 11, marginTop: 18 }}>Trial availability and subscription terms will be shown during sign-up.</p>
          </div>

          <div className="ic-preview" style={{ position: "relative" }}>
            <div style={{ position: "absolute", inset: "8% -8% -8% 8%", background: "radial-gradient(ellipse, #1b7d6550, transparent 68%)", filter: "blur(18px)" }} />
            <div style={{ position: "relative", border: "1px solid #2b4058", background: "#101e31", borderRadius: 17, padding: 17, boxShadow: "0 30px 100px #0006", transform: "rotate(1deg)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #24354a", paddingBottom: 14, marginBottom: 17 }}>
                <div><div style={{ color: "#edf3f7", fontWeight: 800, fontSize: 13 }}>Receivables overview</div><div style={{ color: "#8296ab", fontSize: 10, marginTop: 4 }}>Your work at a glance</div></div>
                <span style={{ color: "#60d6a8", background: "#173b37", borderRadius: 6, padding: "6px 9px", fontSize: 10, fontWeight: 800 }}>LIVE WORKSPACE</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 15 }}>
                {[["Outstanding balance", "$24,850", "#f2c879"], ["Collected this month", "$18,420", "#60d6a8"]].map(([label, value, color]) => <div key={label} style={{ background: "#16273c", border: "1px solid #273b52", borderRadius: 10, padding: 15 }}><div style={{ color: "#91a2b5", fontSize: 10, marginBottom: 10 }}>{label}</div><div style={{ color, fontSize: 23, fontWeight: 800, letterSpacing: "-1px" }}>{value}</div></div>)}
              </div>
              <div style={{ background: "#14243a", border: "1px solid #273b52", borderRadius: 10, padding: 15 }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#e4edf5", fontSize: 12, fontWeight: 700, marginBottom: 15 }}><span>Invoices needing attention</span><span style={{ color: "#8fa2b8", fontWeight: 500 }}>This week</span></div>
                {[["INV-1048", "Northstar Supplies", "$4,200", "OVERDUE", "#f2c879"], ["INV-1046", "Oak & Co.", "$2,850", "FOLLOW-UP", "#60d6a8"], ["INV-1041", "Westfield Studio", "$1,300", "PART PAID", "#8db6ed"]].map((row) => <div key={row[0]} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center", padding: "12px 0", borderTop: "1px solid #24354a" }}><div><div style={{ color: "#e4edf5", fontSize: 11, fontWeight: 700 }}>{row[0]} <span style={{ color: "#8498ad", fontWeight: 400 }}>· {row[1]}</span></div><div style={{ color: "#9aacc0", fontSize: 10, marginTop: 4 }}>{row[2]}</div></div><span style={{ color: row[4], fontSize: 9, fontWeight: 800, letterSpacing: ".06em" }}>{row[3]}</span></div>)}
              </div>
              <div style={{ color: "#72879d", fontSize: 10, textAlign: "center", paddingTop: 14 }}>Illustrative preview · your own records appear after sign-in</div>
            </div>
          </div>
        </section>

        <section style={{ borderTop: "1px solid #1d2e43", borderBottom: "1px solid #1d2e43", background: "#0e1b2d" }}>
          <div className="ic-wrap" style={{ padding: "22px 0", display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "16px 36px", color: "#9bacc0", fontSize: 12 }}>
            <span>One place for invoice follow-ups</span><span style={{ color: "#3fb78a" }}>✦</span><span>Partial and full payment records</span><span style={{ color: "#3fb78a" }}>✦</span><span>Clear customer activity history</span>
          </div>
        </section>

        <section id="features" className="ic-wrap" style={{ paddingTop: 90, paddingBottom: 90 }}>
          <div style={{ maxWidth: 650, margin: "0 auto 38px", textAlign: "center" }}>
            <div style={{ color: "#60d6a8", fontWeight: 800, letterSpacing: ".12em", fontSize: 11, textTransform: "uppercase", marginBottom: 13 }}>Less admin. More clarity.</div>
            <h2 style={{ fontSize: "clamp(30px, 4vw, 43px)", letterSpacing: "-1.6px", lineHeight: 1.13, margin: "0 0 15px" }}>Everything you need to stay on top of receivables.</h2>
            <p style={{ color: "#9bacc0", lineHeight: 1.7, margin: 0, fontSize: 14 }}>Simple tools to organise the work between sending an invoice and receiving the money.</p>
          </div>
          <div className="ic-feature-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {features.map(([num, title, desc]) => <article className="ic-card" key={num} style={{ background: "#101e31", border: "1px solid #263a51", borderRadius: 13, padding: 25, minHeight: 205 }}><div style={{ color: "#60d6a8", fontSize: 11, fontWeight: 800, letterSpacing: ".12em", marginBottom: 26 }}>{num} / FEATURE</div><h3 style={{ fontSize: 18, margin: "0 0 10px", letterSpacing: "-.4px" }}>{title}</h3><p style={{ color: "#9bacc0", fontSize: 13, lineHeight: 1.7, margin: 0 }}>{desc}</p></article>)}
          </div>
        </section>

        <section id="how-it-works" style={{ background: "#101e31", borderTop: "1px solid #1d2e43", borderBottom: "1px solid #1d2e43" }}>
          <div className="ic-wrap" style={{ padding: "70px 0", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 32 }}>
            {[["1", "Add your invoices", "Enter invoice details and connect each invoice to the right customer."], ["2", "Track what happens", "Log payments, notes, disputes, and follow-up actions as they happen."], ["3", "Follow up on balances", "See the remaining amount and know which customer needs attention next."]].map(([n, title, desc]) => <div key={n} style={{ display: "flex", gap: 15 }}><div style={{ flexShrink: 0, width: 35, height: 35, borderRadius: 10, display: "grid", placeItems: "center", background: "#1d3e39", color: "#60d6a8", fontWeight: 800 }}>{n}</div><div><h3 style={{ margin: "3px 0 8px", fontSize: 16 }}>{title}</h3><p style={{ margin: 0, color: "#9bacc0", fontSize: 13, lineHeight: 1.7 }}>{desc}</p></div></div>)}
          </div>
        </section>

        <section className="ic-wrap" style={{ padding: "82px 0", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(30px, 4vw, 44px)", letterSpacing: "-1.7px", margin: "0 0 15px" }}>Make every follow-up count.</h2>
          <p style={{ color: "#9bacc0", fontSize: 14, lineHeight: 1.7, maxWidth: 530, margin: "0 auto 25px" }}>Start organising your receivables with a clearer view of invoices, customers, and payment history.</p>
          <button className="ic-cta" onClick={() => action("start_trial_bottom", "/app")} style={{ ...button, background: "#3fb78a", color: "#081522", border: "1px solid #3fb78a" }}>Get started <span>→</span></button>
        </section>
      </main>

      <footer style={{ borderTop: "1px solid #1d2e43", background: "#081321" }}>
        <div className="ic-wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap", padding: "24px 0", color: "#8194a9", fontSize: 11 }}>
          <span>© {new Date().getFullYear()} Invoice Chaser. All rights reserved.</span>
          <div style={{ display: "flex", gap: 18 }}><a href="/app" onClick={(e) => { e.preventDefault(); action("footer_login", "/app"); }} style={{ color: "#9bacc0", textDecoration: "none" }}>Log in</a><a href="/owner" onClick={() => track("click_owner_portal", "owner_portal")} style={{ color: "#62758b", textDecoration: "none" }}>Owner portal</a></div>
        </div>
      </footer>
    </div>
  );
}
