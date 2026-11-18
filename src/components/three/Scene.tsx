"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, OrbitControls, Stars, useTexture } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { easing } from "maath";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { SECTIONS, type Section } from "@/data/sections";
import Sun from "./Sun";
import Nebula from "./Nebula";
import {
  Comet,
  CommsSatellite,
  GasGiant,
  Homeworld,
  OrbitalStation,
} from "./CelestialObjects";

const HOME_CAM = new THREE.Vector3(0, 9, 27);
const HOME_TARGET = new THREE.Vector3(0, 0, 0);

function attachEnvironment(gl: THREE.WebGLRenderer, scene: THREE.Scene) {
  const pmrem = new THREE.PMREMGenerator(gl);
  const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envMap;
  scene.environmentIntensity = 0.35;
  return () => {
    scene.environment = null;
    envMap.dispose();
    pmrem.dispose();
  };
}

/** Soft studio environment map so spacecraft metals pick up reflections. */
function Env() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);

  useEffect(() => attachEnvironment(gl, scene), [gl, scene]);

  return null;
}

function prepSky(tex: THREE.Texture | THREE.Texture[]) {
  for (const t of Array.isArray(tex) ? tex : [tex]) {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
  }
}

/** Real Milky Way panorama on an inside-out sphere, slowly drifting. */
function MilkyWay() {
  const tex = useTexture("/textures/stars_milky_way.webp", prepSky);
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (mesh.current) mesh.current.rotation.y += delta * 0.0035;
  });

  return (
    <mesh ref={mesh} rotation={[0, 0, 0.4]} scale={[-1, 1, 1]}>
      <sphereGeometry args={[230, 48, 32]} />
      <meshBasicMaterial
        map={tex}
        color={[0.8, 0.8, 0.88]}
        toneMapped={false}
        side={THREE.BackSide}
        depthWrite={false}
        fog={false}
      />
    </mesh>
  );
}

const MODELS: Record<string, React.ComponentType> = {
  about: Homeworld,
  experience: GasGiant,
  skills: OrbitalStation,
  education: Comet,
  contact: CommsSatellite,
};

const LABEL_OFFSET: Record<string, number> = {
  about: 2.6,
  experience: 4.2,
  skills: 3.2,
  education: 3.0,
  contact: 2.4,
};

function SectionAnchor({
  section,
  onSelect,
}: {
  section: Section;
  onSelect: (id: string) => void;
}) {
  const Model = MODELS[section.id];
  return (
    <group position={section.position}>
      <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.25}>
        <group
          onClick={(e) => {
            e.stopPropagation();
            onSelect(section.id);
          }}
          onPointerOver={() => (document.body.style.cursor = "pointer")}
          onPointerOut={() => (document.body.style.cursor = "auto")}
        >
          <Model />
        </group>
      </Float>
    </group>
  );
}

type LabelRefs = React.RefObject<Record<string, HTMLButtonElement | null>>;

const labelWorldPos = new THREE.Vector3();

function positionLabels(
  refs: Record<string, HTMLButtonElement | null>,
  camera: THREE.Camera,
  size: { width: number; height: number },
  activeId: string | null
) {
  for (const s of SECTIONS) {
    const el = refs[s.id];
    if (!el) continue;
    labelWorldPos.set(s.position[0], s.position[1] - LABEL_OFFSET[s.id], s.position[2]);
    labelWorldPos.project(camera);
    const behind = labelWorldPos.z > 1;
    const hidden = behind || s.id === activeId;
    const x = (labelWorldPos.x * 0.5 + 0.5) * size.width;
    const y = (-labelWorldPos.y * 0.5 + 0.5) * size.height;
    el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
    el.style.opacity = hidden ? "0" : "1";
    el.style.pointerEvents = hidden ? "none" : "auto";
  }
}

/** Projects each section's label anchor to screen space and moves the DOM labels there. */
function LabelTracker({ labelRefs, activeId }: { labelRefs: LabelRefs; activeId: string | null }) {
  useFrame((state) => {
    if (labelRefs.current) {
      positionLabels(labelRefs.current, state.camera, state.size, activeId);
    }
  });

  return null;
}

function CameraRig({ activeId }: { activeId: string | null }) {
  const traveling = useRef(true);
  const prevId = useRef<string | null>("__init__");
  const camGoal = useRef(new THREE.Vector3());
  const lookGoal = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    const section = SECTIONS.find((s) => s.id === activeId) ?? null;

    if (prevId.current !== activeId) {
      prevId.current = activeId;
      traveling.current = true;
    }

    // portrait screens have a much narrower horizontal FOV — back the camera off proportionally
    const aspect = state.size.width / state.size.height;
    const distScale = aspect < 1 ? Math.min(2.1, 0.9 / aspect) : 1;

    if (section) {
      const pos = new THREE.Vector3(...section.position);
      const outward = pos.clone().normalize();
      const up = new THREE.Vector3(0, 1, 0);
      // approach from the side rather than from behind, so the sun-lit face stays visible
      const tangent = new THREE.Vector3().crossVectors(up, outward).normalize();
      const d = section.camDist * distScale;
      const offset = tangent
        .clone()
        .addScaledVector(outward, 0.55)
        .addScaledVector(up, 0.38)
        .normalize()
        .multiplyScalar(d);
      camGoal.current.copy(pos).add(offset);
      lookGoal.current.copy(pos);
      const viewDir = pos.clone().sub(camGoal.current).normalize();
      const right = new THREE.Vector3().crossVectors(viewDir, up).normalize();
      if (state.size.width >= 768) {
        // desktop: the info panel covers the right third — nudge the object left of center
        lookGoal.current.addScaledVector(right, d * 0.24);
      } else {
        // small screens: the info sheet covers the lower half — look lower so the object sits higher
        lookGoal.current.y -= section.camDist * 0.3;
      }
    } else {
      camGoal.current.copy(HOME_CAM).multiplyScalar(aspect < 1 ? 1.5 : 1);
      lookGoal.current.copy(HOME_TARGET);
    }

    const controls = state.controls as unknown as OrbitControlsImpl | null;

    if (traveling.current) {
      easing.damp3(state.camera.position, camGoal.current, 0.45, delta);
      if (state.camera.position.distanceTo(camGoal.current) < 0.15) {
        traveling.current = false;
      }
    }
    if (controls) {
      controls.enabled = !traveling.current;
      easing.damp3(controls.target, lookGoal.current, 0.4, delta);
      controls.update();
    }
  });

  return null;
}

export default function Scene({
  activeId,
  onSelect,
}: {
  activeId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const labelRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  return (
    <>
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: HOME_CAM.toArray(), fov: 50, near: 0.1, far: 400 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onPointerMissed={() => onSelect(null)}
    >
      <color attach="background" args={["#030014"]} />
      <ambientLight intensity={0.25} />
      <hemisphereLight args={["#9bb8ff", "#1a0f2e", 0.45]} />

      <Suspense fallback={null}>
        <Env />
        <MilkyWay />
        <Stars radius={140} depth={60} count={5000} factor={4} saturation={0.4} fade speed={0.4} />
        <Nebula />
        <Sun />
        {SECTIONS.map((s) => (
          <SectionAnchor key={s.id} section={s} onSelect={onSelect} />
        ))}
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.3} luminanceSmoothing={0.2} radius={0.75} />
          <Vignette eskil={false} offset={0.16} darkness={0.62} />
        </EffectComposer>
      </Suspense>

      <CameraRig activeId={activeId} />
      <LabelTracker labelRefs={labelRefs} activeId={activeId} />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={4}
        maxDistance={60}
        maxPolarAngle={Math.PI * 0.85}
        minPolarAngle={Math.PI * 0.12}
      />
    </Canvas>
    <div className="label-layer" aria-hidden={false}>
      {SECTIONS.map((s) => (
        <button
          key={s.id}
          ref={(el) => {
            labelRefs.current[s.id] = el;
          }}
          className="planet-label"
          style={{ "--accent": s.color, opacity: 0 } as React.CSSProperties}
          onClick={() => onSelect(s.id)}
        >
          {s.name}
        </button>
      ))}
    </div>
    </>
  );
}
