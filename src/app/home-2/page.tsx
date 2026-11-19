import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SceneCanvas } from "@/components/three/SceneCanvas";
import { Hero } from "@/components/sections/Hero";
import { Capabilities } from "@/components/sections/Capabilities";
import { Industries } from "@/components/sections/Industries";
import { EnterpriseDelivery } from "@/components/sections/EnterpriseDelivery";
import { DeliveryStages } from "@/components/sections/DeliveryStages";
import { WhyMoogle } from "@/components/sections/WhyMoogle";
import { OperatingModel } from "@/components/sections/OperatingModel";
import { FinalCta } from "@/components/sections/FinalCta";
import { Faq } from "@/components/sections/Faq";

export const metadata: Metadata = {
  title: "MoogleLabs • Enterprise AI Engineering (Home 2)",
};

/** Home 2: same content as Home 1, with the energy-orb scene and tech type. */
export default function Home2() {
  return (
    <>
      <Header />
      <SceneCanvas variant="orb" />
      <main className="relative z-10">
        <Hero />
        <Capabilities />
        <Industries />
        <EnterpriseDelivery />
        <DeliveryStages />
        <WhyMoogle />
        <OperatingModel />
        <FinalCta />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
