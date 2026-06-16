import { describe, expect, it } from "vitest";
import { pageIndex } from "@/data/pageIndex";

describe("pageIndex", () => {
  it("contains exactly 18 pages", () => {
    expect(pageIndex).toHaveLength(18);
  });

  it("uses stable page ids from page-01 through page-18", () => {
    expect(pageIndex[0]).toMatchObject({ id: "page-01", pageNumber: 1 });
    expect(pageIndex[17]).toMatchObject({ id: "page-18", pageNumber: 18 });
  });

  it("points each page to public scene data", () => {
    expect(pageIndex.every((page) => page.scenePath.startsWith("/data/scenes/page-"))).toBe(true);
  });
});
