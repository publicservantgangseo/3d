"use client";

import { Furniture, Room, Scene, Wall } from "@/domain/scene/schema";
import { getFurnitureRenderSpec } from "@/domain/scene/furniture";

type Vec3 = [number, number, number];

const floorPalette = ["#e7e0d4", "#ded8cb", "#ece9df", "#d9ddd5", "#e8dccb"];
const wallColor = "#ebe8de";
const capColor = "#20231f";
const woodColor = "#8a623e";
const darkWoodColor = "#4e3225";
const fabricGreen = "#697765";

type Props = {
  scene: Scene;
};

export function SceneObjects({ scene }: Props) {
  const floorWidth = scene.scale.pdfWidth * scene.scale.worldUnitsPerPdfPoint;
  const floorDepth = scene.scale.pdfHeight * scene.scale.worldUnitsPerPdfPoint;
  const roomBounds = computeRoomBounds(scene.rooms, floorWidth, floorDepth);

  return (
    <group>
      <Landscape floorWidth={floorWidth} floorDepth={floorDepth} />
      <BuildingFloor floorWidth={floorWidth} floorDepth={floorDepth} />
      <CarpetPattern floorWidth={floorWidth} floorDepth={floorDepth} />

      {scene.rooms.map((room, index) => (
        <RoomZone key={room.id} floorBounds={roomBounds} index={index} room={room} />
      ))}

      {scene.walls.map((wall) => (
        <BoundaryWall key={wall.id} wall={wall} />
      ))}

      <WallLights floorWidth={floorWidth} floorDepth={floorDepth} />

      {scene.doors.map((door) => (
        <mesh key={door.id} castShadow position={[door.position[0], 0.55, door.position[2]]} rotation={door.rotation}>
          <boxGeometry args={[Math.max(door.size[0], 0.54), 1.1, Math.max(door.size[2], 0.06)]} />
          <meshStandardMaterial color="#b88a55" roughness={0.56} />
        </mesh>
      ))}

      {scene.rooms.map((room, index) => (
        <RoomFurnishing key={`${room.id}-furnishing`} index={index} room={room} />
      ))}

      {scene.furniture.map((item) => (
        <FurniturePiece key={item.id} item={item} />
      ))}
    </group>
  );
}

function BuildingFloor({ floorWidth, floorDepth }: { floorWidth: number; floorDepth: number }) {
  return (
    <group>
      <mesh position={[0, -0.06, 0]} receiveShadow>
        <boxGeometry args={[floorWidth, 0.12, floorDepth]} />
        <meshStandardMaterial color="#f3f0e8" roughness={0.86} />
      </mesh>
      <mesh position={[0, 0.01, 0]} receiveShadow>
        <boxGeometry args={[floorWidth - 0.24, 0.035, floorDepth - 0.24]} />
        <meshStandardMaterial color="#e6e1d6" roughness={0.82} />
      </mesh>
      <mesh position={[floorWidth * 0.28, 0.035, floorDepth * 0.12]} receiveShadow>
        <boxGeometry args={[floorWidth * 0.32, 0.035, floorDepth * 0.62]} />
        <meshStandardMaterial color="#34382f" roughness={0.8} />
      </mesh>
    </group>
  );
}

function Landscape({ floorWidth, floorDepth }: { floorWidth: number; floorDepth: number }) {
  const treePositions: Vec3[] = [
    [-floorWidth * 0.38, 0, -floorDepth * 0.64],
    [floorWidth * 0.08, 0, -floorDepth * 0.67],
    [floorWidth * 0.48, 0, -floorDepth * 0.62],
    [-floorWidth * 0.6, 0, floorDepth * 0.42]
  ];

  return (
    <group>
      <mesh position={[0, -0.13, 0]} receiveShadow>
        <boxGeometry args={[floorWidth + 6.2, 0.08, floorDepth + 5.8]} />
        <meshStandardMaterial color="#d7d6c9" roughness={0.92} />
      </mesh>
      <mesh position={[0, -0.08, -floorDepth * 0.67]} receiveShadow>
        <boxGeometry args={[floorWidth + 5.6, 0.05, 1.18]} />
        <meshStandardMaterial color="#5f744c" roughness={0.92} />
      </mesh>
      <mesh position={[-floorWidth * 0.66, -0.075, 0]} receiveShadow>
        <boxGeometry args={[1.02, 0.05, floorDepth + 4.2]} />
        <meshStandardMaterial color="#5b6f4a" roughness={0.9} />
      </mesh>
      <mesh position={[floorWidth * 0.63, -0.07, floorDepth * 0.28]} receiveShadow>
        <boxGeometry args={[2.7, 0.045, floorDepth * 0.32]} />
        <meshStandardMaterial color="#2f3329" roughness={0.84} />
      </mesh>
      {treePositions.map((position, index) => (
        <Tree key={`tree-${index}`} position={position} scale={index % 2 === 0 ? 1 : 0.82} />
      ))}
    </group>
  );
}

function CarpetPattern({ floorWidth, floorDepth }: { floorWidth: number; floorDepth: number }) {
  const rings = Array.from({ length: 34 }, (_, index) => {
    const col = index % 5;
    const row = Math.floor(index / 5);
    return {
      x: -floorWidth * 0.42 + col * 0.42 + (row % 2) * 0.13,
      z: -floorDepth * 0.36 + row * 0.48,
      r: 0.11 + (index % 3) * 0.02
    };
  });

  return (
    <group>
      <mesh position={[-floorWidth * 0.33, 0.025, -floorDepth * 0.02]} receiveShadow>
        <boxGeometry args={[floorWidth * 0.32, 0.025, floorDepth * 0.72]} />
        <meshStandardMaterial color="#827967" roughness={0.88} />
      </mesh>
      {rings.map((ring, index) => (
        <mesh key={`carpet-ring-${index}`} position={[ring.x, 0.055, ring.z]} rotation={[Math.PI / 2, 0, index * 0.37]}>
          <torusGeometry args={[ring.r, 0.008, 8, 24, Math.PI * 1.45]} />
          <meshStandardMaterial color="#bcb29d" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function RoomZone({ floorBounds, index, room }: { floorBounds: Bounds; index: number; room: Room }) {
  const width = clamp(room.size[0] * 1.18, 1.24, 2.05);
  const depth = clamp(room.size[2] * 1.22, 0.98, 1.72);
  const wallHeight = index % 6 === 0 ? 1.72 : 1.34;
  const openSide = index % 4;
  const x = clamp(room.position[0], floorBounds.minX + width * 0.5, floorBounds.maxX - width * 0.5);
  const z = clamp(room.position[2], floorBounds.minZ + depth * 0.5, floorBounds.maxZ - depth * 0.5);

  return (
    <group position={[x, 0, z]}>
      <mesh receiveShadow position={[0, 0.045, 0]}>
        <boxGeometry args={[width, 0.04, depth]} />
        <meshStandardMaterial color={floorPalette[index % floorPalette.length]} roughness={0.86} />
      </mesh>

      {openSide !== 0 && <Partition position={[0, 0, -depth / 2]} size={[width, wallHeight, 0.045]} wood={index % 3 === 0} />}
      {openSide !== 1 && <Partition position={[width / 2, 0, 0]} size={[0.045, wallHeight, depth]} wood={index % 3 === 1} />}
      {openSide !== 2 && <Partition position={[0, 0, depth / 2]} size={[width, wallHeight, 0.045]} wood={index % 3 === 2} />}
      {openSide !== 3 && <Partition position={[-width / 2, 0, 0]} size={[0.045, wallHeight, depth]} wood={index % 4 === 0} />}
    </group>
  );
}

function Partition({ position, size, wood }: { position: Vec3; size: Vec3; wood: boolean }) {
  const horizontal = size[0] > size[2];
  const panelSize: Vec3 = horizontal ? [Math.max(size[0] - 0.22, 0.2), 0.72, 0.018] : [0.018, 0.72, Math.max(size[2] - 0.22, 0.2)];
  const panelPosition: Vec3 = horizontal ? [0, 0.72, size[2] > 0 ? 0.026 : 0] : [size[0] > 0 ? 0.026 : 0, 0.72, 0];

  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, size[1] / 2, 0]}>
        <boxGeometry args={size} />
        <meshStandardMaterial color={wallColor} roughness={0.78} />
      </mesh>
      <mesh castShadow position={[0, size[1] + 0.045, 0]}>
        <boxGeometry args={[size[0] + 0.02, 0.09, size[2] + 0.02]} />
        <meshStandardMaterial color={capColor} roughness={0.62} />
      </mesh>
      {wood && (
        <mesh castShadow position={panelPosition}>
          <boxGeometry args={panelSize} />
          <meshStandardMaterial color={darkWoodColor} roughness={0.58} />
        </mesh>
      )}
    </group>
  );
}

function BoundaryWall({ wall }: { wall: Wall }) {
  return (
    <group position={wall.position} rotation={wall.rotation}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[wall.size[0], Math.max(wall.size[1], 1.86), wall.size[2]]} />
        <meshStandardMaterial color={wallColor} roughness={0.82} />
      </mesh>
      <mesh castShadow position={[0, wall.size[1] / 2 + 0.08, 0]}>
        <boxGeometry args={[wall.size[0] + 0.06, 0.12, wall.size[2] + 0.06]} />
        <meshStandardMaterial color={capColor} roughness={0.64} />
      </mesh>
    </group>
  );
}

function WallLights({ floorWidth, floorDepth }: { floorWidth: number; floorDepth: number }) {
  const lights: Array<{ position: Vec3; rotation: Vec3 }> = [
    { position: [-floorWidth / 2 + 0.055, 0.95, -floorDepth * 0.28], rotation: [0, Math.PI / 2, 0] },
    { position: [-floorWidth / 2 + 0.055, 0.95, floorDepth * 0.22], rotation: [0, Math.PI / 2, 0] },
    { position: [floorWidth * 0.12, 0.95, floorDepth / 2 - 0.055], rotation: [0, 0, 0] },
    { position: [floorWidth * 0.42, 0.95, floorDepth / 2 - 0.055], rotation: [0, 0, 0] }
  ];

  return (
    <group>
      {lights.map((light, index) => (
        <group key={`wall-light-${index}`} position={light.position} rotation={light.rotation}>
          <pointLight color="#ffeab6" distance={3.4} intensity={0.34} />
          <mesh castShadow>
            <boxGeometry args={[0.09, 0.36, 0.04]} />
            <meshStandardMaterial color="#272822" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0, 0.026]}>
            <boxGeometry args={[0.045, 0.24, 0.014]} />
            <meshStandardMaterial color="#fff2c1" emissive="#ffdf8b" emissiveIntensity={0.85} roughness={0.35} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function RoomFurnishing({ index, room }: { index: number; room: Room }) {
  const yaw = index % 2 === 0 ? 0 : Math.PI / 2;
  const xShift = index % 3 === 0 ? -0.26 : 0.18;
  const zShift = index % 3 === 1 ? -0.18 : 0.18;

  return (
    <group position={[room.position[0] + xShift, 0, room.position[2] + zShift]} rotation={[0, yaw, 0]}>
      <DeskLike width={0.72} depth={0.42} />
      <Chair position={[0.02, 0, 0.43]} />
      {index % 4 === 0 && <Cabinet position={[-0.55, 0, -0.28]} scale={0.7} />}
    </group>
  );
}

function FurniturePiece({ item }: { item: Furniture }) {
  const spec = getFurnitureRenderSpec(item.category);
  const size = item.size ?? spec.defaultSize;
  const width = clamp(size[0], 0.32, 2.8);
  const height = clamp(size[1], 0.24, 1.95);
  const depth = clamp(size[2], 0.28, 1.3);

  return (
    <group position={[item.position[0], 0, item.position[2]]} rotation={item.rotation}>
      {item.category === "service-counter" ? (
        <Counter width={width} height={height} depth={depth} />
      ) : item.category === "cabinet" || item.category === "storage" ? (
        <Cabinet scale={Math.max(0.7, width / 1.1)} />
      ) : item.category === "chair" || item.category === "waiting-seat" ? (
        <Chair position={[0, 0, 0]} scale={item.category === "waiting-seat" ? 1.35 : 1} />
      ) : item.category === "table" || item.category === "desk" ? (
        <DeskLike width={width} depth={depth} />
      ) : item.category === "plant-or-decor" ? (
        <Planter />
      ) : (
        <GenericBlock color={spec.color} depth={depth} height={height} width={width} />
      )}
    </group>
  );
}

function Counter({ width, height, depth }: { width: number; height: number; depth: number }) {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={woodColor} roughness={0.56} />
      </mesh>
      <mesh castShadow position={[0, height + 0.06, 0]}>
        <boxGeometry args={[width + 0.12, 0.12, depth + 0.1]} />
        <meshStandardMaterial color="#f0e6d4" roughness={0.5} />
      </mesh>
      <mesh castShadow position={[0, height + 0.43, -depth * 0.34]}>
        <boxGeometry args={[width * 0.78, 0.56, 0.035]} />
        <meshStandardMaterial color="#d9e2de" opacity={0.62} roughness={0.22} transparent />
      </mesh>
    </group>
  );
}

function DeskLike({ width, depth }: { width: number; depth: number }) {
  const topY = 0.72;
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, topY, 0]}>
        <boxGeometry args={[width, 0.1, depth]} />
        <meshStandardMaterial color="#9c7049" roughness={0.55} />
      </mesh>
      {[-1, 1].map((x) =>
        [-1, 1].map((z) => (
          <mesh key={`leg-${x}-${z}`} castShadow position={[x * width * 0.38, topY / 2, z * depth * 0.34]}>
            <boxGeometry args={[0.045, topY, 0.045]} />
            <meshStandardMaterial color="#34352f" roughness={0.62} />
          </mesh>
        ))
      )}
      <mesh castShadow position={[width * 0.18, topY + 0.12, 0]}>
        <boxGeometry args={[width * 0.34, 0.06, depth * 0.5]} />
        <meshStandardMaterial color="#f6f0e4" roughness={0.48} />
      </mesh>
    </group>
  );
}

function Chair({ position = [0, 0, 0], scale = 1 }: { position?: Vec3; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow receiveShadow position={[0, 0.42, 0]}>
        <boxGeometry args={[0.34, 0.11, 0.34]} />
        <meshStandardMaterial color={fabricGreen} roughness={0.7} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.72, -0.15]}>
        <boxGeometry args={[0.34, 0.42, 0.08]} />
        <meshStandardMaterial color={fabricGreen} roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0, 0.23, 0.16]}>
        <boxGeometry args={[0.08, 0.34, 0.08]} />
        <meshStandardMaterial color="#22251f" roughness={0.5} />
      </mesh>
    </group>
  );
}

function Cabinet({ position = [0, 0, 0], scale = 1 }: { position?: Vec3; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow receiveShadow position={[0, 0.75, 0]}>
        <boxGeometry args={[0.48, 1.5, 0.32]} />
        <meshStandardMaterial color="#b48b58" roughness={0.56} />
      </mesh>
      <mesh castShadow position={[0, 1.53, 0]}>
        <boxGeometry args={[0.52, 0.06, 0.36]} />
        <meshStandardMaterial color="#3a3329" roughness={0.56} />
      </mesh>
      <mesh position={[0.12, 0.78, -0.17]}>
        <boxGeometry args={[0.04, 0.72, 0.018]} />
        <meshStandardMaterial color="#2f2c26" roughness={0.48} />
      </mesh>
    </group>
  );
}

function GenericBlock({ color, depth, height, width }: { color: string; depth: number; height: number; width: number }) {
  return (
    <mesh castShadow receiveShadow position={[0, height / 2, 0]}>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color={color} roughness={0.62} />
    </mesh>
  );
}

function Planter() {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.16, 0.2, 0.36, 18]} />
        <meshStandardMaterial color="#5d4030" roughness={0.62} />
      </mesh>
      <mesh castShadow position={[0, 0.56, 0]}>
        <sphereGeometry args={[0.28, 16, 12]} />
        <meshStandardMaterial color="#47754a" roughness={0.74} />
      </mesh>
    </group>
  );
}

function Tree({ position, scale }: { position: Vec3; scale: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.08, 0.11, 0.9, 10]} />
        <meshStandardMaterial color="#5f3d24" roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0, 1.02, 0]}>
        <sphereGeometry args={[0.48, 18, 14]} />
        <meshStandardMaterial color="#617e4d" roughness={0.82} />
      </mesh>
      <mesh castShadow position={[0.24, 0.84, -0.1]}>
        <sphereGeometry args={[0.3, 16, 10]} />
        <meshStandardMaterial color="#789061" roughness={0.84} />
      </mesh>
    </group>
  );
}

type Bounds = {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
};

function computeRoomBounds(rooms: Room[], floorWidth: number, floorDepth: number): Bounds {
  if (rooms.length === 0) {
    return {
      minX: -floorWidth / 2 + 0.32,
      maxX: floorWidth / 2 - 0.32,
      minZ: -floorDepth / 2 + 0.32,
      maxZ: floorDepth / 2 - 0.32
    };
  }

  const xs = rooms.map((room) => room.position[0]);
  const zs = rooms.map((room) => room.position[2]);
  return {
    minX: Math.max(-floorWidth / 2 + 0.32, Math.min(...xs) - 0.85),
    maxX: Math.min(floorWidth / 2 - 0.32, Math.max(...xs) + 0.85),
    minZ: Math.max(-floorDepth / 2 + 0.32, Math.min(...zs) - 0.85),
    maxZ: Math.min(floorDepth / 2 - 0.32, Math.max(...zs) + 0.85)
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
