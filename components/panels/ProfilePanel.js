"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useApp } from "@/context/AppContext";

const WORK_MODEL_KEYS = ["", "remote", "hybrid", "onsite"];
const COUNTRY_KEYS = [
  "", "Deutschland", "Österreich", "Schweiz", "Polen", "Niederlande", "Belgien",
  "Frankreich", "Spanien", "Italien", "Vereinigtes Königreich", "Irland", "Schweden",
  "Dänemark", "Norwegen", "Tschechien", "Portugal", "USA", "Andere",
];

function SuggestionChips({ options, current, onPick }) {
  const remaining = options.filter((o) => !current.includes(o));
  if (remaining.length === 0) return null;
  return (
    <div className="tag-row" style={{ marginTop: 8 }}>
      {remaining.map((o) => (
        <button key={o} type="button" className="tag suggestion-chip" onClick={() => onPick(o)}>
          + {o}
        </button>
      ))}
    </div>
  );
}

function completeness(profile, workExperience, skills) {
  if (!profile) return 0;
  const checks = [
    !!profile.full_name,
    !!profile.location,
    !!profile.country,
    !!profile.linkedin_url,
    !!profile.phone,
    (profile.target_roles || []).length > 0,
    (profile.target_locations || []).length > 0,
    !!profile.work_model,
    !!profile.salary_min,
    workExperience.length > 0,
    skills.length > 0,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

function ExperienceForm({ onAdd, onCancel, t }) {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [current, setCurrent] = useState(false);
  const [bulletsText, setBulletsText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !company.trim()) return;
    onAdd({
      title: title.trim(),
      company: company.trim(),
      location: location.trim(),
      start_date: startDate || null,
      end_date: current ? null : endDate || null,
      bullets: bulletsText.split("\n").map((b) => b.trim()).filter(Boolean),
    });
  };

  return (
    <form className="glass profile-section" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }} onSubmit={handleSubmit}>
      <div className="field-grid">
        <input className="profile-input" placeholder={t("experience.form.jobTitle")} value={title} onChange={(e) => setTitle(e.target.value)} required />
        <input className="profile-input" placeholder={t("experience.form.company")} value={company} onChange={(e) => setCompany(e.target.value)} required />
        <input className="profile-input" placeholder={t("experience.form.location")} value={location} onChange={(e) => setLocation(e.target.value)} />
        <input className="profile-input" type="month" placeholder={t("experience.form.start")} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input className="profile-input" type="month" placeholder={t("experience.form.end")} value={endDate} disabled={current} onChange={(e) => setEndDate(e.target.value)} />
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-muted)" }}>
          <input type="checkbox" checked={current} onChange={(e) => setCurrent(e.target.checked)} /> {t("experience.form.toToday")}
        </label>
      </div>
      <textarea
        className="cv-editable"
        style={{ width: "100%", resize: "vertical" }}
        rows={3}
        placeholder={t("experience.form.bulletsPlaceholder")}
        value={bulletsText}
        onChange={(e) => setBulletsText(e.target.value)}
      />
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn btn-primary btn-sm" type="submit">{t("experience.form.add")}</button>
        <button className="btn btn-ghost btn-sm" type="button" onClick={onCancel}>{t("experience.form.cancel")}</button>
      </div>
    </form>
  );
}

export default function ProfilePanel() {
  const {
    userEmail, profile, updateProfileField, saveProfile,
    workExperience, addWorkExperience, removeWorkExperience,
    skills, addSkill, removeSkill,
  } = useApp();
  const t = useTranslations("profile");
  const [showExpForm, setShowExpForm] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  if (!profile) {
    return (
      <div className="panel">
        <div className="panel-head"><h1>{t("title")}</h1></div>
        <p>{t("notLoaded")}</p>
      </div>
    );
  }

  const pct = completeness(profile, workExperience, skills);
  const skillSuggestions = t.raw("suggestions.skills");
  const roleSuggestions = t.raw("suggestions.roles");
  const locationSuggestions = t.raw("suggestions.locations");

  const handleSkillSubmit = (e) => {
    e.preventDefault();
    if (skillInput.trim()) {
      addSkill(skillInput);
      setSkillInput("");
    }
  };

  return (
    <div className="panel">
      <div className="panel-head panel-head-row">
        <div><h1>{t("title")}</h1><p>{t("subtitle")}</p></div>
        <button className="btn btn-primary btn-sm" onClick={saveProfile}>{t("saveChanges")}</button>
      </div>
      <div className="profile-progress">
        <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
        <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{pct}%</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="glass profile-section">
          <h4>{t("sections.personalInfo")}</h4>
          <div className="field-grid">
            <div>
              <div className="field-lbl">{t("fields.name")}</div>
              <input className="profile-input" value={profile.full_name || ""}
                onChange={(e) => updateProfileField("full_name", e.target.value)} placeholder={t("fields.namePlaceholder")} />
            </div>
            <div>
              <div className="field-lbl">{t("fields.city")}</div>
              <input className="profile-input" value={profile.location || ""}
                onChange={(e) => updateProfileField("location", e.target.value)} placeholder={t("fields.cityPlaceholder")} />
            </div>
            <div>
              <div className="field-lbl">{t("fields.country")}</div>
              <select className="profile-input" value={profile.country || ""}
                onChange={(e) => updateProfileField("country", e.target.value || null)}>
                {COUNTRY_KEYS.map((key) => (
                  <option key={key || "empty"} value={key}>{key ? t(`countries.${key}`) : t("chooseCountry")}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="field-lbl">{t("fields.linkedin")}</div>
              <input className="profile-input" value={profile.linkedin_url || ""}
                onChange={(e) => updateProfileField("linkedin_url", e.target.value)} placeholder={t("fields.linkedinPlaceholder")} />
            </div>
            <div>
              <div className="field-lbl">{t("fields.email")}</div>
              <div className="field-val">{userEmail}</div>
            </div>
            <div>
              <div className="field-lbl">{t("fields.phone")}</div>
              <input className="profile-input" value={profile.phone || ""}
                onChange={(e) => updateProfileField("phone", e.target.value)} placeholder={t("fields.phonePlaceholder")} />
            </div>
          </div>
        </div>

        <div className="glass profile-section">
          <h4>{t("sections.workExperience")}</h4>
          {workExperience.length === 0 && !showExpForm && (
            <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>{t("experience.empty")}</p>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {workExperience.map((exp, i) => (
              <div className={`exp-item${i % 2 ? " alt" : ""}`} key={exp.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div>
                    <div className="exp-title">{exp.title} — {exp.company}</div>
                    <div className="exp-meta">
                      {exp.start_date || "?"} — {exp.end_date || t("experience.toDate")}{exp.location ? ` · ${exp.location}` : ""}
                    </div>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => removeWorkExperience(exp.id)}>{t("experience.delete")}</button>
                </div>
                {exp.bullets?.length > 0 && (
                  <ul className="exp-bullets">
                    {exp.bullets.map((b, bi) => <li key={bi}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
          {showExpForm ? (
            <div style={{ marginTop: 14 }}>
              <ExperienceForm
                t={t}
                onAdd={(entry) => { addWorkExperience(entry); setShowExpForm(false); }}
                onCancel={() => setShowExpForm(false)}
              />
            </div>
          ) : (
            <button className="btn btn-secondary btn-sm" style={{ marginTop: 14 }} onClick={() => setShowExpForm(true)}>
              {t("experience.addButton")}
            </button>
          )}
        </div>

        <div className="glass profile-section">
          <h4>{t("sections.skills")}</h4>
          {skills.length === 0 && (
            <p style={{ fontSize: 13.5, color: "var(--text-muted)", marginBottom: 10 }}>{t("skillsBlock.empty")}</p>
          )}
          <div className="tag-row" style={{ marginBottom: 10 }}>
            {skills.map((s) => (
              <span className="tag" key={s.id} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                {s.name}
                <button
                  type="button"
                  onClick={() => removeSkill(s.id)}
                  aria-label={t("skillsBlock.removeAria", { name: s.name })}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)", fontSize: 13, lineHeight: 1, padding: 0 }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <form onSubmit={handleSkillSubmit} style={{ display: "flex", gap: 8, maxWidth: 320 }}>
            <input
              className="profile-input"
              style={{ flex: 1, marginTop: 0 }}
              placeholder={t("skillsBlock.addPlaceholder")}
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
            />
            <button className="btn btn-secondary btn-sm" type="submit">+</button>
          </form>
          <div className="suggestion-lbl-sm">{t("skillsBlock.suggestionsLabel")}</div>
          <SuggestionChips options={skillSuggestions} current={skills.map((s) => s.name)} onPick={addSkill} />
        </div>

        <div className="glass profile-section">
          <h4>{t("sections.careerPreferences")}</h4>
          <div className="field-grid">
            <div>
              <div className="field-lbl">{t("fields.targetRoles")}</div>
              <input className="profile-input"
                value={(profile.target_roles || []).join(", ")}
                onChange={(e) => updateProfileField("target_roles", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                placeholder={t("fields.targetRolesPlaceholder")} />
              <SuggestionChips
                options={roleSuggestions}
                current={profile.target_roles || []}
                onPick={(role) => updateProfileField("target_roles", [...(profile.target_roles || []), role])}
              />
            </div>
            <div>
              <div className="field-lbl">{t("fields.targetLocations")}</div>
              <input className="profile-input"
                value={(profile.target_locations || []).join(", ")}
                onChange={(e) => updateProfileField("target_locations", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                placeholder={t("fields.targetLocationsPlaceholder")} />
              <SuggestionChips
                options={locationSuggestions}
                current={profile.target_locations || []}
                onPick={(loc) => updateProfileField("target_locations", [...(profile.target_locations || []), loc])}
              />
            </div>
            <div>
              <div className="field-lbl">{t("fields.workModel")}</div>
              <select className="profile-input"
                value={profile.work_model || ""}
                onChange={(e) => updateProfileField("work_model", e.target.value || null)}>
                {WORK_MODEL_KEYS.map((key) => (
                  <option key={key || "empty"} value={key}>{t(`workModels.${key || "empty"}`)}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="field-lbl">{t("fields.salary")}</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input className="profile-input" type="number" style={{ marginTop: 0 }}
                  value={profile.salary_min ?? ""}
                  onChange={(e) => updateProfileField("salary_min", e.target.value ? Number(e.target.value) : null)}
                  placeholder={t("fields.salaryMin")} />
                <span style={{ color: "var(--text-faint)" }}>–</span>
                <input className="profile-input" type="number" style={{ marginTop: 0 }}
                  value={profile.salary_max ?? ""}
                  onChange={(e) => updateProfileField("salary_max", e.target.value ? Number(e.target.value) : null)}
                  placeholder={t("fields.salaryMax")} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
