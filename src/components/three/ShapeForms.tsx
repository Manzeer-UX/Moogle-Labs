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

/** Rounded puck profile for LatheGeometry (one database disc). */
function puck(R: number, h: number, r: number) {
  const pts: THREE.Vector2[] = [new THREE.Vector2(0, h / 2)];
  for (let i = 0; i <= 8; i++) {
    const a = (i / 8) * (Math.PI / 2);
    pts.push(new THREE.Vector2(R - r + Math.sin(a) * r, h / 2 - r + Math.cos(a) * r));
  }
  for (let i = 0; i <= 8; i++) {
    const a = (i / 8) * (Math.PI / 2);
    pts.push(new THREE.Vector2(R - r + Math.cos(a) * r, -h / 2 + r - Math.sin(a) * r));
  }
  pts.push(new THREE.Vector2(0, -h / 2));
  return pts;
}

export const DB_TILT = 0.42;
export const DB_LEVELS = [0.72, 0, -0.72];

function databaseDef(): Def {
  const R = 1.0;
  const h = 0.56;
  // three stacked discs with small gaps: the classic database icon, in 3D
  const bodies = DB_LEVELS.map((y) => new THREE.LatheGeometry(puck(R, h, 0.12), 72).translate(0, y, 0));
  return {
    scale: 1.15,
    vivid: true,
    glossy: true,
    tilt: DB_TILT,
    bodies,
    paths: [
      // glowing rim on the top face + light rings in the gaps between discs
      { pts: circle([0, DB_LEVELS[0] + h / 2 + 0.012, 0], R - 0.14, "xz"), closed: true, bright: true },
      { pts: circle([0, (DB_LEVELS[0] + DB_LEVELS[1]) / 2, 0], R * 0.97, "xz"), closed: true, bright: true },
      { pts: circle([0, (DB_LEVELS[1] + DB_LEVELS[2]) / 2, 0], R * 0.97, "xz"), closed: true, bright: true },
      { pts: circle([0, DB_LEVELS[2] - h / 2 - 0.01, 0], R - 0.14, "xz"), closed: true },
    ],
  };
}

function shieldDef(): Def {
  const outline = shieldOutline();
  const shape = new THREE.Shape();
  shape.moveTo(outline[0][0], outline[0][1]);
  outline.slice(1).forEach(([x, y]) => shape.lineTo(x, y));
  // bevelled, rounded-edge slab so it catches light like a real badge
  const depth = 0.2;
  const bevel = 0.1;
  const body = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: 0.08,
    bevelSegments: 8,
    curveSegments: 24,
  });
  body.translate(0, 0, -depth / 2);
  const front = depth / 2 + bevel; // z of the front face
  // raised check mark: a thick glossy tube standing proud of the face
  const checkCurve = new THREE.CatmullRomCurve3(
    [new THREE.Vector3(-0.52, -0.02, front + 0.08), new THREE.Vector3(-0.12, -0.46, front + 0.08), new THREE.Vector3(0.58, 0.4, front + 0.08)],
    false,
    "catmullrom",
    0,
  );
  const check = new THREE.TubeGeometry(checkCurve, 64, 0.085, 20, false);
  const capA = new THREE.SphereGeometry(0.085, 20, 14).translate(-0.52, -0.02, front + 0.08);
  const capB = new THREE.SphereGeometry(0.085, 20, 14).translate(0.58, 0.4, front + 0.08);
  return {
    scale: 1.15,
    vivid: true,
    glossy: true,
    tilt: 0.14,
    bodies: [body],
    accents: [check, capA, capB],
    paths: [
      { pts: outline.map(([x, y]) => [x * 0.95, y * 0.96 + 0.01, front + 0.012] as P), closed: true, bright: true },
      { pts: outline.map(([x, y]) => [x * 0.76, y * 0.8 + 0.1, front + 0.012] as P), closed: true },
    ],
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
  glass: THREE.ShaderMaterial;
  solid?: THREE.MeshPhysicalMaterial;
  accent?: THREE.MeshPhysicalMaterial;
  screen?: THREE.MeshPhysicalMaterial;
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
        color: "#6b4cf2",
        emissive: "#2b1694",
        emissiveIntensity: 0.35,
        roughness: 0.2,
        metalness: 0.25,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
        sheen: 0.6,
        sheenColor: new THREE.Color("#bcaeff"),
        transparent: true,
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
  return { group, glass, solid, accent, screen, strands };
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
  // lit solids: fade in, then turn opaque so they shade and occlude properly
  for (const m of [form.solid, form.accent, form.screen]) {
    if (!m) continue;
    m.opacity = v;
    const transparent = v < 0.999;
    if (m.transparent !== transparent) {
      m.transparent = transparent;
      m.depthWrite = !transparent;
      m.needsUpdate = true;
    }
  }
  for (const m of form.strands) {
    m.uniforms.uTime.value = t;
    m.uniforms.uOpacity.value = Math.min(1, v * 1.6);
    m.uniforms.uDraw.value = v;
  }
}
