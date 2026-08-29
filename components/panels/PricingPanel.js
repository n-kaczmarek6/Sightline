"use client";
import { useTranslations } from "next-intl";
import { useApp } from "@/context/AppContext";
import PricingCards from "@/components/PricingCards";

export default function PricingPanel() {
  const { isPro, setPlan, priceMode, setPriceMode } = useApp();
  const t = useTranslations("pricing");

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

      <PricingCards
        t={t}
        priceMode={priceMode}
        setPriceMode={setPriceMode}
        freeCta={
          <button className="btn btn-secondary" style={{ width: "100%" }} disabled={!isPro} onClick={() => setPlan(false)}>
            {isPro ? t("free.downgrade") : t("free.currentPlan")}
          </button>
        }
        proCta={
          <button className="btn btn-dark" style={{ width: "100%" }} disabled={isPro} onClick={() => setPlan(true)}>
            {isPro ? t("pro.currentPlan") : t("pro.upgrade")}
          </button>
        }
      />
    </div>
  );
}
