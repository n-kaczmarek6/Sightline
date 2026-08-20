import { Link } from "@/i18n/navigation";
import IconSprite from "@/components/IconSprite";

export default function LandingPage() {
  return (
    <>
      <IconSprite />
      <div id="screen-landing">
        <nav className="landing-nav">
          <div className="landing-nav-inner">
            <div className="logo"><div className="logo-mark"></div>Sightline</div>
            <div className="landing-nav-links">
              <a href="#how">So funktioniert&apos;s</a>
              <a href="#trust">Trust &amp; Privacy</a>
              <Link href="/app?panel=pricing">Preise</Link>
            </div>
            <div className="landing-nav-cta">
              <Link className="btn btn-ghost btn-sm" href="/login">Log in</Link>
              <Link className="btn btn-primary btn-sm" href="/app?panel=analyze">CV analysieren</Link>
            </div>
          </div>
        </nav>

        <header className="hero">
          <div className="hero-badge"><span></span>AI Job Application Copilot</div>
          <h1>Schluss mit <span className="gradient-word">blind</span> bewerben.</h1>
          <p className="hero-sub">
            Match dein CV mit jedem Job, sieh was Recruiter und ATS-Systeme wirklich suchen, und
            erstelle in Minuten eine stärkere Bewerbung — ohne je eine Qualifikation zu erfinden,
            die du nicht hast. <strong>Zielsicher bewerben.</strong>
          </p>
          <div className="hero-cta-row">
            <Link className="btn btn-primary" href="/app?panel=analyze">CV analysieren</Link>
            <a className="btn btn-secondary" href="#how">So funktioniert&apos;s</a>
          </div>

          <div className="hero-visual">
            <div className="hero-glow"></div>
            <div className="sticker" style={{ top: -22, left: "2%", color: "var(--success)", transform: "rotate(-6deg)" }}>
              ✓ ATS-freundlich, immer
            </div>
            <div
              className="sticker"
              style={{
                bottom: -20, right: "1%", color: "var(--coral)",
                fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700,
                transform: "rotate(5deg)", animationDelay: ".8s",
              }}
            >
              87<span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, color: "var(--text-faint)" }}>/100 Match</span>
            </div>
            <div className="mock-window">
              <div className="mock-titlebar">
                <div className="mock-dot" style={{ background: "var(--coral)" }}></div>
                <div className="mock-dot" style={{ background: "#F5C451" }}></div>
                <div className="mock-dot" style={{ background: "var(--accent-2)" }}></div>
              </div>
              <div className="mock-body">
                <div className="mock-pane">
                  <div className="mock-label">Job Description — HubSpot</div>
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
                  <div className="mock-label">Match-Analyse</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div className="mock-score-circle"></div>
                    <div>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--ink)", fontSize: 15 }}>Starker Match</div>
                      <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 3 }}>5 Stärken · 4 Lücken gefunden</div>
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
            <div className="eyebrow">So funktioniert&apos;s</div>
            <h2>Von der Stellenanzeige zur maßgeschneiderten Bewerbung</h2>
            <p>Ein Profil, einmal aufgebaut. Sightline passt es für jede Bewerbung an.</p>
          </div>
          <div className="steps-row">
            <div className="glass step-card">
              <div className="step-icon" style={{ background: "var(--coral-bg)", color: "var(--coral)" }}>
                <svg className="icon" style={{ width: 19, height: 19 }}><use href="#i-briefcase" /></svg>
              </div>
              <div className="step-eyebrow">01</div>
              <h4>Job hinzufügen</h4>
              <p>Job Description einfügen oder hochladen.</p>
            </div>
            <div className="glass step-card">
              <div className="step-icon" style={{ background: "var(--violet-bg)", color: "var(--violet)" }}>
                <svg className="icon" style={{ width: 19, height: 19 }}><use href="#i-user" /></svg>
              </div>
              <div className="step-eyebrow">02</div>
              <h4>Profil verbinden</h4>
              <p>CV und Berufserfahrung importieren.</p>
            </div>
            <div className="glass step-card">
              <div className="step-icon" style={{ background: "var(--success-bg)", color: "var(--success)" }}>
                <svg className="icon" style={{ width: 19, height: 19 }}><use href="#i-dashboard" /></svg>
              </div>
              <div className="step-eyebrow">03</div>
              <h4>Match-Analyse erhalten</h4>
              <p>AI findet Stärken, Lücken und Keywords.</p>
            </div>
            <div className="glass step-card">
              <div className="step-icon" style={{ background: "var(--warning-bg)", color: "var(--warning)" }}>
                <svg className="icon" style={{ width: 19, height: 19 }}><use href="#i-edit" /></svg>
              </div>
              <div className="step-eyebrow">04</div>
              <h4>Bewerbung optimieren</h4>
              <p>Maßgeschneidertes, ATS-freundliches CV.</p>
            </div>
            <div className="glass step-card">
              <div className="step-icon" style={{ background: "#E3F6FF", color: "#0891B2" }}>
                <svg className="icon" style={{ width: 19, height: 19 }}><use href="#i-checklist" /></svg>
              </div>
              <div className="step-eyebrow">05</div>
              <h4>Tracking</h4>
              <p>Alle Bewerbungen an einem Ort.</p>
            </div>
          </div>
        </section>

        <section className="section" id="pricing-teaser">
          <div className="dark-band">
            <div className="dark-band-glow"></div>
            <div style={{ position: "relative" }}>
              <div className="eyebrow" style={{ color: "var(--accent-2)" }}>Nicht mehr blind bewerben</div>
              <h2>Wisse genau, wo du stehst — bevor du auf Senden klickst</h2>
              <div className="stats-grid">
                <div className="stat-chip"><div className="val">92%</div><div className="lbl">CV Match</div></div>
                <div className="stat-chip"><div className="val">81%</div><div className="lbl">Keyword Coverage</div></div>
                <div className="stat-chip"><div className="val">88%</div><div className="lbl">Skills Alignment</div></div>
                <div className="stat-chip"><div className="val">95%</div><div className="lbl">Experience Relevance</div></div>
                <div className="stat-chip"><div className="val">86%</div><div className="lbl">ATS Readiness</div></div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="trust">
          <div className="section-head">
            <div className="eyebrow">Trust &amp; Privacy</div>
            <h2>Dein Profil ist die Quelle der Wahrheit</h2>
            <p>Statt nur Keywords zu jagen, versteht Sightline deinen echten, vollständigen Werdegang — und stellt ihn nur klarer dar.</p>
          </div>
          <div className="trust-strip">
            <span className="trust-chip"><svg className="icon" style={{ width: 16, height: 16, color: "#0C9077" }}><use href="#i-lock" /></svg>Private, verschlüsselte Dokumente</span>
            <span className="trust-chip"><svg className="icon" style={{ width: 16, height: 16, color: "#0C9077" }}><use href="#i-check" /></svg>Erfindet nie Skills oder Erfahrung</span>
            <span className="trust-chip"><svg className="icon" style={{ width: 16, height: 16, color: "#0C9077" }}><use href="#i-user" /></svg>Du entscheidest über jeden Vorschlag</span>
            <span className="trust-chip"><svg className="icon" style={{ width: 16, height: 16, color: "#0C9077" }}><use href="#i-docs" /></svg>Transparent, was AI-generiert ist</span>
          </div>
        </section>

        <section className="final-cta">
          <h2 style={{ fontSize: "clamp(30px,3.8vw,46px)", color: "var(--ink)" }}>Zielsicher bewerben.</h2>
          <p style={{ fontSize: 16, color: "var(--text-muted)", margin: "14px 0 26px" }}>Dauert ein paar Minuten. Deine erste Match-Analyse ist kostenlos.</p>
          <Link className="btn btn-primary" href="/app?panel=analyze">CV analysieren</Link>
        </section>

        <footer style={{ textAlign: "center", padding: "40px 24px 56px" }}>
          <div className="logo" style={{ justifyContent: "center" }}>
            <div className="logo-mark"></div>Sightline
          </div>
          <p style={{ fontSize: 12.5, color: "var(--text-faint)", marginTop: 8 }}>Zielsicher bewerben.</p>
        </footer>
      </div>
    </>
  );
}
