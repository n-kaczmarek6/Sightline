"use client";
import { useState } from "react";
import { useApp } from "@/context/AppContext";

const CATEGORIES = {
  certificate: { label: "Zertifikat", icon: "i-cert", bg: "var(--success-bg)", fg: "var(--success)" },
  review: { label: "Review", icon: "i-star", bg: "var(--warning-bg)", fg: "var(--warning)" },
  education: { label: "Ausbildungsnachweis", icon: "i-cap", bg: "var(--violet-bg)", fg: "var(--violet)" },
  other: { label: "Sonstiges", icon: "i-docs", bg: "rgba(18,51,45,.06)", fg: "var(--text-muted)" },
};

function UploadForm({ onUpload, onCancel }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("certificate");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    await onUpload({ file, title: title.trim(), category, description: description.trim() });
    setUploading(false);
  };

  return (
    <form className="glass profile-section" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }} onSubmit={handleSubmit}>
      <input type="file" required onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <div className="field-grid">
        <input className="profile-input" placeholder="Titel (optional, sonst Dateiname)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <select className="profile-input" value={category} onChange={(e) => setCategory(e.target.value)}>
          {Object.entries(CATEGORIES).map(([key, c]) => <option key={key} value={key}>{c.label}</option>)}
        </select>
      </div>
      <input className="profile-input" placeholder="Beschreibung (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn btn-primary btn-sm" type="submit" disabled={uploading}>
          {uploading ? "Wird hochgeladen…" : "Hochladen"}
        </button>
        <button className="btn btn-ghost btn-sm" type="button" onClick={onCancel} disabled={uploading}>Abbrechen</button>
      </div>
    </form>
  );
}

export default function DocumentsPanel() {
  const { isPro, documents, uploadDocument, deleteDocument, downloadDocument, FREE_DOCUMENT_LIMIT, setPanel, toast } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [used, setUsed] = useState({});

  const atLimit = !isPro && documents.length >= FREE_DOCUMENT_LIMIT;

  const useEvidence = (id) => {
    setUsed((u) => ({ ...u, [id]: true }));
    toast("Nachweis verknüpft — im CV Builder sichtbar.");
  };

  const handleAddClick = () => {
    if (atLimit) {
      toast(`Free speichert ${FREE_DOCUMENT_LIMIT} Dokumente.`);
      setPanel("pricing");
      return;
    }
    setShowForm(true);
  };

  return (
    <div className="panel">
      <div className="panel-head panel-head-row">
        <div><h1>Deine Nachweise</h1><p>Dokumente und Erfolge, die deine Erfahrung belegen.</p></div>
        <button className="btn btn-secondary btn-sm" onClick={handleAddClick}>+ Dokument hochladen</button>
      </div>

      {showForm && (
        <UploadForm
          onUpload={async (payload) => { await uploadDocument(payload); setShowForm(false); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {documents.length === 0 ? (
        <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>Noch keine Dokumente hochgeladen.</p>
      ) : (
        <div className="doc-grid">
          {documents.map((doc) => {
            const cat = CATEGORIES[doc.category] || CATEGORIES.other;
            return (
              <div className="glass doc-card" key={doc.id}>
                <div className="doc-icon" style={{ background: cat.bg, color: cat.fg }}>
                  <svg className="icon" style={{ width: 18, height: 18 }}><use href={`#${cat.icon}`} /></svg>
                </div>
                <div className="doc-title">{doc.title}</div>
                <div className="doc-desc">{doc.description || cat.label}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap", alignItems: "center" }}>
                  <button className="btn btn-ghost btn-sm" style={{ paddingLeft: 0 }} disabled={used[doc.id]} onClick={() => useEvidence(doc.id)}>
                    {used[doc.id] ? "✓ Zum CV Builder hinzugefügt" : "Als Nachweis nutzen →"}
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => downloadDocument(doc)}>Herunterladen</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => deleteDocument(doc)}>Löschen</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {atLimit && (
        <div className="note-box" style={{ marginTop: 18 }}>
          🔒 Free speichert bis zu {FREE_DOCUMENT_LIMIT} Dokumente.{" "}
          <a href="#" onClick={(e) => { e.preventDefault(); setPanel("pricing"); }}>Upgrade auf Pro</a> für unlimited Nachweis-Dokumente.
        </div>
      )}

      <div className="privacy-note" style={{ marginTop: 18 }}>
        <svg className="icon" style={{ width: 15, height: 15, color: "#0C9077" }}><use href="#i-lock" /></svg>
        Deine Dokumente sind privat und werden nur für deine Bewerbungen genutzt.
      </div>
    </div>
  );
}
