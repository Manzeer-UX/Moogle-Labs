import { Manrope, Sora } from "next/font/google";

/* Home 2 uses a modern tech type pairing: Sora headings, Manrope body. */
const sora = Sora({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-sora",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export default function Home2Layout({ children }: LayoutProps<"/home-2">) {
  return (
    <div
      className={`${sora.variable} ${manrope.variable} [font-family:var(--font-body)]`}
      style={
        {
          "--font-heading": "var(--font-sora), ui-sans-serif, system-ui, sans-serif",
          "--font-body": "var(--font-manrope), ui-sans-serif, system-ui, sans-serif",
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
