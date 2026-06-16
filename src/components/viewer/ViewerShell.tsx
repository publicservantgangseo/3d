"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Camera, ChevronLeft, ChevronRight, Footprints, Rotate3D, RotateCcw } from "lucide-react";
import { pageIndex } from "@/data/pageIndex";
import { Scene, SceneSchema } from "@/domain/scene/schema";
import { PageSidebar } from "./PageSidebar";
import { SceneCanvas } from "./SceneCanvas";

export function ViewerShell() {
  const [selectedPageId, setSelectedPageId] = useState(pageIndex[0].id);
  const [scene, setScene] = useState<Scene | null>(null);
  const [focusTarget, setFocusTarget] = useState<[number, number, number] | null>(null);
  const [mode, setMode] = useState<"orbit" | "walk">("orbit");
  const [resetSignal, setResetSignal] = useState(0);

  const selectedPageIndex = useMemo(
    () => Math.max(0, pageIndex.findIndex((page) => page.id === selectedPageId)),
    [selectedPageId]
  );

  const selectedPage = pageIndex[selectedPageIndex] ?? pageIndex[0];

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

  const selectOffset = useCallback(
    (offset: number) => {
      const nextIndex = (selectedPageIndex + offset + pageIndex.length) % pageIndex.length;
      setSelectedPageId(pageIndex[nextIndex].id);
    },
    [selectedPageIndex]
  );

  const resetCamera = useCallback(() => {
    setFocusTarget(null);
    setResetSignal((value) => value + 1);
  }, []);

  return (
    <main className="viewerLayout" aria-label="Gangseo 3D viewer">
      <SceneCanvas scene={scene} focusTarget={focusTarget} mode={mode} resetSignal={resetSignal} />
      <PageSidebar pages={pageIndex} selectedPageId={selectedPageId} onSelectPage={setSelectedPageId} />
      <div className="viewerChrome" aria-label="Viewer controls">
        <button aria-label="Previous page" className="chromeButton" onClick={() => selectOffset(-1)} type="button">
          <ChevronLeft aria-hidden="true" size={22} strokeWidth={2.4} />
        </button>
        <button
          aria-label={mode === "orbit" ? "Walk mode" : "Orbit mode"}
          className="chromeButton"
          onClick={() => setMode((value) => (value === "orbit" ? "walk" : "orbit"))}
          type="button"
        >
          {mode === "orbit" ? (
            <Footprints aria-hidden="true" size={21} strokeWidth={2.3} />
          ) : (
            <Rotate3D aria-hidden="true" size={21} strokeWidth={2.3} />
          )}
        </button>
        <button aria-label="Reset camera" className="chromeButton isPrimary" onClick={resetCamera} type="button">
          <Camera aria-hidden="true" size={22} strokeWidth={2.35} />
        </button>
        <button aria-label="Refresh view" className="chromeButton" onClick={resetCamera} type="button">
          <RotateCcw aria-hidden="true" size={20} strokeWidth={2.3} />
        </button>
        <button aria-label="Next page" className="chromeButton" onClick={() => selectOffset(1)} type="button">
          <ChevronRight aria-hidden="true" size={22} strokeWidth={2.4} />
        </button>
      </div>
    </main>
  );
}
