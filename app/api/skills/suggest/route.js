import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import deMessages from "@/messages/de.json";
import enMessages from "@/messages/en.json";

const SuggestSchema = z.object({
  skills: z.array(z.string()).describe("Passende Skills aus der gegebenen Liste, maximal 8"),
});

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

  const description = (body?.description || "").trim();
  if (description.length < 10) {
    return NextResponse.json({ error: "description_too_short" }, { status: 400 });
  }

  const { data: profile } = await supabase.from("profiles").select("locale").eq("id", user.id).single();
  const locale = profile?.locale === "en" ? "en" : "de";
  const skillList = (locale === "en" ? enMessages : deMessages).profile.suggestions.allSkills;

  const anthropic = new Anthropic();

  let parsed;
  try {
    const response = await anthropic.messages.parse({
      model: "claude-sonnet-5",
      max_tokens: 1024,
      system: `Du bist ein Assistent, der aus einer Berufserfahrungs-Beschreibung passende Skills auswählt. Wähle NUR Skills aus der unten gegebenen Liste, die durch die Beschreibung wirklich belegt sind — erfinde keine neuen Skills und wähle nichts, das nicht klar erkennbar ist. Maximal 8 Skills, sortiert nach Relevanz.

Verfügbare Skills (nur exakt aus dieser Liste wählen):
${skillList.join(", ")}`,
      messages: [{ role: "user", content: description }],
      output_config: { format: zodOutputFormat(SuggestSchema) },
    });
    parsed = response.parsed_output;
  } catch (err) {
    console.error("Anthropic API error:", err);
    return NextResponse.json({ error: "ai_error", message: err.message }, { status: 502 });
  }

  if (!parsed) {
    return NextResponse.json({ error: "parse_failed" }, { status: 502 });
  }

  // Safety net: only keep skills that actually exist in our curated list.
  const byLowerCase = new Map(skillList.map((s) => [s.toLowerCase(), s]));
  const matched = [...new Set(parsed.skills.map((s) => byLowerCase.get(s.trim().toLowerCase())).filter(Boolean))];

  return NextResponse.json({ skills: matched });
}
