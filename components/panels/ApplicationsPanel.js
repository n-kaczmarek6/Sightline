"use client";
import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";

const COLUMNS = [
  ["saved", "Saved"], ["applied", "Applied"], ["screening", "Screening"],
  ["interview", "Interview"], ["offer", "Offer"], ["rejected", "Rejected"],
];

function AddForm({ onAdd, onCancel }) {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [match, setMatch] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!company.trim() || !role.trim()) return;
    onAdd({ company: company.trim(), role_title: role.trim(), match_score: match ? Number(match) : null });
  };

  return (
    <form className="glass profile-section" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }} onSubmit={handleSubmit}>
      <div className="field-grid">
        <input className="profile-input" placeholder="Unternehmen" value={company} onChange={(e) => setCompany(e.target.value)} required />
        <input className="profile-input" placeholder="Rolle" value={role} onChange={(e) => setRole(e.target.value)} required />
        <input className="profile-input" type="number" min="0" max="100" placeholder="Match % (optional)" value={match} onChange={(e) => setMatch(e.target.value)} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn btn-primary btn-sm" type="submit">Hinzufügen</button>
        <button className="btn btn-ghost btn-sm" type="button" onClick={onCancel}>Abbrechen</button>
      </div>
    </form>
  );
}

export default function ApplicationsPanel() {
  const {
    isPro, setPanel, toast,
    applications, addApplication, updateApplicationStatus, FREE_APPLICATION_LIMIT,
    setSelectedApplicationId,
  } = useApp();
  const [dragInfo, setDragInfo] = useState(null); // { cardId, fromCol }
  const [dragOverCol, setDragOverCol] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const columns = useMemo(() => {
    const grouped = Object.fromEntries(COLUMNS.map(([key]) => [key, []]));
    for (const app of applications) {
      (grouped[app.status] || grouped.saved).push(app);
    }
    return grouped;
  }, [applications]);

  const atLimit = !isPro && applications.length >= FREE_APPLICATION_LIMIT;

  const handleAddClick = () => {
    if (atLimit) {
      toast(`Free trackt bis zu ${FREE_APPLICATION_LIMIT} Bewerbungen.`);
      setPanel("pricing");
      return;
    }
    setShowAdd(true);
  };

  const openDetail = (id) => {
    setSelectedApplicationId(id);
    setPanel("appdetail");
  };

  return (
    <div className="panel">
      <div className="panel-head panel-head-row">
        <div><h1>Meine Bewerbungen</h1><p>Karte ziehen, um den Status zu ändern.</p></div>
        <button className="btn btn-primary btn-sm" onClick={handleAddClick}>+ Bewerbung hinzufügen</button>
      </div>

      {showAdd && (
        <AddForm
          onAdd={async (payload) => { await addApplication(payload); setShowAdd(false); }}
          onCancel={() => setShowAdd(false)}
        />
      )}

      {!isPro && (
        <div className="glass usage-banner coral">
          <div className="usage-track">
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>Free Plan: bis zu {FREE_APPLICATION_LIMIT} aktive Bewerbungen</div>
            <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 3 }}>Du trackst gerade {applications.length} — Pro hebt das Limit auf.</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setPanel("pricing")}>Unlimited freischalten</button>
        </div>
      )}

      <div className="kanban">
        {COLUMNS.map(([key, label]) => (
          <div
            key={key}
            className={`kanban-col${dragOverCol === key ? " dragover" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragOverCol(key); }}
            onDragLeave={() => setDragOverCol((c) => (c === key ? null : c))}
            onDrop={(e) => {
              e.preventDefault();
              setDragOverCol(null);
              if (dragInfo && dragInfo.fromCol !== key) {
                updateApplicationStatus(dragInfo.cardId, key);
              }
              setDragInfo(null);
            }}
          >
            <div className="kanban-col-head">
              {label} <span className="kanban-count">{columns[key].length}</span>
            </div>
            {columns[key].map((app) => (
              <div
                key={app.id}
                className="kanban-card"
                draggable
                onDragStart={() => setDragInfo({ cardId: app.id, fromCol: key })}
                onClick={() => openDetail(app.id)}
              >
                <div className="co">{app.company}</div>
                <div className="role">{app.role_title}</div>
                <div className="match">{app.match_score != null ? `Match ${app.match_score}%` : "Kein Match-Score"}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
