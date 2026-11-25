#!/usr/bin/env python3
"""WebP copies of the background layers for the single-file build.

The game is one HTML file with every picture inside it as base64, so the PNG layers of a parallax pack made the build
large (Ptuj's two packs: 11.5 MB of PNG). For every pack in data/backgrounds.json with "webp": {"quality": q}, this
writes a lossy WebP of each layer next to its PNG export, in a webp/ folder, and an index of which PNG each WebP was
made from. build.py embeds the WebP while it is fresh and falls back to the PNG (with a warning) when it is not.

The PNG exports stay the masters: lossless, for a larger PC build or a new export later. Alpha stays exact (WebP keeps
the alpha plane lossless); quality 90 was checked by eye against the PNG (18–19 Nov 2026, PR #34).

  python3 tools/art_bg_webp.py            write the missing or stale WebP files
  python3 tools/art_bg_webp.py --check    report missing or stale ones, exit 1 if any
"""
import hashlib, io, json, pathlib, sys
from PIL import Image, features

ROOT = pathlib.Path(__file__).resolve().parent.parent


def layer_files(man, season):
    """the PNG export of every layer the pack draws (the same filter as build.py)"""
    if man.get('layers'):
        return [L['file'] for L in man['layers']]
    return [L['export'] for L in man.get('layersBackToFront', []) if not L.get('previewOnly') and (not season or L.get('season') in (season, 'shared'))]


def webp_path(png_rel):
    p = pathlib.PurePosixPath(png_rel)
    return str(p.parent / 'webp' / (p.stem + '.webp'))


def jobs():
    """{png_rel: quality} over every pack that asks for WebP"""
    cfg = json.loads((ROOT / 'data/backgrounds.json').read_text(encoding='utf-8'))
    out = {}
    for pid, pc in cfg.get('packs', {}).items():
        q = (pc.get('webp') or {}).get('quality')
        if not q or not (ROOT / pc['manifest']).is_file():
            continue
        man = json.loads((ROOT / pc['manifest']).read_text(encoding='utf-8'))
        for f in layer_files(man, pc.get('season')):
            if (ROOT / f).is_file():
                out[f] = q
    return out


def index_path(png_rel):
    return ROOT / pathlib.PurePosixPath(png_rel).parent / 'webp' / 'index.json'


def load_index(png_rel):
    p = index_path(png_rel)
    return json.loads(p.read_text(encoding='utf-8')) if p.is_file() else {}


def stale(png_rel, q):
    """why the WebP of png_rel is not usable, or None"""
    e = load_index(png_rel).get(pathlib.PurePosixPath(png_rel).name)
    if not (ROOT / webp_path(png_rel)).is_file() or not e:
        return 'missing'
    if e['sha1'] != hashlib.sha1((ROOT / png_rel).read_bytes()).hexdigest():
        return 'its PNG changed'
    if e['quality'] != q:
        return f"quality {e['quality']}, data/backgrounds.json asks for {q}"
    return None


def main():
    if not features.check('webp'):
        sys.exit('Pillow was built without WebP support')
    todo = jobs()
    if '--check' in sys.argv:
        bad = [(f, why) for f, q in todo.items() if (why := stale(f, q))]
        for f, why in bad:
            print(f'{webp_path(f)}: {why}')
        print(f'ok: {len(todo)} WebP layers fresh' if not bad else f'{len(bad)} of {len(todo)} need python3 tools/art_bg_webp.py')
        sys.exit(1 if bad else 0)
    png_total = webp_total = made = 0
    for f, q in sorted(todo.items()):
        png = (ROOT / f).read_bytes()
        png_total += len(png)
        if stale(f, q):
            im = Image.open(io.BytesIO(png))
            im.load()
            buf = io.BytesIO()
            im.save(buf, 'WEBP', quality=q, method=6)
            out = ROOT / webp_path(f)
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_bytes(buf.getvalue())
            idx = load_index(f)
            idx[pathlib.PurePosixPath(f).name] = {'webp': out.name, 'sha1': hashlib.sha1(png).hexdigest(), 'quality': q,
                                                   'size': list(im.size), 'pngBytes': len(png), 'webpBytes': buf.tell()}
            index_path(f).write_text(json.dumps(dict(sorted(idx.items())), indent=1) + '\n', encoding='utf-8')
            made += 1
        webp_total += (ROOT / webp_path(f)).stat().st_size
    # WebP copies of layers no pack draws any more (a layer made previewOnly, a removed pack) go, with their index entries
    pruned = 0
    for d in {pathlib.PurePosixPath(f).parent for f in todo}:
        idx_p = ROOT / d / 'webp' / 'index.json'
        if not idx_p.is_file():
            continue
        idx = json.loads(idx_p.read_text(encoding='utf-8'))
        keep = {n: e for n, e in idx.items() if str(d / n) in todo}
        for n, e in idx.items():
            if n not in keep:
                (ROOT / d / 'webp' / e['webp']).unlink(missing_ok=True); pruned += 1
        if keep != idx:
            idx_p.write_text(json.dumps(dict(sorted(keep.items())), indent=1) + '\n', encoding='utf-8')
    print(f'{made} written, {len(todo) - made} already fresh, {pruned} unused removed; {len(todo)} layers: '
          f'{png_total / 1048576:.2f} MB PNG -> {webp_total / 1048576:.2f} MB WebP')


if __name__ == '__main__':
    main()
