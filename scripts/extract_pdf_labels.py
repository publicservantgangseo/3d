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
                    "rawX": round(float(tm[4]), 4),
                    "rawY": round(float(tm[5]), 4),
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
