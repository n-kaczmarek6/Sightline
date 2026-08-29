"use client";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useApp } from "@/context/AppContext";

const SCORE_KEYS = ["skills_match", "experience_match", "keyword_coverage", "education_match", "ats_readiness"];

export default function MatchAnalysisPanel() {
  const { setPanel, currentAnalysis, generateCv, generatingCv, isPro } = useApp();
  const t = useTranslations("matchAnalysis");
  const uiLocale = useLocale();
  const [cvLanguage, setCvLanguage] = useState(uiLocale === "en" ? "en" : "de");

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

  const score = currentAnalysis.match_score;
  const badge = score >= 80
    ? { cls: "badge-mint", label: t("badges.strong") }
    : score >= 60
      ? { cls: "badge-warning", label: t("badges.good") }
      : { cls: "badge-error", label: t("badges.weak") };

  return (
    <div className="panel">
      <div className="panel-head"><h1>{t("title")}</h1><p>{currentAnalysis.job_title} — {currentAnalysis.company}</p></div>

      <div className="dark-card score-hero">
        <div className="score-ring" style={{ "--pct": `${currentAnalysis.match_score}%` }}>
          <div className="score-ring-inner"><div className="v">{currentAnalysis.match_score}</div><div className="m">/ 100</div></div>
        </div>
        <div style={{ flex: 1, minWidth: 260 }}>
          <span className={`badge ${badge.cls}`}>{badge.label}</span>
          <div style={{ marginTop: 18 }}>
            {SCORE_KEYS.map((key) => (
              <div className="bar-row" key={key}>
                <div className="bar-row-head"><span className="n">{t(`scores.${key}`)}</span><span className="v">{currentAnalysis.scores?.[key] ?? 0}%</span></div>
                <div className="bar-track"><div className="bar-fill" style={{ width: `${currentAnalysis.scores?.[key] ?? 0}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 16 }}>
        <div className="glass" style={{ padding: 22 }}>
          <h4 style={{ fontSize: 15, color: "var(--ink)", marginBottom: 14 }}>{t("whatWorks")}</h4>
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
          <h4 style={{ fontSize: 15, color: "var(--ink)", marginBottom: 14 }}>{t("whatsMissing")}</h4>
          <div className="chip-list">
            {(currentAnalysis.gaps || []).map((g) => (
              <div className="chip-item bad" key={g}>
                <svg className="icon" style={{ width: 15, height: 15, color: "var(--warning)" }}><use href="#i-alert" /></svg>
                <span>{g}</span>
              </div>
            ))}
          </div>
          <div className="note-box">💡 {t("gapsNote")}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap", alignItems: "center" }}>
        <button className="btn btn-secondary" onClick={() => setPanel("keywords")}>{t("keywordAnalysis")}</button>
        <button className="btn btn-secondary" onClick={() => setPanel("recommendations")}>{t("cvRecommendations")}</button>
        <select
          className="profile-input"
          style={{ marginTop: 0, width: "auto" }}
          value={cvLanguage}
          onChange={(e) => setCvLanguage(e.target.value)}
          aria-label={t("cvLanguage")}
        >
          <option value="de">Deutsch</option>
          <option value="en">English</option>
        </select>
        <button className="btn btn-primary" disabled={generatingCv} onClick={() => generateCv(currentAnalysis.id, cvLanguage)}>
          {generatingCv ? t("generatingCv") : t("generateCv")} {!isPro && <span className="pro-tag">PRO</span>}
        </button>
      </div>
    </div>
  );
}
