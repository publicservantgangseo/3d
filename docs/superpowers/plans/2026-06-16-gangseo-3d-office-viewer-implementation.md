# Gangseo 3D Office Viewer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Vercel-deployable Next.js 3D viewer for all 18 pages of `Integrated New Public Service Center_Gangseo.pdf`, with furniture-level scene data, staff exploration mode, and admin JSON review/export mode.

**Architecture:** The app is a static-first Next.js application. PDF extraction scripts generate positioned label data and draft scene JSON; the staff viewer and admin editor both consume the same scene schema. Admin edits are saved to browser storage and exported as JSON because a Vercel static deployment cannot write directly to repository files.

**Tech Stack:** Next.js, React, TypeScript, Three.js, React Three Fiber, Drei, Zod, Lucide React, Vitest, Python `pypdf`.

---

## File Structure

- `package.json`: project scripts and npm dependencies.
- `next.config.mjs`: Next.js config for a Vercel-ready static-capable app.
- `tsconfig.json`: strict TypeScript config.
- `vitest.config.ts`: unit test config.
- `app/layout.tsx`: root HTML shell.
- `app/page.tsx`: staff viewer route.
- `app/admin/page.tsx`: admin review route.
- `app/globals.css`: application styling.
- `src/domain/scene/schema.ts`: Zod schema and TypeScript scene types.
- `src/domain/scene/coordinates.ts`: PDF-to-world coordinate conversion helpers.
- `src/domain/scene/furniture.ts`: furniture classification and rendering metadata.
- `src/domain/scene/sceneValidation.ts`: scene validation helpers used by tests and scripts.
- `src/data/pageIndex.ts`: 18-page index.
- `src/data/scenes/page-01.json` through `src/data/scenes/page-18.json`: reviewed scene data consumed by the app.
- `src/data/extracted/page-01-labels.json` through `src/data/extracted/page-18-labels.json`: generated PDF label extraction data.
- `src/components/viewer/ViewerShell.tsx`: staff viewer layout and state.
- `src/components/viewer/PageSidebar.tsx`: page selector.
- `src/components/viewer/SceneCanvas.tsx`: Three.js canvas wrapper.
- `src/components/viewer/SceneObjects.tsx`: room, wall, door, furniture, and label rendering.
- `src/components/viewer/InspectorPanel.tsx`: minimap, room list, furniture list.
- `src/components/admin/AdminEditor.tsx`: admin page-level editor shell.
- `src/components/admin/AdminPlanOverlay.tsx`: 2D editable overlay for scene objects.
- `src/components/admin/AdminObjectPanel.tsx`: selected object editor and import/export controls.
- `scripts/extract_pdf_labels.py`: extracts positioned PDF text labels.
- `scripts/generate_scene_drafts.py`: creates initial scene JSON from extracted labels.
- `scripts/validate_scenes.mjs`: validates all scene JSON files.
- `tests/coordinates.test.ts`: coordinate helper tests.
- `tests/schema.test.ts`: schema and scene validation tests.
- `tests/furniture.test.ts`: furniture classification tests.
- `tests/pageIndex.test.ts`: verifies all 18 pages are reachable.
- `docs/deployment/vercel.md`: Vercel deployment notes.

## Task 1: Initialize Project And Git

**Files:**
- Create: `package.json`
- Create: `next.config.mjs`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `app/layout.tsx`
- Create: `app/globals.css`
- Create: `.gitignore`

- [ ] **Step 1: Initialize git**

Run:

```powershell
git init
git branch -M main
```

Expected: a new local git repository on branch `main`.

- [ ] **Step 2: Create package manifest**

Create `package.json`:

```json
{
  "name": "gangseo-3d-office-viewer",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "test:watch": "vitest",
    "extract:labels": "python scripts/extract_pdf_labels.py --pdf \"Integrated New Public Service Center_Gangseo.pdf\" --out src/data/extracted",
    "generate:scenes": "python scripts/generate_scene_drafts.py --labels src/data/extracted --out src/data/scenes",
    "validate:scenes": "node scripts/validate_scenes.mjs"
  },
  "dependencies": {
    "@react-three/drei": "latest",
    "@react-three/fiber": "latest",
    "clsx": "latest",
    "lucide-react": "latest",
    "next": "latest",
    "react": "latest",
    "react-dom": "latest",
    "three": "latest",
    "zod": "latest"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "latest",
    "@testing-library/react": "latest",
    "@types/node": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "@types/three": "latest",
    "jsdom": "latest",
    "typescript": "latest",
    "vitest": "latest"
  }
}
```

- [ ] **Step 3: Install dependencies**

Run:

```powershell
npm install
```

Expected: `node_modules` and `package-lock.json` are created.

- [ ] **Step 4: Create framework config**

Create `next.config.mjs`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true
};

export default nextConfig;
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "es2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"]
  }
});
```

- [ ] **Step 5: Create root app shell**

Create `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "강서구 통합신청사 3D 뷰어",
  description: "강서구 통합신청사 입주 전 공간 확인용 3D 오피스 뷰어"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
```

Create `app/globals.css`:

```css
:root {
  color-scheme: light;
  --bg: #f4f6f8;
  --panel: #ffffff;
  --ink: #111827;
  --muted: #64748b;
  --line: #d8dee8;
  --blue: #2563eb;
  --teal: #0f766e;
  --amber: #b45309;
  --red: #b91c1c;
}

* {
  box-sizing: border-box;
}

html,
body {
  height: 100%;
  margin: 0;
}

body {
  background: var(--bg);
  color: var(--ink);
  font-family: Arial, "Noto Sans KR", sans-serif;
}

button,
input,
select,
textarea {
  font: inherit;
}

button {
  cursor: pointer;
}

a {
  color: inherit;
  text-decoration: none;
}
```

Create `.gitignore`:

```gitignore
.next/
node_modules/
out/
dist/
coverage/
.env
.env.local
.superpowers/
```

- [ ] **Step 6: Verify scaffold**

Run:

```powershell
npm run test
npm run build
```

Expected: tests report no test files or pass; build reaches a missing page error until `app/page.tsx` is created in Task 6. If Next.js requires `app/page.tsx` immediately, create the temporary file below and replace it in Task 6:

```tsx
export default function Page() {
  return <main>강서구 통합신청사 3D 뷰어</main>;
}
```

- [ ] **Step 7: Commit scaffold**

Run:

```powershell
git add package.json package-lock.json next.config.mjs tsconfig.json vitest.config.ts app .gitignore
git commit -m "chore: scaffold gangseo 3d viewer"
```

Expected: one commit containing the app scaffold.

## Task 2: Define Scene Schema And Validation

**Files:**
- Create: `src/domain/scene/schema.ts`
- Create: `src/domain/scene/sceneValidation.ts`
- Create: `tests/schema.test.ts`

- [ ] **Step 1: Write failing schema tests**

Create `tests/schema.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```powershell
npm run test -- tests/schema.test.ts
```

Expected: FAIL because `SceneSchema` and `getSceneValidationIssues` do not exist.

- [ ] **Step 3: Implement schema**

Create `src/domain/scene/schema.ts`:

```ts
import { z } from "zod";

const Vector3Schema = z.tuple([z.number(), z.number(), z.number()]);
const SourceSchema = z.enum(["pdf-text", "manual", "derived"]);

export const CameraPresetSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  position: Vector3Schema,
  target: Vector3Schema
});

export const RoomSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  position: Vector3Schema,
  size: Vector3Schema,
  color: z.string().min(1),
  source: SourceSchema
});

export const WallSchema = z.object({
  id: z.string().min(1),
  position: Vector3Schema,
  rotation: Vector3Schema,
  size: Vector3Schema,
  source: SourceSchema
});

export const DoorSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  position: Vector3Schema,
  rotation: Vector3Schema,
  size: Vector3Schema,
  source: SourceSchema
});

export const FurnitureSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  position: Vector3Schema,
  rotation: Vector3Schema,
  size: Vector3Schema,
  source: SourceSchema,
  confidence: z.number().min(0).max(1).optional()
});

export const LabelSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  position: Vector3Schema,
  source: SourceSchema,
  pdf: z
    .object({
      x: z.number(),
      y: z.number(),
      page: z.number().int().min(1).max(18)
    })
    .optional()
});

export const SceneSchema = z.object({
  id: z.string().regex(/^page-\d{2}$/),
  pageNumber: z.number().int().min(1).max(18),
  title: z.string().min(1),
  sourcePdfPage: z.number().int().min(1).max(18),
  scale: z.object({
    pdfWidth: z.number().positive(),
    pdfHeight: z.number().positive(),
    worldUnitsPerPdfPoint: z.number().positive()
  }),
  cameraPresets: z.array(CameraPresetSchema).min(1),
  rooms: z.array(RoomSchema),
  walls: z.array(WallSchema),
  doors: z.array(DoorSchema),
  furniture: z.array(FurnitureSchema),
  labels: z.array(LabelSchema)
});

export type CameraPreset = z.infer<typeof CameraPresetSchema>;
export type Room = z.infer<typeof RoomSchema>;
export type Wall = z.infer<typeof WallSchema>;
export type Door = z.infer<typeof DoorSchema>;
export type Furniture = z.infer<typeof FurnitureSchema>;
export type SceneLabel = z.infer<typeof LabelSchema>;
export type Scene = z.infer<typeof SceneSchema>;
```

- [ ] **Step 4: Implement validation helper**

Create `src/domain/scene/sceneValidation.ts`:

```ts
import { Scene, SceneSchema } from "./schema";

export function getSceneValidationIssues(scene: unknown): string[] {
  const parsed = SceneSchema.safeParse(scene);
  if (!parsed.success) {
    return parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
  }

  const value: Scene = parsed.data;
  const issues: string[] = [];

  if (value.cameraPresets.length === 0) {
    issues.push(`${value.id} has no camera presets`);
  }

  if (value.labels.length === 0) {
    issues.push(`${value.id} has no labels`);
  }

  if (value.rooms.length === 0) {
    issues.push(`${value.id} has no rooms`);
  }

  const duplicateIds = findDuplicateIds([
    ...value.cameraPresets.map((item) => item.id),
    ...value.rooms.map((item) => item.id),
    ...value.walls.map((item) => item.id),
    ...value.doors.map((item) => item.id),
    ...value.furniture.map((item) => item.id),
    ...value.labels.map((item) => item.id)
  ]);

  for (const id of duplicateIds) {
    issues.push(`${value.id} has duplicate object id ${id}`);
  }

  return issues;
}

function findDuplicateIds(ids: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const id of ids) {
    if (seen.has(id)) {
      duplicates.add(id);
    }
    seen.add(id);
  }

  return [...duplicates].sort();
}
```

- [ ] **Step 5: Run tests to verify pass**

Run:

```powershell
npm run test -- tests/schema.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit schema**

Run:

```powershell
git add src/domain/scene/schema.ts src/domain/scene/sceneValidation.ts tests/schema.test.ts
git commit -m "feat: define scene schema"
```

Expected: one commit containing scene schema and tests.

## Task 3: Add Coordinate Conversion And Furniture Classification

**Files:**
- Create: `src/domain/scene/coordinates.ts`
- Create: `src/domain/scene/furniture.ts`
- Create: `tests/coordinates.test.ts`
- Create: `tests/furniture.test.ts`

- [ ] **Step 1: Write coordinate tests**

Create `tests/coordinates.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { pdfPointToWorld, normalizePdfPoint } from "@/domain/scene/coordinates";

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
});
```

- [ ] **Step 2: Write furniture tests**

Create `tests/furniture.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { classifyFurnitureLabel, getFurnitureRenderSpec } from "@/domain/scene/furniture";

describe("classifyFurnitureLabel", () => {
  it("recognizes service counters", () => {
    expect(classifyFurnitureLabel("민원대")).toBe("service-counter");
  });

  it("recognizes appliances", () => {
    expect(classifyFurnitureLabel("스탠딩냉장고600X645X1855")).toBe("appliance");
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
```

- [ ] **Step 3: Run tests to verify failure**

Run:

```powershell
npm run test -- tests/coordinates.test.ts tests/furniture.test.ts
```

Expected: FAIL because helper modules do not exist.

- [ ] **Step 4: Implement coordinate helpers**

Create `src/domain/scene/coordinates.ts`:

```ts
export type PdfPointInput = {
  x: number;
  y: number;
  pdfWidth: number;
  pdfHeight: number;
};

export type PdfToWorldInput = PdfPointInput & {
  scale: number;
  yOffset?: number;
};

export function normalizePdfPoint({ x, y, pdfWidth, pdfHeight }: PdfPointInput): { x: number; y: number } {
  return {
    x: round(x / pdfWidth),
    y: round(y / pdfHeight)
  };
}

export function pdfPointToWorld({ x, y, pdfWidth, pdfHeight, scale, yOffset = 0.04 }: PdfToWorldInput): [number, number, number] {
  const worldX = (x - pdfWidth / 2) * scale;
  const worldZ = (pdfHeight / 2 - y) * scale;
  return [round(worldX), yOffset, round(worldZ)];
}

export function worldToPdfPoint({
  position,
  pdfWidth,
  pdfHeight,
  scale
}: {
  position: [number, number, number];
  pdfWidth: number;
  pdfHeight: number;
  scale: number;
}): { x: number; y: number } {
  return {
    x: round(position[0] / scale + pdfWidth / 2),
    y: round(pdfHeight / 2 - position[2] / scale)
  };
}

function round(value: number): number {
  return Math.round(value * 10000) / 10000;
}
```

- [ ] **Step 5: Implement furniture helpers**

Create `src/domain/scene/furniture.ts`:

```ts
export type FurnitureCategory =
  | "desk"
  | "service-counter"
  | "chair"
  | "waiting-seat"
  | "table"
  | "cabinet"
  | "appliance"
  | "equipment"
  | "storage"
  | "plant-or-decor"
  | "unknown";

export type FurnitureRenderSpec = {
  color: string;
  defaultSize: [number, number, number];
};

const specs: Record<FurnitureCategory, FurnitureRenderSpec> = {
  desk: { color: "#7c3aed", defaultSize: [1.2, 0.72, 0.7] },
  "service-counter": { color: "#2563eb", defaultSize: [2.4, 0.95, 0.75] },
  chair: { color: "#475569", defaultSize: [0.48, 0.82, 0.48] },
  "waiting-seat": { color: "#0f766e", defaultSize: [1.6, 0.72, 0.68] },
  table: { color: "#b45309", defaultSize: [1.8, 0.74, 0.9] },
  cabinet: { color: "#64748b", defaultSize: [0.9, 1.6, 0.45] },
  appliance: { color: "#0369a1", defaultSize: [0.7, 1.7, 0.7] },
  equipment: { color: "#be123c", defaultSize: [1.0, 1.0, 0.8] },
  storage: { color: "#78716c", defaultSize: [1.2, 1.4, 0.55] },
  "plant-or-decor": { color: "#15803d", defaultSize: [0.45, 0.9, 0.45] },
  unknown: { color: "#94a3b8", defaultSize: [0.8, 0.5, 0.8] }
};

export function classifyFurnitureLabel(label: string): FurnitureCategory {
  const value = label.toLowerCase();

  if (/(민원대|접수|카운터|안내)/.test(value)) return "service-counter";
  if (/(책상|desk)/.test(value)) return "desk";
  if (/(의자|chair)/.test(value)) return "chair";
  if (/(대기|벤치|소파)/.test(value)) return "waiting-seat";
  if (/(테이블|회의|table)/.test(value)) return "table";
  if (/(옷장|캐비닛|서랍|수납)/.test(value)) return "cabinet";
  if (/(냉장고|정수기|전자레인지|커피머신|세탁기)/.test(value)) return "appliance";
  if (/(x-ray|원심분리기|실험대|개수대|기계|장비|검사)/.test(value)) return "equipment";
  if (/(창고|서고|보관|storage)/.test(value)) return "storage";
  if (/(화분|장식|plant)/.test(value)) return "plant-or-decor";

  return "unknown";
}

export function getFurnitureRenderSpec(category: string): FurnitureRenderSpec {
  if (category in specs) {
    return specs[category as FurnitureCategory];
  }
  return specs.unknown;
}
```

- [ ] **Step 6: Run tests to verify pass**

Run:

```powershell
npm run test -- tests/coordinates.test.ts tests/furniture.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit helpers**

Run:

```powershell
git add src/domain/scene/coordinates.ts src/domain/scene/furniture.ts tests/coordinates.test.ts tests/furniture.test.ts
git commit -m "feat: add scene coordinate and furniture helpers"
```

Expected: one commit containing coordinate and furniture helpers.

## Task 4: Extract PDF Labels And Generate Initial Scene Data

**Files:**
- Create: `scripts/extract_pdf_labels.py`
- Create: `scripts/generate_scene_drafts.py`
- Create: `src/data/extracted/.gitkeep`
- Create: `src/data/scenes/.gitkeep`
- Create after running scripts: `src/data/extracted/page-01-labels.json` through `src/data/extracted/page-18-labels.json`
- Create after running scripts: `src/data/scenes/page-01.json` through `src/data/scenes/page-18.json`

- [ ] **Step 1: Create extraction script**

Create `scripts/extract_pdf_labels.py`:

```python
import argparse
import json
from pathlib import Path
from pypdf import PdfReader


def extract_labels(pdf_path: Path, out_dir: Path) -> None:
    reader = PdfReader(str(pdf_path), strict=False)
    out_dir.mkdir(parents=True, exist_ok=True)

    for page_index, page in enumerate(reader.pages, start=1):
        page_labels = []

        def visitor_text(text, cm, tm, font_dict, font_size):
            value = (text or "").strip()
            if not value:
                return
            page_labels.append(
                {
                    "text": value,
                    "x": round(float(tm[4]), 4),
                    "y": round(float(tm[5]), 4),
                    "fontSize": round(float(font_size), 4),
                    "page": page_index,
                }
            )

        page.extract_text(visitor_text=visitor_text)
        output = {
            "page": page_index,
            "labelCount": len(page_labels),
            "labels": page_labels,
        }
        target = out_dir / f"page-{page_index:02d}-labels.json"
        target.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf", required=True)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()

    extract_labels(Path(args.pdf), Path(args.out))


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Run extraction**

Run:

```powershell
npm run extract:labels
```

Expected: 18 files under `src/data/extracted`, with page 1 containing more than 50 labels.

- [ ] **Step 3: Create draft scene generator**

Create `scripts/generate_scene_drafts.py`:

```python
import argparse
import json
import re
from pathlib import Path

PDF_WIDTH = 842
PDF_HEIGHT = 1191
WORLD_SCALE = 0.01

FURNITURE_PATTERNS = [
    (re.compile(r"민원대|접수|카운터|안내"), "service-counter"),
    (re.compile(r"책상|desk", re.IGNORECASE), "desk"),
    (re.compile(r"의자|chair", re.IGNORECASE), "chair"),
    (re.compile(r"대기|벤치|소파"), "waiting-seat"),
    (re.compile(r"테이블|회의|table", re.IGNORECASE), "table"),
    (re.compile(r"옷장|캐비닛|서랍|수납"), "cabinet"),
    (re.compile(r"냉장고|정수기|전자레인지|커피머신|세탁기"), "appliance"),
    (re.compile(r"X-RAY|원심분리기|실험대|개수대|기계|장비|검사", re.IGNORECASE), "equipment"),
    (re.compile(r"창고|서고|보관"), "storage"),
]


def pdf_to_world(x: float, y: float) -> list[float]:
    world_x = (x - PDF_WIDTH / 2) * WORLD_SCALE
    world_z = (PDF_HEIGHT / 2 - y) * WORLD_SCALE
    return [round(world_x, 4), 0.04, round(world_z, 4)]


def classify_furniture(text: str) -> str | None:
    for pattern, category in FURNITURE_PATTERNS:
        if pattern.search(text):
            return category
    return None


def is_room_label(text: str) -> bool:
    if len(text) < 2:
        return False
    if re.search(r"\d{2,4}[*xX]\d{2,4}|\d+kg|\d+L|커피머신|냉장고|정수기|전자레인지", text):
        return False
    return bool(re.search(r"과|실|홀|라운지|센터|도서관|전시관|회의|상담|창고|서고|로비|방풍", text))


def build_scene(label_file: Path, page_number: int) -> dict:
    payload = json.loads(label_file.read_text(encoding="utf-8"))
    labels = payload["labels"]
    title = labels[0]["text"] if labels else f"Page {page_number:02d}"

    scene_labels = []
    rooms = []
    furniture = []

    for index, label in enumerate(labels):
        position = pdf_to_world(float(label["x"]), float(label["y"]))
        scene_labels.append(
            {
                "id": f"label-{page_number:02d}-{index + 1:03d}",
                "text": label["text"],
                "position": position,
                "source": "pdf-text",
                "pdf": {"x": label["x"], "y": label["y"], "page": page_number},
            }
        )

        if is_room_label(label["text"]):
            rooms.append(
                {
                    "id": f"room-{page_number:02d}-{len(rooms) + 1:03d}",
                    "name": label["text"],
                    "category": "office",
                    "position": [position[0], 0.01, position[2]],
                    "size": [1.8, 0.08, 1.2],
                    "color": "#dbeafe",
                    "source": "derived",
                }
            )

        category = classify_furniture(label["text"])
        if category:
            furniture.append(
                {
                    "id": f"furniture-{page_number:02d}-{len(furniture) + 1:03d}",
                    "name": label["text"],
                    "category": category,
                    "position": [position[0], 0.45, position[2]],
                    "rotation": [0, 0, 0],
                    "size": [0.8, 0.6, 0.8],
                    "source": "derived",
                    "confidence": 0.55,
                }
            )

    return {
        "id": f"page-{page_number:02d}",
        "pageNumber": page_number,
        "title": title,
        "sourcePdfPage": page_number,
        "scale": {
            "pdfWidth": PDF_WIDTH,
            "pdfHeight": PDF_HEIGHT,
            "worldUnitsPerPdfPoint": WORLD_SCALE,
        },
        "cameraPresets": [
            {
                "id": "overview",
                "name": "전체 보기",
                "position": [0, 18, 18],
                "target": [0, 0, 0],
            },
            {
                "id": "top",
                "name": "평면 보기",
                "position": [0, 24, 0.01],
                "target": [0, 0, 0],
            },
        ],
        "rooms": rooms[:80],
        "walls": [],
        "doors": [],
        "furniture": furniture[:160],
        "labels": scene_labels[:220],
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--labels", required=True)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()

    labels_dir = Path(args.labels)
    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    for page_number in range(1, 19):
        label_file = labels_dir / f"page-{page_number:02d}-labels.json"
        scene = build_scene(label_file, page_number)
        target = out_dir / f"page-{page_number:02d}.json"
        target.write_text(json.dumps(scene, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
```

- [ ] **Step 4: Run scene generation**

Run:

```powershell
npm run generate:scenes
```

Expected: 18 scene JSON files under `src/data/scenes`.

- [ ] **Step 5: Inspect generated page count**

Run:

```powershell
(Get-ChildItem src\data\scenes\page-*.json).Count
```

Expected: `18`.

- [ ] **Step 6: Commit extraction and generated data**

Run:

```powershell
git add scripts/extract_pdf_labels.py scripts/generate_scene_drafts.py src/data
git commit -m "feat: generate pdf-derived scene data"
```

Expected: one commit containing extraction scripts and 18 generated scene files.

## Task 5: Add Page Index And Scene Validation Script

**Files:**
- Create: `src/data/pageIndex.ts`
- Create: `scripts/validate_scenes.mjs`
- Create: `tests/pageIndex.test.ts`

- [ ] **Step 1: Write page index test**

Create `tests/pageIndex.test.ts`:

```ts
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
});
```

- [ ] **Step 2: Run test to verify failure**

Run:

```powershell
npm run test -- tests/pageIndex.test.ts
```

Expected: FAIL because `src/data/pageIndex.ts` does not exist.

- [ ] **Step 3: Create page index**

Create `src/data/pageIndex.ts`:

```ts
export type PageIndexItem = {
  id: string;
  pageNumber: number;
  title: string;
  scenePath: string;
};

export const pageIndex: PageIndexItem[] = [
  { id: "page-01", pageNumber: 1, title: "민원인 라운지", scenePath: "/data/scenes/page-01.json" },
  { id: "page-02", pageNumber: 2, title: "민원/세무/은행", scenePath: "/data/scenes/page-02.json" },
  { id: "page-03", pageNumber: 3, title: "구청장실/대회의실", scenePath: "/data/scenes/page-03.json" },
  { id: "page-04", pageNumber: 4, title: "업무공간 04", scenePath: "/data/scenes/page-04.json" },
  { id: "page-05", pageNumber: 5, title: "업무공간 05", scenePath: "/data/scenes/page-05.json" },
  { id: "page-06", pageNumber: 6, title: "업무공간 06", scenePath: "/data/scenes/page-06.json" },
  { id: "page-07", pageNumber: 7, title: "업무공간 07", scenePath: "/data/scenes/page-07.json" },
  { id: "page-08", pageNumber: 8, title: "식당/지원공간", scenePath: "/data/scenes/page-08.json" },
  { id: "page-09", pageNumber: 9, title: "검사/실험공간", scenePath: "/data/scenes/page-09.json" },
  { id: "page-10", pageNumber: 10, title: "진료/보건공간 10", scenePath: "/data/scenes/page-10.json" },
  { id: "page-11", pageNumber: 11, title: "보건/상담공간 11", scenePath: "/data/scenes/page-11.json" },
  { id: "page-12", pageNumber: 12, title: "보건관리/시청각실", scenePath: "/data/scenes/page-12.json" },
  { id: "page-13", pageNumber: 13, title: "의회/본회의장 13", scenePath: "/data/scenes/page-13.json" },
  { id: "page-14", pageNumber: 14, title: "위원회실 14", scenePath: "/data/scenes/page-14.json" },
  { id: "page-15", pageNumber: 15, title: "의장실/의회사무 15", scenePath: "/data/scenes/page-15.json" },
  { id: "page-16", pageNumber: 16, title: "의원실/회의실 16", scenePath: "/data/scenes/page-16.json" },
  { id: "page-17", pageNumber: 17, title: "예방접종/진료공간", scenePath: "/data/scenes/page-17.json" },
  { id: "page-18", pageNumber: 18, title: "자원봉사센터/키즈카페", scenePath: "/data/scenes/page-18.json" }
];
```

- [ ] **Step 4: Copy generated scene JSON into public data path**

Create `public/data/scenes` and copy scene files:

```powershell
New-Item -ItemType Directory -Force -Path public\data\scenes | Out-Null
Copy-Item src\data\scenes\page-*.json public\data\scenes\
```

Expected: 18 JSON files exist under `public/data/scenes`.

- [ ] **Step 5: Create validation script**

Create `scripts/validate_scenes.mjs`:

```js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

const vector3 = z.tuple([z.number(), z.number(), z.number()]);
const source = z.enum(["pdf-text", "manual", "derived"]);

const sceneSchema = z.object({
  id: z.string().regex(/^page-\d{2}$/),
  pageNumber: z.number().int().min(1).max(18),
  title: z.string().min(1),
  sourcePdfPage: z.number().int().min(1).max(18),
  scale: z.object({
    pdfWidth: z.number().positive(),
    pdfHeight: z.number().positive(),
    worldUnitsPerPdfPoint: z.number().positive()
  }),
  cameraPresets: z.array(z.object({ id: z.string(), name: z.string(), position: vector3, target: vector3 })).min(1),
  rooms: z.array(z.object({ id: z.string(), name: z.string(), category: z.string(), position: vector3, size: vector3, color: z.string(), source })),
  walls: z.array(z.object({ id: z.string(), position: vector3, rotation: vector3, size: vector3, source })),
  doors: z.array(z.object({ id: z.string(), name: z.string(), position: vector3, rotation: vector3, size: vector3, source })),
  furniture: z.array(z.object({ id: z.string(), name: z.string(), category: z.string(), position: vector3, rotation: vector3, size: vector3, source, confidence: z.number().optional() })),
  labels: z.array(z.object({ id: z.string(), text: z.string(), position: vector3, source, pdf: z.object({ x: z.number(), y: z.number(), page: z.number() }).optional() }))
});

const sceneDir = path.join(root, "src", "data", "scenes");
const files = fs.readdirSync(sceneDir).filter((file) => /^page-\d{2}\.json$/.test(file)).sort();

if (files.length !== 18) {
  throw new Error(`Expected 18 scene files, found ${files.length}`);
}

const errors = [];

for (const file of files) {
  const fullPath = path.join(sceneDir, file);
  const scene = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
  const result = sceneSchema.safeParse(scene);
  if (!result.success) {
    errors.push(`${file}: ${result.error.message}`);
    continue;
  }
  if (scene.labels.length === 0) errors.push(`${file}: no labels`);
  if (scene.cameraPresets.length === 0) errors.push(`${file}: no camera presets`);
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validated ${files.length} scene files`);
```

- [ ] **Step 6: Verify page index and scene validation**

Run:

```powershell
npm run test -- tests/pageIndex.test.ts
npm run validate:scenes
```

Expected: tests PASS and validation prints `Validated 18 scene files`.

- [ ] **Step 7: Commit page index and validation**

Run:

```powershell
git add src/data/pageIndex.ts public/data/scenes scripts/validate_scenes.mjs tests/pageIndex.test.ts
git commit -m "feat: add page index and scene validation"
```

Expected: one commit containing public scene data, index, and validation.

## Task 6: Build Staff Viewer UI

**Files:**
- Create: `app/page.tsx`
- Create: `src/components/viewer/ViewerShell.tsx`
- Create: `src/components/viewer/PageSidebar.tsx`
- Create: `src/components/viewer/InspectorPanel.tsx`

- [ ] **Step 1: Create staff route**

Create `app/page.tsx`:

```tsx
import { ViewerShell } from "@/components/viewer/ViewerShell";

export default function HomePage() {
  return <ViewerShell />;
}
```

- [ ] **Step 2: Create page sidebar**

Create `src/components/viewer/PageSidebar.tsx`:

```tsx
"use client";

import clsx from "clsx";
import { Building2 } from "lucide-react";
import { PageIndexItem } from "@/data/pageIndex";

type Props = {
  pages: PageIndexItem[];
  selectedPageId: string;
  onSelectPage: (pageId: string) => void;
};

export function PageSidebar({ pages, selectedPageId, onSelectPage }: Props) {
  return (
    <aside className="pageSidebar">
      <div className="brand">
        <Building2 size={20} aria-hidden="true" />
        <div>
          <strong>강서구 통합신청사</strong>
          <span>3D 사무공간 뷰어</span>
        </div>
      </div>
      <nav className="pageList" aria-label="평면도 페이지">
        {pages.map((page) => (
          <button
            key={page.id}
            className={clsx("pageButton", page.id === selectedPageId && "isActive")}
            onClick={() => onSelectPage(page.id)}
            type="button"
          >
            <span>{String(page.pageNumber).padStart(2, "0")}</span>
            <strong>{page.title}</strong>
          </button>
        ))}
      </nav>
    </aside>
  );
}
```

- [ ] **Step 3: Create inspector panel**

Create `src/components/viewer/InspectorPanel.tsx`:

```tsx
"use client";

import { Box, MapPinned } from "lucide-react";
import { Scene } from "@/domain/scene/schema";

type Props = {
  scene: Scene | null;
  onFocusLabel: (position: [number, number, number]) => void;
};

export function InspectorPanel({ scene, onFocusLabel }: Props) {
  if (!scene) {
    return <aside className="inspectorPanel">장면 데이터를 불러오는 중입니다.</aside>;
  }

  const visibleRooms = scene.rooms.slice(0, 20);
  const visibleFurniture = scene.furniture.slice(0, 20);

  return (
    <aside className="inspectorPanel">
      <section>
        <div className="panelTitle">
          <MapPinned size={17} aria-hidden="true" />
          <span>{scene.title}</span>
        </div>
        <div className="miniMap">
          {scene.labels.slice(0, 60).map((label) => (
            <button
              key={label.id}
              className="miniMapDot"
              style={{
                left: `${50 + label.position[0] * 4}%`,
                top: `${50 + label.position[2] * 4}%`
              }}
              title={label.text}
              type="button"
              onClick={() => onFocusLabel(label.position)}
            />
          ))}
        </div>
      </section>
      <section>
        <div className="panelTitle">
          <MapPinned size={17} aria-hidden="true" />
          <span>공간 목록</span>
        </div>
        <div className="objectList">
          {visibleRooms.map((room) => (
            <button key={room.id} type="button" onClick={() => onFocusLabel(room.position)}>
              {room.name}
            </button>
          ))}
        </div>
      </section>
      <section>
        <div className="panelTitle">
          <Box size={17} aria-hidden="true" />
          <span>가구/시설</span>
        </div>
        <div className="objectList muted">
          {visibleFurniture.map((item) => (
            <button key={item.id} type="button" onClick={() => onFocusLabel(item.position)}>
              {item.name}
            </button>
          ))}
        </div>
      </section>
    </aside>
  );
}
```

- [ ] **Step 4: Create viewer shell**

Create `src/components/viewer/ViewerShell.tsx`:

```tsx
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
```

- [ ] **Step 5: Add layout CSS**

Append to `app/globals.css`:

```css
.viewerLayout {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr) 340px;
  min-height: 100vh;
}

.pageSidebar {
  background: #111827;
  color: #f8fafc;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.brand {
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  gap: 10px;
  padding: 18px;
}

.brand strong,
.brand span {
  display: block;
}

.brand span {
  color: #cbd5e1;
  font-size: 12px;
  margin-top: 3px;
}

.pageList {
  display: grid;
  gap: 6px;
  overflow: auto;
  padding: 12px;
}

.pageButton {
  align-items: center;
  background: #1f2937;
  border: 1px solid transparent;
  border-radius: 7px;
  color: #e5e7eb;
  display: grid;
  gap: 8px;
  grid-template-columns: 34px 1fr;
  min-height: 48px;
  padding: 8px 10px;
  text-align: left;
}

.pageButton span {
  color: #93c5fd;
  font-weight: 700;
}

.pageButton strong {
  font-size: 13px;
  line-height: 1.25;
}

.pageButton.isActive {
  background: #1d4ed8;
  border-color: #60a5fa;
  color: #ffffff;
}

.viewerMain {
  display: grid;
  grid-template-rows: 70px minmax(0, 1fr);
  min-width: 0;
}

.viewerToolbar {
  align-items: center;
  background: #ffffff;
  border-bottom: 1px solid var(--line);
  display: flex;
  justify-content: space-between;
  padding: 0 18px;
}

.viewerToolbar span {
  color: var(--muted);
  display: block;
  font-size: 12px;
  margin-bottom: 3px;
}

.viewerToolbar strong {
  font-size: 18px;
}

.segmentedControl {
  background: #e2e8f0;
  border-radius: 8px;
  display: flex;
  gap: 2px;
  padding: 3px;
}

.segmentedControl button {
  background: transparent;
  border: 0;
  border-radius: 6px;
  color: #334155;
  min-width: 84px;
  padding: 8px 10px;
}

.segmentedControl button.isActive {
  background: #ffffff;
  color: #111827;
  font-weight: 700;
}

.inspectorPanel {
  background: #ffffff;
  border-left: 1px solid var(--line);
  display: grid;
  gap: 18px;
  grid-auto-rows: max-content;
  overflow: auto;
  padding: 16px;
}

.panelTitle {
  align-items: center;
  display: flex;
  font-weight: 700;
  gap: 8px;
  margin-bottom: 10px;
}

.miniMap {
  background: #f8fafc;
  border: 1px solid var(--line);
  border-radius: 7px;
  height: 150px;
  position: relative;
}

.miniMapDot {
  background: var(--blue);
  border: 2px solid #ffffff;
  border-radius: 999px;
  height: 10px;
  position: absolute;
  transform: translate(-50%, -50%);
  width: 10px;
}

.objectList {
  display: grid;
  gap: 6px;
}

.objectList button {
  background: #f8fafc;
  border: 1px solid var(--line);
  border-radius: 7px;
  color: #0f172a;
  padding: 9px 10px;
  text-align: left;
}

.objectList.muted button {
  color: #475569;
}

@media (max-width: 980px) {
  .viewerLayout {
    grid-template-columns: 1fr;
  }

  .pageSidebar,
  .inspectorPanel {
    max-height: 300px;
  }
}
```

- [ ] **Step 6: Build to verify UI imports**

Run:

```powershell
npm run build
```

Expected: FAIL because `SceneCanvas` is not created yet. This confirms the staff route now depends on the 3D canvas task.

- [ ] **Step 7: Commit viewer shell**

Run:

```powershell
git add app/page.tsx app/globals.css src/components/viewer/PageSidebar.tsx src/components/viewer/InspectorPanel.tsx src/components/viewer/ViewerShell.tsx
git commit -m "feat: add staff viewer shell"
```

Expected: one commit containing the staff viewer layout.

## Task 7: Implement 3D Scene Canvas

**Files:**
- Create: `src/components/viewer/SceneCanvas.tsx`
- Create: `src/components/viewer/SceneObjects.tsx`

- [ ] **Step 1: Create scene object renderer**

Create `src/components/viewer/SceneObjects.tsx`:

```tsx
"use client";

import { Html } from "@react-three/drei";
import { Scene } from "@/domain/scene/schema";
import { getFurnitureRenderSpec } from "@/domain/scene/furniture";

type Props = {
  scene: Scene;
  showLabels: boolean;
};

export function SceneObjects({ scene, showLabels }: Props) {
  const floorWidth = scene.scale.pdfWidth * scene.scale.worldUnitsPerPdfPoint;
  const floorDepth = scene.scale.pdfHeight * scene.scale.worldUnitsPerPdfPoint;

  return (
    <group>
      <mesh position={[0, -0.02, 0]} receiveShadow>
        <boxGeometry args={[floorWidth, 0.04, floorDepth]} />
        <meshStandardMaterial color="#eef2f7" />
      </mesh>

      {scene.rooms.map((room) => (
        <mesh key={room.id} position={room.position}>
          <boxGeometry args={room.size} />
          <meshStandardMaterial color={room.color} transparent opacity={0.52} />
        </mesh>
      ))}

      {scene.walls.map((wall) => (
        <mesh key={wall.id} position={wall.position} rotation={wall.rotation}>
          <boxGeometry args={wall.size} />
          <meshStandardMaterial color="#475569" />
        </mesh>
      ))}

      {scene.doors.map((door) => (
        <mesh key={door.id} position={door.position} rotation={door.rotation}>
          <boxGeometry args={door.size} />
          <meshStandardMaterial color="#92400e" />
        </mesh>
      ))}

      {scene.furniture.map((item) => {
        const spec = getFurnitureRenderSpec(item.category);
        const size = item.size ?? spec.defaultSize;
        return (
          <mesh key={item.id} position={item.position} rotation={item.rotation} castShadow receiveShadow>
            <boxGeometry args={size} />
            <meshStandardMaterial color={spec.color} />
          </mesh>
        );
      })}

      {showLabels &&
        scene.labels.slice(0, 120).map((label) => (
          <Html key={label.id} position={label.position} center distanceFactor={16}>
            <span className="sceneLabel">{label.text}</span>
          </Html>
        ))}
    </group>
  );
}
```

- [ ] **Step 2: Create scene canvas**

Create `src/components/viewer/SceneCanvas.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Grid, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Scene } from "@/domain/scene/schema";
import { SceneObjects } from "./SceneObjects";

type Props = {
  scene: Scene | null;
  focusTarget: [number, number, number] | null;
  mode: "orbit" | "walk";
};

export function SceneCanvas({ scene, focusTarget, mode }: Props) {
  const [showLabels, setShowLabels] = useState(true);

  return (
    <div className="sceneCanvasWrap">
      <div className="sceneControls">
        <button type="button" onClick={() => setShowLabels((value) => !value)}>
          {showLabels ? "라벨 숨기기" : "라벨 보기"}
        </button>
      </div>
      {!scene ? (
        <div className="sceneLoading">장면 로딩 중</div>
      ) : (
        <Canvas shadows camera={{ position: [0, 18, 18], fov: 48 }}>
          <color attach="background" args={["#dfe7ef"]} />
          <ambientLight intensity={0.65} />
          <directionalLight position={[10, 18, 8]} intensity={1.2} castShadow />
          <PerspectiveCamera makeDefault position={scene.cameraPresets[0].position} />
          <CameraFocus focusTarget={focusTarget} />
          <SceneObjects scene={scene} showLabels={showLabels} />
          <Grid args={[30, 30]} cellSize={1} cellThickness={0.5} sectionSize={5} sectionThickness={1.2} fadeDistance={45} />
          <OrbitControls enabled={mode === "orbit"} target={scene.cameraPresets[0].target} />
        </Canvas>
      )}
    </div>
  );
}

function CameraFocus({ focusTarget }: { focusTarget: [number, number, number] | null }) {
  const { camera } = useThree();
  const lastFocus = useRef<string>("");

  useEffect(() => {
    if (!focusTarget) return;
    const key = focusTarget.join(",");
    if (key === lastFocus.current) return;
    lastFocus.current = key;
    camera.position.set(focusTarget[0] + 4, 8, focusTarget[2] + 6);
    camera.lookAt(focusTarget[0], 0, focusTarget[2]);
  }, [camera, focusTarget]);

  return null;
}
```

- [ ] **Step 3: Add 3D CSS**

Append to `app/globals.css`:

```css
.sceneCanvasWrap {
  min-height: 0;
  position: relative;
}

.sceneCanvasWrap canvas {
  display: block;
}

.sceneControls {
  display: flex;
  gap: 8px;
  left: 16px;
  position: absolute;
  top: 16px;
  z-index: 2;
}

.sceneControls button {
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 7px;
  color: #ffffff;
  padding: 8px 10px;
}

.sceneLoading {
  align-items: center;
  background: #dfe7ef;
  color: #334155;
  display: flex;
  height: 100%;
  justify-content: center;
}

.sceneLabel {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #0f172a;
  display: inline-block;
  font-size: 12px;
  line-height: 1.2;
  max-width: 150px;
  padding: 4px 6px;
  white-space: nowrap;
}
```

- [ ] **Step 4: Verify build**

Run:

```powershell
npm run build
```

Expected: PASS.

- [ ] **Step 5: Commit 3D canvas**

Run:

```powershell
git add src/components/viewer/SceneCanvas.tsx src/components/viewer/SceneObjects.tsx app/globals.css
git commit -m "feat: render scene data in 3d"
```

Expected: one commit containing the 3D canvas.

## Task 8: Build Admin Review Mode

**Files:**
- Create: `app/admin/page.tsx`
- Create: `src/components/admin/AdminEditor.tsx`
- Create: `src/components/admin/AdminPlanOverlay.tsx`
- Create: `src/components/admin/AdminObjectPanel.tsx`

- [ ] **Step 1: Create admin route**

Create `app/admin/page.tsx`:

```tsx
import { AdminEditor } from "@/components/admin/AdminEditor";

export default function AdminPage() {
  return <AdminEditor />;
}
```

- [ ] **Step 2: Create editable plan overlay**

Create `src/components/admin/AdminPlanOverlay.tsx`:

```tsx
"use client";

import { Scene } from "@/domain/scene/schema";

type Props = {
  scene: Scene;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onMoveLabel: (id: string, position: [number, number, number]) => void;
};

export function AdminPlanOverlay({ scene, selectedId, onSelect, onMoveLabel }: Props) {
  const width = scene.scale.pdfWidth;
  const height = scene.scale.pdfHeight;
  const scale = scene.scale.worldUnitsPerPdfPoint;

  return (
    <svg className="adminOverlay" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${scene.title} 편집 오버레이`}>
      <rect x="0" y="0" width={width} height={height} fill="#f8fafc" />
      {scene.rooms.map((room) => (
        <rect
          key={room.id}
          x={width / 2 + room.position[0] / scale - 45}
          y={height / 2 - room.position[2] / scale - 30}
          width="90"
          height="60"
          fill={room.color}
          opacity="0.42"
          stroke={selectedId === room.id ? "#2563eb" : "#94a3b8"}
          strokeWidth="2"
          onClick={() => onSelect(room.id)}
        />
      ))}
      {scene.furniture.map((item) => (
        <rect
          key={item.id}
          x={width / 2 + item.position[0] / scale - 14}
          y={height / 2 - item.position[2] / scale - 14}
          width="28"
          height="28"
          fill={selectedId === item.id ? "#2563eb" : "#334155"}
          opacity="0.85"
          onClick={() => onSelect(item.id)}
        />
      ))}
      {scene.labels.slice(0, 180).map((label) => (
        <text
          key={label.id}
          x={width / 2 + label.position[0] / scale}
          y={height / 2 - label.position[2] / scale}
          fill={selectedId === label.id ? "#b91c1c" : "#111827"}
          fontSize="10"
          onClick={() => onSelect(label.id)}
          onDoubleClick={() => onMoveLabel(label.id, [label.position[0] + 0.25, label.position[1], label.position[2]])}
        >
          {label.text}
        </text>
      ))}
    </svg>
  );
}
```

- [ ] **Step 3: Create admin object panel**

Create `src/components/admin/AdminObjectPanel.tsx`:

```tsx
"use client";

import { Download, Upload } from "lucide-react";
import { Scene } from "@/domain/scene/schema";

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
    file.text().then((text) => onImportScene(JSON.parse(text)));
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
          <li>내보낸 JSON을 `src/data/scenes`와 `public/data/scenes`에 반영</li>
        </ul>
      </section>
    </aside>
  );
}
```

- [ ] **Step 4: Create admin editor shell**

Create `src/components/admin/AdminEditor.tsx`:

```tsx
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
```

- [ ] **Step 5: Add admin CSS**

Append to `app/globals.css`:

```css
.adminLayout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  grid-template-rows: 64px minmax(0, 1fr);
  min-height: 100vh;
}

.adminHeader {
  align-items: center;
  background: #111827;
  color: #ffffff;
  display: flex;
  gap: 16px;
  grid-column: 1 / -1;
  justify-content: space-between;
  padding: 0 18px;
}

.adminHeader select {
  border: 1px solid #475569;
  border-radius: 7px;
  min-width: 260px;
  padding: 8px 10px;
}

.adminCanvas {
  min-height: 0;
  overflow: auto;
  padding: 18px;
}

.adminOverlay {
  background: #ffffff;
  border: 1px solid var(--line);
  border-radius: 8px;
  display: block;
  height: calc(100vh - 100px);
  margin: 0 auto;
  max-width: 100%;
}

.adminPanel {
  background: #ffffff;
  border-left: 1px solid var(--line);
  display: grid;
  gap: 18px;
  grid-auto-rows: max-content;
  overflow: auto;
  padding: 18px;
}

.adminPanel h2,
.adminPanel h3 {
  margin: 0 0 8px;
}

.adminActions {
  display: grid;
  gap: 8px;
}

.adminActions button,
.adminActions label {
  align-items: center;
  background: #f8fafc;
  border: 1px solid var(--line);
  border-radius: 7px;
  display: flex;
  gap: 8px;
  justify-content: center;
  padding: 10px;
}

.adminActions input {
  display: none;
}
```

- [ ] **Step 6: Verify admin route builds**

Run:

```powershell
npm run build
```

Expected: PASS.

- [ ] **Step 7: Commit admin mode**

Run:

```powershell
git add app/admin src/components/admin app/globals.css
git commit -m "feat: add admin scene review mode"
```

Expected: one commit containing admin review mode.

## Task 9: Add Full Validation And Deployment Documentation

**Files:**
- Create: `docs/deployment/vercel.md`
- Modify: `package.json`

- [ ] **Step 1: Add complete verification script**

Modify `package.json` scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "test:watch": "vitest",
    "extract:labels": "python scripts/extract_pdf_labels.py --pdf \"Integrated New Public Service Center_Gangseo.pdf\" --out src/data/extracted",
    "generate:scenes": "python scripts/generate_scene_drafts.py --labels src/data/extracted --out src/data/scenes",
    "validate:scenes": "node scripts/validate_scenes.mjs",
    "verify": "npm run test && npm run validate:scenes && npm run build"
  }
}
```

- [ ] **Step 2: Write Vercel deployment notes**

Create `docs/deployment/vercel.md`:

```md
# Vercel Deployment

## Build

Use the default Vercel Next.js settings.

- Install command: `npm install`
- Build command: `npm run build`
- Output: Next.js default

## Data

The deployed staff viewer reads scene JSON from `public/data/scenes/page-XX.json`.

The admin review mode can import and export JSON in the browser. It does not write directly to Vercel or the repository. After review:

1. Download the reviewed `page-XX.json`.
2. Replace the matching files in `src/data/scenes` and `public/data/scenes`.
3. Run `npm run verify`.
4. Commit and redeploy.

## Verification Before Deploy

Run:

```powershell
npm run verify
```

Expected:

- Vitest passes.
- `validate:scenes` prints `Validated 18 scene files`.
- Next.js build passes.
```

- [ ] **Step 3: Run full verification**

Run:

```powershell
npm run verify
```

Expected: PASS.

- [ ] **Step 4: Commit verification docs**

Run:

```powershell
git add package.json docs/deployment/vercel.md
git commit -m "docs: add deployment and verification workflow"
```

Expected: one commit containing verification script and deployment documentation.

## Task 10: Browser Verification

**Files:**
- No file edits required unless verification finds a visible defect.

- [ ] **Step 1: Start dev server**

Run:

```powershell
npm run dev
```

Expected: local server starts on `http://localhost:3000`. If port 3000 is busy, use the printed alternate port.

- [ ] **Step 2: Verify staff viewer in browser**

Open the staff viewer in the in-app browser:

```text
http://localhost:3000
```

Expected:

- Left sidebar shows 18 pages.
- Center 3D canvas is nonblank.
- Right panel shows current page title, minimap dots, room list, and furniture list.
- Selecting page 18 loads `자원봉사센터/키즈카페`.
- Clicking a room or furniture list item moves the camera.
- Label toggle changes label visibility.

- [ ] **Step 3: Verify admin route in browser**

Open:

```text
http://localhost:3000/admin
```

Expected:

- Page selector shows all 18 pages.
- Overlay renders room, furniture, and label objects.
- Selecting objects highlights them.
- Double-clicking a label moves it by a small amount and stores the scene in `localStorage`.
- `JSON 내보내기` downloads a JSON file.
- `JSON 가져오기` accepts the downloaded JSON and re-renders the scene.

- [ ] **Step 4: Verify responsive layout**

Use browser viewport checks at:

```text
1280x720
390x844
```

Expected:

- Desktop has three columns.
- Mobile stacks viewer sections without text overlap.
- Buttons remain readable.
- 3D canvas stays visible and nonblank.

- [ ] **Step 5: Commit verification fixes**

If browser verification required code changes, run:

```powershell
git add app src package.json docs scripts tests public
git commit -m "fix: address browser verification issues"
```

Expected: commit exists only if verification produced fixes.

## Self-Review Checklist

- Spec coverage:
  - 18-page scope is covered by extraction, generation, page index, validation, and browser checks.
  - Furniture-level scope is covered by furniture classification, scene data, and 3D primitives.
  - Hybrid viewer scope is covered by staff viewer mode toggle and 3D orbit baseline.
  - Admin correction scope is covered by admin route, local storage, import, and export.
  - Vercel deployment scope is covered by static JSON assets and deployment notes.
- Placeholder scan:
  - The plan uses concrete file paths, commands, and code blocks.
  - The plan contains no unresolved placeholder markers.
- Type consistency:
  - Scene fields match `SceneSchema`.
  - `pageIndex.scenePath` points to `public/data/scenes`.
  - Admin and viewer both consume `SceneSchema`.
