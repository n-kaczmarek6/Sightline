"use client";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useApp } from "@/context/AppContext";

const NAV = [
  { key: "dashboard", icon: "i-dashboard" },
  { key: "profile", icon: "i-user" },
  { key: "analyze", icon: "i-search" },
  { key: "builder", icon: "i-edit" },
  { key: "applications", icon: "i-folder" },
  { key: "documents", icon: "i-docs" },
  { key: "blog", icon: "i-chat", adminOnly: true },
  { key: "settings", icon: "i-settings" },
];

function initials(name, email) {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
  }
  return (email || "?").slice(0, 2).toUpperCase();
}

export default function Sidebar({ mobileOpen, onClose }) {
  const { panel, setPanel, isPro, priceMode, profile, userEmail } = useApp();
  const t = useTranslations("shell");
  const planLabel = isPro ? (priceMode === "sprint" ? t("plan.proSprint") : t("plan.pro")) : t("plan.free");
  const displayName = profile?.full_name || userEmail || t("defaultUser");

  const goTo = (key) => {
    setPanel(key);
    onClose?.();
  };

  return (
    <>
      <div className={`sidebar-backdrop${mobileOpen ? " open" : ""}`} onClick={onClose} />
      <aside className={`sidebar${mobileOpen ? " mobile-open" : ""}`}>
        <div className="sidebar-mobile-head">
          <Link href="/" className="sidebar-logo"><div className="logo-mark" style={{ width: 24, height: 24 }}></div>Sightline</Link>
          <button className="sidebar-close" onClick={onClose} aria-label={t("closeMenu")}>×</button>
        </div>
        <button className="sidebar-newbtn" onClick={() => goTo("analyze")}>{t("newApplication")}</button>
        <div className="nav-group">
          {NAV.filter((n) => !n.adminOnly || profile?.is_admin).map((n) => (
            <button
              key={n.key}
              className={`nav-item${panel === n.key ? " active" : ""}`}
              onClick={() => goTo(n.key)}
            >
              <svg className="icon nav-icon"><use href={`#${n.icon}`} /></svg>
              {t(`nav.${n.key}`)}
            </button>
          ))}
        </div>
        {!isPro && (
          <div>
            <button className="sidebar-upgrade" onClick={() => goTo("pricing")}>
              <svg className="icon nav-icon"><use href="#i-star" /></svg>{t("upgradeToPro")}
            </button>
          </div>
        )}
        <div className="sidebar-footer">
          <button className="sidebar-user" onClick={() => goTo("pricing")}>
            <div className="avatar">{initials(profile?.full_name, userEmail)}</div>
            <span>
              <span className="sidebar-user-name">{displayName}</span>
              <span className="sidebar-user-role">{planLabel}</span>
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
