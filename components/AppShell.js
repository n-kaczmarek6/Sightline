"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AppProvider, useApp } from "@/context/AppContext";
import IconSprite from "@/components/IconSprite";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import Toasts from "@/components/ui/Toasts";
import LoadingOverlay from "@/components/ui/LoadingOverlay";

import DashboardPanel from "@/components/panels/DashboardPanel";
import AnalyzePanel from "@/components/panels/AnalyzePanel";
import MatchAnalysisPanel from "@/components/panels/MatchAnalysisPanel";
import KeywordsPanel from "@/components/panels/KeywordsPanel";
import RecommendationsPanel from "@/components/panels/RecommendationsPanel";
import BuilderPanel from "@/components/panels/BuilderPanel";
import ProfilePanel from "@/components/panels/ProfilePanel";
import DocumentsPanel from "@/components/panels/DocumentsPanel";
import ApplicationsPanel from "@/components/panels/ApplicationsPanel";
import AppDetailPanel from "@/components/panels/AppDetailPanel";
import PricingPanel from "@/components/panels/PricingPanel";
import SettingsPanel from "@/components/panels/SettingsPanel";
import BlogAdminPanel from "@/components/panels/BlogAdminPanel";

const PANELS = {
  dashboard: DashboardPanel,
  analyze: AnalyzePanel,
  analysis: MatchAnalysisPanel,
  keywords: KeywordsPanel,
  recommendations: RecommendationsPanel,
  builder: BuilderPanel,
  profile: ProfilePanel,
  documents: DocumentsPanel,
  applications: ApplicationsPanel,
  appdetail: AppDetailPanel,
  pricing: PricingPanel,
  settings: SettingsPanel,
  blog: BlogAdminPanel,
};

function InitialPanelFromQuery() {
  const params = useSearchParams();
  const { setPanel } = useApp();
  useEffect(() => {
    const p = params.get("panel");
    if (p && PANELS[p]) setPanel(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);
  return null;
}

function ShellInner() {
  const { panel } = useApp();
  const Panel = PANELS[panel] || DashboardPanel;
  return (
    <div id="app-shell" style={{ display: "flex", minHeight: "100vh" }}>
      <IconSprite />
      <Toasts />
      <LoadingOverlay />
      <InitialPanelFromQuery />
      <Sidebar />
      <main className="app-main">
        <Topbar />
        <div className="panel-wrap">
          <Panel />
        </div>
      </main>
    </div>
  );
}

export default function AppShell({
  userEmail, initialProfile, initialWorkExperience, initialEducation, initialSkills, initialDocuments, initialApplications, initialCvVersions,
  initialAnalysis, initialAnalysesUsed, initialBlogPosts,
}) {
  return (
    <AppProvider
      userEmail={userEmail}
      initialProfile={initialProfile}
      initialWorkExperience={initialWorkExperience}
      initialEducation={initialEducation}
      initialSkills={initialSkills}
      initialDocuments={initialDocuments}
      initialApplications={initialApplications}
      initialCvVersions={initialCvVersions}
      initialAnalysis={initialAnalysis}
      initialAnalysesUsed={initialAnalysesUsed}
      initialBlogPosts={initialBlogPosts}
    >
      <ShellInner />
    </AppProvider>
  );
}
