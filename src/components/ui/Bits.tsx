/** Small decorative primitives shared by many sections. */

export function BlinkSquare({ className = "border-white", dot = "bg-white" }: { className?: string; dot?: string }) {
  return (
    <span aria-hidden className={`flex size-3 shrink-0 items-center justify-center border-[1.5px] ${className}`}>
      <span className={`size-1.5 animate-blink ${dot}`} />
    </span>
  );
}

export function GradientDash({ className = "", tone = "white" }: { className?: string; tone?: "white" | "ink" }) {
  const color = tone === "white" ? "from-white" : "from-ink";
  return (
    <span
      aria-hidden
      className={`inline-block h-[4px] w-[40px] shrink-0 bg-gradient-to-l to-transparent phone:h-[6px] phone:w-[60px] laptop:w-[120px] ${color} ${className}`}
    />
  );
}

export function Barcode({ className = "bg-ink", bars = 7 }: { className?: string; bars?: number }) {
  return (
    <span aria-hidden className="flex items-center gap-[6px]">
      {Array.from({ length: bars }, (_, i) => (
        <span key={i} className={`h-5 w-[2px] ${className}`} />
      ))}
    </span>
  );
}
