"use client";
import { useState } from "react";
import { useApp } from "@/context/AppContext";

export default function RecommendationsPanel() {
  const { isPro, setPanel, toast } = useApp();
  const [rec1, setRec1] = useState("idle"); // idle | applied | ignored

  return (
    <div className="panel">
      <div className="panel-head"><h1>Dein CV-Verbesserungsplan</h1><p>Priorisiert nach Wirkung auf deinen Match Score für diese Rolle.</p></div>

      <div className="glass rec-card" style={{ opacity: rec1 === "ignored" ? 0.45 : 1 }}>
        <span className="badge badge-error">Priorität 1 · Hohe Wirkung</span>
        <h4 style={{ fontSize: 18, color: "var(--ink)", margin: "12px 0 4px" }}>Produkt-Launch-Erfahrung sichtbarer machen</h4>
        <div className="compare-box">
          <div className="compare-cell current"><div className="compare-lbl">Aktuell</div>„Managed marketing campaigns for new products.&quot;</div>
          <div className="compare-cell suggested"><div className="compare-lbl">Vorschlag</div>„Led go-to-market campaigns for 3 SaaS product launches, increasing qualified pipeline by 28%.&quot;</div>
        </div>
        <div className="rec-actions">
          <button className="btn btn-primary btn-sm" disabled={rec1 !== "idle"} onClick={() => { setRec1("applied"); toast("Vorschlag in den CV Builder übernommen."); }}>
            Vorschlag übernehmen
          </button>
          <button className="btn btn-secondary btn-sm" disabled={rec1 !== "idle"} onClick={() => setPanel("builder")}>Bearbeiten</button>
          <button className="btn btn-ghost btn-sm" disabled={rec1 !== "idle"} onClick={() => { setRec1("ignored"); toast("Vorschlag ignoriert."); }}>Ignorieren</button>
          {rec1 === "applied" && <span className="rec-state" style={{ display: "inline-flex" }}>✓ In CV Builder übernommen</span>}
        </div>
      </div>

      <div className="lock-wrap" style={{ marginTop: 14 }}>
        <div className={isPro ? "" : "lock-blur"} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="glass rec-card p3">
            <span className="badge badge-error">Priorität 2 · Hohe Wirkung</span>
            <h4 style={{ fontSize: 18, color: "var(--ink)", margin: "12px 0 10px" }}>Cross-funktionale Zusammenarbeit hervorheben</h4>
            <p style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.6 }}>
              Der Job lebt von der Arbeit mit Product, Sales und Design. Dein CV nennt Teamführung, aber nicht den
              cross-funktionalen Winkel, für den hier eingestellt wird.
            </p>
          </div>
          <div className="glass rec-card p3">
            <span className="badge badge-warning">Priorität 3 · Mittlere Wirkung</span>
            <h4 style={{ fontSize: 18, color: "var(--ink)", margin: "12px 0 10px" }}>Relevante Tools ergänzen</h4>
            <p style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.6 }}>
              In deinen Dokumenten liegt eine Google-Analytics-Zertifizierung, die noch nicht im CV steht. Wir schlagen
              nur Tools vor, die wirklich in deinem Profil belegt sind.
            </p>
          </div>
        </div>
        {!isPro && (
          <div className="lock-overlay">
            <div className="lock-overlay-icon"><svg className="icon" style={{ width: 18, height: 18 }}><use href="#i-lock" /></svg></div>
            <p>2 weitere priorisierte Empfehlungen sind fertig — freischalten mit Pro.</p>
            <button className="btn btn-primary btn-sm" onClick={() => setPanel("pricing")}>Upgrade auf Pro</button>
          </div>
        )}
      </div>

      <div className="note-box">AI-Vorschläge basieren auf deinem Profil und deinen Dokumenten. Sightline empfiehlt nie, Erfahrung zu ergänzen, die du nicht hast.</div>
      <div style={{ marginTop: 18 }}>
        <button className="btn btn-primary" onClick={() => setPanel("builder")}>Weiter zum CV Builder →</button>
      </div>
    </div>
  );
}
