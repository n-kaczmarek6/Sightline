"use client";
import { useApp } from "@/context/AppContext";

export default function DashboardPanel() {
  const { setPanel, isPro, analysesUsed, FREE_ANALYSIS_LIMIT, profile, userEmail } = useApp();
  const usagePct = Math.min((analysesUsed / FREE_ANALYSIS_LIMIT) * 100, 100);
  const firstName = (profile?.full_name || userEmail || "").split(/\s+/)[0] || "";

  return (
    <div className="panel">
      <div className="panel-head">
        <h1>Guten Morgen{firstName ? `, ${firstName}` : ""} 👋</h1>
        <p>Dein Job Search auf einen Blick.</p>
      </div>

      {!isPro && (
        <div className="glass usage-banner">
          <div className="usage-track">
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>
              {analysesUsed} von {FREE_ANALYSIS_LIMIT} Job-Analysen diesen Monat genutzt
            </div>
            <div className="usage-bar"><div className="usage-bar-fill" style={{ width: `${usagePct}%` }} /></div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setPanel("pricing")}>Unlimited freischalten</button>
        </div>
      )}

      <div className="kpi-grid">
        <div className="glass kpi-card"><div className="kpi-label">Applications Sent</div><div className="kpi-value">24</div><div className="kpi-sub pos">+3 diese Woche</div></div>
        <div className="glass kpi-card"><div className="kpi-label">Interviews</div><div className="kpi-value">6</div><div className="kpi-sub">25% Conversion</div></div>
        <div className="glass kpi-card"><div className="kpi-label">Offers</div><div className="kpi-value">1</div><div className="kpi-sub">Entscheidung offen</div></div>
        <div className="dark-card kpi-card dark"><div className="kpi-label">Ø Match Score</div><div className="kpi-value">82%</div><div className="kpi-sub">Starker Gesamt-Fit</div></div>
      </div>

      <div className="funnel">
        {[["18","Saved"],["24","Applied"],["11","Screening"],["6","Interview"],["1","Offer"],["9","Rejected"]].map(([n,l])=> (
          <div className="funnel-stage" key={l}><div className="n">{n}</div><div className="l">{l}</div></div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "30px 0 14px" }}>
        <h3 style={{ fontSize: 17, color: "var(--ink)" }}>Letzte Bewerbungen</h3>
        <button className="btn btn-ghost btn-sm" onClick={() => setPanel("applications")}>Alle ansehen →</button>
      </div>
      <div className="app-list">
        <button className="app-row" onClick={() => setPanel("appdetail")}>
          <span className="company-dot" style={{ background: "var(--ink)" }}>H</span>
          <span style={{ flex: 1 }}>
            <span className="app-row-title">Product Marketing Manager — HubSpot</span><br />
            <span className="app-row-sub">Beworben vor 2 Tagen</span>
          </span>
          <span className="app-row-right"><span className="match-pill" style={{ color: "var(--success)" }}>91%</span><span className="badge badge-accent">Interview</span></span>
        </button>
        <button className="app-row" onClick={() => setPanel("applications")}>
          <span className="company-dot" style={{ background: "#1ED760" }}>S</span>
          <span style={{ flex: 1 }}>
            <span className="app-row-title">Marketing Manager — Spotify</span><br />
            <span className="app-row-sub">Beworben vor 5 Tagen</span>
          </span>
          <span className="app-row-right"><span className="match-pill" style={{ color: "var(--success)" }}>84%</span><span className="badge" style={{ background: "rgba(18,51,45,.07)", color: "var(--text-muted)" }}>Applied</span></span>
        </button>
        <button className="app-row" onClick={() => setPanel("applications")}>
          <span className="company-dot" style={{ background: "#FF6900" }}>Z</span>
          <span style={{ flex: 1 }}>
            <span className="app-row-title">Growth Marketing Manager — Zalando</span><br />
            <span className="app-row-sub">Beworben vor 12 Tagen</span>
          </span>
          <span className="app-row-right"><span className="match-pill" style={{ color: "var(--warning)" }}>76%</span><span className="badge badge-error">Rejected</span></span>
        </button>
      </div>
      <div style={{ marginTop: 24 }}>
        <button className="btn btn-primary" onClick={() => setPanel("analyze")}>Neuen Job analysieren</button>
      </div>
    </div>
  );
}
