"use client";

import { useRef } from "react";
import { LuArrowUpRight } from "react-icons/lu";
import { gsap, useGSAP } from "@/lib/gsap";
import { caseStudies } from "@/content/site";
import { Supertitle } from "@/components/ui/Supertitle";
import { Reveal } from "@/components/ui/Reveal";
import { LineButton } from "@/components/ui/Buttons";
import { BlinkSquare } from "@/components/ui/Bits";

/** "Work we've delivered. Proof, not promises": three outcome-led case studies. */
export function CaseStudies() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(ref.current!.querySelectorAll("[data-case]"), {
        autoAlpha: 0,
        y: 40,
        stagger: 0.12,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current!.querySelector("[data-case-grid]"), start: "top 85%", once: true },
      });
    },
    { scope: ref },
  );

  return (
    <section id="case-studies" ref={ref} data-header="light" className="relative bg-light-grey text-ink">
      <div className="mx-auto max-w-[1440px] px-4 py-20 tablet:px-8 laptop:py-28">
        <div className="flex flex-col gap-6 tablet:flex-row tablet:items-end tablet:justify-between">
          <div className="flex max-w-[720px] flex-col gap-5">
            <Supertitle variant="brand">{caseStudies.eyebrow}</Supertitle>
            <Reveal as="h2" className="is-h2">
              <span className="block overflow-hidden pb-[0.04em]">
                <span data-reveal className="block text-balance">
                  {caseStudies.title}
                </span>
              </span>
            </Reveal>
          </div>
          <LineButton href={caseStudies.cta.href} className="self-start text-ink tablet:self-auto">
            {caseStudies.cta.label}
          </LineButton>
        </div>

        <div data-case-grid className="mt-12 grid gap-5 tablet:grid-cols-2 laptop:grid-cols-3">
          {caseStudies.items.map((item) => (
            <article
              key={item.title}
              data-case
              className="chamfer group flex min-w-0 flex-col bg-white p-6 [--cut:22px] tablet:p-7"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 font-heading text-[11px] font-semibold tracking-wider text-brand uppercase">
                  <BlinkSquare className="border-brand" dot="bg-brand" />
                  {item.industry}
                </span>
                <LuArrowUpRight
                  aria-hidden
                  className="size-5 text-ink/40 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand"
                />
              </div>
              <p className="mt-6 text-[12px] font-medium tracking-wide text-ink/55 uppercase">{item.client}</p>
              <h3 className="mt-2 font-heading text-[20px] leading-tight font-semibold uppercase laptop:text-[22px]">
                {item.title}
              </h3>
              <p className="mt-3 mb-6 text-[13.5px] leading-relaxed text-ink/75">{item.summary}</p>
              <dl className="mt-auto grid grid-cols-3 gap-3 border-t border-dashed border-ink/20 pt-5">
                {item.metrics.map((m) => (
                  <div key={m.label} className="min-w-0">
                    <dt className="sr-only">{m.label}</dt>
                    <dd className="font-heading text-[22px] leading-none font-semibold text-brand laptop:text-[26px]">{m.value}</dd>
                    <dd className="mt-1.5 text-[11.5px] leading-snug text-ink/65">{m.label}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
