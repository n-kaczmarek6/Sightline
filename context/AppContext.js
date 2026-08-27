"use client";
import { createContext, useContext, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

const AppContext = createContext(null);

const FREE_ANALYSIS_LIMIT = 3;
const FREE_AI_LIMIT = 4;
const FREE_DOCUMENT_LIMIT = 2;
const FREE_APPLICATION_LIMIT = 5;

export function AppProvider({
  children,
  userEmail,
  initialProfile,
  initialWorkExperience,
  initialSkills,
  initialDocuments,
  initialApplications,
  initialCvVersions,
  initialAnalysis,
  initialAnalysesUsed,
}) {
  // ---- navigation ----
  const [panel, setPanelState] = useState("dashboard");

  // ---- profile (real Supabase data) ----
  const [profile, setProfile] = useState(initialProfile || null);
  const [workExperience, setWorkExperience] = useState(initialWorkExperience || []);
  const [skills, setSkills] = useState(initialSkills || []);
  const [documents, setDocuments] = useState(initialDocuments || []);
  const [applications, setApplications] = useState(initialApplications || []);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [cvVersions, setCvVersions] = useState(initialCvVersions || []);
  const [selectedVersionId, setSelectedVersionId] = useState(initialCvVersions?.[0]?.id || null);
  const [currentAnalysis, setCurrentAnalysis] = useState(initialAnalysis || null);
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingCv, setGeneratingCv] = useState(false);

  // ---- plan / paywall ----
  const [isPro, setIsPro] = useState(false);
  const [priceMode, setPriceMode] = useState("monthly");
  const [analysesUsed, setAnalysesUsed] = useState(initialAnalysesUsed || 0);
  const [aiMessagesUsed, setAiMessagesUsed] = useState(0);

  // ---- ui ----
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const t = useTranslations("toasts");

  // ---- chat ----
  const tAssistant = useTranslations("assistant");
  const greetingName = (initialProfile?.full_name || userEmail || "").split(/\s+/)[0] || "";
  const [chatMessages, setChatMessages] = useState([
    { who: "bot", text: tAssistant("greeting", { name: greetingName }) },
  ]);
  const [chatLocked, setChatLocked] = useState(false);

  // ---- interview prep ----
  const [prepShown, setPrepShown] = useState(false);

  const toast = useCallback((msg) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2400);
  }, []);

  const setPanel = useCallback((name) => {
    setPanelState(name);
  }, []);

  const setPlan = useCallback(
    (pro) => {
      setIsPro(pro);
      toast(
        pro
          ? t("planUpgraded", { sprint: priceMode === "sprint" ? "yes" : "no" })
          : t("planDowngraded")
      );
    },
    [priceMode, toast, t]
  );

  const runAnalysis = useCallback(
    async (jobDescription, cvFile) => {
      if (!isPro && analysesUsed >= FREE_ANALYSIS_LIMIT) {
        toast(t("analysisLimitReached", { limit: FREE_ANALYSIS_LIMIT }));
        setPanel("pricing");
        return;
      }
      if (!jobDescription || jobDescription.trim().length < 20) {
        toast(t("jobDescriptionRequired"));
        return;
      }
      setLoading(true);
      setLoadingStep(1);
      setAnalyzing(true);
      // Echte Analyse hat unbekannte Dauer (mehrere Sekunden) — die Schritte sind
      // kosmetisch, damit die Wartezeit nicht wie ein eingefrorenes UI wirkt.
      const stepInterval = setInterval(() => {
        setLoadingStep((s) => Math.min(s + 1, 3));
      }, 1800);
      try {
        const formData = new FormData();
        formData.append("jobDescription", jobDescription);
        if (cvFile) formData.append("cvFile", cvFile);
        const res = await fetch("/api/analyze", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) {
          toast(data?.error === "cv_file_unreadable" ? t("cvFileUnreadable") : data?.message || t("analysisFailed"));
          return;
        }
        setLoadingStep(4);
        setCurrentAnalysis(data.analysis);
        setApplications((a) => [data.application, ...a]);
        if (!isPro) setAnalysesUsed((n) => n + 1);
        setPanel("analysis");
      } catch (err) {
        toast(t("analysisFailed"));
      } finally {
        clearInterval(stepInterval);
        setLoading(false);
        setAnalyzing(false);
      }
    },
    [isPro, analysesUsed, toast, setPanel, t]
  );

  const updateProfileField = useCallback((field, value) => {
    setProfile((p) => ({ ...p, [field]: value }));
  }, []);

  const saveProfile = useCallback(async () => {
    if (!profile) return;
    const supabase = createClient();
    const {
      id,
      created_at,
      updated_at,
      locale,
      full_name,
      location,
      country,
      linkedin_url,
      phone,
      target_roles,
      target_locations,
      work_model,
      salary_min,
      salary_max,
      languages,
    } = profile;
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name,
        location,
        country,
        linkedin_url,
        phone,
        target_roles,
        target_locations,
        work_model,
        salary_min,
        salary_max,
        languages,
      })
      .eq("id", id);
    toast(error ? t("saveErrorWithMessage", { message: error.message }) : t("profileSaved"));
  }, [profile, toast, t]);

  // Nutzt den "documents"-Bucket statt eines eigenen "avatars"-Buckets: Supabase Storage
  // hat sich bei uns gegen frisch angelegte Buckets geweigert (RLS-Fehler trotz
  // nachweislich identischer Policies — vermutlich ein Plattform-Bug), während
  // "documents" zuverlässig funktioniert. avatar_url speichert hier bewusst den
  // Storage-PFAD (nicht wirklich eine URL), da der Bucket privat ist — Anzeige läuft
  // über kurzlebige Signed URLs, genau wie bei den Evidence-Vault-Dokumenten.
  const uploadAvatar = useCallback(
    async (file) => {
      if (!profile) return;
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${profile.id}/avatar.${ext}`;
      const supabase = createClient();
      const { error: uploadError } = await supabase.storage.from("documents").upload(path, file, { upsert: true });
      if (uploadError) {
        toast(t("avatarUploadError", { message: uploadError.message }));
        return;
      }
      const { error } = await supabase.from("profiles").update({ avatar_url: path }).eq("id", profile.id);
      if (error) {
        toast(t("avatarUploadError", { message: error.message }));
        return;
      }
      setProfile((p) => ({ ...p, avatar_url: path }));
      toast(t("avatarUploaded"));
    },
    [profile, toast, t]
  );

  const removeAvatar = useCallback(async () => {
    if (!profile) return;
    const supabase = createClient();
    if (profile.avatar_url) {
      await supabase.storage.from("documents").remove([profile.avatar_url]);
    }
    const { error } = await supabase.from("profiles").update({ avatar_url: null }).eq("id", profile.id);
    if (error) {
      toast(t("avatarRemoveError"));
      return;
    }
    setProfile((p) => ({ ...p, avatar_url: null }));
    toast(t("avatarRemoved"));
  }, [profile, toast, t]);

  const changePassword = useCallback(
    async (newPassword) => {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      toast(error ? t("passwordError", { message: error.message }) : t("passwordChanged"));
      return !error;
    },
    [toast, t]
  );

  const updateLocale = useCallback(
    async (newLocale) => {
      if (!profile) return;
      setProfile((p) => ({ ...p, locale: newLocale }));
      const supabase = createClient();
      const { error } = await supabase.from("profiles").update({ locale: newLocale }).eq("id", profile.id);
      if (error) toast(t("localeSaveError"));
    },
    [profile, toast, t]
  );

  const deleteAccount = useCallback(async () => {
    const res = await fetch("/api/account", { method: "DELETE" });
    if (!res.ok) {
      toast(t("accountDeleteError"));
      return false;
    }
    return true;
  }, [toast, t]);

  const addSkill = useCallback(
    async (name) => {
      const trimmed = name.trim();
      if (!trimmed || !profile) return;
      if (skills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) return;
      const supabase = createClient();
      const { data, error } = await supabase
        .from("skills")
        .insert({ profile_id: profile.id, name: trimmed })
        .select()
        .single();
      if (error) {
        toast(t("skillAddError"));
        return;
      }
      setSkills((s) => [...s, data]);
    },
    [profile, skills, toast, t]
  );

  const removeSkill = useCallback(
    async (id) => {
      const supabase = createClient();
      setSkills((s) => s.filter((x) => x.id !== id));
      const { error } = await supabase.from("skills").delete().eq("id", id);
      if (error) toast(t("skillRemoveError"));
    },
    [toast, t]
  );

  const addWorkExperience = useCallback(
    async (entry) => {
      if (!profile) return;
      const supabase = createClient();
      const { data, error } = await supabase
        .from("work_experience")
        .insert({
          profile_id: profile.id,
          title: entry.title,
          company: entry.company,
          location: entry.location || null,
          start_date: entry.start_date || null,
          end_date: entry.end_date || null,
          bullets: entry.bullets,
          sort_order: workExperience.length,
        })
        .select()
        .single();
      if (error) {
        toast(t("experienceSaveError"));
        return;
      }
      setWorkExperience((w) => [...w, data]);
      toast(t("experienceAdded"));
    },
    [profile, workExperience.length, toast, t]
  );

  const removeWorkExperience = useCallback(
    async (id) => {
      const supabase = createClient();
      setWorkExperience((w) => w.filter((x) => x.id !== id));
      const { error } = await supabase.from("work_experience").delete().eq("id", id);
      if (error) toast(t("experienceDeleteError"));
    },
    [toast, t]
  );

  const uploadDocument = useCallback(
    async ({ file, title, category, description }) => {
      if (!profile) return;
      if (!isPro && documents.length >= FREE_DOCUMENT_LIMIT) {
        toast(t("documentLimitReached", { limit: FREE_DOCUMENT_LIMIT }));
        setPanel("pricing");
        return;
      }
      const supabase = createClient();
      const path = `${profile.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("documents").upload(path, file);
      if (uploadError) {
        toast(t("uploadFailed", { message: uploadError.message }));
        return;
      }
      const { data, error } = await supabase
        .from("documents")
        .insert({
          user_id: profile.id,
          title: title || file.name,
          description: description || null,
          category,
          file_path: path,
        })
        .select()
        .single();
      if (error) {
        toast(t("documentSaveError"));
        await supabase.storage.from("documents").remove([path]);
        return;
      }
      setDocuments((d) => [data, ...d]);
      toast(t("documentUploaded"));
    },
    [profile, documents.length, isPro, toast, setPanel, t]
  );

  const deleteDocument = useCallback(
    async (doc) => {
      const supabase = createClient();
      setDocuments((d) => d.filter((x) => x.id !== doc.id));
      await supabase.storage.from("documents").remove([doc.file_path]);
      const { error } = await supabase.from("documents").delete().eq("id", doc.id);
      if (error) toast(t("documentDeleteError"));
    },
    [toast, t]
  );

  const downloadDocument = useCallback(
    async (doc) => {
      const supabase = createClient();
      const { data, error } = await supabase.storage.from("documents").createSignedUrl(doc.file_path, 60);
      if (error || !data) {
        toast(t("downloadLinkError"));
        return;
      }
      window.open(data.signedUrl, "_blank");
    },
    [toast, t]
  );

  const addApplication = useCallback(
    async ({ company, role_title, match_score }) => {
      if (!profile) return;
      if (!isPro && applications.length >= FREE_APPLICATION_LIMIT) {
        toast(t("applicationLimitReached", { limit: FREE_APPLICATION_LIMIT }));
        setPanel("pricing");
        return;
      }
      const supabase = createClient();
      const { data, error } = await supabase
        .from("applications")
        .insert({ user_id: profile.id, company, role_title, match_score: match_score ?? null, status: "saved" })
        .select()
        .single();
      if (error) {
        toast(t("applicationSaveError"));
        return;
      }
      setApplications((a) => [data, ...a]);
      toast(t("applicationAdded"));
    },
    [profile, applications.length, isPro, toast, setPanel, t]
  );

  const updateApplicationStatus = useCallback(
    async (id, status) => {
      const current = applications.find((a) => a.id === id);
      if (!current || current.status === status) return;
      const patch = { status };
      if (status !== "saved" && !current.applied_at) {
        patch.applied_at = new Date().toISOString();
      }
      setApplications((a) => a.map((app) => (app.id === id ? { ...app, ...patch } : app)));
      const supabase = createClient();
      const { error } = await supabase.from("applications").update(patch).eq("id", id);
      if (error) toast(t("statusUpdateError"));
    },
    [applications, toast, t]
  );

  const deleteApplication = useCallback(
    async (id) => {
      const supabase = createClient();
      setApplications((a) => a.filter((app) => app.id !== id));
      const { error } = await supabase.from("applications").delete().eq("id", id);
      if (error) toast(t("applicationDeleteError"));
    },
    [toast, t]
  );

  const createCvVersion = useCallback(
    async (label, duplicateFromId) => {
      if (!profile) return;
      const source = cvVersions.find((v) => v.id === duplicateFromId);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("cv_versions")
        .insert({
          user_id: profile.id,
          label,
          summary: source?.summary || "",
          experience_text: source?.experience_text || "",
          education_text: source?.education_text || "",
          skills_text: source?.skills_text || skills.map((s) => s.name).join(" · "),
          achievements_text: source?.achievements_text || "",
        })
        .select()
        .single();
      if (error) {
        toast(t("versionCreateError"));
        return;
      }
      setCvVersions((v) => [data, ...v]);
      setSelectedVersionId(data.id);
      toast(t("versionCreated"));
    },
    [profile, cvVersions, skills, toast, t]
  );

  const updateVersionField = useCallback(
    (field, value) => {
      setCvVersions((v) => v.map((ver) => (ver.id === selectedVersionId ? { ...ver, [field]: value } : ver)));
    },
    [selectedVersionId]
  );

  const saveCvVersion = useCallback(async () => {
    const version = cvVersions.find((v) => v.id === selectedVersionId);
    if (!version) return;
    const supabase = createClient();
    const { id, label, summary, experience_text, education_text, skills_text, achievements_text, application_id } = version;
    const { error } = await supabase
      .from("cv_versions")
      .update({ label, summary, experience_text, education_text, skills_text, achievements_text, application_id })
      .eq("id", id);
    toast(error ? t("saveErrorWithMessage", { message: error.message }) : t("versionSaved"));
  }, [cvVersions, selectedVersionId, toast, t]);

  const deleteCvVersion = useCallback(
    async (id) => {
      const supabase = createClient();
      setCvVersions((v) => v.filter((ver) => ver.id !== id));
      setSelectedVersionId((cur) => {
        if (cur !== id) return cur;
        const remaining = cvVersions.filter((ver) => ver.id !== id);
        return remaining[0]?.id ?? null;
      });
      const { error } = await supabase.from("cv_versions").delete().eq("id", id);
      if (error) toast(t("versionDeleteError"));
    },
    [cvVersions, toast, t]
  );

  const downloadCv = useCallback(
    async (type) => {
      if (!isPro) {
        toast(t("downloadsProOnly"));
        setPanel("pricing");
        return;
      }
      const version = cvVersions.find((v) => v.id === selectedVersionId);
      if (!version) {
        toast(t("noVersionSelected"));
        return;
      }
      toast(t("preparingDownload", { type }));
      try {
        const res = await fetch(`/api/cv/export?versionId=${version.id}&type=${type.toLowerCase()}`);
        if (!res.ok) {
          toast(t("exportFailed"));
          return;
        }
        const blob = await res.blob();
        const name = profile?.full_name || userEmail || "CV";
        const filename = `${name.replace(/\s+/g, "_")}_${version.label.replace(/\s+/g, "_")}.${type.toLowerCase()}`;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        toast(t("cvDownloaded"));
      } catch (err) {
        toast(t("exportFailed"));
      }
    },
    [isPro, cvVersions, selectedVersionId, profile, userEmail, toast, setPanel, t]
  );

  const generateCv = useCallback(
    async (analysisId) => {
      if (!isPro) {
        toast(t("cvGenerateProOnly"));
        setPanel("pricing");
        return;
      }
      if (!analysisId) return;
      setGeneratingCv(true);
      try {
        const res = await fetch("/api/cv/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ analysisId }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast(data?.message || t("cvGenerateFailed"));
          return;
        }
        setCvVersions((v) => [data.version, ...v]);
        setSelectedVersionId(data.version.id);
        setPanel("builder");
        toast(t("cvGenerated"));
      } catch (err) {
        toast(t("cvGenerateFailed"));
      } finally {
        setGeneratingCv(false);
      }
    },
    [isPro, toast, setPanel, t]
  );

  const sendChatMessage = useCallback(
    (text, replyMap) => {
      if (!isPro && aiMessagesUsed >= FREE_AI_LIMIT) {
        setChatMessages((m) => [
          ...m,
          { who: "bot", text: tAssistant("limitReached", { limit: FREE_AI_LIMIT }) },
        ]);
        setChatLocked(true);
        return;
      }
      setChatMessages((m) => [...m, { who: "user", text }]);
      if (!isPro) setAiMessagesUsed((n) => n + 1);
      setTimeout(() => {
        const reply = (replyMap && replyMap[text]) || tAssistant("defaultReply");
        setChatMessages((m) => [...m, { who: "bot", text: reply }]);
      }, 650);
    },
    [isPro, aiMessagesUsed, tAssistant]
  );

  const value = {
    panel, setPanel,
    userEmail,
    profile, updateProfileField, saveProfile, uploadAvatar, removeAvatar,
    changePassword, updateLocale, deleteAccount,
    workExperience, addWorkExperience, removeWorkExperience,
    skills, addSkill, removeSkill,
    documents, uploadDocument, deleteDocument, downloadDocument, FREE_DOCUMENT_LIMIT,
    applications, addApplication, updateApplicationStatus, deleteApplication, FREE_APPLICATION_LIMIT,
    selectedApplicationId, setSelectedApplicationId,
    isPro, setPlan,
    priceMode, setPriceMode,
    analysesUsed, FREE_ANALYSIS_LIMIT,
    aiMessagesUsed, FREE_AI_LIMIT, chatLocked,
    toasts, toast,
    loading, loadingStep,
    cvVersions, selectedVersionId, setSelectedVersionId,
    createCvVersion, updateVersionField, saveCvVersion, deleteCvVersion, downloadCv,
    generateCv, generatingCv,
    chatMessages, sendChatMessage,
    prepShown, setPrepShown,
    runAnalysis, currentAnalysis, analyzing,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
