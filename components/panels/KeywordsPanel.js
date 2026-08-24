"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useApp } from "@/context/AppContext";

const CATEGORY_KEYS = ["skills", "tools", "soft_skills"];

const STATUS_META = {
  demonstrated: { symbol: "✓", cls: "demonstrated", badge: "badge-success" },
  weak: { symbol: "~", cls: "weak", badge: "badge-warning" },
  missing: { symbol: "✕", cls: "missing", badge: "badge-error" },
};

export default function KeywordsPanel() {
  const { isPro, setPanel, currentAnalysis } = useApp();
  const t = useTranslations("keywords");
  const [selected, setSelected] = useState(null);

  if (!currentAnalysis) {
    return (
      <div className="panel">
        <div className="panel-head"><h1>{t("title")}</h1></div>
        <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>
          {t("noAnalysis")}{" "}
          <a href="#" onClick={(e) => { e.preventDefault(); setPanel("analyze"); }}>{t("analyzeNow")}</a>
        </p>
      </div>
    );
  }

  const keywords = currentAnalysis.keywords || [];
  const byCategory = Object.fromEntries(CATEGORY_KEYS.map((key) => [key, keywords.filter((k) => k.category === key)]));
  const active = selected || byCategory.skills[0] || keywords[0];

  return (
    <div className="panel">
      <div className="panel-head">
        <h1>{t("title")}</h1>
        <p>{t("subtitle")}</p>
      </div>
      <div className="glass" style={{ padding: 26 }}>
        <div className="kw-cat">
          <h4>{t("categories.skills")}</h4>
          <div className="kw-chips">
            {byCategory.skills.map((k) => {
              const meta = STATUS_META[k.status];
              return (
                <button key={k.label} className={`kw-chip ${meta.cls}`} onClick={() => setSelected(k)}>
                  {meta.symbol} {k.label}
                </button>
              );
            })}
            {byCategory.skills.length === 0 && <span style={{ fontSize: 13, color: "var(--text-faint)" }}>{t("noneDetected")}</span>}
          </div>
        </div>

        <div className="lock-wrap">
          <div className={isPro ? "" : "lock-blur"}>
            {CATEGORY_KEYS.slice(1).map((key) => (
              <div className="kw-cat" key={key}>
                <h4>{t(`categories.${key}`)}</h4>
                <div className="kw-chips">
                  {byCategory[key].map((k) => {
                    const meta = STATUS_META[k.status];
                    return (
                      <button key={k.label} className={`kw-chip ${meta.cls}`} onClick={() => setSelected(k)}>
                        {meta.symbol} {k.label}
                      </button>
                    );
                  })}
                  {byCategory[key].length === 0 && <span style={{ fontSize: 13, color: "var(--text-faint)" }}>{t("noneDetected")}</span>}
                </div>
              </div>
            ))}
          </div>
          {!isPro && (
            <div className="lock-overlay">
              <div className="lock-overlay-icon"><svg className="icon" style={{ width: 18, height: 18 }}><use href="#i-lock" /></svg></div>
              <p>{t("lockNote")}</p>
              <button className="btn btn-primary btn-sm" onClick={() => setPanel("pricing")}>{t("upgrade")}</button>
            </div>
          )}
        </div>

        {active && (
          <div className="kw-detail">
            <h4>{active.label}</h4>
            <span className={`badge ${STATUS_META[active.status].badge}`} style={{ marginTop: 8, display: "inline-flex" }}>
              {t(`status.${active.status}`)}
            </span>
            <p className="lead">{active.detail}</p>
            <div className="suggestion-lbl">{t("suggestionLabel")}</div>
            <p className="lead" style={{ marginTop: 0 }}>{active.suggestion}</p>
          </div>
        )}
      </div>
    </div>
  );
}
