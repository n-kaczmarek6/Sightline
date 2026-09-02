"use client";
import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useApp } from "@/context/AppContext";

const COLUMN_KEYS = ["saved", "applied", "screening", "interview", "offer", "rejected"];

function AddForm({ onAdd, onCancel, t }) {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [match, setMatch] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!company.trim() || !role.trim()) return;
    onAdd({ company: company.trim(), role_title: role.trim(), match_score: match ? Number(match) : null });
  };

  return (
    <form className="glass profile-section" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }} onSubmit={handleSubmit}>
      <div className="field-grid">
        <input className="profile-input" placeholder={t("form.company")} value={company} onChange={(e) => setCompany(e.target.value)} required />
        <input className="profile-input" placeholder={t("form.role")} value={role} onChange={(e) => setRole(e.target.value)} required />
        <input className="profile-input" type="number" min="0" max="100" placeholder={t("form.matchPlaceholder")} value={match} onChange={(e) => setMatch(e.target.value)} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn btn-primary btn-sm" type="submit">{t("form.add")}</button>
        <button className="btn btn-ghost btn-sm" type="button" onClick={onCancel}>{t("form.cancel")}</button>
      </div>
    </form>
  );
}

export default function ApplicationsPanel() {
  const {
    isPro, setPanel, toast,
    applications, addApplication, updateApplicationStatus, FREE_APPLICATION_LIMIT,
    setSelectedApplicationId, cvVersions,
  } = useApp();
  const t = useTranslations("applications");
  const tStatus = useTranslations("common");
  const [dragInfo, setDragInfo] = useState(null); // { cardId, fromCol }
  const [dragOverCol, setDragOverCol] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const columns = useMemo(() => {
    const grouped = Object.fromEntries(COLUMN_KEYS.map((key) => [key, []]));
    for (const app of applications) {
      (grouped[app.status] || grouped.saved).push(app);
    }
    return grouped;
  }, [applications]);

  const atLimit = !isPro && applications.length >= FREE_APPLICATION_LIMIT;

  const handleAddClick = () => {
    if (atLimit) {
      toast(t("limitToast", { limit: FREE_APPLICATION_LIMIT }));
      setPanel("pricing");
      return;
    }
    setShowAdd(true);
  };

  const openDetail = (id) => {
    setSelectedApplicationId(id);
    setPanel("appdetail");
  };

  return (
    <div className="panel">
      <div className="panel-head panel-head-row">
        <div><h1>{t("title")}</h1><p>{t("subtitle")}</p></div>
        <button className="btn btn-primary btn-sm" onClick={handleAddClick}>{t("addButton")}</button>
      </div>

      {showAdd && (
        <AddForm
          t={t}
          onAdd={async (payload) => { await addApplication(payload); setShowAdd(false); }}
          onCancel={() => setShowAdd(false)}
        />
      )}

      {!isPro && (
        <div className="glass usage-banner coral">
          <div className="usage-track">
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>{t("usageBannerTitle", { limit: FREE_APPLICATION_LIMIT })}</div>
            <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 3 }}>{t("usageBannerSub", { count: applications.length })}</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setPanel("pricing")}>{t("unlockUnlimited")}</button>
        </div>
      )}

      <div className="kanban">
        {COLUMN_KEYS.map((key) => (
          <div
            key={key}
            className={`kanban-col${dragOverCol === key ? " dragover" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragOverCol(key); }}
            onDragLeave={() => setDragOverCol((c) => (c === key ? null : c))}
            onDrop={(e) => {
              e.preventDefault();
              setDragOverCol(null);
              if (dragInfo && dragInfo.fromCol !== key) {
                updateApplicationStatus(dragInfo.cardId, key);
              }
              setDragInfo(null);
            }}
          >
            <div className="kanban-col-head">
              {tStatus(`status.${key}`)} <span className="kanban-count">{columns[key].length}</span>
            </div>
            {columns[key].map((app) => {
              const linkedCv = cvVersions.find((v) => v.application_id === app.id);
              const donutColor = app.match_score == null ? null : app.match_score >= 75 ? "var(--accent-2)" : app.match_score >= 50 ? "var(--warning)" : "var(--coral)";
              return (
                <div
                  key={app.id}
                  className={`kanban-card${dragInfo?.cardId === app.id ? " kanban-dragging" : ""}`}
                  draggable
                  onDragStart={() => setDragInfo({ cardId: app.id, fromCol: key })}
                  onDragEnd={() => setDragInfo(null)}
                  onClick={() => openDetail(app.id)}
                >
                  {app.match_score != null && (
                    <div className="kanban-donut" style={{ "--pct": `${app.match_score}%`, "--donut-color": donutColor }} title={t("matchScore", { score: app.match_score })} />
                  )}
                  <div className="co">{app.company}</div>
                  <div className="role">{app.role_title}</div>
                  <div className="match">{app.match_score != null ? t("matchScore", { score: app.match_score }) : t("noMatchScore")}</div>
                  {linkedCv && (
                    <div className="kanban-cv-tag" title={linkedCv.label}>
                      <svg className="icon" style={{ width: 12, height: 12 }}><use href="#i-docs" /></svg>
                      <span>{t("cvLinked")}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
