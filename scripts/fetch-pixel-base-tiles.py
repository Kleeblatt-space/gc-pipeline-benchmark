from pathlib import Path
from tempfile import TemporaryDirectory
import subprocess
from zipfile import ZipFile
from io import BytesIO
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets' / 'base'
URL = 'https://kenney.nl/media/pages/assets/roguelike-rpg-pack/12c03cd78b-1677697420/kenney_roguelike-rpg-pack.zip'
# Full 16x16 cells from the official spritesheet; selected only after opaque four-edge seam validation.
CELLS = [(0, 0), (5, 0), (6, 0), (7, 0), (8, 0), (9, 0), (5, 1), (6, 1), (7, 1), (8, 1)]

with TemporaryDirectory() as tmp:
    archive = Path(tmp) / 'kenney.zip'
    subprocess.run(['curl', '--location', '--fail', '--retry', '4', '--retry-all-errors', '--silent', '--show-error', URL, '--output', str(archive)], check=True)
    with ZipFile(archive) as zf:
        sheet = Image.open(BytesIO(zf.read('Spritesheet/roguelikeSheet_transparent.png'))).convert('RGBA')
        license_text = zf.read('License.txt').decode('utf-8', errors='replace')
    OUT.mkdir(parents=True, exist_ok=True)
    for old in OUT.glob('base-*.png'):
        old.unlink()
    for index, (col, row) in enumerate(CELLS, start=1):
        left, top = col * 17, row * 17
        tile = sheet.crop((left, top, left + 16, top + 16))
        pixels = tile.load()
        if min(tile.getchannel('A').getdata()) != 255:
            raise RuntimeError(f'tile {col},{row} contains transparent pixels')
        if any(pixels[x, 0] != pixels[x, 15] for x in range(16)):
            raise RuntimeError(f'tile {col},{row} is not vertically seamless')
        if any(pixels[0, y] != pixels[15, y] for y in range(16)):
            raise RuntimeError(f'tile {col},{row} is not horizontally seamless')
        tile.save(OUT / f'base-{index:02d}.png')
    (OUT / 'KENNEY_LICENSE.txt').write_text(license_text, encoding='utf-8')
    (OUT / 'SOURCES.md').write_text('''# Pixel-Art-Base-Tiles\n\nDie `base-01.png` bis `base-10.png` sind unveränderte 16×16-Rasterzellen aus dem Kenney **Roguelike/RPG pack**. Das offizielle Pack ist als 2D-Pixel-Art mit 16×16 Tile size und Creative Commons CC0 ausgewiesen.\n\nQuelle: https://kenney.nl/assets/roguelike-rpg-pack\nDownload: ''' + URL + '''\nLizenzreferenz: https://creativecommons.org/publicdomain/zero/1.0/\n\nAuswahl der Spritesheet-Zellen (Spalte, Zeile; 1px Rasterabstand):\n\n| Datei | Zelle | Verwendung |\n|---|---:|---|\n| base-01.png | (0, 0) | Wasserfläche |\n| base-02.png | (5, 0) | Erd-/Steinboden |\n| base-03.png | (6, 0) | Grauer Steinboden |\n| base-04.png | (7, 0) | Heller Stein-/Sandboden |\n| base-05.png | (8, 0) | Heller Fliesenboden |\n| base-06.png | (9, 0) | Dunkler Boden |\n| base-07.png | (5, 1) | Erd-/Bodenvariante |\n| base-08.png | (6, 1) | Steinvariante |\n| base-09.png | (7, 1) | Helle Bodenvariante |\n| base-10.png | (8, 1) | Helle Fliesenvariante |\n\nDie Originaldatei `KENNEY_LICENSE.txt` wird neben den Tiles abgelegt.\n''', encoding='utf-8')
print(f'created {len(CELLS)} genuine 16x16 pixel-art tiles in {OUT}')
