"""Extract generated cutout-rig pieces while preserving their relative scale."""

from pathlib import Path
import importlib.util
import sys

from PIL import Image


PARTS = {
    "body": (0, 0, 520, 627),
    "upper-arm": (520, 0, 879, 627),
    "forearm": (879, 0, 1254, 627),
    "thigh": (0, 627, 520, 1254),
    "shin-foot": (520, 627, 879, 1254),
}


def load_processor(path: Path):
    spec = importlib.util.spec_from_file_location("sprite_processor", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot load sprite processor: {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main() -> None:
    source_path = Path(sys.argv[1])
    output_dir = Path(sys.argv[2])
    processor_path = Path(sys.argv[3])
    source = Image.open(source_path).convert("RGBA")
    if source.size != (1254, 1254):
        raise ValueError(f"Unexpected source size: {source.size}")

    processor = load_processor(processor_path)
    output_dir.mkdir(parents=True, exist_ok=True)

    for name, box in PARTS.items():
        cell = source.crop(box)
        cleaned = processor.remove_bg_magenta(cell, threshold=100, edge_threshold=150)
        alpha_bbox = cleaned.getchannel("A").getbbox()
        if alpha_bbox is None:
            raise ValueError(f"No visible pixels found for {name}")
        left, top, right, bottom = alpha_bbox
        padding = 8
        crop_box = (
            max(0, left - padding),
            max(0, top - padding),
            min(cleaned.width, right + padding),
            min(cleaned.height, bottom + padding),
        )
        part = cleaned.crop(crop_box)
        part.save(output_dir / f"{name}.png", optimize=True)
        print(f"{name}: {part.size}")


if __name__ == "__main__":
    main()
