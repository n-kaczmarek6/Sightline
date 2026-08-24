"use client";
import { useTranslations } from "next-intl";
import { useApp } from "@/context/AppContext";

const STATUS_KEYS = ["saved", "applied", "screening", "interview", "offer", "rejected"];

const STATUS_BADGE = {
  saved: { badgeClass: "", badgeStyle: { background: "rgba(18,51,45,.07)", color: "var(--text-muted)" } },
  applied: { badgeClass: "", badgeStyle: { background: "rgba(18,51,45,.07)", color: "var(--text-muted)" } },
  screening: { badgeClass: "badge-warning" },
  interview: { badgeClass: "badge-accent" },
  offer: { badgeClass: "badge-success" },
  rejected: { badgeClass: "badge-error" },
};

const DOT_COLORS = ["var(--ink)", "#1ED760", "#FF6900", "#8B7CF6", "#0EA98B", "#E24C3A"];

function dotColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  return DOT_COLORS[hash % DOT_COLORS.length];
}

export default function DashboardPanel() {
  const { setPanel, isPro, analysesUsed, FREE_ANALYSIS_LIMIT, profile, userEmail, applications } = useApp();
  const t = useTranslations("dashboard");
  const tStatus = useTranslations("common");
  const usagePct = Math.min((analysesUsed / FREE_ANALYSIS_LIMIT) * 100, 100);
  const firstName = (profile?.full_name || userEmail || "").split(/\s+/)[0] || "";

  const daysAgo = (iso) => {
    if (!iso) return null;
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
    if (days === 0) return t("daysAgo.today");
    if (days === 1) return t("daysAgo.oneDay");
    return t("daysAgo.other", { days });
  };

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
        <h1>{t("greeting")}{firstName ? `, ${firstName}` : ""} 👋</h1>
        <p>{t("subtitle")}</p>
      </div>

      {!isPro && (
        <div className="glass usage-banner">
          <div className="usage-track">
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>
              {t("usage", { used: analysesUsed, limit: FREE_ANALYSIS_LIMIT })}
            </div>
            <div className="usage-bar"><div className="usage-bar-fill" style={{ width: `${usagePct}%` }} /></div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setPanel("pricing")}>{t("unlockUnlimited")}</button>
        </div>
      )}

      <div className="kpi-grid">
        <div className="glass kpi-card"><div className="kpi-label">{t("kpi.applicationsSent")}</div><div className="kpi-value">{sentCount}</div><div className="kpi-sub">{t("kpi.total")}</div></div>
        <div className="glass kpi-card"><div className="kpi-label">{t("kpi.interviews")}</div><div className="kpi-value">{interviewCount}</div><div className="kpi-sub">{t("kpi.conversion", { pct: conversionPct })}</div></div>
        <div className="glass kpi-card"><div className="kpi-label">{t("kpi.offers")}</div><div className="kpi-value">{offerCount}</div><div className="kpi-sub">{offerCount > 0 ? t("kpi.decisionPending") : t("kpi.noneYet")}</div></div>
        <div className="dark-card kpi-card dark"><div className="kpi-label">{t("kpi.avgMatch")}</div><div className="kpi-value">{avgMatch != null ? `${avgMatch}%` : "–"}</div><div className="kpi-sub">{avgMatch != null ? t("kpi.overallFit") : t("kpi.noData")}</div></div>
      </div>

      <div className="funnel">
        {STATUS_KEYS.map((key) => (
          <div className="funnel-stage" key={key}>
            <div className="n">{applications.filter((a) => a.status === key).length}</div>
            <div className="l">{tStatus(`status.${key}`)}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "30px 0 14px" }}>
        <h3 style={{ fontSize: 17, color: "var(--ink)" }}>{t("recentApplications")}</h3>
        <button className="btn btn-ghost btn-sm" onClick={() => setPanel("applications")}>{t("viewAll")}</button>
      </div>
      {recent.length === 0 ? (
        <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>{t("noApplicationsYet")}</p>
      ) : (
        <div className="app-list">
          {recent.map((app) => {
            const meta = STATUS_BADGE[app.status] || STATUS_BADGE.saved;
            return (
              <button className="app-row" key={app.id} onClick={() => setPanel("applications")}>
                <span className="company-dot" style={{ background: dotColor(app.company) }}>{app.company[0]?.toUpperCase()}</span>
                <span style={{ flex: 1 }}>
                  <span className="app-row-title">{app.role_title} — {app.company}</span><br />
                  <span className="app-row-sub">{daysAgo(app.applied_at || app.created_at)}</span>
                </span>
                <span className="app-row-right">
                  {app.match_score != null && <span className="match-pill" style={{ color: "var(--success)" }}>{app.match_score}%</span>}
                  <span className={`badge ${meta.badgeClass}`} style={meta.badgeStyle}>{tStatus(`status.${app.status}`)}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
      <div style={{ marginTop: 24 }}>
        <button className="btn btn-primary" onClick={() => setPanel("analyze")}>{t("analyzeNewJob")}</button>
      </div>
    </div>
  );
}
