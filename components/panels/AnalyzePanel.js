"use client";
import { useState } from "react";
import { useApp } from "@/context/AppContext";

export default function AnalyzePanel() {
  const { runAnalysis, analyzing, toast, workExperience, skills } = useApp();
  const [jobDescription, setJobDescription] = useState("");

  const hasProfileData = workExperience.length > 0 || skills.length > 0;

  return (
    <div className="panel">
      <div className="panel-head">
        <h1>Job analysieren</h1>
        <p>Sieh vor dem Absenden, wie gut deine Erfahrung zur Position passt.</p>
      </div>
      <div className="grid-2">
        <div className="glass" style={{ padding: 22 }}>
          <div className="tab-row">
            <span className="tab-btn active">Text einfügen</span>
            <button className="tab-btn" onClick={() => toast("PDF-Job-Description hochladen.")}>PDF</button>
            <button className="tab-btn" onClick={() => toast("DOCX-Job-Description hochladen.")}>DOCX</button>
            <button className="tab-btn" onClick={() => toast("Job-URL importieren.")}>URL importieren</button>
          </div>
          <div className="mock-label">Job Description</div>
          <textarea
            className="input-area"
            placeholder="Füge hier die vollständige Stellenbeschreibung ein…"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>
        <div className="glass" style={{ padding: 22 }}>
          <div className="tab-row">
            <span className="tab-btn active">Mein Profil</span>
          </div>
          <div className="mock-label">Dein Profil</div>
          <div className="upload-box">
            <div style={{ fontSize: 30 }}>👤</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>
                {hasProfileData ? "Profil wird für die Analyse genutzt" : "Profil ist noch leer"}
              </div>
              <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 3 }}>
                {workExperience.length} Berufserfahrung{workExperience.length === 1 ? "" : "en"} · {skills.length} Skill{skills.length === 1 ? "" : "s"}
              </div>
            </div>
          </div>
          <div className="privacy-note">
            <svg className="icon" style={{ width: 15, height: 15, color: "#0C9077" }}><use href="#i-lock" /></svg>
            Deine Daten sind privat und werden nur für deine Bewerbungen genutzt.
          </div>
          {!hasProfileData && (
            <div className="note-box" style={{ marginTop: 14 }}>
              💡 Dein Profil ist noch leer — die Analyse wird dadurch wenig aussagekräftig. Füll erst dein{" "}
              <a href="#" onClick={(e) => { e.preventDefault(); toast("Öffne Mein Profil im Menü."); }}>Profil</a> aus.
            </div>
          )}
        </div>
      </div>
      <div style={{ marginTop: 22 }}>
        <button className="btn btn-primary" disabled={analyzing} onClick={() => runAnalysis(jobDescription)}>
          {analyzing ? "Analysiere…" : "Match analysieren"}
        </button>
      </div>
    </div>
  );
}
