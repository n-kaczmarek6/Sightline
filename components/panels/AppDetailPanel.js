"use client";
import { useApp } from "@/context/AppContext";

const STATUS_LABELS = {
  saved: "Saved", applied: "Applied", screening: "Screening",
  interview: "Interview", offer: "Offer", rejected: "Rejected",
};

function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "short" });
}

export default function AppDetailPanel() {
  const { setPanel, applications, selectedApplicationId, deleteApplication, prepShown, setPrepShown } = useApp();
  const app = applications.find((a) => a.id === selectedApplicationId);

  if (!app) {
    return (
      <div className="panel">
        <button className="btn btn-ghost btn-sm" style={{ paddingLeft: 4, marginBottom: 14 }} onClick={() => setPanel("applications")}>
          ← Zurück zu Bewerbungen
        </button>
        <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>Keine Bewerbung ausgewählt.</p>
      </div>
    );
  }

  const handleDelete = () => {
    deleteApplication(app.id);
    setPanel("applications");
  };

  return (
    <div className="panel">
      <button className="btn btn-ghost btn-sm" style={{ paddingLeft: 4, marginBottom: 14 }} onClick={() => setPanel("applications")}>
        ← Zurück zu Bewerbungen
      </button>
      <div className="panel-head panel-head-row">
        <div>
          <h1 style={{ fontSize: 30 }}>{app.role_title} — {app.company}</h1>
          <p>
            Erstellt am {formatDate(app.created_at)}
            {app.applied_at ? ` · Beworben am ${formatDate(app.applied_at)}` : ""}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {app.match_score != null && <span className="badge badge-success">Match {app.match_score}%</span>}
          <span className="badge badge-accent">{STATUS_LABELS[app.status] || app.status}</span>
        </div>
      </div>
      <div className="grid-2">
        <div className="glass" style={{ padding: 24 }}>
          <h4 style={{ fontSize: 15, color: "var(--ink)", marginBottom: 18 }}>Status</h4>
          <p style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.6 }}>
            Aktueller Status: <strong>{STATUS_LABELS[app.status] || app.status}</strong>. Zieh die Karte im
            Kanban-Board auf eine andere Spalte, um den Status zu ändern.
          </p>
          <button className="btn btn-ghost btn-sm" style={{ marginTop: 16, color: "var(--error)", paddingLeft: 0 }} onClick={handleDelete}>
            Bewerbung löschen
          </button>
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
                {["Product Launches", "SaaS Marketing", "Go-to-Market", "Cross-functional Leadership"].map((t) => (
                  <span className="tag" key={t} style={{ background: "rgba(94,234,212,.14)", borderColor: "rgba(94,234,212,.22)", color: "var(--accent-2)" }}>{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
