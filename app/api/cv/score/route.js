import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const ScoreSchema = z.object({
  match_score: z.number().int().min(0).max(100),
  scores: z.object({
    skills_match: z.number().int().min(0).max(100),
    experience_match: z.number().int().min(0).max(100),
    keyword_coverage: z.number().int().min(0).max(100),
    education_match: z.number().int().min(0).max(100),
    ats_readiness: z.number().int().min(0).max(100),
  }),
});

function systemPrompt(outputLocale) {
  const language = outputLocale === "en" ? "Englisch" : "Deutsch";
  return `Du bist der Score-Motor von Sightline, einem AI Job Application Copilot. Du bekommst den tatsächlichen Text eines bereits fertig geschriebenen Lebenslaufs (nicht das rohe Profil) und eine Stellenbeschreibung. Bewerte, wie gut GENAU DIESER LEBENSLAUF-TEXT zur Stelle passt — als hättest du ihn zum ersten Mal gelesen.

WICHTIGSTE REGEL: Bewerte ausschließlich, was im gegebenen Lebenslauf-Text tatsächlich steht. Unterstelle keine zusätzlichen Fähigkeiten oder Erfahrungen, die dort nicht erwähnt sind.

Antworte auf ${language}.`;
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

  const versionId = body?.versionId;
  if (!versionId) {
    return NextResponse.json({ error: "version_id_required" }, { status: 400 });
  }

  const { data: version } = await supabase
    .from("cv_versions")
    .select("*")
    .eq("id", versionId)
    .eq("user_id", user.id)
    .single();

  if (!version) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (!version.application_id) {
    return NextResponse.json({ error: "not_linked" }, { status: 400 });
  }

  const { data: analysisRows } = await supabase
    .from("job_analyses")
    .select("job_description, job_title, company")
    .eq("application_id", version.application_id)
    .order("created_at", { ascending: false })
    .limit(1);

  const analysis = analysisRows?.[0];
  if (!analysis?.job_description) {
    return NextResponse.json({ error: "no_job_description" }, { status: 400 });
  }

  const { data: profile } = await supabase.from("profiles").select("locale").eq("id", user.id).single();

  const cvText = [
    version.summary && `ZUSAMMENFASSUNG:\n${version.summary}`,
    version.experience_text && `BERUFSERFAHRUNG:\n${version.experience_text}`,
    version.education_text && `AUSBILDUNG:\n${version.education_text}`,
    version.skills_text && `SKILLS:\n${version.skills_text}`,
    version.achievements_text && `ERFOLGE:\n${version.achievements_text}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  if (!cvText.trim()) {
    return NextResponse.json({ error: "cv_empty" }, { status: 400 });
  }

  const anthropic = new Anthropic();
  let parsed;
  try {
    const response = await anthropic.messages.parse({
      model: "claude-opus-5",
      max_tokens: 4000,
      thinking: { type: "adaptive" },
      system: systemPrompt(profile?.locale),
      messages: [
        {
          role: "user",
          content: `LEBENSLAUF-TEXT:\n${cvText}\n\nSTELLENBESCHREIBUNG (${analysis.job_title || "?"} bei ${analysis.company || "?"}):\n${analysis.job_description}`,
        },
      ],
      output_config: { format: zodOutputFormat(ScoreSchema) },
    });
    parsed = response.parsed_output;
  } catch (err) {
    console.error("Anthropic API error:", err);
    return NextResponse.json({ error: "ai_error", message: err.message }, { status: 502 });
  }

  if (!parsed) {
    return NextResponse.json({ error: "parse_failed" }, { status: 502 });
  }

  const { data: updated, error: updateError } = await supabase
    .from("cv_versions")
    .update({ match_score: parsed.match_score, scores: parsed.scores })
    .eq("id", versionId)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: "db_error", message: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ version: updated });
}
