"use client";

import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import type { Group } from "three";
import { Box, Compass, RotateCcw } from "lucide-react";

type ModelKind =
  | "panda"
  | "tiger"
  | "snub-monkey"
  | "milu"
  | "antelope"
  | "horse"
  | "yak"
  | "takin"
  | "pheasant"
  | "ibis"
  | "salamander"
  | "crocodile"
  | "dolphin"
  | "elephant"
  | "giraffe"
  | "bird"
  | "whale"
  | "gorilla"
  | "rhino"
  | "shark"
  | "penguin"
  | "deer";

export const SLUG_TO_MODEL: Record<string, ModelKind> = {
  "giant-panda": "panda",
  "chinese-alligator": "crocodile",
  milu: "milu",
  "sichuan-snub-nosed-monkey": "snub-monkey",
  "yunnan-snub-nosed-monkey": "snub-monkey",
  "guizhou-snub-nosed-monkey": "snub-monkey",
  "hainan-gibbon": "snub-monkey",
  "south-china-tiger": "tiger",
  "przewalski-gazelle": "antelope",
  "tibetan-antelope": "antelope",
  "brown-eared-pheasant": "pheasant",
  "chinese-monal": "pheasant",
  "chinese-giant-salamander": "salamander",
  baiji: "dolphin",
};

export function modelForSlug(slug: string, group?: string): ModelKind {
  if (SLUG_TO_MODEL[slug]) return SLUG_TO_MODEL[slug];
  if (group === "amphibian") return "salamander";
  if (group === "bird") return "pheasant";
  if (group === "reptile") return "crocodile";
  if (group === "fish") return "dolphin";
  return "panda";
}



function Panda() {
  return (
    <group>
      <mesh position={[0, 0.35, 0]} scale={[1, 0.9, 0.9]}>
        <sphereGeometry args={[0.95, 48, 48]} />
        <meshStandardMaterial color="#EDE8DC" roughness={0.9} />
      </mesh>
      <mesh position={[0.9, 1.05, 0]} scale={[0.72, 0.7, 0.7]}>
        <sphereGeometry args={[0.85, 42, 42]} />
        <meshStandardMaterial color="#EDE8DC" roughness={0.9} />
      </mesh>
      {[0.45, -0.45].map((z) => (
        <mesh key={z} position={[0.85, 1.55, z]} scale={[0.28, 0.28, 0.12]}>
          <sphereGeometry args={[0.55, 24, 24]} />
          <meshStandardMaterial color="#141C18" roughness={0.95} />
        </mesh>
      ))}
      {[0.26, -0.26].map((z) => (
        <mesh key={`patch-${z}`} position={[1.32, 1.1, z]} rotation={[0, z > 0 ? -0.3 : 0.3, 0.4]} scale={[0.24, 0.32, 0.06]}>
          <sphereGeometry args={[0.6, 24, 24]} />
          <meshStandardMaterial color="#141C18" roughness={0.95} />
        </mesh>
      ))}
      <mesh position={[1.48, 0.92, 0]} scale={[0.16, 0.12, 0.15]}>
        <sphereGeometry args={[0.7, 20, 20]} />
        <meshStandardMaterial color="#141C18" roughness={0.95} />
      </mesh>
      {[
        [0.45, 0.42],
        [-0.45, 0.42],
        [0.45, -0.42],
        [-0.45, -0.42],
      ].map(([x, z], i) => (
        <mesh key={`p-leg-${i}`} position={[x, -0.55, z]}>
          <cylinderGeometry args={[0.16, 0.2, 0.7, 18]} />
          <meshStandardMaterial color="#141C18" roughness={0.95} />
        </mesh>
      ))}
      <mesh position={[-0.95, 0.6, 0]} rotation={[0, 0, 0.6]}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial color="#141C18" roughness={0.95} />
      </mesh>
    </group>
  );
}












function Crocodile() {
  return (
    <group scale={0.9}>
      <mesh position={[0, 0.2, 0]} scale={[1.6, 0.28, 0.42]}>
        <sphereGeometry args={[0.9, 36, 36]} />
        <meshStandardMaterial color="#5F6B48" roughness={0.9} />
      </mesh>
      <mesh position={[1.5, 0.15, 0]} scale={[0.8, 0.18, 0.3]}>
        <sphereGeometry args={[0.8, 30, 30]} />
        <meshStandardMaterial color="#66734E" roughness={0.9} />
      </mesh>
      <mesh position={[-1.6, 0.12, 0]} rotation={[0, 0, 0.1]} scale={[1.1, 0.18, 0.3]}>
        <coneGeometry args={[0.85, 1.5, 5]} />
        <meshStandardMaterial color="#5A6645" roughness={0.9} />
      </mesh>
      {[0.16, -0.16].map((z) => (
        <mesh key={`c-eye-${z}`} position={[1.95, 0.38, z]}>
          <sphereGeometry args={[0.055, 12, 12]} />
          <meshStandardMaterial color="#C29B4A" />
        </mesh>
      ))}
      {[
        [0.8, 0.3],
        [0.8, -0.3],
        [-0.8, 0.3],
        [-0.8, -0.3],
      ].map(([x, z], i) => (
        <mesh key={`c-leg-${i}`} position={[x, -0.25, z]} rotation={[0, 0, 0.5]}>
          <cylinderGeometry args={[0.09, 0.11, 0.55, 10]} />
          <meshStandardMaterial color="#4F5A3C" />
        </mesh>
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={`scute-${i}`} position={[-0.9 + i * 0.36, 0.45, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.14, 0.14, 0.42]} />
          <meshStandardMaterial color="#4F5A3C" />
        </mesh>
      ))}
    </group>
  );
}



function Dolphin() {
  return (
    <group scale={0.95}>
      <mesh position={[0, 0.3, 0]} scale={[1.5, 0.42, 0.42]}>
        <sphereGeometry args={[0.9, 44, 44]} />
        <meshStandardMaterial color="#7C9AA6" roughness={0.55} />
      </mesh>
      <mesh position={[1.5, 0.28, 0]} rotation={[0, 0, -Math.PI / 2]} scale={[0.35, 0.55, 0.4]}>
        <coneGeometry args={[0.3, 0.75, 24]} />
        <meshStandardMaterial color="#88A5B0" roughness={0.55} />
      </mesh>
      <mesh position={[0.25, 0.82, 0]} rotation={[0, 0, 0.35]}>
        <coneGeometry args={[0.26, 0.52, 3]} />
        <meshStandardMaterial color="#6B8793" roughness={0.6} />
      </mesh>
      {[0.4, -0.4].map((z) => (
        <mesh
          key={`d-tail-${z}`}
          position={[-1.5, 0.28, z * 0.3]}
          rotation={[0, 0, Math.PI / 2 + z * 0.25]}
          scale={[0.75, 0.5, 0.3]}
        >
          <coneGeometry args={[0.4, 0.66, 3]} />
          <meshStandardMaterial color="#6B8793" roughness={0.6} />
        </mesh>
      ))}
      {[0.5, -0.5].map((z) => (
        <mesh key={`d-fin-${z}`} position={[0.2, 0.05, z]} rotation={[z > 0 ? 0.3 : -0.3, 0, 0.25]}>
          <coneGeometry args={[0.18, 0.5, 3]} />
          <meshStandardMaterial color="#6B8793" roughness={0.65} />
        </mesh>
      ))}
      {[0.26, -0.26].map((z) => (
        <mesh key={`d-eye-${z}`} position={[1.1, 0.38, z]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial color="#101820" />
        </mesh>
      ))}
    </group>
  );
}





function Tiger() {
  return (
    <group>
      <mesh position={[0, 0.55, 0]} scale={[1.35, 0.72, 0.6]}>
        <sphereGeometry args={[0.9, 40, 40]} />
        <meshStandardMaterial color="#C97A3C" roughness={0.9} />
      </mesh>
      <mesh position={[1.28, 0.92, 0]} scale={[0.6, 0.58, 0.55]}>
        <sphereGeometry args={[0.8, 36, 36]} />
        <meshStandardMaterial color="#D08A4A" roughness={0.9} />
      </mesh>
      {[0.3, -0.3].map((z) => (
        <mesh key={`t-ear-${z}`} position={[1.3, 1.46, z]} rotation={[0, 0, z > 0 ? 0.4 : -0.4]}>
          <coneGeometry args={[0.12, 0.18, 12]} />
          <meshStandardMaterial color="#8C4C22" roughness={0.95} />
        </mesh>
      ))}
      {[-0.9, -0.45, 0, 0.45, 0.9].map((x, i) => (
        <mesh key={`t-stripe-${i}`} position={[x, 0.98, 0]} rotation={[0, 0, 0.05]}>
          <boxGeometry args={[0.06, 0.34, 1.05]} />
          <meshStandardMaterial color="#1B1712" roughness={0.95} />
        </mesh>
      ))}
      {[
        [0.65, 0.3],
        [0.65, -0.3],
        [-0.7, 0.3],
        [-0.7, -0.3],
      ].map(([x, z], i) => (
        <mesh key={`t-leg-${i}`} position={[x, -0.35, z]}>
          <cylinderGeometry args={[0.16, 0.19, 0.9, 16]} />
          <meshStandardMaterial color="#C97A3C" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[-1.4, 0.45, 0]} rotation={[0, 0, 0.5]}>
        <cylinderGeometry args={[0.06, 0.09, 1.0, 12]} />
        <meshStandardMaterial color="#C97A3C" roughness={0.9} />
      </mesh>
      {[0.2, -0.2].map((z) => (
        <mesh key={`t-eye-${z}`} position={[1.55, 1.02, z]}>
          <sphereGeometry args={[0.04, 10, 10]} />
          <meshStandardMaterial color="#141C18" />
        </mesh>
      ))}
    </group>
  );
}

function SnubMonkey() {
  return (
    <group scale={0.8}>
      <mesh position={[0, 0.55, 0]} scale={[0.85, 1.0, 0.62]}>
        <sphereGeometry args={[0.9, 40, 40]} />
        <meshStandardMaterial color="#C7A55E" roughness={0.95} />
      </mesh>
      <mesh position={[0.1, 1.5, 0]} scale={[0.5, 0.52, 0.5]}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial color="#D9B86C" roughness={0.95} />
      </mesh>
      <mesh position={[0.5, 1.42, 0]} scale={[0.28, 0.3, 0.3]}>
        <sphereGeometry args={[0.7, 28, 28]} />
        <meshStandardMaterial color="#6E8FA3" roughness={0.85} />
      </mesh>
      {[0.13, -0.13].map((z) => (
        <mesh key={`m-eye-${z}`} position={[0.68, 1.5, z]}>
          <sphereGeometry args={[0.035, 10, 10]} />
          <meshStandardMaterial color="#101820" />
        </mesh>
      ))}
      {[0.6, -0.6].map((z) => (
        <mesh key={`m-arm-${z}`} position={[0.3, 0.7, z]} rotation={[0, 0, -0.2]}>
          <cylinderGeometry args={[0.11, 0.14, 1.3, 14]} />
          <meshStandardMaterial color="#B89553" roughness={0.95} />
        </mesh>
      ))}
      <mesh position={[-0.85, 0.9, 0]} rotation={[0, 0, 1.1]}>
        <cylinderGeometry args={[0.05, 0.07, 1.5, 12]} />
        <meshStandardMaterial color="#C7A55E" roughness={0.95} />
      </mesh>
    </group>
  );
}

function Milu() {
  return (
    <group scale={0.75} position={[0, -0.1, 0]}>
      <mesh position={[0, 0.35, 0]} scale={[1.1, 0.6, 0.5]}>
        <sphereGeometry args={[0.9, 40, 40]} />
        <meshStandardMaterial color="#9C6B45" roughness={0.9} />
      </mesh>
      <mesh position={[0.95, 0.95, 0]} rotation={[0, 0, -0.5]}>
        <cylinderGeometry args={[0.13, 0.18, 0.95, 16]} />
        <meshStandardMaterial color="#9C6B45" roughness={0.9} />
      </mesh>
      <mesh position={[1.32, 1.45, 0]} scale={[0.38, 0.3, 0.26]}>
        <sphereGeometry args={[0.7, 30, 30]} />
        <meshStandardMaterial color="#A97A52" roughness={0.9} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={`milu-antler-${side}`} position={[1.28, 1.68, side * 0.1]}>
          <mesh rotation={[side * 0.4, 0, -0.2]}>
            <cylinderGeometry args={[0.03, 0.045, 0.5, 8]} />
            <meshStandardMaterial color="#7A6547" />
          </mesh>
          <mesh position={[-0.14, 0.3, side * 0.12]} rotation={[side * 0.6, 0, 0.6]}>
            <cylinderGeometry args={[0.025, 0.035, 0.34, 8]} />
            <meshStandardMaterial color="#7A6547" />
          </mesh>
        </group>
      ))}
      {[
        [0.55, 0.3],
        [0.55, -0.3],
        [-0.55, 0.3],
        [-0.55, -0.3],
      ].map(([x, z], i) => (
        <mesh key={`milu-leg-${i}`} position={[x, -0.3, z]}>
          <cylinderGeometry args={[0.06, 0.08, 0.95, 12]} />
          <meshStandardMaterial color="#8E6746" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[-1.15, 0.55, 0]} rotation={[0, 0, 0.9]}>
        <cylinderGeometry args={[0.03, 0.06, 0.85, 10]} />
        <meshStandardMaterial color="#8E6746" />
      </mesh>
    </group>
  );
}

function Antelope() {
  return (
    <group scale={0.72} position={[0, -0.2, 0]}>
      <mesh position={[0, 0.45, 0]} scale={[1.05, 0.55, 0.45]}>
        <sphereGeometry args={[0.9, 38, 38]} />
        <meshStandardMaterial color="#C4A06A" roughness={0.9} />
      </mesh>
      <mesh position={[0.92, 1.02, 0]} rotation={[0, 0, -0.55]}>
        <cylinderGeometry args={[0.1, 0.15, 1.0, 14]} />
        <meshStandardMaterial color="#C4A06A" roughness={0.9} />
      </mesh>
      <mesh position={[1.3, 1.52, 0]} scale={[0.34, 0.28, 0.24]}>
        <sphereGeometry args={[0.7, 30, 30]} />
        <meshStandardMaterial color="#CBAF78" roughness={0.9} />
      </mesh>
      {[0.1, -0.1].map((z) => (
        <mesh key={`a-horn-${z}`} position={[1.28, 1.8, z]} rotation={[z > 0 ? 0.22 : -0.22, 0, 0.1]}>
          <cylinderGeometry args={[0.025, 0.04, 0.45, 10]} />
          <meshStandardMaterial color="#5B4A34" />
        </mesh>
      ))}
      {[
        [0.5, 0.26],
        [0.5, -0.26],
        [-0.5, 0.26],
        [-0.5, -0.26],
      ].map(([x, z], i) => (
        <mesh key={`a-leg-${i}`} position={[x, -0.35, z]}>
          <cylinderGeometry args={[0.05, 0.07, 1.0, 12]} />
          <meshStandardMaterial color="#A98B5B" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function Horse() {
  return (
    <group scale={0.72} position={[0, -0.25, 0]}>
      <mesh position={[0, 0.55, 0]} scale={[1.15, 0.6, 0.48]}>
        <sphereGeometry args={[0.9, 40, 40]} />
        <meshStandardMaterial color="#8A5A3B" roughness={0.9} />
      </mesh>
      <mesh position={[0.85, 1.35, 0]} rotation={[0, 0, -0.35]}>
        <cylinderGeometry args={[0.14, 0.24, 1.25, 16]} />
        <meshStandardMaterial color="#8A5A3B" roughness={0.9} />
      </mesh>
      <mesh position={[1.18, 2.0, 0]} rotation={[0, 0, -1.15]} scale={[0.3, 0.42, 0.24]}>
        <sphereGeometry args={[0.7, 30, 30]} />
        <meshStandardMaterial color="#8A5A3B" roughness={0.9} />
      </mesh>
      <mesh position={[0.72, 1.55, 0]} rotation={[0, 0, -0.3]} scale={[0.08, 0.5, 0.1]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#2E2118" roughness={0.95} />
      </mesh>
      {[0.26, -0.26].map((z) => (
        <mesh key={`h-ear-${z}`} position={[1.12, 2.3, z]} rotation={[z > 0 ? 0.3 : -0.3, 0, 0]}>
          <coneGeometry args={[0.07, 0.2, 10]} />
          <meshStandardMaterial color="#7A4E32" />
        </mesh>
      ))}
      {[
        [0.55, 0.3],
        [0.55, -0.3],
        [-0.55, 0.3],
        [-0.55, -0.3],
      ].map(([x, z], i) => (
        <mesh key={`h-leg-${i}`} position={[x, -0.5, z]}>
          <cylinderGeometry args={[0.08, 0.1, 1.2, 12]} />
          <meshStandardMaterial color="#7A4E32" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[-1.15, 0.85, 0]} rotation={[0, 0, 0.9]}>
        <cylinderGeometry args={[0.04, 0.08, 0.85, 10]} />
        <meshStandardMaterial color="#2E2118" />
      </mesh>
    </group>
  );
}

function Yak() {
  return (
    <group scale={0.7} position={[0, -0.1, 0]}>
      <mesh position={[0, 0.55, 0]} scale={[1.3, 0.8, 0.85]}>
        <sphereGeometry args={[0.9, 40, 40]} />
        <meshStandardMaterial color="#3A322B" roughness={0.95} />
      </mesh>
      <mesh position={[1.25, 0.85, 0]} scale={[0.55, 0.52, 0.5]}>
        <sphereGeometry args={[0.8, 34, 34]} />
        <meshStandardMaterial color="#332C25" roughness={0.95} />
      </mesh>
      {[0.32, -0.32].map((z) => (
        <mesh key={`y-horn-${z}`} position={[1.3, 1.22, z]} rotation={[z > 0 ? 0.9 : -0.9, 0, 0.2]}>
          <coneGeometry args={[0.05, 0.42, 12]} />
          <meshStandardMaterial color="#C9B896" roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, 0.05, 0]} scale={[1.35, 0.42, 0.92]}>
        <sphereGeometry args={[0.9, 32, 32]} />
        <meshStandardMaterial color="#2B241E" roughness={0.98} />
      </mesh>
      {[
        [0.6, 0.4],
        [0.6, -0.4],
        [-0.6, 0.4],
        [-0.6, -0.4],
      ].map(([x, z], i) => (
        <mesh key={`y-leg-${i}`} position={[x, -0.45, z]}>
          <cylinderGeometry args={[0.18, 0.22, 0.95, 14]} />
          <meshStandardMaterial color="#2B241E" roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

function Takin() {
  return (
    <group scale={0.78} position={[0, -0.1, 0]}>
      <mesh position={[0, 0.5, 0]} scale={[1.15, 0.8, 0.66]}>
        <sphereGeometry args={[0.9, 40, 40]} />
        <meshStandardMaterial color="#B79A5E" roughness={0.95} />
      </mesh>
      <mesh position={[1.05, 0.95, 0]} scale={[0.55, 0.55, 0.5]}>
        <sphereGeometry args={[0.8, 34, 34]} />
        <meshStandardMaterial color="#A98D53" roughness={0.95} />
      </mesh>
      {[0.28, -0.28].map((z) => (
        <mesh key={`k-horn-${z}`} position={[1.05, 1.36, z]} rotation={[z > 0 ? 0.5 : -0.5, 0, 0]}>
          <coneGeometry args={[0.06, 0.3, 12]} />
          <meshStandardMaterial color="#4B4234" />
        </mesh>
      ))}
      <mesh position={[0, 1.25, 0]} rotation={[0, 0, 0.1]} scale={[0.5, 0.12, 0.4]}>
        <sphereGeometry args={[0.8, 24, 24]} />
        <meshStandardMaterial color="#8E7544" roughness={0.95} />
      </mesh>
      {[
        [0.55, 0.32],
        [0.55, -0.32],
        [-0.55, 0.32],
        [-0.55, -0.32],
      ].map(([x, z], i) => (
        <mesh key={`k-leg-${i}`} position={[x, -0.4, z]}>
          <cylinderGeometry args={[0.14, 0.17, 0.95, 14]} />
          <meshStandardMaterial color="#8E7544" roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

function Pheasant() {
  return (
    <group scale={0.8} position={[0, -0.1, 0]}>
      <mesh position={[0, 0.4, 0]} scale={[0.9, 0.7, 0.55]}>
        <sphereGeometry args={[0.85, 38, 38]} />
        <meshStandardMaterial color="#8C4A2F" roughness={0.9} />
      </mesh>
      <mesh position={[0.7, 0.95, 0]} scale={[0.45, 0.45, 0.4]}>
        <sphereGeometry args={[0.75, 30, 30]} />
        <meshStandardMaterial color="#C0392B" roughness={0.85} />
      </mesh>
      <mesh position={[1.05, 0.9, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.07, 0.3, 12]} />
        <meshStandardMaterial color="#D9C36A" roughness={0.6} />
      </mesh>
      {[0.16, -0.16].map((z) => (
        <mesh key={`ph-eye-${z}`} position={[0.95, 1.02, z]}>
          <sphereGeometry args={[0.035, 10, 10]} />
          <meshStandardMaterial color="#141C18" />
        </mesh>
      ))}
      <mesh position={[0.6, 1.2, 0]} rotation={[0, 0, -0.3]}>
        <coneGeometry args={[0.05, 0.3, 10]} />
        <meshStandardMaterial color="#2E6B4F" />
      </mesh>
      {[
        [-0.6, 0.05],
        [-0.9, 0.1],
        [-1.2, 0.15],
        [-1.5, 0.18],
      ].map(([x, y], i) => (
        <mesh key={`ph-tail-${i}`} position={[x, y + 0.55, 0]} rotation={[0, 0, 0.24]}>
          <cylinderGeometry args={[0.012, 0.03, 0.55, 8]} />
          <meshStandardMaterial color="#B98A3E" roughness={0.85} />
        </mesh>
      ))}
      {[0.18, -0.18].map((z) => (
        <mesh key={`ph-leg-${z}`} position={[0.2, -0.42, z]}>
          <cylinderGeometry args={[0.02, 0.025, 0.5, 8]} />
          <meshStandardMaterial color="#8A6A2E" />
        </mesh>
      ))}
    </group>
  );
}

function Ibis() {
  return (
    <group scale={0.85} position={[0, -0.15, 0]}>
      <mesh position={[0, 0.35, 0]} scale={[0.95, 0.62, 0.5]}>
        <sphereGeometry args={[0.85, 38, 38]} />
        <meshStandardMaterial color="#EDE4D6" roughness={0.9} />
      </mesh>
      <mesh position={[0.65, 0.95, 0]} scale={[0.42, 0.4, 0.36]}>
        <sphereGeometry args={[0.75, 30, 30]} />
        <meshStandardMaterial color="#E8DCC8" roughness={0.9} />
      </mesh>
      <mesh position={[1.08, 0.86, 0]} rotation={[0, 0, -Math.PI / 2 + 0.25]}>
        <coneGeometry args={[0.055, 0.5, 12]} />
        <meshStandardMaterial color="#2B2B2B" roughness={0.6} />
      </mesh>
      <mesh position={[0.62, 1.28, 0]} rotation={[0, 0, -0.25]}>
        <coneGeometry args={[0.06, 0.34, 10]} />
        <meshStandardMaterial color="#C85C5C" roughness={0.8} />
      </mesh>
      <mesh position={[-0.05, 0.3, 0.22]} rotation={[0.4, 0, 0.1]} scale={[0.6, 0.6, 0.1]}>
        <sphereGeometry args={[0.7, 20, 20]} />
        <meshStandardMaterial color="#F2B6A0" roughness={0.85} />
      </mesh>
      <mesh position={[-0.05, 0.3, -0.22]} rotation={[-0.4, 0, 0.1]} scale={[0.6, 0.6, 0.1]}>
        <sphereGeometry args={[0.7, 20, 20]} />
        <meshStandardMaterial color="#F2B6A0" roughness={0.85} />
      </mesh>
      {[0.16, -0.16].map((z) => (
        <mesh key={`i-leg-${z}`} position={[0.1, -0.45, z]}>
          <cylinderGeometry args={[0.022, 0.026, 0.75, 8]} />
          <meshStandardMaterial color="#8C6A5A" />
        </mesh>
      ))}
    </group>
  );
}

function Salamander() {
  return (
    <group scale={0.72} position={[0, -0.3, 0]} rotation={[0, 0, 0]}>
      <mesh position={[0.35, 0.2, 0]} scale={[0.55, 0.22, 0.42]}>
        <sphereGeometry args={[0.9, 36, 36]} />
        <meshStandardMaterial color="#5B6B48" roughness={0.9} />
      </mesh>
      <mesh position={[1.05, 0.16, 0]} scale={[0.42, 0.18, 0.34]}>
        <sphereGeometry args={[0.8, 30, 30]} />
        <meshStandardMaterial color="#66754F" roughness={0.9} />
      </mesh>
      {[0.08, -0.08].map((z) => (
        <mesh key={`s-eye-${z}`} position={[1.36, 0.26, z]}>
          <sphereGeometry args={[0.03, 10, 10]} />
          <meshStandardMaterial color="#C29B4A" />
        </mesh>
      ))}
      {[
        [-0.6, 0.34],
        [-1.2, 0.28],
        [-1.8, 0.2],
      ].map(([x, y], i) => (
        <mesh key={`s-tail-${i}`} position={[x, y, 0]} rotation={[0, 0, 0.08]}>
          <cylinderGeometry args={[0.05, 0.09, 0.62, 10]} />
          <meshStandardMaterial color="#5B6B48" roughness={0.9} />
        </mesh>
      ))}
      {[
        [0.6, 0.3],
        [0.6, -0.3],
        [-0.2, 0.3],
        [-0.2, -0.3],
      ].map(([x, z], i) => (
        <mesh key={`s-leg-${i}`} position={[x, 0.0, z]} rotation={[0, 0, 1.2]}>
          <cylinderGeometry args={[0.03, 0.05, 0.4, 8]} />
          <meshStandardMaterial color="#4F5E3E" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function Spinner({ autoRotate, children }: { autoRotate: boolean; children: React.ReactNode }) {
  const ref = useRef<Group>(null);
  useFrame((_, delta) => {
    if (ref.current && autoRotate) ref.current.rotation.y += delta * 0.18;
  });
  return <group ref={ref}>{children}</group>;
}

const MODELS: Array<{ key: ModelKind; label: string; note: string }> = [
  { key: "panda", label: "大熊猫", note: "黑白分区、伪拇指与圆厚体形" },
  { key: "tiger", label: "华南虎", note: "橙底黑纹、宽颅与粗壮四肢" },
  { key: "snub-monkey", label: "金丝猴", note: "仰鼻、金色长毛与长尾" },
  { key: "milu", label: "麋鹿", note: "分叉鹿角、长尾与蹄间蹼" },
  { key: "antelope", label: "藏羚 / 普氏原羚", note: "细角、轻盈体态与高原适应" },
  { key: "horse", label: "普氏野马", note: "直立鬃毛、粗颈与短耳" },
  { key: "yak", label: "野牦牛", note: "厚毛裙、弯角与低矮体形" },
  { key: "takin", label: "羚牛", note: "短角、高肩与粗壮躯干" },
  { key: "pheasant", label: "褐马鸡 / 红腹锦鸡", note: "长尾羽、冠羽与地栖体型" },
  { key: "ibis", label: "朱鹮", note: "细长弯喙、冠羽与粉色翼羽" },
  { key: "salamander", label: "大鲵", note: "扁平头、长尾与短肢" },
  { key: "crocodile", label: "扬子鳄", note: "长吻、背甲与侧扁尾" },
  { key: "dolphin", label: "白鱀豚", note: "吻突、背鳍与流线体" },
];

export function Lab3D({ initialSlug, group }: { initialSlug?: string; group?: string } = {}) {
  const [kind, setKind] = useState<ModelKind>(initialSlug ? modelForSlug(initialSlug, group) : "panda");
  const [autoRotate, setAutoRotate] = useState(true);
  const [wireframe, setWireframe] = useState(false);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_240px] lg:items-start">
      <div className="relative min-h-[360px] overflow-hidden border border-[var(--line)] bg-[radial-gradient(ellipse_at_50%_30%,#E9E2D3,#D9D0BE)] lg:sticky lg:top-20 lg:h-[calc(100vh-9rem)] lg:max-h-[560px] lg:min-h-[380px]">
        <Canvas camera={{ position: [4.4, 2.7, 5.4], fov: 42 }} dpr={[1, 2]} shadows>
          <color attach="background" args={["#E9E2D3"]} />
          <fog attach="fog" args={["#E9E2D3", 8, 16]} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[4, 6, 3]} intensity={1.5} castShadow />
          <directionalLight position={[-4, 2, -4]} intensity={0.5} color="#A9BFA8" />
          <Suspense fallback={null}>
            <Spinner autoRotate={autoRotate}>
              {kind === "tiger" && <Tiger />}
              {kind === "snub-monkey" && <SnubMonkey />}
              {kind === "milu" && <Milu />}
              {kind === "antelope" && <Antelope />}
              {kind === "horse" && <Horse />}
              {kind === "yak" && <Yak />}
              {kind === "takin" && <Takin />}
              {kind === "pheasant" && <Pheasant />}
              {kind === "ibis" && <Ibis />}
              {kind === "salamander" && <Salamander />}
              {kind === "panda" && <Panda />}
              {kind === "crocodile" && <Crocodile />}
              {kind === "dolphin" && <Dolphin />}
            </Spinner>
            <ContactShadows position={[0, -1.25, 0]} opacity={0.28} scale={9} blur={2.6} far={4} />
          </Suspense>
          <mesh visible={wireframe} position={[0, -1.28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.6, 1.62, 64]} />
            <meshBasicMaterial color="#2A6B51" />
          </mesh>
          <OrbitControls enablePan={false} minDistance={2.6} maxDistance={8} enableDamping dampingFactor={0.08} />
        </Canvas>

        <div className="pointer-events-none absolute left-3 top-3 border border-[var(--line)] bg-[var(--surface)]/80 px-3 py-2 text-[9px] backdrop-blur">
          <p className="flex items-center gap-1.5 text-[var(--ink-soft)]"><Box size={11} /> Procedural model</p>
          <p className="mt-1 text-[var(--muted)]">拖拽旋转 · 滚轮缩放 · 双指平移</p>
        </div>
        <div className="absolute bottom-3 right-3 flex gap-2">
          <button
            onClick={() => setAutoRotate((v) => !v)}
            className="flex items-center gap-1.5 border border-[var(--line-strong)] bg-[var(--surface)]/90 px-2.5 py-1.5 text-[10px] backdrop-blur"
          >
            <Compass size={11} /> {autoRotate ? "暂停自动旋转" : "自动旋转"}
          </button>
          <button
            onClick={() => setWireframe((v) => !v)}
            className="flex items-center gap-1.5 border border-[var(--line-strong)] bg-[var(--surface)]/90 px-2.5 py-1.5 text-[10px]"
          >
            <RotateCcw size={11} /> {wireframe ? "隐藏参考环" : "显示参考环"}
          </button>
        </div>
      </div>

      <div className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto lg:pr-1">
        <div className="border border-[var(--line)] bg-[var(--surface)] p-4">
          <p className="label text-[var(--muted)]">Model · 模型（{MODELS.length}）</p>
          <div className="mt-2 space-y-1.5">
            {MODELS.map((m) => (
              <button
                key={m.key}
                onClick={() => setKind(m.key)}
                className={`block w-full border px-3 py-2 text-left transition-colors ${
                  kind === m.key ? "border-[var(--forest)] bg-[var(--forest)] text-[#F5F1E7]" : "border-[var(--line)] hover:border-[var(--line-strong)]"
                }`}
              >
                <span className="text-[11.5px]">{m.label}</span>
                <span className={`mt-0.5 block text-[9px] ${kind === m.key ? "text-white/60" : "text-[var(--muted)]"}`}>{m.note}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 border border-[var(--line)] bg-[var(--surface-2)] p-4 text-[10px] leading-relaxed text-[var(--muted)]">
          <p className="text-[var(--ink-soft)]">这不是标本扫描</p>
          <p className="mt-2">
            当前 13 个模型均为中国特有动物的馆方原创程序化几何，用于观察体型比例与结构关系，不用于形态测量。真实 3D 标本扫描尚未接入；接入后会逐件标注作者与许可。
          </p>
        </div>
      </div>
    </div>
  );
}