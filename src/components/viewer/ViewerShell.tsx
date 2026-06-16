"use client";

import { useEffect, useMemo, useState } from "react";
import { pageIndex } from "@/data/pageIndex";
import { Scene, SceneSchema } from "@/domain/scene/schema";
import { InspectorPanel } from "./InspectorPanel";
import { PageSidebar } from "./PageSidebar";
import { SceneCanvas } from "./SceneCanvas";

export function ViewerShell() {
  const [selectedPageId, setSelectedPageId] = useState(pageIndex[0].id);
  const [scene, setScene] = useState<Scene | null>(null);
  const [focusTarget, setFocusTarget] = useState<[number, number, number] | null>(null);
  const [mode, setMode] = useState<"orbit" | "walk">("orbit");

  const selectedPage = useMemo(
    () => pageIndex.find((page) => page.id === selectedPageId) ?? pageIndex[0],
    [selectedPageId]
  );

  useEffect(() => {
    let active = true;
    setScene(null);
    setFocusTarget(null);
    fetch(selectedPage.scenePath)
      .then((response) => response.json())
      .then((json) => {
        if (active) setScene(SceneSchema.parse(json));
      });
    return () => {
      active = false;
    };
  }, [selectedPage]);

  return (
    <main className="viewerLayout">
      <PageSidebar pages={pageIndex} selectedPageId={selectedPageId} onSelectPage={setSelectedPageId} />
      <section className="viewerMain" aria-label="3D 장면">
        <header className="viewerToolbar">
          <div>
            <span>현재 페이지</span>
            <strong>{selectedPage.title}</strong>
          </div>
          <div className="segmentedControl" aria-label="탐색 모드">
            <button className={mode === "orbit" ? "isActive" : ""} onClick={() => setMode("orbit")} type="button">
              3D 보기
            </button>
            <button className={mode === "walk" ? "isActive" : ""} onClick={() => setMode("walk")} type="button">
              보행 보기
            </button>
          </div>
        </header>
        <SceneCanvas scene={scene} focusTarget={focusTarget} mode={mode} />
      </section>
      <InspectorPanel scene={scene} onFocusLabel={setFocusTarget} />
    </main>
  );
}
