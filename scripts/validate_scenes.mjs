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
  rooms: z.array(z.object({ id: z.string(), name: z.string(), category: z.string(), position: vector3, size: vector3, color: z.string(), source })).min(1),
  walls: z.array(z.object({ id: z.string(), position: vector3, rotation: vector3, size: vector3, source })),
  doors: z.array(z.object({ id: z.string(), name: z.string(), position: vector3, rotation: vector3, size: vector3, source })),
  furniture: z.array(z.object({ id: z.string(), name: z.string(), category: z.string(), position: vector3, rotation: vector3, size: vector3, source, confidence: z.number().optional() })),
  labels: z.array(z.object({ id: z.string(), text: z.string(), position: vector3, source, pdf: z.object({ x: z.number(), y: z.number(), page: z.number() }).optional() })).min(1)
});

const sceneDir = path.join(root, "src", "data", "scenes");
const publicSceneDir = path.join(root, "public", "data", "scenes");
const files = fs.readdirSync(sceneDir).filter((file) => /^page-\d{2}\.json$/.test(file)).sort();
const publicFiles = fs.existsSync(publicSceneDir)
  ? fs.readdirSync(publicSceneDir).filter((file) => /^page-\d{2}\.json$/.test(file)).sort()
  : [];

if (files.length !== 18) {
  throw new Error(`Expected 18 source scene files, found ${files.length}`);
}

if (publicFiles.length !== 18) {
  throw new Error(`Expected 18 public scene files, found ${publicFiles.length}`);
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
  const publicPath = path.join(publicSceneDir, file);
  const publicScene = JSON.parse(fs.readFileSync(publicPath, "utf-8"));
  if (JSON.stringify(scene) !== JSON.stringify(publicScene)) {
    errors.push(`${file}: public scene differs from source scene`);
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validated ${files.length} scene files`);
