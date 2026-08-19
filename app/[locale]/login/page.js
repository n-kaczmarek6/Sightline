"use client";
import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
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
          ? "E-Mail oder Passwort ist falsch."
          : error.message
      );
      return;
    }
    router.push("/app");
    router.refresh();
  };

  return (
    <div className="auth-shell">
      <div className="glass auth-card">
        <div className="logo"><div className="logo-mark"></div>Sightline</div>
        <h1 style={{ fontSize: 24, color: "var(--ink)", marginTop: 14 }}>Willkommen zurück</h1>
        <p>Melde dich an, um mit deiner Jobsuche weiterzumachen.</p>
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
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && <div className="auth-error">{error}</div>}
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Wird angemeldet…" : "Log in"}
          </button>
        </form>
        <p className="auth-switch">
          Noch kein Konto? <Link href="/register">Registrieren</Link>
        </p>
      </div>
    </div>
  );
}
