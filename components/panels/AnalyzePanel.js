"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useApp } from "@/context/AppContext";

export default function AnalyzePanel() {
  const { runAnalysis, analyzing, toast, workExperience, skills } = useApp();
  const t = useTranslations("analyze");
  const [jobDescription, setJobDescription] = useState("");

  const hasProfileData = workExperience.length > 0 || skills.length > 0;

  return (
    <div className="panel">
      <div className="panel-head">
        <h1>{t("title")}</h1>
        <p>{t("subtitle")}</p>
      </div>
      <div className="grid-2">
        <div className="glass" style={{ padding: 22 }}>
          <div className="tab-row">
            <span className="tab-btn active">{t("tabs.pasteText")}</span>
            <button className="tab-btn" onClick={() => toast(t("toasts.pdfUpload"))}>{t("tabs.pdf")}</button>
            <button className="tab-btn" onClick={() => toast(t("toasts.docxUpload"))}>{t("tabs.docx")}</button>
            <button className="tab-btn" onClick={() => toast(t("toasts.urlImport"))}>{t("tabs.importUrl")}</button>
          </div>
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
        </div>
      </div>
      <div style={{ marginTop: 22 }}>
        <button className="btn btn-primary" disabled={analyzing} onClick={() => runAnalysis(jobDescription)}>
          {analyzing ? t("analyzing") : t("submit")}
        </button>
      </div>
    </div>
  );
}
