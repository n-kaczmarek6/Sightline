import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const PolishSchema = z.object({
  text: z.string().describe("Der überarbeitete Block, exakt im vorgegebenen Format"),
});

function systemPrompt(section, outputLocale) {
  const language = outputLocale === "en" ? "Englisch" : "Deutsch";
  const format =
    section === "education"
      ? "Erste Zeile: 'Abschluss, Fach — Institution (Zeitraum)'. Danach, falls im Text vorhanden, weitere Zeilen mit '•' zu relevanten Modulen/Schwerpunkten, Note, Studienprojekten oder Abschlussarbeit."
      : "Erste Zeile: 'Titel, Firma (Zeitraum)'. Danach 2-4 Zeilen mit '•' zu Aufgaben/Erfolgen, klar und ATS-freundlich formuliert.";

  return `Du bist der CV-Assistent von Sightline. Der Nutzer / die Nutzerin hat einen einzelnen CV-Block (eine Station bzw. einen Ausbildungsabschnitt) als Rohtext eingegeben. Bringe diesen Text in das saubere Zielformat.

FORMAT: ${format}

WICHTIGSTE REGEL: Erfinde nichts, was nicht im Rohtext steht — keine zusätzlichen Firmen, Titel, Zeiträume, Aufgaben oder Kennzahlen. Nur vorhandene Angaben umformulieren, strukturieren und ATS-freundlich formulieren. Fehlt etwas (z.B. der Zeitraum), lässt du es einfach weg, statt es zu erfinden.

Antworte ausschließlich mit dem fertigen Block (keine Erklärungen drumherum), auf ${language}.`;
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

  const rawText = (body?.text || "").trim();
  const section = body?.section === "education" ? "education" : "experience";
  const language = body?.language === "en" ? "en" : "de";

  if (!rawText) {
    return NextResponse.json({ error: "text_required" }, { status: 400 });
  }

  const anthropic = new Anthropic();
  let parsed;
  try {
    const response = await anthropic.messages.parse({
      model: "claude-opus-5",
      max_tokens: 1500,
      system: systemPrompt(section, language),
      messages: [{ role: "user", content: `ROHTEXT:\n${rawText}` }],
      output_config: { format: zodOutputFormat(PolishSchema) },
    });
    parsed = response.parsed_output;
  } catch (err) {
    console.error("Anthropic API error:", err);
    return NextResponse.json({ error: "ai_error", message: err.message }, { status: 502 });
  }

  if (!parsed) {
    return NextResponse.json({ error: "parse_failed" }, { status: 502 });
  }

  return NextResponse.json({ text: parsed.text });
}
