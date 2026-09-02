"use client";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/context/AppContext";

const LOCALES = ["de", "en"];

function initials(name, email) {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
  }
  return (email || "?").slice(0, 2).toUpperCase();
}

export default function Topbar({ onMenuClick }) {
  const { panel, setPanel, profile, userEmail, applications, selectedApplicationId, isPro, analysesUsed, FREE_ANALYSIS_LIMIT, updateLocale } = useApp();
  const t = useTranslations("shell");
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const displayName = profile?.full_name || userEmail || t("defaultUser");
  const selectedApp = applications.find((a) => a.id === selectedApplicationId);
  const crumb = panel === "appdetail"
    ? `${t("breadcrumbs.applications")} / ${selectedApp ? selectedApp.company : t("breadcrumbs.appDetailFallback")}`
    : t(`breadcrumbs.${panel}`);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const handleLocaleSwitch = (locale) => {
    if (locale === currentLocale) return;
    updateLocale(locale);
    router.replace(pathname, { locale });
  };

  return (
    <div className="topbar" data-scroll-nav>
      <button className="hamburger-btn" onClick={onMenuClick} aria-label={t("openMenu")}>
        <span></span><span></span><span></span>
      </button>
      <div className="topbar-left">{crumb}</div>
      <div className="topbar-right">
        {!isPro && (
          <div className="topbar-usage-pill">
            {t("analysesUsage", { used: analysesUsed, limit: FREE_ANALYSIS_LIMIT })}
          </div>
        )}
        <div className="topbar-locale-switch">
          {LOCALES.map((l) => (
            <button key={l} className={currentLocale === l ? "active" : ""} onClick={() => handleLocaleSwitch(l)}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        <button className="user-chip" onClick={() => setMenuOpen((v) => !v)}>
          <span className="avatar" style={{ width: 26, height: 26, fontSize: 10.5 }}>{initials(profile?.full_name, userEmail)}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{displayName}</span>
        </button>
        {menuOpen && (
          <div className="user-menu">
            <button onClick={() => { setPanel("settings"); setMenuOpen(false); }}>{t("nav.settings")}</button>
            <button className="danger" onClick={handleLogout}>{t("logout")}</button>
          </div>
        )}
      </div>
    </div>
  );
}
