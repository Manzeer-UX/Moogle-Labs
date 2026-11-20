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

type Def = {
  scale: number;
  vivid?: boolean;
  /** Lit, glossy solid instead of the flat glass shader (reads as real 3D). */
  glossy?: boolean;
  /** Lean the top toward the viewer (radians around x). */
  tilt?: number;
  /** Raised, bright glossy details (e.g. the shield's check mark). */
  accents?: THREE.BufferGeometry[];
  /** Dark glossy glass panels (e.g. the robot's face screen). */
  screens?: THREE.BufferGeometry[];
  /** Light lilac glossy solids (e.g. the cloud), for contrast with the violet. */
  pales?: THREE.BufferGeometry[];
  paths: { pts: P[]; closed?: boolean; bright?: boolean }[]; bodies: THREE.BufferGeometry[] };

function robotDef(): Def {
  const depth = 1.0;
  const bevel = 0.12;
  const z = depth / 2 + bevel; // front face
  // bevelled, rounded head that catches light like a real object
  const head = new THREE.ExtrudeGeometry(roundedRectShape(2.06, 1.62, 0.34), {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: 0.12,
    bevelSegments: 8,
    curveSegments: 16,
  });
  head.translate(0, 0, -depth / 2);
  // dark glass face screen, slightly inset look via its own glossy material
  const screen = new THREE.ExtrudeGeometry(roundedRectShape(1.64, 1.26, 0.2), {
    depth: 0.03,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 3,
  });
  screen.translate(0, -0.15, z - 0.005);
  const sf = z + 0.05; // screen face
  // raised glowing eyes + mouth bars
  const eye = new THREE.CylinderGeometry(0.19, 0.19, 0.08, 40);
  eye.rotateX(Math.PI / 2);
  const eyeL = eye.clone().translate(-0.42, 0.04, sf + 0.04);
  const eyeR = eye.clone().translate(0.42, 0.04, sf + 0.04);
  const bars = [-0.36, -0.18, 0, 0.18, 0.36].map((x) =>
    new RoundedBoxGeometry(0.08, 0.2, 0.06, 2, 0.03).translate(x, -0.51, sf + 0.03),
  );
  // ear pods and antenna
  const ear = new THREE.CylinderGeometry(0.3, 0.3, 0.18, 40);
  ear.rotateZ(Math.PI / 2);
  const earL = ear.clone().translate(-1.27, -0.05, 0);
  const earR = ear.clone().translate(1.27, -0.05, 0);
  const stalk = new THREE.CylinderGeometry(0.045, 0.045, 0.5, 16).translate(0, 1.18, 0);
  const tip = new THREE.SphereGeometry(0.14, 28, 18).translate(0, 1.5, 0);
  return {
    scale: 1.15,
    vivid: true,
    glossy: true,
    tilt: 0.12,
    bodies: [head, earL, earR, stalk],
    screens: [screen],
    accents: [eyeL, eyeR, ...bars, tip],
    paths: [
      { pts: roundedRect(1.64, 1.26, 0.2, sf + 0.008, -0.15), closed: true, bright: true },
      { pts: circle([-0.42, 0.04, sf + 0.09], 0.27, "xy"), closed: true },
      { pts: circle([0.42, 0.04, sf + 0.09], 0.27, "xy"), closed: true },
      { pts: circle([-1.37, -0.05, 0], 0.2, "yz"), closed: true, bright: true },
      { pts: circle([1.37, -0.05, 0], 0.2, "yz"), closed: true, bright: true },
    ],
  };
}

/* Data & cloud: a clean cloud badge (with an upload arrow) above a two-unit
   server rack. Shared with the particle sampler in OrbMorph. */
export const DATA_TILT = 0.26;
/** Cloud silhouette circles: [cx, cy, r] (flat base at cy - r of the side bumps). */
const CLOUD_BUMPS: [number, number, number][] = [
  [-0.62, 0.42, 0.42],
  [0.02, 0.66, 0.6],
  [0.72, 0.42, 0.42],
];
export const CLOUD_BASE = 0.5; // y of the cloud's flat base
export const CLOUD_FRONT = 0.3; // z of the cloud's front face (depth 0.36 + bevel)
export const BLADES = [-0.18, -0.82]; // server unit centres (y)
export const BLADE = { w: 2.3, h: 0.54, d: 1.05 };

/** Closed cloud outline in the xy plane (base at y = 0 before offset). */
export function cloudOutline(): [number, number][] {
  const [L, , R] = CLOUD_BUMPS;
  const pts: [number, number][] = [];
  for (let i = 0; i <= 12; i++) {
    const a = -Math.PI / 2 - (i / 12) * (Math.PI / 2); // bottom → leftmost of left bump
    pts.push([L[0] + Math.cos(a) * L[2], L[1] + Math.sin(a) * L[2]]);
  }
  const x0 = L[0] - L[2];
  const x1 = R[0] + R[2];
  for (let i = 1; i < 80; i++) {
    const x = x0 + ((x1 - x0) * i) / 80;
    let y = 0;
    for (const [cx, cy, r] of CLOUD_BUMPS) {
      const dx = x - cx;
      if (Math.abs(dx) <= r) y = Math.max(y, cy + Math.sqrt(r * r - dx * dx));
    }
    pts.push([x, y]);
  }
  for (let i = 0; i <= 12; i++) {
    const a = -(i / 12) * (Math.PI / 2); // rightmost → bottom of right bump
    pts.push([R[0] + Math.cos(a) * R[2], R[1] + Math.sin(a) * R[2]]);
  }
  return pts;
}

function databaseDef(): Def {
  // cloud: one clean silhouette, bevelled into a solid badge
  const outline = cloudOutline();
  const shape = new THREE.Shape();
  shape.moveTo(outline[0][0], outline[0][1]);
  outline.slice(1).forEach(([x, y]) => shape.lineTo(x, y));
  const cloud = new THREE.ExtrudeGeometry(shape, {
    depth: 0.36,
    bevelEnabled: true,
    bevelThickness: 0.12,
    bevelSize: 0.1,
    bevelSegments: 8,
    curveSegments: 24,
  });
  cloud.translate(0, CLOUD_BASE, -0.18);
  const cf = CLOUD_FRONT;
  // dark glass screen set into the cloud's face (a smaller copy of the outline)
  const sx = 0.05;
  const sy = 0.55;
  const k = 0.74;
  const inner = new THREE.Shape();
  const innerPts = outline.map(([x, y]) => [sx + (x - sx) * k, sy + (y - sy) * k] as [number, number]);
  inner.moveTo(innerPts[0][0], innerPts[0][1]);
  innerPts.slice(1).forEach(([x, y]) => inner.lineTo(x, y));
  const cloudScreen = new THREE.ExtrudeGeometry(inner, {
    depth: 0.03,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 3,
    curveSegments: 24,
  });
  cloudScreen.translate(0, CLOUD_BASE, cf - 0.005);
  // glowing upload arrow on the cloud's face
  const arrowPts = (a: [number, number], b: [number, number]) =>
    new THREE.TubeGeometry(
      new THREE.LineCurve3(new THREE.Vector3(a[0], a[1], cf + 0.09), new THREE.Vector3(b[0], b[1], cf + 0.09)),
      4,
      0.055,
      14,
      false,
    );
  const ay = CLOUD_BASE;
  const arrow = [
    arrowPts([0, ay + 0.18], [0, ay + 0.78]),
    arrowPts([0, ay + 0.8], [-0.22, ay + 0.58]),
    arrowPts([0, ay + 0.8], [0.22, ay + 0.58]),
    ...[[0, ay + 0.18], [0, ay + 0.8], [-0.22, ay + 0.58], [0.22, ay + 0.58]].map(([x, y]) =>
      new THREE.SphereGeometry(0.055, 14, 10).translate(x, y, cf + 0.09),
    ),
  ];

  // servers: larger units with clear, bright details
  const blades = BLADES.map((y) => new RoundedBoxGeometry(BLADE.w, BLADE.h, BLADE.d, 4, 0.12).translate(0, y, 0));
  const front = BLADE.d / 2;
  const panels = BLADES.map((y) => new RoundedBoxGeometry(2.0, 0.34, 0.05, 3, 0.07).translate(0, y, front + 0.005));
  const leds = BLADES.flatMap((y) =>
    [0.52, 0.7, 0.88].map((x) => new THREE.SphereGeometry(0.065, 18, 12).translate(x, y, front + 0.06)),
  );
  const slots = BLADES.flatMap((y) =>
    [-0.82, -0.56, -0.3, -0.04].map((x) => new RoundedBoxGeometry(0.18, 0.08, 0.04, 2, 0.025).translate(x, y, front + 0.045)),
  );
  // data links from the rack up into the cloud
  const top = BLADES[0] + BLADE.h / 2;
  const links = [-0.62, 0.62].map(
    (x) =>
      new THREE.TubeGeometry(
        new THREE.LineCurve3(new THREE.Vector3(x, top, 0.05), new THREE.Vector3(x, CLOUD_BASE + 0.06, 0.05)),
        6,
        0.045,
        12,
        false,
      ),
  );
  return {
    scale: 1.2,
    vivid: true,
    glossy: true,
    tilt: DATA_TILT,
    bodies: [...blades, cloud],
    screens: [...panels, cloudScreen],
    accents: [...leds, ...slots, ...links, ...arrow],
    paths: [
      // glowing rim on the cloud's face and on each server front
      { pts: innerPts.map(([x, y]) => [x, CLOUD_BASE + y, cf + 0.06] as P), closed: true, bright: true },
      ...BLADES.map((y) => ({ pts: roundedRect(2.08, 0.42, 0.1, front + 0.035, y), closed: true, bright: true })),
      ...[-0.62, 0.62].map((x) => ({ pts: [[x, top, 0.11], [x, CLOUD_BASE + 0.06, 0.11]] as P[], bright: true })),
    ],
  };
}

function shieldDef(): Def {
  const outline = shieldOutline();
  const toShape = (pts: [number, number][]) => {
    const sh = new THREE.Shape();
    sh.moveTo(pts[0][0], pts[0][1]);
    pts.slice(1).forEach(([x, y]) => sh.lineTo(x, y));
    return sh;
  };
  // thick, bevelled glossy body (same violet as the robot head)
  const depth = 0.34;
  const bevel = 0.13;
  const body = new THREE.ExtrudeGeometry(toShape(outline.map(([x, y]) => [x, y])), {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: 0.1,
    bevelSegments: 8,
    curveSegments: 24,
  });
  body.translate(0, 0, -depth / 2);
  const front = depth / 2 + bevel;
  // dark glass screen set into the face: a smaller copy of the shield outline
  const cx = 0;
  const cy = -0.1;
  const k = 0.74;
  const innerPts = outline.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k] as [number, number]);
  const screen = new THREE.ExtrudeGeometry(toShape(innerPts), {
    depth: 0.03,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 3,
  });
  screen.translate(0, 0, front - 0.005);
  const sf = front + 0.05; // screen face
  // raised glowing check mark on the glass
  const checkCurve = new THREE.CatmullRomCurve3(
    [new THREE.Vector3(-0.42, -0.06, sf + 0.06), new THREE.Vector3(-0.1, -0.4, sf + 0.06), new THREE.Vector3(0.46, 0.3, sf + 0.06)],
    false,
    "catmullrom",
    0,
  );
  const check = new THREE.TubeGeometry(checkCurve, 64, 0.08, 20, false);
  const capA = new THREE.SphereGeometry(0.08, 20, 14).translate(-0.42, -0.06, sf + 0.06);
  const capB = new THREE.SphereGeometry(0.08, 20, 14).translate(0.46, 0.3, sf + 0.06);
  return {
    scale: 1.15,
    vivid: true,
    glossy: true,
    tilt: 0.2,
    bodies: [body],
    screens: [screen],
    accents: [check, capA, capB],
    paths: [{ pts: innerPts.map(([x, y]) => [x, y, sf + 0.008] as P), closed: true, bright: true }],
  };
}

function networkDef(): Def {
  const size = (i: number) => (i === 0 ? 0.62 : 0.42);
  // polished rounded nodes
  const bodies = NETWORK_NODES.map((n, i) => {
    const sz = size(i);
    return new RoundedBoxGeometry(sz, sz, sz, 4, sz * 0.18).translate(...n);
  });
  // solid glowing link tubes that stop at the node surfaces
  const links = NETWORK_LINKS.map(([a, b]) => {
    const pa = new THREE.Vector3(...NETWORK_NODES[a]);
    const pb = new THREE.Vector3(...NETWORK_NODES[b]);
    const dir = pb.clone().sub(pa).normalize();
    const s0 = pa.clone().addScaledVector(dir, size(a) * 0.5);
    const s1 = pb.clone().addScaledVector(dir, -size(b) * 0.5);
    return new THREE.TubeGeometry(new THREE.LineCurve3(s0, s1), 8, 0.032, 12, false);
  });
  // raised glowing core on each node's face
  const cores = NETWORK_NODES.map((n, i) => {
    const r = size(i) * 0.2;
    const g = new THREE.CylinderGeometry(r, r, 0.05, 32);
    g.rotateX(Math.PI / 2);
    return g.translate(n[0], n[1], n[2] + size(i) / 2 + 0.02);
  });
  return {
    scale: 1.2,
    vivid: true,
    glossy: true,
    tilt: 0.1,
    bodies,
    accents: [...links, ...cores],
    paths: [
      // a single glowing outline on each node's front face
      ...NETWORK_NODES.map((n, i) => ({
        pts: roundedRect(size(i) * 0.8, size(i) * 0.8, size(i) * 0.14, n[2] + size(i) / 2 + 0.012, n[1]).map(
          ([x, y, z]) => [x + n[0], y, z] as P,
        ),
        closed: true,
        bright: i === 0,
      })),
    ],
  };
}

/* ---------------- build ---------------- */

export type ShapeForm = {
  group: THREE.Group;
  /** Connector-line attachment point (child of group). */
  anchor?: THREE.Object3D;
  glass: THREE.ShaderMaterial;
  solid?: THREE.MeshPhysicalMaterial;
  accent?: THREE.MeshPhysicalMaterial;
  screen?: THREE.MeshPhysicalMaterial;
  pale?: THREE.MeshPhysicalMaterial;
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
  if (def.tilt) group.rotation.x = def.tilt;
  // Glossy shapes are lit by the scene's lights and environment, so they get
  // real highlights and shading instead of a flat glow.
  const solid = def.glossy
    ? new THREE.MeshPhysicalMaterial({
        // deeper base + little self-glow so the scene lights create real
        // light-to-shadow shading (reads as 3D even on the light background)
        color: "#5536e0",
        emissive: "#1c0d66",
        emissiveIntensity: 0.12,
        roughness: 0.3,
        metalness: 0.35,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        sheen: 0.35,
        sheenColor: new THREE.Color("#bcaeff"),
        envMapIntensity: 1.3,
        transparent: true,
        depthWrite: true,
        opacity: 0,
      })
    : undefined;
  def.bodies.forEach((g) => {
    const m = new THREE.Mesh(g, solid ?? glass);
    m.renderOrder = 1;
    group.add(m);
  });
  const accent = def.accents
    ? new THREE.MeshPhysicalMaterial({
        color: "#e4dcff",
        emissive: "#9b84f8",
        emissiveIntensity: 0.55,
        roughness: 0.15,
        metalness: 0.1,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        transparent: true,
        opacity: 0,
      })
    : undefined;
  const screen = def.screens
    ? new THREE.MeshPhysicalMaterial({
        color: "#140b36",
        emissive: "#2a1a7a",
        emissiveIntensity: 0.25,
        roughness: 0.08,
        metalness: 0.4,
        clearcoat: 1,
        clearcoatRoughness: 0.02,
        transparent: true,
        opacity: 0,
      })
    : undefined;
  const pale = def.pales
    ? new THREE.MeshPhysicalMaterial({
        color: "#b4a2ff",
        emissive: "#6b4cf2",
        emissiveIntensity: 0.14,
        roughness: 0.22,
        metalness: 0.15,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
        transparent: true,
        depthWrite: true,
        opacity: 0,
      })
    : undefined;
  def.pales?.forEach((g) => {
    const m = new THREE.Mesh(g, pale);
    m.renderOrder = 1;
    group.add(m);
  });
  def.screens?.forEach((g) => {
    const m = new THREE.Mesh(g, screen);
    m.renderOrder = 2;
    group.add(m);
  });
  def.accents?.forEach((g) => {
    const m = new THREE.Mesh(g, accent);
    m.renderOrder = 4;
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
  return { group, glass, solid, accent, screen, pale, strands };
}

/**
 * Where each category's connector line attaches, in form space: a point on
 * the side of the shape that faces its panel (panels alternate right/left).
 */
const ANCHORS: P[] = [
  [1.46, -0.05, 0], // robot: right ear (panel on the right)
  [-1.12, 0.92, 0.1], // data: left edge of the cloud (panel on the left)
  [1.3, 1.08, 0.12], // shield: upper-right edge (panel on the right)
  [-1.37, 0.85, -0.2], // network: left face of the top-left node (panel on the left)
];

/**
 * Live anchor objects for the connector line. Registered every frame by the
 * forms that are actually rendered (OrbMorph), so a second build (e.g. React
 * Strict Mode) can never leave the line pointing at a detached copy.
 */
export const formAnchors: (THREE.Object3D | null)[] = [null, null, null, null];

export function buildShapeForms(): ShapeForm[] {
  return [robotDef(), databaseDef(), shieldDef(), networkDef()].map((def, i) => {
    const form = buildForm(def, i);
    const anchor = new THREE.Object3D();
    anchor.position.set(...ANCHORS[i]);
    form.group.add(anchor);
    form.anchor = anchor;
    return form;
  });
}

/** Show a form at visibility v (0..1): glass fades in, strands draw on. */
export function setFormVisibility(form: ShapeForm, v: number, t: number) {
  form.group.visible = v > 0.002;
  if (!form.group.visible) return;
  form.glass.uniforms.uVis.value = v;
  form.glass.uniforms.uTime.value = t;
  // lit solids: fade in, then turn opaque so they shade and occlude properly
  for (const m of [form.solid, form.accent, form.screen, form.pale]) {
    if (!m) continue;
    m.opacity = Math.min(1, v * 1.15);
    // opaque well before the shape fully settles; depth is always written so
    // back faces never show through the front (no see-through look)
    const transparent = v < 0.85;
    m.depthWrite = true;
    if (m.transparent !== transparent) {
      m.transparent = transparent;
      m.needsUpdate = true;
    }
  }
  for (const m of form.strands) {
    m.uniforms.uTime.value = t;
    m.uniforms.uOpacity.value = Math.min(1, v * 1.6);
    m.uniforms.uDraw.value = v;
  }
}
