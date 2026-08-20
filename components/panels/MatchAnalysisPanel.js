"use client";
import { useApp } from "@/context/AppContext";

const SCORE_LABELS = [
  ["skills_match", "Skills Match"],
  ["experience_match", "Experience Match"],
  ["keyword_coverage", "Keyword Coverage"],
  ["education_match", "Education Match"],
  ["ats_readiness", "ATS Readiness"],
];

function matchBadge(score) {
  if (score >= 80) return { cls: "badge-mint", label: "Starker Match" };
  if (score >= 60) return { cls: "badge-warning", label: "Guter Match" };
  return { cls: "badge-error", label: "Ausbaufähiger Match" };
}

export default function MatchAnalysisPanel() {
  const { setPanel, currentAnalysis } = useApp();

  if (!currentAnalysis) {
    return (
      <div className="panel">
        <div className="panel-head"><h1>Dein Match</h1></div>
        <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>
          Noch keine Analyse vorhanden.{" "}
          <a href="#" onClick={(e) => { e.preventDefault(); setPanel("analyze"); }}>Jetzt einen Job analysieren →</a>
        </p>
      </div>
    );
  }

  const badge = matchBadge(currentAnalysis.match_score);

  return (
    <div className="panel">
      <div className="panel-head"><h1>Dein Match</h1><p>{currentAnalysis.job_title} — {currentAnalysis.company}</p></div>

      <div className="dark-card score-hero">
        <div className="score-ring" style={{ "--pct": `${currentAnalysis.match_score}%` }}>
          <div className="score-ring-inner"><div className="v">{currentAnalysis.match_score}</div><div className="m">/ 100</div></div>
        </div>
        <div style={{ flex: 1, minWidth: 260 }}>
          <span className={`badge ${badge.cls}`}>{badge.label}</span>
          <div style={{ marginTop: 18 }}>
            {SCORE_LABELS.map(([key, label]) => (
              <div className="bar-row" key={key}>
                <div className="bar-row-head"><span className="n">{label}</span><span className="v">{currentAnalysis.scores?.[key] ?? 0}%</span></div>
                <div className="bar-track"><div className="bar-fill" style={{ width: `${currentAnalysis.scores?.[key] ?? 0}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 16 }}>
        <div className="glass" style={{ padding: 22 }}>
          <h4 style={{ fontSize: 15, color: "var(--ink)", marginBottom: 14 }}>Was funktioniert</h4>
          <div className="chip-list">
            {(currentAnalysis.strengths || []).map((s) => (
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
            {(currentAnalysis.gaps || []).map((g) => (
              <div className="chip-item bad" key={g}>
                <svg className="icon" style={{ width: 15, height: 15, color: "var(--warning)" }}><use href="#i-alert" /></svg>
                <span>{g}</span>
              </div>
            ))}
          </div>
          <div className="note-box">
            💡 Vielleicht hast du diese Erfahrung bereits — wir konnten sie nur nicht in deinem Profil finden.
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
