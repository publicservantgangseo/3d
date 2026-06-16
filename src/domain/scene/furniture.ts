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
