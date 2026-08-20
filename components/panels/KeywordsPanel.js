"use client";
import { useState } from "react";
import { useApp } from "@/context/AppContext";

const CATEGORIES = [
  ["skills", "Core Skills"],
  ["tools", "Tools"],
  ["soft_skills", "Soft Skills"],
];

const STATUS_META = {
  demonstrated: { symbol: "✓", cls: "demonstrated", badge: "badge-success", label: "Belegt" },
  weak: { symbol: "~", cls: "weak", badge: "badge-warning", label: "Erwähnt, aber schwach belegt" },
  missing: { symbol: "✕", cls: "missing", badge: "badge-error", label: "Nicht gefunden" },
};

export default function KeywordsPanel() {
  const { isPro, setPanel, currentAnalysis } = useApp();
  const [selected, setSelected] = useState(null);

  if (!currentAnalysis) {
    return (
      <div className="panel">
        <div className="panel-head"><h1>Wonach die Job Description sucht</h1></div>
        <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>
          Noch keine Analyse vorhanden.{" "}
          <a href="#" onClick={(e) => { e.preventDefault(); setPanel("analyze"); }}>Jetzt einen Job analysieren →</a>
        </p>
      </div>
    );
  }

  const keywords = currentAnalysis.keywords || [];
  const byCategory = Object.fromEntries(CATEGORIES.map(([key]) => [key, keywords.filter((k) => k.category === key)]));
  const active = selected || byCategory.skills[0] || keywords[0];

  return (
    <div className="panel">
      <div className="panel-head">
        <h1>Wonach die Job Description sucht</h1>
        <p>Klick ein Keyword, um zu sehen, wie gut es in deinem Profil belegt ist.</p>
      </div>
      <div className="glass" style={{ padding: 26 }}>
        <div className="kw-cat">
          <h4>Core Skills</h4>
          <div className="kw-chips">
            {byCategory.skills.map((k) => {
              const meta = STATUS_META[k.status];
              return (
                <button key={k.label} className={`kw-chip ${meta.cls}`} onClick={() => setSelected(k)}>
                  {meta.symbol} {k.label}
                </button>
              );
            })}
            {byCategory.skills.length === 0 && <span style={{ fontSize: 13, color: "var(--text-faint)" }}>Keine erkannt.</span>}
          </div>
        </div>

        <div className="lock-wrap">
          <div className={isPro ? "" : "lock-blur"}>
            {CATEGORIES.slice(1).map(([key, label]) => (
              <div className="kw-cat" key={key}>
                <h4>{label}</h4>
                <div className="kw-chips">
                  {byCategory[key].map((k) => {
                    const meta = STATUS_META[k.status];
                    return (
                      <button key={k.label} className={`kw-chip ${meta.cls}`} onClick={() => setSelected(k)}>
                        {meta.symbol} {k.label}
                      </button>
                    );
                  })}
                  {byCategory[key].length === 0 && <span style={{ fontSize: 13, color: "var(--text-faint)" }}>Keine erkannt.</span>}
                </div>
              </div>
            ))}
          </div>
          {!isPro && (
            <div className="lock-overlay">
              <div className="lock-overlay-icon"><svg className="icon" style={{ width: 18, height: 18 }}><use href="#i-lock" /></svg></div>
              <p>Tools und Soft Skills — die volle Keyword-Aufschlüsselung gibt&apos;s mit Pro.</p>
              <button className="btn btn-primary btn-sm" onClick={() => setPanel("pricing")}>Upgrade auf Pro</button>
            </div>
          )}
        </div>

        {active && (
          <div className="kw-detail">
            <h4>{active.label}</h4>
            <span className={`badge ${STATUS_META[active.status].badge}`} style={{ marginTop: 8, display: "inline-flex" }}>
              {STATUS_META[active.status].label}
            </span>
            <p className="lead">{active.detail}</p>
            <div className="suggestion-lbl">Vorschlag</div>
            <p className="lead" style={{ marginTop: 0 }}>{active.suggestion}</p>
          </div>
        )}
      </div>
    </div>
  );
}
