# Gangseo 3D Office Viewer Design

Date: 2026-06-16

## Project Goal

Build a Vercel-deployable 3D office viewer for `Integrated New Public Service Center_Gangseo.pdf`.

The app is for Gangseo-gu staff to preview the new public service center before moving in. It is not an operational workplace system. The product should feel practical, professional, and accurate enough to help staff understand office layout, department locations, circulation, and major furniture placement.

## Source Material

- Source PDF: `Integrated New Public Service Center_Gangseo.pdf`
- Page count: 18
- Page size: A-series portrait pages reported as `842 x 1191` PDF points.
- The PDF is vector/text based, not flat scanned imagery.
- `pypdf` can extract page text and text coordinates. A page 1 feasibility check extracted 92 positioned text items, including labels such as `민원인 라운지`, `민원여권과#1`, `열린도서관`, `역사문화전시관`, and `수유실`.

## Confirmed Scope

- Include all 18 PDF pages.
- This is a PDF-specific app, not a reusable PDF-to-3D conversion product.
- Target fidelity includes:
  - walls and major spatial zones,
  - doors and circulation paths where visible or inferable from the plan,
  - room and department labels,
  - major furniture and facility placement such as desks, counters, meeting tables, storage, waiting seating, service counters, and equipment labels present in the PDF.
- Visual/interactivity model:
  - hybrid exploration mode,
  - orbit/top-down 3D inspection as the default,
  - optional first-person walkthrough for immersion.
- Include an admin review/correction mode for scene data.

## Recommended Approach

Use a semi-automatic extraction and review workflow.

The PDF remains the source reference. The app renders reviewed page-level JSON scene data. Text labels and coordinates are extracted automatically from the PDF to seed room and furniture labels. Walls, doors, major zones, and furniture placement are stored in editable scene JSON and corrected in the admin review mode.

This is preferred over a fully automatic PDF-to-3D converter because the project goal is a complete and reliable 18-page viewer, not a generalized conversion engine.

## Technology

- Framework: Next.js with React.
- 3D rendering: Three.js, preferably through React Three Fiber if it fits the implementation.
- Deployment: Vercel static/serverless deployment with assets included in the repository.
- Data format: static JSON files under app data/assets.
- PDF processing: local build-time scripts using `pypdf` for text and coordinate extraction. If rendering page thumbnails is needed, add a reliable PDF rendering dependency or produce page preview assets separately.

## App Architecture

### Staff Viewer

The staff-facing viewer is the primary screen.

Main layout:

- Left sidebar: 18 page/floor selector.
- Center: 3D scene canvas with orbit/top-down controls and walk-mode toggle.
- Right panel:
  - current page summary,
  - minimap or 2D plan preview,
  - room/department list,
  - major furniture/facility list.

Expected interactions:

- Select any of the 18 pages.
- Switch between orbit/top-down and walkthrough mode.
- Click a room or department label to focus the camera on that zone.
- Toggle labels, furniture, and circulation overlays.
- Reset camera to a page-specific default view.

### Admin Review Mode

The admin mode is a separate route or protected view used during production and review.

Core features:

- Select page 1-18.
- Show the PDF page or plan preview as a translucent overlay.
- Toggle scene layers:
  - rooms,
  - walls,
  - doors,
  - labels,
  - furniture,
  - camera presets.
- Select and edit objects.
- Adjust object position, size, rotation, label, category, and visibility.
- Save/export updated JSON.
- Run page-level validation.

Admin mode is not intended as a public editing product. It is a practical correction surface for making the 18 PDF-derived scenes accurate enough before deployment.

## Scene Data Model

Each page should have one scene JSON file.

Recommended top-level shape:

```json
{
  "id": "page-01",
  "pageNumber": 1,
  "title": "민원인 라운지",
  "sourcePdfPage": 1,
  "scale": {
    "pdfWidth": 842,
    "pdfHeight": 1191,
    "worldUnitsPerPdfPoint": 0.01
  },
  "cameraPresets": [],
  "rooms": [],
  "walls": [],
  "doors": [],
  "furniture": [],
  "labels": []
}
```

Common object fields:

- `id`: stable unique id.
- `type` or `category`: semantic type.
- `name`: Korean label where available.
- `position`: world coordinates.
- `rotation`: yaw or Euler values.
- `size`: width, depth, height.
- `source`: `pdf-text`, `manual`, or `derived`.
- `confidence`: optional rough confidence value for extracted objects.

Furniture categories should be simple and reusable:

- desk,
- service-counter,
- chair,
- waiting-seat,
- table,
- cabinet,
- appliance,
- equipment,
- storage,
- plant-or-decor,
- unknown.

## Data Pipeline

1. Ingest PDF metadata.
   - Count pages.
   - Extract page sizes.
   - Extract positioned text labels.

2. Generate draft page data.
   - Create `page-01` through `page-18` JSON files.
   - Seed labels from PDF text coordinates.
   - Group common labels into room, facility, and furniture candidates.
   - Add initial camera presets.

3. Create draft 3D geometry.
   - Use page-specific scene JSON.
   - Build major rooms, walls, doors, and furniture primitives.
   - Prefer simple but readable geometry over decorative complexity.

4. Review in admin mode.
   - Overlay source plan.
   - Correct object positions and categories.
   - Save JSON updates.

5. Validate and deploy.
   - Run schema validation.
   - Run app build.
   - Verify 3D canvas renders.
   - Verify page switching and responsive UI.

## Quality Criteria

Per page:

- Page loads without runtime errors.
- 3D canvas is nonblank.
- Page title and key labels are visible.
- At least one camera preset is usable.
- Main rooms/zones are represented.
- Major furniture/facility categories from the PDF are represented where visible.
- Room list selection focuses the camera on the chosen zone.
- No major UI overlap on desktop or mobile.

Overall app:

- All 18 pages are reachable.
- Viewer mode and admin mode use the same scene data.
- JSON schema validation passes.
- `npm run build` passes.
- Browser verification covers desktop and mobile viewports.
- Vercel deployment requires no local-only services.

## Visual Direction

The UI should feel like a professional municipal facility preview tool:

- restrained color palette,
- clear Korean labels,
- dense but readable operational layout,
- no marketing hero page,
- no decorative gradient/orb-heavy styling,
- high contrast for controls and labels,
- 3D scene as the primary first-screen experience.

Geometry style:

- simple architectural massing,
- clean walls and floor plates,
- readable furniture blocks,
- room colors used sparingly for wayfinding,
- labels and minimap used to reduce ambiguity.

## Risks And Mitigations

Risk: PDF text extraction does not provide exact wall/furniture polygons.

Mitigation: Treat text extraction as a labeling and seed-data step. Store exact rendered scene objects in reviewed JSON and provide admin correction mode.

Risk: 18 pages create too much manual work if each scene is modeled from scratch.

Mitigation: Reuse furniture primitives, scene schema, validation scripts, and page templates. Start with data generation and one representative page before scaling to all pages.

Risk: Walkthrough mode can expose geometry inaccuracies more clearly than orbit mode.

Mitigation: Make orbit/top-down the default. Keep walkthrough optional and constrain it to the floor plane with collision/height rules after core scenes are stable.

Risk: Vercel build becomes heavy if raw assets are too large.

Mitigation: Use optimized static assets, lazy-load page data, and avoid bundling unnecessary PDF processing libraries into the client bundle.

## Implementation Readiness

The next step should be an implementation plan, not coding directly. The plan should sequence the work as:

1. Scaffold Vercel-ready app.
2. Add PDF extraction/data generation scripts.
3. Define scene schema and sample page data.
4. Build staff viewer with one representative scene.
5. Build admin review mode.
6. Scale page data to all 18 pages.
7. Add validation and browser verification.
8. Prepare Vercel deployment notes.

