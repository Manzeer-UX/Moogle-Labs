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

export default function Home() {
  return (
    <>
      <Header />
      <SceneCanvas />
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
