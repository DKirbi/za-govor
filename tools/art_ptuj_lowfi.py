#!/usr/bin/env python3
"""Lower-fidelity copies of the Ptuj pack for the Nizka setting (Nastavitve → Razvoj).

Every exported layer is written at half resolution, rounded up, into art/exports/environments/ptuj-low/ with the
same folders as art/exports/environments/ptuj/. The art is unchanged; only the pixel count drops, so a low-fidelity
layer uses about a quarter of the memory of its high-fidelity file. The game draws it at the manifest's size, so
offsets and placement stay the same in both settings.

Usage:
  python3 tools/art_ptuj_lowfi.py           write the low copies
  python3 tools/art_ptuj_lowfi.py --check   fail if a low copy is missing or no longer matches its high file
"""
import argparse
import pathlib

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[1]
SRC = ROOT / 'art/exports/environments/ptuj'
DST = ROOT / 'art/exports/environments/ptuj-low'
LANCZOS = getattr(Image, 'Resampling', Image).LANCZOS


def half(im):
    """Half size, rounded up. Transparent edges are resampled premultiplied so they do not darken the picture."""
    w, h = im.size
    size = ((w + 1) // 2, (h + 1) // 2)
    if 'A' in im.getbands():
        return im.convert('RGBa').resize(size, LANCZOS).convert('RGBA')
    return im.convert('RGB').resize(size, LANCZOS)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--check', action='store_true', help='check the low copies against the high files instead of writing')
    args = ap.parse_args()
    ok = True
    for src in sorted(SRC.rglob('*.png')):
        rel = src.relative_to(SRC)
        dst = DST / rel
        high = Image.open(src)
        expected = ((high.width + 1) // 2, (high.height + 1) // 2)
        if args.check:
            if not dst.is_file() or Image.open(dst).size != expected:
                print('missing or stale:', dst.relative_to(ROOT))
                ok = False
            continue
        dst.parent.mkdir(parents=True, exist_ok=True)
        half(high).save(dst, optimize=True)
        print(rel, high.size, '->', expected)
    if args.check:
        print('ok' if ok else 'low copies are out of date: run python3 tools/art_ptuj_lowfi.py')
    raise SystemExit(0 if ok else 1)


if __name__ == '__main__':
    main()
