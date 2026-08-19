"use client";
import { useApp } from "@/context/AppContext";

export default function AnalyzePanel() {
  const { runAnalysis, toast } = useApp();

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
            defaultValue={`Product Marketing Manager — HubSpot\n\nWir suchen einen Product Marketing Manager für die Go-to-Market-Strategie unserer SaaS-Plattform. Du arbeitest eng mit Product, Sales und Design zusammen, launchst neue Features, bringst Pricing-Strategie-Input ein und entwickelst überzeugendes Positioning auf Basis von Marktforschung und Wettbewerbsanalyse.\n\nAnforderungen: 5+ Jahre B2B-SaaS-Produktmarketing, Erfahrung mit HubSpot/Salesforce, starke Analytics-Skills (Google Analytics, Tableau) und nachweisliche Erfolge bei Go-to-Market-Kampagnen.`}
          />
        </div>
        <div className="glass" style={{ padding: 22 }}>
          <div className="tab-row">
            <span className="tab-btn active">Mein Profil</span>
            <button className="tab-btn" onClick={() => toast("Vorhandenes CV auswählen.")}>CV auswählen</button>
            <button className="tab-btn" onClick={() => toast("CV-Datei hochladen (.pdf oder .docx).")}>CV hochladen</button>
          </div>
          <div className="mock-label">Dein CV</div>
          <div className="upload-box">
            <div style={{ fontSize: 30 }}>📄</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>Alex_Morgan_CV_v3.pdf</div>
              <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 3 }}>Aus deinem Profil geladen — 87% vollständig</div>
            </div>
          </div>
          <div className="privacy-note">
            <svg className="icon" style={{ width: 15, height: 15, color: "#0C9077" }}><use href="#i-lock" /></svg>
            Deine Dokumente sind privat und werden nur für deine Bewerbungen genutzt.
          </div>
        </div>
      </div>
      <div style={{ marginTop: 22 }}>
        <button className="btn btn-primary" onClick={() => runAnalysis()}>Match analysieren</button>
      </div>
    </div>
  );
}
