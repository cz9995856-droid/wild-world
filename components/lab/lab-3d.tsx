"use client";

import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import type { Group } from "three";
import { Box, Compass, RotateCcw } from "lucide-react";

type ModelKind = "elephant" | "panda" | "giraffe" | "bird";

function Elephant({ color = "#8C8A80", accent = "#D9CBA8" }: { color?: string; accent?: string }) {
  return (
    <group>
      <mesh position={[0, 0.55, 0]} scale={[1.25, 0.85, 0.8]}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial color={color} roughness={0.82} metalness={0.05} />
      </mesh>
      <mesh position={[1.05, 0.95, 0]} scale={[0.62, 0.62, 0.58]}>
        <sphereGeometry args={[0.7, 42, 42]} />
        <meshStandardMaterial color={color} roughness={0.82} />
      </mesh>
      <mesh position={[1.18, 1.02, 0.55]} rotation={[0, -0.4, 0.2]} scale={[0.55, 0.75, 0.08]}>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[1.18, 1.02, -0.55]} rotation={[0, 0.4, -0.2]} scale={[0.55, 0.75, 0.08]}>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {[-0.55, 0.55].map((x) => (
        <mesh key={`leg-front-${x}`} position={[x + 0.45, -0.2, 0.42]} rotation={[0, 0, x * 0.02]}>
          <cylinderGeometry args={[0.2, 0.24, 1.05, 20]} />
          <meshStandardMaterial color={color} roughness={0.85} />
        </mesh>
      ))}
      {[-0.55, 0.55].map((x) => (
        <mesh key={`leg-back-${x}`} position={[x - 0.65, -0.2, -0.42]}>
          <cylinderGeometry args={[0.2, 0.24, 1.05, 20]} />
          <meshStandardMaterial color={color} roughness={0.85} />
        </mesh>
      ))}
      {[
        [1.3, 0.55, 0.0, 0.42],
        [1.36, 0.18, 0.05, 0.38],
        [1.4, -0.12, 0.1, 0.3],
        [1.3, -0.4, 0.24, 0.22],
      ].map(([x, y, z, r], i) => (
        <mesh key={`trunk-${i}`} position={[x, y, z]} scale={[r, r * 1.15, r]}>
          <sphereGeometry args={[0.55, 24, 24]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[1.05, 0.55, 0.28]} rotation={[0, 0, 0.25]}>
        <coneGeometry args={[0.05, 0.6, 14]} />
        <meshStandardMaterial color={accent} roughness={0.5} />
      </mesh>
      <mesh position={[1.05, 0.55, -0.28]} rotation={[0, 0, 0.25]}>
        <coneGeometry args={[0.05, 0.6, 14]} />
        <meshStandardMaterial color={accent} roughness={0.5} />
      </mesh>
      {[0.3, -0.3].map((z) => (
        <mesh key={`eye-${z}`} position={[1.34, 1.12, z]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color="#141C18" />
        </mesh>
      ))}
      <mesh position={[-1.2, 0.5, 0]} rotation={[0, 0, -0.5]}>
        <cylinderGeometry args={[0.035, 0.05, 0.9, 10]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
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

function Giraffe() {
  return (
    <group scale={0.85}>
      <mesh position={[-0.15, 0.15, 0]} scale={[0.9, 0.6, 0.5]}>
        <sphereGeometry args={[0.9, 40, 40]} />
        <meshStandardMaterial color="#C99A5D" roughness={0.85} />
      </mesh>
      <mesh position={[0.45, 1.45, 0]} rotation={[0, 0, -0.16]}>
        <cylinderGeometry args={[0.18, 0.26, 2.05, 18]} />
        <meshStandardMaterial color="#C99A5D" roughness={0.85} />
      </mesh>
      <mesh position={[0.58, 2.55, 0]} scale={[0.34, 0.24, 0.22]}>
        <sphereGeometry args={[0.9, 32, 32]} />
        <meshStandardMaterial color="#C99A5D" roughness={0.85} />
      </mesh>
      {[0.16, -0.16].map((z) => (
        <mesh key={`ossicone-${z}`} position={[0.62, 2.86, z]}>
          <cylinderGeometry args={[0.035, 0.045, 0.28, 10]} />
          <meshStandardMaterial color="#8B5A2B" roughness={0.9} />
        </mesh>
      ))}
      {[
        [0.3, 0.32],
        [0.3, -0.32],
        [-0.6, 0.32],
        [-0.6, -0.32],
      ].map(([x, z], i) => (
        <mesh key={`g-leg-${i}`} position={[x, -0.85, z]}>
          <cylinderGeometry args={[0.075, 0.09, 1.6, 12]} />
          <meshStandardMaterial color="#C99A5D" roughness={0.85} />
        </mesh>
      ))}
      <mesh position={[-1.0, 0.2, 0]} rotation={[0, 0, 0.5]}>
        <cylinderGeometry args={[0.03, 0.05, 0.7, 8]} />
        <meshStandardMaterial color="#8B5A2B" />
      </mesh>
    </group>
  );
}

function Bird() {
  return (
    <group>
      <mesh position={[0, 0.35, 0]} scale={[1.05, 0.75, 0.6]}>
        <sphereGeometry args={[0.95, 42, 42]} />
        <meshStandardMaterial color="#7C8994" roughness={0.9} />
      </mesh>
      <mesh position={[0.95, 0.85, 0]} scale={[0.55, 0.55, 0.52]}>
        <sphereGeometry args={[0.8, 36, 36]} />
        <meshStandardMaterial color="#EDE8DC" roughness={0.9} />
      </mesh>
      <mesh position={[1.4, 0.82, 0]} rotation={[0, 0, -1.57]}>
        <coneGeometry args={[0.11, 0.42, 16]} />
        <meshStandardMaterial color="#C29B4A" roughness={0.6} />
      </mesh>
      {[0.22, -0.22].map((z) => (
        <mesh key={`b-eye-${z}`} position={[1.22, 0.98, z]}>
          <sphereGeometry args={[0.045, 10, 10]} />
          <meshStandardMaterial color="#141C18" />
        </mesh>
      ))}
      <mesh position={[-0.05, 0.65, 0.62]} rotation={[0.4, 0.1, 0.15]} scale={[0.7, 0.08, 0.5]}>
        <sphereGeometry args={[0.7, 24, 24]} />
        <meshStandardMaterial color="#5D6B74" roughness={0.9} />
      </mesh>
      <mesh position={[-0.05, 0.65, -0.62]} rotation={[-0.4, -0.1, 0.15]} scale={[0.7, 0.08, 0.5]}>
        <sphereGeometry args={[0.7, 24, 24]} />
        <meshStandardMaterial color="#5D6B74" roughness={0.9} />
      </mesh>
      <mesh position={[-1.05, 0.35, 0]} rotation={[0, 0, 0.4]} scale={[0.5, 0.07, 0.35]}>
        <sphereGeometry args={[0.7, 20, 20]} />
        <meshStandardMaterial color="#5D6B74" roughness={0.9} />
      </mesh>
      {[0.22, -0.22].map((z) => (
        <mesh key={`b-leg-${z}`} position={[0.1, -0.5, z]}>
          <cylinderGeometry args={[0.03, 0.03, 0.8, 8]} />
          <meshStandardMaterial color="#C29B4A" />
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
  { key: "elephant", label: "非洲草原象", note: "象鼻、象牙、大耳与柱状四肢" },
  { key: "panda", label: "大熊猫", note: "黑白分区、伪拇指与圆厚体形" },
  { key: "giraffe", label: "长颈鹿", note: "七节延长颈椎、皮骨角与长肢" },
  { key: "bird", label: "猛禽形态", note: "翼面、流线型体与龙骨突示意" },
];

export function Lab3D() {
  const [kind, setKind] = useState<ModelKind>("elephant");
  const [autoRotate, setAutoRotate] = useState(true);
  const [wireframe, setWireframe] = useState(false);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
      <div className="relative min-h-[440px] overflow-hidden border border-[var(--line)] bg-[radial-gradient(ellipse_at_50%_30%,#E9E2D3,#D9D0BE)]">
        <Canvas camera={{ position: [3.6, 2.2, 4.4], fov: 42 }} dpr={[1, 2]} shadows>
          <color attach="background" args={["#E9E2D3"]} />
          <fog attach="fog" args={["#E9E2D3", 8, 16]} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[4, 6, 3]} intensity={1.5} castShadow />
          <directionalLight position={[-4, 2, -4]} intensity={0.5} color="#A9BFA8" />
          <Suspense fallback={null}>
            <Spinner autoRotate={autoRotate}>
              {kind === "elephant" && <Elephant />}
              {kind === "panda" && <Panda />}
              {kind === "giraffe" && <Giraffe />}
              {kind === "bird" && <Bird />}
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

      <div>
        <div className="border border-[var(--line)] bg-[var(--surface)] p-4">
          <p className="label text-[var(--muted)]">Model · 模型</p>
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
            模型为馆方原创程序化几何，用于观察体型比例与结构关系，不用于形态测量。 Smithsonian 3D 与 Sketchfab
            授权模型尚未接入；接入后会逐件标注作者与许可。
          </p>
        </div>
      </div>
    </div>
  );
}