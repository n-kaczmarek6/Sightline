"use client";
import { useSightlineMotion } from "@/hooks/useSightlineMotion";

// Mounts the shared reveal/count-up/tilt/magnet/cursor-glow/nav-density
// motion layer for the page it's rendered into. Renders nothing itself.
export default function SightlineMotion() {
  useSightlineMotion();
  return null;
}
