import { describe, expect, it } from "vitest";
import { classifyFurnitureLabel, getFurnitureRenderSpec } from "@/domain/scene/furniture";

describe("classifyFurnitureLabel", () => {
  it("recognizes service counters", () => {
    expect(classifyFurnitureLabel("민원대")).toBe("service-counter");
  });

  it("recognizes appliances", () => {
    expect(classifyFurnitureLabel("스탠딩냉장고600X645X1855")).toBe("appliance");
  });

  it("recognizes medical equipment", () => {
    expect(classifyFurnitureLabel("X-RAY실")).toBe("equipment");
  });

  it("falls back to unknown", () => {
    expect(classifyFurnitureLabel("알 수 없는 시설")).toBe("unknown");
  });
});

describe("getFurnitureRenderSpec", () => {
  it("returns a stable color and default size", () => {
    expect(getFurnitureRenderSpec("desk")).toEqual({
      color: "#7c3aed",
      defaultSize: [1.2, 0.72, 0.7]
    });
  });
});
