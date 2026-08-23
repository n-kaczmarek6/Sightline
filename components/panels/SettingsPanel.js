"use client";
import { useState } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useApp } from "@/context/AppContext";

const LOCALES = [
  { value: "de", label: "Deutsch" },
  { value: "en", label: "English" },
];

export default function SettingsPanel() {
  const { isPro, priceMode, profile, userEmail, changePassword, updateLocale, deleteAccount } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const planLabel = isPro ? (priceMode === "sprint" ? "Pro · Sprint" : "Pro Plan") : "Free Plan";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwError("");
    if (newPassword.length < 6) {
      setPwError("Mindestens 6 Zeichen.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Passwörter stimmen nicht überein.");
      return;
    }
    setSavingPw(true);
    const ok = await changePassword(newPassword);
    setSavingPw(false);
    if (ok) {
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleLocaleSwitch = (locale) => {
    if (locale === profile?.locale) return;
    updateLocale(locale);
    router.replace(pathname, { locale });
  };

  const canDelete = deleteConfirm === userEmail;
  const handleDelete = async () => {
    setDeleting(true);
    const ok = await deleteAccount();
    if (ok) {
      router.push("/login");
      router.refresh();
    } else {
      setDeleting(false);
    }
  };

  return (
    <div className="panel">
      <div className="panel-head"><h1>Einstellungen</h1><p>Account und Präferenzen verwalten.</p></div>
      <div className="settings-list">
        <div className="glass profile-section">
          <h4>Account</h4>
          <div className="field-grid">
            <div><div className="field-lbl">Name</div><div className="field-val">{profile?.full_name || "Noch nicht angegeben"}</div></div>
            <div><div className="field-lbl">E-Mail</div><div className="field-val">{userEmail}</div></div>
            <div><div className="field-lbl">Plan</div><div className="field-val">{planLabel}</div></div>
          </div>
        </div>

        <div className="glass profile-section">
          <h4>Sprache</h4>
          <p style={{ fontSize: 13.5, color: "var(--text-muted)", marginBottom: 12 }}>
            Bestimmt die Oberflächensprache der App.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            {LOCALES.map((l) => (
              <button
                key={l.value}
                className={`btn btn-sm ${profile?.locale === l.value ? "btn-primary" : "btn-secondary"}`}
                onClick={() => handleLocaleSwitch(l.value)}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div className="glass profile-section">
          <h4>Passwort ändern</h4>
          <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 340 }}>
            <input className="profile-input" type="password" placeholder="Neues Passwort" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <input className="profile-input" type="password" placeholder="Passwort bestätigen" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            {pwError && <div className="auth-error">{pwError}</div>}
            <button className="btn btn-primary btn-sm" type="submit" disabled={savingPw} style={{ alignSelf: "flex-start" }}>
              {savingPw ? "Wird gespeichert…" : "Passwort aktualisieren"}
            </button>
          </form>
        </div>

        <div className="glass profile-section">
          <h4>Benachrichtigungen</h4>
          <p style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.6 }}>
            E-Mail, wenn ein Recruiter deine Bewerbung ansieht, plus wöchentliche Match-Digests.
          </p>
        </div>

        <div className="glass profile-section" style={{ borderColor: "rgba(226,76,58,.3)" }}>
          <h4 style={{ color: "var(--error)" }}>Konto löschen</h4>
          <p style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 12 }}>
            Löscht deinen Account und alle Daten (Profil, Dokumente, Bewerbungen, CVs) unwiderruflich. Tippe deine
            E-Mail-Adresse (<strong>{userEmail}</strong>) ein, um zu bestätigen.
          </p>
          <div style={{ display: "flex", gap: 8, maxWidth: 420, flexWrap: "wrap" }}>
            <input
              className="profile-input"
              style={{ marginTop: 0, flex: 1, minWidth: 200 }}
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={userEmail}
            />
            <button
              className="btn btn-sm"
              style={{ background: "var(--error)", color: "#fff", whiteSpace: "nowrap" }}
              disabled={!canDelete || deleting}
              onClick={handleDelete}
            >
              {deleting ? "Wird gelöscht…" : "Endgültig löschen"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
