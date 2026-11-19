import { LOGO_ICON, LOGO_WORDMARK } from "./logo-paths";

type LogoProps = {
  className?: string;
  /** Render only the icon (the network "M") */
  iconOnly?: boolean;
};

/**
 * Official MoogleLabs logo (from mooglelabs.com), drawn in the site palette:
 * every part follows `currentColor` (white on dark sections, maroon on light
 * ones). Set the `--logo-accent` CSS variable to tint the icon and "LABS".
 */
export function Logo({ className = "h-7 w-auto", iconOnly = false }: LogoProps) {
  return (
    <svg
      viewBox={iconOnly ? "0 0 35 28" : "0 0 146 28"}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="MoogleLabs"
      className={className}
    >
      {LOGO_ICON}
      {!iconOnly && LOGO_WORDMARK}
    </svg>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return <Logo iconOnly className={className} />;
}
