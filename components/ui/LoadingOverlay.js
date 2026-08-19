"use client";
import { useApp } from "@/context/AppContext";

const STEPS = [
  "Analysiere Job Description…",
  "Extrahiere Anforderungen…",
  "Vergleiche deine Erfahrung…",
  "Erstelle Empfehlungen…",
];

export default function LoadingOverlay() {
  const { loading, loadingStep } = useApp();
  if (!loading) return null;
  const currentText = STEPS[Math.min(loadingStep, STEPS.length - 1)];
  return (
    <div id="loading-overlay">
      <div className="loader-ring" />
      <div id="loading-step" className="mono">{currentText}</div>
      <div id="loading-substeps">
        {STEPS.map((s, i) => (
          <span key={s} className={i < loadingStep ? "done" : ""}>{s}</span>
        ))}
      </div>
    </div>
  );
}
