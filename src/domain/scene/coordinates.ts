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

export function pdfPointToWorld({
  x,
  y,
  pdfWidth,
  pdfHeight,
  scale,
  yOffset = 0.04
}: PdfToWorldInput): [number, number, number] {
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
