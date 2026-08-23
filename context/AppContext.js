"use client";
import { createContext, useContext, useState, useCallback } from "react";
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

  // ---- plan / paywall ----
  const [isPro, setIsPro] = useState(false);
  const [priceMode, setPriceMode] = useState("monthly");
  const [analysesUsed, setAnalysesUsed] = useState(initialAnalysesUsed || 0);
  const [aiMessagesUsed, setAiMessagesUsed] = useState(0);

  // ---- ui ----
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  // ---- chat ----
  const [chatMessages, setChatMessages] = useState([
    { who: "bot", text: "Hi Alex — ich kenne dein Profil, deine CVs, gespeicherte Jobs und Bewerbungen. Womit kann ich helfen?" },
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
          ? `Du bist jetzt auf Sightline Pro${priceMode === "sprint" ? " Sprint (14 Tage)." : "."}`
          : "Du bist zurück auf dem Free Plan."
      );
    },
    [priceMode, toast]
  );

  const runAnalysis = useCallback(
    async (jobDescription) => {
      if (!isPro && analysesUsed >= FREE_ANALYSIS_LIMIT) {
        toast(`Du hast alle ${FREE_ANALYSIS_LIMIT} freien Analysen diesen Monat genutzt.`);
        setPanel("pricing");
        return;
      }
      if (!jobDescription || jobDescription.trim().length < 20) {
        toast("Bitte füge eine vollständige Job Description ein.");
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
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobDescription }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast(data?.message || "Analyse fehlgeschlagen. Bitte versuch es erneut.");
          return;
        }
        setLoadingStep(4);
        setCurrentAnalysis(data.analysis);
        setApplications((a) => [data.application, ...a]);
        if (!isPro) setAnalysesUsed((n) => n + 1);
        setPanel("analysis");
      } catch (err) {
        toast("Analyse fehlgeschlagen. Bitte versuch es erneut.");
      } finally {
        clearInterval(stepInterval);
        setLoading(false);
        setAnalyzing(false);
      }
    },
    [isPro, analysesUsed, toast, setPanel]
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
      })
      .eq("id", id);
    toast(error ? `Fehler beim Speichern: ${error.message}` : "Profil gespeichert.");
  }, [profile, toast]);

  const changePassword = useCallback(
    async (newPassword) => {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      toast(error ? `Fehler: ${error.message}` : "Passwort geändert.");
      return !error;
    },
    [toast]
  );

  const updateLocale = useCallback(
    async (newLocale) => {
      if (!profile) return;
      setProfile((p) => ({ ...p, locale: newLocale }));
      const supabase = createClient();
      const { error } = await supabase.from("profiles").update({ locale: newLocale }).eq("id", profile.id);
      if (error) toast("Sprache konnte nicht gespeichert werden.");
    },
    [profile, toast]
  );

  const deleteAccount = useCallback(async () => {
    const res = await fetch("/api/account", { method: "DELETE" });
    if (!res.ok) {
      toast("Konto konnte nicht gelöscht werden.");
      return false;
    }
    return true;
  }, [toast]);

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
        toast("Skill konnte nicht hinzugefügt werden.");
        return;
      }
      setSkills((s) => [...s, data]);
    },
    [profile, skills, toast]
  );

  const removeSkill = useCallback(
    async (id) => {
      const supabase = createClient();
      setSkills((s) => s.filter((x) => x.id !== id));
      const { error } = await supabase.from("skills").delete().eq("id", id);
      if (error) toast("Skill konnte nicht entfernt werden.");
    },
    [toast]
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
        toast("Eintrag konnte nicht gespeichert werden.");
        return;
      }
      setWorkExperience((w) => [...w, data]);
      toast("Berufserfahrung hinzugefügt.");
    },
    [profile, workExperience.length, toast]
  );

  const removeWorkExperience = useCallback(
    async (id) => {
      const supabase = createClient();
      setWorkExperience((w) => w.filter((x) => x.id !== id));
      const { error } = await supabase.from("work_experience").delete().eq("id", id);
      if (error) toast("Eintrag konnte nicht gelöscht werden.");
    },
    [toast]
  );

  const uploadDocument = useCallback(
    async ({ file, title, category, description }) => {
      if (!profile) return;
      if (!isPro && documents.length >= FREE_DOCUMENT_LIMIT) {
        toast(`Free speichert ${FREE_DOCUMENT_LIMIT} Dokumente.`);
        setPanel("pricing");
        return;
      }
      const supabase = createClient();
      const path = `${profile.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("documents").upload(path, file);
      if (uploadError) {
        toast(`Upload fehlgeschlagen: ${uploadError.message}`);
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
        toast("Dokument konnte nicht gespeichert werden.");
        await supabase.storage.from("documents").remove([path]);
        return;
      }
      setDocuments((d) => [data, ...d]);
      toast("Dokument hochgeladen.");
    },
    [profile, documents.length, isPro, toast, setPanel]
  );

  const deleteDocument = useCallback(
    async (doc) => {
      const supabase = createClient();
      setDocuments((d) => d.filter((x) => x.id !== doc.id));
      await supabase.storage.from("documents").remove([doc.file_path]);
      const { error } = await supabase.from("documents").delete().eq("id", doc.id);
      if (error) toast("Dokument konnte nicht gelöscht werden.");
    },
    [toast]
  );

  const downloadDocument = useCallback(
    async (doc) => {
      const supabase = createClient();
      const { data, error } = await supabase.storage.from("documents").createSignedUrl(doc.file_path, 60);
      if (error || !data) {
        toast("Download-Link konnte nicht erstellt werden.");
        return;
      }
      window.open(data.signedUrl, "_blank");
    },
    [toast]
  );

  const addApplication = useCallback(
    async ({ company, role_title, match_score }) => {
      if (!profile) return;
      if (!isPro && applications.length >= FREE_APPLICATION_LIMIT) {
        toast(`Free trackt bis zu ${FREE_APPLICATION_LIMIT} Bewerbungen.`);
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
        toast("Bewerbung konnte nicht gespeichert werden.");
        return;
      }
      setApplications((a) => [data, ...a]);
      toast("Bewerbung hinzugefügt.");
    },
    [profile, applications.length, isPro, toast, setPanel]
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
      if (error) toast("Status konnte nicht aktualisiert werden.");
    },
    [applications, toast]
  );

  const deleteApplication = useCallback(
    async (id) => {
      const supabase = createClient();
      setApplications((a) => a.filter((app) => app.id !== id));
      const { error } = await supabase.from("applications").delete().eq("id", id);
      if (error) toast("Bewerbung konnte nicht gelöscht werden.");
    },
    [toast]
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
        toast("Version konnte nicht erstellt werden.");
        return;
      }
      setCvVersions((v) => [data, ...v]);
      setSelectedVersionId(data.id);
      toast("Neue CV-Version erstellt.");
    },
    [profile, cvVersions, skills, toast]
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
    toast(error ? `Fehler beim Speichern: ${error.message}` : "CV-Version gespeichert.");
  }, [cvVersions, selectedVersionId, toast]);

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
      if (error) toast("Version konnte nicht gelöscht werden.");
    },
    [cvVersions, toast]
  );

  const downloadCv = useCallback(
    (type) => {
      if (!isPro) {
        toast("CV-Downloads sind ein Pro-Feature.");
        setPanel("pricing");
        return;
      }
      const version = cvVersions.find((v) => v.id === selectedVersionId);
      if (!version) {
        toast("Keine CV-Version ausgewählt.");
        return;
      }
      toast(`${type} wird vorbereitet…`);
      setTimeout(() => {
        const name = profile?.full_name || userEmail || "Lebenslauf";
        const content = `${name.toUpperCase()}\n${version.label}\n\nSUMMARY\n${version.summary || ""}\n\nEXPERIENCE\n${version.experience_text || ""}\n\nEDUCATION\n${version.education_text || ""}\n\nSKILLS\n${version.skills_text || ""}\n\nCERTIFICATIONS & ACHIEVEMENTS\n${version.achievements_text || ""}`;
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${name.replace(/\s+/g, "_")}_CV_${version.label.replace(/\s+/g, "_")}.txt`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        toast("CV heruntergeladen (Prototyp-Export).");
      }, 700);
    },
    [isPro, cvVersions, selectedVersionId, profile, userEmail, toast, setPanel]
  );

  const sendChatMessage = useCallback(
    (text, replyMap) => {
      if (!isPro && aiMessagesUsed >= FREE_AI_LIMIT) {
        setChatMessages((m) => [
          ...m,
          {
            who: "bot",
            text: `Du hast alle ${FREE_AI_LIMIT} freien Nachrichten diesen Monat genutzt. Upgrade auf Pro für unlimited Career Coaching und Interview-Prep.`,
          },
        ]);
        setChatLocked(true);
        return;
      }
      setChatMessages((m) => [...m, { who: "user", text }]);
      if (!isPro) setAiMessagesUsed((n) => n + 1);
      setTimeout(() => {
        const reply =
          (replyMap && replyMap[text]) ||
          "Gute Frage — basierend auf deinem Profil und den gespeicherten Jobs würde ich zuerst deine Go-to-Market-Erfahrung expliziter machen. Soll ich dir zeigen, wo?";
        setChatMessages((m) => [...m, { who: "bot", text: reply }]);
      }, 650);
    },
    [isPro, aiMessagesUsed]
  );

  const value = {
    panel, setPanel,
    userEmail,
    profile, updateProfileField, saveProfile,
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
