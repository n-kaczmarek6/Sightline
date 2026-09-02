import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import IconSprite from "@/components/IconSprite";
import PublicPricingSection from "@/components/PublicPricingSection";
import SlScene from "@/components/SlScene";
import SightlineMotion from "@/components/SightlineMotion";

const STEP_ICONS = [
  { icon: "i-user", bg: "var(--coral-bg)", fg: "var(--coral)" },
  { icon: "i-briefcase", bg: "var(--violet-bg)", fg: "var(--violet)" },
  { icon: "i-dashboard", bg: "var(--success-bg)", fg: "var(--success)" },
  { icon: "i-edit", bg: "var(--warning-bg)", fg: "var(--warning)" },
  { icon: "i-checklist", bg: "#E3F6FF", fg: "#0891B2" },
];

const FEATURES = [
  { icon: "i-user", key: "f1" },
  { icon: "i-search", key: "f2" },
  { icon: "i-checklist", key: "f3" },
  { icon: "i-edit", key: "f4" },
  { icon: "i-docs", key: "f5" },
  { icon: "i-folder", key: "f6" },
  { icon: "i-cert", key: "f7" },
  { icon: "i-briefcase", key: "f8" },
];

const STATS = ["cvMatch", "keywordCoverage", "skillsAlignment", "experienceRelevance", "atsReadiness"];
const STAT_VALUES = { cvMatch: 92, keywordCoverage: 81, skillsAlignment: 88, experienceRelevance: 95, atsReadiness: 86 };

export default async function LandingPage({ params }) {
  const { locale } = await params;
  const t = await getTranslations("landing");
  const marqueeItems = t.raw("hero.marquee");

  return (
    <>
      <IconSprite />
      <SightlineMotion />
      <div id="screen-landing">
        <nav className="landing-nav" data-scroll-nav>
          <div className="landing-nav-inner">
            <div className="logo"><div className="logo-mark"></div>Sightline</div>
            <div className="landing-nav-links">
              <a href="#how">{t("nav.how")}</a>
              <a href="#pricing">{t("nav.pricing")}</a>
              <a href="#trust">{t("nav.trust")}</a>
              <Link href="/blog">{t("nav.blog")}</Link>
            </div>
            <div className="landing-nav-cta">
              <div className="landing-locale-switch">
                <Link href="/" locale="de" className={locale === "de" ? "active" : ""}>DE</Link>
                <Link href="/" locale="en" className={locale === "en" ? "active" : ""}>EN</Link>
              </div>
              <Link className="btn btn-ghost btn-sm" href="/login">{t("nav.login")}</Link>
              <Link className="btn btn-primary btn-sm" data-magnet href="/app?panel=analyze">{t("nav.cta")}</Link>
            </div>
          </div>
        </nav>

        <header className="hero">
          <SlScene variant="hero" intensity={9} className="hero-scene" />
          <div className="hero-scrim" />

          <div className="hero-badge" data-reveal="1"><span></span>{t("hero.badge")}</div>
          <h1 data-reveal="2">{t("hero.titlePre")} <span className="gradient-word">{t("hero.titleHighlight")}</span> {t("hero.titlePost")}</h1>
          <p className="hero-sub" data-reveal="3">
            {t("hero.sub")} <strong>{t("hero.subBold")}</strong>
          </p>
          <div className="hero-cta-row" data-reveal="4">
            <Link className="btn btn-primary" data-magnet href="/app?panel=analyze">{t("hero.cta")}</Link>
            <a className="btn btn-secondary" data-magnet href="#how">{t("hero.howItWorks")}</a>
          </div>

          <div className="hero-visual tilt-perspective" data-reveal="5">
            <div className="hero-glow"></div>
            <div className="sticker" style={{ top: -22, left: "2%", color: "var(--success)", transform: "rotate(-6deg)" }}>
              ✓ {t("hero.atsBadge")}
            </div>
            <div
              className="sticker"
              style={{
                bottom: -20, right: "1%", color: "var(--coral)",
                fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700,
                transform: "rotate(5deg)", animationDelay: ".8s", animationDuration: "7.4s",
              }}
            >
              87<span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, color: "var(--text-faint)" }}>{t("hero.matchBadge")}</span>
            </div>
            <div className="mock-window" data-tilt data-tilt-strength="7">
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

          <div className="marquee" data-reveal="1">
            <div className="marquee-track">
              {[...marqueeItems, ...marqueeItems].map((item, i) => (
                <span className="marquee-item" key={i}>{item}</span>
              ))}
            </div>
          </div>
        </header>

        <section className="section" id="how">
          <div className="section-head">
            <div className="eyebrow" data-reveal="1">{t("how.eyebrow")}</div>
            <h2 data-reveal="2">{t("how.title")}</h2>
            <p data-reveal="3">{t("how.sub")}</p>
          </div>
          <div className="steps-row tilt-perspective">
            {STEP_ICONS.map(({ icon, bg, fg }, i) => (
              <div
                key={icon + i}
                className={`glass step-card${i === 4 ? " dark-card" : ""}`}
                data-reveal={String(i + 1)}
                data-tilt
                data-tilt-strength="6"
              >
                <div className="step-icon" style={{ background: bg, color: fg }}>
                  <svg className="icon" style={{ width: 19, height: 19 }}><use href={`#${icon}`} /></svg>
                </div>
                <div className="step-eyebrow">{String(i + 1).padStart(2, "0")}</div>
                <h4>{t(`how.step${i + 1}Title`)}</h4>
                <p>{t(`how.step${i + 1}Desc`)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section" id="features">
          <div className="section-head">
            <div className="eyebrow" data-reveal="1">{t("features.eyebrow")}</div>
            <h2 data-reveal="2">{t("features.title")}</h2>
            <p data-reveal="3">{t("features.sub")}</p>
          </div>
          <div className="features-grid tilt-perspective">
            {FEATURES.map(({ icon, key }, i) => (
              <div className="glass feature-card" key={key} data-reveal={String((i % 5) + 1)} data-tilt data-tilt-strength="6">
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
          <div className="dark-band" data-reveal="1">
            <div className="dark-band-glow"></div>
            <SlScene variant="orb" intensity={7} className="dark-band-scene" />
            <div style={{ position: "relative" }}>
              <div className="eyebrow" style={{ color: "var(--accent-2)" }}>{t("statsBand.eyebrow")}</div>
              <h2>{t("statsBand.title")}</h2>
              <div className="stats-grid">
                {STATS.map((key) => (
                  <div className="stat-chip" key={key}>
                    <div className="val" data-count={STAT_VALUES[key]} data-count-suffix="%">{STAT_VALUES[key]}%</div>
                    <div className="lbl">{t(`statsBand.${key}`)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <PublicPricingSection />

        <section className="section" id="trust">
          <div className="section-head">
            <div className="eyebrow" data-reveal="1">{t("trust.eyebrow")}</div>
            <h2 data-reveal="2">{t("trust.title")}</h2>
            <p data-reveal="3">{t("trust.sub")}</p>
          </div>
          <div className="trust-strip">
            <span className="trust-chip" data-reveal="1"><svg className="icon" style={{ width: 16, height: 16, color: "#0C9077" }}><use href="#i-lock" /></svg>{t("trust.chip1")}</span>
            <span className="trust-chip" data-reveal="2"><svg className="icon" style={{ width: 16, height: 16, color: "#0C9077" }}><use href="#i-check" /></svg>{t("trust.chip2")}</span>
            <span className="trust-chip" data-reveal="3"><svg className="icon" style={{ width: 16, height: 16, color: "#0C9077" }}><use href="#i-user" /></svg>{t("trust.chip3")}</span>
            <span className="trust-chip" data-reveal="4"><svg className="icon" style={{ width: 16, height: 16, color: "#0C9077" }}><use href="#i-docs" /></svg>{t("trust.chip4")}</span>
          </div>
        </section>

        <section className="final-cta">
          <SlScene variant="ribbon" intensity={8} className="final-cta-scene" />
          <div className="final-cta-scrim" />
          <h2 style={{ fontSize: "clamp(30px,3.8vw,46px)", color: "var(--ink)" }} data-reveal="1">{t("finalCta.title")}</h2>
          <p style={{ fontSize: 16, color: "var(--text-muted)", margin: "14px 0 26px" }} data-reveal="2">{t("finalCta.sub")}</p>
          <Link className="btn btn-primary" data-magnet href="/app?panel=analyze">{t("finalCta.cta")}</Link>
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
