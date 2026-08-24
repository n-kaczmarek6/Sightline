"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useApp } from "@/context/AppContext";

const IMPACT_BADGE = {
  high: "badge-error",
  medium: "badge-warning",
  low: "badge-success",
};

export default function RecommendationsPanel() {
  const { isPro, setPanel, toast, currentAnalysis } = useApp();
  const t = useTranslations("recommendations");
  const [states, setStates] = useState({}); // { [index]: "applied" | "ignored" }

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

  const recs = [...(currentAnalysis.recommendations || [])].sort((a, b) => a.priority - b.priority);
  const [first, ...rest] = recs;

  const setState = (i, s) => setStates((prev) => ({ ...prev, [i]: s }));

  return (
    <div className="panel">
      <div className="panel-head"><h1>{t("title")}</h1><p>{t("subtitle")}</p></div>

      {!first ? (
        <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>{t("noRecommendations")}</p>
      ) : (
        <div className="glass rec-card" style={{ opacity: states[0] === "ignored" ? 0.45 : 1 }}>
          <span className={`badge ${IMPACT_BADGE[first.impact]}`}>{t("priority", { n: first.priority })} · {t(`impact.${first.impact}`)}</span>
          <h4 style={{ fontSize: 18, color: "var(--ink)", margin: "12px 0 4px" }}>{first.title}</h4>
          <div className="compare-box">
            <div className="compare-cell current"><div className="compare-lbl">{t("current")}</div>„{first.current}&quot;</div>
            <div className="compare-cell suggested"><div className="compare-lbl">{t("suggested")}</div>„{first.suggested}&quot;</div>
          </div>
          <div className="rec-actions">
            <button className="btn btn-primary btn-sm" disabled={states[0] && states[0] !== "idle"} onClick={() => { setState(0, "applied"); toast(t("appliedToast")); }}>
              {t("applySuggestion")}
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setPanel("builder")}>{t("editInBuilder")}</button>
            <button className="btn btn-ghost btn-sm" disabled={states[0] && states[0] !== "idle"} onClick={() => { setState(0, "ignored"); toast(t("ignoredToast")); }}>{t("ignore")}</button>
            {states[0] === "applied" && <span className="rec-state" style={{ display: "inline-flex" }}>{t("appliedBadge")}</span>}
          </div>
        </div>
      )}

      {rest.length > 0 && (
        <div className="lock-wrap" style={{ marginTop: 14 }}>
          <div className={isPro ? "" : "lock-blur"} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {rest.map((r, i) => (
              <div className="glass rec-card p3" key={i}>
                <span className={`badge ${IMPACT_BADGE[r.impact]}`}>{t("priority", { n: r.priority })} · {t(`impact.${r.impact}`)}</span>
                <h4 style={{ fontSize: 18, color: "var(--ink)", margin: "12px 0 10px" }}>{r.title}</h4>
                <div className="compare-box">
                  <div className="compare-cell current"><div className="compare-lbl">{t("current")}</div>„{r.current}&quot;</div>
                  <div className="compare-cell suggested"><div className="compare-lbl">{t("suggested")}</div>„{r.suggested}&quot;</div>
                </div>
              </div>
            ))}
          </div>
          {!isPro && (
            <div className="lock-overlay">
              <div className="lock-overlay-icon"><svg className="icon" style={{ width: 18, height: 18 }}><use href="#i-lock" /></svg></div>
              <p>{t("lockNote", { count: rest.length })}</p>
              <button className="btn btn-primary btn-sm" onClick={() => setPanel("pricing")}>{t("upgrade")}</button>
            </div>
          )}
        </div>
      )}

      <div className="note-box">{t("footerNote")}</div>
      <div style={{ marginTop: 18 }}>
        <button className="btn btn-primary" onClick={() => setPanel("builder")}>{t("continueToBuilder")}</button>
      </div>
    </div>
  );
}
