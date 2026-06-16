"use client";

import { Scene } from "@/domain/scene/schema";

type Props = {
  scene: Scene;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onMoveLabel: (id: string, position: [number, number, number]) => void;
};

export function AdminPlanOverlay({ scene, selectedId, onSelect, onMoveLabel }: Props) {
  const width = scene.scale.pdfWidth;
  const height = scene.scale.pdfHeight;
  const scale = scene.scale.worldUnitsPerPdfPoint;

  return (
    <svg className="adminOverlay" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${scene.title} 편집 오버레이`}>
      <rect x="0" y="0" width={width} height={height} fill="#f8fafc" />
      {scene.rooms.map((room) => (
        <rect
          key={room.id}
          x={width / 2 + room.position[0] / scale - 45}
          y={height / 2 - room.position[2] / scale - 30}
          width="90"
          height="60"
          fill={room.color}
          opacity="0.42"
          stroke={selectedId === room.id ? "#2563eb" : "#94a3b8"}
          strokeWidth="2"
          onClick={() => onSelect(room.id)}
        />
      ))}
      {scene.furniture.map((item) => (
        <rect
          key={item.id}
          x={width / 2 + item.position[0] / scale - 14}
          y={height / 2 - item.position[2] / scale - 14}
          width="28"
          height="28"
          fill={selectedId === item.id ? "#2563eb" : "#334155"}
          opacity="0.85"
          onClick={() => onSelect(item.id)}
        />
      ))}
      {scene.labels.slice(0, 180).map((label) => (
        <text
          key={label.id}
          x={width / 2 + label.position[0] / scale}
          y={height / 2 - label.position[2] / scale}
          fill={selectedId === label.id ? "#b91c1c" : "#111827"}
          fontSize="10"
          onClick={() => onSelect(label.id)}
          onDoubleClick={() => onMoveLabel(label.id, [label.position[0] + 0.25, label.position[1], label.position[2]])}
        >
          {label.text}
        </text>
      ))}
    </svg>
  );
}
