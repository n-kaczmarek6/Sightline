"use client";
import { useTranslations } from "next-intl";
import { useApp } from "@/context/AppContext";

export default function PricingPanel() {
  const { isPro, setPlan, priceMode, setPriceMode } = useApp();
  const t = useTranslations("pricing");
  const price = priceMode === "monthly" ? t("pro.priceMonthly") : t("pro.priceSprint");
  const unit = priceMode === "monthly" ? t("pro.unitMonthly") : t("pro.unitSprint");
  const tagline = priceMode === "monthly" ? t("pro.taglineMonthly") : t("pro.taglineSprint");
  const freeIncluded = t.raw("free.included");
  const freeNotIncluded = t.raw("free.notIncluded");
  const proFeatures = t.raw("pro.features");

  return (
    <div className="panel">
      <div style={{ textAlign: "center", maxWidth: 620, margin: "0 auto" }}>
        <div className="eyebrow">{t("eyebrow")}</div>
        <h1 style={{ fontSize: "clamp(28px,3.6vw,40px)", marginTop: 14, color: "var(--ink)" }}>
          {t("title")}
        </h1>
        <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.6, marginTop: 12 }}>
          {t("subtitle")}
        </p>
      </div>

      <div className="pricing-toggle-wrap">
        <div className="pricing-toggle">
          <button className={priceMode === "monthly" ? "active" : ""} onClick={() => setPriceMode("monthly")}>{t("toggle.monthly")}</button>
          <button className={priceMode === "sprint" ? "active" : ""} onClick={() => setPriceMode("sprint")}>{t("toggle.sprint")}</button>
        </div>
      </div>

      <div className="plans-grid">
        <div className="glass plan-card">
          <div className="plan-name">{t("free.name")}</div>
          <div className="plan-price">{t("free.price")}</div>
          <div className="plan-tagline">{t("free.tagline")}</div>
          <div className="plan-feature-list">
            {freeIncluded.map((f) => (
              <div className="plan-feature" key={f}><svg className="icon" style={{ width: 16, height: 16 }}><use href="#i-check" /></svg><span>{f}</span></div>
            ))}
            {freeNotIncluded.map((f) => (
              <div className="plan-feature dim" key={f}><svg className="icon" style={{ width: 16, height: 16 }}><use href="#i-alert" /></svg><span>{f}</span></div>
            ))}
          </div>
          <button className="btn btn-secondary" style={{ width: "100%" }} disabled={!isPro} onClick={() => setPlan(false)}>
            {isPro ? t("free.downgrade") : t("free.currentPlan")}
          </button>
        </div>

        <div className="dark-card plan-card featured">
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div className="plan-name">{t("pro.name")}</div>
              <span className="plan-badge-pop">{t("pro.popular")}</span>
            </div>
            <div className="plan-price">{price}<span> {unit}</span></div>
            <div className="plan-tagline">{tagline}</div>
            <div className="plan-feature-list">
              {proFeatures.map((f) => (
                <div className="plan-feature" key={f}><svg className="icon" style={{ width: 16, height: 16 }}><use href="#i-check" /></svg><span>{f}</span></div>
              ))}
            </div>
            <button className="btn btn-dark" style={{ width: "100%" }} disabled={isPro} onClick={() => setPlan(true)}>
              {isPro ? t("pro.currentPlan") : t("pro.upgrade")}
            </button>
          </div>
        </div>
      </div>
      <p style={{ textAlign: "center", color: "var(--text-faint)", fontSize: 12.5, marginTop: 26 }}>
        {t("sprintNote")}
      </p>
    </div>
  );
}
