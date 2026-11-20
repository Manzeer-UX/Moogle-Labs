import type { ReactNode } from "react";
import { LuArrowRight } from "react-icons/lu";
import { ScrambleText } from "./ScrambleText";

type Variant = "ink" | "white" | "brand";

const variants: Record<Variant, string> = {
  ink: "bg-ink text-white hover:bg-plum",
  white: "bg-white text-ink hover:bg-light-grey",
  brand: "bg-gradient-to-r from-brand-deep to-brand-light text-white hover:brightness-110",
};

type ChamferButtonProps = {
  href: string;
  children: string;
  variant?: Variant;
  className?: string;
  icon?: ReactNode;
  external?: boolean;
};

/** Solid button with the chamfered (cut) corners. */
export function ChamferButton({ href, children, variant = "brand", className = "", icon, external }: ChamferButtonProps) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className={`chamfer inline-flex min-h-11 max-w-full shrink-0 items-center gap-3 px-5 py-2.5 text-left font-heading text-[13px] leading-tight font-semibold tracking-[0.03em] uppercase transition-[background-color,color,scale,filter] duration-300 [--cut:8px] active:scale-95 ${variants[variant]} ${className}`}
    >
      {/* long labels may wrap on narrow screens instead of overflowing */}
      <ScrambleText text={children} className="whitespace-normal" />
      {icon}
    </a>
  );
}

type LineButtonProps = {
  href: string;
  children: string;
  className?: string;
  arrow?: boolean;
};

/** Outline button drawn with individual lines; the lines retract on hover. */
export function LineButton({ href, children, className = "", arrow = true }: LineButtonProps) {
  return (
    <a href={href} className={`line-btn ${className}`}>
      <i className="t" />
      <i className="b" />
      <i className="l" />
      <i className="r" />
      <i className="tl" />
      <i className="br" />
      <ScrambleText text={children} />
      {arrow && <LuArrowRight aria-hidden className="size-4" />}
    </a>
  );
}
