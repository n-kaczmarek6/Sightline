"use client";
import { useState } from "react";
import { useApp } from "@/context/AppContext";

const IMPACT_BADGE = {
  high: "badge-error",
  medium: "badge-warning",
  low: "badge-success",
};
const IMPACT_LABEL = {
  high: "Hohe Wirkung",
  medium: "Mittlere Wirkung",
  low: "Geringe Wirkung",
};

export default function RecommendationsPanel() {
  const { isPro, setPanel, toast, currentAnalysis } = useApp();
  const [states, setStates] = useState({}); // { [index]: "applied" | "ignored" }

  if (!currentAnalysis) {
    return (
      <div className="panel">
        <div className="panel-head"><h1>Dein CV-Verbesserungsplan</h1></div>
        <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>
          Noch keine Analyse vorhanden.{" "}
          <a href="#" onClick={(e) => { e.preventDefault(); setPanel("analyze"); }}>Jetzt einen Job analysieren →</a>
        </p>
      </div>
    );
  }

  const recs = [...(currentAnalysis.recommendations || [])].sort((a, b) => a.priority - b.priority);
  const [first, ...rest] = recs;

  const setState = (i, s) => setStates((prev) => ({ ...prev, [i]: s }));

  return (
    <div className="panel">
      <div className="panel-head"><h1>Dein CV-Verbesserungsplan</h1><p>Priorisiert nach Wirkung auf deinen Match Score für diese Rolle.</p></div>

      {!first ? (
        <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>Keine Empfehlungen — dein Profil passt bereits gut.</p>
      ) : (
        <div className="glass rec-card" style={{ opacity: states[0] === "ignored" ? 0.45 : 1 }}>
          <span className={`badge ${IMPACT_BADGE[first.impact]}`}>Priorität {first.priority} · {IMPACT_LABEL[first.impact]}</span>
          <h4 style={{ fontSize: 18, color: "var(--ink)", margin: "12px 0 4px" }}>{first.title}</h4>
          <div className="compare-box">
            <div className="compare-cell current"><div className="compare-lbl">Aktuell</div>„{first.current}&quot;</div>
            <div className="compare-cell suggested"><div className="compare-lbl">Vorschlag</div>„{first.suggested}&quot;</div>
          </div>
          <div className="rec-actions">
            <button className="btn btn-primary btn-sm" disabled={states[0] && states[0] !== "idle"} onClick={() => { setState(0, "applied"); toast("Vorschlag übernommen — bearbeite ihn im CV Builder."); }}>
              Vorschlag übernehmen
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setPanel("builder")}>Im CV Builder bearbeiten</button>
            <button className="btn btn-ghost btn-sm" disabled={states[0] && states[0] !== "idle"} onClick={() => { setState(0, "ignored"); toast("Vorschlag ignoriert."); }}>Ignorieren</button>
            {states[0] === "applied" && <span className="rec-state" style={{ display: "inline-flex" }}>✓ Übernommen</span>}
          </div>
        </div>
      )}

      {rest.length > 0 && (
        <div className="lock-wrap" style={{ marginTop: 14 }}>
          <div className={isPro ? "" : "lock-blur"} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {rest.map((r, i) => (
              <div className="glass rec-card p3" key={i}>
                <span className={`badge ${IMPACT_BADGE[r.impact]}`}>Priorität {r.priority} · {IMPACT_LABEL[r.impact]}</span>
                <h4 style={{ fontSize: 18, color: "var(--ink)", margin: "12px 0 10px" }}>{r.title}</h4>
                <div className="compare-box">
                  <div className="compare-cell current"><div className="compare-lbl">Aktuell</div>„{r.current}&quot;</div>
                  <div className="compare-cell suggested"><div className="compare-lbl">Vorschlag</div>„{r.suggested}&quot;</div>
                </div>
              </div>
            ))}
          </div>
          {!isPro && (
            <div className="lock-overlay">
              <div className="lock-overlay-icon"><svg className="icon" style={{ width: 18, height: 18 }}><use href="#i-lock" /></svg></div>
              <p>{rest.length} weitere priorisierte Empfehlung{rest.length === 1 ? "" : "en"} sind fertig — freischalten mit Pro.</p>
              <button className="btn btn-primary btn-sm" onClick={() => setPanel("pricing")}>Upgrade auf Pro</button>
            </div>
          )}
        </div>
      )}

      <div className="note-box">KI-Vorschläge basieren auf deinem Profil. Sightline empfiehlt nie, Erfahrung zu ergänzen, die du nicht hast.</div>
      <div style={{ marginTop: 18 }}>
        <button className="btn btn-primary" onClick={() => setPanel("builder")}>Weiter zum CV Builder →</button>
      </div>
    </div>
  );
}
