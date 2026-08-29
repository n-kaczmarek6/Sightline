"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useApp } from "@/context/AppContext";

export default function BuilderPanel() {
  const {
    isPro, downloadCv, setPanel,
    applications,
    cvVersions, selectedVersionId, setSelectedVersionId,
    createCvVersion, updateVersionField, saveCvVersion, deleteCvVersion,
  } = useApp();
  const t = useTranslations("builder");
  const [newLabel, setNewLabel] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);

  const version = cvVersions.find((v) => v.id === selectedVersionId);
  const linkedApp = version?.application_id ? applications.find((a) => a.id === version.application_id) : null;

  const handleCreate = (e) => {
    e.preventDefault();
    const label = newLabel.trim() || t("defaultVersionName", { n: cvVersions.length + 1 });
    createCvVersion(label, selectedVersionId);
    setNewLabel("");
    setShowNewForm(false);
  };

  if (cvVersions.length === 0) {
    return (
      <div className="panel">
        <div className="panel-head"><h1>{t("title")}</h1><p>{t("subtitle")}</p></div>
        <div className="note-box" style={{ marginBottom: 18 }}>
          💡 {t("aiHintPre")} <a href="#" onClick={(e) => { e.preventDefault(); setPanel("analyze"); }}>{t("aiHintLink")}</a> {t("aiHintPost")}
        </div>
        <div className="glass" style={{ padding: 32, textAlign: "center" }}>
          <p style={{ fontSize: 13.5, color: "var(--text-muted)", marginBottom: 16 }}>
            {t("noVersionsYet")}
          </p>
          <button className="btn btn-primary btn-sm" onClick={() => createCvVersion(t("defaultVersionName", { n: 1 }))}>
            {t("createFirst")}
          </button>
        </div>
      </div>
    );
  }

  if (!version) {
    return (
      <div className="panel">
        <div className="panel-head"><h1>{t("title")}</h1></div>
        <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>{t("noVersionSelected")}</p>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-head"><h1>{t("title")}</h1><p>{t("subtitle")}</p></div>

      {!linkedApp && (
        <div className="note-box" style={{ marginBottom: 18 }}>
          💡 {t("aiHintPre")} <a href="#" onClick={(e) => { e.preventDefault(); setPanel("analyze"); }}>{t("aiHintLink")}</a> {t("aiHintPost")}
        </div>
      )}

      <div className="glass" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14, padding: "18px 22px" }}>
        <div>
          <span style={{ fontSize: 11.5, color: "var(--text-faint)" }}>{t("versionLabel")}</span>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 2 }}>
            <select
              className="profile-input"
              style={{ marginTop: 0, minWidth: 180 }}
              value={selectedVersionId || ""}
              onChange={(e) => setSelectedVersionId(e.target.value)}
            >
              {cvVersions.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
            </select>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowNewForm((s) => !s)}>{t("newVersion")}</button>
          </div>
        </div>
        <div>
          {linkedApp ? (
            <span className="badge badge-success">
              {linkedApp.role_title} — {linkedApp.company}{linkedApp.match_score != null ? ` · ${linkedApp.match_score}%` : ""}
            </span>
          ) : (
            <span className="badge" style={{ background: "rgba(18,51,45,.06)", color: "var(--text-muted)" }}>{t("generalCv")}</span>
          )}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn btn-secondary btn-sm" onClick={() => downloadCv("DOCX")}>
            {t("docx")} {!isPro && <span className="pro-tag">PRO</span>}
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => downloadCv("PDF")}>
            {t("pdf")} {!isPro && <span className="pro-tag">PRO</span>}
          </button>
        </div>
      </div>

      {showNewForm && (
        <form className="glass profile-section" style={{ padding: 18, display: "flex", gap: 10, marginTop: 14, alignItems: "center" }} onSubmit={handleCreate}>
          <input className="profile-input" style={{ marginTop: 0, flex: 1 }} placeholder={t("newVersionNamePlaceholder")}
            value={newLabel} onChange={(e) => setNewLabel(e.target.value)} />
          <button className="btn btn-primary btn-sm" type="submit">{t("createCopyOf", { label: version.label })}</button>
          <button className="btn btn-ghost btn-sm" type="button" onClick={() => setShowNewForm(false)}>{t("cancel")}</button>
        </form>
      )}

      <div className="builder-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="glass cv-section">
            <h4>{t("sections.title")}</h4>
            <input className="cv-editable" style={{ width: "100%", border: "none", background: "transparent" }}
              value={version.label} onChange={(e) => updateVersionField("label", e.target.value)} />
          </div>
          <div className="glass cv-section">
            <h4>{t("sections.summary")}</h4>
            <textarea className="cv-editable" style={{ width: "100%", border: "none", resize: "vertical", background: "transparent" }}
              rows={2} value={version.summary || ""} onChange={(e) => updateVersionField("summary", e.target.value)} />
          </div>
          <div className="glass cv-section">
            <h4>{t("sections.experience")}</h4>
            <textarea className="cv-editable" style={{ width: "100%", border: "none", resize: "vertical", background: "transparent" }}
              rows={3} value={version.experience_text || ""} onChange={(e) => updateVersionField("experience_text", e.target.value)} />
          </div>
          <div className="glass cv-section">
            <h4>{t("sections.education")}</h4>
            <textarea className="cv-editable" style={{ width: "100%", border: "none", resize: "vertical", background: "transparent" }}
              rows={2} value={version.education_text || ""} onChange={(e) => updateVersionField("education_text", e.target.value)} />
          </div>
          <div className="glass cv-section">
            <h4>{t("sections.skills")}</h4>
            <textarea className="cv-editable" style={{ width: "100%", border: "none", resize: "vertical", background: "transparent" }}
              rows={2} value={version.skills_text || ""} onChange={(e) => updateVersionField("skills_text", e.target.value)} />
          </div>
          <div className="glass cv-section">
            <h4>{t("sections.achievements")}</h4>
            <textarea className="cv-editable" style={{ width: "100%", border: "none", resize: "vertical", background: "transparent" }}
              rows={2} value={version.achievements_text || ""} onChange={(e) => updateVersionField("achievements_text", e.target.value)} />
          </div>
        </div>

        <div className="dark-card ai-panel">
          <h4>{t("aiSuggestions")}</h4>
          <div className="ai-suggestion">
            {t("aiSuggestionsPlaceholder")}
          </div>
          <button className="btn btn-save btn-sm" onClick={saveCvVersion}>{t("saveChanges")}</button>
          <button className="btn btn-outline btn-sm" style={{ marginTop: 8, color: "var(--error)" }}
            onClick={() => deleteCvVersion(version.id)}>
            {t("deleteVersion")}
          </button>
        </div>
      </div>
    </div>
  );
}
