"use client";
import { useState, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useApp } from "@/context/AppContext";
import { createClient } from "@/lib/supabase/client";
import ProfileInterview from "@/components/panels/ProfileInterview";
import AvatarCropModal, { AVATAR_OUTPUT_WIDTH, AVATAR_OUTPUT_HEIGHT } from "@/components/AvatarCropModal";

const AVATAR_PREVIEW_W = 72;
const AVATAR_PREVIEW_H = Math.round((AVATAR_PREVIEW_W / AVATAR_OUTPUT_WIDTH) * AVATAR_OUTPUT_HEIGHT);

const WORK_MODEL_KEYS = ["", "remote", "hybrid", "onsite"];
const COUNTRY_KEYS = [
  "", "Deutschland", "Österreich", "Schweiz", "Polen", "Niederlande", "Belgien",
  "Frankreich", "Spanien", "Italien", "Vereinigtes Königreich", "Irland", "Schweden",
  "Dänemark", "Norwegen", "Tschechien", "Portugal", "USA", "Andere",
];

// <input type="month"> yields "YYYY-MM", but the DB column is a full date.
function monthInputToDate(value) {
  return value ? `${value}-01` : null;
}

function formatMonthYear(isoDate, locale) {
  if (!isoDate) return null;
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString(locale, { year: "numeric", month: "short" });
}

function useOutsideClose(onClose) {
  const ref = useRef(null);
  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose]);
  return ref;
}

// Single-value input with a searchable dropdown (e.g. job title, city).
// Free text stays allowed — the dropdown is a shortcut, not a closed list.
function ComboboxInput({ value, onChange, options, placeholder, required }) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const ref = useOutsideClose(() => setOpen(false));

  const filtered = (value.trim()
    ? options.filter((o) => o.toLowerCase().includes(value.trim().toLowerCase()))
    : options
  ).slice(0, 8);

  const pick = (val) => {
    onChange(val);
    setOpen(false);
  };

  return (
    <div className="combobox" ref={ref}>
      <input
        className="profile-input"
        placeholder={placeholder}
        value={value}
        required={required}
        onChange={(e) => { onChange(e.target.value); setOpen(true); setHighlighted(0); }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setHighlighted((h) => Math.min(h + 1, filtered.length - 1)); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setHighlighted((h) => Math.max(h - 1, 0)); }
          else if (e.key === "Enter" && open && filtered[highlighted]) { e.preventDefault(); pick(filtered[highlighted]); }
          else if (e.key === "Escape") setOpen(false);
        }}
      />
      {open && filtered.length > 0 && (
        <div className="combobox-dropdown">
          {filtered.map((opt, i) => (
            <button type="button" key={opt} className={`combobox-option${i === highlighted ? " active" : ""}`}
              onClick={() => pick(opt)} onMouseEnter={() => setHighlighted(i)}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Multi-value field: existing picks show as removable pills, plus a search
// input with a dropdown for adding more (from the list or free text).
function TagMultiSelect({ values, options, placeholder, onAdd, onRemove, removeAriaLabel }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const ref = useOutsideClose(() => setOpen(false));

  const filtered = (query.trim()
    ? options.filter((o) => o.toLowerCase().includes(query.trim().toLowerCase()))
    : options
  ).filter((o) => !values.includes(o)).slice(0, 8);

  const pick = (val) => {
    const trimmed = val.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setQuery("");
    setOpen(false);
    setHighlighted(0);
  };

  return (
    <div>
      {values.length > 0 && (
        <div className="tag-row" style={{ marginBottom: 8 }}>
          {values.map((v) => (
            <span className="tag" key={v} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              {v}
              <button
                type="button"
                onClick={() => onRemove(v)}
                aria-label={removeAriaLabel ? removeAriaLabel(v) : v}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)", fontSize: 13, lineHeight: 1, padding: 0 }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="combobox" ref={ref}>
        <input
          className="profile-input"
          style={{ marginTop: 0 }}
          placeholder={placeholder}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setHighlighted(0); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setHighlighted((h) => Math.min(h + 1, filtered.length - 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setHighlighted((h) => Math.max(h - 1, 0)); }
            else if (e.key === "Enter") { e.preventDefault(); if (open && filtered[highlighted]) pick(filtered[highlighted]); else pick(query); }
            else if (e.key === "Escape") setOpen(false);
          }}
        />
        {open && filtered.length > 0 && (
          <div className="combobox-dropdown">
            {filtered.map((opt, i) => (
              <button type="button" key={opt} className={`combobox-option${i === highlighted ? " active" : ""}`}
                onClick={() => pick(opt)} onMouseEnter={() => setHighlighted(i)}>
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

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

function completeness(profile, workExperience, education, skills) {
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
    education.length > 0,
    skills.length > 0,
    (profile.languages || []).length > 0,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

function ExperienceForm({ onAdd, onCancel, t, roleOptions, locationOptions }) {
  const { addSkill, skills, toast } = useApp();
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [current, setCurrent] = useState(false);
  const [bulletsText, setBulletsText] = useState("");
  const [suggesting, setSuggesting] = useState(false);
  const [suggestedSkills, setSuggestedSkills] = useState([]);

  const handleSuggestSkills = async () => {
    if (!bulletsText.trim()) return;
    setSuggesting(true);
    setSuggestedSkills([]);
    try {
      const res = await fetch("/api/skills/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: bulletsText }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(t("experience.form.suggestSkillsError"));
        return;
      }
      setSuggestedSkills(data.skills || []);
    } catch {
      toast(t("experience.form.suggestSkillsError"));
    } finally {
      setSuggesting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !company.trim()) return;
    onAdd({
      title: title.trim(),
      company: company.trim(),
      location: location.trim(),
      start_date: monthInputToDate(startDate),
      end_date: current ? null : monthInputToDate(endDate),
      bullets: bulletsText.split("\n").map((b) => b.trim()).filter(Boolean),
    });
  };

  return (
    <form className="glass profile-section" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }} onSubmit={handleSubmit}>
      <div className="field-grid">
        <ComboboxInput value={title} onChange={setTitle} options={roleOptions} placeholder={t("experience.form.jobTitle")} required />
        <input className="profile-input" placeholder={t("experience.form.company")} value={company} onChange={(e) => setCompany(e.target.value)} required />
        <ComboboxInput value={location} onChange={setLocation} options={locationOptions} placeholder={t("experience.form.location")} />
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
      <div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          disabled={!bulletsText.trim() || suggesting}
          onClick={handleSuggestSkills}
        >
          {suggesting ? t("experience.form.suggestingSkills") : t("experience.form.suggestSkills")}
        </button>
        {suggestedSkills.length > 0 && (
          <>
            <div className="suggestion-lbl-sm">{t("experience.form.suggestedSkillsLabel")}</div>
            <div className="tag-row">
              {suggestedSkills.map((s) => {
                const alreadyAdded = skills.some((sk) => sk.name === s);
                return (
                  <button
                    key={s}
                    type="button"
                    className="tag suggestion-chip"
                    disabled={alreadyAdded}
                    onClick={() => { addSkill(s); setSuggestedSkills((prev) => prev.filter((x) => x !== s)); }}
                  >
                    {alreadyAdded ? "✓ " : "+ "}{s}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn btn-primary btn-sm" type="submit">{t("experience.form.add")}</button>
        <button className="btn btn-ghost btn-sm" type="button" onClick={onCancel}>{t("experience.form.cancel")}</button>
      </div>
    </form>
  );
}

function EducationForm({ onAdd, onCancel, t }) {
  const { addSkill, skills, toast } = useApp();
  const [degree, setDegree] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [institution, setInstitution] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [current, setCurrent] = useState(false);
  const [description, setDescription] = useState("");
  const [suggesting, setSuggesting] = useState(false);
  const [suggestedSkills, setSuggestedSkills] = useState([]);

  const handleSuggestSkills = async () => {
    if (!description.trim()) return;
    setSuggesting(true);
    setSuggestedSkills([]);
    try {
      const res = await fetch("/api/skills/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(t("education.form.suggestSkillsError"));
        return;
      }
      setSuggestedSkills(data.skills || []);
    } catch {
      toast(t("education.form.suggestSkillsError"));
    } finally {
      setSuggesting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!degree.trim() || !institution.trim()) return;
    onAdd({
      degree: degree.trim(),
      field_of_study: fieldOfStudy.trim(),
      institution: institution.trim(),
      location: location.trim(),
      start_date: monthInputToDate(startDate),
      end_date: current ? null : monthInputToDate(endDate),
      description: description.trim(),
    });
  };

  return (
    <form className="glass profile-section" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }} onSubmit={handleSubmit}>
      <div className="field-grid">
        <input className="profile-input" placeholder={t("education.form.degree")} value={degree} onChange={(e) => setDegree(e.target.value)} required />
        <input className="profile-input" placeholder={t("education.form.fieldOfStudy")} value={fieldOfStudy} onChange={(e) => setFieldOfStudy(e.target.value)} />
        <input className="profile-input" placeholder={t("education.form.institution")} value={institution} onChange={(e) => setInstitution(e.target.value)} required />
        <input className="profile-input" placeholder={t("education.form.location")} value={location} onChange={(e) => setLocation(e.target.value)} />
        <input className="profile-input" type="month" placeholder={t("education.form.start")} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input className="profile-input" type="month" placeholder={t("education.form.end")} value={endDate} disabled={current} onChange={(e) => setEndDate(e.target.value)} />
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-muted)" }}>
          <input type="checkbox" checked={current} onChange={(e) => setCurrent(e.target.checked)} /> {t("education.form.toToday")}
        </label>
      </div>
      <textarea
        className="cv-editable"
        style={{ width: "100%", resize: "vertical" }}
        rows={3}
        placeholder={t("education.form.descriptionPlaceholder")}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          disabled={!description.trim() || suggesting}
          onClick={handleSuggestSkills}
        >
          {suggesting ? t("education.form.suggestingSkills") : t("education.form.suggestSkills")}
        </button>
        {suggestedSkills.length > 0 && (
          <>
            <div className="suggestion-lbl-sm">{t("education.form.suggestedSkillsLabel")}</div>
            <div className="tag-row">
              {suggestedSkills.map((s) => {
                const alreadyAdded = skills.some((sk) => sk.name === s);
                return (
                  <button
                    key={s}
                    type="button"
                    className="tag suggestion-chip"
                    disabled={alreadyAdded}
                    onClick={() => { addSkill(s); setSuggestedSkills((prev) => prev.filter((x) => x !== s)); }}
                  >
                    {alreadyAdded ? "✓ " : "+ "}{s}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn btn-primary btn-sm" type="submit">{t("education.form.add")}</button>
        <button className="btn btn-ghost btn-sm" type="button" onClick={onCancel}>{t("education.form.cancel")}</button>
      </div>
    </form>
  );
}

export default function ProfilePanel() {
  const {
    userEmail, profile, updateProfileField, saveProfile, uploadAvatar, removeAvatar,
    workExperience, addWorkExperience, removeWorkExperience,
    education, addEducation, removeEducation,
    skills, addSkill, removeSkill,
  } = useApp();
  const t = useTranslations("profile");
  const locale = useLocale();
  const [showExpForm, setShowExpForm] = useState(false);
  const [showEduForm, setShowEduForm] = useState(false);
  const [showInterview, setShowInterview] = useState(false);
  const [avatarSignedUrl, setAvatarSignedUrl] = useState(null);
  const [cropFile, setCropFile] = useState(null);

  useEffect(() => {
    if (!profile?.avatar_url) {
      setAvatarSignedUrl(null);
      return;
    }
    let cancelled = false;
    const supabase = createClient();
    supabase.storage
      .from("documents")
      .createSignedUrl(profile.avatar_url, 3600)
      .then(({ data }) => {
        if (!cancelled) setAvatarSignedUrl(data?.signedUrl || null);
      });
    return () => {
      cancelled = true;
    };
  }, [profile?.avatar_url]);

  if (!profile) {
    return (
      <div className="panel">
        <div className="panel-head"><h1>{t("title")}</h1></div>
        <p>{t("notLoaded")}</p>
      </div>
    );
  }

  const pct = completeness(profile, workExperience, education, skills);
  const skillSuggestions = t.raw("suggestions.skills");
  const roleSuggestions = t.raw("suggestions.roles");
  const locationSuggestions = t.raw("suggestions.locations");
  const allSkills = t.raw("suggestions.allSkills");
  const allRoles = t.raw("suggestions.allRoles");
  const allLocations = t.raw("suggestions.allLocations");
  const allLanguages = t.raw("suggestions.languages");

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

      {!showInterview && (
        <div className="note-box" style={{ marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span>💡 {t("interview.banner")}</span>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowInterview(true)}>{t("interview.start")}</button>
        </div>
      )}

      {showInterview ? (
        <ProfileInterview onClose={() => setShowInterview(false)} />
      ) : (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="glass profile-section">
          <h4>{t("sections.personalInfo")}</h4>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
            {avatarSignedUrl ? (
              <img
                src={avatarSignedUrl}
                alt=""
                style={{ width: AVATAR_PREVIEW_W, height: AVATAR_PREVIEW_H, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
              />
            ) : (
              <div
                style={{
                  width: AVATAR_PREVIEW_W, height: AVATAR_PREVIEW_H, borderRadius: "50%", flexShrink: 0,
                  background: "rgba(18,51,45,.06)", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 26,
                }}
              >
                👤
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer", margin: 0 }}>
                  {profile.avatar_url ? t("avatar.change") : t("avatar.upload")}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setCropFile(file);
                      e.target.value = "";
                    }}
                  />
                </label>
                {profile.avatar_url && (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={removeAvatar}>{t("avatar.remove")}</button>
                )}
              </div>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>{t("avatar.hint")}</p>
            </div>
          </div>
          <div className="field-grid">
            <div>
              <div className="field-lbl">{t("fields.name")}</div>
              <input className="profile-input" value={profile.full_name || ""}
                onChange={(e) => updateProfileField("full_name", e.target.value)} placeholder={t("fields.namePlaceholder")} />
            </div>
            <div>
              <div className="field-lbl">{t("fields.city")}</div>
              <ComboboxInput
                value={profile.location || ""}
                onChange={(v) => updateProfileField("location", v)}
                options={allLocations}
                placeholder={t("fields.cityPlaceholder")}
              />
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
                      {formatMonthYear(exp.start_date, locale) || "?"} — {formatMonthYear(exp.end_date, locale) || t("experience.toDate")}{exp.location ? ` · ${exp.location}` : ""}
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
                roleOptions={allRoles}
                locationOptions={allLocations}
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
          <h4>{t("sections.education")}</h4>
          {education.length === 0 && !showEduForm && (
            <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>{t("education.empty")}</p>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {education.map((edu, i) => (
              <div className={`exp-item${i % 2 ? " alt" : ""}`} key={edu.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div>
                    <div className="exp-title">{edu.degree}{edu.field_of_study ? `, ${edu.field_of_study}` : ""} — {edu.institution}</div>
                    <div className="exp-meta">
                      {formatMonthYear(edu.start_date, locale) || "?"} — {formatMonthYear(edu.end_date, locale) || t("education.toDate")}{edu.location ? ` · ${edu.location}` : ""}
                    </div>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => removeEducation(edu.id)}>{t("education.delete")}</button>
                </div>
                {edu.description && (
                  <ul className="exp-bullets">
                    <li>{edu.description}</li>
                  </ul>
                )}
              </div>
            ))}
          </div>
          {showEduForm ? (
            <div style={{ marginTop: 14 }}>
              <EducationForm
                t={t}
                onAdd={(entry) => { addEducation(entry); setShowEduForm(false); }}
                onCancel={() => setShowEduForm(false)}
              />
            </div>
          ) : (
            <button className="btn btn-secondary btn-sm" style={{ marginTop: 14 }} onClick={() => setShowEduForm(true)}>
              {t("education.addButton")}
            </button>
          )}
        </div>

        <div className="glass profile-section">
          <h4>{t("sections.skills")}</h4>
          {skills.length === 0 && (
            <p style={{ fontSize: 13.5, color: "var(--text-muted)", marginBottom: 10 }}>{t("skillsBlock.empty")}</p>
          )}
          <div style={{ maxWidth: 420 }}>
            <TagMultiSelect
              values={skills.map((s) => s.name)}
              options={allSkills}
              placeholder={t("skillsBlock.addPlaceholder")}
              onAdd={addSkill}
              onRemove={(name) => removeSkill(skills.find((s) => s.name === name)?.id)}
              removeAriaLabel={(name) => t("skillsBlock.removeAria", { name })}
            />
          </div>
          <div className="suggestion-lbl-sm">{t("skillsBlock.suggestionsLabel")}</div>
          <SuggestionChips options={skillSuggestions} current={skills.map((s) => s.name)} onPick={addSkill} />
        </div>

        <div className="glass profile-section">
          <h4>{t("sections.languages")}</h4>
          {(profile.languages || []).length === 0 && (
            <p style={{ fontSize: 13.5, color: "var(--text-muted)", marginBottom: 10 }}>{t("languagesBlock.empty")}</p>
          )}
          <div style={{ maxWidth: 420 }}>
            <TagMultiSelect
              values={profile.languages || []}
              options={allLanguages}
              placeholder={t("languagesBlock.addPlaceholder")}
              onAdd={(lang) => updateProfileField("languages", [...(profile.languages || []), lang])}
              onRemove={(lang) => updateProfileField("languages", (profile.languages || []).filter((l) => l !== lang))}
              removeAriaLabel={(name) => t("languagesBlock.removeAria", { name })}
            />
          </div>
        </div>

        <div className="glass profile-section">
          <h4>{t("sections.careerPreferences")}</h4>
          <div className="field-grid">
            <div>
              <div className="field-lbl">{t("fields.targetRoles")}</div>
              <TagMultiSelect
                values={profile.target_roles || []}
                options={allRoles}
                placeholder={t("fields.targetRolesPlaceholder")}
                onAdd={(role) => updateProfileField("target_roles", [...(profile.target_roles || []), role])}
                onRemove={(role) => updateProfileField("target_roles", (profile.target_roles || []).filter((r) => r !== role))}
              />
              <SuggestionChips
                options={roleSuggestions}
                current={profile.target_roles || []}
                onPick={(role) => updateProfileField("target_roles", [...(profile.target_roles || []), role])}
              />
            </div>
            <div>
              <div className="field-lbl">{t("fields.targetLocations")}</div>
              <TagMultiSelect
                values={profile.target_locations || []}
                options={allLocations}
                placeholder={t("fields.targetLocationsPlaceholder")}
                onAdd={(loc) => updateProfileField("target_locations", [...(profile.target_locations || []), loc])}
                onRemove={(loc) => updateProfileField("target_locations", (profile.target_locations || []).filter((l) => l !== loc))}
              />
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
      )}
      {cropFile && (
        <AvatarCropModal
          file={cropFile}
          onCancel={() => setCropFile(null)}
          onConfirm={(blob) => {
            uploadAvatar(blob);
            setCropFile(null);
          }}
        />
      )}
    </div>
  );
}
