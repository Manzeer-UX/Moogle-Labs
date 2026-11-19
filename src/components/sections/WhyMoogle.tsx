"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { WHY_BEATS, WHY_LEN } from "@/lib/scene";
import { why } from "@/content/site";
import { Supertitle } from "@/components/ui/Supertitle";
import { GradientDash } from "@/components/ui/Bits";
import { whyIcons } from "@/components/ui/icons";

/**
 * Pinned act around the white 3D mark: the headline sits bottom-left while
 * the six differentiators cycle through the top-right panel.
 */
export function WhyMoogle() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(ref);
      const at = (t: number) => t + 1;
      const head = q("[data-why-head]");
      const items = q("[data-why-item]");
      const mm = gsap.matchMedia();

      mm.add({ desktop: "(min-width: 1024px)", mobile: "(max-width: 1023px)" }, (ctx) => {
        const { mobile } = ctx.conditions as { mobile: boolean };
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom bottom", scrub: true },
        });
        tl.set({}, {}, WHY_LEN + 1);
        // Heading arrives once the delivery copy has cleared, leaves before the next section.
        tl.fromTo(head, { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" }, at(-0.3));
        if (mobile) tl.to(head, { autoAlpha: 0, y: 40, duration: 0.2 }, at(WHY_BEATS[0][0] - 0.05));
        else tl.to(head, { autoAlpha: 0, y: -40, duration: 0.25, ease: "power2.in" }, at(WHY_LEN - 0.35));

        items.forEach((item, j) => {
          const [a, b, c, d] = WHY_BEATS[j];
          tl.fromTo(item, { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: b - a, ease: "power2.out" }, at(a));
          tl.fromTo(
            item.querySelectorAll("[data-why-line]"),
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: b - a, stagger: 0.04, ease: "power2.out" },
            at(a + 0.04),
          );
          if (d < 50) tl.to(item, { autoAlpha: 0, y: -40, duration: d - c, ease: "power2.in" }, at(c));
        });
      });
    },
    { scope: ref },
  );

  return (
    <section
      id="why"
      ref={ref}
      data-header="light"
      className="relative text-ink"
      style={{ height: `${(WHY_LEN + 1) * 100}lvh` }}
      aria-label="Why MoogleLabs"
    >
      <div className="sticky top-0 h-lvh overflow-hidden">
        <div
          data-why-head
          className="absolute right-4 bottom-8 left-4 tablet:right-auto tablet:bottom-12 tablet:left-8 tablet:max-w-[min(760px,55vw)]"
        >
          <Supertitle variant="brand">{why.eyebrow}</Supertitle>
          <h2 className="is-h2 mt-5 flex flex-col">
            <span className="text-balance">{why.title.lead}</span>
            <span className="flex items-start gap-3 phone:gap-4">
              <span className="block pt-[0.42em]">
                <GradientDash tone="ink" />
              </span>
              <span className="text-balance">{why.title.tail}</span>
            </span>
          </h2>
          <p className="mt-5 max-w-[540px] text-[13.5px] leading-relaxed text-ink/80">{why.body}</p>
        </div>

        <div className="absolute top-24 right-4 left-4 tablet:top-28 tablet:right-8 tablet:left-auto tablet:w-[min(540px,42vw)]">
          {why.items.map((item, j) => {
            const Icon = whyIcons[item.icon];
            return (
              <article
                key={item.title}
                data-why-item
                className="chamfer invisible absolute inset-x-0 top-0 bg-white/80 p-6 backdrop-blur-md [--cut:14px] laptop:p-7"
              >
                <div data-why-line className="flex items-center justify-between gap-3">
                  <Supertitle variant="brand" icon={<Icon className="size-3.5" />}>
                    Differentiator
                  </Supertitle>
                  <span className="font-heading text-[13px] font-semibold text-ink/50">
                    {String(j + 1).padStart(2, "0")} / {String(why.items.length).padStart(2, "0")}
                  </span>
                </div>
                <h3 data-why-line className="is-h3 mt-5">
                  {item.title}
                </h3>
                <p data-why-line className="mt-3 text-[13px] leading-relaxed text-ink/80">
                  {item.body}
                </p>
                <p
                  data-why-line
                  className="mt-5 border-t border-ink/15 pt-4 font-heading text-[16px] leading-tight font-semibold text-brand uppercase"
                >
                  {item.differentiator}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
