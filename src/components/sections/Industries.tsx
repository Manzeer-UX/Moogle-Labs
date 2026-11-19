"use client";

import dynamic from "next/dynamic";
import { industries, site } from "@/content/site";
import { Supertitle } from "@/components/ui/Supertitle";
import { LineButton } from "@/components/ui/Buttons";
import { Reveal } from "@/components/ui/Reveal";

const IndustriesSlider = dynamic(() => import("./IndustriesSlider"), {
  ssr: false,
  loading: () => <div className="min-h-[420px] laptop:min-h-[510px]" />,
});

export function Industries() {
  return (
    <section id="industries" data-header="dark" className="relative bg-ink text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-full h-[40lvh] bg-gradient-to-t from-ink to-transparent"
      />
      <div aria-hidden className="bg-dash-grid pointer-events-none absolute inset-0 opacity-25" />

      <div className="relative grid grid-cols-5 items-center gap-12 py-24 tablet:py-36">
        <div className="col-span-5 flex flex-col gap-8 px-4 tablet:col-span-2 tablet:pr-0 tablet:pl-8">
          <Supertitle>{industries.eyebrow}</Supertitle>
          <Reveal as="h2" className="is-h2">
            <span className="block overflow-hidden pb-[0.04em]">
              <span data-reveal className="block text-balance">
                {industries.title.lead} {industries.title.tail}
              </span>
            </span>
          </Reveal>
          <LineButton href={site.contactHref} className="text-white">
            Discuss Your AI Roadmap
          </LineButton>
        </div>

        <div className="col-span-5 tablet:col-span-3">
          <IndustriesSlider />
        </div>
      </div>
    </section>
  );
}
