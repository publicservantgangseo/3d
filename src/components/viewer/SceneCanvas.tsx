"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Grid, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Scene } from "@/domain/scene/schema";
import { SceneObjects } from "./SceneObjects";

type Props = {
  scene: Scene | null;
  focusTarget: [number, number, number] | null;
  mode: "orbit" | "walk";
};

export function SceneCanvas({ scene, focusTarget, mode }: Props) {
  const [showLabels, setShowLabels] = useState(true);

  return (
    <div className="sceneCanvasWrap">
      <div className="sceneControls">
        <button type="button" onClick={() => setShowLabels((value) => !value)}>
          {showLabels ? "라벨 숨기기" : "라벨 보기"}
        </button>
        <span>{mode === "orbit" ? "Orbit" : "Walk preview"}</span>
      </div>
      {!scene ? (
        <div className="sceneLoading">장면 로딩 중</div>
      ) : (
        <Canvas shadows camera={{ position: [0, 13, 15], fov: 48 }} style={{ height: "100%", width: "100%" }}>
          <color attach="background" args={["#dfe7ef"]} />
          <ambientLight intensity={0.65} />
          <directionalLight position={[10, 18, 8]} intensity={1.2} castShadow />
          <PerspectiveCamera makeDefault position={scene.cameraPresets[0].position} />
          <CameraFocus focusTarget={focusTarget} />
          <SceneObjects scene={scene} showLabels={showLabels} />
          <Grid args={[30, 30]} cellSize={1} cellThickness={0.5} sectionSize={5} sectionThickness={1.2} fadeDistance={45} />
          <OrbitControls enabled={mode === "orbit"} target={scene.cameraPresets[0].target} />
        </Canvas>
      )}
    </div>
  );
}

function CameraFocus({ focusTarget }: { focusTarget: [number, number, number] | null }) {
  const { camera } = useThree();
  const lastFocus = useRef<string>("");

  useEffect(() => {
    if (!focusTarget) return;
    const key = focusTarget.join(",");
    if (key === lastFocus.current) return;
    lastFocus.current = key;
    camera.position.set(focusTarget[0] + 4, 8, focusTarget[2] + 6);
    camera.lookAt(focusTarget[0], 0, focusTarget[2]);
  }, [camera, focusTarget]);

  return null;
}
