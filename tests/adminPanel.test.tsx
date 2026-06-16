import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdminObjectPanel } from "@/components/admin/AdminObjectPanel";
import { Scene } from "@/domain/scene/schema";

const scene: Scene = {
  id: "page-01",
  pageNumber: 1,
  title: "민원인 라운지",
  sourcePdfPage: 1,
  scale: { pdfWidth: 842, pdfHeight: 1191, worldUnitsPerPdfPoint: 0.01 },
  cameraPresets: [{ id: "overview", name: "전체 보기", position: [0, 13, 15], target: [0, 0, 0] }],
  rooms: [],
  walls: [],
  doors: [],
  furniture: [],
  labels: [{ id: "label-01", text: "민원여권과", position: [1, 0.04, 2], source: "pdf-text" }]
};

describe("AdminObjectPanel", () => {
  it("shows the selected object id and review guidance", () => {
    render(<AdminObjectPanel scene={scene} selectedId="label-01" onImportScene={vi.fn()} />);

    expect(screen.getByText("민원인 라운지")).toBeTruthy();
    expect(screen.getByText(/label-01/)).toBeTruthy();
    expect(screen.getByText("JSON 내보내기")).toBeTruthy();
  });

  it("imports a scene JSON file", async () => {
    const onImportScene = vi.fn();
    render(<AdminObjectPanel scene={scene} selectedId={null} onImportScene={onImportScene} />);
    const input = screen.getByLabelText("JSON 가져오기", { selector: "input" });
    const file = new File([JSON.stringify(scene)], "page-01.json", { type: "application/json" });

    fireEvent.change(input, { target: { files: [file] } });
    await vi.waitFor(() => expect(onImportScene).toHaveBeenCalledWith(scene));
  });
});
