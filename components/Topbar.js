"use client";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/context/AppContext";

const CRUMBS = {
  dashboard: "Dashboard",
  analyze: "Job analysieren",
  analysis: "Job analysieren / Match",
  keywords: "Job analysieren / Keywords",
  recommendations: "Job analysieren / Empfehlungen",
  builder: "CV Builder",
  profile: "Mein Profil",
  documents: "Dokumente",
  applications: "Bewerbungen",
  assistant: "AI Career Copilot",
  settings: "Einstellungen",
  pricing: "Upgrade auf Pro",
};

function initials(name, email) {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
  }
  return (email || "?").slice(0, 2).toUpperCase();
}

export default function Topbar() {
  const { panel, setPanel, toast, profile, userEmail, applications, selectedApplicationId } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const displayName = profile?.full_name || userEmail || "Nutzer:in";
  const selectedApp = applications.find((a) => a.id === selectedApplicationId);
  const crumb = panel === "appdetail"
    ? `Bewerbungen / ${selectedApp ? selectedApp.company : "Detail"}`
    : CRUMBS[panel] || panel;

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="topbar">
      <div className="topbar-left">{crumb}</div>
      <div className="topbar-right">
        <button
          className="icon-btn"
          title="Benachrichtigungen"
          onClick={() => toast("Du hast 3 ungelesene Benachrichtigungen.")}
        >
          <svg className="icon" style={{ width: 17, height: 17 }}><use href="#i-bell" /></svg>
          <span className="notif-dot"></span>
        </button>
        <button className="user-chip" onClick={() => setMenuOpen((v) => !v)}>
          <span className="avatar" style={{ width: 26, height: 26, fontSize: 10.5 }}>{initials(profile?.full_name, userEmail)}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{displayName}</span>
        </button>
        {menuOpen && (
          <div className="user-menu">
            <button onClick={() => { setPanel("settings"); setMenuOpen(false); }}>Einstellungen</button>
            <button className="danger" onClick={handleLogout}>Log out</button>
          </div>
        )}
      </div>
    </div>
  );
}
