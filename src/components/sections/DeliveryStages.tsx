"use client";

import { useEffect, useRef } from "react";
import { LuCircleCheck, LuShieldCheck } from "react-icons/lu";
import { gsap, useGSAP } from "@/lib/gsap";
import { DELIVERY_LEN, GOVERNANCE_BEAT, STAGE_BEATS, holdOf } from "@/lib/scene";
import { registerAnchor } from "@/lib/lenis";
import { delivery } from "@/content/site";
import { Supertitle } from "@/components/ui/Supertitle";
import { BlinkSquare } from "@/components/ui/Bits";
import { stageIcons } from "@/components/ui/icons";

/**
 * Pinned act over the warp tunnel: the seven delivery stages appear one by
 * one in the centre while a rail at the bottom tracks progress.
 */
export function DeliveryStages() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const offs = STAGE_BEATS.map((beat, i) =>
      registerAnchor(`#stage-${String(i + 1).padStart(2, "0")}`, () => {
        const section = ref.current;
        if (!section) return null;
        return section.getBoundingClientRect().top + window.scrollY + holdOf(beat) * window.innerHeight;
      }),
    );
    return () => offs.forEach((off) => off());
  }, []);

  useGSAP(
    () => {
      const q = gsap.utils.selector(ref);
      const at = (t: number) => t + 1;
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom bottom", scrub: true },
      });
      tl.set({}, {}, DELIVERY_LEN + 1);

      const intro = q("[data-intro]");
      tl.fromTo(intro, { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" }, at(-0.65));
      tl.to(intro, { autoAlpha: 0, y: -60, duration: 0.25, ease: "power2.in" }, at(0.6));

      const rail = q("[data-rail]");
      tl.fromTo(rail, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.25 }, at(0.6));
      tl.to(rail, { autoAlpha: 0, y: 20, duration: 0.25 }, at(GOVERNANCE_BEAT[0] - 0.1));

      const stages = q("[data-stage]");
      const fills = q("[data-rail-fill]");
      const labels = q("[data-rail-label]");
      stages.forEach((stage, i) => {
        const [a, b, c, d] = STAGE_BEATS[i];
        tl.fromTo(stage, { autoAlpha: 0, y: 70 }, { autoAlpha: 1, y: 0, duration: b - a, ease: "power2.out" }, at(a));
        tl.fromTo(
          stage.querySelectorAll("[data-stage-item]"),
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: b - a, stagger: 0.04, ease: "power2.out" },
          at(a + 0.04),
        );
        tl.to(stage, { autoAlpha: 0, y: -70, duration: d - c, ease: "power2.in" }, at(c));
        tl.fromTo(fills[i], { scaleX: 0 }, { scaleX: 1, duration: d - a }, at(a));
        tl.fromTo(labels[i], { opacity: 0.4 }, { opacity: 1, duration: 0.1 }, at(a));
      });

      const gov = q("[data-gov]");
      tl.fromTo(gov, { autoAlpha: 0, y: 60, scale: 0.96 }, { autoAlpha: 1, y: 0, scale: 1, duration: GOVERNANCE_BEAT[1] - GOVERNANCE_BEAT[0], ease: "power2.out" }, at(GOVERNANCE_BEAT[0]));
      // clear the stage before "Why MoogleLabs" scrolls in underneath
      tl.to(gov, { autoAlpha: 0, y: -60, duration: 0.25, ease: "power2.in" }, at(DELIVERY_LEN - 0.3));
    },
    { scope: ref },
  );

  return (
    <section
      id="delivery"
      ref={ref}
      data-header="light"
      className="relative text-ink"
      style={{ height: `${(DELIVERY_LEN + 1) * 100}lvh` }}
      aria-label="The 7 delivery stages"
    >
      <div className="sticky top-0 h-lvh overflow-hidden">
        {/* Intro */}
        <div data-intro className="absolute inset-0 flex items-center justify-center px-4">
          <Scrim />
          <div className="relative w-full max-w-[720px]">
            <Supertitle variant="brand">{delivery.eyebrow}</Supertitle>
            <h2 className="is-h1 mt-5 text-balance">
              {delivery.title.lead} {delivery.title.tail}
            </h2>
            <ol className="mt-8 flex flex-wrap gap-x-2 gap-y-2 font-heading text-[12px] font-semibold uppercase">
              {delivery.stages.map((stage, i) => (
                <li key={stage.n} className="flex items-center gap-2">
                  <span className="chamfer bg-white/70 px-2.5 py-1.5 backdrop-blur [--cut:5px]">
                    <span className="text-brand">{stage.n}</span> {stage.name}
                  </span>
                  {i < delivery.stages.length - 1 && <span className="text-ink/30">|</span>}
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Stages */}
        {delivery.stages.map((stage, i) => {
          const Icon = stageIcons[i];
          return (
            <div key={stage.n} data-stage className="invisible absolute inset-0 flex items-center justify-center px-4 pt-10 pb-24">
              <Scrim />
              <span
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-heading text-[46vw] leading-none font-semibold text-ink/[0.035] tablet:text-[30vw]"
              >
                {stage.n}
              </span>
              <div className="relative w-full max-w-[720px] text-center">
                <div data-stage-item className="flex justify-center">
                  <Supertitle variant="brand" number={stage.n} icon={<Icon className="size-3.5" />}>
                    {stage.name}
                  </Supertitle>
                </div>
                <p data-stage-item className="mt-6 font-heading text-[11px] font-semibold tracking-[0.2em] text-brand uppercase">
                  Focus
                </p>
                <h3 data-stage-item className="is-h2 mt-2 text-balance">
                  {stage.focus}
                </h3>
                <p data-stage-item className="mx-auto mt-5 max-w-[580px] text-[13px] leading-relaxed text-ink/80 tablet:text-[14px]">
                  <span className="font-heading font-semibold tracking-wider text-ink uppercase">Engineering execution — </span>
                  {stage.execution}
                </p>
                <div data-stage-item className="mx-auto mt-7 grid max-w-[620px] gap-3 text-left phone:grid-cols-2">
                  <div className="chamfer bg-white/75 p-4 backdrop-blur-md [--cut:10px]">
                    <span className="flex items-center gap-2 font-heading text-[11px] font-semibold tracking-wider text-brand uppercase">
                      <BlinkSquare className="border-brand" dot="bg-brand" />
                      Enterprise outcome
                    </span>
                    <p className="mt-2 font-heading text-[16px] leading-tight font-semibold uppercase">{stage.outcome}</p>
                  </div>
                  <div className="chamfer bg-ink p-4 text-white [--cut:10px]">
                    <span className="font-heading text-[11px] font-semibold tracking-wider text-white/60 uppercase">Solves</span>
                    <ul className="mt-2 flex flex-col gap-1.5">
                      {stage.solves.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-[12.5px] leading-snug">
                          <LuCircleCheck aria-hidden className="mt-0.5 size-3.5 shrink-0 text-lilac" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Governance note */}
        <div data-gov className="invisible absolute inset-0 flex items-center justify-center px-4">
          <Scrim />
          <div className="relative max-w-[680px] text-center">
            <span className="chamfer mx-auto flex size-16 items-center justify-center bg-brand text-white [--cut:10px]">
              <LuShieldCheck aria-hidden className="size-8" />
            </span>
            <h3 className="is-h1 mt-6">{delivery.governance.title}</h3>
            <p className="mx-auto mt-5 max-w-[520px] text-[15px] leading-relaxed text-ink/80">{delivery.governance.body}</p>
          </div>
        </div>

        {/* Progress rail */}
        <div data-rail className="invisible absolute inset-x-4 bottom-6 tablet:inset-x-8 tablet:bottom-8">
          <ol className="grid grid-cols-7 gap-1.5 tablet:gap-3">
            {delivery.stages.map((stage) => (
              <li key={stage.n} className="flex flex-col gap-2">
                <span
                  data-rail-label
                  className="flex items-baseline gap-1.5 font-heading text-[11px] font-semibold uppercase opacity-40"
                >
                  <span className="text-brand">{stage.n}</span>
                  <span className="hidden tablet:inline">{stage.name}</span>
                </span>
                <span className="block h-[3px] bg-ink/15">
                  <span data-rail-fill className="block h-full origin-left scale-x-0 bg-brand" />
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/** Soft light backdrop that keeps centred copy readable over the flying cubes. */
function Scrim() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute top-1/2 left-1/2 h-[min(86lvh,760px)] w-[min(96vw,1080px)] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgba(244,243,249,0.96)_0%,rgba(244,243,249,0.88)_55%,rgba(244,243,249,0)_100%)]"
    />
  );
}
