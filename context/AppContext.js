"use client";
import { createContext, useContext, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

const AppContext = createContext(null);

const FREE_ANALYSIS_LIMIT = 3;
const FREE_AI_LIMIT = 4;

const initialKanban = {
  saved: [
    { id: "hubspot-pmm", co: "HubSpot", role: "Product Marketing Manager", match: "91%" },
    { id: "zalando-gm", co: "Zalando", role: "Growth Manager", match: "76%" },
  ],
  applied: [
    { id: "spotify-mm", co: "Spotify", role: "Marketing Manager", match: "84%" },
    { id: "salesforce-pmm", co: "Salesforce", role: "Product Marketing Manager", match: "79%" },
  ],
  screening: [
    { id: "personio-gmm", co: "Personio", role: "Growth Marketing Manager", match: "80%" },
  ],
  interview: [
    { id: "adobe-smm", co: "Adobe", role: "Senior Marketing Manager", match: "88%" },
  ],
  offer: [
    { id: "example-pml", co: "Example Corp.", role: "Product Marketing Lead", match: "90%" },
  ],
  rejected: [
    { id: "example-mm", co: "Example Co.", role: "Marketing Manager", match: "68%" },
  ],
};

const ORIGINAL_SUMMARY =
  "Senior Marketing Manager mit 8+ Jahren Erfahrung im B2B-SaaS-Wachstum durch integrierte Marketing-Kampagnen und Teamführung.";
const IMPROVED_SUMMARY =
  "Senior Marketing Manager mit 8+ Jahren Erfahrung in Go-to-Market-Strategie und Product Marketing für B2B-SaaS-Plattformen — cross-funktionale Zusammenarbeit für Produkt-Launches und Pipeline-Wachstum.";

export function AppProvider({
  children,
  userEmail,
  initialProfile,
  initialWorkExperience,
  initialSkills,
}) {
  // ---- navigation ----
  const [panel, setPanelState] = useState("dashboard");

  // ---- profile (real Supabase data) ----
  const [profile, setProfile] = useState(initialProfile || null);
  const [workExperience, setWorkExperience] = useState(initialWorkExperience || []);
  const [skills, setSkills] = useState(initialSkills || []);

  // ---- plan / paywall ----
  const [isPro, setIsPro] = useState(false);
  const [priceMode, setPriceMode] = useState("monthly");
  const [analysesUsed, setAnalysesUsed] = useState(2);
  const [aiMessagesUsed, setAiMessagesUsed] = useState(0);

  // ---- ui ----
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  // ---- kanban ----
  const [kanban, setKanban] = useState(initialKanban);

  // ---- cv builder ----
  const [cvSummary, setCvSummary] = useState(ORIGINAL_SUMMARY);
  const [cvExperience, setCvExperience] = useState(
    "Led go-to-market campaigns for 3 SaaS product launches, increasing qualified pipeline by 28%. Partnered cross-functionally with product, sales and design. Managed a team of 4 marketing specialists."
  );
  const [cvEducation, setCvEducation] = useState(
    "MBA, Digital Business — Hochschule Reutlingen · B.Sc. Business Administration"
  );
  const [cvSkills, setCvSkills] = useState(
    "Product Marketing · Go-to-Market Strategy · B2B SaaS · Cross-functional Leadership · Google Analytics · HubSpot"
  );
  const [cvAchievements, setCvAchievements] = useState(
    "Google Analytics Certification (2025) · Teamproduktivität um 18% gesteigert (Performance Review 2025)"
  );

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
    (onDone) => {
      if (!isPro && analysesUsed >= FREE_ANALYSIS_LIMIT) {
        toast("Du hast alle 3 freien Analysen diesen Monat genutzt.");
        setPanel("pricing");
        return;
      }
      if (!isPro) setAnalysesUsed((n) => n + 1);
      setLoading(true);
      setLoadingStep(0);
      const steps = 4;
      let i = 0;
      const tick = () => {
        i++;
        setLoadingStep(i);
        if (i < steps) {
          setTimeout(tick, 850);
        } else {
          setTimeout(() => {
            setLoading(false);
            setPanel("analysis");
            if (onDone) onDone();
          }, 400);
        }
      };
      setTimeout(tick, 850);
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

  const moveCard = useCallback((cardId, fromCol, toCol) => {
    setKanban((prev) => {
      if (fromCol === toCol) return prev;
      const card = prev[fromCol].find((c) => c.id === cardId);
      if (!card) return prev;
      return {
        ...prev,
        [fromCol]: prev[fromCol].filter((c) => c.id !== cardId),
        [toCol]: [...prev[toCol], card],
      };
    });
  }, []);

  const improveSummary = useCallback(() => {
    setCvSummary(IMPROVED_SUMMARY);
    toast("Summary mit AI verbessert.");
  }, [toast]);

  const revertSummary = useCallback(() => {
    setCvSummary(ORIGINAL_SUMMARY);
    toast("Zurück zum Original-Summary.");
  }, [toast]);

  const downloadCv = useCallback(
    (type) => {
      if (!isPro) {
        toast("CV-Downloads sind ein Pro-Feature.");
        setPanel("pricing");
        return;
      }
      toast(`${type} wird vorbereitet…`);
      setTimeout(() => {
        const content = `ALEX MORGAN\nProduct Marketing Manager — angepasst für HubSpot\n\nSUMMARY\n${cvSummary}\n\nEXPERIENCE\n${cvExperience}\n\nEDUCATION\n${cvEducation}\n\nSKILLS\n${cvSkills}\n\nCERTIFICATIONS & ACHIEVEMENTS\n${cvAchievements}`;
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Alex_Morgan_CV_HubSpot_v4.txt";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        toast("CV heruntergeladen (Prototyp-Export).");
      }, 700);
    },
    [isPro, cvSummary, cvExperience, cvEducation, cvSkills, cvAchievements, toast, setPanel]
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
    workExperience, addWorkExperience, removeWorkExperience,
    skills, addSkill, removeSkill,
    isPro, setPlan,
    priceMode, setPriceMode,
    analysesUsed, FREE_ANALYSIS_LIMIT,
    aiMessagesUsed, FREE_AI_LIMIT, chatLocked,
    toasts, toast,
    loading, loadingStep,
    kanban, moveCard,
    cvSummary, setCvSummary,
    cvExperience, setCvExperience,
    cvEducation, setCvEducation,
    cvSkills, setCvSkills,
    cvAchievements, setCvAchievements,
    improveSummary, revertSummary, downloadCv,
    chatMessages, sendChatMessage,
    prepShown, setPrepShown,
    runAnalysis,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
