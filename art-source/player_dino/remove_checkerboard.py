"""Remove a connected near-white preview background without touching white details.

Image generators sometimes bake their transparency checkerboard into the PNG.
Only neutral, bright pixels connected to the outer image border are removed, so
the dinosaur's eyes, tooth, and belly remain intact behind the dark outline.
"""

from collections import deque
from pathlib import Path
import sys

from PIL import Image


def is_background(pixel: tuple[int, int, int, int]) -> bool:
    red, green, blue, _alpha = pixel
    return min(red, green, blue) >= 235 and max(red, green, blue) - min(red, green, blue) <= 12


def main() -> None:
    source = Path(sys.argv[1])
    destination = Path(sys.argv[2])
    image = Image.open(source).convert("RGBA")
    pixels = image.load()
    width, height = image.size

    queue: deque[tuple[int, int]] = deque()
    visited = bytearray(width * height)

    def enqueue(x: int, y: int) -> None:
        offset = y * width + x
        if not visited[offset] and is_background(pixels[x, y]):
            visited[offset] = 1
            queue.append((x, y))

    for x in range(width):
        enqueue(x, 0)
        enqueue(x, height - 1)
    for y in range(height):
        enqueue(0, y)
        enqueue(width - 1, y)

    while queue:
        x, y = queue.popleft()
        red, green, blue, _alpha = pixels[x, y]
        pixels[x, y] = (red, green, blue, 0)
        if x:
            enqueue(x - 1, y)
        if x + 1 < width:
            enqueue(x + 1, y)
        if y:
            enqueue(x, y - 1)
        if y + 1 < height:
            enqueue(x, y + 1)

    destination.parent.mkdir(parents=True, exist_ok=True)
    image.save(destination, optimize=True)


if __name__ == "__main__":
    main()
