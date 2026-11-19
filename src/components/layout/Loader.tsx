"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { getLenis } from "@/lib/lenis";
import { scene } from "@/lib/scene";

const GLYPHS = ["A", "I", "M", "0", "1", "01", "10", "AI", ">_", "//", "{}", "0x", "<>", "+", "ML", "%"];
const CELLS = 144;

/**
 * Full-screen 12×12 pixel loader: glyphs flicker in random cells while the
 * page boots, then the cells dissolve in random order to reveal the site.
 */
export function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const cells = Array.from(el.querySelectorAll<HTMLElement>("[data-cell]"));
    const label = el.querySelector<HTMLElement>("[data-label]")!;
    const pct = el.querySelector<HTMLElement>("[data-pct]")!;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (!window.location.hash) window.scrollTo(0, 0);
    getLenis()?.stop();

    let cancelled = false;
    const tweens: gsap.core.Animation[] = [];

    const flicker = window.setInterval(() => {
      for (let k = 0; k < 3; k++) {
        const cell = cells[(Math.random() * cells.length) | 0];
        cell.textContent = GLYPHS[(Math.random() * GLYPHS.length) | 0];
        tweens.push(
          gsap.fromTo(cell, { color: "rgba(255,255,255,1)" }, { color: "rgba(255,255,255,0)", duration: 0.9, ease: "steps(5)" }),
        );
      }
    }, 80);

    tweens.push(
      gsap.to(label, {
        duration: 1.2,
        scrambleText: { text: "Loading...", chars: "01ABCDEFGHIJKLMNOPQRSTUVWXYZ", speed: 0.5, revealDelay: 0.35 },
        repeat: -1,
        repeatDelay: 0.3,
      }),
    );

    const progress = { v: 0 };
    tweens.push(
      gsap.to(progress, {
        v: 100,
        duration: reduceMotion ? 0.4 : 2.1,
        ease: "power2.inOut",
        onUpdate: () => {
          pct.textContent = String(Math.round(progress.v)).padStart(3, "0");
        },
      }),
    );

    const minTime = new Promise((r) => setTimeout(r, reduceMotion ? 400 : 2200));
    const fonts = document.fonts ? document.fonts.ready.catch(() => undefined) : Promise.resolve();
    const pageLoad =
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise((r) => window.addEventListener("load", r, { once: true }));
    // Never block longer than 6s on slow assets.
    const ready = Promise.race([Promise.all([minTime, fonts, pageLoad]), new Promise((r) => setTimeout(r, 6000))]);

    ready.then(() => {
      if (cancelled) return;
      window.clearInterval(flicker);
      tweens.forEach((t) => t.kill());
      cells.forEach((c) => (c.textContent = ""));
      pct.textContent = "100";

      const reveal = () => {
        scene.loaded = true;
        document.documentElement.classList.remove("is-loading");
        getLenis()?.start();
        ScrollTrigger.refresh();
        gsap.to(scene, { intro: 1, duration: 2, ease: "power3.out" });
        window.dispatchEvent(new Event("moogle:loaded"));
        if (window.location.hash) {
          // honour deep links once the layout is final
          import("@/lib/lenis").then(({ scrollToHash }) => scrollToHash(window.location.hash, { immediate: true }));
        }
      };

      gsap
        .timeline({ onComplete: () => setDone(true) })
        .to([label, pct], { autoAlpha: 0, duration: 0.25 })
        .add(reveal, 0.2)
        .to(
          cells,
          { opacity: 0, duration: 0.05, stagger: { each: reduceMotion ? 0 : 0.0045, from: "random" } },
          0.15,
        );
    });

    return () => {
      cancelled = true;
      window.clearInterval(flicker);
      tweens.forEach((t) => t.kill());
    };
  }, []);

  if (done) return null;

  return (
    <div
      ref={root}
      aria-hidden
      data-loader
      className="fixed inset-0 z-[200] grid grid-cols-12 grid-rows-12 text-white select-none"
    >
      {Array.from({ length: CELLS }, (_, i) => (
        <div
          key={i}
          data-cell
          className="flex items-center justify-center bg-ink font-body text-[13px] tracking-wider text-transparent shadow-[0_0_0_1px_var(--color-ink)]"
        />
      ))}
      <div className="pointer-events-none absolute inset-x-0 bottom-6 flex items-center justify-center gap-4 font-body text-[13px] text-white">
        <span data-label>Loading...</span>
        <span data-pct className="tabular-nums text-white/60">
          000
        </span>
      </div>
    </div>
  );
}
