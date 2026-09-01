from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1] / 'assets' / 'base' / '1024x1024'
for path in sorted(root.glob('*.png')):
    with Image.open(path) as image:
        print(f'{path.name}: format={image.format}, size={image.size}, mode={image.mode}, bytes={path.stat().st_size}')
        if image.size != (1024, 1024):
            raise SystemExit(f'wrong size: {path}')
        if image.format != 'PNG':
            raise SystemExit(f'wrong format: {path}')
print(f'verified {len(list(root.glob("*.png")))} HD assets')
