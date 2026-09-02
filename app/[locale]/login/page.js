"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import SlScene from "@/components/SlScene";

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? t("login.errorInvalidCredentials")
          : error.message
      );
      return;
    }
    router.push("/app");
    router.refresh();
  };

  return (
    <div className="auth-shell">
      <div className="auth-form-side">
        <div className="glass auth-card">
          <div className="logo"><div className="logo-mark"></div>Sightline</div>
          <div className="auth-eyebrow">{t("login.eyebrow")}</div>
          <h1>{t("login.title")}</h1>
          <p>{t("login.subtitle")}</p>
          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-field">
              {t("login.emailLabel")}
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="auth-field">
              {t("login.passwordLabel")}
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            {error && <div className="auth-error">{error}</div>}
            <button className="btn btn-primary auth-submit" data-magnet type="submit" disabled={loading}>
              {loading ? t("login.submitting") : t("login.submit")}
            </button>
          </form>
          <p className="auth-switch">
            {t("login.switchPrompt")} <Link href="/register">{t("login.switchCta")}</Link>
          </p>
        </div>
      </div>
      <div className="auth-panel-side">
        <div className="auth-panel">
          <SlScene variant="orb" intensity={6} className="auth-panel-scene" />
          <div className="auth-panel-scrim" />
          <div className="auth-panel-content">
            <div className="auth-panel-claim">{t("login.panelClaim")}</div>
            <div className="auth-panel-tiles">
              <div className="auth-panel-tile">
                <div className="val">{t("login.tile1Value")}</div>
                <div className="lbl">{t("login.tile1Label")}</div>
              </div>
              <div className="auth-panel-tile">
                <div className="val">{t("login.tile2Value")}</div>
                <div className="lbl">{t("login.tile2Label")}</div>
              </div>
              <div className="auth-panel-tile">
                <div className="val">{t("login.tile3Value")}</div>
                <div className="lbl">{t("login.tile3Label")}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
