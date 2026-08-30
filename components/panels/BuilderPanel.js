"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useApp } from "@/context/AppContext";

// experience_text und education_text sind je ein einzelner Freitext-String
// (siehe /api/cv/generate) — je Station/Abschluss ein durch Leerzeile
// getrennter Block, dessen erste Zeile Titel/Abschluss + Zeitraum enthält.
// Wir splitten hier nur für die Anzeige/Bearbeitung in eigene Karten und
// fügen beim Speichern wieder zu einem String zusammen, ohne das
// Datenmodell zu ändern.
function splitBlocks(text) {
  const trimmed = (text || "").trim();
  if (!trimmed) return [];
  return trimmed.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
}

function blockHeading(block) {
  return (block.split("\n")[0] || "").trim();
}

function TextBlockCards({ version, field, section, updateVersionField, t, placeholder, addLabel }) {
  const { isPro, setPanel, toast, profile } = useApp();
  const [blocks, setBlocks] = useState(() => splitBlocks(version[field]));
  const [polishingIndex, setPolishingIndex] = useState(null);

  useEffect(() => {
    setBlocks(splitBlocks(version[field]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version.id, field]);

  const commit = (next) => {
    setBlocks(next);
    updateVersionField(field, next.join("\n\n"));
  };

  const handlePolish = async (i) => {
    if (!isPro) {
      toast(t("polishProOnly"));
      setPanel("pricing");
      return;
    }
    const block = blocks[i];
    if (!block.trim()) return;
    setPolishingIndex(i);
    try {
      const res = await fetch("/api/cv/polish-block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: block, section, language: version.language || profile?.locale || "de" }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data?.message || t("polishFailed"));
        return;
      }
      const next = blocks.slice();
      next[i] = data.text;
      commit(next);
      toast(t("polishSuccess"));
    } catch {
      toast(t("polishFailed"));
    } finally {
      setPolishingIndex(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {blocks.map((block, i) => (
        <div key={i} className="glass cv-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
            <h4 style={{ margin: 0, minWidth: 0, flex: "1 1 180px" }}>{blockHeading(block) || placeholder}</h4>
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={polishingIndex === i}
                onClick={() => handlePolish(i)}
              >
                {polishingIndex === i ? t("polishing") : t("polish")} {!isPro && <span className="pro-tag">PRO</span>}
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => commit(blocks.filter((_, idx) => idx !== i))}
              >
                {t("removeBlock")}
              </button>
            </div>
          </div>
          <textarea
            className="cv-editable"
            style={{ width: "100%", border: "none", resize: "vertical", background: "transparent", marginTop: 6 }}
            rows={4}
            value={block}
            onChange={(e) => {
              const next = blocks.slice();
              next[i] = e.target.value;
              commit(next);
            }}
          />
        </div>
      ))}
      <button type="button" className="btn btn-secondary btn-sm" style={{ alignSelf: "flex-start" }} onClick={() => commit([...blocks, ""])}>
        {addLabel}
      </button>
    </div>
  );
}

function PolishableField({ version, field, section, updateVersionField, t, label, rows }) {
  const { isPro, setPanel, toast, profile } = useApp();
  const [polishing, setPolishing] = useState(false);

  const handlePolish = async () => {
    if (!isPro) {
      toast(t("polishProOnly"));
      setPanel("pricing");
      return;
    }
    const current = version[field] || "";
    if (!current.trim()) return;
    setPolishing(true);
    try {
      const res = await fetch("/api/cv/polish-block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: current, section, language: version.language || profile?.locale || "de" }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data?.message || t("polishFailed"));
        return;
      }
      updateVersionField(field, data.text);
      toast(t("polishSuccess"));
    } catch {
      toast(t("polishFailed"));
    } finally {
      setPolishing(false);
    }
  };

  return (
    <div className="glass cv-section">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
        <h4 style={{ minWidth: 0, flex: "1 1 120px" }}>{label}</h4>
        <button type="button" className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }} disabled={polishing} onClick={handlePolish}>
          {polishing ? t("polishing") : t("polish")} {!isPro && <span className="pro-tag">PRO</span>}
        </button>
      </div>
      <textarea
        className="cv-editable"
        style={{ width: "100%", border: "none", resize: "vertical", background: "transparent" }}
        rows={rows}
        value={version[field] || ""}
        onChange={(e) => updateVersionField(field, e.target.value)}
      />
    </div>
  );
}

export default function BuilderPanel() {
  const {
    isPro, downloadCv, setPanel,
    applications,
    cvVersions, selectedVersionId, setSelectedVersionId,
    createCvVersion, updateVersionField, saveCvVersion, deleteCvVersion,
    scoreCvVersion, scoringCv,
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
        <form className="glass profile-section" style={{ padding: 18, display: "flex", gap: 10, marginTop: 14, alignItems: "center", flexWrap: "wrap" }} onSubmit={handleCreate}>
          <input className="profile-input" style={{ marginTop: 0, flex: "1 1 160px" }} placeholder={t("newVersionNamePlaceholder")}
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
          <PolishableField version={version} field="summary" section="summary" updateVersionField={updateVersionField} t={t} label={t("sections.summary")} rows={2} />
          <div>
            <h4 style={{ margin: "0 0 8px", fontSize: 13, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".04em" }}>{t("sections.experience")}</h4>
            <TextBlockCards
              version={version}
              field="experience_text"
              section="experience"
              updateVersionField={updateVersionField}
              t={t}
              placeholder={t("experienceBlockPlaceholder")}
              addLabel={t("addBlock")}
            />
          </div>
          <div>
            <h4 style={{ margin: "0 0 8px", fontSize: 13, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".04em" }}>{t("sections.education")}</h4>
            <TextBlockCards
              version={version}
              field="education_text"
              section="education"
              updateVersionField={updateVersionField}
              t={t}
              placeholder={t("educationBlockPlaceholder")}
              addLabel={t("addEducationBlock")}
            />
          </div>
          <PolishableField version={version} field="skills_text" section="skills" updateVersionField={updateVersionField} t={t} label={t("sections.skills")} rows={2} />
          <PolishableField version={version} field="achievements_text" section="achievements" updateVersionField={updateVersionField} t={t} label={t("sections.achievements")} rows={2} />
        </div>

        <div className="dark-card ai-panel">
          <h4>{t("scoreTitle")}</h4>
          {linkedApp ? (
            <div className="ai-suggestion">
              {linkedApp.match_score != null && version.match_score != null ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span>{t("scoreBefore", { score: linkedApp.match_score })}</span>
                  <span>→</span>
                  <strong style={{ color: "var(--accent-2)" }}>{t("scoreNow", { score: version.match_score })}</strong>
                </div>
              ) : version.match_score != null ? (
                <div style={{ marginBottom: 10 }}>{t("scoreNow", { score: version.match_score })}</div>
              ) : (
                <div style={{ marginBottom: 10 }}>{t("scorePlaceholder")}</div>
              )}
              <button className="btn btn-dark btn-sm" disabled={scoringCv} onClick={() => scoreCvVersion(version.id)}>
                {scoringCv ? t("scoring") : version.match_score != null ? t("scoreRefresh") : t("scoreCalculate")}
                {!isPro && <span className="pro-tag">PRO</span>}
              </button>
            </div>
          ) : (
            <div className="ai-suggestion">
              {t("aiSuggestionsPlaceholder")}
            </div>
          )}
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
