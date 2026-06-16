import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InspectorPanel } from "@/components/viewer/InspectorPanel";
import { PageSidebar } from "@/components/viewer/PageSidebar";
import { Scene } from "@/domain/scene/schema";

const scene: Scene = {
  id: "page-01",
  pageNumber: 1,
  title: "민원인 라운지",
  sourcePdfPage: 1,
  scale: { pdfWidth: 842, pdfHeight: 1191, worldUnitsPerPdfPoint: 0.01 },
  cameraPresets: [{ id: "overview", name: "전체 보기", position: [0, 13, 15], target: [0, 0, 0] }],
  rooms: [
    {
      id: "room-01",
      name: "민원여권과",
      category: "service",
      position: [1, 0.01, 2],
      size: [1.4, 0.08, 0.9],
      color: "#dbeafe",
      source: "derived"
    }
  ],
  walls: [],
  doors: [],
  furniture: [
    {
      id: "furniture-01",
      name: "민원대",
      category: "service-counter",
      position: [2, 0.45, 3],
      rotation: [0, 0, 0],
      size: [2.4, 0.95, 0.75],
      source: "derived"
    }
  ],
  labels: [{ id: "label-01", text: "민원여권과", position: [1, 0.04, 2], source: "pdf-text" }]
};

describe("PageSidebar", () => {
  it("renders textless page controls and selects a page", () => {
    const onSelectPage = vi.fn();
    const { container } = render(
      <PageSidebar
        pages={[
          { id: "page-01", pageNumber: 1, title: "Public lounge", scenePath: "/data/scenes/page-01.json" },
          { id: "page-18", pageNumber: 18, title: "Volunteer center", scenePath: "/data/scenes/page-18.json" }
        ]}
        selectedPageId="page-01"
        onSelectPage={onSelectPage}
      />
    );

    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => expect(button.textContent).toBe(""));
    expect(container.textContent).not.toContain("Public lounge");
    expect(container.textContent).not.toContain("Volunteer center");
    expect(screen.getByRole("button", { name: "Page 1" }).getAttribute("aria-current")).toBe("page");

    fireEvent.click(screen.getByRole("button", { name: "Page 18" }));
    expect(onSelectPage).toHaveBeenCalledWith("page-18");
  });
});

describe("InspectorPanel", () => {
  it("renders room and furniture lists and focuses selected objects", () => {
    const onFocusLabel = vi.fn();
    render(<InspectorPanel scene={scene} onFocusLabel={onFocusLabel} />);

    fireEvent.click(screen.getByRole("button", { name: "민원여권과" }));
    expect(onFocusLabel).toHaveBeenCalledWith([1, 0.01, 2]);

    fireEvent.click(screen.getByRole("button", { name: "민원대" }));
    expect(onFocusLabel).toHaveBeenCalledWith([2, 0.45, 3]);
  });
});
