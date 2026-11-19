"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
import { connector, scene, type SceneGroup } from "@/lib/scene";
import { clamp, damp, easeOutBack, lerp } from "@/lib/math";
import {
  CAPS_ICON_X,
  WHY_POS,
  capabilityHighlights,
  capsIn,
  capsSwing,
  whyIn,
  whyMobileY,
  whyProgress,
} from "./poses";
import { ORB_NODES, ORB_RADIUS, OrbBody } from "./Orb";

export type MarkVariant = "logo" | "orb";

/* ------------------------------------------------------------------ */
/* MoogleLabs logo icon (two strokes + four nodes) from the brand SVG  */
/* ------------------------------------------------------------------ */
const STROKE_PATHS = [
  "M10.1375 9.62632L13.9685 6.61315C14.1207 6.4935 14.1155 6.26139 13.9583 6.14856L8.18613 2.0067C7.36532 1.57306 5.70511 1.27261 5.63077 3.53992L2.00681 24.8656C1.92937 25.9807 2.48071 27.7183 5.30555 25.7484L20.3329 14.5578C20.4711 14.4549 20.4899 14.255 20.3733 14.1281L18.7251 12.3333C18.6062 12.2038 18.6285 11.9993 18.7726 11.8985L24.6798 7.76791",
  "M25.7834 14.9229L20.3735 18.6387C20.2079 18.7525 20.2049 18.996 20.3677 19.1138L29.4074 25.6554C30.7238 26.5536 33.1614 27.3466 32.3809 23.3323L28.8963 3.0753C28.6648 2.17998 27.7224 0.659998 25.8023 1.71745C25.7901 1.72421 25.7778 1.7322 25.7667 1.74072L14.4933 10.3697C14.0069 10.812 13.446 11.9511 15.4544 13.5946C15.6095 13.7215 15.6053 13.9653 15.439 14.0772L8.17463 18.965",
];
/* Node order = capability category order (top-left, top-right, right, bottom-left) */
const NODES = [
  { x: 10.9066, y: 9.06463, r: 1.85844 },
  { x: 23.9855, y: 8.30185, r: 1.85844 },
  { x: 25.6146, y: 14.9809, r: 1.88917 },
  { x: 9.3444, y: 18.1472, r: 1.85844 },
];
const CENTER = new THREE.Vector2(17.2, 14);
const S = 0.118; // svg units → world units
const STROKE_RADIUS = 1.05 * S;
const STROKE_Z = [0, 0.16];

const toWorld = (x: number, y: number, z = 0) => new THREE.Vector3((x - CENTER.x) * S, -(y - CENTER.y) * S, z);

/** Polyline curve with arc-length parametrisation (keeps the logo's corners). */
class PolylineCurve3 extends THREE.Curve<THREE.Vector3> {
  private pts: THREE.Vector3[];
  private acc: number[];
  private total: number;

  constructor(points: THREE.Vector3[]) {
    super();
    this.pts = points;
    this.acc = [0];
    for (let i = 1; i < points.length; i++) this.acc.push(this.acc[i - 1] + points[i].distanceTo(points[i - 1]));
    this.total = this.acc[this.acc.length - 1] || 1;
  }

  getPoint(t: number, target = new THREE.Vector3()) {
    const d = clamp(t) * this.total;
    let lo = 0;
    let hi = this.acc.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (this.acc[mid] < d) lo = mid;
      else hi = mid;
    }
    const seg = this.acc[hi] - this.acc[lo] || 1;
    return target.copy(this.pts[lo]).lerp(this.pts[hi], (d - this.acc[lo]) / seg);
  }
}

function buildStroke(d: string, z: number) {
  const data = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${d}"/></svg>`);
  const sub = data.paths[0].subPaths[0];
  const pts = sub.getPoints(24).map((p) => toWorld(p.x, p.y, z));
  // drop duplicate consecutive points (they break tube frames)
  const clean = pts.filter((p, i) => i === 0 || p.distanceToSquared(pts[i - 1]) > 1e-8);
  const curve = new PolylineCurve3(clean);
  return {
    tube: new THREE.TubeGeometry(curve, 520, STROKE_RADIUS, 18, false),
    start: clean[0].clone(),
    end: clean[clean.length - 1].clone(),
    center: clean.reduce((acc, p) => acc.add(p), new THREE.Vector3()).multiplyScalar(1 / clean.length),
  };
}

/* MoogleLabs purple */
const RED = new THREE.Color("#5f43e2");
const WHITE = new THREE.Color("#f3f2f8");
const NODE_RED = new THREE.Color("#a891ff");
const NODE_WHY = new THREE.Color("#795df5");
const GLOW = new THREE.Color("#9d84ff");

const anchor = new THREE.Vector3();

export function Mark({ variant = "logo" }: { variant?: MarkVariant }) {
  const orb = variant === "orb";
  const group = useRef<THREE.Group>(null);
  const strokeRefs = useRef<(THREE.Group | null)[]>([]);
  const nodeRefs = useRef<(THREE.Group | null)[]>([]);
  const ringRefs = useRef<(THREE.Mesh | null)[]>([]);
  const last = useRef<{ group: SceneGroup }>({ group: null });
  const hl = useRef([0, 0, 0, 0]);
  const hlTarget = useRef([0, 0, 0, 0]);
  const state = useRef({ spread: 0, white: 0 });

  const parts = useMemo(() => {
    const strokes = STROKE_PATHS.map((d, i) => buildStroke(d, STROKE_Z[i]));
    const capGeometry = new THREE.SphereGeometry(STROKE_RADIUS, 20, 14);
    const nodeGeometry = new THREE.SphereGeometry(1, 40, 28);
    const hullGeometry = new THREE.SphereGeometry(1, 32, 20);
    const ringGeometry = new THREE.TorusGeometry(1, 0.06, 10, 64);

    const strokeMaterial = new THREE.MeshPhysicalMaterial({
      color: RED.clone(),
      roughness: 0.26,
      metalness: 0.3,
      clearcoat: 1,
      clearcoatRoughness: 0.15,
    });
    const nodeMaterials = NODES.map(
      () =>
        new THREE.MeshPhysicalMaterial({
          color: NODE_RED.clone(),
          roughness: 0.2,
          metalness: 0.15,
          clearcoat: 1,
          clearcoatRoughness: 0.1,
          emissive: GLOW.clone(),
          emissiveIntensity: 0.08,
        }),
    );
    const hullMaterials = NODES.map(
      () => new THREE.MeshBasicMaterial({ color: "#ffffff", side: THREE.BackSide, transparent: true, opacity: 0, depthWrite: false }),
    );
    const ringMaterials = NODES.map(
      () => new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0, depthWrite: false }),
    );
    const nodes = orb
      ? ORB_NODES.map((d) => ({ pos: d.clone().multiplyScalar(ORB_RADIUS * 1.04), radius: 0.12 }))
      : NODES.map((n) => ({ pos: toWorld(n.x, n.y, 0.08), radius: n.r * S * 1.25 }));
    return { strokes, capGeometry, nodeGeometry, hullGeometry, ringGeometry, strokeMaterial, nodeMaterials, hullMaterials, ringMaterials, nodes };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((frame, delta) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(delta, 1 / 20);
    const t = frame.clock.elapsedTime;
    const mobile = frame.size.width < 1024;
    const sg = scene.group;

    const pz = 0;
    let px = 0,
      py = 0,
      rx = 0,
      ry = 0,
      rz = 0,
      s = 0,
      spread = 0,
      white = 0;
    const target = hlTarget.current;
    target.fill(0);

    if (sg === "A") {
      const h = capsIn();
      const T = scene.a.t;
      const intro = clamp(scene.intro);
      if (mobile) {
        // Mobile: the icon scrolls away with the hero copy (as if it were in
        // the page flow), and stays hidden behind the stacked service cards.
        const cam = frame.camera as THREE.PerspectiveCamera;
        const unitsPerPx = (2 * Math.tan((cam.fov * Math.PI) / 360) * cam.position.z) / frame.size.height;
        px = 0;
        py = 1.65 + Math.min(window.scrollY, 2400) * unitsPerPx;
        rx = 0.12 + Math.sin(t * 0.35) * 0.06;
        ry = -0.3 + Math.sin(t * 0.5) * 0.24 + (1 - intro) * 2.2;
        rz = 0.02;
        s = 0.55 * easeOutBack(intro) * (1 - h);
        spread = 0;
      } else {
        // The icon sits opposite the active panel; at every hand-over it
        // swings across the screen and makes a full turn on the way.
        const { side, turns } = capsSwing(T);
        const facing = lerp(0.5, -0.5, side); // turned toward its panel
        px = lerp(0, lerp(-CAPS_ICON_X, CAPS_ICON_X, side), h);
        py = lerp(1.3, 0.35, h) + Math.sin(t * 0.8) * 0.05;
        rx = lerp(0.12 + Math.sin(t * 0.35) * 0.06, -0.5, h);
        ry =
          lerp(-0.3 + Math.sin(t * 0.5) * 0.24, facing + turns * Math.PI * 2 + Math.sin(t * 0.4) * 0.06, h) +
          (1 - intro) * 2.2;
        rz = lerp(0.02, lerp(0.08, -0.08, side), h);
        s = lerp(0.72, 0.8, h) * easeOutBack(intro);
        spread = h;
        capabilityHighlights(target);
      }
    } else if (sg === "B") {
      // Sits in the free top-left area: the headline is bottom-left and the
      // differentiator cards are top-right, so nothing overlaps the copy.
      const w = whyIn();
      const W = whyProgress();
      px = mobile ? 0 : WHY_POS.x;
      // Desktop rises into place; mobile scales in where it sits so it never
      // travels through the headline.
      py = (mobile ? whyMobileY() : lerp(-5.5, WHY_POS.y, w)) + Math.sin(t * 0.7) * 0.04;
      rx = -0.45;
      ry = 0.7 + W * 0.7 + Math.sin(t * 0.3) * 0.05;
      rz = 0.06;
      s = (mobile ? 0.55 : 0.74) * (0.5 + 0.5 * w) * (w > 0.001 ? 1 : 0);
      spread = 0.35 + (1 - w) * 0.6;
      white = 1;
    }

    const snap = sg !== last.current.group;
    last.current.group = sg;
    const k = snap ? 1 : 1 - Math.exp(-5 * dt);
    g.position.x += (px - g.position.x) * k;
    g.position.y += (py - g.position.y) * k;
    g.position.z += (pz - g.position.z) * k;
    g.rotation.x += (rx - g.rotation.x) * k;
    g.rotation.y += (ry - g.rotation.y) * k;
    g.rotation.z += (rz - g.rotation.z) * k;
    const sc = g.scale.x + (s - g.scale.x) * k;
    g.scale.setScalar(Math.max(sc, 0.0001));
    g.visible = sc > 0.002;

    const st = state.current;
    st.spread = snap ? spread : damp(st.spread, spread, 4, dt);
    st.white = snap ? white : damp(st.white, white, 4, dt);

    // Strokes drift apart in depth as the scene "opens up"
    strokeRefs.current.forEach((stroke, i) => {
      if (!stroke) return;
      const dir = i === 0 ? -1 : 1;
      stroke.position.set(dir * st.spread * 0.12, 0, dir * st.spread * 0.32);
    });
    parts.strokeMaterial.color.copy(RED).lerp(WHITE, st.white);
    parts.strokeMaterial.roughness = lerp(0.26, 0.45, st.white);
    parts.strokeMaterial.metalness = lerp(0.3, 0.02, st.white);
    parts.strokeMaterial.clearcoat = lerp(1, 0.4, st.white);

    for (let i = 0; i < 4; i++) {
      hl.current[i] = snap ? target[i] : damp(hl.current[i], target[i], 7, dt);
      const h = hl.current[i];
      const node = nodeRefs.current[i];
      const info = parts.nodes[i];
      if (node) {
        if (orb) node.position.copy(info.pos).multiplyScalar(1 + st.spread * 0.06 + h * 0.22);
        else node.position.set(info.pos.x, info.pos.y, info.pos.z + st.spread * 0.45 + h * 0.5);
        node.scale.setScalar(info.radius * (1 + h * 0.55 + Math.sin(t * 2 + i) * 0.03));
      }
      const m = parts.nodeMaterials[i];
      m.color.copy(NODE_RED).lerp(NODE_WHY, st.white);
      m.emissiveIntensity = 0.08 + h * 0.9;
      parts.hullMaterials[i].opacity = h * 0.95;
      const ring = ringRefs.current[i];
      if (ring) {
        ring.scale.setScalar(1.8 + h * 0.6 + Math.sin(t * 3 + i) * 0.08);
        ring.rotation.z = t * 0.8 + i;
        parts.ringMaterials[i].opacity = h * 0.85;
      }
    }

    // Connector line from the active capability panel to its node.
    const line = connector.line;
    const dot = connector.dot;
    if (line && dot) {
      let best = -1;
      let bestV = 0;
      hl.current.forEach((v, i) => {
        if (v > bestV) {
          bestV = v;
          best = i;
        }
      });
      const panel = best >= 0 ? connector.panels[best] : null;
      const node = best >= 0 ? nodeRefs.current[best] : null;
      if (sg !== "A" || mobile || best < 0 || bestV < 0.03 || !panel || !node || !g.visible) {
        line.style.opacity = "0";
        dot.style.opacity = "0";
      } else {
        node.getWorldPosition(anchor);
        anchor.project(frame.camera);
        const x = (anchor.x * 0.5 + 0.5) * frame.size.width;
        const y = (-anchor.y * 0.5 + 0.5) * frame.size.height;
        // Attach to whichever panel edge faces the icon (panels alternate sides).
        const r = panel.getBoundingClientRect();
        const panelOnRight = r.left + r.width / 2 > x;
        const ex = panelOnRight ? r.left - 14 : r.right + 14;
        const elbow = panelOnRight ? ex - 70 : ex + 70;
        const ey = r.top + 34;
        line.setAttribute(
          "points",
          `${x.toFixed(1)},${y.toFixed(1)} ${elbow.toFixed(1)},${ey.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}`,
        );
        line.style.opacity = String(bestV);
        dot.style.opacity = String(bestV);
        dot.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%) rotate(45deg)`;
      }
    }
  });

  return (
    <group ref={group} scale={0.0001}>
      {orb && <OrbBody state={state} />}
      {!orb && parts.strokes.map((stroke, i) => (
        <group
          key={i}
          ref={(el) => {
            strokeRefs.current[i] = el;
          }}
        >
          <mesh geometry={stroke.tube} material={parts.strokeMaterial} />
          <mesh geometry={parts.capGeometry} material={parts.strokeMaterial} position={stroke.start} />
          <mesh geometry={parts.capGeometry} material={parts.strokeMaterial} position={stroke.end} />
        </group>
      ))}
      {parts.nodes.map((_, i) => (
        <group
          key={i}
          ref={(el) => {
            nodeRefs.current[i] = el;
          }}
        >
          {/* Orb variant: no visible node balls; the group stays as the connector's anchor. */}
          {!orb && (
            <>
              <mesh geometry={parts.nodeGeometry} material={parts.nodeMaterials[i]} />
              <mesh geometry={parts.hullGeometry} material={parts.hullMaterials[i]} scale={1.16} renderOrder={2} />
              <mesh
                ref={(el) => {
                  ringRefs.current[i] = el;
                }}
                geometry={parts.ringGeometry}
                material={parts.ringMaterials[i]}
                renderOrder={3}
              />
            </>
          )}
        </group>
      ))}
    </group>
  );
}
