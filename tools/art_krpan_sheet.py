#!/usr/bin/env python3
"""Pack Martin Krpan's gameplay frames into one sheet for the Visoka setting (Nastavitve → Razvoj → Kakovost slik).

Reads art/manifests/martin-krpan.json (Codex's pack): every entry of "sequences" is a row, its frames
("framesBackToFront") the columns, each 48×48. Writes
  art/exports/characters/martin-krpan/martin-krpan-sheet.png    cols × rows frames, transparent
  art/exports/characters/martin-krpan/martin-krpan-sheet.json   {frame, cols, rows, seqs: {id: {row, frames}}}
build.py embeds both. A sequence added to the manifest later (the running and victory frames) becomes a row here
with no other change; src/backgrounds.js (HERO_SEQ) says which sequence is shown for what.

  python3 tools/art_krpan_sheet.py           write the sheet
  python3 tools/art_krpan_sheet.py --check   fail if the sheet is missing or no longer matches the frames
"""
import json, pathlib, sys
from PIL import Image, ImageChops

ROOT = pathlib.Path(__file__).resolve().parent.parent
MAN = ROOT / 'art/manifests/martin-krpan.json'
OUT = ROOT / 'art/exports/characters/martin-krpan'
FRAME = 48


def build():
    man = json.loads(MAN.read_text(encoding='utf-8'))
    seqs = man['sequences']
    cols = max(len(s['framesBackToFront']) for s in seqs)
    sheet = Image.new('RGBA', (cols * FRAME, len(seqs) * FRAME), (0, 0, 0, 0))
    index = {}
    for r, s in enumerate(seqs):
        for c, rel in enumerate(s['framesBackToFront']):
            im = Image.open(ROOT / rel).convert('RGBA')
            assert im.size == (FRAME, FRAME), f'{rel} is {im.size}, expected {FRAME}×{FRAME}'
            sheet.paste(im, (c * FRAME, r * FRAME))
        index[s['id']] = {'row': r, 'frames': len(s['framesBackToFront'])}
    return sheet, {'frame': FRAME, 'cols': cols, 'rows': len(seqs), 'seqs': index}


if __name__ == '__main__':
    sheet, idx = build()
    png, js = OUT / 'martin-krpan-sheet.png', OUT / 'martin-krpan-sheet.json'
    if '--check' in sys.argv:
        ok = png.is_file() and js.is_file() and json.loads(js.read_text(encoding='utf-8')) == idx \
            and not ImageChops.difference(Image.open(png).convert('RGBA'), sheet).getbbox()
        print('ok' if ok else 'the Krpan sheet is out of date: run python3 tools/art_krpan_sheet.py')
        sys.exit(0 if ok else 1)
    sheet.save(png, optimize=True)
    js.write_text(json.dumps(idx, indent=1) + '\n', encoding='utf-8')
    print(f'{png.relative_to(ROOT)}: {sheet.size[0]}×{sheet.size[1]}, {len(idx["seqs"])} sequences, {png.stat().st_size} bytes')
