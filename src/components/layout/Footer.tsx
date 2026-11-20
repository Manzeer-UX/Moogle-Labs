"use client";

import { useEffect, useRef } from "react";
import { LuArrowUp } from "react-icons/lu";
import { gsap, useGSAP } from "@/lib/gsap";
import { finalCta, footer, site } from "@/content/site";
import { Logo } from "@/components/ui/Logo";
import { BlinkSquare } from "@/components/ui/Bits";
import { ChamferButton } from "@/components/ui/Buttons";
import { ScrambleText } from "@/components/ui/ScrambleText";

const WORD = "MOOGLELABS";

export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const wordRef = useRef<HTMLParagraphElement>(null);

  // Size the wordmark to fill the width exactly, whatever the font (Home 1
  // and Home 2 use different typefaces), and refit on resize / font load.
  useEffect(() => {
    const word = wordRef.current;
    const box = word?.parentElement;
    if (!word || !box) return;
    const fit = () => {
      const styles = getComputedStyle(box);
      const available = box.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight);
      word.style.fontSize = "100px";
      const natural = word.scrollWidth;
      if (natural > 0) word.style.fontSize = `${(100 * available) / natural}px`;
    };
    fit();
    document.fonts?.ready.then(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

  useGSAP(
    () => {
      const letters = ref.current!.querySelectorAll("[data-letter]");
      gsap.from(letters, {
        yPercent: 100,
        stagger: { each: 0.05, from: "random" },
        duration: 1.1,
        ease: "power4.out",
        scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
      });
      gsap.from(ref.current!.querySelectorAll("[data-foot]"), {
        autoAlpha: 0,
        y: 30,
        stagger: 0.08,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current!.querySelector("[data-foot-card]"), start: "top 90%", once: true },
      });
    },
    { scope: ref },
  );

  return (
    <footer ref={ref} data-header="light" className="relative z-10 overflow-hidden bg-light-grey text-ink">
      <div className="flex flex-col items-center px-4 pt-6 tablet:px-8">
        <p
          ref={wordRef}
          aria-hidden
          className="-mb-[0.24em] flex w-max overflow-hidden pt-[0.04em] font-heading text-[14vw] leading-[0.9] font-semibold whitespace-nowrap uppercase select-none"
        >
          {WORD.split("").map((ch, i) => (
            <span key={i} data-letter className="block">
              {ch}
            </span>
          ))}
        </p>

        <div
          data-foot-card
          className="chamfer relative z-10 w-full bg-white px-6 pt-12 pb-6 [--cut:40px] phone:px-8 tablet:px-14 tablet:pt-16"
        >
          <div className="grid gap-12 tablet:grid-cols-12">
            <div data-foot className="flex flex-col gap-6 tablet:col-span-5">
              <Logo className="h-9 w-auto self-start text-ink [--logo-accent:var(--color-brand)]" />
              <p className="max-w-[380px] text-[13px] leading-relaxed text-ink/75">{footer.statement}</p>
            </div>

            <nav data-foot aria-label="Footer" className="flex flex-col gap-5 tablet:col-span-3">
              <h2 className="text-[22px]">Explore</h2>
              <ul className="flex flex-col gap-3 font-heading text-[13px] font-semibold uppercase">
                {footer.explore.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="transition-colors hover:text-brand">
                      <ScrambleText text={link.label} />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div data-foot className="flex flex-col gap-5 tablet:col-span-4">
              <h2 className="text-[22px]">{finalCta.eyebrow}</h2>
              <p className="text-[13px] leading-relaxed text-ink/75">{finalCta.title}</p>
              <ChamferButton href={site.contactHref}>{finalCta.cta.label}</ChamferButton>
              <ul className="flex flex-col gap-2 text-[12px] text-ink/70">
                {finalCta.micro.map((m) => (
                  <li key={m} className="flex items-center gap-2.5">
                    <BlinkSquare className="border-ink" dot="bg-ink" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-14 flex flex-col gap-4 border-t border-dashed border-ink/40 pt-6 text-[12px] tablet:flex-row tablet:items-center tablet:justify-between">
            <span>© {footer.year} MoogleLabs. All rights reserved.</span>
            <a href="#top" className="inline-flex items-center gap-2 font-heading font-semibold uppercase hover:text-brand">
              <ScrambleText text="Back to top" />
              <LuArrowUp aria-hidden className="size-3.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
