import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const SuggestSchema = z.object({
  skills: z.array(z.string()).describe("Passende, konkrete Skills — maximal 8, sortiert nach Relevanz"),
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
  if (description.length < 3) {
    return NextResponse.json({ error: "description_too_short" }, { status: 400 });
  }

  const { data: profile } = await supabase.from("profiles").select("locale").eq("id", user.id).single();
  const locale = profile?.locale === "en" ? "en" : "de";
  const language = locale === "en" ? "Englisch" : "Deutsch";

  const anthropic = new Anthropic();

  // Bewusst NICHT auf eine feste, vorab kuratierte Liste beschränkt: die Liste
  // kann unmöglich jeden Beruf abdecken (Arzt, Elektriker, Bürokauffrau, ...),
  // die KI kennt aber die üblichen Fachbegriffe/Skills für praktisch jeden
  // Beruf. Einzige Regel bleibt: nur echte, durch die Beschreibung belegte
  // Skills, nichts erfinden, das nicht erkennbar ist.
  let parsed;
  try {
    const response = await anthropic.messages.parse({
      model: "claude-sonnet-5",
      max_tokens: 1024,
      system: `Du bist ein Assistent, der passende, konkrete Skills für einen Lebenslauf vorschlägt — unabhängig davon, um welchen Beruf es sich handelt (Handwerk, Medizin, Verwaltung, IT, Handel, Pflege, etc.). Der Nutzer gibt entweder eine ausführliche Tätigkeitsbeschreibung ODER nur einen Berufsnamen/Stichwort (z. B. "Elektriker" oder "Ärztin").

- Bei einer ausführlichen Beschreibung: wähle nur Skills, die durch den Text wirklich erkennbar belegt sind.
- Bei einem reinen Berufsnamen/Stichwort: nenne die typischen, in diesem Beruf üblichen Fach-Skills, Tools, Zertifikate und Methoden, die auf einem deutschen Lebenslauf für diesen Beruf realistisch und erwartbar sind.

Nenne kurze, prägnante Skill-Bezeichnungen, keine ganzen Sätze. Maximal 8 Skills, sortiert nach Relevanz.

Antworte auf ${language}.`,
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

  const skills = [...new Set(parsed.skills.map((s) => s.trim()).filter(Boolean))].slice(0, 8);
  return NextResponse.json({ skills });
}
