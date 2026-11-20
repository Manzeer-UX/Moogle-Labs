"use client";

import { useRef } from "react";
import { LuQuote } from "react-icons/lu";
import { gsap, useGSAP } from "@/lib/gsap";
import { testimonials } from "@/content/site";
import { Supertitle } from "@/components/ui/Supertitle";
import { Reveal } from "@/components/ui/Reveal";

/** "Don't take our word for it. Take theirs.": client quotes (placeholders for now). */
export function Testimonials() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(ref.current!.querySelectorAll("[data-quote]"), {
        autoAlpha: 0,
        y: 40,
        stagger: 0.12,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current!.querySelector("[data-quote-grid]"), start: "top 85%", once: true },
      });
    },
    { scope: ref },
  );

  return (
    <section id="testimonials" ref={ref} data-header="light" className="relative bg-light-grey text-ink">
      <div className="mx-auto max-w-[1440px] px-4 py-20 tablet:px-8 laptop:py-28">
        <div className="flex max-w-[760px] flex-col gap-5">
          <Supertitle variant="brand">{testimonials.eyebrow}</Supertitle>
          <Reveal as="h2" className="is-h2">
            <span className="block overflow-hidden pb-[0.04em]">
              <span data-reveal className="block text-balance">
                {testimonials.title}
              </span>
            </span>
          </Reveal>
        </div>

        <div data-quote-grid className="mt-12 grid gap-5 tablet:grid-cols-2 laptop:grid-cols-3">
          {testimonials.items.map((t, i) => (
            <figure
              key={t.role}
              data-quote
              className={`chamfer flex min-w-0 flex-col p-6 [--cut:22px] tablet:p-7 ${
                i === 1 ? "bg-ink text-white" : "bg-white text-ink"
              }`}
            >
              <LuQuote aria-hidden className={`size-8 ${i === 1 ? "text-lilac" : "text-brand"}`} />
              <blockquote className="mt-5 mb-6 text-[15px] leading-relaxed laptop:text-[16px]">“{t.quote}”</blockquote>
              <figcaption className={`mt-auto border-t border-dashed pt-5 ${i === 1 ? "border-white/25" : "border-ink/20"}`}>
                <span className="block font-heading text-[14px] font-semibold uppercase">{t.role}</span>
                <span className={`mt-1 block text-[12.5px] ${i === 1 ? "text-white/65" : "text-ink/60"}`}>{t.company}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
