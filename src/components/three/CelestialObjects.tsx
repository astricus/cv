"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { makeFoilTexture, makeGlowTexture, makeSolarPanelTexture } from "./textures";
import { SECTIONS } from "@/data/sections";

function asColorMap(tex: THREE.Texture | THREE.Texture[]) {
  for (const t of Array.isArray(tex) ? tex : [tex]) {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
  }
}

/* ---------- About: Earth with real NASA-derived day map, clouds, atmosphere, moon ---------- */

export function Homeworld() {
  const planet = useRef<THREE.Mesh>(null);
  const clouds = useRef<THREE.Mesh>(null);
  const moonOrbit = useRef<THREE.Group>(null);

  const [dayMap, moonMap] = useTexture(
    ["/textures/earth_daymap.webp", "/textures/moon.webp"],
    asColorMap
  );
  const cloudMap = useTexture("/textures/earth_clouds.webp");

  useFrame((state, delta) => {
    if (planet.current) planet.current.rotation.y += delta * 0.05;
    if (clouds.current) clouds.current.rotation.y += delta * 0.075;
    if (moonOrbit.current) moonOrbit.current.rotation.y = state.clock.elapsedTime * 0.3;
  });

  return (
    <group rotation={[0, 0, 0.1]}>
      <mesh ref={planet}>
        <sphereGeometry args={[1.7, 64, 64]} />
        <meshStandardMaterial map={dayMap} roughness={0.75} metalness={0} />
      </mesh>
      <mesh ref={clouds}>
        <sphereGeometry args={[1.735, 64, 64]} />
        <meshStandardMaterial
          color="#ffffff"
          alphaMap={cloudMap}
          transparent
          opacity={0.9}
          depthWrite={false}
        />
      </mesh>
      {/* atmosphere rim */}
      <mesh scale={1.045}>
        <sphereGeometry args={[1.7, 48, 48]} />
        <meshBasicMaterial
          color="#6ab7ff"
          transparent
          opacity={0.07}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <group ref={moonOrbit}>
        <mesh position={[3.1, 0.4, 0]}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial map={moonMap} roughness={1} />
        </mesh>
      </group>
    </group>
  );
}

/* ---------- Experience: Saturn with the real ring system ---------- */

const RING_INNER = 3.4;
const RING_OUTER = 6.2;

export function GasGiant() {
  const planet = useRef<THREE.Mesh>(null);
  const moons = useRef<THREE.Group>(null);

  const [saturnMap, moonMap] = useTexture(
    ["/textures/saturn.webp", "/textures/moon.webp"],
    asColorMap
  );
  const ringMap = useTexture("/textures/saturn_ring_alpha.webp", asColorMap);

  // the ring texture is a radial strip: remap UVs so u runs along the ring's radius
  const ringGeo = useMemo(() => {
    const geo = new THREE.RingGeometry(RING_INNER, RING_OUTER, 160, 1);
    const pos = geo.attributes.position;
    const uv = geo.attributes.uv;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const r = (v.length() - RING_INNER) / (RING_OUTER - RING_INNER);
      uv.setXY(i, r, 0.5);
    }
    return geo;
  }, []);

  useFrame((state, delta) => {
    if (planet.current) planet.current.rotation.y += delta * 0.06;
    if (moons.current) moons.current.rotation.y = state.clock.elapsedTime * 0.25;
  });

  return (
    <group rotation={[0.18, 0, -0.28]}>
      <mesh ref={planet}>
        <sphereGeometry args={[2.7, 64, 64]} />
        <meshStandardMaterial map={saturnMap} roughness={0.9} />
      </mesh>
      <mesh geometry={ringGeo} rotation={[-Math.PI / 2, 0, 0]}>
        <meshBasicMaterial
          map={ringMap}
          transparent
          opacity={0.95}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <group ref={moons}>
        <mesh position={[7, 0.3, 0]}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial map={moonMap} color="#d8c9a8" roughness={1} />
        </mesh>
        <mesh position={[-5.6, -0.5, 3.8]}>
          <sphereGeometry args={[0.2, 24, 24]} />
          <meshStandardMaterial map={moonMap} color="#a89880" roughness={1} />
        </mesh>
      </group>
    </group>
  );
}

/* ---------- Skills: ISS-style station — truss, module stack, paired solar arrays, radiators ---------- */

const MODULE_WHITE = "#dfe3e8";
const METAL_GRAY = "#9aa3ad";

function SolarArrayPair({
  x,
  tilt,
  panelTex,
}: {
  x: number;
  tilt: number;
  panelTex: THREE.Texture;
}) {
  return (
    <group position={[x, 0, 0]} rotation={[tilt, 0, 0]}>
      {([1, -1] as const).map((side) => (
        <group key={side}>
          {/* mast */}
          <mesh position={[0, 0, side * 0.75]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 1.5, 8]} />
            <meshStandardMaterial color={METAL_GRAY} metalness={0.85} roughness={0.35} />
          </mesh>
          {/* blanket */}
          <mesh position={[0, 0, side * 1.75]}>
            <boxGeometry args={[0.98, 0.025, 2.1]} />
            <meshStandardMaterial
              map={panelTex}
              color="#ffffff"
              metalness={0.45}
              roughness={0.35}
              emissive="#122a66"
              emissiveIntensity={0.25}
            />
          </mesh>
          {/* panel frame tip */}
          <mesh position={[0, 0, side * 2.82]}>
            <boxGeometry args={[1.0, 0.05, 0.06]} />
            <meshStandardMaterial color={METAL_GRAY} metalness={0.85} roughness={0.35} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function OrbitalStation() {
  const station = useRef<THREE.Group>(null);
  const arrays = useRef<THREE.Group>(null);
  const beacon = useRef<THREE.MeshStandardMaterial>(null);

  const panelTex = useMemo(() => makeSolarPanelTexture(1, 2), []);

  useFrame((state, delta) => {
    if (station.current) station.current.rotation.y += delta * 0.05;
    if (arrays.current) arrays.current.rotation.x += delta * 0.08;
    if (beacon.current)
      beacon.current.emissiveIntensity = 2 + Math.sin(state.clock.elapsedTime * 4) * 1.8;
  });

  return (
    <group ref={station} rotation={[0.3, 0.5, 0.08]}>
      {/* main truss */}
      <mesh>
        <boxGeometry args={[6.4, 0.16, 0.16]} />
        <meshStandardMaterial color={METAL_GRAY} metalness={0.8} roughness={0.4} />
      </mesh>
      {/* truss lattice nodes */}
      {[-2.8, -2, -1.2, 1.2, 2, 2.8].map((x) => (
        <mesh key={x} position={[x, 0, 0]}>
          <boxGeometry args={[0.22, 0.26, 0.26]} />
          <meshStandardMaterial color="#7d868f" metalness={0.8} roughness={0.45} />
        </mesh>
      ))}
      {/* rotating solar array pairs on the truss */}
      <group ref={arrays}>
        <SolarArrayPair x={-2.9} tilt={0.15} panelTex={panelTex} />
        <SolarArrayPair x={-1.75} tilt={0.15} panelTex={panelTex} />
        <SolarArrayPair x={1.75} tilt={-0.1} panelTex={panelTex} />
        <SolarArrayPair x={2.9} tilt={-0.1} panelTex={panelTex} />
      </group>
      {/* pressurized module stack, perpendicular to the truss */}
      <group>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.34, 0.34, 2.9, 24]} />
          <meshStandardMaterial color={MODULE_WHITE} metalness={0.15} roughness={0.5} />
        </mesh>
        {/* module ribs */}
        {[-1.05, -0.35, 0.35, 1.05].map((z) => (
          <mesh key={z} position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.36, 0.36, 0.1, 24]} />
            <meshStandardMaterial color="#b9bec6" metalness={0.4} roughness={0.45} />
          </mesh>
        ))}
        {/* lab module along the truss axis */}
        <mesh position={[0.65, 0, 0.6]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.28, 0.28, 1.3, 20]} />
          <meshStandardMaterial color={MODULE_WHITE} metalness={0.15} roughness={0.5} />
        </mesh>
        {/* node sphere + cupola */}
        <mesh position={[0, 0, 1.45]}>
          <sphereGeometry args={[0.36, 24, 24]} />
          <meshStandardMaterial color="#c9ced5" metalness={0.3} roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.28, 1.52]}>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshStandardMaterial color="#1c2733" metalness={0.2} roughness={0.2} />
        </mesh>
        {/* docking cone */}
        <mesh position={[0, 0, -1.62]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.22, 0.35, 16, 1, true]} />
          <meshStandardMaterial color="#8d969f" metalness={0.7} roughness={0.35} side={THREE.DoubleSide} />
        </mesh>
      </group>
      {/* radiators */}
      {([1, -1] as const).map((side) => (
        <mesh key={side} position={[side * 0.75, -0.75, -0.3]} rotation={[0.9, 0, 0]}>
          <boxGeometry args={[0.6, 0.02, 1.5]} />
          <meshStandardMaterial color="#e8ebee" metalness={0.1} roughness={0.75} />
        </mesh>
      ))}
      {/* dish + beacon */}
      <group position={[-0.6, 0.45, 1.1]} rotation={[-0.7, 0.4, 0]}>
        <mesh>
          <sphereGeometry args={[0.22, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2.4]} />
          <meshStandardMaterial color="#d9dde3" metalness={0.75} roughness={0.3} side={THREE.DoubleSide} />
        </mesh>
      </group>
      <mesh position={[0, 0.55, 1.45]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial ref={beacon} color="#f87171" emissive="#ef4444" emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

/* ---------- Education: comet — lumpy nucleus, glowing coma, ion + dust tails ---------- */

// tail points away from the sun (which sits at the origin)
const EDUCATION_POS = SECTIONS.find((s) => s.id === "education")!.position;
const TAIL_DIR = new THREE.Vector3(...EDUCATION_POS).normalize();
const TAIL_PERP = new THREE.Vector3().crossVectors(TAIL_DIR, new THREE.Vector3(0, 1, 0)).normalize();

function bumps(v: THREE.Vector3) {
  return (
    (Math.sin(v.x * 3.3 + 1.7) * 0.5 +
      Math.sin(v.y * 5.1 + 0.4) * 0.3 +
      Math.sin(v.z * 4.2 + 2.6) * 0.4 +
      Math.sin((v.x + v.y) * 6.3) * 0.25 +
      Math.sin((v.y + v.z) * 7.7) * 0.2) /
    1.65
  );
}

function makeNucleusGeometry() {
  const geo = new THREE.SphereGeometry(0.55, 48, 36);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const scale = 1 + bumps(v) * 0.16;
    pos.setXYZ(i, v.x * scale, v.y * scale, v.z * scale);
  }
  geo.computeVertexNormals();
  return geo;
}

function makeTailGeometry(opts: {
  count: number;
  length: number;
  spread: number;
  curve: number;
  from: THREE.Color;
  to: THREE.Color;
}) {
  const positions = new Float32Array(opts.count * 3);
  const colors = new Float32Array(opts.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < opts.count; i++) {
    const t = Math.pow(Math.random(), 2.1); // much denser near the nucleus
    const spread = 0.1 + t * opts.spread;
    const x =
      TAIL_DIR.x * (0.15 + t * opts.length) +
      TAIL_PERP.x * t * t * opts.curve +
      (Math.random() - 0.5) * 2 * spread;
    const y =
      TAIL_DIR.y * (0.15 + t * opts.length) +
      TAIL_PERP.y * t * t * opts.curve +
      (Math.random() - 0.5) * 2 * spread;
    const z =
      TAIL_DIR.z * (0.15 + t * opts.length) +
      TAIL_PERP.z * t * t * opts.curve +
      (Math.random() - 0.5) * 2 * spread;
    positions.set([x, y, z], i * 3);
    c.copy(opts.from).lerp(opts.to, Math.sqrt(t));
    const fade = 1 - t * 0.8;
    colors.set([c.r * fade, c.g * fade, c.b * fade], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geo;
}

export function Comet() {
  const nucleus = useRef<THREE.Mesh>(null);
  const ionMat = useRef<THREE.PointsMaterial>(null);

  const moonMap = useTexture("/textures/moon.webp", asColorMap);
  const nucleusGeo = useMemo(() => makeNucleusGeometry(), []);
  const ionTail = useMemo(
    () =>
      makeTailGeometry({
        count: 1400,
        length: 15,
        spread: 0.7,
        curve: 0,
        from: new THREE.Color("#ffffff"),
        to: new THREE.Color("#3d7dff"),
      }),
    []
  );
  const dustTail = useMemo(
    () =>
      makeTailGeometry({
        count: 800,
        length: 10,
        spread: 1.1,
        curve: 3,
        from: new THREE.Color("#fff6e6"),
        to: new THREE.Color("#c9a876"),
      }),
    []
  );
  const coma = useMemo(() => makeGlowTexture("rgba(190,225,255,0.9)"), []);
  const particle = useMemo(() => makeGlowTexture("rgba(255,255,255,1)"), []);

  useFrame((state, delta) => {
    if (nucleus.current) {
      nucleus.current.rotation.y += delta * 0.25;
      nucleus.current.rotation.x += delta * 0.07;
    }
    if (ionMat.current)
      ionMat.current.opacity = 0.8 + Math.sin(state.clock.elapsedTime * 2.1) * 0.12;
  });

  return (
    <group>
      <mesh ref={nucleus} geometry={nucleusGeo}>
        <meshStandardMaterial map={moonMap} color="#cdd4da" roughness={0.85} />
      </mesh>
      {/* inner coma: tight bright core around the nucleus */}
      <sprite scale={[2.4, 2.4, 1]}>
        <spriteMaterial
          map={coma}
          transparent
          opacity={0.95}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      {/* outer coma halo */}
      <sprite scale={[7, 7, 1]}>
        <spriteMaterial
          map={coma}
          transparent
          opacity={0.4}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      {/* sublimating dust around the head */}
      <Sparkles count={70} scale={3} size={2.5} speed={0.6} color="#dff1ff" />
      <pointLight intensity={10} distance={8} decay={2} color="#bfe0ff" />
      {/* ion tail */}
      <points geometry={ionTail}>
        <pointsMaterial
          ref={ionMat}
          map={particle}
          size={0.35}
          vertexColors
          transparent
          opacity={0.85}
          depthWrite={false}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
      {/* dust tail */}
      <points geometry={dustTail}>
        <pointsMaterial
          map={particle}
          size={0.3}
          vertexColors
          transparent
          opacity={0.5}
          depthWrite={false}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

/* ---------- Contact: communications satellite — body, dish, panels, beacon ---------- */

function makeDishGeometry() {
  // parabolic reflector profile
  const points: THREE.Vector2[] = [];
  const steps = 18;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    points.push(new THREE.Vector2(t * 0.72, t * t * 0.3));
  }
  return new THREE.LatheGeometry(points, 40);
}

export function CommsSatellite() {
  const group = useRef<THREE.Group>(null);
  const beacon = useRef<THREE.MeshStandardMaterial>(null);

  const foilTex = useMemo(() => makeFoilTexture(), []);
  const panelTex = useMemo(() => makeSolarPanelTexture(1, 1), []);
  const dishGeo = useMemo(() => makeDishGeometry(), []);

  useFrame((state, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.18;
    if (beacon.current)
      beacon.current.emissiveIntensity = 1.5 + Math.sin(state.clock.elapsedTime * 5) * 1.4;
  });

  return (
    <group ref={group} rotation={[0.15, 0, 0.1]}>
      {/* bus wrapped in gold MLI foil */}
      <mesh>
        <boxGeometry args={[0.72, 0.72, 1.15]} />
        <meshStandardMaterial
          map={foilTex}
          bumpMap={foilTex}
          bumpScale={1.6}
          color="#e8bf62"
          metalness={0.85}
          roughness={0.38}
        />
      </mesh>
      {/* bus edge frames */}
      {([0.58, -0.58] as const).map((z) => (
        <mesh key={z} position={[0, 0, z]}>
          <boxGeometry args={[0.74, 0.74, 0.04]} />
          <meshStandardMaterial color="#6b7280" metalness={0.85} roughness={0.3} />
        </mesh>
      ))}
      {/* parabolic dish on top, pointed off-axis */}
      <group position={[0, 0.62, 0.15]} rotation={[-0.75, 0, 0]}>
        <mesh geometry={dishGeo}>
          <meshStandardMaterial
            color="#eef1f5"
            metalness={0.7}
            roughness={0.22}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* dish rim ring */}
        <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.72, 0.016, 10, 48]} />
          <meshStandardMaterial color="#aab2bc" metalness={0.85} roughness={0.3} />
        </mesh>
        {/* feed horn on tripod struts */}
        {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((a) => (
          <mesh
            key={a}
            position={[Math.cos(a) * 0.3, 0.32, Math.sin(a) * 0.3]}
            rotation={[Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5]}
          >
            <cylinderGeometry args={[0.012, 0.012, 0.62, 6]} />
            <meshStandardMaterial color="#8a929c" metalness={0.85} roughness={0.35} />
          </mesh>
        ))}
        <mesh position={[0, 0.58, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.08, 0.16, 16]} />
          <meshStandardMaterial color="#d2d7dd" metalness={0.75} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.68, 0]}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshStandardMaterial ref={beacon} color="#6ee7b7" emissive="#34d399" emissiveIntensity={1.5} />
        </mesh>
      </group>
      {/* segmented solar wings on yokes */}
      {([1, -1] as const).map((side) => (
        <group key={side}>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[side * 0.56, 0, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.42, 8]} />
            <meshStandardMaterial color="#8b93a3" metalness={0.85} roughness={0.35} />
          </mesh>
          {[0, 1, 2].map((seg) => (
            <mesh key={seg} position={[side * (1.22 + seg * 0.92), 0, 0]} rotation={[0.12, 0, 0]}>
              <boxGeometry args={[0.84, 0.022, 0.95]} />
              <meshStandardMaterial
                map={panelTex}
                color="#ffffff"
                metalness={0.45}
                roughness={0.32}
                emissive="#122a66"
                emissiveIntensity={0.22}
              />
            </mesh>
          ))}
          {/* hinges between segments */}
          {[0, 1].map((h) => (
            <mesh
              key={h}
              position={[side * (1.68 + h * 0.92), 0, 0]}
              rotation={[Math.PI / 2 + 0.12, 0, 0]}
            >
              <cylinderGeometry args={[0.02, 0.02, 0.9, 8]} />
              <meshStandardMaterial color="#6b7280" metalness={0.85} roughness={0.3} />
            </mesh>
          ))}
        </group>
      ))}
      {/* thruster nozzle */}
      <mesh position={[0, 0, -0.72]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.14, 0.26, 20, 1, true]} />
        <meshStandardMaterial color="#3a3f46" metalness={0.9} roughness={0.35} side={THREE.DoubleSide} />
      </mesh>
      {/* omni antennas */}
      {([0.22, -0.22] as const).map((x) => (
        <group key={x} position={[x, 0.42, -0.4]}>
          <mesh>
            <cylinderGeometry args={[0.008, 0.008, 0.5, 6]} />
            <meshStandardMaterial color="#aab2bc" metalness={0.8} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.27, 0]}>
            <sphereGeometry args={[0.022, 8, 8]} />
            <meshStandardMaterial color="#d2d7dd" metalness={0.6} roughness={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
