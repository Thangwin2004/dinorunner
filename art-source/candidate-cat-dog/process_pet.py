"""Prepare the CC0 biped dog frames for the PixiJS runtime.

The source keeps every action on the same 547x481 canvas, but jump and slide
contain authored horizontal travel. The endless-runner player must stay at a
fixed x position, so frames are aligned by their visible horizontal center.
Every action is then resized by one shared factor without trimming.
"""

from pathlib import Path

from PIL import Image


PROJECT_ROOT = Path(__file__).resolve().parents[2]
SOURCE_DIR = Path(__file__).resolve().parent / "source" / "png" / "dog"
OUTPUT_ROOT = PROJECT_ROOT / "public" / "assest" / "image" / "player_pet"
RUNTIME_SCALE = 0.5
ACTION_FRAME_COUNTS = {"Run": 8, "Jump": 8, "Slide": 10}


def visible_center_x(frame: Image.Image) -> float:
    bounds = frame.getbbox()
    if bounds is None:
        return frame.width / 2
    return (bounds[0] + bounds[2]) / 2


def main() -> None:
    with Image.open(SOURCE_DIR / "Run (1).png").convert("RGBA") as reference:
        target_center_x = visible_center_x(reference)

    for action, frame_count in ACTION_FRAME_COUNTS.items():
        output_dir = OUTPUT_ROOT / action.lower()
        output_dir.mkdir(parents=True, exist_ok=True)

        for index in range(1, frame_count + 1):
            source = SOURCE_DIR / f"{action} ({index}).png"
            destination = output_dir / f"{action.lower()}-{index:02d}.png"

            with Image.open(source).convert("RGBA") as frame:
                offset_x = round(target_center_x - visible_center_x(frame))
                bounds = frame.getbbox()
                offset_y = frame.height - bounds[3] if bounds else 0
                aligned = Image.new("RGBA", frame.size, (0, 0, 0, 0))
                aligned.alpha_composite(frame, (offset_x, offset_y))
                size = (
                    round(aligned.width * RUNTIME_SCALE),
                    round(aligned.height * RUNTIME_SCALE),
                )
                aligned.resize(size, Image.Resampling.LANCZOS).save(
                    destination,
                    format="PNG",
                    optimize=True,
                    compress_level=9,
                )

            print(destination.relative_to(PROJECT_ROOT))


if __name__ == "__main__":
    main()
