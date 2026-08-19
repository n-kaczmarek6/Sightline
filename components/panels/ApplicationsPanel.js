"use client";
import { useState } from "react";
import { useApp } from "@/context/AppContext";

const COLUMNS = [
  ["saved", "Saved"], ["applied", "Applied"], ["screening", "Screening"],
  ["interview", "Interview"], ["offer", "Offer"], ["rejected", "Rejected"],
];

export default function ApplicationsPanel() {
  const { isPro, setPanel, kanban, moveCard } = useApp();
  const [dragInfo, setDragInfo] = useState(null); // { cardId, fromCol }
  const [dragOverCol, setDragOverCol] = useState(null);

  return (
    <div className="panel">
      <div className="panel-head"><h1>Meine Bewerbungen</h1><p>Karte ziehen, um den Status zu ändern.</p></div>

      {!isPro && (
        <div className="glass usage-banner coral">
          <div className="usage-track">
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>Free Plan: bis zu 5 aktive Bewerbungen</div>
            <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 3 }}>Du trackst gerade 8 — Pro hebt das Limit auf.</div>
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
              if (dragInfo) {
                moveCard(dragInfo.cardId, dragInfo.fromCol, key);
                setDragInfo(null);
              }
            }}
          >
            <div className="kanban-col-head">
              {label} <span className="kanban-count">{kanban[key].length}</span>
            </div>
            {kanban[key].map((card) => (
              <div
                key={card.id}
                className="kanban-card"
                draggable
                onDragStart={() => setDragInfo({ cardId: card.id, fromCol: key })}
                onClick={() => key === "interview" && setPanel("appdetail")}
              >
                <div className="co">{card.co}</div>
                <div className="role">{card.role}</div>
                <div className="match">Match {card.match}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
