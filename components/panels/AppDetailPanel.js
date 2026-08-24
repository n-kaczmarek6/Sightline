"use client";
import { useTranslations, useLocale } from "next-intl";
import { useApp } from "@/context/AppContext";

export default function AppDetailPanel() {
  const { setPanel, applications, selectedApplicationId, deleteApplication, prepShown, setPrepShown } = useApp();
  const t = useTranslations("appDetail");
  const tStatus = useTranslations("common");
  const locale = useLocale();
  const app = applications.find((a) => a.id === selectedApplicationId);

  const formatDate = (iso) => {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString(locale, { day: "2-digit", month: "short" });
  };

  if (!app) {
    return (
      <div className="panel">
        <button className="btn btn-ghost btn-sm" style={{ paddingLeft: 4, marginBottom: 14 }} onClick={() => setPanel("applications")}>
          {t("back")}
        </button>
        <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>{t("noneSelected")}</p>
      </div>
    );
  }

  const handleDelete = () => {
    deleteApplication(app.id);
    setPanel("applications");
  };

  return (
    <div className="panel">
      <button className="btn btn-ghost btn-sm" style={{ paddingLeft: 4, marginBottom: 14 }} onClick={() => setPanel("applications")}>
        {t("back")}
      </button>
      <div className="panel-head panel-head-row">
        <div>
          <h1 style={{ fontSize: 30 }}>{app.role_title} — {app.company}</h1>
          <p>
            {t("createdOn", { date: formatDate(app.created_at) })}
            {app.applied_at ? t("appliedOn", { date: formatDate(app.applied_at) }) : ""}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {app.match_score != null && <span className="badge badge-success">{t("match", { score: app.match_score })}</span>}
          <span className="badge badge-accent">{tStatus(`status.${app.status}`) || app.status}</span>
        </div>
      </div>
      <div className="grid-2">
        <div className="glass" style={{ padding: 24 }}>
          <h4 style={{ fontSize: 15, color: "var(--ink)", marginBottom: 18 }}>{t("statusTitle")}</h4>
          <p style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.6 }}>
            {t("statusPrefix")} <strong>{tStatus(`status.${app.status}`)}</strong>{t("statusSuffix")}
          </p>
          <button className="btn btn-ghost btn-sm" style={{ marginTop: 16, color: "var(--error)", paddingLeft: 0 }} onClick={handleDelete}>
            {t("deleteButton")}
          </button>
        </div>
        <div className="dark-card" style={{ padding: 24 }}>
          <h4 style={{ fontSize: 15, color: "#fff", marginBottom: 8 }}>{t("interviewPrepTitle")}</h4>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.6)", lineHeight: 1.6, marginBottom: 14 }}>
            {t("interviewPrepSubtitle")}
          </p>
          {!prepShown ? (
            <button className="btn btn-dark btn-sm" onClick={() => setPrepShown(true)}>{t("startPrep")}</button>
          ) : (
            <div>
              <div className="mono" style={{ fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "rgba(255,255,255,.45)", marginBottom: 10 }}>
                {t("likelyTopics")}
              </div>
              <div className="tag-row">
                {t.raw("topics").map((topic) => (
                  <span className="tag" key={topic} style={{ background: "rgba(94,234,212,.14)", borderColor: "rgba(94,234,212,.22)", color: "var(--accent-2)" }}>{topic}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
