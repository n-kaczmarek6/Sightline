"use client";
import { useState } from "react";
import { useApp } from "@/context/AppContext";

const WORK_MODELS = [
  { value: "", label: "Nicht angegeben" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "Vor Ort" },
];

const COUNTRIES = [
  { value: "", label: "Land wählen" },
  { value: "Deutschland", label: "Deutschland" },
  { value: "Österreich", label: "Österreich" },
  { value: "Schweiz", label: "Schweiz" },
  { value: "Polen", label: "Polen" },
  { value: "Niederlande", label: "Niederlande" },
  { value: "Belgien", label: "Belgien" },
  { value: "Frankreich", label: "Frankreich" },
  { value: "Spanien", label: "Spanien" },
  { value: "Italien", label: "Italien" },
  { value: "Vereinigtes Königreich", label: "Vereinigtes Königreich" },
  { value: "Irland", label: "Irland" },
  { value: "Schweden", label: "Schweden" },
  { value: "Dänemark", label: "Dänemark" },
  { value: "Norwegen", label: "Norwegen" },
  { value: "Tschechien", label: "Tschechien" },
  { value: "Portugal", label: "Portugal" },
  { value: "USA", label: "USA" },
  { value: "Andere", label: "Andere" },
];

const SKILL_SUGGESTIONS = [
  "Projektmanagement", "Kommunikation", "Teamführung", "Datenanalyse",
  "Marketing", "Vertrieb", "Kundenservice", "Product Management",
  "Agile / Scrum", "Excel", "Content Strategy", "SaaS",
];

const ROLE_SUGGESTIONS = [
  "Product Marketing Manager", "Marketing Manager", "Growth Manager",
  "Product Manager", "Projektmanager", "Sales Manager",
  "Business Analyst", "UX Designer", "Software Engineer", "Data Analyst",
];

const LOCATION_SUGGESTIONS = [
  "Berlin", "München", "Hamburg", "Köln", "Frankfurt",
  "Remote (DE)", "Remote (EU)", "Wien", "Zürich",
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

function ExperienceForm({ onAdd, onCancel }) {
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
        <input className="profile-input" placeholder="Jobtitel" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <input className="profile-input" placeholder="Unternehmen" value={company} onChange={(e) => setCompany(e.target.value)} required />
        <input className="profile-input" placeholder="Ort" value={location} onChange={(e) => setLocation(e.target.value)} />
        <input className="profile-input" type="month" placeholder="Start" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input className="profile-input" type="month" placeholder="Ende" value={endDate} disabled={current} onChange={(e) => setEndDate(e.target.value)} />
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-muted)" }}>
          <input type="checkbox" checked={current} onChange={(e) => setCurrent(e.target.checked)} /> Bis heute
        </label>
      </div>
      <textarea
        className="cv-editable"
        style={{ width: "100%", resize: "vertical" }}
        rows={3}
        placeholder="Ein Punkt pro Zeile…"
        value={bulletsText}
        onChange={(e) => setBulletsText(e.target.value)}
      />
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn btn-primary btn-sm" type="submit">Hinzufügen</button>
        <button className="btn btn-ghost btn-sm" type="button" onClick={onCancel}>Abbrechen</button>
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
  const [showExpForm, setShowExpForm] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  if (!profile) {
    return (
      <div className="panel">
        <div className="panel-head"><h1>Dein Profil</h1></div>
        <p>Profil konnte nicht geladen werden.</p>
      </div>
    );
  }

  const pct = completeness(profile, workExperience, skills);

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
        <div><h1>Dein Profil</h1><p>Alle Karriere-Infos an einem Ort — Basis für jede künftige Bewerbung.</p></div>
        <button className="btn btn-primary btn-sm" onClick={saveProfile}>Änderungen speichern</button>
      </div>
      <div className="profile-progress">
        <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
        <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{pct}%</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="glass profile-section">
          <h4>Personal Information</h4>
          <div className="field-grid">
            <div>
              <div className="field-lbl">Name</div>
              <input className="profile-input" value={profile.full_name || ""}
                onChange={(e) => updateProfileField("full_name", e.target.value)} placeholder="Dein Name" />
            </div>
            <div>
              <div className="field-lbl">Stadt</div>
              <input className="profile-input" value={profile.location || ""}
                onChange={(e) => updateProfileField("location", e.target.value)} placeholder="z.B. Berlin" />
            </div>
            <div>
              <div className="field-lbl">Land</div>
              <select className="profile-input" value={profile.country || ""}
                onChange={(e) => updateProfileField("country", e.target.value || null)}>
                {COUNTRIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <div className="field-lbl">LinkedIn</div>
              <input className="profile-input" value={profile.linkedin_url || ""}
                onChange={(e) => updateProfileField("linkedin_url", e.target.value)} placeholder="linkedin.com/in/…" />
            </div>
            <div>
              <div className="field-lbl">E-Mail</div>
              <div className="field-val">{userEmail}</div>
            </div>
            <div>
              <div className="field-lbl">Telefon</div>
              <input className="profile-input" value={profile.phone || ""}
                onChange={(e) => updateProfileField("phone", e.target.value)} placeholder="+49…" />
            </div>
          </div>
        </div>

        <div className="glass profile-section">
          <h4>Work Experience</h4>
          {workExperience.length === 0 && !showExpForm && (
            <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>Noch keine Berufserfahrung hinzugefügt.</p>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {workExperience.map((exp, i) => (
              <div className={`exp-item${i % 2 ? " alt" : ""}`} key={exp.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div>
                    <div className="exp-title">{exp.title} — {exp.company}</div>
                    <div className="exp-meta">
                      {exp.start_date || "?"} — {exp.end_date || "heute"}{exp.location ? ` · ${exp.location}` : ""}
                    </div>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => removeWorkExperience(exp.id)}>Löschen</button>
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
                onAdd={(entry) => { addWorkExperience(entry); setShowExpForm(false); }}
                onCancel={() => setShowExpForm(false)}
              />
            </div>
          ) : (
            <button className="btn btn-secondary btn-sm" style={{ marginTop: 14 }} onClick={() => setShowExpForm(true)}>
              + Erfahrung hinzufügen
            </button>
          )}
        </div>

        <div className="glass profile-section">
          <h4>Skills</h4>
          {skills.length === 0 && (
            <p style={{ fontSize: 13.5, color: "var(--text-muted)", marginBottom: 10 }}>Noch keine Skills hinzugefügt.</p>
          )}
          <div className="tag-row" style={{ marginBottom: 10 }}>
            {skills.map((s) => (
              <span className="tag" key={s.id} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                {s.name}
                <button
                  type="button"
                  onClick={() => removeSkill(s.id)}
                  aria-label={`${s.name} entfernen`}
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
              placeholder="Skill hinzufügen…"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
            />
            <button className="btn btn-secondary btn-sm" type="submit">+</button>
          </form>
          <div className="suggestion-lbl-sm">Vorschläge</div>
          <SuggestionChips options={SKILL_SUGGESTIONS} current={skills.map((s) => s.name)} onPick={addSkill} />
        </div>

        <div className="glass profile-section">
          <h4>Career Preferences</h4>
          <div className="field-grid">
            <div>
              <div className="field-lbl">Zielrollen</div>
              <input className="profile-input"
                value={(profile.target_roles || []).join(", ")}
                onChange={(e) => updateProfileField("target_roles", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                placeholder="z.B. Product Marketing Manager" />
              <SuggestionChips
                options={ROLE_SUGGESTIONS}
                current={profile.target_roles || []}
                onPick={(role) => updateProfileField("target_roles", [...(profile.target_roles || []), role])}
              />
            </div>
            <div>
              <div className="field-lbl">Orte</div>
              <input className="profile-input"
                value={(profile.target_locations || []).join(", ")}
                onChange={(e) => updateProfileField("target_locations", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                placeholder="z.B. Berlin, Remote" />
              <SuggestionChips
                options={LOCATION_SUGGESTIONS}
                current={profile.target_locations || []}
                onPick={(loc) => updateProfileField("target_locations", [...(profile.target_locations || []), loc])}
              />
            </div>
            <div>
              <div className="field-lbl">Arbeitsmodell</div>
              <select className="profile-input"
                value={profile.work_model || ""}
                onChange={(e) => updateProfileField("work_model", e.target.value || null)}>
                {WORK_MODELS.map((w) => <option key={w.value} value={w.value}>{w.label}</option>)}
              </select>
            </div>
            <div>
              <div className="field-lbl">Gehaltsvorstellung (€)</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input className="profile-input" type="number" style={{ marginTop: 0 }}
                  value={profile.salary_min ?? ""}
                  onChange={(e) => updateProfileField("salary_min", e.target.value ? Number(e.target.value) : null)}
                  placeholder="Min" />
                <span style={{ color: "var(--text-faint)" }}>–</span>
                <input className="profile-input" type="number" style={{ marginTop: 0 }}
                  value={profile.salary_max ?? ""}
                  onChange={(e) => updateProfileField("salary_max", e.target.value ? Number(e.target.value) : null)}
                  placeholder="Max" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
