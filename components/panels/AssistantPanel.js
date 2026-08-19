"use client";
import { useState } from "react";
import { useApp } from "@/context/AppContext";

const PROMPTS = [
  "Wie kann ich meine Chancen für diese Rolle verbessern?",
  "Welche meiner Erfahrungen sind am relevantesten?",
  "Finde Lücken in meinem CV.",
  "Welche Erfolge sollte ich hervorheben?",
  "Erstelle ein CV für diesen Job.",
  "Hilf mir bei der Interview-Vorbereitung.",
  "Welche gespeicherten Jobs passen am besten?",
];

const REPLIES = {
  "Wie kann ich meine Chancen für diese Rolle verbessern?": "Laut deiner Match-Analyse ist der größte Hebel, deine Go-to-Market- und Pricing-Erfahrung expliziter zu machen — das könnte deinen Score von 87 in die niedrigen 90er heben. Soll ich die CV-Empfehlungen für diesen Job öffnen?",
  "Welche meiner Erfahrungen sind am relevantesten?": "Deine Go-to-Market-Kampagnen bei Nova Cloud Systems sind dein stärkster Match — besonders die 28% Pipeline-Wachstum. Auch deine Competitive-Analysis-Erfahrung bei Brightpath ist direkt relevant.",
  "Finde Lücken in meinem CV.": "Ich habe 4 Lücken für diese Rolle gefunden: Go-to-Market-Strategie ist nicht explizit, Pricing-Strategie-Erfahrung fehlt, Tableau wird nicht erwähnt, und deine Google-Analytics-Zertifizierung steht noch nicht im CV, obwohl sie im Dokumenten-Vault liegt.",
  "Welche Erfolge sollte ich hervorheben?": "Dein Performance Review zeigt eine 18%ige Steigerung der Teamproduktivität, und deine Launches brachten 28% Pipeline-Wachstum. Beides sind starke, messbare Erfolge — ich würde mit der Pipeline-Zahl beginnen, da sie am relevantesten für diese Rolle ist.",
  "Erstelle ein CV für diesen Job.": "Ich habe eine angepasste Version in deinem CV Builder erstellt, basierend auf deinem bestehenden Profil — nichts erfunden, nur neu geordnet und formuliert für HubSpot. Schau's dir an und passe an, was nicht nach dir klingt.",
  "Hilf mir bei der Interview-Vorbereitung.": "Für das HubSpot-Interview als Product Marketing Manager erwarte Fragen zu Produkt-Launches, SaaS-Marketing, Go-to-Market-Strategie und cross-funktionalem Leadership. Willst du eine Übungsfrage?",
  "Welche gespeicherten Jobs passen am besten?": "Von deinen gespeicherten Jobs sind HubSpot (91%) und Adobe (88%) deine stärksten Matches. Zalando liegt niedriger bei 76% — vor allem wegen einer Lücke bei Growth-Experimentation-Erfahrung.",
};

export default function AssistantPanel() {
  const { chatMessages, sendChatMessage, chatLocked, isPro, aiMessagesUsed, FREE_AI_LIMIT } = useApp();
  const [draft, setDraft] = useState("");
  const disabled = chatLocked && !isPro;
  const remaining = Math.max(FREE_AI_LIMIT - aiMessagesUsed, 0);

  const send = (text) => {
    if (!text.trim()) return;
    sendChatMessage(text, REPLIES);
    setDraft("");
  };

  return (
    <div className="panel">
      <div className="panel-head"><h1>AI Career Copilot</h1><p>Kennt dein Profil, deine CVs, Job Descriptions, Dokumente und Bewerbungen.</p></div>
      <div className="chat-shell">
        <div className="glass-soft chat-side">
          <h4>Frag zum Beispiel</h4>
          {PROMPTS.map((p) => (
            <button key={p} className="prompt-chip" disabled={disabled} onClick={() => send(p)}>{p}</button>
          ))}
        </div>
        <div className="chat-main">
          <div className="chat-log">
            {chatMessages.map((m, i) => (
              <div key={i} className={`msg ${m.who}`}>{m.text}</div>
            ))}
          </div>
          <div id="chat-limit-note">
            {!isPro && !chatLocked && `${remaining} von ${FREE_AI_LIMIT} freien Nachrichten diesen Monat übrig`}
          </div>
          <div className="chat-input-row">
            <input
              type="text"
              placeholder="Frag zu einem Job, deinem CV oder einem Interview…"
              value={draft}
              disabled={disabled}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") send(draft); }}
            />
            <button className="btn btn-primary btn-sm" disabled={disabled} onClick={() => send(draft)}>Senden</button>
          </div>
        </div>
      </div>
    </div>
  );
}
