"use client";

import { useEffect, useRef, useState } from "react";
import { LuPlus } from "react-icons/lu";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { faq } from "@/content/site";
import { Supertitle } from "@/components/ui/Supertitle";
import { Reveal } from "@/components/ui/Reveal";

export function Faq() {
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<number | null>(0);

  // Deep links such as #faq-5 (from the hero friction picker) open their answer.
  useEffect(() => {
    const onNavigate = (event: Event) => {
      const hash = (event as CustomEvent<string>).detail;
      const match = /^#faq-(\d+)$/.exec(hash ?? "");
      if (match) setOpen(Number(match[1]) - 1);
    };
    window.addEventListener("moogle:navigate", onNavigate);
    return () => window.removeEventListener("moogle:navigate", onNavigate);
  }, []);

  // Accordion height changes move everything below; keep triggers in sync.
  useEffect(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 520);
    return () => window.clearTimeout(id);
  }, [open]);

  useGSAP(
    () => {
      gsap.from(ref.current!.querySelectorAll("[data-faq-item]"), {
        autoAlpha: 0,
        y: 40,
        stagger: 0.07,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current!.querySelector("[data-faq-list]"), start: "top 85%", once: true },
      });
    },
    { scope: ref },
  );

  return (
    <section id="faq" ref={ref} data-header="light" className="relative bg-light-grey py-24 text-ink laptop:py-36">
      <div className="grid gap-12 px-4 tablet:px-8 laptop:grid-cols-12">
        <div className="min-w-0 self-start laptop:sticky laptop:top-32 laptop:col-span-5">
          <Supertitle variant="brand">{faq.eyebrow}</Supertitle>
          <Reveal as="h2" className="is-h1 mt-6 break-words laptop:text-[clamp(2.5rem,4.2vw,4.5rem)]!">
            <span className="block overflow-hidden pb-[0.04em]">
              <span data-reveal className="block text-balance">
                {faq.title.lead} {faq.title.tail}
              </span>
            </span>
          </Reveal>
        </div>

        <ul data-faq-list className="border-b border-ink/20 laptop:col-span-7 laptop:col-start-6">
          {faq.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <li key={item.q} id={`faq-${i + 1}`} data-faq-item className="scroll-mt-28 border-t border-ink/20">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="group flex w-full items-start gap-4 py-6 text-left phone:gap-6"
                >
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center border-2 border-brand font-heading text-[11px] font-semibold text-brand">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 font-heading text-[17px] leading-snug font-semibold transition-colors group-hover:text-brand laptop:text-[20px]">
                    {item.q}
                  </span>
                  <span
                    className={`chamfer flex size-9 shrink-0 items-center justify-center text-white transition-colors duration-300 [--cut:6px] ${
                      isOpen ? "bg-brand" : "bg-ink"
                    }`}
                  >
                    <LuPlus
                      aria-hidden
                      className={`size-4 transition-transform duration-500 ${isOpen ? "rotate-[135deg]" : ""}`}
                    />
                  </span>
                </button>
                <div
                  id={`faq-panel-${i}`}
                  role="region"
                  className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.65,0,0.35,1)]"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-[760px] pr-12 pb-8 pl-12 text-[14px] leading-relaxed text-ink/80 phone:pl-14">
                      {item.a}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
