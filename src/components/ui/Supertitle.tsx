import type { ReactNode } from "react";

type Variant = "light" | "brand" | "ink";

const styles: Record<Variant, { block: string; text: string; box: string }> = {
  light: { block: "bg-white", text: "text-ink", box: "border-white text-white" },
  brand: { block: "bg-brand", text: "text-white", box: "border-brand text-brand" },
  ink: { block: "bg-ink", text: "text-white", box: "border-ink text-ink" },
};

type SupertitleProps = {
  children: ReactNode;
  variant?: Variant;
  number?: string;
  icon?: ReactNode;
  className?: string;
  as?: "span" | "div" | "p" | "h2" | "h3" | "h4";
};

/** Label tag with the two trailing bars, e.g. [ANALYTICS FOR]▌▎ */
export function Supertitle({ children, variant = "light", number, icon, className = "", as: Tag = "span" }: SupertitleProps) {
  const s = styles[variant];
  return (
    <Tag className={`supertitle inline-flex items-stretch gap-1 ${className}`}>
      {number && (
        <span className={`-mr-0.5 flex size-7 shrink-0 items-center justify-center border-2 text-[11px] ${s.box}`}>
          {number}
        </span>
      )}
      {icon && (
        <span className={`-mr-0.5 flex size-7 shrink-0 items-center justify-center border-2 ${s.box}`}>{icon}</span>
      )}
      <span className={`flex min-h-7 w-fit items-center px-3 py-0.5 ${s.block} ${s.text}`}>{children}</span>
      <span aria-hidden className={`min-h-7 w-2 ${s.block}`} />
      <span aria-hidden className={`min-h-7 w-1 ${s.block}`} />
    </Tag>
  );
}
