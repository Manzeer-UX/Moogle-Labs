"use client";

import { LuCalendarClock } from "react-icons/lu";
import { finalCta } from "@/content/site";
import { Supertitle } from "@/components/ui/Supertitle";
import { BlinkSquare } from "@/components/ui/Bits";
import { ChamferButton } from "@/components/ui/Buttons";
import { RevealText } from "@/components/ui/Reveal";
import { NumberRoller } from "@/components/ui/Motion";

export function FinalCta() {
  return (
    <section id="next-steps" data-header="dark" className="relative py-28 text-white laptop:py-40">
      <div className="relative flex flex-col gap-16 px-4 tablet:px-8 laptop:flex-row laptop:justify-between laptop:gap-24">
        <div className="flex flex-col gap-8 laptop:w-[62%]">
          <Supertitle>{finalCta.eyebrow}</Supertitle>
          <RevealText as="h2" className="is-h1 text-balance">
            {finalCta.title}
          </RevealText>
          <RevealText className="max-w-[580px] text-[15px] leading-relaxed text-white/85" delay={0.15}>
            {finalCta.body}
          </RevealText>
          <div className="flex flex-col gap-5">
            <ChamferButton href={finalCta.cta.href} variant="white" className="h-12 self-start px-6">
              {finalCta.cta.label}
            </ChamferButton>
            <ul className="flex flex-wrap gap-x-8 gap-y-3 text-[13px] text-white/85">
              {finalCta.micro.map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <BlinkSquare />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-start gap-6 laptop:items-end laptop:pt-[8vw]">
          <Supertitle icon={<LuCalendarClock className="size-4" />}>{finalCta.stat.label}</Supertitle>
          <NumberRoller value={finalCta.stat.value} className="text-[44vw] laptop:text-[24vw] big:text-[22vw]" />
        </div>
      </div>
    </section>
  );
}
