"use client";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useApp } from "@/context/AppContext";

const LOCALES = [
  { value: "de", label: "Deutsch" },
  { value: "en", label: "English" },
];

export default function SettingsPanel() {
  const { isPro, priceMode, profile, userEmail, changePassword, updateLocale, deleteAccount } = useApp();
  const t = useTranslations("settings");
  const tShell = useTranslations("shell");
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const planLabel = isPro ? (priceMode === "sprint" ? tShell("plan.proSprint") : tShell("plan.pro")) : tShell("plan.free");

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
      setPwError(t("password.tooShort"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError(t("password.mismatch"));
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
    updateLocale(locale);
    if (locale === currentLocale) return;
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
      <div className="panel-head"><h1>{t("title")}</h1><p>{t("subtitle")}</p></div>
      <div className="settings-list">
        <div className="glass profile-section">
          <h4>{t("account.heading")}</h4>
          <div className="field-grid">
            <div><div className="field-lbl">{t("account.name")}</div><div className="field-val">{profile?.full_name || t("account.notSet")}</div></div>
            <div><div className="field-lbl">{t("account.email")}</div><div className="field-val">{userEmail}</div></div>
            <div><div className="field-lbl">{t("account.plan")}</div><div className="field-val">{planLabel}</div></div>
          </div>
        </div>

        <div className="glass profile-section">
          <h4>{t("language.heading")}</h4>
          <p style={{ fontSize: 13.5, color: "var(--text-muted)", marginBottom: 12 }}>
            {t("language.description")}
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            {LOCALES.map((l) => (
              <button
                key={l.value}
                className={`btn btn-sm ${currentLocale === l.value ? "btn-primary" : "btn-secondary"}`}
                onClick={() => handleLocaleSwitch(l.value)}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div className="glass profile-section">
          <h4>{t("password.heading")}</h4>
          <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 340 }}>
            <input className="profile-input" type="password" placeholder={t("password.newPassword")} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <input className="profile-input" type="password" placeholder={t("password.confirmPassword")} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            {pwError && <div className="auth-error">{pwError}</div>}
            <button className="btn btn-primary btn-sm" type="submit" disabled={savingPw} style={{ alignSelf: "flex-start" }}>
              {savingPw ? t("password.saving") : t("password.update")}
            </button>
          </form>
        </div>

        <div className="glass profile-section" style={{ borderColor: "rgba(226,76,58,.3)" }}>
          <h4 style={{ color: "var(--error)" }}>{t("deleteAccount.heading")}</h4>
          <p style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 12 }}>
            {t("deleteAccount.descriptionPre")}<strong>{userEmail}</strong>{t("deleteAccount.descriptionPost")}
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
              {deleting ? t("deleteAccount.deleting") : t("deleteAccount.confirmButton")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
