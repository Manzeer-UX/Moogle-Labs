"use client";

import { useEffect, useRef, useState } from "react";
import { LuArrowRight } from "react-icons/lu";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { scene } from "@/lib/scene";
import { hero } from "@/content/site";
import { BlinkSquare } from "@/components/ui/Bits";

/** Seconds each friction card stays in front before the deck advances. */
const HOLD = 3.6;
/** How far each card behind peeks out above the one in front (px). */
const PEEK = 15;

type DeckStatus = { loaded: boolean; inView: boolean; hovered: boolean; reduced: boolean };

/** Run the autoplay timer only when every condition allows it. */
function syncTimer(status: DeckStatus, timer: gsap.core.Tween | null) {
  if (!timer) return;
  const play = status.loaded && status.inView && !status.hovered && !status.reduced;
  if (play) timer.resume();
  else timer.pause();
}

/**
 * "Where is your AI roadmap stuck?" as a stacked deck: one card in front,
 * the next two peeking out behind it. The deck advances on its own (paused on
 * hover, off-screen, before the loader finishes and for reduced motion); the
 * progress bars show the current card and jump straight to any option.
 */
export function FrictionDeck() {
  const { friction } = hero;
  const total = friction.options.length;
  const [active, setActive] = useState(0);

  const root = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLAnchorElement | null)[]>([]);
  const fills = useRef<(HTMLSpanElement | null)[]>([]);
  const previous = useRef(0);
  const firstRun = useRef(true);
  const timer = useRef<gsap.core.Tween | null>(null);
  const status = useRef<DeckStatus>({ loaded: false, inView: true, hovered: false, reduced: false });

  useEffect(() => {
    const s = status.current;
    s.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    s.loaded = scene.loaded;
    const onLoaded = () => {
      s.loaded = true;
      syncTimer(s, timer.current);
    };
    window.addEventListener("moogle:loaded", onLoaded);
    const visibility = ScrollTrigger.create({
      trigger: root.current,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => {
        s.inView = self.isActive;
        syncTimer(s, timer.current);
      },
    });
    return () => {
      window.removeEventListener("moogle:loaded", onLoaded);
      visibility.kill();
    };
  }, []);

  useGSAP(
    () => {
      const from = previous.current;
      const instant = firstRun.current;
      firstRun.current = false;

      cards.current.forEach((card, i) => {
        if (!card) return;
        const depth = (i - active + total) % total;
        const target = {
          y: -depth * PEEK,
          scale: 1 - depth * 0.055,
          autoAlpha: depth === 0 ? 1 : depth === 1 ? 0.72 : depth === 2 ? 0.42 : 0,
          zIndex: total - depth,
        };
        if (instant) {
          gsap.set(card, target);
        } else if (i === from && from !== active) {
          // The card leaving the front drops away, then rejoins at the back.
          gsap
            .timeline()
            .to(card, { y: 48, autoAlpha: 0, duration: 0.42, ease: "power2.in" })
            .set(card, { ...target, autoAlpha: 0 })
            .to(card, { autoAlpha: target.autoAlpha, duration: 0.3 });
        } else {
          gsap.to(card, { ...target, duration: 0.75, delay: 0.12, ease: "power3.out" });
        }
      });

      // Progress: earlier cards full, the active one fills, later ones empty.
      fills.current.forEach((fill, i) => {
        if (fill) gsap.set(fill, { scaleX: i < active ? 1 : 0 });
      });
      timer.current?.kill();
      const fill = fills.current[active];
      if (fill) {
        timer.current = gsap.fromTo(
          fill,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: HOLD,
            ease: "none",
            paused: true,
            onComplete: () => setActive((a) => (a + 1) % total),
          },
        );
        syncTimer(status.current, timer.current);
      }
      previous.current = active;
    },
    { dependencies: [active], scope: root },
  );

  const setHovered = (hovered: boolean) => {
    status.current.hovered = hovered;
    syncTimer(status.current, timer.current);
  };

  return (
    <div
      ref={root}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={() => setHovered(false)}
      className="chamfer bg-white/85 p-5 text-ink backdrop-blur-md [--cut:14px] phone:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <p className="max-w-[270px] font-heading text-[15px] leading-snug font-semibold uppercase">{friction.question}</p>
        <span className="mt-0.5 flex shrink-0 items-center gap-2 font-heading text-[11px] font-semibold tracking-wider text-brand uppercase">
          <BlinkSquare className="border-brand" dot="bg-brand" />
          {friction.hint}
        </span>
      </div>

      {/* The deck: cards are stacked bottom-aligned; the ones behind peek out above. */}
      <div className="relative mt-5" style={{ height: 148 + PEEK * 2 }}>
        {friction.options.map((option, i) => {
          const front = i === active;
          return (
            <a
              key={option.href}
              ref={(el) => {
                cards.current[i] = el;
              }}
              href={option.href}
              tabIndex={front ? 0 : -1}
              aria-hidden={!front}
              className="chamfer group absolute inset-x-0 bottom-0 flex h-[148px] origin-bottom flex-col justify-between border-t-2 border-brand-light/70 bg-ink p-5 text-white [--cut:12px]"
              style={{ zIndex: total - ((i - active + total) % total) }}
            >
              <span className="flex items-center justify-between font-heading text-[11px] font-semibold tracking-wider uppercase">
                <span className="text-lilac">
                  {String(i + 1).padStart(2, "0")} <span className="text-white/40">/ {String(total).padStart(2, "0")}</span>
                </span>
                <span className="flex items-center gap-2 text-white/55">
                  <BlinkSquare className="border-lilac" dot="bg-lilac" />
                  Friction point
                </span>
              </span>
              <span className="pr-12 font-heading text-[17px] leading-snug font-semibold uppercase">{option.label}</span>
              <span className="chamfer absolute right-4 bottom-4 flex size-9 items-center justify-center bg-gradient-to-r from-brand-deep to-brand-light transition-transform duration-300 [--cut:6px] group-hover:translate-x-1">
                <LuArrowRight aria-hidden className="size-4" />
              </span>
            </a>
          );
        })}
      </div>

      {/* Progress / jump controls */}
      <div className="mt-4 flex items-center gap-1.5" role="tablist" aria-label="Friction points">
        {friction.options.map((option, i) => (
          <button
            key={option.href}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={`Show: ${option.label}`}
            onClick={() => setActive(i)}
            className="group relative flex h-4 flex-1 items-center"
          >
            <span className="relative block h-[3px] w-full overflow-hidden bg-ink/15 transition-colors group-hover:bg-ink/30">
              <span
                ref={(el) => {
                  fills.current[i] = el;
                }}
                className="absolute inset-0 origin-left scale-x-0 bg-brand"
              />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
