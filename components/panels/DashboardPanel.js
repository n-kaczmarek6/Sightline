"use client";
import { useApp } from "@/context/AppContext";

const COLUMNS = [
  ["saved", "Saved"], ["applied", "Applied"], ["screening", "Screening"],
  ["interview", "Interview"], ["offer", "Offer"], ["rejected", "Rejected"],
];

const STATUS_META = {
  saved: { label: "Saved", badgeClass: "", badgeStyle: { background: "rgba(18,51,45,.07)", color: "var(--text-muted)" } },
  applied: { label: "Applied", badgeClass: "", badgeStyle: { background: "rgba(18,51,45,.07)", color: "var(--text-muted)" } },
  screening: { label: "Screening", badgeClass: "badge-warning" },
  interview: { label: "Interview", badgeClass: "badge-accent" },
  offer: { label: "Offer", badgeClass: "badge-success" },
  rejected: { label: "Rejected", badgeClass: "badge-error" },
};

const DOT_COLORS = ["var(--ink)", "#1ED760", "#FF6900", "#8B7CF6", "#0EA98B", "#E24C3A"];

function dotColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  return DOT_COLORS[hash % DOT_COLORS.length];
}

function daysAgo(iso) {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
  if (days === 0) return "Heute";
  if (days === 1) return "Vor 1 Tag";
  return `Vor ${days} Tagen`;
}

export default function DashboardPanel() {
  const { setPanel, isPro, analysesUsed, FREE_ANALYSIS_LIMIT, profile, userEmail, applications } = useApp();
  const usagePct = Math.min((analysesUsed / FREE_ANALYSIS_LIMIT) * 100, 100);
  const firstName = (profile?.full_name || userEmail || "").split(/\s+/)[0] || "";

  const sentCount = applications.filter((a) => a.status !== "saved").length;
  const interviewCount = applications.filter((a) => a.status === "interview").length;
  const offerCount = applications.filter((a) => a.status === "offer").length;
  const scored = applications.filter((a) => a.match_score != null);
  const avgMatch = scored.length
    ? Math.round(scored.reduce((sum, a) => sum + a.match_score, 0) / scored.length)
    : null;
  const conversionPct = sentCount > 0 ? Math.round((interviewCount / sentCount) * 100) : 0;

  const recent = [...applications]
    .sort((a, b) => new Date(b.applied_at || b.created_at) - new Date(a.applied_at || a.created_at))
    .slice(0, 3);

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
        <div className="glass kpi-card"><div className="kpi-label">Applications Sent</div><div className="kpi-value">{sentCount}</div><div className="kpi-sub">Insgesamt</div></div>
        <div className="glass kpi-card"><div className="kpi-label">Interviews</div><div className="kpi-value">{interviewCount}</div><div className="kpi-sub">{conversionPct}% Conversion</div></div>
        <div className="glass kpi-card"><div className="kpi-label">Offers</div><div className="kpi-value">{offerCount}</div><div className="kpi-sub">{offerCount > 0 ? "Entscheidung offen" : "Noch keine"}</div></div>
        <div className="dark-card kpi-card dark"><div className="kpi-label">Ø Match Score</div><div className="kpi-value">{avgMatch != null ? `${avgMatch}%` : "–"}</div><div className="kpi-sub">{avgMatch != null ? "Gesamt-Fit" : "Noch keine Daten"}</div></div>
      </div>

      <div className="funnel">
        {COLUMNS.map(([key, label]) => (
          <div className="funnel-stage" key={key}>
            <div className="n">{applications.filter((a) => a.status === key).length}</div>
            <div className="l">{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "30px 0 14px" }}>
        <h3 style={{ fontSize: 17, color: "var(--ink)" }}>Letzte Bewerbungen</h3>
        <button className="btn btn-ghost btn-sm" onClick={() => setPanel("applications")}>Alle ansehen →</button>
      </div>
      {recent.length === 0 ? (
        <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>Noch keine Bewerbungen getrackt.</p>
      ) : (
        <div className="app-list">
          {recent.map((app) => {
            const meta = STATUS_META[app.status] || STATUS_META.saved;
            return (
              <button className="app-row" key={app.id} onClick={() => setPanel("applications")}>
                <span className="company-dot" style={{ background: dotColor(app.company) }}>{app.company[0]?.toUpperCase()}</span>
                <span style={{ flex: 1 }}>
                  <span className="app-row-title">{app.role_title} — {app.company}</span><br />
                  <span className="app-row-sub">{daysAgo(app.applied_at || app.created_at)}</span>
                </span>
                <span className="app-row-right">
                  {app.match_score != null && <span className="match-pill" style={{ color: "var(--success)" }}>{app.match_score}%</span>}
                  <span className={`badge ${meta.badgeClass}`} style={meta.badgeStyle}>{meta.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
      <div style={{ marginTop: 24 }}>
        <button className="btn btn-primary" onClick={() => setPanel("analyze")}>Neuen Job analysieren</button>
      </div>
    </div>
  );
}
