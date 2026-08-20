import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

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

function buildProfileSummary(profile, workExperience, skills) {
  const lines = [];
  if (profile?.full_name) lines.push(`Name: ${profile.full_name}`);
  if (profile?.location || profile?.country) {
    lines.push(`Standort: ${[profile.location, profile.country].filter(Boolean).join(", ")}`);
  }
  if (profile?.target_roles?.length) lines.push(`Zielrollen: ${profile.target_roles.join(", ")}`);
  if (profile?.work_model) lines.push(`Bevorzugtes Arbeitsmodell: ${profile.work_model}`);

  lines.push("");
  lines.push("BERUFSERFAHRUNG:");
  if (!workExperience?.length) lines.push("(keine angegeben)");
  for (const exp of workExperience || []) {
    lines.push(`- ${exp.title} bei ${exp.company} (${exp.start_date || "?"} – ${exp.end_date || "heute"})`);
    for (const b of exp.bullets || []) lines.push(`  • ${b}`);
  }

  lines.push("");
  lines.push(`SKILLS: ${skills?.length ? skills.map((s) => s.name).join(", ") : "(keine angegeben)"}`);

  return lines.join("\n");
}

function systemPrompt(outputLocale) {
  const language = outputLocale === "en" ? "Englisch" : "Deutsch";
  return `Du bist der Match-Analyse-Motor von Sightline, einem AI Job Application Copilot. Vergleiche das gegebene Profil einer Person mit einer Stellenbeschreibung und bewerte, wie gut sie zusammenpassen.

WICHTIGSTE REGEL: Erfinde niemals Skills, Erfahrungen oder Qualifikationen, die nicht explizit im gegebenen Profil stehen. Was die Stellenbeschreibung fordert, aber im Profil nicht belegt ist, gehört in "gaps" bzw. wird als Keyword-Status "weak" oder "missing" markiert — niemals als erfundene Stärke.

Bei Empfehlungen: Schlage nur bessere Formulierungen ECHTER, im Profil belegter Erfahrung vor. "current" zeigt ein Beispiel unklarer/schwacher Formulierung, "suggested" eine klarere Formulierung DERSELBEN echten Erfahrung. Erfinde nie neue Erfahrung.

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

  const jobDescription = (body?.jobDescription || "").trim();
  if (jobDescription.length < 20) {
    return NextResponse.json({ error: "job_description_too_short" }, { status: 400 });
  }

  const [{ data: profile }, { data: workExperience }, { data: skills }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("work_experience").select("*").eq("profile_id", user.id).order("sort_order"),
    supabase.from("skills").select("*").eq("profile_id", user.id).order("created_at"),
  ]);

  const anthropic = new Anthropic();
  const profileSummary = buildProfileSummary(profile, workExperience, skills);

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
          content: `PROFIL:\n${profileSummary}\n\nSTELLENBESCHREIBUNG:\n${jobDescription}`,
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
