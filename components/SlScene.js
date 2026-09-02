"use client";

// Thin wrapper around the <sl-scene> custom element (registered by
// /public/sl-scene.js) so React never tries to reconcile the web
// component's internal DOM. See DESIGN-ANWEISUNG.md §1.
export default function SlScene({ variant = "hero", intensity = 6, className, style }) {
  return <sl-scene variant={variant} intensity={String(intensity)} class={className} style={style} />;
}
