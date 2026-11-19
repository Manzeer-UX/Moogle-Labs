"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { LuMenu, LuX } from "react-icons/lu";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { scene } from "@/lib/scene";
import { site } from "@/content/site";
import { Logo } from "@/components/ui/Logo";
import { ScrambleText } from "@/components/ui/ScrambleText";
import { getLenis } from "@/lib/lenis";

/**
 * Fixed header. Each page section declares `data-header="split|dark|light"`
 * and the header recolours itself for whatever sits underneath it.
 */
export function Header() {
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);

  useGSAP(
    () => {
      const header = ref.current;
      if (!header) return;

      // Query the whole document – selector text inside useGSAP is scoped to the header.
      document.querySelectorAll<HTMLElement>("[data-header]").forEach((section) => {
        ScrollTrigger.create({
          trigger: section,
          start: "top 44px",
          end: "bottom 44px",
          onToggle: (self) => {
            if (self.isActive) header.dataset.theme = section.dataset.header;
          },
        });
      });

      ScrollTrigger.create({
        start: 80,
        end: "max",
        onToggle: (self) => header.toggleAttribute("data-scrolled", self.isActive),
      });

      const items = header.querySelectorAll("[data-intro]");
      gsap.set(items, { autoAlpha: 0, y: -16 });
      const play = () =>
        gsap.to(items, { autoAlpha: 1, y: 0, stagger: 0.07, duration: 0.9, ease: "power3.out", delay: 0.35 });
      if (scene.loaded) play();
      else window.addEventListener("moogle:loaded", play, { once: true });
    },
    { scope: ref },
  );

  useEffect(() => {
    const lenis = getLenis();
    if (open) lenis?.stop();
    else if (scene.loaded) lenis?.start();
  }, [open]);

  return (
    <header
      ref={ref}
      data-theme="split"
      className="group/h fixed inset-x-0 top-0 z-50 py-5 transition-[padding,background-color,backdrop-filter] duration-500 data-[scrolled]:py-3 data-[scrolled]:backdrop-blur-md tablet:py-6 data-[scrolled]:data-[theme=dark]:bg-ink/55 data-[scrolled]:data-[theme=light]:bg-light-grey/70 max-tablet:data-[scrolled]:data-[theme=split]:bg-ink/60"
    >
      <div className="flex items-center justify-between px-4 tablet:px-8">
        <a
          href="#top"
          data-intro
          aria-label="MoogleLabs – back to top"
          className="text-white transition-colors duration-500 group-data-[theme=light]/h:text-ink"
        >
          <Logo />
        </a>

        <div className="flex items-center gap-3">
          <nav
            data-intro
            aria-label="Primary"
            className="hidden items-center gap-3 font-heading text-[13px] font-semibold uppercase tablet:flex"
          >
            {site.nav.map((item, i) => (
              <Fragment key={item.href}>
                {i > 0 && (
                  <span
                    aria-hidden
                    className="text-ink/60 transition-colors duration-500 group-data-[theme=dark]/h:text-white/60"
                  >
                    /
                  </span>
                )}
                <a
                  href={item.href}
                  className="text-ink transition-colors duration-500 hover:text-brand group-data-[theme=dark]/h:text-white group-data-[theme=dark]/h:hover:text-lilac"
                >
                  <ScrambleText text={item.label} />
                </a>
              </Fragment>
            ))}
          </nav>

          <a
            data-intro
            href={site.contactHref}
            className="chamfer ml-4 hidden h-11 items-center bg-gradient-to-r from-brand-deep to-brand-light px-5 font-heading text-[13px] font-semibold uppercase tracking-[0.03em] text-white transition-[filter] duration-300 [--cut:8px] hover:brightness-110 laptop:inline-flex"
          >
            <ScrambleText text="Discuss Your AI Roadmap" />
          </a>

          <button
            data-intro
            type="button"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
            className="chamfer flex size-11 items-center justify-center bg-gradient-to-r from-brand-deep to-brand-light text-white [--cut:7px] tablet:hidden"
          >
            <LuMenu className="size-5" />
          </button>
        </div>
      </div>

      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </header>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (open) {
        gsap.set(el, { display: "flex" });
        gsap.fromTo(el, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.6, ease: "power4.inOut" });
        gsap.fromTo(
          el.querySelectorAll("[data-m]"),
          { yPercent: 110 },
          { yPercent: 0, duration: 0.8, stagger: 0.05, ease: "power4.out", delay: 0.25 },
        );
      } else {
        gsap.to(el, {
          clipPath: "inset(0 0 100% 0)",
          duration: 0.45,
          ease: "power3.in",
          onComplete: () => {
            gsap.set(el, { display: "none" });
          },
        });
      }
    },
    { dependencies: [open], scope: ref },
  );

  return (
    <div
      ref={ref}
      style={{ display: "none" }}
      className="fixed inset-0 z-[60] flex-col bg-ink px-4 pt-5 pb-8 text-white"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
    >
      <div className="bg-dash-grid pointer-events-none absolute inset-0 opacity-20" />
      <div className="relative flex items-center justify-between">
        <Logo />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="chamfer flex size-11 items-center justify-center bg-white text-ink [--cut:7px]"
        >
          <LuX className="size-5" />
        </button>
      </div>
      <nav className="relative mt-16 flex flex-col gap-2" aria-label="Mobile">
        {site.nav.map((item, i) => (
          <span key={item.href} className="overflow-hidden">
            <a
              data-m
              href={item.href}
              onClick={onClose}
              className="flex items-baseline gap-4 py-1 font-heading text-[34px] leading-tight font-semibold uppercase"
            >
              <span className="font-body text-xs text-white/50">0{i + 1}</span>
              {item.label}
            </a>
          </span>
        ))}
      </nav>
      <div className="relative mt-auto overflow-hidden">
        <a
          data-m
          href={site.contactHref}
          onClick={onClose}
          className="chamfer inline-flex h-12 items-center bg-gradient-to-r from-brand-deep to-brand-light px-6 font-heading text-[13px] font-semibold uppercase text-white [--cut:8px]"
        >
          Discuss Your AI Roadmap
        </a>
      </div>
    </div>
  );
}
