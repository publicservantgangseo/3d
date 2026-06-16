"use client";

import { useEffect, useMemo, useState } from "react";
import { pageIndex } from "@/data/pageIndex";
import { Scene, SceneSchema } from "@/domain/scene/schema";
import { AdminObjectPanel } from "./AdminObjectPanel";
import { AdminPlanOverlay } from "./AdminPlanOverlay";

export function AdminEditor() {
  const [selectedPageId, setSelectedPageId] = useState(pageIndex[0].id);
  const [scene, setScene] = useState<Scene | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedPage = useMemo(
    () => pageIndex.find((page) => page.id === selectedPageId) ?? pageIndex[0],
    [selectedPageId]
  );

  useEffect(() => {
    const stored = localStorage.getItem(`scene:${selectedPage.id}`);
    if (stored) {
      setScene(SceneSchema.parse(JSON.parse(stored)));
      return;
    }

    fetch(selectedPage.scenePath)
      .then((response) => response.json())
      .then((json) => setScene(SceneSchema.parse(json)));
  }, [selectedPage]);

  function updateScene(nextScene: Scene) {
    setScene(nextScene);
    localStorage.setItem(`scene:${nextScene.id}`, JSON.stringify(nextScene));
  }

  function moveLabel(id: string, position: [number, number, number]) {
    if (!scene) return;
    updateScene({
      ...scene,
      labels: scene.labels.map((label) => (label.id === id ? { ...label, position } : label))
    });
  }

  return (
    <main className="adminLayout">
      <header className="adminHeader">
        <strong>관리자 검수 모드</strong>
        <select value={selectedPageId} onChange={(event) => setSelectedPageId(event.target.value)}>
          {pageIndex.map((page) => (
            <option key={page.id} value={page.id}>
              {String(page.pageNumber).padStart(2, "0")} {page.title}
            </option>
          ))}
        </select>
      </header>
      {scene ? (
        <>
          <section className="adminCanvas">
            <AdminPlanOverlay scene={scene} selectedId={selectedId} onSelect={setSelectedId} onMoveLabel={moveLabel} />
          </section>
          <AdminObjectPanel scene={scene} selectedId={selectedId} onImportScene={updateScene} />
        </>
      ) : (
        <section className="adminCanvas">장면 데이터를 불러오는 중입니다.</section>
      )}
    </main>
  );
}
