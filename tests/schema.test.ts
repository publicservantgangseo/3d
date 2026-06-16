import { describe, expect, it } from "vitest";
import { SceneSchema } from "@/domain/scene/schema";
import { getSceneValidationIssues } from "@/domain/scene/sceneValidation";

const validScene = {
  id: "page-01",
  pageNumber: 1,
  title: "민원인 라운지",
  sourcePdfPage: 1,
  scale: {
    pdfWidth: 842,
    pdfHeight: 1191,
    worldUnitsPerPdfPoint: 0.01
  },
  cameraPresets: [
    {
      id: "overview",
      name: "전체 보기",
      position: [0, 18, 18],
      target: [0, 0, 0]
    }
  ],
  rooms: [
    {
      id: "room-01",
      name: "민원여권과",
      category: "service",
      position: [0, 0, 0],
      size: [6, 0.12, 4],
      color: "#dbeafe",
      source: "manual"
    }
  ],
  walls: [],
  doors: [],
  furniture: [
    {
      id: "furniture-01",
      name: "민원대",
      category: "service-counter",
      position: [1, 0.45, 1],
      rotation: [0, 0, 0],
      size: [2, 0.9, 0.7],
      source: "manual"
    }
  ],
  labels: [
    {
      id: "label-01",
      text: "민원여권과",
      position: [0, 0.08, 0],
      source: "pdf-text",
      pdf: { x: 12554, y: 16658, page: 1 }
    }
  ]
};

describe("SceneSchema", () => {
  it("accepts a complete page scene", () => {
    expect(SceneSchema.parse(validScene).id).toBe("page-01");
  });

  it("rejects scenes without camera presets", () => {
    const result = SceneSchema.safeParse({ ...validScene, cameraPresets: [] });
    expect(result.success).toBe(false);
  });
});

describe("getSceneValidationIssues", () => {
  it("requires labels and at least one camera preset", () => {
    const issues = getSceneValidationIssues({
      ...validScene,
      cameraPresets: [],
      labels: []
    });
    expect(issues).toContain("page-01 has no camera presets");
    expect(issues).toContain("page-01 has no labels");
  });
});
