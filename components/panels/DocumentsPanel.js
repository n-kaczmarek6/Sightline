"use client";
import { useState } from "react";
import { useApp } from "@/context/AppContext";

export default function DocumentsPanel() {
  const { isPro, setPanel, toast } = useApp();
  const [used, setUsed] = useState({});

  const useEvidence = (key) => {
    setUsed((u) => ({ ...u, [key]: true }));
    toast("Nachweis verknüpft — im CV Builder sichtbar.");
  };

  return (
    <div className="panel">
      <div className="panel-head panel-head-row">
        <div><h1>Deine Nachweise</h1><p>Dokumente und Erfolge, die deine Erfahrung belegen.</p></div>
        <button className="btn btn-secondary btn-sm" onClick={() => toast("Upload-Dialog geöffnet.")}>+ Dokument hochladen</button>
      </div>
      <div className="doc-cat-lbl">Zertifikate &amp; Reviews</div>
      <div className="doc-grid">
        <div className="glass doc-card">
          <div className="doc-icon" style={{ background: "var(--success-bg)", color: "var(--success)" }}>
            <svg className="icon" style={{ width: 18, height: 18 }}><use href="#i-cert" /></svg>
          </div>
          <div className="doc-title">Google Analytics Certification</div>
          <div className="doc-desc">Verifizierte Info, für AI nutzbar</div>
          <button className="btn btn-ghost btn-sm" style={{ paddingLeft: 0, marginTop: 12 }} disabled={used.ga}
            onClick={() => useEvidence("ga")}>
            {used.ga ? "✓ Zum CV Builder hinzugefügt" : "Als Nachweis nutzen →"}
          </button>
        </div>
        <div className="glass doc-card">
          <div className="doc-icon" style={{ background: "var(--warning-bg)", color: "var(--warning)" }}>
            <svg className="icon" style={{ width: 18, height: 18 }}><use href="#i-star" /></svg>
          </div>
          <div className="doc-title">Performance Review 2025</div>
          <div className="doc-desc">Belegt Leadership und Projektwirkung</div>
          <button className="btn btn-ghost btn-sm" style={{ paddingLeft: 0, marginTop: 12 }} disabled={used.review}
            onClick={() => useEvidence("review")}>
            {used.review ? "✓ Zum CV Builder hinzugefügt" : "Als Nachweis nutzen →"}
          </button>
        </div>
        <div className="lock-wrap">
          <div className={isPro ? "" : ""}>
            <div className="glass doc-card">
              <div className="doc-icon" style={{ background: "var(--violet-bg)", color: "var(--violet)" }}>
                <svg className="icon" style={{ width: 18, height: 18 }}><use href="#i-cap" /></svg>
              </div>
              <div className="doc-title">MBA-Zeugnis</div>
              <div className="doc-desc">Ausbildungsnachweis</div>
            </div>
          </div>
          {!isPro && (
            <div className="lock-overlay">
              <div className="lock-overlay-icon" style={{ width: 34, height: 34 }}>
                <svg className="icon" style={{ width: 16, height: 16 }}><use href="#i-lock" /></svg>
              </div>
              <p style={{ fontSize: 12 }}>Free speichert 2 Dokumente.</p>
              <button className="btn btn-primary btn-sm" onClick={() => setPanel("pricing")}>Upgrade</button>
            </div>
          )}
        </div>
      </div>
      <div className="note-box" style={{ marginTop: 18 }}>
        💡 Dein Performance Review nennt eine Produktivitätssteigerung von 18% — das könnte deinen Leadership-Abschnitt in der HubSpot-Bewerbung stärken.
      </div>
    </div>
  );
}
