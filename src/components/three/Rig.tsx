"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scene, type SceneGroup } from "@/lib/scene";
import { lerp } from "@/lib/math";
import { capsIn, whyIn, whyProgress } from "./poses";

const pos = new THREE.Vector3();
const look = new THREE.Vector3();

/** Camera choreography for every act, plus gentle pointer parallax. */
export function Rig() {
  const currentLook = useRef(new THREE.Vector3(0, 0, 0));
  const lastGroup = useRef<SceneGroup>(null);

  useFrame((frame, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const cam = frame.camera as THREE.PerspectiveCamera;
    const mobile = frame.size.width < 1024;
    const g = scene.group;

    if (g === "A") {
      const h = capsIn();
      // Centred framing: the icon alternates between the left and right thirds.
      pos.set(0, lerp(0, mobile ? 1.1 : 1.7, h), lerp(10, mobile ? 11.5 : 10.8, h));
      look.set(0, lerp(0, mobile ? 0.6 : -0.15, h), 0);
    } else if (g === "B") {
      // Gentle push-in that keeps the white logo in the top-left quadrant.
      const w = whyIn();
      const p = whyProgress();
      const wx = lerp(mobile ? 0.6 : 0.5, mobile ? 0.3 : 0.1, p);
      const wy = lerp(mobile ? 1.4 : 1.6, mobile ? 1.1 : 1.25, p);
      const wz = lerp(mobile ? 12 : 10.2, mobile ? 11 : 9.2, p);
      pos.set(lerp(0, wx, w), lerp(0, wy, w), lerp(10, wz, w));
      look.set(0, lerp(0, mobile ? 0 : 0.1, w), lerp(-20, 0, w));
    } else {
      pos.set(0, 0, 10);
      look.set(0, 0, 0);
    }

    pos.x += scene.pointer.x * 0.28;
    pos.y += scene.pointer.y * 0.16;

    const snap = g !== lastGroup.current;
    lastGroup.current = g;
    const k = snap ? 1 : 1 - Math.exp(-4 * dt);
    cam.position.lerp(pos, k);
    currentLook.current.lerp(look, k);
    cam.lookAt(currentLook.current);

    const fov = mobile ? 42 : 35;
    if (cam.fov !== fov) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }
  });

  return null;
}
