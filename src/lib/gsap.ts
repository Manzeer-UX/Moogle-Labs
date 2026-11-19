import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, useGSAP);
  ScrollTrigger.config({ ignoreMobileResize: true });
}

export const SCRAMBLE_CHARS = "!<>-_\\/[]{}=+*^?#01";

export { gsap, ScrollTrigger, SplitText, ScrambleTextPlugin, useGSAP };
