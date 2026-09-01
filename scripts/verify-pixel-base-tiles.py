from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1] / 'assets' / 'base'
files = sorted(root.glob('base-*.png'))
if len(files) != 10:
    raise SystemExit(f'expected 10 base tiles, found {len(files)}')
for path in files:
    with Image.open(path).convert('RGBA') as image:
        if image.size != (16, 16):
            raise SystemExit(f'{path}: expected 16x16, got {image.size}')
        if min(image.getchannel('A').getdata()) != 255:
            raise SystemExit(f'{path}: transparent pixels found')
        pixels = image.load()
        if any(pixels[x, 0] != pixels[x, 15] for x in range(16)):
            raise SystemExit(f'{path}: top/bottom seam mismatch')
        if any(pixels[0, y] != pixels[15, y] for y in range(16)):
            raise SystemExit(f'{path}: left/right seam mismatch')
print(f'verified {len(files)} opaque 16x16 seamless pixel-art base tiles')
