"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import PricingCards from "@/components/PricingCards";

// Öffentliche Preis-Sektion für die Landingpage — kein Login nötig, im
// Gegensatz zum vorherigen Zustand, wo "Preise" im Nav auf /app?panel=pricing
// verlinkte und nicht eingeloggte Besucher:innen direkt zum Login umgeleitet
// wurden, bevor sie überhaupt Preise sehen konnten.
export default function PublicPricingSection() {
  const t = useTranslations("pricing");
  const [priceMode, setPriceMode] = useState("monthly");

  return (
    <section className="section" id="pricing">
      <div style={{ textAlign: "center", maxWidth: 620, margin: "0 auto" }}>
        <div className="eyebrow">{t("eyebrow")}</div>
        <h2 style={{ marginTop: 14 }}>{t("title")}</h2>
        <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.6, marginTop: 12 }}>
          {t("subtitle")}
        </p>
      </div>

      <PricingCards
        t={t}
        priceMode={priceMode}
        setPriceMode={setPriceMode}
        freeCta={
          <Link className="btn btn-secondary" style={{ width: "100%", display: "block", textAlign: "center" }} href="/register">
            {t("free.publicCta")}
          </Link>
        }
        proCta={
          <Link className="btn btn-dark" style={{ width: "100%", display: "block", textAlign: "center" }} href="/register">
            {t("pro.publicCta")}
          </Link>
        }
      />
    </section>
  );
}
