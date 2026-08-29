"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";

// Bounding box eines nach unten länglichen Ovals (nicht rund) — Seitenverhältnis
// hier festgelegt und exakt so auch im PDF/DOCX-Export verwendet (lib/cv-export),
// damit das dort platzierte Bild nicht gestreckt/verzogen wird.
export const AVATAR_OUTPUT_WIDTH = 340;
export const AVATAR_OUTPUT_HEIGHT = 440;

const VIEWPORT_W = 220;
const VIEWPORT_H = Math.round((VIEWPORT_W / AVATAR_OUTPUT_WIDTH) * AVATAR_OUTPUT_HEIGHT);

export default function AvatarCropModal({ file, onCancel, onConfirm }) {
  const t = useTranslations("profile");
  const [imageUrl, setImageUrl] = useState(null);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [error, setError] = useState(false);
  const dragState = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const baseScale = natural.w && natural.h ? Math.max(VIEWPORT_W / natural.w, VIEWPORT_H / natural.h) : 1;
  const scale = baseScale * zoom;
  const dispW = natural.w * scale;
  const dispH = natural.h * scale;

  const clampOffset = useCallback(
    (x, y, s) => {
      const dw = natural.w * s;
      const dh = natural.h * s;
      const maxX = Math.max(0, (dw - VIEWPORT_W) / 2);
      const maxY = Math.max(0, (dh - VIEWPORT_H) / 2);
      return { x: Math.min(maxX, Math.max(-maxX, x)), y: Math.min(maxY, Math.max(-maxY, y)) };
    },
    [natural]
  );

  const handleImgLoad = (e) => {
    if (!e.target.naturalWidth || !e.target.naturalHeight) {
      setError(true);
      return;
    }
    setError(false);
    setNatural({ w: e.target.naturalWidth, h: e.target.naturalHeight });
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleImgError = () => {
    setError(true);
  };

  const onPointerDown = (e) => {
    dragState.current = { startX: e.clientX, startY: e.clientY, offsetX: offset.x, offsetY: offset.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    setOffset(clampOffset(dragState.current.offsetX + dx, dragState.current.offsetY + dy, scale));
  };
  const onPointerUp = () => {
    dragState.current = null;
  };

  const handleZoomChange = (e) => {
    const z = parseFloat(e.target.value);
    setZoom(z);
    setOffset((o) => clampOffset(o.x, o.y, baseScale * z));
  };

  const handleConfirm = () => {
    const img = imgRef.current;
    if (!img || !natural.w || !natural.h) {
      setError(true);
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = AVATAR_OUTPUT_WIDTH;
    canvas.height = AVATAR_OUTPUT_HEIGHT;
    const ctx = canvas.getContext("2d");
    try {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(AVATAR_OUTPUT_WIDTH / 2, AVATAR_OUTPUT_HEIGHT / 2, AVATAR_OUTPUT_WIDTH / 2, AVATAR_OUTPUT_HEIGHT / 2, 0, 0, Math.PI * 2);
      ctx.clip();
      const imgLeft = VIEWPORT_W / 2 - dispW / 2 + offset.x;
      const imgTop = VIEWPORT_H / 2 - dispH / 2 + offset.y;
      const srcX = -imgLeft / scale;
      const srcY = -imgTop / scale;
      const srcW = VIEWPORT_W / scale;
      const srcH = VIEWPORT_H / scale;
      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, AVATAR_OUTPUT_WIDTH, AVATAR_OUTPUT_HEIGHT);
      ctx.restore();
    } catch {
      setError(true);
      return;
    }
    canvas.toBlob((blob) => {
      if (blob) {
        onConfirm(blob);
      } else {
        setError(true);
      }
    }, "image/png");
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(15,26,22,.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={onCancel}
    >
      <div className="glass" style={{ padding: 24, width: 320, maxWidth: "100%" }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0, marginBottom: 14 }}>{t("avatar.cropTitle")}</h3>
        <div
          style={{
            width: VIEWPORT_W,
            height: VIEWPORT_H,
            margin: "0 auto",
            position: "relative",
            overflow: "hidden",
            borderRadius: "50%",
            background: "#eee",
            cursor: dragState.current ? "grabbing" : "grab",
            touchAction: "none",
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          {imageUrl && (
            <img
              ref={imgRef}
              src={imageUrl}
              onLoad={handleImgLoad}
              onError={handleImgError}
              draggable={false}
              alt=""
              style={{
                position: "absolute",
                left: VIEWPORT_W / 2 - dispW / 2 + offset.x,
                top: VIEWPORT_H / 2 - dispH / 2 + offset.y,
                width: dispW || undefined,
                height: dispH || undefined,
                maxWidth: "none",
                userSelect: "none",
              }}
            />
          )}
        </div>
        {error && (
          <p style={{ fontSize: 12, color: "#C0392B", marginTop: 12, marginBottom: 0 }}>{t("avatar.cropError")}</p>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16 }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{t("avatar.zoom")}</span>
          <input type="range" min="1" max="3" step="0.01" value={zoom} onChange={handleZoomChange} style={{ flex: 1 }} disabled={error} />
        </div>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6, marginBottom: 0 }}>{t("avatar.dragHint")}</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 18 }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>
            {t("avatar.cropCancel")}
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={handleConfirm} disabled={error}>
            {t("avatar.cropConfirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
