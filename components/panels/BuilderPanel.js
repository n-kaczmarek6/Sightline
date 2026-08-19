"use client";
import { useApp } from "@/context/AppContext";

export default function BuilderPanel() {
  const {
    isPro, downloadCv, improveSummary, revertSummary, toast,
    cvSummary, setCvSummary, cvExperience, setCvExperience,
    cvEducation, setCvEducation, cvSkills, setCvSkills,
    cvAchievements, setCvAchievements,
  } = useApp();

  return (
    <div className="panel">
      <div className="panel-head"><h1>CV Builder</h1><p>Maßgeschneidert auf die Zielrolle — jeder Abschnitt direkt editierbar.</p></div>

      <div className="glass" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 18, padding: "18px 22px" }}>
        <div>
          <span style={{ fontSize: 11.5, color: "var(--text-faint)" }}>Zielrolle</span>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>Product Marketing Manager — HubSpot</div>
        </div>
        <span className="badge badge-success">Match Score: 94%</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn btn-secondary btn-sm" onClick={() => downloadCv("DOCX")}>
            DOCX {!isPro && <span className="pro-tag">PRO</span>}
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => downloadCv("PDF")}>
            CV als PDF {!isPro && <span className="pro-tag">PRO</span>}
          </button>
        </div>
      </div>

      <div className="builder-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="glass cv-section">
            <h4>Summary</h4>
            <textarea className="cv-editable" style={{ width: "100%", border: "none", resize: "vertical", background: "transparent" }}
              rows={2} value={cvSummary} onChange={(e) => setCvSummary(e.target.value)} />
          </div>
          <div className="glass cv-section">
            <h4>Experience</h4>
            <textarea className="cv-editable" style={{ width: "100%", border: "none", resize: "vertical", background: "transparent" }}
              rows={3} value={cvExperience} onChange={(e) => setCvExperience(e.target.value)} />
          </div>
          <div className="glass cv-section">
            <h4>Education</h4>
            <textarea className="cv-editable" style={{ width: "100%", border: "none", resize: "vertical", background: "transparent" }}
              rows={2} value={cvEducation} onChange={(e) => setCvEducation(e.target.value)} />
          </div>
          <div className="glass cv-section">
            <h4>Skills</h4>
            <textarea className="cv-editable" style={{ width: "100%", border: "none", resize: "vertical", background: "transparent" }}
              rows={2} value={cvSkills} onChange={(e) => setCvSkills(e.target.value)} />
          </div>
          <div className="glass cv-section">
            <h4>Certifications &amp; Achievements</h4>
            <textarea className="cv-editable" style={{ width: "100%", border: "none", resize: "vertical", background: "transparent" }}
              rows={2} value={cvAchievements} onChange={(e) => setCvAchievements(e.target.value)} />
          </div>
        </div>

        <div className="dark-card ai-panel">
          <h4>AI-Vorschläge</h4>
          <div className="ai-suggestion">Dein Summary könnte SaaS- und Go-to-Market-Erfahrung stärker betonen.</div>
          <div className="btn-row">
            <button className="btn btn-dark btn-sm" style={{ flex: 1 }} onClick={improveSummary}>Mit AI verbessern</button>
            <button className="btn btn-outline btn-sm" onClick={revertSummary}>Original</button>
          </div>
          <button className="btn btn-save btn-sm" onClick={() => toast("Als 'Product Marketing Manager v4' gespeichert.")}>
            Als Version speichern
          </button>
        </div>
      </div>
    </div>
  );
}
