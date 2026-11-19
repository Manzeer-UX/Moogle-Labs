"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { Background } from "./Background";
import { FloorGrid } from "./FloorGrid";
import { IconTiles } from "./IconTiles";
import { Mark, type MarkVariant } from "./Mark";
import { Particles } from "./Particles";
import { Rig } from "./Rig";
import { WarpField } from "./WarpField";

export default function Scene({ active, variant = "logo" }: { active: boolean; variant?: MarkVariant }) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance", stencil: false }}
      camera={{ position: [0, 0, 10], fov: 35, near: 0.1, far: 120 }}
      style={{ position: "absolute", inset: 0 }}
    >
      <Background />
      <Rig />

      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 6, 8]} intensity={1.5} />
      <directionalLight position={[-6, 3, -4]} intensity={0.9} color="#ff8f80" />

      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} position={[0, 5, 5]} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#ffd9d2" position={[-6, 0, 3]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#ffffff" position={[6, 1, 2]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} />
        <Lightformer form="ring" intensity={2.5} position={[3, 3, -4]} scale={2.5} />
        <Lightformer form="rect" intensity={0.8} position={[0, -5, 3]} rotation-x={-Math.PI / 2} scale={[10, 4, 1]} />
      </Environment>

      <FloorGrid />
      <Mark variant={variant} />
      <IconTiles variant={variant} />
      <WarpField />
      <Particles />
    </Canvas>
  );
}
