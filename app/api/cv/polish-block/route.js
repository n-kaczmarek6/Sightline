import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const PolishSchema = z.object({
  text: z.string().describe("Der überarbeitete Block, exakt im vorgegebenen Format"),
});

const FORMATS = {
  experience: {
    instruction: "Erste Zeile: 'Titel, Firma (Zeitraum)'. Danach 2-4 Zeilen mit '•' zu Aufgaben/Erfolgen, klar und ATS-freundlich formuliert.",
    subject: "einen einzelnen CV-Block (eine Station)",
  },
  education: {
    instruction: "Erste Zeile: 'Abschluss, Fach — Institution (Zeitraum)'. Danach, falls im Text vorhanden, weitere Zeilen mit '•' zu relevanten Modulen/Schwerpunkten, Note, Studienprojekten oder Abschlussarbeit.",
    subject: "einen einzelnen CV-Block (einen Ausbildungsabschnitt)",
  },
  summary: {
    instruction: "Maximal 2 prägnante, zusammenhängende Sätze als Fließtext — keine Aufzählungspunkte, keine Zeilenumbrüche.",
    subject: "die Zusammenfassung (Summary) eines Lebenslaufs",
  },
  skills: {
    instruction: "Eine einzige, kommagetrennte Liste von Fach- und Methodenskills — keine Sätze, keine Beschreibungen, keine Sprachen, keine Aufzählungspunkte.",
    subject: "die Skills-Liste eines Lebenslaufs",
  },
  achievements: {
    instruction: "Maximal 3 kurze, prägnante Zeilen mit '•' zu konkreten Erfolgen/Kennzahlen.",
    subject: "die Erfolge/Zertifikate eines Lebenslaufs",
  },
};

function systemPrompt(section, outputLocale) {
  const language = outputLocale === "en" ? "Englisch" : "Deutsch";
  const { instruction, subject } = FORMATS[section] || FORMATS.experience;

  return `Du bist der CV-Assistent von Sightline. Der Nutzer / die Nutzerin hat ${subject} als Rohtext eingegeben. Bringe diesen Text in das saubere Zielformat.

FORMAT: ${instruction}

WICHTIGSTE REGEL: Erfinde nichts, was nicht im Rohtext steht — keine zusätzlichen Firmen, Titel, Zeiträume, Skills, Aufgaben oder Kennzahlen. Nur vorhandene Angaben umformulieren, strukturieren und ATS-freundlich formulieren. Fehlt etwas, lässt du es einfach weg, statt es zu erfinden.

Antworte ausschließlich mit dem fertigen Text (keine Erklärungen drumherum), auf ${language}.`;
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
  const section = FORMATS[body?.section] ? body.section : "experience";
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
