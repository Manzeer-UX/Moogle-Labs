"use client";

import { useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { scene } from "@/lib/scene";
import { damp } from "@/lib/math";
import { createRandom } from "@/lib/random";

const vertex = /* glsl */ `
  attribute float aSize;
  attribute float aSeed;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uPixelRatio;
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    vec3 p = position;
    p.y += sin(uTime * 0.25 + aSeed * 6.2831) * 0.25;
    p.x += cos(uTime * 0.18 + aSeed * 3.17) * 0.18;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio * (34.0 / -mv.z);
    vColor = aColor;
    vTwinkle = 0.55 + 0.45 * sin(uTime * 1.3 + aSeed * 40.0);
  }
`;

const fragment = /* glsl */ `
  uniform float uOpacity;
  uniform vec3 uTint;
  uniform float uTintMix;
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.12, d) * uOpacity * vTwinkle;
    if (a < 0.01) discard;
    gl_FragColor = vec4(mix(vColor, uTint, uTintMix), a);
  }
`;

/** Floating bokeh dots (white and lilac) around the scene. */
export function Particles() {
  const mobile = useThree((s) => s.size.width < 1024);
  const count = mobile ? 140 : 280;

  const { geometry, material } = useMemo(() => {
    const random = createRandom(7);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const seeds = new Float32Array(count);
    const white = new THREE.Color("#ffffff");
    const lilac = new THREE.Color("#b9a6ff");
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (random() - 0.5) * 22;
      positions[i * 3 + 1] = (random() - 0.5) * 12;
      positions[i * 3 + 2] = -7 + random() * 9;
      const c = random() > 0.55 ? lilac : white;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
      sizes[i] = 1.5 + random() * (random() > 0.9 ? 9 : 4);
      seeds[i] = random();
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    // Built by hand: R3F copies <shaderMaterial uniforms>, detaching per-frame updates.
    const material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: 1 },
        uOpacity: { value: 0 },
        uTint: { value: new THREE.Color("#9b93c2") },
        uTintMix: { value: 0 },
      },
    });
    return { geometry, material };
  }, [count]);

  useFrame((frame, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const uniforms = material.uniforms;
    uniforms.uTime.value += dt;
    uniforms.uPixelRatio.value = frame.viewport.dpr;
    const g = scene.group;
    const target = g === "A" ? 1 : g === "B" ? 0.55 : g === "C" ? 0.7 : 0;
    uniforms.uOpacity.value = damp(uniforms.uOpacity.value, target, 3, dt);
    uniforms.uTintMix.value = damp(uniforms.uTintMix.value, g === "B" ? 1 : 0, 6, dt);
  });

  return (
    <points geometry={geometry} material={material} renderOrder={3} />
  );
}
