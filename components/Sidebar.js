"use client";
import { useEffect, useState } from "react";
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
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("sl-sidebar-collapsed") === "1") setCollapsed(true);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((v) => {
      localStorage.setItem("sl-sidebar-collapsed", !v ? "1" : "0");
      return !v;
    });
  };

  const goTo = (key) => {
    setPanel(key);
    onClose?.();
  };

  return (
    <>
      <div className={`sidebar-backdrop${mobileOpen ? " open" : ""}`} onClick={onClose} />
      <aside className={`sidebar${mobileOpen ? " mobile-open" : ""}${collapsed ? " collapsed" : ""}`}>
        <div className="sidebar-mobile-head">
          <Link href="/" className="sidebar-logo"><div className="logo-mark" style={{ width: 24, height: 24 }}></div><span className="sidebar-logo-text">Sightline</span></Link>
          <button className="sidebar-close" onClick={onClose} aria-label={t("closeMenu")}>×</button>
          <button className="sidebar-collapse-btn" onClick={toggleCollapsed} aria-label={t(collapsed ? "expandSidebar" : "collapseSidebar")} title={t(collapsed ? "expandSidebar" : "collapseSidebar")}>
            <svg className="icon" style={{ width: 15, height: 15 }}><use href="#i-chevron-left" /></svg>
          </button>
        </div>
        <button className="sidebar-newbtn" onClick={() => goTo("analyze")} title={t("newApplication")}>
          <svg className="icon nav-icon"><use href="#i-plus" /></svg>
          <span className="nav-label">{t("newApplication")}</span>
        </button>
        <div className="nav-group">
          {NAV.filter((n) => !n.adminOnly || profile?.is_admin).map((n) => (
            <button
              key={n.key}
              className={`nav-item${panel === n.key ? " active" : ""}`}
              onClick={() => goTo(n.key)}
              title={t(`nav.${n.key}`)}
            >
              <svg className="icon nav-icon"><use href={`#${n.icon}`} /></svg>
              <span className="nav-label">{t(`nav.${n.key}`)}</span>
            </button>
          ))}
        </div>
        {!isPro && (
          <div>
            <button className="sidebar-upgrade" onClick={() => goTo("pricing")} title={t("upgradeToPro")}>
              <svg className="icon nav-icon"><use href="#i-star" /></svg><span className="nav-label">{t("upgradeToPro")}</span>
            </button>
          </div>
        )}
        <div className="sidebar-footer">
          <button className="sidebar-user" onClick={() => goTo("pricing")} title={displayName}>
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
