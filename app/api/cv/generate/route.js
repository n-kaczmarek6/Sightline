import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { buildProfileSummary } from "@/lib/ai/profile-summary";

const CvDraftSchema = z.object({
  label: z.string().describe("Kurzer Name für diese CV-Version, z.B. 'Product Marketing Manager — Firma X'"),
  summary: z.string().describe("Maximal 2 prägnante Sätze, zugeschnitten auf die Stellenausschreibung, nur echte Erfahrung"),
  experience_text: z
    .string()
    .describe(
      "Je Station EINE Kopfzeile 'Titel, Firma (Zeitraum)', darunter 3-4 aussagekräftige Aufzählungspunkte mit '•' — die relevantesten 3-4 Stationen, nur echte, im Profil belegte Erfahrung. Sei ausführlich genug, dass der Lebenslauf gut gefüllt wirkt, nicht künstlich verknappt."
    ),
  skills_text: z.string().describe("8-12 relevante Fach- und Methodenskills aus dem Profil, kommagetrennt, nach Relevanz für die Stelle sortiert — keine Sätze, keine Beschreibungen, keine Sprachen (die stehen in einem eigenen Abschnitt)"),
  education_text: z
    .string()
    .describe(
      "Je Abschluss EIN Absatz: erste Zeile 'Abschluss, Fach — Institution (Jahr)', danach falls im Profil vorhanden weitere Aufzählungspunkte mit '•' zu relevanten Kursen/Modulen/Schwerpunkten, Note und Studienprojekten/Abschlussarbeit — das sind wertvolle, belegbare Erfahrung und sollten nicht weggelassen werden, wenn sie im Profil stehen. Nur echte, im Profil belegte Ausbildung, nichts erfinden. Leer lassen falls keine Ausbildung im Profil steht."
    ),
  achievements_text: z.string().describe("Maximal 3 kurze Aufzählungspunkte mit '•' zu konkreten Erfolgen/Kennzahlen aus der echten Erfahrung, falls im Profil vorhanden — sonst leer lassen"),
});

function systemPrompt(outputLocale) {
  const language = outputLocale === "en" ? "Englisch" : "Deutsch";
  return `Du bist der CV-Generator von Sightline, einem AI Job Application Copilot. Erstelle aus dem echten Profil einer Person (ggf. ergänzt um einen hochgeladenen, bestehenden Lebenslauf als zweite, gleichwertig vertrauenswürdige Quelle) einen ATS-konformen, auf die gegebene Stellenausschreibung zugeschnittenen Lebenslauf-Entwurf.

WICHTIGSTE REGEL: Erfinde niemals Skills, Erfahrungen, Firmen, Titel oder Kennzahlen, die nicht im Profil bzw. im hochgeladenen Lebenslauf stehen. Nutze ausschließlich echte Angaben aus diesen Quellen — formuliere sie klarer, ordne sie nach Relevanz für die Stelle und hebe hervor, was zur Stellenausschreibung passt. Was dort fehlt, wird einfach weggelassen, niemals erfunden.

LÄNGE: Der Lebenslauf soll eine DIN-A4-Seite gut füllen (bei umfangreicher, hoch relevanter Erfahrung maximal 1,5 Seiten) — nicht mehr, aber auch nicht deutlich weniger. Eine halbleere Seite wirkt genauso unprofessionell wie eine überladene. Nutze den Platz: führe die relevantesten 3-4 Stationen mit jeweils 3-4 aussagekräftigen Punkten aus, und übernimm bei der Ausbildung auch relevante Module, Noten und Studienprojekte aus dem Profil, sofern vorhanden — das sind reale, wertvolle Erfahrungen. Bei mehreren Berufserfahrungen ältere/weniger relevante Stationen eher kürzen als komplett weglassen.

Schreibe ATS-freundlich: klare Formulierungen, ehrlich zutreffende Keywords aus der Stellenausschreibung, keine Tabellen oder Grafik-Beschreibungen, kurze prägnante Sätze bzw. Aufzählungspunkte mit '•'.

Antworte auf ${language}, unabhängig von der Sprache der Stellenbeschreibung.`;
}

export async function POST(request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const analysisId = body?.analysisId;
  if (!analysisId) {
    return NextResponse.json({ error: "analysis_id_required" }, { status: 400 });
  }

  const { data: analysis } = await supabase
    .from("job_analyses")
    .select("*")
    .eq("id", analysisId)
    .eq("user_id", user.id)
    .single();

  if (!analysis) {
    return NextResponse.json({ error: "analysis_not_found" }, { status: 404 });
  }

  const [{ data: profile }, { data: workExperience }, { data: education }, { data: skills }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("work_experience").select("*").eq("profile_id", user.id).order("sort_order"),
    supabase.from("education").select("*").eq("profile_id", user.id).order("sort_order"),
    supabase.from("skills").select("*").eq("profile_id", user.id).order("created_at"),
  ]);

  const anthropic = new Anthropic();
  const profileSummary = buildProfileSummary(profile, workExperience, skills, education);
  const cvSection = analysis.source_cv_text
    ? `\n\nHOCHGELADENER LEBENSLAUF (zweite Quelle, ebenso vertrauenswürdig wie das Profil):\n${analysis.source_cv_text}`
    : "";

  let parsed;
  try {
    const response = await anthropic.messages.parse({
      model: "claude-opus-5",
      max_tokens: 8000,
      thinking: { type: "adaptive" },
      system: systemPrompt(profile?.locale),
      messages: [
        {
          role: "user",
          content: `PROFIL:\n${profileSummary}${cvSection}\n\nSTELLENBESCHREIBUNG (${analysis.job_title || "?"} bei ${analysis.company || "?"}):\n${analysis.job_description}\n\nBEKANNTE LÜCKEN AUS DER MATCH-ANALYSE (nicht erfinden, nur zur Orientierung, was nicht betont werden sollte):\n${(analysis.gaps || []).join("; ") || "(keine)"}`,
        },
      ],
      output_config: { format: zodOutputFormat(CvDraftSchema) },
    });
    parsed = response.parsed_output;
  } catch (err) {
    console.error("Anthropic API error:", err);
    return NextResponse.json({ error: "ai_error", message: err.message }, { status: 502 });
  }

  if (!parsed) {
    return NextResponse.json({ error: "parse_failed" }, { status: 502 });
  }

  const { data: version, error: insertError } = await supabase
    .from("cv_versions")
    .insert({
      user_id: user.id,
      application_id: analysis.application_id,
      label: parsed.label,
      summary: parsed.summary,
      experience_text: parsed.experience_text,
      skills_text: parsed.skills_text,
      education_text: parsed.education_text,
      achievements_text: parsed.achievements_text,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: "db_error", message: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ version });
}
