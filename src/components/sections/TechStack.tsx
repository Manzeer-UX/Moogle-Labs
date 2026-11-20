"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { techStack } from "@/content/site";
import { Supertitle } from "@/components/ui/Supertitle";
import { Reveal, RevealText } from "@/components/ui/Reveal";

/** "Technology Ecosystem": the platforms we integrate with, grouped by layer. */
export function TechStack() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(ref.current!.querySelectorAll("[data-tech-group]"), {
        autoAlpha: 0,
        y: 30,
        stagger: 0.08,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current!.querySelector("[data-tech-grid]"), start: "top 85%", once: true },
      });
    },
    { scope: ref },
  );

  return (
    <section id="tech-stack" ref={ref} data-header="dark" className="relative bg-ink text-white">
      <div aria-hidden className="bg-dash-grid pointer-events-none absolute inset-0 opacity-20" />
      <div className="relative mx-auto max-w-[1440px] px-4 py-20 tablet:px-8 laptop:py-28">
        <div className="grid gap-8 laptop:grid-cols-12 laptop:items-end">
          <div className="flex flex-col gap-5 laptop:col-span-7">
            <Supertitle>{techStack.eyebrow}</Supertitle>
            <Reveal as="h2" className="is-h2">
              <span className="block overflow-hidden pb-[0.04em]">
                <span data-reveal className="block text-balance">
                  {techStack.title}
                </span>
              </span>
            </Reveal>
          </div>
          <RevealText className="max-w-[480px] text-[14px] leading-relaxed text-white/75 laptop:col-span-5 laptop:justify-self-end">
            {techStack.body}
          </RevealText>
        </div>

        <div data-tech-grid className="mt-12 grid gap-4 phone:grid-cols-2 laptop:grid-cols-3">
          {techStack.groups.map((group, i) => (
            <div
              key={group.name}
              data-tech-group
              className="chamfer min-w-0 bg-white/[0.06] p-5 ring-1 ring-white/10 backdrop-blur-sm [--cut:14px]"
            >
              <p className="flex items-baseline gap-2 font-heading text-[12px] font-semibold tracking-[0.18em] uppercase">
                <span className="text-lilac">{String(i + 1).padStart(2, "0")}</span>
                {group.name}
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="chamfer bg-white/10 px-3 py-1.5 text-[12.5px] font-medium text-white/90 [--cut:5px]"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
