"use client";

import { Box, MapPinned } from "lucide-react";
import { Scene } from "@/domain/scene/schema";

type Props = {
  scene: Scene | null;
  onFocusLabel: (position: [number, number, number]) => void;
};

export function InspectorPanel({ scene, onFocusLabel }: Props) {
  if (!scene) {
    return <aside className="inspectorPanel">장면 데이터를 불러오는 중입니다.</aside>;
  }

  const visibleRooms = scene.rooms.slice(0, 20);
  const visibleFurniture = scene.furniture.slice(0, 20);

  return (
    <aside className="inspectorPanel">
      <section>
        <div className="panelTitle">
          <MapPinned size={17} aria-hidden="true" />
          <span>{scene.title}</span>
        </div>
        <div className="miniMap" aria-label="미니맵">
          {scene.labels.slice(0, 60).map((label) => (
            <button
              key={label.id}
              aria-label={`미니맵 ${label.text}`}
              className="miniMapDot"
              style={{
                left: `${clamp(50 + label.position[0] * 4, 4, 96)}%`,
                top: `${clamp(50 + label.position[2] * 4, 4, 96)}%`
              }}
              title={label.text}
              type="button"
              onClick={() => onFocusLabel(label.position)}
            />
          ))}
        </div>
      </section>
      <section>
        <div className="panelTitle">
          <MapPinned size={17} aria-hidden="true" />
          <span>공간 목록</span>
        </div>
        <div className="objectList">
          {visibleRooms.map((room) => (
            <button key={room.id} type="button" onClick={() => onFocusLabel(room.position)}>
              {room.name}
            </button>
          ))}
        </div>
      </section>
      <section>
        <div className="panelTitle">
          <Box size={17} aria-hidden="true" />
          <span>가구/시설</span>
        </div>
        <div className="objectList muted">
          {visibleFurniture.map((item) => (
            <button key={item.id} type="button" onClick={() => onFocusLabel(item.position)}>
              {item.name}
            </button>
          ))}
        </div>
      </section>
    </aside>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
