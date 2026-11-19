import { CAPS_BEATS, WHY_LEN, capsPanelOnRight, scene } from "@/lib/scene";
import { beatWindow, clamp, range, smooth } from "@/lib/math";

/** 0 in the hero → 1 once the capabilities act has taken over. */
export const capsIn = () => smooth(range(0.12, 1, scene.a.hero));

/** Desktop capabilities: |x| of the icon when it sits beside a panel. */
export const CAPS_ICON_X = 2.9;

/**
 * Desktop capabilities: the icon always sits opposite the active panel.
 * At every hand-over between panels it swings across the screen and makes one
 * full turn. Returns the side (0 = left, 1 = right) and the turns completed.
 */
export function capsSwing(T: number) {
  let side = 0;
  let turns = 0;
  for (let i = 0; i < CAPS_BEATS.length - 1; i++) {
    const k = smooth(range(CAPS_BEATS[i][2], CAPS_BEATS[i + 1][1], T));
    side += capsPanelOnRight(i) ? k : -k;
    turns += k;
  }
  return { side, turns };
}

/** Per-stroke highlight (0..1) for the four capability categories. */
export function capabilityHighlights(out: number[]) {
  for (let i = 0; i < 4; i++) out[i] = scene.group === "A" ? beatWindow(scene.a.t, CAPS_BEATS[i]) : 0;
  return out;
}

/** Warp tunnel visibility during the delivery stages. */
export const warpVisibility = () =>
  scene.group === "B" ? smooth(range(-1, -0.2, scene.b.td)) * (1 - smooth(range(-0.9, -0.05, scene.b.tw))) : 0;

/** White mark entrance for the "Why MoogleLabs" act. */
export const whyIn = () => (scene.group === "B" ? smooth(range(-0.85, 0.2, scene.b.tw)) : 0);

/** 0..1 progress through the why act. */
export const whyProgress = () => clamp(scene.b.tw, 0, WHY_LEN) / WHY_LEN;

/** Where the white logo icon floats during the why act (desktop, world units). */
export const WHY_POS = { x: -2.35, y: 1.25 };

/**
 * Mobile why act: the icon sits in the top half while the headline (bottom)
 * shows, then drops to the bottom half once the cards (top) take over.
 */
export const whyMobileY = () => {
  const k = smooth(range(-0.1, 0.25, scene.b.tw));
  return 1.75 + (-1.85 - 1.75) * k;
};
