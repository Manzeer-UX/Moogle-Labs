"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#_";

/**
 * Text that scrambles (decodes) when its closest link/button is hovered.
 * An invisible copy reserves the width so the layout never jitters.
 */
export function ScrambleText({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const host = (el.closest("a,button") as HTMLElement | null) ?? el;
    let tween: gsap.core.Tween | null = null;

    const run = () => {
      if (window.matchMedia("(hover: none)").matches) return;
      tween?.kill();
      tween = gsap.to(el, {
        duration: 0.6,
        ease: "none",
        scrambleText: { text, chars: UPPER, speed: 0.9, revealDelay: 0.1 },
      });
    };

    host.addEventListener("mouseenter", run);
    host.addEventListener("focus", run);
    return () => {
      host.removeEventListener("mouseenter", run);
      host.removeEventListener("focus", run);
      tween?.kill();
      el.textContent = text;
    };
  }, [text]);

  return (
    <span className={`relative inline-block whitespace-nowrap ${className}`}>
      <span className="invisible" aria-hidden>
        {text}
      </span>
      <span ref={ref} className="absolute inset-0" aria-hidden>
        {text}
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
