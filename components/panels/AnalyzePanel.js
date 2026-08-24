"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useApp } from "@/context/AppContext";

export default function AnalyzePanel() {
  const { runAnalysis, analyzing, toast, workExperience, skills } = useApp();
  const t = useTranslations("analyze");
  const [jobDescription, setJobDescription] = useState("");
  const [cvFile, setCvFile] = useState(null);
  const [jobInputMode, setJobInputMode] = useState("text");
  const [importUrl, setImportUrl] = useState("");
  const [extracting, setExtracting] = useState(false);

  const hasProfileData = workExperience.length > 0 || skills.length > 0;

  const extractErrorToast = (data) => {
    if (data?.error === "unsupported_content_type") return t("toasts.urlNotHtml");
    if (data?.error === "extraction_empty") return t("toasts.extractEmpty");
    if (data?.error === "fetch_failed" || data?.error === "blocked_host" || data?.error === "invalid_url" || data?.error === "invalid_protocol") {
      return t("toasts.urlImportFailed");
    }
    return t("toasts.extractFailed");
  };

  const handleExtractFile = async (file, mode) => {
    if (!file) return;
    setExtracting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/extract-text", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        toast(extractErrorToast(data));
        return;
      }
      setJobDescription(data.text);
      setJobInputMode("text");
      toast(t("toasts.fileExtracted"));
    } catch {
      toast(t("toasts.extractFailed"));
    } finally {
      setExtracting(false);
    }
  };

  const handleImportUrl = async () => {
    if (!importUrl.trim()) return;
    setExtracting(true);
    try {
      const res = await fetch("/api/extract-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: importUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(extractErrorToast(data));
        return;
      }
      setJobDescription(data.text);
      setJobInputMode("text");
      toast(t("toasts.urlImported"));
    } catch {
      toast(t("toasts.urlImportFailed"));
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="panel">
      <div className="panel-head">
        <h1>{t("title")}</h1>
        <p>{t("subtitle")}</p>
      </div>
      <div className="grid-2">
        <div className="glass" style={{ padding: 22 }}>
          <div className="tab-row">
            <button className={`tab-btn ${jobInputMode === "text" ? "active" : ""}`} onClick={() => setJobInputMode("text")}>{t("tabs.pasteText")}</button>
            <button className={`tab-btn ${jobInputMode === "pdf" ? "active" : ""}`} onClick={() => setJobInputMode("pdf")}>{t("tabs.pdf")}</button>
            <button className={`tab-btn ${jobInputMode === "docx" ? "active" : ""}`} onClick={() => setJobInputMode("docx")}>{t("tabs.docx")}</button>
            <button className={`tab-btn ${jobInputMode === "url" ? "active" : ""}`} onClick={() => setJobInputMode("url")}>{t("tabs.importUrl")}</button>
          </div>

          {(jobInputMode === "pdf" || jobInputMode === "docx") && (
            <div style={{ marginBottom: 14 }}>
              <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer", margin: 0 }}>
                {extracting ? t("cvUpload.extracting") : t("cvUpload.chooseFile")}
                <input
                  type="file"
                  accept={jobInputMode === "pdf" ? ".pdf" : ".docx"}
                  style={{ display: "none" }}
                  disabled={extracting}
                  onChange={(e) => handleExtractFile(e.target.files?.[0], jobInputMode)}
                />
              </label>
            </div>
          )}

          {jobInputMode === "url" && (
            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              <input
                className="profile-input"
                style={{ marginTop: 0, flex: 1, minWidth: 220 }}
                placeholder={t("cvUpload.urlPlaceholder")}
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
              />
              <button className="btn btn-secondary btn-sm" disabled={extracting || !importUrl.trim()} onClick={handleImportUrl}>
                {extracting ? t("cvUpload.extracting") : t("cvUpload.importButton")}
              </button>
            </div>
          )}

          <div className="mock-label">{t("jobDescriptionLabel")}</div>
          <textarea
            className="input-area"
            placeholder={t("jobDescriptionPlaceholder")}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>
        <div className="glass" style={{ padding: 22 }}>
          <div className="tab-row">
            <span className="tab-btn active">{t("tabs.myProfile")}</span>
          </div>
          <div className="mock-label">{t("yourProfileLabel")}</div>
          <div className="upload-box">
            <div style={{ fontSize: 30 }}>👤</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>
                {hasProfileData ? t("profileReady") : t("profileEmpty")}
              </div>
              <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 3 }}>
                {t("experienceCount", { count: workExperience.length })} · {t("skillCount", { count: skills.length })}
              </div>
            </div>
          </div>
          <div className="privacy-note">
            <svg className="icon" style={{ width: 15, height: 15, color: "#0C9077" }}><use href="#i-lock" /></svg>
            {t("privacyNote")}
          </div>
          {!hasProfileData && (
            <div className="note-box" style={{ marginTop: 14 }}>
              💡 {t("emptyProfileWarningPre")}{" "}
              <a href="#" onClick={(e) => { e.preventDefault(); toast(t("toasts.openProfile")); }}>{t("profileLinkText")}</a>{" "}
              {t("emptyProfileWarningPost")}
            </div>
          )}
          <div className="profile-section" style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(18,51,45,.08)" }}>
            <div className="mock-label" style={{ marginBottom: 4 }}>{t("cvUpload.label")}</div>
            <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginBottom: 10 }}>{t("cvUpload.hint")}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer", margin: 0 }}>
                {t("cvUpload.chooseFile")}
                <input
                  type="file"
                  accept=".pdf,.docx"
                  style={{ display: "none" }}
                  onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                />
              </label>
              {cvFile && (
                <>
                  <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{t("cvUpload.selected", { name: cvFile.name })}</span>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setCvFile(null)}>{t("cvUpload.remove")}</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 22 }}>
        <button className="btn btn-primary" disabled={analyzing} onClick={() => runAnalysis(jobDescription, cvFile)}>
          {analyzing ? t("analyzing") : t("submit")}
        </button>
      </div>
    </div>
  );
}
