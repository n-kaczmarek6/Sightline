"use client";
import { useEffect } from "react";

// One shared motion layer for scroll-reveal, count-up numbers, animated bars,
// hover-tilt, magnet buttons, a cursor glow and a "denser on scroll" nav —
// driven entirely by data-attributes so any panel/page can opt in without
// its own bespoke effect code. See DESIGN-ANWEISUNG.md §6.
export function useSightlineMotion() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const cleanups = [];

    // ---- scroll reveal ----
    const revealEls = Array.from(document.querySelectorAll("[data-reveal]"));
    revealEls.forEach((el) => {
      el.classList.add("reveal");
      const n = el.getAttribute("data-reveal");
      if (n && Number(n) >= 1 && Number(n) <= 5) el.classList.add(`reveal-${n}`);
    });

    if (reduced) {
      revealEls.forEach((el) => el.classList.add("in"));
    } else if (revealEls.length) {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add("in");
              revealObserver.unobserve(entry.target);
            }
          }
        },
        { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
      );
      revealEls.forEach((el) => revealObserver.observe(el));
      cleanups.push(() => revealObserver.disconnect());
    }

    // ---- count-up ----
    const countEls = Array.from(document.querySelectorAll("[data-count]"));
    const runCount = (el) => {
      const target = Number(el.getAttribute("data-count"));
      if (Number.isNaN(target)) return;
      const suffix = el.getAttribute("data-count-suffix") || "";
      const prefix = el.getAttribute("data-count-prefix") || "";
      const decimals = Number(el.getAttribute("data-count-decimals")) || 0;
      if (reduced) {
        el.textContent = `${prefix}${target.toFixed(decimals)}${suffix}`;
        return;
      }
      const duration = 1500;
      const start = performance.now();
      const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
      const step = (now) => {
        const p = Math.min(1, (now - start) / duration);
        const val = target * easeOutCubic(p);
        el.textContent = `${prefix}${val.toFixed(decimals)}${suffix}`;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (countEls.length) {
      if (reduced) {
        countEls.forEach(runCount);
      } else {
        const countObserver = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) {
                runCount(entry.target);
                countObserver.unobserve(entry.target);
              }
            }
          },
          { threshold: 0.4 }
        );
        countEls.forEach((el) => countObserver.observe(el));
        cleanups.push(() => countObserver.disconnect());
      }
    }

    // ---- animated bars ----
    const barEls = Array.from(document.querySelectorAll("[data-bar]"));
    if (barEls.length) {
      const setBar = (el) => {
        const target = el.getAttribute("data-bar");
        requestAnimationFrame(() => {
          el.style.width = target;
        });
      };
      if (reduced) {
        barEls.forEach(setBar);
      } else {
        const barObserver = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) {
                setBar(entry.target);
                barObserver.unobserve(entry.target);
              }
            }
          },
          { threshold: 0.3 }
        );
        barEls.forEach((el) => barObserver.observe(el));
        cleanups.push(() => barObserver.disconnect());
      }
    }

    if (!reduced) {
      // ---- hover tilt ----
      const tiltEls = Array.from(document.querySelectorAll("[data-tilt]"));
      const tiltHandlers = tiltEls.map((el) => {
        const strength = Number(el.getAttribute("data-tilt-strength")) || 10;
        const onMove = (e) => {
          const rect = el.getBoundingClientRect();
          const px = (e.clientX - rect.left) / rect.width - 0.5;
          const py = (e.clientY - rect.top) / rect.height - 0.5;
          el.style.transition = "none";
          el.style.transform = `rotateY(${px * strength}deg) rotateX(${-py * strength}deg) translateZ(24px) scale(1.015)`;
        };
        const onLeave = () => {
          el.style.transition = "transform .55s cubic-bezier(.2,.7,.2,1)";
          el.style.transform = "";
        };
        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerleave", onLeave);
        return { el, onMove, onLeave };
      });
      cleanups.push(() => {
        tiltHandlers.forEach(({ el, onMove, onLeave }) => {
          el.removeEventListener("pointermove", onMove);
          el.removeEventListener("pointerleave", onLeave);
        });
      });

      // ---- magnet buttons ----
      const magnetEls = Array.from(document.querySelectorAll("[data-magnet]"));
      const magnetHandlers = magnetEls.map((el) => {
        const onMove = (e) => {
          const rect = el.getBoundingClientRect();
          const mx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
          const my = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
          el.style.transition = "none";
          el.style.transform = `translate(${mx * 8}px, ${my * 6}px) scale(1.03)`;
        };
        const onLeave = () => {
          el.style.transition = "transform .35s cubic-bezier(.2,.7,.2,1)";
          el.style.transform = "";
        };
        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerleave", onLeave);
        return { el, onMove, onLeave };
      });
      cleanups.push(() => {
        magnetHandlers.forEach(({ el, onMove, onLeave }) => {
          el.removeEventListener("pointermove", onMove);
          el.removeEventListener("pointerleave", onLeave);
        });
      });

      // ---- cursor glow ----
      const glow = document.createElement("div");
      glow.className = "sl-cursor-glow";
      document.body.appendChild(glow);
      const glowPos = { x: -200, y: -200 };
      const glowTarget = { x: -200, y: -200 };
      const onPointerMove = (e) => {
        glowTarget.x = e.clientX;
        glowTarget.y = e.clientY;
      };
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      let glowRaf = requestAnimationFrame(function tick() {
        glowPos.x += (glowTarget.x - glowPos.x) * 0.12;
        glowPos.y += (glowTarget.y - glowPos.y) * 0.12;
        glow.style.transform = `translate(${glowPos.x}px, ${glowPos.y}px)`;
        glowRaf = requestAnimationFrame(tick);
      });
      cleanups.push(() => {
        window.removeEventListener("pointermove", onPointerMove);
        cancelAnimationFrame(glowRaf);
        glow.remove();
      });
    }

    // ---- nav density on scroll ----
    const navEls = Array.from(document.querySelectorAll("[data-scroll-nav]"));
    if (navEls.length) {
      const onScroll = () => {
        const scrolled = window.scrollY > 30;
        navEls.forEach((el) => el.classList.toggle("scrolled", scrolled));
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      cleanups.push(() => window.removeEventListener("scroll", onScroll));
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);
}
