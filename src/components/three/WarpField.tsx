"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { scene } from "@/lib/scene";
import { clamp, damp } from "@/lib/math";
import { createRandom } from "@/lib/random";
import { warpVisibility } from "./poses";
import { createNumberTexture } from "./textures";

const FAR = -48;
const NEAR = 9;
const dummy = new THREE.Object3D();

/** Streaks and numbered cubes flying at the camera (delivery stages act). */
export function WarpField() {
  const mobile = useThree((s) => s.size.width < 1024);
  const streakCount = mobile ? 70 : 150;
  const cubeCount = mobile ? 10 : 18;

  const streaks = useRef<THREE.InstancedMesh>(null);
  const cubes = useRef<(THREE.Mesh | null)[]>([]);
  const root = useRef<THREE.Group>(null);
  const vis = useRef(0);
  const speed = useRef(6);
  const lastGroup = useRef(scene.group);

  const streakData = useMemo(() => {
    const random = createRandom(11);
    return Array.from({ length: streakCount }, () => ({
      a: random() * Math.PI * 2,
      r: 1.2 + random() * 7,
      z: FAR + random() * (NEAR - FAR),
      f: 0.6 + random() * 0.9,
      len: 0.6 + random() * 1.8,
    }));
  }, [streakCount]);

  const cubeData = useMemo(() => {
    const random = createRandom(23);
    return Array.from({ length: cubeCount }, (_, i) => ({
      a: random() * Math.PI * 2,
      r: 2.6 + random() * 3.6,
      z: FAR + (i / cubeCount) * (NEAR - FAR),
      f: 0.5 + random() * 0.5,
      rs: new THREE.Vector3(random() - 0.5, random() - 0.5, random() - 0.5).multiplyScalar(1.2),
      s: 0.45 + random() * 0.55,
    }));
  }, [cubeCount]);

  const { streakGeometry, streakMaterial, cubeGeometry, cubeMaterials } = useMemo(() => {
    const streakGeometry = new THREE.BoxGeometry(0.016, 0.016, 1);
    const streakMaterial = new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0, depthWrite: false });
    const cubeGeometry = new RoundedBoxGeometry(1, 1, 1, 3, 0.14);
    const labels = ["01", "02", "03", "04", "05", "06", "07"];
    const cubeMaterials = labels.map(
      (label, i) =>
        new THREE.MeshStandardMaterial({
          map: createNumberTexture(label, i),
          roughness: 0.55,
          metalness: 0.02,
          transparent: true,
          opacity: 0,
        }),
    );
    return { streakGeometry, streakMaterial, cubeGeometry, cubeMaterials };
  }, []);

  const perCubeMaterials = useMemo(
    () => cubeData.map((_, i) => cubeMaterials[i % cubeMaterials.length].clone()),
    [cubeData, cubeMaterials],
  );

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const target = warpVisibility();
    // Acts only switch while an opaque section covers the canvas → snap.
    const snap = scene.group !== lastGroup.current;
    lastGroup.current = scene.group;
    vis.current = snap ? target : damp(vis.current, target, 4, dt);
    const v = vis.current;
    if (root.current) root.current.visible = v > 0.005;
    if (v <= 0.005) return;

    const boost = clamp(Math.abs(scene.velocity) / 40, 0, 4);
    speed.current = damp(speed.current, 5 + boost * 9, 3, dt);
    const sp = speed.current;

    streakMaterial.opacity = v * 0.85;
    const mesh = streaks.current;
    if (mesh) {
      streakData.forEach((d, i) => {
        d.z += dt * sp * d.f * 1.6;
        if (d.z > NEAR) d.z = FAR + Math.random() * 6;
        dummy.position.set(Math.cos(d.a) * d.r, Math.sin(d.a) * d.r, d.z);
        dummy.scale.set(1, 1, d.len * (1 + boost * 0.8));
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    }

    cubeData.forEach((d, i) => {
      const cube = cubes.current[i];
      if (!cube) return;
      d.z += dt * sp * d.f * 0.55;
      if (d.z > NEAR) {
        d.z = FAR;
        d.a = Math.random() * Math.PI * 2;
      }
      cube.position.set(Math.cos(d.a) * d.r, Math.sin(d.a) * d.r * 0.75, d.z);
      cube.rotation.x += d.rs.x * dt;
      cube.rotation.y += d.rs.y * dt;
      cube.rotation.z += d.rs.z * dt;
      cube.scale.setScalar(d.s);
      const fadeIn = clamp((d.z - FAR) / 10);
      (cube.material as THREE.MeshStandardMaterial).opacity = v * fadeIn;
    });
  });

  return (
    <group ref={root} visible={false}>
      <instancedMesh ref={streaks} args={[streakGeometry, streakMaterial, streakCount]} frustumCulled={false} />
      {cubeData.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            cubes.current[i] = el;
          }}
          geometry={cubeGeometry}
          material={perCubeMaterials[i]}
        />
      ))}
    </group>
  );
}
