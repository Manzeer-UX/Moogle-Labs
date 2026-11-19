"use client";

import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Keyboard } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import "swiper/css";
import { gsap, useGSAP } from "@/lib/gsap";
import { industries } from "@/content/site";
import { Barcode } from "@/components/ui/Bits";
import { industryIcons } from "@/components/ui/icons";

/**
 * Draggable industry cards with a "Drag" cursor badge. Client-only: Swiper
 * reads the clock while rendering, which Next's prerender does not allow.
 */
export default function IndustriesSlider() {
  const area = useRef<HTMLDivElement>(null);
  const badge = useRef<HTMLDivElement>(null);
  const swiper = useRef<SwiperType | null>(null);

  useGSAP(
    () => {
      const zone = area.current;
      const tag = badge.current;
      if (!zone || !tag) return;

      gsap.set(tag, { autoAlpha: 0, scale: 0.6, xPercent: -50, yPercent: -50 });
      const xTo = gsap.quickTo(tag, "x", { duration: 0.35, ease: "power3" });
      const yTo = gsap.quickTo(tag, "y", { duration: 0.35, ease: "power3" });
      const move = (e: PointerEvent) => {
        const r = zone.getBoundingClientRect();
        xTo(e.clientX - r.left);
        yTo(e.clientY - r.top);
      };
      const enter = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        gsap.to(tag, { autoAlpha: 1, scale: 1, duration: 0.3, ease: "power3.out" });
      };
      const leave = () => gsap.to(tag, { autoAlpha: 0, scale: 0.6, duration: 0.25 });
      zone.addEventListener("pointermove", move);
      zone.addEventListener("pointerenter", enter);
      zone.addEventListener("pointerleave", leave);

      gsap.from(zone.querySelectorAll("[data-ind-card]"), {
        y: 90,
        autoAlpha: 0,
        stagger: 0.08,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: { trigger: zone, start: "top 82%", once: true },
      });

      return () => {
        zone.removeEventListener("pointermove", move);
        zone.removeEventListener("pointerenter", enter);
        zone.removeEventListener("pointerleave", leave);
      };
    },
    { scope: area },
  );

  return (
    <div ref={area} className="relative cursor-grab overflow-hidden active:cursor-grabbing">
      <div
        ref={badge}
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 z-40 hidden items-center gap-3 bg-white px-3 py-1.5 font-heading text-[13px] font-semibold uppercase text-ink tablet:flex"
      >
        <LuChevronLeft className="size-3.5" />
        Drag
        <LuChevronRight className="size-3.5" />
      </div>

      <Swiper
        className="industries-swiper"
        modules={[Keyboard, A11y]}
        onSwiper={(s) => {
          swiper.current = s;
        }}
        loop
        grabCursor
        keyboard={{ enabled: true }}
        slidesPerView="auto"
        spaceBetween={0}
        speed={750}
        a11y={{ enabled: true }}
      >
        {industries.items.map((item, i) => {
          const Icon = industryIcons[item.icon];
          return (
            <SwiperSlide key={item.name} className="!w-[min(82vw,380px)] pl-4 laptop:!w-[400px]">
              <article
                data-ind-card
                className="chamfer-alt relative flex h-full min-h-[340px] flex-col overflow-hidden bg-white p-6 text-ink [--cut:52px] laptop:min-h-[430px]"
              >
                <div className="supertitle flex items-center gap-2 text-[13px]">
                  <span>AI</span>
                  <span aria-hidden className="h-[2px] w-12 bg-gradient-to-l from-ink to-transparent" />
                  <span>{String(i + 1).padStart(2, "0")}</span>
                </div>
                <Icon aria-hidden className="absolute -right-8 -bottom-8 size-56 text-ink/[0.045]" />
                <span className="chamfer mt-12 flex size-16 items-center justify-center bg-ink text-white [--cut:10px] laptop:size-20">
                  <Icon aria-hidden className="size-8 laptop:size-10" />
                </span>
                <h3 className="is-h2 mt-auto max-w-[90%] pt-10 pb-12">{item.name}</h3>
                <div className="absolute right-6 bottom-6">
                  <Barcode />
                </div>
              </article>
            </SwiperSlide>
          );
        })}
      </Swiper>

      <div className="mt-8 flex items-center gap-2 px-4">
        <button
          type="button"
          aria-label="Previous industry"
          onClick={() => swiper.current?.slidePrev()}
          className="chamfer flex size-10 items-center justify-center bg-white/10 text-white transition-colors [--cut:6px] hover:bg-white hover:text-ink"
        >
          <LuChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Next industry"
          onClick={() => swiper.current?.slideNext()}
          className="chamfer flex size-10 items-center justify-center bg-white/10 text-white transition-colors [--cut:6px] hover:bg-white hover:text-ink"
        >
          <LuChevronRight className="size-4" />
        </button>
        <span className="ml-3 font-heading text-[12px] tracking-wider text-white/60 uppercase">
          {String(industries.items.length).padStart(2, "0")} sectors
        </span>
      </div>
    </div>
  );
}
