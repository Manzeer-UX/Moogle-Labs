import { trust } from "@/content/site";
import { industryIcons } from "@/components/ui/icons";

/**
 * "Trusted by Teams At": a slow, endless strip of client wordmarks. The
 * names are placeholders until real logos are approved (see content/site).
 */
export function TrustBar() {
  const logos = [...trust.logos, ...trust.logos]; // two copies → seamless loop
  return (
    <section id="trust" data-header="split" aria-label={trust.label} className="relative overflow-hidden py-10 text-white tablet:py-14">
      <p className="relative px-4 text-center font-heading text-[12px] font-semibold tracking-[0.22em] text-lilac uppercase drop-shadow-[0_1px_8px_rgba(27,17,64,0.6)] tablet:px-8">
        {trust.label}
      </p>
      <div className="relative mt-7 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
        <ul className="flex w-max animate-marquee items-center gap-12 hover:[animation-play-state:paused] motion-reduce:animate-none tablet:gap-16">
          {logos.map((logo, i) => {
            const Icon = industryIcons[logo.mark];
            return (
              <li
                key={`${logo.name}-${i}`}
                aria-hidden={i >= trust.logos.length}
                className="flex shrink-0 items-center gap-2.5 text-white/80 drop-shadow-[0_1px_10px_rgba(27,17,64,0.55)] transition-colors hover:text-white"
              >
                <Icon aria-hidden className="size-6 tablet:size-7" />
                <span className="font-heading text-[17px] font-semibold tracking-tight whitespace-nowrap tablet:text-[20px]">
                  {logo.name}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
