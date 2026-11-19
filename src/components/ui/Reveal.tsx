"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";

type RevealProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** ScrollTrigger start position */
  start?: string;
  delay?: number;
  stagger?: number;
  id?: string;
};

/**
 * Masked slide-up reveal for every `[data-reveal]` descendant (or the element
 * itself when none are marked). Use with explicit line wrappers that have
 * `overflow-hidden`.
 */
export function Reveal({ as: Tag = "div", children, className = "", start = "top 85%", delay = 0, stagger = 0.1, id }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const marked = el.querySelectorAll<HTMLElement>("[data-reveal]");
      const targets = marked.length ? Array.from(marked) : [el];
      gsap.set(targets, { yPercent: 110 });
      const tween = gsap.to(targets, {
        yPercent: 0,
        duration: 1.15,
        delay,
        stagger,
        ease: "power4.out",
        paused: true,
      });
      // Play when the element is actually on screen. An IntersectionObserver
      // doesn't depend on pre-measured scroll positions, which go stale after
      // client-side page switches and layout changes (pins, font swaps) and
      // could leave headings stuck hidden. `start` ("top 85%") maps to a
      // bottom margin on the viewport.
      const pct = Number(/(\d+)%/.exec(start)?.[1] ?? 85);
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            tween.play();
            io.disconnect();
          }
        },
        { rootMargin: `0px 0px -${100 - pct}% 0px` },
      );
      io.observe(el);
      return () => io.disconnect();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className} id={id}>
      {children}
    </Tag>
  );
}

type RevealTextProps = {
  as?: ElementType;
  children: string;
  className?: string;
  start?: string;
  delay?: number;
};

/** Paragraph/heading reveal that splits text into masked lines. */
export function RevealText({ as: Tag = "p", children, className = "", start = "top 88%", delay = 0 }: RevealTextProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const split = SplitText.create(el, {
        type: "lines",
        mask: "lines",
        linesClass: "reveal-line",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 105,
            duration: 1.1,
            delay,
            stagger: 0.08,
            ease: "power4.out",
            scrollTrigger: { trigger: el, start, once: true },
          }),
      });
      return () => split.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
