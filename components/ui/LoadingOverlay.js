"use client";
import { useTranslations } from "next-intl";
import { useApp } from "@/context/AppContext";

export default function LoadingOverlay() {
  const { loading, loadingStep } = useApp();
  const t = useTranslations("analyze");
  const steps = t.raw("loadingSteps");
  if (!loading) return null;
  const currentText = steps[Math.min(loadingStep, steps.length - 1)];
  return (
    <div id="loading-overlay">
      <div className="loader-ring" />
      <div id="loading-step" className="mono">{currentText}</div>
      <div id="loading-substeps">
        {steps.map((s, i) => (
          <span key={s} className={i < loadingStep ? "done" : ""}>{s}</span>
        ))}
      </div>
    </div>
  );
}
