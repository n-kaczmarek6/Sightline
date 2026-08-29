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
      "Je Station EINE Kopfzeile 'Titel, Firma (Zeitraum)', darunter maximal 3 kurze Aufzählungspunkte mit '•' — nur die relevantesten 2-3 Stationen, nur echte, im Profil belegte Erfahrung. Insgesamt kompakt genug für eine DIN-A4-Seite."
    ),
  skills_text: z.string().describe("8-12 relevante Skills aus dem Profil, kommagetrennt, nach Relevanz für die Stelle sortiert — keine Sätze, keine Beschreibungen"),
  education_text: z.string().describe("Je Abschluss EINE Zeile: 'Abschluss, Fach — Institution (Jahr)'. Nur echte, im Profil belegte Ausbildung. Leer lassen falls keine Ausbildung im Profil steht."),
  achievements_text: z.string().describe("Maximal 3 kurze Aufzählungspunkte mit '•' zu konkreten Erfolgen/Kennzahlen aus der echten Erfahrung, falls im Profil vorhanden — sonst leer lassen"),
});

function systemPrompt(outputLocale) {
  const language = outputLocale === "en" ? "Englisch" : "Deutsch";
  return `Du bist der CV-Generator von Sightline, einem AI Job Application Copilot. Erstelle aus dem echten Profil einer Person (ggf. ergänzt um einen hochgeladenen, bestehenden Lebenslauf als zweite, gleichwertig vertrauenswürdige Quelle) einen ATS-konformen, auf die gegebene Stellenausschreibung zugeschnittenen Lebenslauf-Entwurf.

WICHTIGSTE REGEL: Erfinde niemals Skills, Erfahrungen, Firmen, Titel oder Kennzahlen, die nicht im Profil bzw. im hochgeladenen Lebenslauf stehen. Nutze ausschließlich echte Angaben aus diesen Quellen — formuliere sie klarer, ordne sie nach Relevanz für die Stelle und hebe hervor, was zur Stellenausschreibung passt. Was dort fehlt, wird einfach weggelassen, niemals erfunden.

LÄNGE IST KRITISCH: Der gesamte Lebenslauf muss auf eine einzige DIN-A4-Seite passen (bei sehr umfangreicher, hoch relevanter Erfahrung maximal 1,5 Seiten). Sei bewusst knapp: lieber wenige, präzise, wirklich aussagekräftige Punkte als viele mittelmäßige. Bei mehreren Berufserfahrungen nur die für DIESE Stelle relevantesten 2-3 Stationen ausführen, ältere/weniger relevante Stationen weglassen statt vollständig aufzulisten.

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
