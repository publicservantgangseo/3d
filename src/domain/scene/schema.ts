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

export const LooseSceneSchema = z.object({
  id: z.string().regex(/^page-\d{2}$/),
  pageNumber: z.number().int().min(1).max(18),
  title: z.string().min(1),
  sourcePdfPage: z.number().int().min(1).max(18),
  scale: z.object({
    pdfWidth: z.number().positive(),
    pdfHeight: z.number().positive(),
    worldUnitsPerPdfPoint: z.number().positive()
  }),
  cameraPresets: z.array(CameraPresetSchema),
  rooms: z.array(RoomSchema),
  walls: z.array(WallSchema),
  doors: z.array(DoorSchema),
  furniture: z.array(FurnitureSchema),
  labels: z.array(LabelSchema)
});

export const SceneSchema = LooseSceneSchema.extend({
  cameraPresets: z.array(CameraPresetSchema).min(1),
  labels: z.array(LabelSchema).min(1)
});

export type CameraPreset = z.infer<typeof CameraPresetSchema>;
export type Room = z.infer<typeof RoomSchema>;
export type Wall = z.infer<typeof WallSchema>;
export type Door = z.infer<typeof DoorSchema>;
export type Furniture = z.infer<typeof FurnitureSchema>;
export type SceneLabel = z.infer<typeof LabelSchema>;
export type Scene = z.infer<typeof SceneSchema>;
