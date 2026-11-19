"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { damp } from "@/lib/math";
import { scene } from "@/lib/scene";
import { WHY_POS, whyIn, whyMobileY, whyProgress } from "./poses";
import { TILE_ICONS, createIconTexture } from "./textures";

const TILES = [
  { r: 3.1, y: 1.4, a: 0.2, s: 0.95 },
  { r: 2.6, y: -0.6, a: 1.3, s: 0.8 },
  { r: 3.4, y: 0.4, a: 2.3, s: 1.05 },
  { r: 2.8, y: 1.9, a: 3.4, s: 0.75 },
  { r: 3.3, y: -0.2, a: 4.4, s: 0.9 },
  { r: 2.7, y: 0.9, a: 5.4, s: 0.85 },
];

/** Red icon tiles orbiting the white mark (why MoogleLabs act). */
export function IconTiles() {
  const group = useRef<THREE.Group>(null);
  const tiles = useRef<(THREE.Mesh | null)[]>([]);
  const vis = useRef(0);
  const lastGroup = useRef(scene.group);

  const { geometry, materials } = useMemo(() => {
    const geometry = new RoundedBoxGeometry(1, 1, 0.16, 3, 0.1);
    const materials = TILES.map(
      (_, i) =>
        new THREE.MeshPhysicalMaterial({
          map: createIconTexture(TILE_ICONS[i % TILE_ICONS.length]),
          roughness: 0.32,
          metalness: 0.1,
          clearcoat: 1,
          clearcoatRoughness: 0.2,
        }),
    );
    return { geometry, materials };
  }, []);

  useFrame((frame, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const g = group.current;
    if (!g) return;
    // Acts only switch while an opaque section covers the canvas → snap.
    const snap = scene.group !== lastGroup.current;
    lastGroup.current = scene.group;
    vis.current = snap ? whyIn() : damp(vis.current, whyIn(), 4, dt);
    const v = vis.current;
    g.visible = v > 0.01;
    if (!g.visible) return;

    const mobile = frame.size.width < 1024;
    const t = frame.clock.elapsedTime;
    const p = whyProgress();
    // Orbit tightly around the white logo so the tiles stay clear of the copy.
    g.position.set(mobile ? 0 : WHY_POS.x, mobile ? whyMobileY() - 0.3 : WHY_POS.y - 0.4, 0);

    TILES.forEach((tile, i) => {
      const mesh = tiles.current[i];
      if (!mesh) return;
      const angle = tile.a + t * 0.12 + p * 1.6;
      const r = tile.r * (mobile ? 0.5 : 0.62) * (0.6 + 0.4 * v);
      mesh.position.set(Math.cos(angle) * r, (tile.y - 0.4) * 0.7 + Math.sin(t * 0.8 + i) * 0.1, Math.sin(angle) * r);
      mesh.rotation.set(Math.sin(t * 0.5 + i) * 0.25, -angle + Math.PI / 2 + Math.sin(t * 0.3 + i) * 0.3, 0.1);
      mesh.scale.setScalar(tile.s * v * (mobile ? 0.5 : 0.62));
    });
  });

  return (
    <group ref={group} visible={false}>
      {TILES.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            tiles.current[i] = el;
          }}
          geometry={geometry}
          material={materials[i]}
        />
      ))}
    </group>
  );
}
