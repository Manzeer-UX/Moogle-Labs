"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CAPS_BEATS, scene } from "@/lib/scene";
import { lerp, range, smooth } from "@/lib/math";
import { capsIn, capsSwing } from "./poses";
import { buildShapeForms, setFormVisibility } from "./ShapeForms";

/**
 * Particle swarm that lives on the orb's surface and, in the capabilities
 * act, flies apart and re-forms into a shape for each category:
 *   01 Build & Scale AI            → AI robot head
 *   02 Data Engineering & Cloud    → stacked database
 *   03 Trust, Quality & Verification → shield with a check mark
 *   04 Decentralized Architecture  → network of linked nodes
 */

const COUNT = 5200;

type Vec = [number, number, number];
type Sampler = () => Vec;

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
const rand = rng(1337);
const r = (a: number, b: number) => a + rand() * (b - a);

/** Fill `count` points from weighted samplers, in a shuffled order. */
function build(parts: [number, Sampler][]) {
  const total = parts.reduce((s, [w]) => s + w, 0);
  const pts: Vec[] = [];
  parts.forEach(([w, f], i) => {
    const n = i === parts.length - 1 ? COUNT - pts.length : Math.round((w / total) * COUNT);
    for (let k = 0; k < n; k++) pts.push(f());
  });
  for (let i = pts.length - 1; i > 0; i--) {
    const j = (rand() * (i + 1)) | 0;
    [pts[i], pts[j]] = [pts[j], pts[i]];
  }
  const out = new Float32Array(COUNT * 3);
  pts.forEach((p, i) => out.set(p, i * 3));
  return out;
}

/* ---------------- primitive samplers ---------------- */

const onLine = (a: Vec, b: Vec, j = 0.012): Sampler => () => {
  const t = rand();
  return [a[0] + (b[0] - a[0]) * t + r(-j, j), a[1] + (b[1] - a[1]) * t + r(-j, j), a[2] + (b[2] - a[2]) * t + r(-j, j)];
};
const polyline = (pts: Vec[], j?: number): Sampler => {
  const segs = pts.slice(1).map((p, i) => ({ f: onLine(pts[i], p, j), len: Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1], p[2] - pts[i][2]) }));
  const total = segs.reduce((s, x) => s + x.len, 0);
  return () => {
    let v = rand() * total;
    for (const s of segs) {
      if ((v -= s.len) <= 0) return s.f();
    }
    return segs[segs.length - 1].f();
  };
};
const disc = (c: Vec, rad: number, axis: "x" | "z" = "z"): Sampler => () => {
  const a = rand() * Math.PI * 2;
  const d = Math.sqrt(rand()) * rad;
  return axis === "z" ? [c[0] + Math.cos(a) * d, c[1] + Math.sin(a) * d, c[2]] : [c[0], c[1] + Math.sin(a) * d, c[2] + Math.cos(a) * d];
};
const ring = (c: Vec, rx: number, ry: number, plane: "xy" | "xz" | "yz", j = 0.015): Sampler => () => {
  const a = rand() * Math.PI * 2;
  const u = Math.cos(a) * rx + r(-j, j);
  const v = Math.sin(a) * ry + r(-j, j);
  if (plane === "xy") return [c[0] + u, c[1] + v, c[2]];
  if (plane === "xz") return [c[0] + u, c[1], c[2] + v];
  return [c[0], c[1] + u, c[2] + v];
};
const ball = (c: Vec, rad: number): Sampler => () => {
  const v = new THREE.Vector3(r(-1, 1), r(-1, 1), r(-1, 1)).normalize().multiplyScalar(rad);
  return [c[0] + v.x, c[1] + v.y, c[2] + v.z];
};
/** Surface of a rounded box (rounded in x/y, flat front and back). */
const roundedBox = (w: number, h: number, d: number, rad: number): Sampler => () => {
  const hw = w / 2 - rad;
  const hh = h / 2 - rad;
  const per = 4 * (hw + hh) + 2 * Math.PI * rad;
  const faces = rand();
  // 60% on the outline at random depth, 40% on front/back faces
  if (faces < 0.6) {
    let s = rand() * per;
    let x = 0;
    let y = 0;
    const edges: [number, () => void][] = [
      [2 * hw, () => ((x = -hw + s), (y = h / 2))],
      [(Math.PI * rad) / 2, () => { const a = s / rad; x = hw + Math.sin(a) * rad; y = hh + Math.cos(a) * rad; }],
      [2 * hh, () => ((x = w / 2), (y = hh - s))],
      [(Math.PI * rad) / 2, () => { const a = s / rad; x = hw + Math.cos(a) * rad; y = -hh - Math.sin(a) * rad; }],
      [2 * hw, () => ((x = hw - s), (y = -h / 2))],
      [(Math.PI * rad) / 2, () => { const a = s / rad; x = -hw - Math.sin(a) * rad; y = -hh - Math.cos(a) * rad; }],
      [2 * hh, () => ((x = -w / 2), (y = -hh + s))],
      [(Math.PI * rad) / 2, () => { const a = s / rad; x = -hw - Math.cos(a) * rad; y = hh + Math.sin(a) * rad; }],
    ];
    for (const [len, set] of edges) {
      if (s <= len) {
        set();
        break;
      }
      s -= len;
    }
    const z = rand() < 0.7 ? (rand() < 0.5 ? -d / 2 : d / 2) : r(-d / 2, d / 2);
    return [x, y, z];
  }
  let x = r(-w / 2, w / 2);
  let y = r(-h / 2, h / 2);
  const cx = Math.max(Math.abs(x) - hw, 0);
  const cy = Math.max(Math.abs(y) - hh, 0);
  if (cx * cx + cy * cy > rad * rad) {
    x *= 0.9;
    y *= 0.9;
  }
  return [x, y, rand() < 0.5 ? d / 2 : -d / 2];
};

/* ---------------- category shapes ---------------- */

function robotHead() {
  const z = 0.62;
  const bars = [-0.36, -0.18, 0, 0.18, 0.36].map((x) => onLine([x, -0.42, z + 0.02], [x, -0.6, z + 0.02], 0.01));
  return build([
    [34, roundedBox(2.3, 1.85, 1.24, 0.42)],
    [10, polyline([[-0.82, 0.48, z], [0.82, 0.48, z], [0.82, -0.78, z], [-0.82, -0.78, z], [-0.82, 0.48, z]], 0.01)],
    [8, disc([-0.42, 0.04, z + 0.03], 0.2)],
    [8, disc([0.42, 0.04, z + 0.03], 0.2)],
    [4, ring([-0.42, 0.04, z + 0.03], 0.3, 0.3, "xy")],
    [4, ring([0.42, 0.04, z + 0.03], 0.3, 0.3, "xy")],
    ...bars.map((b) => [1.4, b] as [number, Sampler]),
    [4, onLine([0, 0.93, 0], [0, 1.42, 0], 0.012)],
    [4, ball([0, 1.52, 0], 0.13)],
    [6, ring([-1.22, -0.05, 0], 0.32, 0.32, "yz")],
    [6, ring([1.22, -0.05, 0], 0.32, 0.32, "yz")],
    [3, disc([-1.24, -0.05, 0], 0.18, "x")],
    [3, disc([1.24, -0.05, 0], 0.18, "x")],
  ]);
}

function database() {
  const R = 1.05;
  const depth = 0.75; // ellipse depth of each disc
  const levels = [1.0, 0.33, -0.33, -1.0];
  const side: Sampler = () => {
    const a = rand() * Math.PI * 2;
    return [Math.cos(a) * R, r(-1, 1), Math.sin(a) * depth];
  };
  const lid: Sampler = () => {
    const a = rand() * Math.PI * 2;
    const d = Math.sqrt(rand()) * R;
    return [Math.cos(a) * d, 1.0, Math.sin(a) * (d / R) * depth];
  };
  return build([
    ...levels.map((y) => [12, ring([0, y, 0], R, depth, "xz", 0.012)] as [number, Sampler]),
    [14, side],
    [10, lid],
  ]);
}

function shield() {
  const outline: Vec[] = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    // right half: top edge curve → side → point
    const x = t < 0.3 ? (t / 0.3) * 1.25 : 1.25 * Math.cos(((t - 0.3) / 0.7) * (Math.PI / 2)) ** 0.8;
    const y = t < 0.3 ? 1.25 - Math.sin((t / 0.3) * Math.PI) * 0.12 + (t / 0.3) * 0.0 : 1.25 - ((t - 0.3) / 0.7) ** 1.25 * 2.85;
    outline.push([x, y, 0]);
  }
  const full: Vec[] = [...outline.slice().reverse().map(([x, y]) => [-x, y, 0] as Vec), ...outline.slice(1)];
  const front = full.map(([x, y]) => [x, y, 0.16] as Vec);
  const back = full.map(([x, y]) => [x * 0.98, y, -0.16] as Vec);
  const inner = full.map(([x, y]) => [x * 0.78, y * 0.82 + 0.1, 0.2] as Vec);
  const inside = (x: number, y: number) => {
    let c = false;
    for (let i = 0, j = full.length - 1; i < full.length; j = i++) {
      const [xi, yi] = full[i];
      const [xj, yj] = full[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
    }
    return c;
  };
  const face: Sampler = () => {
    for (;;) {
      const x = r(-1.25, 1.25);
      const y = r(-1.6, 1.25);
      if (inside(x, y)) return [x, y, 0.16];
    }
  };
  const check = polyline([[-0.55, -0.05, 0.26], [-0.12, -0.5, 0.26], [0.62, 0.42, 0.26]], 0.035);
  return build([
    [26, polyline(front, 0.012)],
    [12, polyline(back, 0.012)],
    [10, polyline(inner, 0.01)],
    [16, face],
    [24, check],
  ]);
}

function network() {
  const nodes: Vec[] = [
    [0, 0, 0.2],
    [-1.15, 0.85, -0.2],
    [1.2, 0.95, 0.1],
    [1.3, -0.7, -0.3],
    [-1.25, -0.8, 0.25],
    [0.05, 1.35, -0.5],
    [0.1, -1.35, 0.1],
  ];
  const links: [number, number][] = [
    [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [1, 5], [5, 2], [2, 3], [3, 6], [6, 4], [4, 1],
  ];
  const cube = (c: Vec, s: number): Sampler => {
    const h = s / 2;
    const v = (x: number, y: number, z: number): Vec => [c[0] + x * h, c[1] + y * h, c[2] + z * h];
    const edges: [Vec, Vec][] = [];
    for (const a of [-1, 1]) for (const b of [-1, 1]) {
      edges.push([v(-1, a, b), v(1, a, b)], [v(a, -1, b), v(a, 1, b)], [v(a, b, -1), v(a, b, 1)]);
    }
    const fs = edges.map(([p, q]) => onLine(p, q, 0.008));
    return () => fs[(rand() * fs.length) | 0]();
  };
  return build([
    ...nodes.map((n, i) => [i === 0 ? 10 : 6, cube(n, i === 0 ? 0.62 : 0.4)] as [number, Sampler]),
    ...nodes.map((n, i) => [2, ball(n, i === 0 ? 0.12 : 0.08)] as [number, Sampler]),
    ...links.map(([a, b]) => [3.2, onLine(nodes[a], nodes[b], 0.01)] as [number, Sampler]),
  ]);
}

function sphere(radius: number) {
  return build([[1, ball([0, 0, 0], radius)]]);
}

/* ---------------- shaders ---------------- */

const vertex = /* glsl */ `
  attribute vec3 aT0;
  attribute vec3 aT1;
  attribute vec3 aT2;
  attribute vec3 aT3;
  attribute float aRand;
  attribute float aSize;
  uniform float uH;
  uniform vec3 uK;
  uniform float uTime;
  uniform float uPx;
  uniform float uSettle;
  varying float vAlpha;
  varying float vRand;

  // each particle starts its trip a little later than the previous ones
  float stag(float v, float r) { return smoothstep(r * 0.35, r * 0.35 + 0.65, v); }
  float transit(float k) { return 4.0 * k * (1.0 - k); }

  void main() {
    float k0 = stag(uK.x, aRand);
    float k1 = stag(uK.y, aRand);
    float k2 = stag(uK.z, aRand);
    float h = stag(uH, aRand);
    vec3 t = mix(aT0, aT1, k0);
    t = mix(t, aT2, k1);
    t = mix(t, aT3, k2);
    vec3 p = mix(position, t, h);

    // while in flight, particles swirl outward a little
    float fly = transit(k0) + transit(k1) + transit(k2) + transit(h);
    float a = aRand * 40.0 + uTime * 0.8;
    p += vec3(cos(a), sin(a * 1.3), sin(a)) * fly * 0.38;
    // idle shimmer
    p += 0.012 * vec3(sin(uTime * 1.3 + aRand * 40.0), cos(uTime * 1.1 + aRand * 30.0), sin(uTime * 0.9 + aRand * 50.0));

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = aSize * uPx / -mv.z;
    gl_Position = projectionMatrix * mv;
    // particles only carry the transition; once a solid form has settled they
    // are gone, so the shape stays crisp
    vAlpha = smoothstep(0.0, 0.25, uH) * (1.0 - uSettle);
    vRand = aRand;
  }
`;

const fragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uDeep;
  uniform vec3 uBrand;
  uniform vec3 uLilac;
  varying float vAlpha;
  varying float vRand;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.3, d);
    // deep violet rim (reads on light backgrounds) around a hot white-lilac
    // centre (glows on dark ones)
    vec3 rim = mix(uDeep, uBrand, vRand);
    vec3 hot = mix(uLilac, vec3(1.0), 0.6);
    vec3 col = mix(rim, hot, smoothstep(0.34, 0.12, d));
    float tw = 0.85 + 0.15 * sin(uTime * 3.0 + vRand * 60.0);
    float alpha = a * vAlpha * tw;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(col, alpha);
  }
`;

/** 0 → orb, 1 → category shapes. Desktop capabilities act only. */
export function morphAmount(desktop: boolean) {
  return scene.group === "A" && desktop ? capsIn() : 0;
}

const _parent = new THREE.Quaternion();
const _target = new THREE.Quaternion();
const _euler = new THREE.Euler();
const IDENTITY = new THREE.Quaternion();

export function OrbMorph({ radius }: { radius: number }) {
  const ref = useRef<THREE.Group>(null);
  const forms = useMemo(() => buildShapeForms(), []);
  const { geometry, material } = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(sphere(radius), 3));
    const grow = (a: Float32Array, k: number) => a.map((v) => v * k);
    g.setAttribute("aT0", new THREE.BufferAttribute(grow(robotHead(), 1.15), 3));
    g.setAttribute("aT1", new THREE.BufferAttribute(grow(database(), 1.15), 3));
    g.setAttribute("aT2", new THREE.BufferAttribute(grow(shield(), 1.15), 3));
    g.setAttribute("aT3", new THREE.BufferAttribute(grow(network(), 1.2), 3));
    const rnd = new Float32Array(COUNT);
    const size = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      rnd[i] = rand();
      size[i] = r(0.55, 1.45);
    }
    g.setAttribute("aRand", new THREE.BufferAttribute(rnd, 1));
    g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), radius * 2.5);

    const m = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uH: { value: 0 },
        uK: { value: new THREE.Vector3() },
        uTime: { value: 0 },
        uPx: { value: 40 },
        uSettle: { value: 0 },
        uDeep: { value: new THREE.Color("#3f24c4") },
        uBrand: { value: new THREE.Color("#795df5") },
        uLilac: { value: new THREE.Color("#d9d0ff") },
      },
    });
    return { geometry: g, material: m };
  }, [radius]);

  useFrame((frame) => {
    const u = material.uniforms;
    const h = morphAmount(frame.size.width >= 1024);
    u.uH.value = h;
    u.uTime.value = frame.clock.elapsedTime;
    u.uPx.value = 58 * frame.gl.getPixelRatio();
    // hand-over progress between consecutive category panels
    const T = scene.a.t;
    const k = (i: number) => smooth(range(CAPS_BEATS[i][2], CAPS_BEATS[i + 1][1], T));
    const k0 = k(0);
    const k1 = k(1);
    const k2 = k(2);
    (u.uK.value as THREE.Vector3).set(k0, k1, k2);

    // How "settled" each category shape is; the solid form appears only once
    // the swarm has (almost) arrived, and draws itself on.
    const w = [h * (1 - k0), h * k0 * (1 - k1), h * k1 * (1 - k2), h * k2];
    let settle = 0;
    forms.forEach((form, i) => {
      const v = smooth(range(0.7, 0.97, w[i]));
      settle = Math.max(settle, v);
      setFormVisibility(form, v, frame.clock.elapsedTime);
    });
    u.uSettle.value = settle;

    // The orb leans toward its panel; the shapes should face the viewer
    // instead (with a slight turn toward the panel) but keep the full spin
    // at every hand-over. Counter-rotate against the parent, blended in by h.
    const pts = ref.current;
    if (pts?.parent) {
      const { side, turns } = capsSwing(T);
      pts.parent.getWorldQuaternion(_parent).invert();
      _target.setFromEuler(_euler.set(0.08, lerp(0.28, -0.28, side) + turns * Math.PI * 2, 0));
      pts.quaternion.copy(IDENTITY).slerp(_parent.multiply(_target), h);
    }
  });

  return (
    <group ref={ref}>
      <points geometry={geometry} material={material} renderOrder={4} frustumCulled={false} />
      {forms.map((form, i) => (
        <primitive key={i} object={form.group} />
      ))}
    </group>
  );
}
