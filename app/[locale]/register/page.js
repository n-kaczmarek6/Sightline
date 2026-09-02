"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import SlScene from "@/components/SlScene";

function ProgressRail({ t }) {
  return (
    <div className="auth-progress">
      <div className="auth-progress-step active">
        <span className="auth-progress-num">1</span>{t("progress.step1")}
      </div>
      <div className="auth-progress-line" />
      <div className="auth-progress-step">
        <span className="auth-progress-num">2</span>{t("progress.step2")}
      </div>
      <div className="auth-progress-line" />
      <div className="auth-progress-step">
        <span className="auth-progress-num">3</span>{t("progress.step3")}
      </div>
    </div>
  );
}

function AuthPanel({ t }) {
  return (
    <div className="auth-panel-side">
      <div className="auth-panel">
        <SlScene variant="ribbon" intensity={8} className="auth-panel-scene" />
        <div className="auth-panel-scrim" />
        <div className="auth-panel-content">
          <div className="auth-panel-claim">{t("register.panelClaim")}</div>
          <div className="auth-panel-tiles">
            <div className="auth-panel-tile">
              <div className="val">{t("register.tile1Value")}</div>
              <div className="lbl">{t("register.tile1Label")}</div>
            </div>
            <div className="auth-panel-tile">
              <div className="val">{t("register.tile2Value")}</div>
              <div className="lbl">{t("register.tile2Label")}</div>
            </div>
            <div className="auth-panel-tile">
              <div className="val">{t("register.tile3Value")}</div>
              <div className="lbl">{t("register.tile3Label")}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== passwordConfirm) {
      setError(t("register.errorPasswordMismatch"));
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (!data.session) {
      // E-Mail-Bestätigung ist im Supabase-Projekt aktiviert.
      setCheckEmail(true);
      return;
    }
    router.push("/app");
    router.refresh();
  };

  if (checkEmail) {
    return (
      <div className="auth-shell">
        <div className="auth-form-side">
          <div className="glass auth-card">
            <div className="logo"><div className="logo-mark"></div>Sightline</div>
            <h1 style={{ fontSize: 24, marginTop: 14 }}>{t("register.checkEmailTitle")}</h1>
            <div className="auth-note" style={{ marginTop: 12 }}>
              {t.rich("register.checkEmailBody", { email, strong: (chunks) => <strong>{chunks}</strong> })}
            </div>
          </div>
        </div>
        <AuthPanel t={t} />
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <div className="auth-form-side">
        <div className="glass auth-card">
          <div className="logo"><div className="logo-mark"></div>Sightline</div>
          <div className="auth-eyebrow">{t("register.eyebrow")}</div>
          <h1>{t("register.title")}</h1>
          <p>{t("register.subtitle")}</p>
          <ProgressRail t={t} />
          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-field">
              {t("register.emailLabel")}
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="auth-field">
              {t("register.passwordLabel")}
              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <label className="auth-field">
              {t("register.passwordConfirmLabel")}
              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
              />
            </label>
            {error && <div className="auth-error">{error}</div>}
            <button className="btn btn-primary auth-submit" data-magnet type="submit" disabled={loading}>
              {loading ? t("register.submitting") : t("register.submit")}
            </button>
          </form>
          <p className="auth-switch">
            {t("register.switchPrompt")} <Link href="/login">{t("register.switchCta")}</Link>
          </p>
        </div>
      </div>
      <AuthPanel t={t} />
    </div>
  );
}
