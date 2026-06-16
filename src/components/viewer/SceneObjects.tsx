"use client";

import { Html } from "@react-three/drei";
import { Scene } from "@/domain/scene/schema";
import { getFurnitureRenderSpec } from "@/domain/scene/furniture";

type Props = {
  scene: Scene;
  showLabels: boolean;
};

export function SceneObjects({ scene, showLabels }: Props) {
  const floorWidth = scene.scale.pdfWidth * scene.scale.worldUnitsPerPdfPoint;
  const floorDepth = scene.scale.pdfHeight * scene.scale.worldUnitsPerPdfPoint;

  return (
    <group>
      <mesh position={[0, -0.02, 0]} receiveShadow>
        <boxGeometry args={[floorWidth, 0.04, floorDepth]} />
        <meshStandardMaterial color="#eef2f7" />
      </mesh>

      {scene.rooms.map((room) => (
        <mesh key={room.id} position={room.position}>
          <boxGeometry args={room.size} />
          <meshStandardMaterial color={room.color} transparent opacity={0.52} />
        </mesh>
      ))}

      {scene.walls.map((wall) => (
        <mesh key={wall.id} position={wall.position} rotation={wall.rotation}>
          <boxGeometry args={wall.size} />
          <meshStandardMaterial color="#475569" />
        </mesh>
      ))}

      {scene.doors.map((door) => (
        <mesh key={door.id} position={door.position} rotation={door.rotation}>
          <boxGeometry args={door.size} />
          <meshStandardMaterial color="#92400e" />
        </mesh>
      ))}

      {scene.furniture.map((item) => {
        const spec = getFurnitureRenderSpec(item.category);
        return (
          <mesh key={item.id} position={item.position} rotation={item.rotation} castShadow receiveShadow>
            <boxGeometry args={item.size ?? spec.defaultSize} />
            <meshStandardMaterial color={spec.color} />
          </mesh>
        );
      })}

      {showLabels &&
        scene.labels.slice(0, 120).map((label) => (
          <Html key={label.id} position={label.position} center distanceFactor={16}>
            <span className="sceneLabel">{label.text}</span>
          </Html>
        ))}
    </group>
  );
}
