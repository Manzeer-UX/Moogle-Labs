"use client";

import { Fragment, useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { enterprise } from "@/content/site";
import { Supertitle } from "@/components/ui/Supertitle";
import { GradientDash } from "@/components/ui/Bits";
import { Reveal, RevealText } from "@/components/ui/Reveal";
import { BigMarquee } from "@/components/ui/Motion";
import { disciplineIcons } from "@/components/ui/icons";

export function EnterpriseDelivery() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(ref);
      const chips = q("[data-chip]");

      gsap.from(chips, {
        autoAlpha: 0,
        y: 26,
        stagger: 0.07,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: q("[data-chips]")[0], start: "top 88%", once: true },
      });

      // A highlight that scans across the disciplines – one team, full stack.
      const scan = gsap.timeline({ repeat: -1, paused: true, repeatDelay: 0.6 });
      chips.forEach((chip, i) => {
        scan
          .to(chip, { backgroundColor: "#ffffff", color: "#1b1140", duration: 0.25, ease: "power2.out" }, i * 0.4)
          .to(chip, { backgroundColor: "rgba(255,255,255,0.06)", color: "#ffffff", duration: 0.6, ease: "power2.in" }, i * 0.4 + 0.55);
      });
      ScrollTrigger.create({
        trigger: ref.current,
        start: "top 70%",
        end: "bottom top",
        onToggle: (s) => (s.isActive ? scan.play() : scan.pause()),
      });
    },
    { scope: ref },
  );

  return (
    <section id="enterprise" ref={ref} data-header="dark" className="relative bg-ink text-white">
      <div aria-hidden className="bg-dash-grid pointer-events-none absolute inset-0 opacity-25" />

      <div className="relative border-y border-white/10 py-6 tablet:py-10">
        <BigMarquee
          items={enterprise.disciplines}
          className="font-heading text-[88px] leading-[1.05] font-semibold uppercase phone:text-[130px] tablet:text-[190px] laptop:text-[250px]"
        />
      </div>

      <div className="relative grid gap-12 px-4 py-20 tablet:px-8 laptop:grid-cols-12 laptop:gap-16 laptop:py-28">
        <div className="flex flex-col gap-6 laptop:col-span-7">
          <Supertitle>{enterprise.eyebrow}</Supertitle>
          <Reveal as="h2" className="is-h2 flex max-w-[760px] flex-col">
            <span className="block overflow-hidden pb-[0.04em]">
              <span data-reveal className="block">
                {enterprise.title.lead}
              </span>
            </span>
            <span className="block overflow-hidden pb-[0.04em]">
              <span data-reveal className="flex items-start gap-3 phone:gap-4">
                <span className="block pt-[0.42em]">
                  <GradientDash />
                </span>
                <span>{enterprise.title.tail}</span>
              </span>
            </span>
          </Reveal>
        </div>

        <div className="flex flex-col gap-10 laptop:col-span-5 laptop:pt-10">
          <RevealText className="max-w-[520px] text-[15px] leading-relaxed text-white/85">{enterprise.body}</RevealText>
          <div data-chips className="flex flex-wrap items-center gap-x-2 gap-y-3" aria-label={enterprise.disciplines.join(" + ")}>
            {enterprise.disciplines.map((discipline, i) => {
              const Icon = disciplineIcons[i];
              return (
                <Fragment key={discipline}>
                  <span
                    data-chip
                    className="chamfer flex items-center gap-2 bg-white/[0.06] px-3.5 py-2.5 font-heading text-[13px] font-semibold uppercase [--cut:7px]"
                  >
                    <Icon aria-hidden className="size-4" />
                    {discipline}
                  </span>
                  {i < enterprise.disciplines.length - 1 && (
                    <span aria-hidden className="font-heading text-lg text-white/40">
                      +
                    </span>
                  )}
                </Fragment>
              );
            })}
          </div>
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-full h-[40lvh] bg-gradient-to-b from-ink to-transparent"
      />
    </section>
  );
}
