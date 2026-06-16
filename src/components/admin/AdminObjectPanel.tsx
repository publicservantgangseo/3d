"use client";

import { Download, Upload } from "lucide-react";
import { Scene, SceneSchema } from "@/domain/scene/schema";

type Props = {
  scene: Scene;
  selectedId: string | null;
  onImportScene: (scene: Scene) => void;
};

export function AdminObjectPanel({ scene, selectedId, onImportScene }: Props) {
  const selected =
    scene.rooms.find((item) => item.id === selectedId) ??
    scene.furniture.find((item) => item.id === selectedId) ??
    scene.labels.find((item) => item.id === selectedId);

  function downloadScene() {
    const blob = new Blob([JSON.stringify(scene, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${scene.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function importScene(file: File) {
    readFileAsText(file).then((text) => onImportScene(SceneSchema.parse(JSON.parse(text))));
  }

  return (
    <aside className="adminPanel">
      <section>
        <h2>{scene.title}</h2>
        <p>선택 항목: {selected ? selected.id : "없음"}</p>
      </section>
      <section className="adminActions">
        <button type="button" onClick={downloadScene}>
          <Download size={16} aria-hidden="true" />
          JSON 내보내기
        </button>
        <label>
          <Upload size={16} aria-hidden="true" />
          JSON 가져오기
          <input
            aria-label="JSON 가져오기"
            type="file"
            accept="application/json"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) importScene(file);
            }}
          />
        </label>
      </section>
      <section>
        <h3>검수 기준</h3>
        <ul>
          <li>라벨 위치가 PDF와 맞는지 확인</li>
          <li>주요 공간명이 누락되지 않았는지 확인</li>
          <li>가구/시설 후보가 잘못 분류되지 않았는지 확인</li>
          <li>내보낸 JSON을 src/data/scenes와 public/data/scenes에 반영</li>
        </ul>
      </section>
    </aside>
  );
}

function readFileAsText(file: File): Promise<string> {
  if (typeof file.text === "function") {
    return file.text();
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
