import { describe, expect, it } from "vitest";
import { normalizePdfPoint, pdfPointToWorld, worldToPdfPoint } from "@/domain/scene/coordinates";

describe("pdfPointToWorld", () => {
  it("maps the PDF center to the world origin", () => {
    const point = pdfPointToWorld({ x: 421, y: 595.5, pdfWidth: 842, pdfHeight: 1191, scale: 0.01 });
    expect(point[0]).toBeCloseTo(0);
    expect(point[1]).toBeCloseTo(0.04);
    expect(point[2]).toBeCloseTo(0);
  });

  it("normalizes PDF coordinates to 0..1", () => {
    expect(normalizePdfPoint({ x: 421, y: 595.5, pdfWidth: 842, pdfHeight: 1191 })).toEqual({
      x: 0.5,
      y: 0.5
    });
  });

  it("round-trips world coordinates back to PDF coordinates", () => {
    const world = pdfPointToWorld({ x: 300, y: 700, pdfWidth: 842, pdfHeight: 1191, scale: 0.01 });
    expect(worldToPdfPoint({ position: world, pdfWidth: 842, pdfHeight: 1191, scale: 0.01 })).toEqual({
      x: 300,
      y: 700
    });
  });
});
