"use client";

import { useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Scene } from "@/domain/scene/schema";
import { SceneObjects } from "./SceneObjects";

type Props = {
  scene: Scene | null;
  focusTarget: [number, number, number] | null;
  mode: "orbit" | "walk";
  resetSignal: number;
};

export function SceneCanvas({ scene, focusTarget, mode, resetSignal }: Props) {
  const orbitTarget: [number, number, number] = focusTarget ?? [0, mode === "walk" ? 0.9 : 0.45, 0];

  return (
    <div className="sceneCanvasWrap">
      {!scene ? (
        <div aria-label="Loading scene" className="sceneLoading">
          <span aria-hidden="true" />
        </div>
      ) : (
        <Canvas
          camera={{ position: [7.4, 6.2, 8.7], fov: 43, near: 0.1, far: 90 }}
          dpr={[1, 1.8]}
          gl={{ antialias: true }}
          style={{ height: "100%", width: "100%" }}
        >
          <color attach="background" args={["#cbd4d0"]} />
          <fog attach="fog" args={["#cbd4d0", 18, 44]} />
          <hemisphereLight args={["#fff8e7", "#56615c", 1.05]} />
          <directionalLight
            intensity={1.28}
            position={[-5.5, 12, 7.5]}
          />
          <spotLight color="#fff1c2" intensity={0.85} angle={0.74} penumbra={0.45} position={[4, 6, 4]} />
          <PerspectiveCamera makeDefault fov={43} near={0.1} far={90} />
          <CameraRig scene={scene} focusTarget={focusTarget} mode={mode} resetSignal={resetSignal} />
          <SceneObjects scene={scene} />
          <OrbitControls
            dampingFactor={0.08}
            enableDamping
            makeDefault
            maxDistance={mode === "walk" ? 14 : 25}
            maxPolarAngle={Math.PI * 0.48}
            minDistance={mode === "walk" ? 1.4 : 3.8}
            minPolarAngle={Math.PI * 0.17}
            target={orbitTarget}
          />
        </Canvas>
      )}
    </div>
  );
}

function CameraRig({
  scene,
  focusTarget,
  mode,
  resetSignal
}: {
  scene: Scene;
  focusTarget: [number, number, number] | null;
  mode: "orbit" | "walk";
  resetSignal: number;
}) {
  const { camera } = useThree();
  const focusKey = focusTarget ? focusTarget.join(",") : "scene";

  useEffect(() => {
    const floorWidth = scene.scale.pdfWidth * scene.scale.worldUnitsPerPdfPoint;
    const floorDepth = scene.scale.pdfHeight * scene.scale.worldUnitsPerPdfPoint;
    const target: [number, number, number] = focusTarget ?? [0, mode === "walk" ? 0.9 : 0.45, 0];

    const position: [number, number, number] =
      mode === "walk"
        ? [
            target[0] + Math.max(2.6, floorWidth * 0.34),
            1.85,
            target[2] + Math.max(3.2, floorDepth * 0.28)
          ]
        : [
            target[0] + Math.max(5.8, floorWidth * 0.78),
            Math.max(5.8, floorDepth * 0.5),
            target[2] + Math.max(6.6, floorDepth * 0.62)
          ];

    camera.position.set(position[0], position[1], position[2]);
    camera.lookAt(target[0], target[1], target[2]);
    camera.updateProjectionMatrix();
  }, [camera, scene.id, scene.scale.pdfHeight, scene.scale.pdfWidth, scene.scale.worldUnitsPerPdfPoint, focusKey, mode, resetSignal, focusTarget]);

  return null;
}
