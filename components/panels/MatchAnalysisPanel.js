"use client";
import { useApp } from "@/context/AppContext";

const BARS = [
  ["Skills Match", 92], ["Experience Match", 88], ["Keyword Coverage", 81],
  ["Education Match", 95], ["ATS Readiness", 86],
];
const STRENGTHS = [
  "8+ Jahre relevante Marketing-Erfahrung", "Starker B2B-SaaS-Hintergrund",
  "Erfahrung mit HubSpot", "Leadership-Erfahrung passt zur Rolle", "Bachelor-Abschluss erfüllt Anforderung",
];
const GAPS = [
  "Product-Marketing-Erfahrung nicht klar hervorgehoben",
  '"Go-to-Market-Strategie" steht in der Job Description, aber nicht in deinem CV',
  "Keine klare Pricing-Strategie-Erfahrung belegt",
  "Analytics-Tools könnten konkreter beschrieben werden",
];

export default function MatchAnalysisPanel() {
  const { setPanel } = useApp();
  return (
    <div className="panel">
      <div className="panel-head"><h1>Dein Match</h1><p>Product Marketing Manager — HubSpot</p></div>

      <div className="dark-card score-hero">
        <div className="score-ring" style={{ "--pct": "87%" }}>
          <div className="score-ring-inner"><div className="v">87</div><div className="m">/ 100</div></div>
        </div>
        <div style={{ flex: 1, minWidth: 260 }}>
          <span className="badge badge-mint">Starker Match</span>
          <div style={{ marginTop: 18 }}>
            {BARS.map(([label, val]) => (
              <div className="bar-row" key={label}>
                <div className="bar-row-head"><span className="n">{label}</span><span className="v">{val}%</span></div>
                <div className="bar-track"><div className="bar-fill" style={{ width: `${val}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 16 }}>
        <div className="glass" style={{ padding: 22 }}>
          <h4 style={{ fontSize: 15, color: "var(--ink)", marginBottom: 14 }}>Was funktioniert</h4>
          <div className="chip-list">
            {STRENGTHS.map((s) => (
              <div className="chip-item good" key={s}>
                <svg className="icon" style={{ width: 15, height: 15, color: "var(--success)", strokeWidth: 2.2 }}><use href="#i-check" /></svg>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass" style={{ padding: 22 }}>
          <h4 style={{ fontSize: 15, color: "var(--ink)", marginBottom: 14 }}>Was fehlt</h4>
          <div className="chip-list">
            {GAPS.map((g) => (
              <div className="chip-item bad" key={g}>
                <svg className="icon" style={{ width: 15, height: 15, color: "var(--warning)" }}><use href="#i-alert" /></svg>
                <span>{g}</span>
              </div>
            ))}
          </div>
          <div className="note-box">
            💡 Vielleicht hast du diese Erfahrung bereits — wir konnten sie nur nicht in deinem CV finden.
            Wir schlagen nie vor, eine Qualifikation hinzuzufügen, die du nicht hast.
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap" }}>
        <button className="btn btn-secondary" onClick={() => setPanel("keywords")}>Keyword-Analyse →</button>
        <button className="btn btn-primary" onClick={() => setPanel("recommendations")}>CV-Empfehlungen →</button>
      </div>
    </div>
  );
}
