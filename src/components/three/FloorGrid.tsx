"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scene } from "@/lib/scene";
import { damp } from "@/lib/math";
import { WHY_POS, capsIn, whyIn } from "./poses";

const vertex = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorld = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uCell;
  uniform float uFade;
  uniform vec2 uCenter;
  varying vec3 vWorld;

  float grid(vec2 coord, float size, float width) {
    vec2 c = coord / size;
    vec2 g = abs(fract(c - 0.5) - 0.5) / fwidth(c);
    float l = min(g.x, g.y);
    return 1.0 - min(l / width, 1.0);
  }

  void main() {
    float minor = grid(vWorld.xz, uCell, 1.0);
    float major = grid(vWorld.xz, uCell * 4.0, 1.25);
    float d = length(vWorld.xz - uCenter);
    float fade = 1.0 - smoothstep(uFade * 0.2, uFade, d);
    float a = max(minor * 0.45, major) * fade * uOpacity;
    if (a < 0.004) discard;
    gl_FragColor = vec4(uColor, a);
  }
`;

/** Perspective blueprint floor under the mark. */
export function FloorGrid() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uColor: { value: new THREE.Color("#ffffff") },
          uOpacity: { value: 0 },
          uCell: { value: 0.75 },
          uFade: { value: 16 },
          uCenter: { value: new THREE.Vector2(0, 0) },
        },
      }),
    [],
  );
  const uniforms = material.uniforms;
  const lastGroup = useRef(scene.group);

  useFrame((frame, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const g = scene.group;
    const mobile = frame.size.width < 1024;
    let target = 0;
    if (g === "A") {
      target = capsIn() * 0.55;
      // Centred: the icon swings between both sides of the grid.
      uniforms.uCenter.value.set(0, 0);
    } else if (g === "B") {
      target = whyIn() * 0.9;
      uniforms.uCenter.value.set(mobile ? 0 : WHY_POS.x, 0);
    }
    const snap = g !== lastGroup.current;
    lastGroup.current = g;
    uniforms.uOpacity.value = snap ? target : damp(uniforms.uOpacity.value, target, 5, dt);
  });

  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -2.05, 0]} renderOrder={1} material={material}>
      <planeGeometry args={[80, 80]} />
    </mesh>
  );
}
