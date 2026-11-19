"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scene } from "@/lib/scene";
import { damp } from "@/lib/math";
import { capsIn } from "./poses";

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.999, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uRes;
  uniform float uShift;
  uniform float uLight;
  uniform float uCta;
  uniform float uCtaShift;
  uniform vec2 uMouse;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  // MoogleLabs purple ramp: deep ink → violet → brand purple → lavender → white
  vec3 ramp(float t) {
    vec3 c0 = vec3(0.043, 0.027, 0.125);
    vec3 c1 = vec3(0.106, 0.067, 0.251);
    vec3 c2 = vec3(0.227, 0.145, 0.588);
    vec3 c3 = vec3(0.416, 0.306, 0.902);
    vec3 c4 = vec3(0.663, 0.588, 0.969);
    vec3 c5 = vec3(0.902, 0.878, 0.984);
    vec3 c6 = vec3(0.957, 0.953, 0.976);
    t = clamp(t, 0.0, 1.0);
    vec3 col = c0;
    col = mix(col, c1, smoothstep(0.00, 0.16, t));
    col = mix(col, c2, smoothstep(0.16, 0.36, t));
    col = mix(col, c3, smoothstep(0.36, 0.50, t));
    col = mix(col, c4, smoothstep(0.50, 0.60, t));
    col = mix(col, c5, smoothstep(0.60, 0.72, t));
    col = mix(col, c6, smoothstep(0.72, 0.95, t));
    return col;
  }

  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

  void main() {
    vec2 uv = vUv;
    float aspect = uRes.x / max(uRes.y, 1.0);
    vec2 p = vec2(uv.x * aspect, uv.y);
    float t = uTime * 0.05;

    float n1 = snoise(vec3(p * 0.8, t));
    float n2 = snoise(vec3(p * 2.2 + 7.0, t * 1.7));

    // Portrait screens: run the ramp diagonally so text at the bottom stays on the dark side.
    float portrait = smoothstep(1.05, 0.7, aspect);
    float axis = mix(uv.x + (uv.y - 0.5) * 0.18, uv.x * 0.45 + uv.y * 0.8 - 0.1, portrait);
    float td = axis * 1.04 - 0.02 + n1 * 0.12 + n2 * 0.035 - uShift + uMouse.x * 0.025;
    vec3 dark = ramp(td);

    float d = length((uv - vec2(0.55, 0.62)) * vec2(aspect, 1.0));
    vec3 light = mix(vec3(0.953, 0.949, 0.976), vec3(0.855, 0.843, 0.906), smoothstep(0.15, 1.35, d));
    light += vec3(0.006, 0.0, 0.014) * n1;

    // CTA: deep purple at the top (behind the copy), a lavender wave rising
    // from the bottom that hands over to the light FAQ section below.
    float wave = sin(uv.x * 3.1 + uTime * 0.22) * 0.07 + sin(uv.x * 7.0 - uTime * 0.35) * 0.02;
    float tc = uv.y * 0.9 + wave + n1 * 0.1 + uCtaShift;
    vec3 cta = ramp(1.0 - tc);

    vec3 col = mix(dark, light, uLight);
    col = mix(col, cta, uCta);

    float g = hash(uv * uRes + fract(uTime * 7.0) * 113.0) - 0.5;
    col += g * mix(0.06, 0.035, uLight);

    gl_FragColor = vec4(col, 1.0);
  }
`;

export function Background() {
  const lastGroup = useRef(scene.group);

  // Built by hand (not via <shaderMaterial uniforms>) because R3F copies
  // uniform objects, which would detach the values we animate per frame.
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        depthWrite: false,
        depthTest: false,
        uniforms: {
          uTime: { value: 0 },
          uRes: { value: new THREE.Vector2(1, 1) },
          uShift: { value: 0 },
          uLight: { value: 0 },
          uCta: { value: 0 },
          uCtaShift: { value: 0 },
          uMouse: { value: new THREE.Vector2() },
        },
      }),
    [],
  );

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const u = material.uniforms;
    u.uTime.value += dt;
    u.uRes.value.set(state.size.width, state.size.height);
    u.uMouse.value.x = damp(u.uMouse.value.x, scene.pointer.x, 2, dt);

    const g = scene.group;
    const targetLight = g === "B" ? 1 : 0;
    const targetCta = g === "C" ? 1 : 0;
    const targetShift = g === "A" ? capsIn() * 0.1 : 0;
    const targetCtaShift = g === "C" ? 0.38 - scene.c.p * 0.32 : 0;

    if (g !== lastGroup.current) {
      // groups only change while an opaque section covers the canvas → snap
      u.uLight.value = targetLight;
      u.uCta.value = targetCta;
      lastGroup.current = g;
    }
    u.uLight.value = damp(u.uLight.value, targetLight, 4, dt);
    u.uCta.value = damp(u.uCta.value, targetCta, 4, dt);
    u.uShift.value = damp(u.uShift.value, targetShift, 4, dt);
    u.uCtaShift.value = damp(u.uCtaShift.value, targetCtaShift, 4, dt);
  });

  return (
    <mesh frustumCulled={false} renderOrder={-10} material={material}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}
