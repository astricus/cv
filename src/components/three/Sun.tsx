"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { makeGlowTexture } from "./textures";

function prepSunMap(tex: THREE.Texture | THREE.Texture[]) {
  for (const t of Array.isArray(tex) ? tex : [tex]) {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
  }
}

export default function Sun() {
  const mesh = useRef<THREE.Mesh>(null);
  const sunMap = useTexture("/textures/sun.webp", prepSunMap);
  const glow = useMemo(() => makeGlowTexture("rgba(255,190,110,0.85)"), []);

  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.y = state.clock.elapsedTime * 0.04;
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.4) * 0.012;
    mesh.current.scale.setScalar(pulse);
  });

  return (
    <group>
      <mesh ref={mesh}>
        <sphereGeometry args={[3.4, 64, 64]} />
        <meshBasicMaterial map={sunMap} color={[2.8, 2.1, 1.5]} toneMapped={false} />
      </mesh>
      <sprite scale={[22, 22, 1]}>
        <spriteMaterial
          map={glow}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      <pointLight intensity={900} distance={0} decay={2} color="#ffd9a0" />
    </group>
  );
}
