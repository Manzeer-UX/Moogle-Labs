"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { scrollToHash, setLenis } from "@/lib/lenis";
import { scene } from "@/lib/scene";

/**
 * Lenis smooth scrolling driven by the GSAP ticker so ScrollTrigger and the
 * smooth scroll stay in lock-step. Also handles in-page anchor links.
 */
export function SmoothScroll() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !reduceMotion,
      autoRaf: false,
    });
    setLenis(lenis);

    lenis.on("scroll", (l: Lenis) => {
      scene.velocity = l.velocity;
      ScrollTrigger.update();
    });

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const onPointer = (e: PointerEvent) => {
      scene.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      scene.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return;
      const anchor = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!anchor) return;
      const hash = anchor.getAttribute("href") ?? "";
      if (scrollToHash(hash)) {
        event.preventDefault();
        if (hash !== "#top") history.replaceState(null, "", hash);
        else history.replaceState(null, "", window.location.pathname);
      }
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("pointermove", onPointer);
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
