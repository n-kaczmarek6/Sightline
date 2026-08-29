import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { buildProfileSummary } from "@/lib/ai/profile-summary";
import { extractCvText } from "@/lib/cv-import/extract-text";

// Kein next-intl-Locale-Routing für /api — die Middleware schließt /api explizit
// aus (siehe middleware.js), Auth-Prüfung passiert deshalb hier manuell.

const AnalysisSchema = z.object({
  job_title: z.string().describe("Jobtitel aus der Stellenbeschreibung"),
  company: z.string().describe("Unternehmensname aus der Stellenbeschreibung, sonst 'Unbekannt'"),
  match_score: z.number().int().min(0).max(100),
  scores: z.object({
    skills_match: z.number().int().min(0).max(100),
    experience_match: z.number().int().min(0).max(100),
    keyword_coverage: z.number().int().min(0).max(100),
    education_match: z.number().int().min(0).max(100),
    ats_readiness: z.number().int().min(0).max(100),
  }),
  strengths: z.array(z.string()).describe("Konkrete Stärken, die im Profil belegt sind und zur Rolle passen"),
  gaps: z.array(z.string()).describe("Von der Stellenbeschreibung geforderte, im Profil aber nicht belegte Punkte"),
  keywords: z.array(
    z.object({
      category: z.enum(["skills", "tools", "soft_skills"]),
      label: z.string(),
      status: z.enum(["demonstrated", "weak", "missing"]),
      detail: z.string(),
      suggestion: z.string(),
    })
  ),
  recommendations: z.array(
    z.object({
      priority: z.number().int(),
      impact: z.enum(["high", "medium", "low"]),
      title: z.string(),
      current: z.string().describe("Beispiel, wie eine echte Erfahrung aus dem Profil aktuell unklar/schwach formuliert sein könnte"),
      suggested: z.string().describe("Bessere Formulierung DERSELBEN echten Erfahrung, nie neue Erfahrung erfinden"),
    })
  ),
});

function systemPrompt(outputLocale) {
  const language = outputLocale === "en" ? "Englisch" : "Deutsch";
  return `Du bist der Match-Analyse-Motor von Sightline, einem AI Job Application Copilot. Vergleiche das gegebene Profil einer Person (ggf. ergänzt um einen hochgeladenen, bestehenden Lebenslauf als zweite, gleichwertig vertrauenswürdige Quelle) mit einer Stellenbeschreibung und bewerte, wie gut sie zusammenpassen.

WICHTIGSTE REGEL: Erfinde niemals Skills, Erfahrungen oder Qualifikationen, die nicht explizit im Profil bzw. im hochgeladenen Lebenslauf stehen. Was die Stellenbeschreibung fordert, aber in keiner der beiden Quellen belegt ist, gehört in "gaps" bzw. wird als Keyword-Status "weak" oder "missing" markiert — niemals als erfundene Stärke.

Bei Empfehlungen: Schlage nur bessere Formulierungen ECHTER, belegter Erfahrung vor. "current" zeigt ein Beispiel unklarer/schwacher Formulierung, "suggested" eine klarere Formulierung DERSELBEN echten Erfahrung. Erfinde nie neue Erfahrung.

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

  let form;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "invalid_form_data" }, { status: 400 });
  }

  const jobDescription = (form.get("jobDescription") || "").toString().trim();
  if (jobDescription.length < 20) {
    return NextResponse.json({ error: "job_description_too_short" }, { status: 400 });
  }

  const cvFile = form.get("cvFile");
  let sourceCvText = null;
  if (cvFile && typeof cvFile === "object" && cvFile.size > 0) {
    try {
      const buffer = Buffer.from(await cvFile.arrayBuffer());
      sourceCvText = await extractCvText(buffer, cvFile.name);
    } catch (err) {
      return NextResponse.json({ error: "cv_file_unreadable", message: err.message }, { status: 400 });
    }
  }

  const [{ data: profile }, { data: workExperience }, { data: education }, { data: skills }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("work_experience").select("*").eq("profile_id", user.id).order("sort_order"),
    supabase.from("education").select("*").eq("profile_id", user.id).order("sort_order"),
    supabase.from("skills").select("*").eq("profile_id", user.id).order("created_at"),
  ]);

  const anthropic = new Anthropic();
  const profileSummary = buildProfileSummary(profile, workExperience, skills, education);
  const cvSection = sourceCvText
    ? `\n\nHOCHGELADENER LEBENSLAUF (zweite Quelle, ebenso vertrauenswürdig wie das Profil):\n${sourceCvText}`
    : "";

  let parsed;
  try {
    const response = await anthropic.messages.parse({
      model: "claude-sonnet-5",
      max_tokens: 8000,
      thinking: { type: "adaptive" },
      system: systemPrompt(profile?.locale),
      messages: [
        {
          role: "user",
          content: `PROFIL:\n${profileSummary}${cvSection}\n\nSTELLENBESCHREIBUNG:\n${jobDescription}`,
        },
      ],
      output_config: { format: zodOutputFormat(AnalysisSchema) },
    });
    parsed = response.parsed_output;
  } catch (err) {
    console.error("Anthropic API error:", err);
    return NextResponse.json({ error: "ai_error", message: err.message }, { status: 502 });
  }

  if (!parsed) {
    return NextResponse.json({ error: "parse_failed" }, { status: 502 });
  }

  const { data: application, error: appError } = await supabase
    .from("applications")
    .insert({
      user_id: user.id,
      company: parsed.company,
      role_title: parsed.job_title,
      match_score: parsed.match_score,
      status: "saved",
    })
    .select()
    .single();

  if (appError) {
    return NextResponse.json({ error: "db_error", message: appError.message }, { status: 500 });
  }

  const { data: analysis, error: analysisError } = await supabase
    .from("job_analyses")
    .insert({
      user_id: user.id,
      application_id: application.id,
      job_title: parsed.job_title,
      company: parsed.company,
      job_description: jobDescription,
      source_cv_text: sourceCvText,
      match_score: parsed.match_score,
      scores: parsed.scores,
      strengths: parsed.strengths,
      gaps: parsed.gaps,
      keywords: parsed.keywords,
      recommendations: parsed.recommendations,
    })
    .select()
    .single();

  if (analysisError) {
    return NextResponse.json({ error: "db_error", message: analysisError.message }, { status: 500 });
  }

  return NextResponse.json({ analysis, application });
}
