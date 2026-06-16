import { LooseSceneSchema, SceneSchema } from "./schema";

export function getSceneValidationIssues(scene: unknown): string[] {
  const loose = LooseSceneSchema.safeParse(scene);
  if (!loose.success) {
    return loose.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
  }

  const value = loose.data;
  const issues: string[] = [];

  if (!SceneSchema.safeParse(scene).success) {
    if (value.cameraPresets.length === 0) {
      issues.push(`${value.id} has no camera presets`);
    }
    if (value.labels.length === 0) {
      issues.push(`${value.id} has no labels`);
    }
  }

  if (value.rooms.length === 0) {
    issues.push(`${value.id} has no rooms`);
  }

  for (const id of findDuplicateIds([
    ...value.cameraPresets.map((item) => item.id),
    ...value.rooms.map((item) => item.id),
    ...value.walls.map((item) => item.id),
    ...value.doors.map((item) => item.id),
    ...value.furniture.map((item) => item.id),
    ...value.labels.map((item) => item.id)
  ])) {
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
