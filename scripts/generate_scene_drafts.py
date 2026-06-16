import argparse
import json
import re
import shutil
from pathlib import Path
from typing import Any

PDF_WIDTH = 842.0
PDF_HEIGHT = 1191.0
WORLD_SCALE = 0.01

FURNITURE_PATTERNS = [
    (re.compile(r"민원대|접수|카운터|안내"), "service-counter", [2.4, 0.95, 0.75]),
    (re.compile(r"책상|desk", re.IGNORECASE), "desk", [1.2, 0.72, 0.7]),
    (re.compile(r"의자|chair", re.IGNORECASE), "chair", [0.48, 0.82, 0.48]),
    (re.compile(r"대기|벤치|소파"), "waiting-seat", [1.6, 0.72, 0.68]),
    (re.compile(r"테이블|회의|table", re.IGNORECASE), "table", [1.8, 0.74, 0.9]),
    (re.compile(r"옷장|캐비닛|서랍|수납"), "cabinet", [0.9, 1.6, 0.45]),
    (re.compile(r"냉장고|정수기|전자레인지|커피머신|세탁기"), "appliance", [0.7, 1.7, 0.7]),
    (re.compile(r"X-RAY|원심분리기|실험대|개수대|기계|장비|검사", re.IGNORECASE), "equipment", [1.0, 1.0, 0.8]),
    (re.compile(r"창고|서고|보관"), "storage", [1.2, 1.4, 0.55]),
]

ROOM_COLORS = ["#dbeafe", "#dcfce7", "#fef3c7", "#fee2e2", "#ede9fe", "#e0f2fe"]

PAGE_TITLES = {
    1: "민원인 라운지",
    2: "민원/세무/은행",
    3: "구청장실/대회의실",
    4: "업무공간 04",
    5: "업무공간 05",
    6: "업무공간 06",
    7: "업무공간 07",
    8: "식당/지원공간",
    9: "검사/실험공간",
    10: "진료/보건공간 10",
    11: "보건/상담공간 11",
    12: "보건관리/시청각실",
    13: "의회/본회의장 13",
    14: "위원회실 14",
    15: "의장실/의회사무 15",
    16: "의원실/회의실 16",
    17: "예방접종/진료공간",
    18: "자원봉사센터/키즈카페",
}


def classify_furniture(text: str) -> tuple[str, list[float]] | None:
    for pattern, category, size in FURNITURE_PATTERNS:
        if pattern.search(text):
            return category, size
    return None


def is_room_label(text: str) -> bool:
    if len(text) < 2:
        return False
    if re.search(r"\d{2,4}[*xX]\d{2,4}|\d+kg|\d+L|커피머신|냉장고|정수기|전자레인지", text):
        return False
    return bool(re.search(r"과|실|홀|라운지|센터|도서관|전시관|회의|상담|창고|서고|로비|방풍|의회|카페", text))


def normalize_labels(labels: list[dict[str, Any]]) -> list[dict[str, Any]]:
    if not labels:
        return []

    min_x = min(float(label["rawX"]) for label in labels)
    max_x = max(float(label["rawX"]) for label in labels)
    min_y = min(float(label["rawY"]) for label in labels)
    max_y = max(float(label["rawY"]) for label in labels)
    x_span = max(max_x - min_x, 1.0)
    y_span = max(max_y - min_y, 1.0)

    normalized = []
    for label in labels:
        raw_x = float(label["rawX"])
        raw_y = float(label["rawY"])
        pdf_x = ((raw_x - min_x) / x_span) * PDF_WIDTH
        pdf_y = PDF_HEIGHT - ((raw_y - min_y) / y_span) * PDF_HEIGHT
        normalized.append({**label, "x": round(pdf_x, 4), "y": round(pdf_y, 4)})
    return normalized


def pdf_to_world(x: float, y: float, y_offset: float = 0.04) -> list[float]:
    world_x = (x - PDF_WIDTH / 2) * WORLD_SCALE
    world_z = (PDF_HEIGHT / 2 - y) * WORLD_SCALE
    return [round(world_x, 4), y_offset, round(world_z, 4)]


def boundary_walls(page_number: int) -> list[dict[str, Any]]:
    width = PDF_WIDTH * WORLD_SCALE
    depth = PDF_HEIGHT * WORLD_SCALE
    wall_height = 1.8
    thickness = 0.08
    return [
        {
            "id": f"wall-{page_number:02d}-north",
            "position": [0, wall_height / 2, -depth / 2],
            "rotation": [0, 0, 0],
            "size": [width, wall_height, thickness],
            "source": "derived",
        },
        {
            "id": f"wall-{page_number:02d}-south",
            "position": [0, wall_height / 2, depth / 2],
            "rotation": [0, 0, 0],
            "size": [width, wall_height, thickness],
            "source": "derived",
        },
        {
            "id": f"wall-{page_number:02d}-west",
            "position": [-width / 2, wall_height / 2, 0],
            "rotation": [0, 0, 0],
            "size": [thickness, wall_height, depth],
            "source": "derived",
        },
        {
            "id": f"wall-{page_number:02d}-east",
            "position": [width / 2, wall_height / 2, 0],
            "rotation": [0, 0, 0],
            "size": [thickness, wall_height, depth],
            "source": "derived",
        },
    ]


def build_scene(label_file: Path, page_number: int) -> dict[str, Any]:
    payload = json.loads(label_file.read_text(encoding="utf-8"))
    labels = normalize_labels(payload["labels"])
    title = PAGE_TITLES.get(page_number) or (labels[0]["text"] if labels else f"Page {page_number:02d}")

    scene_labels = []
    rooms = []
    furniture = []
    seen_room_names: set[str] = set()

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

        if is_room_label(label["text"]) and label["text"] not in seen_room_names:
            seen_room_names.add(label["text"])
            rooms.append(
                {
                    "id": f"room-{page_number:02d}-{len(rooms) + 1:03d}",
                    "name": label["text"],
                    "category": "office",
                    "position": [position[0], 0.01, position[2]],
                    "size": [1.45, 0.08, 0.95],
                    "color": ROOM_COLORS[len(rooms) % len(ROOM_COLORS)],
                    "source": "derived",
                }
            )

        furniture_match = classify_furniture(label["text"])
        if furniture_match:
            category, size = furniture_match
            furniture.append(
                {
                    "id": f"furniture-{page_number:02d}-{len(furniture) + 1:03d}",
                    "name": label["text"],
                    "category": category,
                    "position": [position[0], max(size[1] / 2, 0.2), position[2]],
                    "rotation": [0, 0, 0],
                    "size": size,
                    "source": "derived",
                    "confidence": 0.55,
                }
            )

    if not rooms and scene_labels:
        first = scene_labels[0]
        rooms.append(
            {
                "id": f"room-{page_number:02d}-001",
                "name": title,
                "category": "office",
                "position": [first["position"][0], 0.01, first["position"][2]],
                "size": [1.45, 0.08, 0.95],
                "color": ROOM_COLORS[0],
                "source": "derived",
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
                "position": [0, 13, 15],
                "target": [0, 0, 0],
            },
            {
                "id": "top",
                "name": "평면 보기",
                "position": [0, 20, 0.01],
                "target": [0, 0, 0],
            },
        ],
        "rooms": rooms[:80],
        "walls": boundary_walls(page_number),
        "doors": [],
        "furniture": furniture[:160],
        "labels": scene_labels[:220],
    }


def write_scene(scene: dict[str, Any], out_dir: Path) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    target = out_dir / f"{scene['id']}.json"
    target.write_text(json.dumps(scene, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--labels", required=True)
    parser.add_argument("--out", required=True)
    parser.add_argument("--public-out", required=False)
    args = parser.parse_args()

    labels_dir = Path(args.labels)
    out_dir = Path(args.out)
    public_out_dir = Path(args.public_out) if args.public_out else None

    if out_dir.exists():
        shutil.rmtree(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    if public_out_dir:
        if public_out_dir.exists():
            shutil.rmtree(public_out_dir)
        public_out_dir.mkdir(parents=True, exist_ok=True)

    for page_number in range(1, 19):
        label_file = labels_dir / f"page-{page_number:02d}-labels.json"
        scene = build_scene(label_file, page_number)
        write_scene(scene, out_dir)
        if public_out_dir:
            write_scene(scene, public_out_dir)


if __name__ == "__main__":
    main()
