import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import deMessages from "@/messages/de.json";
import enMessages from "@/messages/en.json";

const InterviewSchema = z.object({
  work_experience: z.array(
    z.object({
      title: z.string(),
      company: z.string(),
      location: z.string().optional(),
      start_date: z.string().nullable().describe("YYYY-MM-01, nur falls Monat/Jahr klar erkennbar, sonst null"),
      end_date: z.string().nullable().describe("YYYY-MM-01, oder null falls 'current' true ist oder kein Enddatum genannt wurde"),
      current: z.boolean(),
      bullets: z.array(z.string()).describe("Stichpunkte zu den Aufgaben, nur aus dem Text belegt"),
    })
  ),
  education: z.array(
    z.object({
      degree: z.string(),
      field_of_study: z.string().optional(),
      institution: z.string(),
      location: z.string().optional(),
      start_date: z.string().nullable(),
      end_date: z.string().nullable(),
      current: z.boolean(),
      description: z.string().optional(),
    })
  ),
  skills: z.array(z.string()).describe("Nur exakt aus der gegebenen Skill-Liste, nur klar belegte"),
  languages: z.array(z.string()).describe("Nur exakt aus der gegebenen Sprachen-Liste, nur klar belegte"),
  target_roles: z.array(z.string()).describe("Zielrollen/Wunschpositionen, falls in der Antwort zu Zielen genannt"),
  target_locations: z.array(z.string()).describe("Zielorte, falls genannt"),
  work_model: z.enum(["remote", "hybrid", "onsite"]).nullable(),
});

function systemPrompt(locale, skillList, languageList) {
  const language = locale === "en" ? "Englisch" : "Deutsch";
  return `Du extrahierst aus frei formulierten Interview-Antworten einer Person strukturierte Lebenslauf-Daten für Sightline, einen AI Job Application Copilot.

WICHTIGSTE REGEL: Erfinde niemals Informationen, die nicht in den Antworten stehen. Wenn ein Datum, Firmenname, Studienfach o. Ä. nicht erwähnt wird, lass das Feld leer bzw. null statt zu raten. Bei Unklarheit lieber weniger extrahieren als zu viel.

Mehrere Berufserfahrungen bzw. Ausbildungsstationen in einer Antwort einzeln als separate Array-Einträge extrahieren.

Skills: nur exakt aus dieser Liste wählen, nur wenn im Text klar belegt:
${skillList.join(", ")}

Sprachen: nur exakt aus dieser Liste wählen, nur wenn im Text klar belegt:
${languageList.join(", ")}

Antworte auf ${language}, auch wenn die Eingabe eine andere Sprache ist – gib Eigennamen (Firmen, Institutionen) aber unverändert wieder.`;
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

  const answers = body?.answers || {};
  const combined = [
    answers.experience && `BERUFSERFAHRUNG:\n${answers.experience}`,
    answers.education && `AUSBILDUNG:\n${answers.education}`,
    answers.skills && `SKILLS:\n${answers.skills}`,
    answers.languages && `SPRACHEN:\n${answers.languages}`,
    answers.goals && `ZIELE:\n${answers.goals}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  if (combined.trim().length < 10) {
    return NextResponse.json({ error: "answers_too_short" }, { status: 400 });
  }

  const { data: profile } = await supabase.from("profiles").select("locale").eq("id", user.id).single();
  const locale = profile?.locale === "en" ? "en" : "de";
  const messages = locale === "en" ? enMessages : deMessages;
  const skillList = messages.profile.suggestions.allSkills;
  const languageList = messages.profile.suggestions.languages;

  const anthropic = new Anthropic();
  let parsed;
  try {
    const response = await anthropic.messages.parse({
      model: "claude-sonnet-5",
      max_tokens: 8000,
      thinking: { type: "adaptive" },
      system: systemPrompt(locale, skillList, languageList),
      messages: [{ role: "user", content: combined }],
      output_config: { format: zodOutputFormat(InterviewSchema) },
    });
    parsed = response.parsed_output;
  } catch (err) {
    console.error("Anthropic API error:", err);
    return NextResponse.json({ error: "ai_error", message: err.message }, { status: 502 });
  }

  if (!parsed) {
    return NextResponse.json({ error: "parse_failed" }, { status: 502 });
  }

  const bySkillLower = new Map(skillList.map((s) => [s.toLowerCase(), s]));
  const byLangLower = new Map(languageList.map((s) => [s.toLowerCase(), s]));

  const result = {
    work_experience: (parsed.work_experience || []).filter((e) => e.title?.trim() && e.company?.trim()),
    education: (parsed.education || []).filter((e) => e.degree?.trim() && e.institution?.trim()),
    skills: [...new Set((parsed.skills || []).map((s) => bySkillLower.get(s.trim().toLowerCase())).filter(Boolean))],
    languages: [...new Set((parsed.languages || []).map((l) => byLangLower.get(l.trim().toLowerCase())).filter(Boolean))],
    target_roles: (parsed.target_roles || []).map((r) => r.trim()).filter(Boolean),
    target_locations: (parsed.target_locations || []).map((l) => l.trim()).filter(Boolean),
    work_model: parsed.work_model || null,
  };

  return NextResponse.json(result);
}
