"use client";
import { useApp } from "@/context/AppContext";

export default function SettingsPanel() {
  const { isPro, priceMode } = useApp();
  const planLabel = isPro ? (priceMode === "sprint" ? "Pro · Sprint" : "Pro Plan") : "Free Plan";

  return (
    <div className="panel">
      <div className="panel-head"><h1>Einstellungen</h1><p>Account und Präferenzen verwalten.</p></div>
      <div className="settings-list">
        <div className="glass profile-section">
          <h4>Account</h4>
          <div className="field-grid">
            <div><div className="field-lbl">Name</div><div className="field-val">Alex Morgan</div></div>
            <div><div className="field-lbl">E-Mail</div><div className="field-val">alex.morgan@email.com</div></div>
            <div><div className="field-lbl">Plan</div><div className="field-val">{planLabel}</div></div>
          </div>
        </div>
        <div className="glass profile-section">
          <h4>Benachrichtigungen</h4>
          <p style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.6 }}>
            E-Mail, wenn ein Recruiter deine Bewerbung ansieht, plus wöchentliche Match-Digests.
          </p>
        </div>
        <div className="glass profile-section">
          <h4>Privacy &amp; Daten</h4>
          <p style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.6 }}>
            Deine Dokumente sind verschlüsselt und werden nie direkt mit Arbeitgebern geteilt. <a href="#">Daten verwalten →</a>
          </p>
        </div>
      </div>
    </div>
  );
}
