"""Copy and optimize the selected CC0 obstacle art for runtime use."""

from pathlib import Path

from PIL import Image


PROJECT_ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = PROJECT_ROOT / "public" / "assest" / "image" / "obstacles"
PADDING = 2
SOURCES = {
    "stone.png": PROJECT_ROOT
    / "art-source/pzuh-free-tileset/source/png/Object/Stone.png",
    "crate.png": PROJECT_ROOT
    / "art-source/pzuh-free-tileset/source/png/Object/Crate.png",
    "rock-monster.png": PROJECT_ROOT
    / "art-source/bevouliin-rock-obstacle/source/rock-obstacle.png",
    "spikes.png": PROJECT_ROOT
    / "art-source/kenney-jumper/source/PNG/Environment/spikes_top.png",
    "spike-ball.png": PROJECT_ROOT
    / "art-source/kenney-jumper/source/PNG/Enemies/spikeBall1.png",
    "flying-enemy.png": PROJECT_ROOT
    / "art-source/kenney-jumper/source/PNG/Enemies/wingMan3.png",
}


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    for output_name, source in SOURCES.items():
        with Image.open(source).convert("RGBA") as image:
            bounds = image.getbbox()
            if bounds:
                left = max(0, bounds[0] - PADDING)
                top = max(0, bounds[1] - PADDING)
                right = min(image.width, bounds[2] + PADDING)
                bottom = min(image.height, bounds[3] + PADDING)
                image = image.crop((left, top, right, bottom))

            destination = OUTPUT_DIR / output_name
            image.save(destination, format="PNG", optimize=True, compress_level=9)
            print(destination.relative_to(PROJECT_ROOT))


if __name__ == "__main__":
    main()
