"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useApp } from "@/context/AppContext";

const QUESTIONS = [
  { key: "experience", rows: 3 },
  { key: "education", rows: 2 },
  { key: "skills", rows: 2 },
  { key: "languages", rows: 2 },
  { key: "goals", rows: 2 },
];

export default function ProfileInterview({ onClose }) {
  const { profile, updateProfileField, addWorkExperience, addEducation, addSkill, toast } = useApp();
  const t = useTranslations("profile.interview");
  const [answers, setAnswers] = useState({ experience: "", education: "", skills: "", languages: "", goals: "" });
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [excludedExp, setExcludedExp] = useState(new Set());
  const [excludedEdu, setExcludedEdu] = useState(new Set());
  const [excludedSkills, setExcludedSkills] = useState(new Set());
  const [applying, setApplying] = useState(false);

  const setAnswer = (key, value) => setAnswers((a) => ({ ...a, [key]: value }));

  const hasAnyAnswer = Object.values(answers).some((v) => v.trim().length > 0);

  const handleSubmit = async () => {
    if (!hasAnyAnswer) return;
    setLoading(true);
    try {
      const res = await fetch("/api/profile/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(t("errorGeneric"));
        return;
      }
      setResult(data);
      setExcludedExp(new Set());
      setExcludedEdu(new Set());
      setExcludedSkills(new Set());
    } catch {
      toast(t("errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  const toggle = (set, setSet, key) => {
    setSet((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleApply = async () => {
    if (!result) return;
    setApplying(true);
    try {
      for (let i = 0; i < result.work_experience.length; i++) {
        if (excludedExp.has(i)) continue;
        const e = result.work_experience[i];
        await addWorkExperience({
          title: e.title,
          company: e.company,
          location: e.location || "",
          start_date: e.start_date,
          end_date: e.current ? null : e.end_date,
          bullets: e.bullets || [],
        });
      }
      for (let i = 0; i < result.education.length; i++) {
        if (excludedEdu.has(i)) continue;
        const e = result.education[i];
        await addEducation({
          degree: e.degree,
          field_of_study: e.field_of_study || "",
          institution: e.institution,
          location: e.location || "",
          start_date: e.start_date,
          end_date: e.current ? null : e.end_date,
          description: e.description || "",
        });
      }
      for (const skill of result.skills) {
        if (excludedSkills.has(skill)) continue;
        await addSkill(skill);
      }
      if (result.languages.length) {
        const merged = [...new Set([...(profile.languages || []), ...result.languages])];
        updateProfileField("languages", merged);
      }
      if (result.target_roles.length) {
        const merged = [...new Set([...(profile.target_roles || []), ...result.target_roles])];
        updateProfileField("target_roles", merged);
      }
      if (result.target_locations.length) {
        const merged = [...new Set([...(profile.target_locations || []), ...result.target_locations])];
        updateProfileField("target_locations", merged);
      }
      if (result.work_model && !profile.work_model) {
        updateProfileField("work_model", result.work_model);
      }
      toast(t("applied"));
      onClose();
    } finally {
      setApplying(false);
    }
  };

  const nothingExtracted =
    result &&
    result.work_experience.length === 0 &&
    result.education.length === 0 &&
    result.skills.length === 0 &&
    result.languages.length === 0 &&
    result.target_roles.length === 0 &&
    result.target_locations.length === 0 &&
    !result.work_model;

  if (result) {
    return (
      <div className="glass profile-section">
        <h4>{t("reviewTitle")}</h4>
        <p style={{ fontSize: 13.5, color: "var(--text-muted)", marginBottom: 14 }}>{t("reviewHint")}</p>

        {nothingExtracted && <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>{t("nothingExtracted")}</p>}

        {result.work_experience.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <div className="suggestion-lbl-sm">{t("sectionExperience")}</div>
            {result.work_experience.map((e, i) => (
              <label key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginTop: 8, cursor: "pointer" }}>
                <input type="checkbox" checked={!excludedExp.has(i)} onChange={() => toggle(excludedExp, setExcludedExp, i)} style={{ marginTop: 3 }} />
                <span>
                  <strong>{e.title}</strong> — {e.company}
                  {e.bullets?.length > 0 && (
                    <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{e.bullets.join(" · ")}</div>
                  )}
                </span>
              </label>
            ))}
          </div>
        )}

        {result.education.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <div className="suggestion-lbl-sm">{t("sectionEducation")}</div>
            {result.education.map((e, i) => (
              <label key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginTop: 8, cursor: "pointer" }}>
                <input type="checkbox" checked={!excludedEdu.has(i)} onChange={() => toggle(excludedEdu, setExcludedEdu, i)} style={{ marginTop: 3 }} />
                <span>
                  <strong>{e.degree}</strong>{e.field_of_study ? `, ${e.field_of_study}` : ""} — {e.institution}
                </span>
              </label>
            ))}
          </div>
        )}

        {result.skills.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <div className="suggestion-lbl-sm">{t("sectionSkills")}</div>
            <div className="tag-row">
              {result.skills.map((s) => {
                const excluded = excludedSkills.has(s);
                return (
                  <button
                    key={s}
                    type="button"
                    className="tag suggestion-chip"
                    style={excluded ? { opacity: 0.4, textDecoration: "line-through" } : undefined}
                    onClick={() => toggle(excludedSkills, setExcludedSkills, s)}
                  >
                    {excluded ? "+ " : "✓ "}{s}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {(result.languages.length > 0 || result.target_roles.length > 0 || result.target_locations.length > 0 || result.work_model) && (
          <div style={{ marginBottom: 18 }}>
            <div className="suggestion-lbl-sm">{t("sectionOther")}</div>
            <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>
              {[
                result.languages.length ? `${t("sectionLanguages")}: ${result.languages.join(", ")}` : null,
                result.target_roles.length ? `${t("sectionTargetRoles")}: ${result.target_roles.join(", ")}` : null,
                result.target_locations.length ? `${t("sectionTargetLocations")}: ${result.target_locations.join(", ")}` : null,
                result.work_model ? `${t("sectionWorkModel")}: ${result.work_model}` : null,
              ].filter(Boolean).join(" · ")}
            </p>
            <p style={{ fontSize: 12, color: "var(--text-faint)" }}>{t("draftHint")}</p>
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-primary btn-sm" disabled={applying || nothingExtracted} onClick={handleApply}>
            {applying ? t("applying") : t("apply")}
          </button>
          <button className="btn btn-ghost btn-sm" type="button" onClick={() => setResult(null)}>{t("back")}</button>
          <button className="btn btn-ghost btn-sm" type="button" onClick={onClose}>{t("cancel")}</button>
        </div>
      </div>
    );
  }

  const isLast = step === QUESTIONS.length - 1;
  const current = QUESTIONS[step];

  const goNext = () => {
    if (isLast) {
      handleSubmit();
      return;
    }
    setStep((s) => Math.min(QUESTIONS.length - 1, s + 1));
  };
  const goBack = () => setStep((s) => Math.max(0, s - 1));

  const qLabelKey = `q${current.key[0].toUpperCase()}${current.key.slice(1)}`;

  return (
    <div className="glass profile-section" style={{ maxWidth: 640, margin: "0 auto" }}>
      <h4>{t("title")}</h4>
      <p style={{ fontSize: 13.5, color: "var(--text-muted)", marginBottom: 14 }}>{t("hint")}</p>

      <div className="interview-rail"><div className="interview-rail-fill" style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }} /></div>

      <div key={step} className="interview-question">
        <div className="field-lbl">{t(qLabelKey)}</div>
        <textarea
          className="profile-input"
          style={{ width: "100%", resize: "vertical", marginTop: 4 }}
          rows={current.rows}
          placeholder={t(`${qLabelKey}Placeholder`)}
          value={answers[current.key]}
          onChange={(e) => setAnswer(current.key, e.target.value)}
          autoFocus
        />
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "space-between", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 8 }}>
          {step > 0 && <button className="btn btn-ghost btn-sm" type="button" onClick={goBack}>{t("back")}</button>}
          <button className="btn btn-ghost btn-sm" type="button" onClick={onClose}>{t("cancel")}</button>
        </div>
        <button className="btn btn-primary btn-sm" disabled={(isLast && !hasAnyAnswer) || loading} onClick={goNext}>
          {isLast ? (loading ? t("analyzing") : t("submit")) : t("next")}
        </button>
      </div>
    </div>
  );
}
