"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { operatingModel as om } from "@/content/site";
import { Supertitle } from "@/components/ui/Supertitle";
import { BlinkSquare } from "@/components/ui/Bits";
import { ChamferButton } from "@/components/ui/Buttons";
import { Reveal, RevealText } from "@/components/ui/Reveal";

/* Curve through the three stages, in a 1000×380 viewBox. */
/* Points sit above each stage card; the cards hang just below them. */
const CURVE = "M0,215 C40,192 70,172 110,160 C230,128 330,116 443,103 C560,88 660,64 776,46 C860,36 930,27 1000,21";
const POINTS = [
  { x: 11, y: 42.1 },
  { x: 44.3, y: 27.1 },
  { x: 77.6, y: 12.1 },
];
const PIP = ["33%", "66%", "100%"];

export function OperatingModel() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(ref);
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        const chart = q("[data-chart]")[0];
        // Plays through once on entry (no scrub), so the chart is never left
        // half-drawn with empty space while the visitor reads.
        const tl = gsap.timeline({
          defaults: { duration: 1 },
          scrollTrigger: { trigger: chart, start: "top 85%", once: true },
        });
        tl.timeScale(0.55);
        tl.fromTo(q("[data-curve]"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: "none", duration: 1 }, 0);
        tl.fromTo(q("[data-curve-glow]"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: "none", duration: 1 }, 0);
        q("[data-point]").forEach((point, i) =>
          tl.fromTo(point, { scale: 0 }, { scale: 1, duration: 0.08, ease: "back.out(3)" }, 0.08 + i * 0.32),
        );
        q("[data-stage-card]").forEach((card, i) =>
          tl.fromTo(card, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.18, ease: "power2.out" }, 0.1 + i * 0.32),
        );
      });

      q("[data-om-row]").forEach((row) =>
        gsap.from(row.querySelectorAll("[data-om-cell]"), {
          autoAlpha: 0,
          x: -24,
          stagger: 0.08,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: row, start: "top 92%", once: true },
        }),
      );
      q("[data-om-bar]").forEach((bar, i) =>
        gsap.from(bar, {
          scaleX: 0,
          duration: 1.3,
          delay: (i % 3) * 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: bar, start: "top 94%", once: true },
        }),
      );
      gsap.from(q("[data-om-mobile]"), {
        autoAlpha: 0,
        y: 50,
        stagger: 0.12,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: q("[data-om-mobile-wrap]")[0], start: "top 85%", once: true },
      });
    },
    { scope: ref },
  );

  return (
    <section id="operating-model" ref={ref} data-header="dark" className="relative bg-ink text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-full h-[40lvh] bg-gradient-to-t from-ink to-transparent"
      />
      <div aria-hidden className="bg-dash-grid pointer-events-none absolute inset-0 opacity-20" />

      <div className="relative mx-auto max-w-[1280px] px-4 py-12 tablet:px-8 laptop:py-14">
        <div className="grid gap-6 laptop:grid-cols-12 laptop:items-end">
          <div className="flex flex-col gap-4 laptop:col-span-7">
            <Supertitle>{om.eyebrow}</Supertitle>
            <Reveal as="h2" className="is-h2 laptop:text-[2.6rem]!">
              <span className="block overflow-hidden pb-[0.04em]">
                <span data-reveal className="block text-balance">
                  {om.title.lead} {om.title.pre} <span className="text-lilac">{om.title.highlight}</span>
                </span>
              </span>
            </Reveal>
          </div>
          <RevealText className="max-w-[520px] text-[13.5px] leading-relaxed text-white/80 laptop:col-span-5 laptop:justify-self-end">
            {om.body}
          </RevealText>
        </div>

        {/* Desktop chart + foundations table */}
        <div
          data-chart
          className="mt-6 hidden grid-cols-[180px_repeat(3,minmax(0,1fr))] tablet:grid laptop:grid-cols-[220px_repeat(3,minmax(0,1fr))]"
        >
          <div className="flex flex-col justify-between border-r border-dashed border-white/20 py-1 pr-6">
            <span className="font-heading text-[12px] font-semibold tracking-[0.18em] text-lilac uppercase">
              {om.axis} ↑
            </span>
            <span className="pb-2 font-heading text-[12px] font-semibold tracking-[0.18em] text-white/55 uppercase">
              {om.foundationsLabel} ↓
            </span>
          </div>

          <div className="relative col-span-3 h-[250px] laptop:h-[260px]">
            <div aria-hidden className="absolute inset-y-0 left-1/3 border-l border-dashed border-white/10" />
            <div aria-hidden className="absolute inset-y-0 left-2/3 border-l border-dashed border-white/10" />
            <svg viewBox="0 0 1000 380" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
              <defs>
                <linearGradient id="om-line" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#795df5" />
                  <stop offset="100%" stopColor="#e2daff" />
                </linearGradient>
              </defs>
              <path
                data-curve-glow
                d={CURVE}
                pathLength={1}
                fill="none"
                stroke="#9b84f8"
                strokeOpacity={0.25}
                strokeWidth={10}
                strokeDasharray="1 1"
                strokeLinecap="round"
              />
              <path
                data-curve
                d={CURVE}
                pathLength={1}
                fill="none"
                stroke="url(#om-line)"
                strokeWidth={2.5}
                strokeDasharray="1 1"
                strokeLinecap="round"
              />
            </svg>

            {POINTS.map((p, i) => (
              <span
                key={i}
                data-point
                aria-hidden
                className="absolute flex size-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-lilac/30 shadow-[0_0_18px_rgba(155,132,248,0.7)]"
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
              >
                <span className="absolute inset-0 animate-ping rounded-full bg-lilac/30" />
                <span className="relative size-2.5 rounded-full bg-[#e2daff]" />
              </span>
            ))}

            {om.stages.map((stage, i) => (
              <article
                key={stage.n}
                data-stage-card
                className={`chamfer absolute w-[31%] px-4 py-3.5 backdrop-blur-md [--cut:10px] ${
                  i === 2
                    ? "bg-gradient-to-br from-brand/60 to-brand-deep/40 shadow-[0_0_48px_rgba(121,93,245,0.45)] ring-1 ring-lilac/50"
                    : "bg-white/[0.07] ring-1 ring-white/10"
                }`}
                style={{ left: `${i * 33.333 + 1}%`, top: `calc(${POINTS[i].y}% + 16px)` }}
              >
                <span className="font-heading text-[11px] font-semibold tracking-[0.2em] text-lilac uppercase">
                  Stage {stage.n}
                </span>
                <h3 className="mt-1 font-heading text-[15px] leading-tight font-semibold uppercase laptop:text-[16px]">
                  {stage.title}
                </h3>
                <p className="mt-1 text-[12px] leading-snug text-white/75">{stage.body}</p>
              </article>
            ))}
          </div>

          {om.rows.map((row) => (
            <div key={row.label} data-om-row className="contents">
              <div
                data-om-cell
                className="flex items-center gap-3 border-t border-white/10 py-2.5 pr-4 font-heading text-[12.5px] font-semibold uppercase laptop:text-[13px]"
              >
                <BlinkSquare className="border-lilac" dot="bg-lilac" />
                {row.label}
              </div>
              {row.cells.map((cell, c) => (
                <div
                  key={cell}
                  data-om-cell
                  className="flex min-w-0 items-center gap-3 border-t border-white/10 px-5 py-2.5 text-[12.5px] text-white/80"
                >
                  <span className="relative block h-[3px] w-8 shrink-0 bg-white/15">
                    <span data-om-bar className="absolute inset-y-0 left-0 block origin-left bg-lilac" style={{ width: PIP[c] }} />
                  </span>
                  {cell}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Mobile: one card per stage */}
        <div data-om-mobile-wrap className="relative mt-14 flex flex-col gap-5 tablet:hidden">
          <span className="font-heading text-[12px] font-semibold tracking-[0.18em] text-lilac uppercase">{om.axis} ↑</span>
          {om.stages.map((stage, i) => (
            <article
              key={stage.n}
              data-om-mobile
              className={`chamfer p-5 [--cut:12px] ${i === 2 ? "bg-brand/50" : "bg-white/[0.07]"}`}
            >
              <span className="font-heading text-[11px] font-semibold tracking-[0.2em] text-lilac uppercase">
                Stage {stage.n}
              </span>
              <h3 className="mt-2 font-heading text-[20px] leading-tight font-semibold uppercase">{stage.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-white/75">{stage.body}</p>
              <dl className="mt-4 grid gap-2.5 border-t border-white/10 pt-4">
                {om.rows.map((row) => (
                  <div key={row.label} className="flex items-start justify-between gap-4 text-[12px]">
                    <dt className="font-heading font-semibold text-white/55 uppercase">{row.label}</dt>
                    <dd className="text-right text-white/85">{row.cells[i]}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>

        <div className="mt-6 flex flex-col items-start justify-between gap-4 border-t border-white/15 pt-5 tablet:flex-row tablet:items-center">
          <p className="flex items-center gap-3 text-[13px] text-white/80">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400" />
            </span>
            {om.footnote}
          </p>
          <ChamferButton href={om.cta.href} variant="brand">
            {om.cta.label}
          </ChamferButton>
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-full h-[30lvh] bg-gradient-to-b from-ink to-transparent"
      />
    </section>
  );
}
