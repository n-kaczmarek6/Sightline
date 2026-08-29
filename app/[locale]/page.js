import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import IconSprite from "@/components/IconSprite";

export default async function LandingPage() {
  const t = await getTranslations("landing");

  return (
    <>
      <IconSprite />
      <div id="screen-landing">
        <nav className="landing-nav">
          <div className="landing-nav-inner">
            <div className="logo"><div className="logo-mark"></div>Sightline</div>
            <div className="landing-nav-links">
              <a href="#how">{t("nav.how")}</a>
              <a href="#trust">{t("nav.trust")}</a>
              <Link href="/app?panel=pricing">{t("nav.pricing")}</Link>
              <Link href="/blog">{t("nav.blog")}</Link>
            </div>
            <div className="landing-nav-cta">
              <Link className="btn btn-ghost btn-sm" href="/login">{t("nav.login")}</Link>
              <Link className="btn btn-primary btn-sm" href="/app?panel=analyze">{t("nav.cta")}</Link>
            </div>
          </div>
        </nav>

        <header className="hero">
          <div className="hero-badge"><span></span>{t("hero.badge")}</div>
          <h1>{t("hero.titlePre")} <span className="gradient-word">{t("hero.titleHighlight")}</span> {t("hero.titlePost")}</h1>
          <p className="hero-sub">
            {t("hero.sub")} <strong>{t("hero.subBold")}</strong>
          </p>
          <div className="hero-cta-row">
            <Link className="btn btn-primary" href="/app?panel=analyze">{t("hero.cta")}</Link>
            <a className="btn btn-secondary" href="#how">{t("hero.howItWorks")}</a>
          </div>

          <div className="hero-visual">
            <div className="hero-glow"></div>
            <div className="sticker" style={{ top: -22, left: "2%", color: "var(--success)", transform: "rotate(-6deg)" }}>
              ✓ {t("hero.atsBadge")}
            </div>
            <div
              className="sticker"
              style={{
                bottom: -20, right: "1%", color: "var(--coral)",
                fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700,
                transform: "rotate(5deg)", animationDelay: ".8s",
              }}
            >
              87<span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, color: "var(--text-faint)" }}>{t("hero.matchBadge")}</span>
            </div>
            <div className="mock-window">
              <div className="mock-titlebar">
                <div className="mock-dot" style={{ background: "var(--coral)" }}></div>
                <div className="mock-dot" style={{ background: "#F5C451" }}></div>
                <div className="mock-dot" style={{ background: "var(--accent-2)" }}></div>
              </div>
              <div className="mock-body">
                <div className="mock-pane">
                  <div className="mock-label">{t("hero.jobDescLabel")}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    <div className="mock-line" style={{ width: "92%" }}></div>
                    <div className="mock-line" style={{ width: "76%" }}></div>
                    <div className="mock-line" style={{ width: "85%" }}></div>
                    <div className="mock-line" style={{ width: "58%" }}></div>
                  </div>
                  <div className="mock-chip-row">
                    <span className="mock-chip" style={{ background: "var(--success-bg)", color: "var(--success)" }}>Product Marketing</span>
                    <span className="mock-chip" style={{ background: "var(--warning-bg)", color: "var(--warning)" }}>Go-to-Market</span>
                    <span className="mock-chip" style={{ background: "var(--error-bg)", color: "var(--error)" }}>Pricing Strategy</span>
                  </div>
                </div>
                <div className="mock-pane" style={{ background: "rgba(255,255,255,.45)" }}>
                  <div className="mock-label">{t("hero.matchLabel")}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div className="mock-score-circle"></div>
                    <div>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--ink)", fontSize: 15 }}>{t("hero.strongMatch")}</div>
                      <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 3 }}>{t("hero.strengthsGaps")}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 20 }}>
                    <div className="mock-line" style={{ width: "70%" }}></div>
                    <div className="mock-line" style={{ width: "55%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="section" id="how">
          <div className="section-head">
            <div className="eyebrow">{t("how.eyebrow")}</div>
            <h2>{t("how.title")}</h2>
            <p>{t("how.sub")}</p>
          </div>
          <div className="steps-row">
            <div className="glass step-card">
              <div className="step-icon" style={{ background: "var(--coral-bg)", color: "var(--coral)" }}>
                <svg className="icon" style={{ width: 19, height: 19 }}><use href="#i-user" /></svg>
              </div>
              <div className="step-eyebrow">01</div>
              <h4>{t("how.step1Title")}</h4>
              <p>{t("how.step1Desc")}</p>
            </div>
            <div className="glass step-card">
              <div className="step-icon" style={{ background: "var(--violet-bg)", color: "var(--violet)" }}>
                <svg className="icon" style={{ width: 19, height: 19 }}><use href="#i-briefcase" /></svg>
              </div>
              <div className="step-eyebrow">02</div>
              <h4>{t("how.step2Title")}</h4>
              <p>{t("how.step2Desc")}</p>
            </div>
            <div className="glass step-card">
              <div className="step-icon" style={{ background: "var(--success-bg)", color: "var(--success)" }}>
                <svg className="icon" style={{ width: 19, height: 19 }}><use href="#i-dashboard" /></svg>
              </div>
              <div className="step-eyebrow">03</div>
              <h4>{t("how.step3Title")}</h4>
              <p>{t("how.step3Desc")}</p>
            </div>
            <div className="glass step-card">
              <div className="step-icon" style={{ background: "var(--warning-bg)", color: "var(--warning)" }}>
                <svg className="icon" style={{ width: 19, height: 19 }}><use href="#i-edit" /></svg>
              </div>
              <div className="step-eyebrow">04</div>
              <h4>{t("how.step4Title")}</h4>
              <p>{t("how.step4Desc")}</p>
            </div>
            <div className="glass step-card">
              <div className="step-icon" style={{ background: "#E3F6FF", color: "#0891B2" }}>
                <svg className="icon" style={{ width: 19, height: 19 }}><use href="#i-checklist" /></svg>
              </div>
              <div className="step-eyebrow">05</div>
              <h4>{t("how.step5Title")}</h4>
              <p>{t("how.step5Desc")}</p>
            </div>
          </div>
        </section>

        <section className="section" id="features">
          <div className="section-head">
            <div className="eyebrow">{t("features.eyebrow")}</div>
            <h2>{t("features.title")}</h2>
            <p>{t("features.sub")}</p>
          </div>
          <div className="features-grid">
            {[
              { icon: "i-user", key: "f1" },
              { icon: "i-search", key: "f2" },
              { icon: "i-checklist", key: "f3" },
              { icon: "i-edit", key: "f4" },
              { icon: "i-docs", key: "f5" },
              { icon: "i-folder", key: "f6" },
              { icon: "i-cert", key: "f7" },
              { icon: "i-briefcase", key: "f8" },
            ].map(({ icon, key }) => (
              <div className="glass feature-card" key={key}>
                <div className="step-icon" style={{ background: "var(--success-bg)", color: "var(--success)" }}>
                  <svg className="icon" style={{ width: 18, height: 18 }}><use href={`#${icon}`} /></svg>
                </div>
                <h4>{t(`features.${key}Title`)}</h4>
                <p>{t(`features.${key}Desc`)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section" id="pricing-teaser">
          <div className="dark-band">
            <div className="dark-band-glow"></div>
            <div style={{ position: "relative" }}>
              <div className="eyebrow" style={{ color: "var(--accent-2)" }}>{t("statsBand.eyebrow")}</div>
              <h2>{t("statsBand.title")}</h2>
              <div className="stats-grid">
                <div className="stat-chip"><div className="val">92%</div><div className="lbl">{t("statsBand.cvMatch")}</div></div>
                <div className="stat-chip"><div className="val">81%</div><div className="lbl">{t("statsBand.keywordCoverage")}</div></div>
                <div className="stat-chip"><div className="val">88%</div><div className="lbl">{t("statsBand.skillsAlignment")}</div></div>
                <div className="stat-chip"><div className="val">95%</div><div className="lbl">{t("statsBand.experienceRelevance")}</div></div>
                <div className="stat-chip"><div className="val">86%</div><div className="lbl">{t("statsBand.atsReadiness")}</div></div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="trust">
          <div className="section-head">
            <div className="eyebrow">{t("trust.eyebrow")}</div>
            <h2>{t("trust.title")}</h2>
            <p>{t("trust.sub")}</p>
          </div>
          <div className="trust-strip">
            <span className="trust-chip"><svg className="icon" style={{ width: 16, height: 16, color: "#0C9077" }}><use href="#i-lock" /></svg>{t("trust.chip1")}</span>
            <span className="trust-chip"><svg className="icon" style={{ width: 16, height: 16, color: "#0C9077" }}><use href="#i-check" /></svg>{t("trust.chip2")}</span>
            <span className="trust-chip"><svg className="icon" style={{ width: 16, height: 16, color: "#0C9077" }}><use href="#i-user" /></svg>{t("trust.chip3")}</span>
            <span className="trust-chip"><svg className="icon" style={{ width: 16, height: 16, color: "#0C9077" }}><use href="#i-docs" /></svg>{t("trust.chip4")}</span>
          </div>
        </section>

        <section className="final-cta">
          <h2 style={{ fontSize: "clamp(30px,3.8vw,46px)", color: "var(--ink)" }}>{t("finalCta.title")}</h2>
          <p style={{ fontSize: 16, color: "var(--text-muted)", margin: "14px 0 26px" }}>{t("finalCta.sub")}</p>
          <Link className="btn btn-primary" href="/app?panel=analyze">{t("finalCta.cta")}</Link>
        </section>

        <footer style={{ textAlign: "center", padding: "40px 24px 56px" }}>
          <div className="logo" style={{ justifyContent: "center" }}>
            <div className="logo-mark"></div>Sightline
          </div>
          <p style={{ fontSize: 12.5, color: "var(--text-faint)", marginTop: 8 }}>{t("footer.tagline")}</p>
        </footer>
      </div>
    </>
  );
}
