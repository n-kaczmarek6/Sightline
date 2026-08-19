"use client";
import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
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
      setError("Die Passwörter stimmen nicht überein.");
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
        <div className="glass auth-card">
          <div className="logo"><div className="logo-mark"></div>Sightline</div>
          <h1 style={{ fontSize: 24, color: "var(--ink)", marginTop: 14 }}>Fast geschafft</h1>
          <div className="auth-note" style={{ marginTop: 12 }}>
            Wir haben dir eine Bestätigungs-E-Mail an <strong>{email}</strong> geschickt. Klick auf den
            Link darin, um dein Konto zu aktivieren.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <div className="glass auth-card">
        <div className="logo"><div className="logo-mark"></div>Sightline</div>
        <h1 style={{ fontSize: 24, color: "var(--ink)", marginTop: 14 }}>Konto erstellen</h1>
        <p>Starte kostenlos — deine erste Match-Analyse ist gratis.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            E-Mail
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="auth-field">
            Passwort
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
            Passwort bestätigen
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
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Wird erstellt…" : "Konto erstellen"}
          </button>
        </form>
        <p className="auth-switch">
          Schon ein Konto? <Link href="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
