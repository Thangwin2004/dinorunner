"""Prepare the CC0 Ninja Girl frames for the PixiJS runtime.

The source exports use a different canvas size for each action. Every frame is
resized by the same factor without trimming, so the authored proportions and
bottom-center anchor remain stable when switching animations.
"""

from pathlib import Path

from PIL import Image


PROJECT_ROOT = Path(__file__).resolve().parents[2]
SOURCE_DIR = Path(__file__).resolve().parent / "source" / "png"
OUTPUT_ROOT = PROJECT_ROOT / "public" / "assest" / "image" / "player_ninja"
RUNTIME_SCALE = 0.5
ACTIONS = ("Run", "Jump", "Slide")


def main() -> None:
    for action in ACTIONS:
        output_dir = OUTPUT_ROOT / action.lower()
        output_dir.mkdir(parents=True, exist_ok=True)

        for index in range(10):
            source = SOURCE_DIR / f"{action}__{index:03d}.png"
            destination = output_dir / f"{action.lower()}-{index + 1:02d}.png"

            with Image.open(source).convert("RGBA") as frame:
                size = (
                    round(frame.width * RUNTIME_SCALE),
                    round(frame.height * RUNTIME_SCALE),
                )
                frame.resize(size, Image.Resampling.LANCZOS).save(
                    destination,
                    format="PNG",
                    optimize=True,
                    compress_level=9,
                )

            print(destination.relative_to(PROJECT_ROOT))


if __name__ == "__main__":
    main()
