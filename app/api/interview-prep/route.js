import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { buildProfileSummary } from "@/lib/ai/profile-summary";

const InterviewPrepSchema = z.object({
  topics: z.array(z.string()).describe("3-6 kurze Themen-Labels, die im Interview wahrscheinlich drankommen"),
  questions: z.array(
    z.object({
      question: z.string(),
      tip: z
        .string()
        .describe(
          "Kurzer, konkreter Tipp zur Beantwortung. Falls im Profil eine passende echte Erfahrung existiert, darauf verweisen (z. B. welches Projekt/welche Station sich eignet) — sonst allgemeiner Tipp, nie eine Erfahrung erfinden."
        ),
    })
  ),
});

function systemPrompt(outputLocale, hasJobDescription) {
  const language = outputLocale === "en" ? "Englisch" : "Deutsch";
  return `Du bist der Interview-Vorbereitungs-Assistent von Sightline, einem AI Job Application Copilot. Erstelle wahrscheinliche Interview-Themen und Übungsfragen für eine Person, die sich auf ein Bewerbungsgespräch vorbereitet.

${hasJobDescription
    ? "Grundlage sind die gegebene Stellenbeschreibung und das Profil der Person. Themen und Fragen müssen zur konkreten Rolle passen."
    : "Es liegt keine Stellenbeschreibung vor, nur Rolle/Unternehmen und das Profil — leite plausible, aber allgemein gehaltene Themen und Fragen für diese Art von Rolle ab."
  }

WICHTIGSTE REGEL: Erfinde niemals Erfahrungen, Projekte oder Qualifikationen der Person, die nicht im Profil stehen. Tipps zur Beantwortung dürfen nur auf echte, im Profil belegte Erfahrung verweisen. Falls das Profil zu einem Thema nichts hergibt, gib einen allgemeinen Tipp statt eine Erfahrung zu erfinden.

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

  const applicationId = body?.applicationId;
  if (!applicationId) {
    return NextResponse.json({ error: "application_id_required" }, { status: 400 });
  }

  const { data: application } = await supabase
    .from("applications")
    .select("*")
    .eq("id", applicationId)
    .eq("user_id", user.id)
    .single();

  if (!application) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const [{ data: analysisRows }, { data: profile }, { data: workExperience }, { data: education }, { data: skills }] = await Promise.all([
    supabase
      .from("job_analyses")
      .select("job_description, gaps, strengths")
      .eq("application_id", applicationId)
      .order("created_at", { ascending: false })
      .limit(1),
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("work_experience").select("*").eq("profile_id", user.id).order("sort_order"),
    supabase.from("education").select("*").eq("profile_id", user.id).order("sort_order"),
    supabase.from("skills").select("*").eq("profile_id", user.id).order("created_at"),
  ]);

  const analysis = analysisRows?.[0] || null;
  const profileSummary = buildProfileSummary(profile, workExperience, skills, education);

  const contentParts = [
    `ROLLE: ${application.role_title} bei ${application.company}`,
    `PROFIL:\n${profileSummary}`,
  ];
  if (analysis?.job_description) {
    contentParts.push(`STELLENBESCHREIBUNG:\n${analysis.job_description}`);
  }
  if (analysis?.gaps?.length) {
    contentParts.push(`AUS DER MATCH-ANALYSE BEKANNTE LÜCKEN (evtl. gezielt vorbereiten, nicht erfinden):\n${analysis.gaps.join("; ")}`);
  }

  const anthropic = new Anthropic();
  let parsed;
  try {
    const response = await anthropic.messages.parse({
      model: "claude-opus-5",
      max_tokens: 8000,
      thinking: { type: "adaptive" },
      system: systemPrompt(profile?.locale, !!analysis?.job_description),
      messages: [{ role: "user", content: contentParts.join("\n\n") }],
      output_config: { format: zodOutputFormat(InterviewPrepSchema) },
    });
    parsed = response.parsed_output;
  } catch (err) {
    console.error("Anthropic API error:", err);
    return NextResponse.json({ error: "ai_error", message: err.message }, { status: 502 });
  }

  if (!parsed) {
    return NextResponse.json({ error: "parse_failed" }, { status: 502 });
  }

  return NextResponse.json(parsed);
}
