"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/context/AppContext";

function initials(name, email) {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
  }
  return (email || "?").slice(0, 2).toUpperCase();
}

export default function Topbar() {
  const { panel, setPanel, toast, profile, userEmail, applications, selectedApplicationId } = useApp();
  const t = useTranslations("shell");
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
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

  return (
    <div className="topbar">
      <div className="topbar-left">{crumb}</div>
      <div className="topbar-right">
        <button
          className="icon-btn"
          title={t("notifications")}
          onClick={() => toast(t("notificationsToast"))}
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
            <button onClick={() => { setPanel("settings"); setMenuOpen(false); }}>{t("nav.settings")}</button>
            <button className="danger" onClick={handleLogout}>{t("logout")}</button>
          </div>
        )}
      </div>
    </div>
  );
}
