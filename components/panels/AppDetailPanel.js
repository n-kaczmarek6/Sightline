"use client";
import { useApp } from "@/context/AppContext";

export default function AppDetailPanel() {
  const { setPanel, prepShown, setPrepShown } = useApp();
  const timeline = [
    ["Job gespeichert", "18. Aug"], ["CV angepasst", "18. Aug"], ["Bewerbung eingereicht", "18. Aug"],
    ["Recruiter hat Bewerbung angesehen", "18. Aug"], ["Interview geplant", "19. Aug"],
  ];

  return (
    <div className="panel">
      <button className="btn btn-ghost btn-sm" style={{ paddingLeft: 4, marginBottom: 14 }} onClick={() => setPanel("applications")}>
        ← Zurück zu Bewerbungen
      </button>
      <div className="panel-head panel-head-row">
        <div><h1 style={{ fontSize: 30 }}>Product Marketing Manager — HubSpot</h1><p>Beworben vor 2 Tagen · CV-Version v3</p></div>
        <div style={{ display: "flex", gap: 8 }}>
          <span className="badge badge-success">Match 91%</span>
          <span className="badge badge-accent">Interview</span>
        </div>
      </div>
      <div className="grid-2">
        <div className="glass" style={{ padding: 24 }}>
          <h4 style={{ fontSize: 15, color: "var(--ink)", marginBottom: 18 }}>Timeline</h4>
          <div className="timeline">
            {timeline.map(([txt, date]) => (
              <div className="timeline-item" key={txt}>
                <div className="timeline-dot">✓</div>
                <div><div className="timeline-txt">{txt}</div><div className="timeline-sub">{date}</div></div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="glass" style={{ padding: 24 }}>
            <h4 style={{ fontSize: 15, color: "var(--ink)", marginBottom: 12 }}>Verwendete Dokumente</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
              <span className="tag">📄 CV — Product Marketing Manager v3</span>
              <span className="tag"><svg className="icon" style={{ width: 13, height: 13 }}><use href="#i-mail" /></svg> Cover Letter — HubSpot</span>
              <span className="tag"><svg className="icon" style={{ width: 13, height: 13 }}><use href="#i-link" /></svg> Portfolio</span>
            </div>
          </div>
          <div className="dark-card" style={{ padding: 24 }}>
            <h4 style={{ fontSize: 15, color: "#fff", marginBottom: 8 }}>Interview-Vorbereitung</h4>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.6)", lineHeight: 1.6, marginBottom: 14 }}>
              AI-generiert aus Job Description und deinem Profil.
            </p>
            {!prepShown ? (
              <button className="btn btn-dark btn-sm" onClick={() => setPrepShown(true)}>Vorbereitung starten</button>
            ) : (
              <div>
                <div className="mono" style={{ fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "rgba(255,255,255,.45)", marginBottom: 10 }}>
                  Wahrscheinliche Themen
                </div>
                <div className="tag-row">
                  {["Product Launches","SaaS Marketing","Go-to-Market","Cross-functional Leadership"].map((t) => (
                    <span className="tag" key={t} style={{ background: "rgba(94,234,212,.14)", borderColor: "rgba(94,234,212,.22)", color: "var(--accent-2)" }}>{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
