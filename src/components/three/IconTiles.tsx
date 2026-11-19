"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { damp } from "@/lib/math";
import { scene } from "@/lib/scene";
import { WHY_POS, whyIn, whyMobileY, whyProgress } from "./poses";
import { TILE_ICONS, createGlyphTexture, createIconTexture } from "./textures";
import type { MarkVariant } from "./Mark";
import { strandMaterial } from "./Orb";
import { glassMaterial, roundedRect } from "./ShapeForms";

const LILAC = new THREE.Color("#bcaeff");
const PALE = new THREE.Color("#ece6ff");
const BRAND = new THREE.Color("#795df5");

/**
 * Home 2 tiles, drawn like the orb: violet glass body, a glowing light-strand
 * outline around the face and a glowing line icon floating on the front.
 */
function buildGlassTile(icon: string, i: number) {
  const tile = new THREE.Group();
  const glass = glassMaterial();
  // brighter violet glass, in the same purples as the original tiles
  glass.uniforms.uDeep.value = new THREE.Color("#3a22b0");
  glass.uniforms.uBrand.value = new THREE.Color("#8b72fa");
  // solid enough to read clearly on the light background
  glass.uniforms.uMinAlpha.value = 0.9;
  const body = new THREE.Mesh(new RoundedBoxGeometry(1, 1, 0.16, 3, 0.1), glass);
  body.renderOrder = 1;

  const glyph = new THREE.Mesh(
    new THREE.PlaneGeometry(0.78, 0.78),
    new THREE.MeshBasicMaterial({ map: createGlyphTexture(icon), transparent: true, depthWrite: false }),
  );
  glyph.position.z = 0.09;
  glyph.renderOrder = 4;

  const edge = roundedRect(0.9, 0.9, 0.12, 0.086).map(([x, y, z]) => new THREE.Vector3(x, y, z));
  const curve = new THREE.CatmullRomCurve3(edge, true, "centripetal");
  const speed = 0.14 * (i % 2 ? -1 : 1);
  const line = strandMaterial({ a: PALE, b: BRAND, speed, offset: i * 0.21 });
  const sheath = strandMaterial({ a: LILAC, b: BRAND, speed, offset: i * 0.21, glow: 1 });
  const lineMesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 160, 0.026, 6, true), line);
  const sheathMesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 100, 0.1, 8, true), sheath);
  lineMesh.renderOrder = 3;
  sheathMesh.renderOrder = 2;

  tile.add(body, sheathMesh, lineMesh, glyph);
  const parts = [body, sheathMesh, lineMesh, glyph].map((m) => ({ m, order: m.renderOrder }));
  return { tile, glass, strands: [line, sheath], parts };
}

const TILES = [
  { r: 3.1, y: 1.4, a: 0.2, s: 0.95 },
  { r: 2.6, y: -0.6, a: 1.3, s: 0.8 },
  { r: 3.4, y: 0.4, a: 2.3, s: 1.05 },
  { r: 2.8, y: 1.9, a: 3.4, s: 0.75 },
  { r: 3.3, y: -0.2, a: 4.4, s: 0.9 },
  { r: 2.7, y: 0.9, a: 5.4, s: 0.85 },
];

/** Red icon tiles orbiting the white mark (why MoogleLabs act). */
export function IconTiles({ variant = "logo" }: { variant?: MarkVariant }) {
  const glassy = variant === "orb";
  const group = useRef<THREE.Group>(null);
  const tiles = useRef<(THREE.Object3D | null)[]>([]);
  const vis = useRef(0);
  const lastGroup = useRef(scene.group);

  const { geometry, materials, glassTiles } = useMemo(() => {
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
    const glassTiles = glassy ? TILES.map((_, i) => buildGlassTile(TILE_ICONS[i % TILE_ICONS.length], i)) : [];
    return { geometry, materials, glassTiles };
  }, [glassy]);

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
    for (const g of glassTiles) {
      g.glass.uniforms.uVis.value = v;
      g.glass.uniforms.uTime.value = t;
      for (const m of g.strands) {
        m.uniforms.uTime.value = t;
        m.uniforms.uOpacity.value = v;
      }
    }
    // Orbit tightly around the white logo so the tiles stay clear of the copy.
    g.position.set(mobile ? 0 : WHY_POS.x, mobile ? whyMobileY() - 0.3 : WHY_POS.y - 0.4, 0);

    TILES.forEach((tile, i) => {
      const mesh = tiles.current[i];
      if (!mesh) return;
      const angle = tile.a + t * 0.12 + p * 1.6;
      const r = tile.r * (mobile ? 0.5 : 0.62) * (0.6 + 0.4 * v);
      mesh.position.set(Math.cos(angle) * r, (tile.y - 0.4) * 0.7 + Math.sin(t * 0.8 + i) * 0.1, Math.sin(angle) * r);
      if (glassy) {
        // Home 2: tiles keep their icon facing the viewer, with a gentle sway.
        mesh.rotation.set(Math.sin(t * 0.5 + i) * 0.18, Math.sin(t * 0.3 + i) * 0.4 + Math.cos(angle) * -0.35, 0.06);
        // Tiles behind the orb are drawn before it, so the orb covers them.
        const behind = mesh.position.z < 0;
        for (const p of glassTiles[i].parts) p.m.renderOrder = behind ? p.order - 10 : p.order + 10;
      } else {
        mesh.rotation.set(Math.sin(t * 0.5 + i) * 0.25, -angle + Math.PI / 2 + Math.sin(t * 0.3 + i) * 0.3, 0.1);
      }
      mesh.scale.setScalar(tile.s * v * (mobile ? 0.5 : 0.62));
    });
  });

  return (
    <group ref={group} visible={false}>
      {glassy
        ? glassTiles.map((g, i) => (
            <primitive
              key={i}
              object={g.tile}
              ref={(el: THREE.Object3D | null) => {
                tiles.current[i] = el;
              }}
            />
          ))
        : TILES.map((_, i) => (
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
