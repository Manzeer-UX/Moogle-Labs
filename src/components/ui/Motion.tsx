"use client";

import { Fragment, useEffect, useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

/* ------------------------------------------------------------------ */
/* Binary string with flipping digits and a blinking cursor            */
/* ------------------------------------------------------------------ */
export function BinaryText({ seed = 0, length = 8, className = "" }: { seed?: number; length?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const digits = el.querySelectorAll<HTMLElement>("[data-d]");
    const id = window.setInterval(() => {
      const d = digits[(Math.random() * digits.length) | 0];
      if (d) d.textContent = Math.random() > 0.5 ? "1" : "0";
    }, 110 + seed * 17);
    return () => window.clearInterval(id);
  }, [seed]);

  return (
    <span ref={ref} aria-hidden className={`font-body text-[11px] tracking-[0.18em] whitespace-nowrap ${className}`}>
      {Array.from({ length }, (_, i) => (
        <span key={i} data-d>
          {(i * 7 + seed * 3) % 3 === 0 ? "0" : "1"}
        </span>
      ))}
      <span className="animate-blink">_</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Word whose letters glitch into symbols every now and then           */
/* ------------------------------------------------------------------ */
const GLITCH = "!{}/@&%)|#$0";

export function GlitchWord({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const letters = Array.from(el.querySelectorAll<HTMLElement>("[data-l]"));
    const timers: number[] = [];
    // The glitch symbol is drawn in an overlay while the real letter is only
    // hidden, so every letter keeps its width and nothing around it shifts
    // (a width change made marquees jump).
    const id = window.setInterval(() => {
      const count = 1 + ((Math.random() * 2) | 0);
      for (let k = 0; k < count; k++) {
        const l = letters[(Math.random() * letters.length) | 0];
        const g = l?.querySelector<HTMLElement>("[data-g]");
        if (!l || !g || l.dataset.l === " ") continue;
        g.textContent = GLITCH[(Math.random() * GLITCH.length) | 0];
        l.dataset.glitch = "";
        timers.push(
          window.setTimeout(() => {
            delete l.dataset.glitch;
            g.textContent = "";
          }, 140 + Math.random() * 160),
        );
      }
    }, 900 + Math.random() * 600);
    return () => {
      window.clearInterval(id);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  return (
    <span ref={ref} className={`inline-flex ${className}`} aria-label={text}>
      {text.split("").map((ch, i) => (
        <span
          key={i}
          data-l={ch}
          aria-hidden
          className={`relative inline-block ${ch === " " ? "w-[0.35em]" : ""}`}
        >
          <span className="[[data-glitch]>&]:opacity-0">{ch}</span>
          <span data-g className="absolute inset-0 flex justify-center" />
        </span>
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Giant marquee (reference: the scrambled brand-name marquee)         */
/* ------------------------------------------------------------------ */
export function BigMarquee({ items, className = "" }: { items: string[]; className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const track = root.current?.querySelector<HTMLElement>("[data-track]");
      if (!track) return;
      const loop = gsap.to(track, { xPercent: -50, ease: "none", duration: 60, repeat: -1, force3D: true });
      // Scrolling gives a gentle, eased speed-up that glides back to normal.
      const boost = gsap.quickTo(loop, "timeScale", { duration: 1.2, ease: "power2.out" });
      let settle = 0;
      ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const v = Math.abs(self.getVelocity());
          boost(1 + Math.min(v / 600, 2.5));
          window.clearTimeout(settle);
          settle = window.setTimeout(() => boost(1), 250);
        },
        onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
      });
      return () => window.clearTimeout(settle);
    },
    { scope: root },
  );

  return (
    <div ref={root} className={`overflow-hidden ${className}`}>
      <div data-track className="flex w-max will-change-transform">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
            {items.map((item, i) => (
              <Fragment key={`${copy}-${i}`}>
                <GlitchWord text={item} className="shrink-0" />
                <span
                  aria-hidden
                  className="mx-6 inline-block h-1.5 w-[56px] shrink-0 translate-y-[0.1em] bg-gradient-to-l from-white to-transparent phone:h-2 phone:w-[90px] tablet:mx-12 tablet:h-3 tablet:w-[150px] laptop:h-4"
                />
              </Fragment>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Rolling number (reference: “Active users” counter)                  */
/* ------------------------------------------------------------------ */
export function NumberRoller({ value, className = "" }: { value: string; className?: string }) {
  const root = useRef<HTMLSpanElement>(null);
  const digits = value.split("");
  const columns = digits.map((d, i) => {
    const n = Number(d);
    const seq = [3, 8, 1, 6, 4, 9, 2].map((o) => (n + o + i) % 10);
    return [...seq, n];
  });

  useGSAP(
    () => {
      const cols = root.current?.querySelectorAll<HTMLElement>("[data-col]");
      if (!cols) return;
      cols.forEach((col, i) => {
        const steps = columns[i].length - 1;
        const fromTop = i % 2 === 0;
        const travel = (steps / columns[i].length) * 100;
        gsap.fromTo(
          col,
          { yPercent: fromTop ? 0 : -travel },
          {
            yPercent: fromTop ? -travel : 0,
            duration: 2.4,
            delay: i * 0.15,
            ease: "power4.inOut",
            scrollTrigger: { trigger: root.current, start: "top 85%", once: true },
          },
        );
      });
    },
    { scope: root },
  );

  return (
    <span ref={root} className={`flex font-heading leading-none font-semibold ${className}`} aria-label={value}>
      {columns.map((seq, i) => {
        const ordered = i % 2 === 0 ? seq : [...seq].reverse();
        return (
          <span key={i} aria-hidden className="relative block h-[0.82em] overflow-hidden">
            <span data-col className="flex flex-col">
              {ordered.map((n, k) => (
                <span key={k} className="block h-[0.82em] leading-[0.82em]">
                  {n}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}
