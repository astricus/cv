"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { makeGlowTexture } from "./textures";

const CLOUDS: { color: string; position: [number, number, number]; scale: number; opacity: number }[] = [
  // deep background wash
  { color: "rgba(109,40,217,1)", position: [-70, 22, -85], scale: 110, opacity: 0.2 },
  { color: "rgba(76,29,149,1)", position: [-45, -5, -95], scale: 85, opacity: 0.16 },
  { color: "rgba(37,99,235,1)", position: [60, -22, -90], scale: 95, opacity: 0.17 },
  { color: "rgba(8,47,112,1)", position: [85, 0, -70], scale: 80, opacity: 0.14 },
  { color: "rgba(219,39,119,1)", position: [25, 40, -100], scale: 85, opacity: 0.13 },
  { color: "rgba(190,24,93,1)", position: [-15, 48, -80], scale: 65, opacity: 0.1 },
  { color: "rgba(13,148,136,1)", position: [-95, -28, -55], scale: 75, opacity: 0.11 },
  // behind-the-viewer accents so orbiting stays interesting
  { color: "rgba(14,165,233,1)", position: [-50, -35, 75], scale: 85, opacity: 0.12 },
  { color: "rgba(147,51,234,1)", position: [80, 15, 55], scale: 75, opacity: 0.14 },
  { color: "rgba(236,72,153,1)", position: [10, -45, 90], scale: 65, opacity: 0.1 },
];

export default function Nebula() {
  const group = useRef<THREE.Group>(null);
  const textures = useMemo(() => CLOUDS.map((c) => makeGlowTexture(c.color)), []);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.002;
  });

  return (
    <group ref={group}>
      {CLOUDS.map((c, i) => (
        <sprite key={i} position={c.position} scale={[c.scale, c.scale, 1]}>
          <spriteMaterial
            map={textures[i]}
            transparent
            opacity={c.opacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      ))}
    </group>
  );
}
