import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Oxanium } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { Loader } from "@/components/layout/Loader";

const oxanium = Oxanium({
  subsets: ["latin"],
  variable: "--font-oxanium",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MoogleLabs • Enterprise AI Engineering",
  description:
    "From Experimental AI to Production Intelligence. MoogleLabs engineers secure, governed, cost-efficient AI platforms that run reliably at scale inside your core operations.",
};

export const viewport: Viewport = {
  themeColor: "#1b1140",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${oxanium.variable} ${jetbrains.variable}`}>
      <body>
        <noscript>
          <style>{`[data-loader]{display:none!important}`}</style>
        </noscript>
        <SmoothScroll />
        <Loader />
        {children}
      </body>
    </html>
  );
}
