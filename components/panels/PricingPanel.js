"use client";
import { useApp } from "@/context/AppContext";

export default function PricingPanel() {
  const { isPro, setPlan, priceMode, setPriceMode } = useApp();
  const price = priceMode === "monthly" ? "€14" : "€19";
  const unit = priceMode === "monthly" ? "/ Monat" : "/ 14 Tage";
  const tagline = priceMode === "monthly"
    ? "Jederzeit kündbar. Für die laufende Suche."
    : "Einmaliger Pass für eine intensive Bewerbungsphase. Keine automatische Verlängerung.";

  return (
    <div className="panel">
      <div style={{ textAlign: "center", maxWidth: 620, margin: "0 auto" }}>
        <div className="eyebrow">Preise</div>
        <h1 style={{ fontSize: "clamp(28px,3.6vw,40px)", marginTop: 14, color: "var(--ink)" }}>
          Für jede Art der Jobsuche der passende Plan.
        </h1>
        <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.6, marginTop: 12 }}>
          Starte kostenlos. Wenn du mitten in einer aktiven Suche bist, wechsle zu Pro — monatlich oder als kurzer, fokussierter Sprint.
        </p>
      </div>

      <div className="pricing-toggle-wrap">
        <div className="pricing-toggle">
          <button className={priceMode === "monthly" ? "active" : ""} onClick={() => setPriceMode("monthly")}>Monatlich</button>
          <button className={priceMode === "sprint" ? "active" : ""} onClick={() => setPriceMode("sprint")}>Sprint · 14 Tage</button>
        </div>
      </div>

      <div className="plans-grid">
        <div className="glass plan-card">
          <div className="plan-name">Free</div>
          <div className="plan-price">€0</div>
          <div className="plan-tagline">Erster Match Score, ohne Karte.</div>
          <div className="plan-feature-list">
            <div className="plan-feature"><svg className="icon" style={{ width: 16, height: 16 }}><use href="#i-check" /></svg><span>3 Job-Analysen pro Monat</span></div>
            <div className="plan-feature"><svg className="icon" style={{ width: 16, height: 16 }}><use href="#i-check" /></svg><span>Match Score + Top-Stärken &amp; Lücken</span></div>
            <div className="plan-feature"><svg className="icon" style={{ width: 16, height: 16 }}><use href="#i-check" /></svg><span>1 CV-Profil</span></div>
            <div className="plan-feature"><svg className="icon" style={{ width: 16, height: 16 }}><use href="#i-check" /></svg><span>Bis zu 5 getrackte Bewerbungen</span></div>
            <div className="plan-feature dim"><svg className="icon" style={{ width: 16, height: 16 }}><use href="#i-alert" /></svg><span>Volle Keyword- &amp; Empfehlungs-Analyse</span></div>
            <div className="plan-feature dim"><svg className="icon" style={{ width: 16, height: 16 }}><use href="#i-alert" /></svg><span>CV-Downloads (PDF / DOCX)</span></div>
            <div className="plan-feature dim"><svg className="icon" style={{ width: 16, height: 16 }}><use href="#i-alert" /></svg><span>Unlimited AI Career Copilot</span></div>
          </div>
          <button className="btn btn-secondary" style={{ width: "100%" }} disabled={!isPro} onClick={() => setPlan(false)}>
            {isPro ? "Downgrade zu Free" : "Aktueller Plan"}
          </button>
        </div>

        <div className="dark-card plan-card featured">
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div className="plan-name">Pro</div>
              <span className="plan-badge-pop">Beliebt</span>
            </div>
            <div className="plan-price">{price}<span> {unit}</span></div>
            <div className="plan-tagline">{tagline}</div>
            <div className="plan-feature-list">
              <div className="plan-feature"><svg className="icon" style={{ width: 16, height: 16 }}><use href="#i-check" /></svg><span>Unlimited Job-Analysen</span></div>
              <div className="plan-feature"><svg className="icon" style={{ width: 16, height: 16 }}><use href="#i-check" /></svg><span>Volle Keyword- &amp; Empfehlungs-Analyse</span></div>
              <div className="plan-feature"><svg className="icon" style={{ width: 16, height: 16 }}><use href="#i-check" /></svg><span>Unlimited CV-Downloads &amp; Versionen</span></div>
              <div className="plan-feature"><svg className="icon" style={{ width: 16, height: 16 }}><use href="#i-check" /></svg><span>Unlimited Nachweis-Dokumente</span></div>
              <div className="plan-feature"><svg className="icon" style={{ width: 16, height: 16 }}><use href="#i-check" /></svg><span>Unlimited getrackte Bewerbungen</span></div>
              <div className="plan-feature"><svg className="icon" style={{ width: 16, height: 16 }}><use href="#i-check" /></svg><span>Unlimited AI Copilot &amp; Interview-Prep</span></div>
            </div>
            <button className="btn btn-dark" style={{ width: "100%" }} disabled={isPro} onClick={() => setPlan(true)}>
              {isPro ? "Aktueller Plan" : "Upgrade auf Pro"}
            </button>
          </div>
        </div>
      </div>
      <p style={{ textAlign: "center", color: "var(--text-faint)", fontSize: 12.5, marginTop: 26 }}>
        Sprint ist ein einmaliger 14-Tage-Pass — ideal, wenn du ein paar Wochen intensiv bewirbst. Keine automatische Verlängerung.
      </p>
    </div>
  );
}
