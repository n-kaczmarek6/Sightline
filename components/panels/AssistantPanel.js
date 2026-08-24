"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useApp } from "@/context/AppContext";

const PROMPT_KEYS = [
  "improveChances", "mostRelevant", "findGaps", "highlightAchievements",
  "createCv", "interviewPrep", "bestMatches",
];

export default function AssistantPanel() {
  const { chatMessages, sendChatMessage, chatLocked, isPro, aiMessagesUsed, FREE_AI_LIMIT } = useApp();
  const t = useTranslations("assistant");
  const [draft, setDraft] = useState("");
  const disabled = chatLocked && !isPro;
  const remaining = Math.max(FREE_AI_LIMIT - aiMessagesUsed, 0);

  const prompts = PROMPT_KEYS.map((key) => ({ key, text: t(`prompts.${key}`) }));
  const replies = Object.fromEntries(PROMPT_KEYS.map((key) => [t(`prompts.${key}`), t(`replies.${key}`)]));

  const send = (text) => {
    if (!text.trim()) return;
    sendChatMessage(text, replies);
    setDraft("");
  };

  return (
    <div className="panel">
      <div className="panel-head"><h1>{t("title")}</h1><p>{t("subtitle")}</p></div>
      <div className="chat-shell">
        <div className="glass-soft chat-side">
          <h4>{t("askExample")}</h4>
          {prompts.map((p) => (
            <button key={p.key} className="prompt-chip" disabled={disabled} onClick={() => send(p.text)}>{p.text}</button>
          ))}
        </div>
        <div className="chat-main">
          <div className="chat-log">
            {chatMessages.map((m, i) => (
              <div key={i} className={`msg ${m.who}`}>{m.text}</div>
            ))}
          </div>
          <div id="chat-limit-note">
            {!isPro && !chatLocked && t("remainingMessages", { remaining, limit: FREE_AI_LIMIT })}
          </div>
          <div className="chat-input-row">
            <input
              type="text"
              placeholder={t("inputPlaceholder")}
              value={draft}
              disabled={disabled}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") send(draft); }}
            />
            <button className="btn btn-primary btn-sm" disabled={disabled} onClick={() => send(draft)}>{t("send")}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
