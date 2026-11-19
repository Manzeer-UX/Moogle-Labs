"use client";

import { useEffect, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { CAPS_BEATS, CAPS_HEAD, CAPS_LEN, capsPanelOnRight, connector, holdOf, onGroupChange } from "@/lib/scene";
import { registerAnchor } from "@/lib/lenis";
import { capabilities } from "@/content/site";
import { Supertitle } from "@/components/ui/Supertitle";
import { GradientDash } from "@/components/ui/Bits";
import { categoryIcons, serviceIcons } from "@/components/ui/icons";

/**
 * Desktop: a pinned (sticky) act where each category panel is tethered to a
 * stroke of the 3D mark. Mobile: a normal stacked list over the scene.
 */
export function Capabilities() {
  const ref = useRef<HTMLElement>(null);
  const panels = useRef<(HTMLDivElement | null)[]>([]);
  const lineRef = useRef<SVGPolylineElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    connector.line = lineRef.current;
    connector.dot = dotRef.current;
    connector.panels = panels.current;

    const hide = () => {
      if (lineRef.current) lineRef.current.style.opacity = "0";
      if (dotRef.current) dotRef.current.style.opacity = "0";
    };
    const offGroup = onGroupChange((g) => {
      if (g !== "A") hide();
    });

    const offAnchors = CAPS_BEATS.map((beat, i) =>
      registerAnchor(`#cap-${i + 1}`, () => {
        const section = ref.current;
        if (!section) return null;
        const top = section.getBoundingClientRect().top + window.scrollY;
        if (window.innerWidth < 1024) {
          const panel = panels.current[i];
          return panel ? panel.getBoundingClientRect().top + window.scrollY - 96 : top;
        }
        return top + holdOf(beat) * window.innerHeight;
      }),
    );

    return () => {
      connector.line = null;
      connector.dot = null;
      connector.panels = [];
      offGroup();
      offAnchors.forEach((off) => off());
    };
  }, []);

  useGSAP(
    () => {
      const q = gsap.utils.selector(ref);
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom bottom", scrub: true },
        });
        const at = (t: number) => t + 1;
        tl.set({}, {}, CAPS_LEN + 1);

        // Intro: the heading has the stage to itself, then clears for the panels.
        const [hA, hB, hC, hD] = CAPS_HEAD;
        const head = q("[data-caps-head]");
        tl.fromTo(head, { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: hB - hA, ease: "power2.out" }, at(hA));
        tl.to(head, { autoAlpha: 0, y: -50, duration: hD - hC, ease: "power2.in" }, at(hC));

        // Panels alternate sides; each slides in from, and back out to, its own edge.
        panels.current.forEach((panel, i) => {
          if (!panel) return;
          const [a, b, c, d] = CAPS_BEATS[i];
          const dir = capsPanelOnRight(i) ? 1 : -1;
          tl.fromTo(panel, { autoAlpha: 0, x: 110 * dir }, { autoAlpha: 1, x: 0, duration: b - a, ease: "power2.out" }, at(a));
          tl.fromTo(
            panel.querySelectorAll("[data-item]"),
            { autoAlpha: 0, y: 26 },
            { autoAlpha: 1, y: 0, duration: b - a, stagger: 0.05, ease: "power2.out" },
            at(a + 0.06),
          );
          tl.to(panel, { autoAlpha: 0, x: 90 * dir, duration: d - c, ease: "power2.in" }, at(c));
        });
      });

      mm.add("(max-width: 1023px)", () => {
        q("[data-caps-card]").forEach((card) =>
          gsap.from(card, {
            autoAlpha: 0,
            y: 60,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: card, start: "top 88%", once: true },
          }),
        );
      });
    },
    { scope: ref },
  );

  return (
    <section
      id="services"
      ref={ref}
      data-header="split"
      className="relative text-white tablet:h-[600lvh]"
      aria-label="Capabilities and solutions"
    >
      {/* Connector from the active panel to its stroke on the 3D mark (desktop) */}
      <svg className="pointer-events-none fixed inset-0 hidden h-full w-full tablet:block" aria-hidden>
        <polyline
          ref={lineRef}
          points="0,0 0,0"
          fill="none"
          stroke="white"
          strokeWidth={1.5}
          style={{ opacity: 0 }}
        />
      </svg>
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 hidden size-4 items-center justify-center border-2 border-white bg-ink tablet:flex"
        style={{ opacity: 0 }}
      >
        <span className="size-1.5 bg-white" />
      </div>

      <div className="relative tablet:sticky tablet:top-0 tablet:h-lvh tablet:overflow-hidden">
        <div
          data-caps-head
          className="px-4 pt-28 pb-10 tablet:absolute tablet:bottom-12 tablet:left-8 tablet:max-w-[min(1000px,80vw)] tablet:p-0"
        >
          <Supertitle>{capabilities.eyebrow}</Supertitle>
          <h2 className="is-h1 mt-5 flex flex-col">
            <span>{capabilities.title.lead}</span>
            <span className="flex items-center gap-3 whitespace-nowrap phone:gap-4">
              <GradientDash />
              <span>{capabilities.title.tail}</span>
            </span>
          </h2>
        </div>

        <div className="flex flex-col gap-6 px-4 pb-28 tablet:contents">
          {capabilities.categories.map((category, i) => {
            const CatIcon = categoryIcons[category.icon];
            const twoCols = category.services.length > 1;
            const onRight = capsPanelOnRight(i);
            // Brackets sit on the edge facing the 3D icon.
            const bracket = onRight ? "-left-3.5" : "-right-3.5";
            return (
              <div
                key={category.index}
                ref={(el) => {
                  panels.current[i] = el;
                }}
                data-caps-card
                className={`relative tablet:absolute tablet:top-1/2 tablet:w-[min(560px,48vw)] tablet:-translate-y-1/2 laptop:w-[min(700px,50vw)] ${
                  onRight ? "tablet:right-8" : "tablet:left-8"
                }`}
              >
                <span aria-hidden className={`absolute top-0 hidden h-[2px] w-2.5 bg-white tablet:block ${bracket}`} />
                <span aria-hidden className={`absolute bottom-0 hidden h-[2px] w-2.5 bg-white tablet:block ${bracket}`} />
                <div className="chamfer max-h-[calc(100lvh-8rem)] overflow-hidden bg-white/[0.95] p-6 text-ink backdrop-blur-xl [--cut:18px] laptop:p-8">
                  <div className="flex items-center gap-3">
                    <Supertitle variant="brand" number={category.index}>
                      {category.label}
                    </Supertitle>
                    <CatIcon aria-hidden className="ml-auto size-6 text-brand" />
                  </div>
                  <h3 className="is-h3 mt-5">{category.title}</h3>
                  <p className="mt-3 text-[13px] leading-relaxed text-ink/75 italic">{category.intro}</p>
                  <div
                    className={`mt-6 grid gap-x-8 gap-y-5 border-t border-ink/15 pt-6 ${twoCols ? "laptop:grid-cols-2" : ""}`}
                  >
                    {category.services.map((service) => {
                      const Icon = serviceIcons[service.icon];
                      return (
                        <div key={service.title} data-item className="flex gap-3">
                          <span className="chamfer flex size-9 shrink-0 items-center justify-center bg-ink text-white [--cut:6px]">
                            <Icon aria-hidden className="size-[18px]" />
                          </span>
                          <div>
                            <h4 className="font-heading text-[14px] leading-tight font-semibold uppercase">
                              {service.title}
                            </h4>
                            <p className="mt-1.5 text-[12.5px] leading-[1.6] text-ink/75">{service.body}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
