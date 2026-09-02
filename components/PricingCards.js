"use client";

// Reine Darstellungskomponente für die Preis-Karten — wird sowohl auf der
// öffentlichen Landingpage (kein Login, CTAs führen zur Registrierung) als
// auch im eingeloggten PricingPanel (echte Upgrade/Downgrade-Aktionen)
// verwendet, damit beide Stellen exakt gleich aussehen und nur einmal
// gepflegt werden müssen.
export default function PricingCards({ t, priceMode, setPriceMode, freeCta, proCta }) {
  const price = priceMode === "monthly" ? t("pro.priceMonthly") : t("pro.priceSprint");
  const unit = priceMode === "monthly" ? t("pro.unitMonthly") : t("pro.unitSprint");
  const tagline = priceMode === "monthly" ? t("pro.taglineMonthly") : t("pro.taglineSprint");
  const freeIncluded = t.raw("free.included");
  const freeNotIncluded = t.raw("free.notIncluded");
  const proFeatures = t.raw("pro.features");

  return (
    <>
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
          {freeCta}
        </div>

        <div className="dark-card plan-card featured">
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div className="plan-name">{t("pro.name")}</div>
              <span className="plan-badge-pop">{t("pro.popular")}</span>
            </div>
            <div className="plan-price price-crossfade" key={`price-${priceMode}`}>{price}<span> {unit}</span></div>
            <div className="plan-tagline price-crossfade" key={`tagline-${priceMode}`}>{tagline}</div>
            <div className="plan-feature-list">
              {proFeatures.map((f) => (
                <div className="plan-feature" key={f}><svg className="icon" style={{ width: 16, height: 16 }}><use href="#i-check" /></svg><span>{f}</span></div>
              ))}
            </div>
            {proCta}
          </div>
        </div>
      </div>
      <p style={{ textAlign: "center", color: "var(--text-faint)", fontSize: 12.5, marginTop: 26 }}>
        {t("sprintNote")}
      </p>
    </>
  );
}
