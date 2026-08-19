"use client";
import { useState } from "react";
import { useApp } from "@/context/AppContext";

const KW_DATA = {
  "skills-gtm": { title: "Go-to-Market-Strategie", status: "Nicht gefunden", badge: "badge-error",
    lead: "Das ist eine wichtige Anforderung in der Job Description. Dein CV enthält verwandte Erfahrung, aber der Bezug ist nicht explizit.",
    sugg: "Falls zutreffend: Hebe deine Erfahrung bei Produkt-Launches oder Markteintritten stärker hervor." },
  "skills-product-marketing": { title: "Product Marketing", status: "Belegt", badge: "badge-success",
    lead: "Klar belegt in deiner Erfahrung — einer deiner stärksten Matches für diese Rolle.",
    sugg: "Keine Änderung nötig. Nutze diese Formulierung gern prominent in deinem Summary." },
  "skills-b2b": { title: "B2B Marketing", status: "Erwähnt, aber schwach belegt", badge: "badge-warning",
    lead: "Dein CV erwähnt SaaS-Marketing allgemein, aber nicht explizit den B2B-Kontext, für den hier gesucht wird.",
    sugg: "Falls zutreffend, nenne den B2B-Charakter deiner bisherigen Kampagnen explizit." },
  "skills-strategic": { title: "Strategisches Denken", status: "Erwähnt, aber schwach belegt", badge: "badge-warning",
    lead: "Implizit durch Leadership-Punkte, aber nicht direkt als Skill oder Ergebnis benannt.",
    sugg: "Ergänze einen Punkt, der eine strategische Entscheidung und ihr messbares Ergebnis zeigt." },
  "tools-salesforce": { title: "Salesforce", status: "Erwähnt, aber schwach belegt", badge: "badge-warning",
    lead: "Dein Profil erwähnt CRM-Erfahrung allgemein, nennt Salesforce aber nicht namentlich.",
    sugg: "Falls du Salesforce genutzt hast, nenne es explizit — ATS-Systeme matchen Tool-Namen wörtlich." },
  "tools-analytics": { title: "Google Analytics", status: "Erwähnt, aber schwach belegt", badge: "badge-warning",
    lead: "Du hast eine Google-Analytics-Zertifizierung im Dokumenten-Vault, sie fehlt aber noch auf dieser CV-Version.",
    sugg: "Ergänze die Zertifizierung im Bereich Certifications — siehe Dokumente." },
  "tools-tableau": { title: "Tableau", status: "Nicht gefunden", badge: "badge-error",
    lead: "Keine Belege für Tableau-Erfahrung in deinem CV oder Profil gefunden.",
    sugg: "Ergänze das nur, wenn du wirklich mit Tableau gearbeitet hast. Diese Lücke muss nicht zwingend geschlossen werden." },
  "generic-good": { title: "Keyword", status: "Belegt", badge: "badge-success",
    lead: "Klar belegt in deinem CV — für ATS-Matching und Recruiter-Review gut abgedeckt.",
    sugg: "Keine Aktion nötig." },
};

function KwChip({ label, cls, dataKey, onSelect }) {
  return (
    <button className={`kw-chip ${cls}`} onClick={() => onSelect(dataKey)}>{label}</button>
  );
}

export default function KeywordsPanel() {
  const { isPro, setPanel } = useApp();
  const [selected, setSelected] = useState("skills-gtm");
  const d = KW_DATA[selected];

  return (
    <div className="panel">
      <div className="panel-head">
        <h1>Wonach die Job Description sucht</h1>
        <p>Klick ein Keyword, um zu sehen, wie gut es in deinem CV belegt ist.</p>
      </div>
      <div className="glass" style={{ padding: 26 }}>
        <div className="kw-cat">
          <h4>Core Skills</h4>
          <div className="kw-chips">
            <KwChip label="✓ Product Marketing" cls="demonstrated" dataKey="skills-product-marketing" onSelect={setSelected} />
            <KwChip label="✕ Go-to-Market-Strategie" cls="missing" dataKey="skills-gtm" onSelect={setSelected} />
            <KwChip label="✓ Marktforschung" cls="demonstrated" dataKey="generic-good" onSelect={setSelected} />
            <KwChip label="✓ Wettbewerbsanalyse" cls="demonstrated" dataKey="generic-good" onSelect={setSelected} />
            <KwChip label="✓ SaaS" cls="demonstrated" dataKey="generic-good" onSelect={setSelected} />
            <KwChip label="~ B2B Marketing" cls="weak" dataKey="skills-b2b" onSelect={setSelected} />
          </div>
        </div>

        <div className="lock-wrap">
          <div className={isPro ? "" : "lock-blur"}>
            <div className="kw-cat">
              <h4>Tools</h4>
              <div className="kw-chips">
                <KwChip label="✓ HubSpot" cls="demonstrated" dataKey="generic-good" onSelect={setSelected} />
                <KwChip label="~ Salesforce" cls="weak" dataKey="tools-salesforce" onSelect={setSelected} />
                <KwChip label="~ Google Analytics" cls="weak" dataKey="tools-analytics" onSelect={setSelected} />
                <KwChip label="✕ Tableau" cls="missing" dataKey="tools-tableau" onSelect={setSelected} />
              </div>
            </div>
            <div className="kw-cat">
              <h4>Soft Skills</h4>
              <div className="kw-chips">
                <KwChip label="✓ Cross-funktionale Zusammenarbeit" cls="demonstrated" dataKey="generic-good" onSelect={setSelected} />
                <KwChip label="✓ Leadership" cls="demonstrated" dataKey="generic-good" onSelect={setSelected} />
                <KwChip label="✓ Kommunikation" cls="demonstrated" dataKey="generic-good" onSelect={setSelected} />
                <KwChip label="~ Strategisches Denken" cls="weak" dataKey="skills-strategic" onSelect={setSelected} />
              </div>
            </div>
          </div>
          {!isPro && (
            <div className="lock-overlay">
              <div className="lock-overlay-icon"><svg className="icon" style={{ width: 18, height: 18 }}><use href="#i-lock" /></svg></div>
              <p>Tools und Soft Skills — die volle Keyword-Aufschlüsselung gibt&apos;s mit Pro.</p>
              <button className="btn btn-primary btn-sm" onClick={() => setPanel("pricing")}>Upgrade auf Pro</button>
            </div>
          )}
        </div>

        <div className="kw-detail">
          <h4>{d.title}</h4>
          <span className={`badge ${d.badge}`} style={{ marginTop: 8, display: "inline-flex" }}>{d.status}</span>
          <p className="lead">{d.lead}</p>
          <div className="suggestion-lbl">Vorschlag</div>
          <p className="lead" style={{ marginTop: 0 }}>{d.sugg}</p>
        </div>
      </div>
    </div>
  );
}
