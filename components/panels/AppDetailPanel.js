"use client";
import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useApp } from "@/context/AppContext";

export default function AppDetailPanel() {
  const {
    setPanel, applications, selectedApplicationId, deleteApplication,
    documents, downloadDocument, linkDocumentToApplication, toast,
    cvVersions, setSelectedVersionId, linkCvVersionToApplication, isPro,
    jobAnalyses, viewAnalysis,
  } = useApp();
  const t = useTranslations("appDetail");
  const tStatus = useTranslations("common");
  const locale = useLocale();
  const app = applications.find((a) => a.id === selectedApplicationId);
  const [docToAttach, setDocToAttach] = useState("");
  const [cvToAttach, setCvToAttach] = useState("");
  const [prep, setPrep] = useState(null);
  const [prepLoading, setPrepLoading] = useState(false);

  useEffect(() => {
    setPrep(null);
  }, [app?.id]);

  const formatDate = (iso) => {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString(locale, { day: "2-digit", month: "short" });
  };

  if (!app) {
    return (
      <div className="panel">
        <button className="btn btn-ghost btn-sm" style={{ paddingLeft: 4, marginBottom: 14 }} onClick={() => setPanel("applications")}>
          {t("back")}
        </button>
        <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>{t("noneSelected")}</p>
      </div>
    );
  }

  const handleDelete = () => {
    deleteApplication(app.id);
    setPanel("applications");
  };

  const analysis = jobAnalyses.find((a) => a.application_id === app.id);
  const linkedDocs = documents.filter((d) => d.application_id === app.id);
  const unlinkedDocs = documents.filter((d) => d.application_id !== app.id);
  const linkedCvVersions = cvVersions.filter((v) => v.application_id === app.id);
  const unlinkedCvVersions = cvVersions.filter((v) => v.application_id !== app.id);

  const handleAttach = () => {
    if (!docToAttach) return;
    linkDocumentToApplication(docToAttach, app.id);
    setDocToAttach("");
  };

  const handleAttachCv = () => {
    if (!cvToAttach) return;
    linkCvVersionToApplication(cvToAttach, app.id);
    setCvToAttach("");
  };

  const openInBuilder = (versionId) => {
    setSelectedVersionId(versionId);
    setPanel("builder");
  };

  const handleStartPrep = async () => {
    if (!isPro) {
      setPanel("pricing");
      return;
    }
    setPrepLoading(true);
    try {
      const res = await fetch("/api/interview-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: app.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(t("prepError"));
        return;
      }
      setPrep(data);
    } catch {
      toast(t("prepError"));
    } finally {
      setPrepLoading(false);
    }
  };

  return (
    <div className="panel">
      <button className="btn btn-ghost btn-sm" style={{ paddingLeft: 4, marginBottom: 14 }} onClick={() => setPanel("applications")}>
        {t("back")}
      </button>
      <div className="panel-head panel-head-row">
        <div>
          <h1 style={{ fontSize: 30 }}>{app.role_title} — {app.company}</h1>
          <p>
            {t("createdOn", { date: formatDate(app.created_at) })}
            {app.applied_at ? t("appliedOn", { date: formatDate(app.applied_at) }) : ""}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {app.match_score != null && <span className="badge badge-success">{t("match", { score: app.match_score })}</span>}
          <span className="badge badge-accent">{tStatus(`status.${app.status}`) || app.status}</span>
        </div>
      </div>
      <div className="grid-2">
        <div className="glass" style={{ padding: 24 }}>
          <h4 style={{ fontSize: 15, color: "var(--ink)", marginBottom: 18 }}>{t("statusTitle")}</h4>
          <p style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.6 }}>
            {t("statusPrefix")} <strong>{tStatus(`status.${app.status}`)}</strong>{t("statusSuffix")}
          </p>
          <button className="btn btn-ghost btn-sm" style={{ marginTop: 16, color: "var(--error)", paddingLeft: 0 }} onClick={handleDelete}>
            {t("deleteButton")}
          </button>
        </div>
        <div className="dark-card" style={{ padding: 24 }}>
          <h4 style={{ fontSize: 15, color: "#fff", marginBottom: 8 }}>{t("interviewPrepTitle")}</h4>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.6)", lineHeight: 1.6, marginBottom: 14 }}>
            {t("interviewPrepSubtitle")}
          </p>
          {!isPro ? (
            <div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,.6)", lineHeight: 1.6, marginBottom: 14 }}>
                {t("prepUpsell")}
              </p>
              <button className="btn btn-dark btn-sm" onClick={() => setPanel("pricing")}>{t("upgradeToPro")}</button>
            </div>
          ) : !prep ? (
            <button className="btn btn-dark btn-sm" disabled={prepLoading} onClick={handleStartPrep}>
              {prepLoading ? t("preparing") : t("startPrep")}
            </button>
          ) : (
            <div>
              <div className="mono" style={{ fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "rgba(255,255,255,.45)", marginBottom: 10 }}>
                {t("likelyTopics")}
              </div>
              <div className="tag-row">
                {prep.topics.map((topic) => (
                  <span className="tag" key={topic} style={{ background: "rgba(94,234,212,.14)", borderColor: "rgba(94,234,212,.22)", color: "var(--accent-2)" }}>{topic}</span>
                ))}
              </div>
              {prep.questions?.length > 0 && (
                <>
                  <div className="mono" style={{ fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "rgba(255,255,255,.45)", marginTop: 18, marginBottom: 10 }}>
                    {t("practiceQuestions")}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {prep.questions.map((q, i) => (
                      <div key={i}>
                        <div style={{ fontSize: 13.5, color: "#fff", fontWeight: 600, lineHeight: 1.5 }}>{q.question}</div>
                        <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.6)", lineHeight: 1.5, marginTop: 4 }}>{q.tip}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="glass" style={{ padding: 24, marginTop: 16 }}>
        <h4 style={{ fontSize: 15, color: "var(--ink)", marginBottom: 14 }}>{t("analysisTitle")}</h4>
        {!analysis ? (
          <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>{t("analysisEmpty")}</p>
        ) : (
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            {analysis.match_score != null && <span className="badge badge-success">{t("match", { score: analysis.match_score })}</span>}
            <button className="btn btn-secondary btn-sm" onClick={() => viewAnalysis(app.id, "analysis")}>{t("analysisOpen")}</button>
            <button className="btn btn-ghost btn-sm" onClick={() => viewAnalysis(app.id, "keywords")}>{t("analysisKeywords")}</button>
            <button className="btn btn-ghost btn-sm" onClick={() => viewAnalysis(app.id, "recommendations")}>{t("analysisRecommendations")}</button>
          </div>
        )}
      </div>

      <div className="glass" style={{ padding: 24, marginTop: 16 }}>
        <h4 style={{ fontSize: 15, color: "var(--ink)", marginBottom: 14 }}>{t("cvTitle")}</h4>
        {linkedCvVersions.length === 0 ? (
          <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>{t("cvEmpty")}</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
            {linkedCvVersions.map((v) => (
              <div key={v.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13.5, color: "var(--text)", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: "1 1 160px" }}>{v.label}</span>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => openInBuilder(v.id)}>{t("cvOpen")}</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => linkCvVersionToApplication(v.id, null)}>{t("cvUnlink")}</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {unlinkedCvVersions.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <select className="profile-input" style={{ marginTop: 0, flex: 1, minWidth: 200 }} value={cvToAttach} onChange={(e) => setCvToAttach(e.target.value)}>
              <option value="">{t("cvAttachPlaceholder")}</option>
              {unlinkedCvVersions.map((v) => (
                <option key={v.id} value={v.id}>{v.label}</option>
              ))}
            </select>
            <button className="btn btn-secondary btn-sm" disabled={!cvToAttach} onClick={handleAttachCv}>{t("cvAttach")}</button>
          </div>
        )}
      </div>

      <div className="glass" style={{ padding: 24, marginTop: 16 }}>
        <h4 style={{ fontSize: 15, color: "var(--ink)", marginBottom: 14 }}>{t("documentsTitle")}</h4>
        {linkedDocs.length === 0 ? (
          <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>{t("documentsEmpty")}</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
            {linkedDocs.map((doc) => (
              <div key={doc.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13.5, color: "var(--text)" }}>{doc.title}</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => downloadDocument(doc)}>{t("documentsDownload")}</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => linkDocumentToApplication(doc.id, null)}>{t("documentsUnlink")}</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {unlinkedDocs.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <select className="profile-input" style={{ marginTop: 0, flex: 1, minWidth: 200 }} value={docToAttach} onChange={(e) => setDocToAttach(e.target.value)}>
              <option value="">{t("documentsAttachPlaceholder")}</option>
              {unlinkedDocs.map((doc) => (
                <option key={doc.id} value={doc.id}>{doc.title}</option>
              ))}
            </select>
            <button className="btn btn-secondary btn-sm" disabled={!docToAttach} onClick={handleAttach}>{t("documentsAttach")}</button>
          </div>
        )}
      </div>
    </div>
  );
}
