"use client";

import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { strandMaterial } from "./Orb";

/**
 * Solid versions of the capability shapes, drawn the same way as the orb:
 * a translucent "glass" body with a glowing rim, wrapped in glowing light
 * strands that trace the outline. Coordinates match the particle targets in
 * OrbMorph so the swarm settles exactly onto these forms.
 */

const BRAND = new THREE.Color("#795df5");
const LILAC = new THREE.Color("#bcaeff");
const PALE = new THREE.Color("#ece6ff");
const DEEP_BRAND = new THREE.Color("#6243e6");
const DEEP = new THREE.Color("#170e3a");

/* ---------------- glass body shader (same look as the orb core) ---------------- */

const glassVertex = /* glsl */ `
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

const glassFragment = /* glsl */ `
  uniform float uTime;
  uniform float uVis;
  uniform float uMinAlpha;
  uniform vec3 uDeep;
  uniform vec3 uBrand;
  uniform vec3 uLilac;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vObj;
  void main() {
    float fres = 1.0 - abs(dot(normalize(vNormal), normalize(vView)));
    // slow scan line sweeping up the body
    float scan = pow(1.0 - abs(fract(vObj.y * 0.35 - uTime * 0.25) - 0.5) * 2.0, 24.0);
    // violet-tinted glass (never grey on light backgrounds), glowing rim
    vec3 col = mix(uDeep, uBrand, 0.38);
    col = mix(col, uBrand, pow(fres, 1.1) * 0.9);
    col += uLilac * pow(fres, 3.0) * 1.1;
    col += uLilac * scan * 0.45;
    float alpha = max(0.5 + 0.45 * fres + scan * 0.2, uMinAlpha) * uVis;
    gl_FragColor = vec4(col, alpha);
  }
`;

export function glassMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader: glassVertex,
    fragmentShader: glassFragment,
    transparent: true,
    depthWrite: false,
    side: THREE.FrontSide,
    uniforms: {
      uTime: { value: 0 },
      uVis: { value: 0 },
      uMinAlpha: { value: 0 },
      uDeep: { value: DEEP },
      uBrand: { value: DEEP_BRAND },
      uLilac: { value: LILAC },
    },
  });
}

/* ---------------- outline helpers ---------------- */

type P = [number, number, number];

const densify = (pts: P[], step = 0.03) => {
  const out: THREE.Vector3[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = new THREE.Vector3(...pts[i]);
    const b = new THREE.Vector3(...pts[i + 1]);
    const n = Math.max(1, Math.ceil(a.distanceTo(b) / step));
    for (let k = 0; k < n; k++) out.push(a.clone().lerp(b, k / n));
  }
  out.push(new THREE.Vector3(...pts[pts.length - 1]));
  return out;
};

const circle = (c: P, rad: number, plane: "xy" | "xz" | "yz", ry = rad, seg = 64): P[] =>
  Array.from({ length: seg + 1 }, (_, i) => {
    const a = (i / seg) * Math.PI * 2;
    const u = Math.cos(a) * rad;
    const v = Math.sin(a) * ry;
    if (plane === "xy") return [c[0] + u, c[1] + v, c[2]];
    if (plane === "xz") return [c[0] + u, c[1], c[2] + v];
    return [c[0], c[1] + u, c[2] + v];
  });

export function roundedRect(w: number, h: number, r: number, z: number, cy = 0, seg = 10): P[] {
  const hw = w / 2 - r;
  const hh = h / 2 - r;
  const corners: [number, number, number][] = [
    [hw, hh, 0],
    [-hw, hh, Math.PI / 2],
    [-hw, -hh, Math.PI],
    [hw, -hh, (3 * Math.PI) / 2],
  ];
  const pts: P[] = [];
  for (const [cx, cyy, start] of corners) {
    for (let i = 0; i <= seg; i++) {
      const a = start + (i / seg) * (Math.PI / 2);
      pts.push([cx + Math.cos(a) * r, cy + cyy + Math.sin(a) * r, z]);
    }
  }
  pts.push(pts[0]);
  return pts;
}

function roundedRectShape(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const pts = roundedRect(w, h, r, 0);
  s.moveTo(pts[0][0], pts[0][1]);
  pts.slice(1).forEach(([x, y]) => s.lineTo(x, y));
  return s;
}

/** Shield outline in the xy plane (closed). Shared with the particle sampler. */
export function shieldOutline(): P[] {
  const half: P[] = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const x = t < 0.3 ? (t / 0.3) * 1.25 : 1.25 * Math.cos(((t - 0.3) / 0.7) * (Math.PI / 2)) ** 0.8;
    const y = t < 0.3 ? 1.25 - Math.sin((t / 0.3) * Math.PI) * 0.12 : 1.25 - ((t - 0.3) / 0.7) ** 1.25 * 2.85;
    half.push([x, y, 0]);
  }
  return [...half.slice().reverse().map(([x, y]) => [-x, y, 0] as P), ...half.slice(1)];
}

export const NETWORK_NODES: P[] = [
  [0, 0, 0.2],
  [-1.15, 0.85, -0.2],
  [1.2, 0.95, 0.1],
  [1.3, -0.7, -0.3],
  [-1.25, -0.8, 0.25],
  [0.05, 1.35, -0.5],
  [0.1, -1.35, 0.1],
];
export const NETWORK_LINKS: [number, number][] = [
  [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [1, 5], [5, 2], [2, 3], [3, 6], [6, 4], [4, 1],
];

/* ---------------- shape definitions ---------------- */

type Def = { scale: number; vivid?: boolean; paths: { pts: P[]; closed?: boolean; bright?: boolean }[]; bodies: THREE.BufferGeometry[] };

function robotDef(): Def {
  const z = 0.62;
  const head = new THREE.ExtrudeGeometry(roundedRectShape(2.3, 1.85, 0.42), { depth: 1.24, bevelEnabled: false, curveSegments: 10 });
  head.translate(0, 0, -0.62);
  const screen = new THREE.ShapeGeometry(roundedRectShape(1.64, 1.26, 0.2));
  screen.translate(0, -0.15, z + 0.015);
  const ear = new THREE.CylinderGeometry(0.3, 0.3, 0.14, 32);
  ear.rotateZ(Math.PI / 2);
  const earL = ear.clone().translate(-1.22, -0.05, 0);
  const earR = ear.clone().translate(1.22, -0.05, 0);
  const tip = new THREE.SphereGeometry(0.13, 24, 16).translate(0, 1.52, 0);
  return {
    scale: 1.15,
    bodies: [head, screen, earL, earR, tip],
    paths: [
      { pts: roundedRect(2.3, 1.85, 0.42, z), closed: true, bright: true },
      { pts: roundedRect(2.3, 1.85, 0.42, -z), closed: true },
      { pts: roundedRect(1.64, 1.26, 0.2, z + 0.02, -0.15), closed: true },
      { pts: circle([-0.42, 0.04, z + 0.03], 0.2, "xy"), closed: true, bright: true },
      { pts: circle([0.42, 0.04, z + 0.03], 0.2, "xy"), closed: true, bright: true },
      { pts: circle([-0.42, 0.04, z + 0.03], 0.3, "xy"), closed: true },
      { pts: circle([0.42, 0.04, z + 0.03], 0.3, "xy"), closed: true },
      ...[-0.36, -0.18, 0, 0.18, 0.36].map((x) => ({ pts: [[x, -0.42, z + 0.03], [x, -0.6, z + 0.03]] as P[] })),
      { pts: [[0, 0.93, 0], [0, 1.39, 0]] },
      { pts: circle([-1.3, -0.05, 0], 0.32, "yz"), closed: true },
      { pts: circle([1.3, -0.05, 0], 0.32, "yz"), closed: true },
    ],
  };
}

function databaseDef(): Def {
  const R = 1.05;
  const depth = 0.75;
  const body = new THREE.CylinderGeometry(R, R, 2, 64, 1, false);
  body.scale(1, 1, depth / R);
  return {
    scale: 1.15,
    vivid: true,
    bodies: [body],
    paths: [
      ...[1.0, 0.33, -0.33, -1.0].map((y, i) => ({ pts: circle([0, y, 0], R, "xz", depth), closed: true, bright: i === 0 })),
      { pts: [[-R, 1, 0], [-R, -1, 0]] },
      { pts: [[R, 1, 0], [R, -1, 0]] },
    ],
  };
}

function shieldDef(): Def {
  const outline = shieldOutline();
  const shape = new THREE.Shape();
  shape.moveTo(outline[0][0], outline[0][1]);
  outline.slice(1).forEach(([x, y]) => shape.lineTo(x, y));
  const body = new THREE.ExtrudeGeometry(shape, { depth: 0.32, bevelEnabled: false });
  body.translate(0, 0, -0.16);
  return {
    scale: 1.15,
    bodies: [body],
    paths: [
      { pts: outline.map(([x, y]) => [x, y, 0.17] as P), closed: true, bright: true },
      { pts: outline.map(([x, y]) => [x * 0.98, y, -0.17] as P), closed: true },
      { pts: outline.map(([x, y]) => [x * 0.78, y * 0.82 + 0.1, 0.2] as P), closed: true },
      { pts: [[-0.55, -0.05, 0.26], [-0.12, -0.5, 0.26], [0.62, 0.42, 0.26]], bright: true },
    ],
  };
}

function networkDef(): Def {
  const size = (i: number) => (i === 0 ? 0.62 : 0.42);
  // rounded glass nodes, like the floating icon tiles
  const bodies = NETWORK_NODES.map((n, i) => {
    const sz = size(i);
    return new RoundedBoxGeometry(sz, sz, sz, 3, sz * 0.16).translate(...n);
  });
  // links stop at the node surfaces instead of running through them
  const links = NETWORK_LINKS.map(([a, b]) => {
    const pa = new THREE.Vector3(...NETWORK_NODES[a]);
    const pb = new THREE.Vector3(...NETWORK_NODES[b]);
    const dir = pb.clone().sub(pa).normalize();
    const s0 = pa.clone().addScaledVector(dir, size(a) * 0.62);
    const s1 = pb.clone().addScaledVector(dir, -size(b) * 0.62);
    return { pts: [s0.toArray(), s1.toArray()] as P[] };
  });
  return {
    scale: 1.2,
    vivid: true,
    bodies,
    paths: [
      // one clean outline on each node's front face + a glowing core ring
      ...NETWORK_NODES.map((n, i) => ({
        pts: roundedRect(size(i) * 0.86, size(i) * 0.86, size(i) * 0.14, n[2] + size(i) / 2 + 0.012, n[1]).map(
          ([x, y, z]) => [x + n[0], y, z] as P,
        ),
        closed: true,
        bright: true,
      })),
      ...NETWORK_NODES.map((n, i) => ({
        pts: circle([n[0], n[1], n[2] + size(i) / 2 + 0.014], size(i) * 0.16, "xy"),
        closed: true,
        bright: i === 0,
      })),
      ...links,
    ],
  };
}

/* ---------------- build ---------------- */

export type ShapeForm = {
  group: THREE.Group;
  glass: THREE.ShaderMaterial;
  strands: THREE.ShaderMaterial[];
};

function buildForm(def: Def, seed: number): ShapeForm {
  const group = new THREE.Group();
  group.scale.setScalar(def.scale);
  const glass = glassMaterial();
  if (def.vivid) {
    // brighter violet glass for shapes that sit over the light background
    glass.uniforms.uDeep.value = new THREE.Color("#3a22b0");
    glass.uniforms.uBrand.value = new THREE.Color("#8b72fa");
  }
  def.bodies.forEach((g) => {
    const m = new THREE.Mesh(g, glass);
    m.renderOrder = 1;
    group.add(m);
  });
  const strands: THREE.ShaderMaterial[] = [];
  def.paths.forEach((p, i) => {
    const pts = densify(p.pts);
    const curve = new THREE.CatmullRomCurve3(pts, !!p.closed, "catmullrom", 0);
    const seg = Math.min(400, Math.max(24, pts.length * 2));
    const thick = p.bright ? 0.032 : 0.02;
    const offset = (seed * 0.37 + i * 0.173) % 1;
    const speed = (p.bright ? 0.18 : 0.11) * (i % 2 ? -1 : 1);
    const mat = strandMaterial({ a: p.bright ? PALE : LILAC, b: BRAND, speed, offset });
    const glow = strandMaterial({ a: LILAC, b: BRAND, speed, offset, glow: 1 });
    const line = new THREE.Mesh(new THREE.TubeGeometry(curve, seg, thick, 6, !!p.closed), mat);
    const sheath = new THREE.Mesh(new THREE.TubeGeometry(curve, Math.ceil(seg / 2), thick * 4.5, 8, !!p.closed), glow);
    line.renderOrder = 3;
    sheath.renderOrder = 2;
    group.add(sheath, line);
    strands.push(mat, glow);
  });
  group.visible = false;
  return { group, glass, strands };
}

export function buildShapeForms(): ShapeForm[] {
  return [robotDef(), databaseDef(), shieldDef(), networkDef()].map(buildForm);
}

/** Show a form at visibility v (0..1): glass fades in, strands draw on. */
export function setFormVisibility(form: ShapeForm, v: number, t: number) {
  form.group.visible = v > 0.002;
  if (!form.group.visible) return;
  form.glass.uniforms.uVis.value = v;
  form.glass.uniforms.uTime.value = t;
  for (const m of form.strands) {
    m.uniforms.uTime.value = t;
    m.uniforms.uOpacity.value = Math.min(1, v * 1.6);
    m.uniforms.uDraw.value = v;
  }
}
