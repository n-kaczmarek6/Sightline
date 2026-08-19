"use client";
import { useApp } from "@/context/AppContext";

const NAV = [
  { key: "dashboard", label: "Dashboard", icon: "i-dashboard" },
  { key: "analyze", label: "Job analysieren", icon: "i-search" },
  { key: "profile", label: "Mein Profil", icon: "i-user" },
  { key: "builder", label: "CV Builder", icon: "i-edit" },
  { key: "applications", label: "Bewerbungen", icon: "i-folder" },
  { key: "documents", label: "Dokumente", icon: "i-docs" },
  { key: "assistant", label: "AI Career Copilot", icon: "i-chat" },
  { key: "settings", label: "Einstellungen", icon: "i-settings" },
];

function initials(name, email) {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
  }
  return (email || "?").slice(0, 2).toUpperCase();
}

export default function Sidebar() {
  const { panel, setPanel, isPro, priceMode, profile, userEmail } = useApp();
  const planLabel = isPro ? (priceMode === "sprint" ? "Pro · Sprint" : "Pro Plan") : "Free Plan";
  const displayName = profile?.full_name || userEmail || "Nutzer:in";

  return (
    <aside className="sidebar">
      <div className="sidebar-logo"><div className="logo-mark" style={{ width: 24, height: 24 }}></div>Sightline</div>
      <button className="sidebar-newbtn" onClick={() => setPanel("analyze")}>+ Neue Bewerbung</button>
      <div className="nav-group">
        {NAV.map((n) => (
          <button
            key={n.key}
            className={`nav-item${panel === n.key ? " active" : ""}`}
            onClick={() => setPanel(n.key)}
          >
            <svg className="icon nav-icon"><use href={`#${n.icon}`} /></svg>
            {n.label}
          </button>
        ))}
      </div>
      {!isPro && (
        <div>
          <button className="sidebar-upgrade" onClick={() => setPanel("pricing")}>
            <svg className="icon nav-icon"><use href="#i-star" /></svg>Upgrade auf Pro
          </button>
        </div>
      )}
      <div className="sidebar-footer">
        <button className="sidebar-user" onClick={() => setPanel("pricing")}>
          <div className="avatar">{initials(profile?.full_name, userEmail)}</div>
          <span>
            <span className="sidebar-user-name">{displayName}</span>
            <span className="sidebar-user-role">{planLabel}</span>
          </span>
        </button>
      </div>
    </aside>
  );
}
