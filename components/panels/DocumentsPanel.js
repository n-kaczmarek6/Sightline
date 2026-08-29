"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useApp } from "@/context/AppContext";

const CATEGORY_KEYS = ["certificate", "review", "education", "other"];
const CATEGORY_META = {
  certificate: { icon: "i-cert", bg: "var(--success-bg)", fg: "var(--success)" },
  review: { icon: "i-star", bg: "var(--warning-bg)", fg: "var(--warning)" },
  education: { icon: "i-cap", bg: "var(--violet-bg)", fg: "var(--violet)" },
  other: { icon: "i-docs", bg: "rgba(18,51,45,.06)", fg: "var(--text-muted)" },
};

function UploadForm({ onUpload, onCancel, t, applications }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("certificate");
  const [description, setDescription] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    await onUpload({ file, title: title.trim(), category, description: description.trim(), application_id: applicationId || null });
    setUploading(false);
  };

  return (
    <form className="glass profile-section" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }} onSubmit={handleSubmit}>
      <input type="file" required onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <div className="field-grid">
        <input className="profile-input" placeholder={t("form.titlePlaceholder")} value={title} onChange={(e) => setTitle(e.target.value)} />
        <select className="profile-input" value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORY_KEYS.map((key) => <option key={key} value={key}>{t(`categories.${key}`)}</option>)}
        </select>
      </div>
      <input className="profile-input" placeholder={t("form.descriptionPlaceholder")} value={description} onChange={(e) => setDescription(e.target.value)} />
      {applications.length > 0 && (
        <div>
          <div className="field-lbl">{t("form.linkLabel")}</div>
          <select className="profile-input" value={applicationId} onChange={(e) => setApplicationId(e.target.value)}>
            <option value="">{t("form.linkNone")}</option>
            {applications.map((a) => (
              <option key={a.id} value={a.id}>{a.role_title} — {a.company}</option>
            ))}
          </select>
        </div>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn btn-primary btn-sm" type="submit" disabled={uploading}>
          {uploading ? t("form.uploading") : t("form.upload")}
        </button>
        <button className="btn btn-ghost btn-sm" type="button" onClick={onCancel} disabled={uploading}>{t("form.cancel")}</button>
      </div>
    </form>
  );
}

export default function DocumentsPanel() {
  const {
    isPro, documents, uploadDocument, deleteDocument, downloadDocument, linkDocumentToApplication,
    FREE_DOCUMENT_LIMIT, applications, setPanel, toast,
  } = useApp();
  const t = useTranslations("documents");
  const [showForm, setShowForm] = useState(false);

  const atLimit = !isPro && documents.length >= FREE_DOCUMENT_LIMIT;

  const handleAddClick = () => {
    if (atLimit) {
      toast(t("limitToast", { limit: FREE_DOCUMENT_LIMIT }));
      setPanel("pricing");
      return;
    }
    setShowForm(true);
  };

  return (
    <div className="panel">
      <div className="panel-head panel-head-row">
        <div><h1>{t("title")}</h1><p>{t("subtitle")}</p></div>
        <button className="btn btn-secondary btn-sm" onClick={handleAddClick}>{t("uploadButton")}</button>
      </div>

      {showForm && (
        <UploadForm
          t={t}
          applications={applications}
          onUpload={async (payload) => { await uploadDocument(payload); setShowForm(false); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {documents.length === 0 ? (
        <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>{t("empty")}</p>
      ) : (
        <div className="doc-grid">
          {documents.map((doc) => {
            const meta = CATEGORY_META[doc.category] || CATEGORY_META.other;
            const categoryLabel = t(`categories.${CATEGORY_KEYS.includes(doc.category) ? doc.category : "other"}`);
            return (
              <div className="glass doc-card" key={doc.id}>
                <div className="doc-icon" style={{ background: meta.bg, color: meta.fg }}>
                  <svg className="icon" style={{ width: 18, height: 18 }}><use href={`#${meta.icon}`} /></svg>
                </div>
                <div className="doc-title">{doc.title}</div>
                <div className="doc-desc">{doc.description || categoryLabel}</div>
                {applications.length > 0 && (
                  <select
                    className="profile-input"
                    style={{ marginTop: 10, fontSize: 12.5, padding: "5px 8px" }}
                    value={doc.application_id || ""}
                    onChange={(e) => linkDocumentToApplication(doc.id, e.target.value || null)}
                  >
                    <option value="">{t("form.linkNone")}</option>
                    {applications.map((a) => (
                      <option key={a.id} value={a.id}>{a.role_title} — {a.company}</option>
                    ))}
                  </select>
                )}
                <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap", alignItems: "center" }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => downloadDocument(doc)}>{t("download")}</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => deleteDocument(doc)}>{t("delete")}</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {atLimit && (
        <div className="note-box" style={{ marginTop: 18 }}>
          🔒 {t("limitNote", { limit: FREE_DOCUMENT_LIMIT })}{" "}
          <a href="#" onClick={(e) => { e.preventDefault(); setPanel("pricing"); }}>{t("limitNoteLink")}</a> {t("limitNoteSuffix")}
        </div>
      )}

      <div className="privacy-note" style={{ marginTop: 18 }}>
        <svg className="icon" style={{ width: 15, height: 15, color: "#0C9077" }}><use href="#i-lock" /></svg>
        {t("privacyNote")}
      </div>
    </div>
  );
}
