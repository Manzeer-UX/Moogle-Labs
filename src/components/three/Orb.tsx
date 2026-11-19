"use client";

import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scene } from "@/lib/scene";
import { capsIn } from "./poses";
import { OrbMorph, morphAmount } from "./OrbMorph";

/**
 * Futuristic energy orb used by Home 2 in place of the logo mark: a
 * translucent plasma core, a rim halo, flowing light strands wrapped around
 * the sphere, a dashed HUD ring and signal wires leaving it on both sides.
 */

export const ORB_RADIUS = 1.42;

/** Node directions on the orb (same order as the capability categories). */
export const ORB_NODES = [
  new THREE.Vector3(-0.58, 0.46, 0),
  new THREE.Vector3(0.5, 0.55, 0),
  new THREE.Vector3(0.7, -0.08, 0),
  new THREE.Vector3(-0.52, -0.5, 0),
].map((v) => {
  v.z = Math.sqrt(Math.max(0, 1 - v.x * v.x - v.y * v.y));
  return v.normalize();
});

/* MoogleLabs palette (see globals.css) */
const VIOLET = new THREE.Color("#795df5"); // brand
const LILAC = new THREE.Color("#bcaeff"); // lilac highlight
const DEEP_BRAND = new THREE.Color("#6243e6"); // brand-deep
const DEEP = new THREE.Color("#170e3a"); // between ink and ink-deep
/* White variant (why act): strands go white with a soft violet edge. */
const WHITE_A = new THREE.Color("#ffffff");
const WHITE_B = new THREE.Color("#b3a2ff");
const HALO = new THREE.Color("#8b70f7");
const HALO_WHITE = new THREE.Color("#e4dcff");

/* ------------------------------------------------------------------ */
/* Shaders                                                              */
/* ------------------------------------------------------------------ */

const sphereVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vObj;
  void main() {
    vObj = position;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = normalize(-mv.xyz);
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mv;
  }
`;

const coreFragment = /* glsl */ `
  uniform float uTime;
  uniform float uWhite;
  uniform float uFade;
  uniform vec3 uDeep;
  uniform vec3 uDeepBrand;
  uniform vec3 uLilac;
  uniform vec3 uViolet;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vObj;

  float band(vec3 p, float f, float t) {
    float v = sin(p.y * f + sin(p.x * 2.3 + t) * 2.2 + sin(p.z * 1.7 - t * 0.7) * 1.6 + t);
    return pow(1.0 - abs(v), 18.0);
  }

  void main() {
    float fres = 1.0 - max(dot(normalize(vNormal), normalize(vView)), 0.0);
    vec3 p = vObj / ${ORB_RADIUS.toFixed(2)};
    float t = uTime * 0.6;
    // swirling plasma filaments inside the sphere
    float lines = band(p, 5.0, t) + band(p.zxy, 6.5, -t * 1.2) * 0.8 + band(p.yzx, 4.0, t * 0.8) * 0.6;
    vec3 col = uDeep;
    col = mix(col, uDeepBrand, pow(fres, 1.4) * 0.9);
    col += uLilac * pow(fres, 3.5) * 1.3;
    col += mix(uViolet, uLilac, 0.5 + 0.5 * p.y) * lines * 0.55 * (1.0 - fres * 0.6);
    // soft hot spot, offset like a light source
    col += uViolet * pow(max(dot(normalize(vNormal), normalize(vec3(-0.35, 0.4, 1.0))), 0.0), 6.0) * 0.35;
    // Why act: a pearl-white orb with a soft lavender rim and faint filaments
    vec3 pearl = mix(vec3(0.975, 0.97, 1.0), uViolet * 0.75 + vec3(0.2), pow(fres, 1.7) * 0.6);
    pearl = mix(pearl, uLilac, lines * 0.3);
    col = mix(col, pearl, uWhite);
    float alpha = mix(0.72 + 0.28 * fres, 0.92, uWhite) * uFade;
    gl_FragColor = vec4(col, alpha);
  }
`;

const haloFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uStrength;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vObj;
  void main() {
    float i = pow(clamp(0.62 + dot(normalize(vNormal), normalize(vView)), 0.0, 2.0), 4.0);
    gl_FragColor = vec4(uColor, clamp(i * 0.32 * uStrength, 0.0, 0.85));
  }
`;

const strandVertex = /* glsl */ `
  varying vec2 vUv;
  varying float vFacing;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec3 n = normalize(normalMatrix * normal);
    vFacing = abs(dot(n, normalize(-mv.xyz)));
    gl_Position = projectionMatrix * mv;
  }
`;

const strandFragment = /* glsl */ `
  uniform float uTime;
  uniform float uSpeed;
  uniform float uOffset;
  uniform float uOpacity;
  uniform float uGlow;
  uniform float uFade;
  uniform float uDash;
  uniform float uDraw;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying vec2 vUv;
  varying float vFacing;
  void main() {
    float u = vUv.x;
    float flow = fract(u * 2.0 - uTime * uSpeed + uOffset);
    float pulse = smoothstep(0.0, 0.08, flow) * (1.0 - smoothstep(0.08, 0.42, flow));
    vec3 col = mix(uColorA, uColorB, 0.5 + 0.5 * sin(u * 12.566 + uOffset * 6.0));
    col += vec3(0.93, 0.9, 1.0) * pulse * 0.9;
    // bright centre line, soft edges: reads as a glowing filament
    float core = mix(1.0, pow(vFacing, 1.5), uGlow);
    float alpha = (0.5 + 0.5 * pulse) * core * uOpacity;
    alpha *= mix(1.0, 0.16, uGlow);
    // wires fade out along their length
    alpha *= mix(1.0, pow(1.0 - u, 1.6) * smoothstep(0.0, 0.04, u), uFade);
    // dashed HUD ring
    alpha *= mix(1.0, step(0.45, fract(u * 72.0)), uDash);
    // draw-on: only the first uDraw of the curve is visible
    alpha *= 1.0 - smoothstep(uDraw * 1.06 - 0.06, uDraw * 1.06, u);
    gl_FragColor = vec4(col, alpha);
  }
`;

export function strandMaterial(opts: {
  a: THREE.Color;
  b: THREE.Color;
  speed: number;
  offset: number;
  glow?: number;
  fade?: number;
  dash?: number;
}) {
  return new THREE.ShaderMaterial({
    vertexShader: strandVertex,
    fragmentShader: strandFragment,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uSpeed: { value: opts.speed },
      uOffset: { value: opts.offset },
      uOpacity: { value: 1 },
      uGlow: { value: opts.glow ?? 0 },
      uFade: { value: opts.fade ?? 0 },
      uDash: { value: opts.dash ?? 0 },
      uDraw: { value: 1 },
      uColorA: { value: opts.a.clone() },
      uColorB: { value: opts.b.clone() },
    },
  });
}

/** Deterministic pseudo random, so every visit renders the same orb. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

type Strand = {
  geo: THREE.BufferGeometry;
  glowGeo: THREE.BufferGeometry;
  mat: THREE.ShaderMaterial;
  glowMat: THREE.ShaderMaterial;
  axis: THREE.Vector3;
  spin: number;
};

export function OrbBody({ state }: { state: React.RefObject<{ spread: number; white: number }> }) {
  const parts = useMemo(() => {
    const rand = rng(7);
    const R = ORB_RADIUS;

    const core = new THREE.SphereGeometry(R, 64, 48);
    const coreMat = new THREE.ShaderMaterial({
      vertexShader: sphereVertex,
      fragmentShader: coreFragment,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uWhite: { value: 0 },
        uFade: { value: 1 },
        uDeep: { value: DEEP },
        uDeepBrand: { value: DEEP_BRAND },
        uLilac: { value: LILAC },
        uViolet: { value: VIOLET },
      },
    });
    const haloMat = new THREE.ShaderMaterial({
      vertexShader: sphereVertex,
      fragmentShader: haloFragment,
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
      uniforms: { uColor: { value: HALO.clone() }, uStrength: { value: 1 } },
    });

    // Energy strands: wobbly great circles at random tilts.
    const strands: Strand[] = [];
    for (let i = 0; i < 10; i++) {
      const r = R * (0.97 + rand() * 0.09);
      const wobble = 0.05 + rand() * 0.12;
      const freq = 2 + Math.floor(rand() * 3);
      const phase = rand() * Math.PI * 2;
      const q = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI),
      );
      const pts: THREE.Vector3[] = [];
      for (let k = 0; k < 96; k++) {
        const a = (k / 96) * Math.PI * 2;
        const z = Math.sin(a * freq + phase) * wobble;
        pts.push(new THREE.Vector3(Math.cos(a), Math.sin(a), z).normalize().multiplyScalar(r).applyQuaternion(q));
      }
      const curve = new THREE.CatmullRomCurve3(pts, true);
      const thick = 0.008 + rand() * 0.014;
      const lilacish = rand() > 0.45;
      const a = lilacish ? LILAC : VIOLET;
      const b = lilacish ? VIOLET : DEEP_BRAND;
      const speed = (0.05 + rand() * 0.12) * (rand() > 0.5 ? 1 : -1);
      const offset = rand();
      strands.push({
        geo: new THREE.TubeGeometry(curve, 260, thick, 6, true),
        glowGeo: new THREE.TubeGeometry(curve, 160, thick * 5, 8, true),
        mat: strandMaterial({ a, b, speed, offset }),
        glowMat: strandMaterial({ a, b, speed, offset, glow: 1 }),
        axis: new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize(),
        spin: (0.08 + rand() * 0.18) * (rand() > 0.5 ? 1 : -1),
      });
    }

    // Dashed HUD ring + a thin solid companion ring.
    const hud = new THREE.TorusGeometry(R * 1.28, 0.008, 6, 256);
    const hudMat = strandMaterial({ a: LILAC, b: VIOLET, speed: 0.02, offset: 0, dash: 1 });
    const ring = new THREE.TorusGeometry(R * 1.4, 0.004, 6, 256);
    const ringMat = strandMaterial({ a: VIOLET, b: LILAC, speed: -0.04, offset: 0.3 });

    // Signal wires leaving the orb on both sides (forked, like circuit traces).
    const wires: { geo: THREE.BufferGeometry; glowGeo: THREE.BufferGeometry; mat: THREE.ShaderMaterial; glowMat: THREE.ShaderMaterial }[] = [];
    for (const side of [-1, 1]) {
      for (const fork of [-1, 1]) {
        const x0 = side * R * 0.98;
        const curve = new THREE.CubicBezierCurve3(
          new THREE.Vector3(x0, fork * 0.05, 0),
          new THREE.Vector3(x0 + side * 0.9, fork * 0.05, 0),
          new THREE.Vector3(x0 + side * 1.2, fork * 0.5, 0),
          new THREE.Vector3(x0 + side * 3.6, fork * 0.62, 0),
        );
        const mat = strandMaterial({ a: LILAC, b: DEEP_BRAND, speed: 0.25, offset: fork * 0.25, fade: 1 });
        const glowMat = strandMaterial({ a: LILAC, b: DEEP_BRAND, speed: 0.25, offset: fork * 0.25, fade: 1, glow: 1 });
        wires.push({
          geo: new THREE.TubeGeometry(curve, 120, 0.012, 6, false),
          glowGeo: new THREE.TubeGeometry(curve, 80, 0.06, 8, false),
          mat,
          glowMat,
        });
      }
    }

    // every light-strand material, with its own colours kept as the base
    const tinted = [...strands.flatMap((x) => [x.mat, x.glowMat]), hudMat, ringMat].map((m) => ({
      m,
      a: (m.uniforms.uColorA.value as THREE.Color).clone(),
      b: (m.uniforms.uColorB.value as THREE.Color).clone(),
    }));
    return { core, coreMat, haloMat, strands, hud, hudMat, ring, ringMat, wires, tinted };
  }, []);

  const strandGroups = useMemo(() => parts.strands.map(() => new THREE.Group()), [parts]);
  const hudGroup = useMemo(() => new THREE.Group(), []);
  const wireGroup = useMemo(() => new THREE.Group(), []);

  useFrame((frame) => {
    const t = frame.clock.elapsedTime;
    const st = state.current;
    const spread = st?.spread ?? 0;
    const white = st?.white ?? 0;

    // The orb dissolves into the particle swarm during the capabilities act.
    const fade = 1 - morphAmount(frame.size.width >= 1024);
    parts.coreMat.uniforms.uFade.value = fade;
    parts.coreMat.uniforms.uTime.value = t;
    parts.coreMat.uniforms.uWhite.value = white;
    (parts.haloMat.uniforms.uColor.value as THREE.Color).copy(HALO).lerp(HALO_WHITE, white);
    for (const { m, a, b } of parts.tinted) {
      (m.uniforms.uColorA.value as THREE.Color).copy(a).lerp(WHITE_A, white);
      (m.uniforms.uColorB.value as THREE.Color).copy(b).lerp(WHITE_B, white);
    }
    parts.haloMat.uniforms.uStrength.value = (1 + Math.sin(t * 1.6) * 0.12) * fade;

    const grow = 1 + spread * 0.08;
    parts.strands.forEach((s, i) => {
      s.mat.uniforms.uTime.value = t;
      s.glowMat.uniforms.uTime.value = t;
      s.mat.uniforms.uOpacity.value = fade;
      s.glowMat.uniforms.uOpacity.value = fade;
      const g = strandGroups[i];
      g.visible = fade > 0.01;
      g.quaternion.setFromAxisAngle(s.axis, t * s.spin);
      g.scale.setScalar(grow + Math.sin(t * 0.9 + i) * 0.006);
    });

    parts.hudMat.uniforms.uTime.value = t;
    parts.ringMat.uniforms.uTime.value = t;
    parts.hudMat.uniforms.uOpacity.value = 0.35 + 0.65 * fade;
    parts.ringMat.uniforms.uOpacity.value = 0.35 + 0.65 * fade;
    hudGroup.rotation.set(1.2 + Math.sin(t * 0.3) * 0.08, 0.25, t * 0.15);

    // Wires belong to the hero composition only; they retract as the orb moves on.
    const wireVis = scene.group === "A" && frame.size.width >= 1024 ? 1 - capsIn() : 0;
    wireGroup.visible = wireVis > 0.01;
    wireGroup.scale.set(0.6 + 0.4 * wireVis, 1, 1);
    for (const w of parts.wires) {
      w.mat.uniforms.uTime.value = t;
      w.glowMat.uniforms.uTime.value = t;
      w.mat.uniforms.uOpacity.value = wireVis;
      w.glowMat.uniforms.uOpacity.value = wireVis;
    }
  });

  return (
    <group>
      <mesh geometry={parts.core} material={parts.haloMat} scale={1.5} renderOrder={0} />
      <mesh geometry={parts.core} material={parts.coreMat} renderOrder={1} />
      {parts.strands.map((s, i) => (
        <primitive key={i} object={strandGroups[i]}>
          <mesh geometry={s.glowGeo} material={s.glowMat} renderOrder={2} />
          <mesh geometry={s.geo} material={s.mat} renderOrder={3} />
        </primitive>
      ))}
      <OrbMorph radius={ORB_RADIUS} />
      <primitive object={hudGroup}>
        <mesh geometry={parts.hud} material={parts.hudMat} renderOrder={2} />
        <mesh geometry={parts.ring} material={parts.ringMat} renderOrder={2} />
      </primitive>
      <primitive object={wireGroup}>
        {parts.wires.map((w, i) => (
          <group key={i}>
            <mesh geometry={w.glowGeo} material={w.glowMat} renderOrder={2} />
            <mesh geometry={w.geo} material={w.mat} renderOrder={3} />
          </group>
        ))}
      </primitive>
    </group>
  );
}
