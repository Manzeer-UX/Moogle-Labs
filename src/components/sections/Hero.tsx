"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { scene } from "@/lib/scene";
import { hero } from "@/content/site";
import { Supertitle } from "@/components/ui/Supertitle";
import { ChamferButton, LineButton } from "@/components/ui/Buttons";
import { BinaryText } from "@/components/ui/Motion";
import { FrictionDeck } from "./FrictionDeck";

const BINARY_SPOTS = [
  { left: "8%", top: "24%", tone: "text-white/75", mobile: true },
  { left: "21%", top: "31%", tone: "text-white/55", mobile: false },
  { left: "66%", top: "21%", tone: "text-brand/80", mobile: true },
  { left: "82%", top: "34%", tone: "text-brand/70", mobile: false },
];

export function Hero() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(ref);
      const lines = q("[data-line] > span");
      const fades = q("[data-hero-in]");
      gsap.set(lines, { yPercent: 115 });
      gsap.set(fades, { autoAlpha: 0, y: 30 });
      gsap.set(q("[data-binary]"), { autoAlpha: 0 });

      const play = () => {
        gsap
          .timeline({ defaults: { ease: "power4.out" } })
          .to(lines, { yPercent: 0, duration: 1.3, stagger: 0.12 }, 0.2)
          .to(fades, { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.09 }, 0.45)
          .to(q("[data-binary]"), { autoAlpha: 1, duration: 0.6, stagger: 0.15, ease: "steps(4)" }, 0.9);
      };
      if (scene.loaded) play();
      else window.addEventListener("moogle:loaded", play, { once: true });

      // Desktop only: the hero copy fades away before the services act takes
      // over. On phones the copy is taller than the screen, so it just scrolls.
      gsap.matchMedia().add("(min-width: 1024px)", () => {
        gsap.to(q("[data-hero-content]"), {
          yPercent: -12,
          autoAlpha: 0,
          ease: "none",
          scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom 45%", scrub: true },
        });
      });
    },
    { scope: ref },
  );

  return (
    <section id="top" ref={ref} data-header="split" className="relative flex min-h-lvh text-white">
      {BINARY_SPOTS.map((spot, i) => (
        <div
          key={i}
          data-binary
          className={`pointer-events-none absolute ${spot.mobile ? "" : "hidden tablet:block"} ${spot.tone}`}
          style={{ left: spot.left, top: spot.top }}
        >
          <BinaryText seed={i} />
        </div>
      ))}

      <div
        data-hero-content
        className="relative z-10 mt-auto grid w-full gap-10 px-4 pt-[46svh] pb-8 tablet:grid-cols-12 tablet:items-end tablet:gap-8 tablet:px-8 tablet:pt-40 tablet:pb-12"
      >
        <div className="@container flex flex-col gap-6 tablet:col-span-7">
          <div data-hero-in className="pb-1">
            <Supertitle>{hero.eyebrow}</Supertitle>
          </div>

          {/* Desktop: sized to the column (cqw) so each headline line stays on one row. */}
          <h1 className="font-heading text-[clamp(2.05rem,9vw,3.1rem)] leading-[1.03] font-semibold uppercase tablet:text-[clamp(2rem,7.2cqw,4.6rem)]">
            <span data-line className="block overflow-hidden pb-[0.05em]">
              <span className="block text-balance">{hero.title.lead}</span>
            </span>
            <span data-line className="block overflow-hidden pb-[0.05em]">
              <span className="block text-balance">{hero.title.tail}</span>
            </span>
          </h1>

          <p data-hero-in className="max-w-[580px] text-[13px] leading-relaxed text-white/85 tablet:text-sm">
            {hero.body}
          </p>

          <div data-hero-in className="flex flex-wrap items-center gap-4">
            <ChamferButton href={hero.primaryCta.href} variant="brand">
              {hero.primaryCta.label}
            </ChamferButton>
            <LineButton href={hero.secondaryCta.href} className="text-white">
              {hero.secondaryCta.label}
            </LineButton>
          </div>
        </div>

        <div data-hero-in className="w-full tablet:col-span-5 tablet:max-w-[480px] tablet:justify-self-end">
          <FrictionDeck />
        </div>
      </div>
    </section>
  );
}
