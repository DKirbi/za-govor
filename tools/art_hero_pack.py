#!/usr/bin/env python3
"""One hero's gameplay sprite pack: export frames from the source atlases, pack the runtime sheet, write the previews,
and validate it all. Works for any hero whose manifest follows docs/art-benchmarks/hero-sprites/README.md; Martin Krpan
(art/manifests/martin-krpan.json) is the first.

What it reads (art/manifests/<pack>.json):
  export          {frame, baselineRow, alphaThreshold, palette: [hex…], scale}   the pack's export rules
  sequences[]     {id, sourceAtlas, sourceLayout: {columns, rows, frameOrder, fit, scale?}, framesBackToFront: [png…]}
                  fit "scale": every frame of the sequence at one scale (output px per source px; the sequence's own
                  `scale`, else export.scale), the union of the frames centred, each frame's lowest pixel on baselineRow.
                  One scale per sequence keeps a run cycle's bob and a hero's size the same from state to state.
                  fit "cell": the whole atlas cell resampled to the frame (how the first Krpan frames were made).
  runtimeSheet    {path, frameOrder}          the idle | attack strip every card and portrait uses
  preview, animationPreview                   review-only contact sheet (PNG) and player (HTML)

What it writes:
  the frames of the sequences you name (--only) or whose frames are missing; frames already committed are left alone
  art/exports/characters/<pack>/<pack>-sheet.png + .json   one row per sequence, `frame`×`frame` cells (build.py embeds it)
  the strip, the contact sheet and the animation preview

  python3 tools/art_hero_pack.py art/manifests/martin-krpan.json                  export missing frames, rebuild the rest
  python3 tools/art_hero_pack.py art/manifests/martin-krpan.json --only running,downed   re-export these sequences
  python3 tools/art_hero_pack.py --check                                         validate every hero in data/hero-art.json
"""
import json, pathlib, sys
import numpy as np
from PIL import Image, ImageChops, ImageDraw

ROOT = pathlib.Path(__file__).resolve().parent.parent
REGISTRY = ROOT / 'data/hero-art.json'
HELD = {'downed'}   # held states are one frame; every other sequence is a four-frame animation (the sheet's CSS steps through 4)


def load(manifest_rel):
    path = ROOT / manifest_rel
    man = json.loads(path.read_text(encoding='utf-8'))
    ex = man['export']
    pal = np.array([tuple(bytes.fromhex(c)) for c in ex['palette']], dtype=np.int32)
    return path.stem, man, ex, pal


def quantize(rgba, ex, pal):
    """binary alpha at alphaThreshold, every opaque pixel to its nearest palette colour"""
    out = np.zeros(rgba.shape, np.uint8)
    on = rgba[..., 3] >= ex['alphaThreshold']
    if on.any():
        px = rgba[on][:, :3].astype(np.int32)
        idx = ((px[:, None, :] - pal[None, :, :]) ** 2).sum(2).argmin(1)
        out[on] = np.concatenate([pal[idx], np.full((len(idx), 1), 255)], 1).astype(np.uint8)
    return out


def sample(src, box, w, h):
    """nearest-neighbour: output pixel centres mapped into box (x0, y0, x1, y1) of src"""
    x0, y0, x1, y1 = box
    xs = np.minimum(x1 - 1, x0 + ((np.arange(w) + 0.5) * (x1 - x0) / w).astype(int))
    ys = np.minimum(y1 - 1, y0 + ((np.arange(h) + 0.5) * (y1 - y0) / h).astype(int))
    return src[ys][:, xs]


def to_baseline(frame, row):
    ys = np.nonzero(frame[..., 3])[0]
    if not len(ys):
        raise ValueError('empty frame')
    shift = row - ys.max()
    out = np.zeros_like(frame)
    if shift >= 0:
        out[shift:] = frame[:frame.shape[0] - shift]
    else:
        out[:shift] = frame[-shift:]
    return out


def export_sequence(seq, ex, pal):
    lay, F = seq['sourceLayout'], ex['frame']
    atlas = np.array(Image.open(ROOT / seq['sourceAtlas']).convert('RGBA'))
    H, W = atlas.shape[:2]
    cw, ch = W // lay['columns'], H // lay['rows']
    cells = []
    for n in lay['frameOrder']:
        c, r = (n - 1) % lay['columns'], (n - 1) // lay['columns']
        cells.append((c * cw, r * ch, (c + 1) * cw, (r + 1) * ch))
    frames = []
    if lay['fit'] == 'cell':
        for box in cells:
            frames.append(to_baseline(quantize(sample(atlas, box, F, F), ex, pal), ex['baselineRow']))
        return frames
    if lay['fit'] != 'scale':
        raise ValueError(f"{seq['id']}: sourceLayout.fit must be 'scale' or 'cell'")
    s = lay.get('scale', ex['scale'])
    # the union of the opaque bounds of every frame, in cell coordinates: one box, so the frames keep their motion
    on = atlas[..., 3] >= ex['alphaThreshold']
    bx = []
    for (x0, y0, x1, y1) in cells:
        ys, xs = np.nonzero(on[y0:y1, x0:x1])
        if not len(xs):
            raise ValueError(f"{seq['id']}: an empty cell in {seq['sourceAtlas']}")
        bx.append((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    u = (min(b[0] for b in bx), min(b[1] for b in bx), max(b[2] for b in bx), max(b[3] for b in bx))
    w, h = round((u[2] - u[0]) * s), round((u[3] - u[1]) * s)
    if w > F or h > F:
        raise ValueError(f"{seq['id']}: at scale {s} the sequence is {w}×{h}, larger than {F}×{F}; lower its scale")
    ox, oy = (F - w) // 2, F - h
    for (x0, y0, _, _) in cells:
        frame = np.zeros((F, F, 4), np.uint8)
        frame[oy:oy + h, ox:ox + w] = quantize(sample(atlas, (x0 + u[0], y0 + u[1], x0 + u[2], y0 + u[3]), w, h), ex, pal)
        frames.append(to_baseline(frame, ex['baselineRow']))
    return frames


def sheet_of(man, ex):
    seqs, F = man['sequences'], ex['frame']
    cols = max(len(s['framesBackToFront']) for s in seqs)
    sheet = Image.new('RGBA', (cols * F, len(seqs) * F), (0, 0, 0, 0))
    index = {}
    for r, s in enumerate(seqs):
        for c, rel in enumerate(s['framesBackToFront']):
            sheet.paste(Image.open(ROOT / rel).convert('RGBA'), (c * F, r * F))
        index[s['id']] = {'row': r, 'frames': len(s['framesBackToFront'])}
    return sheet, {'frame': F, 'cols': cols, 'rows': len(seqs), 'seqs': index}


def strip_of(man, ex):
    rs, F = man['runtimeSheet'], ex['frame']
    base = pathlib.PurePosixPath(man['sequences'][0]['framesBackToFront'][0]).parent.parent
    strip = Image.new('RGBA', (len(rs['frameOrder']) * F, F), (0, 0, 0, 0))
    for i, rel in enumerate(rs['frameOrder']):
        strip.paste(Image.open(ROOT / base / rel).convert('RGBA'), (i * F, 0))
    return strip


def contact_sheet(man, ex, zoom=4):
    F, seqs = ex['frame'], man['sequences']
    cols = max(len(s['framesBackToFront']) for s in seqs)
    cell, label = F * zoom + 16, 220
    im = Image.new('RGBA', (label + cols * cell, 40 + len(seqs) * cell), (25, 30, 42, 255))
    d = ImageDraw.Draw(im)
    d.text((12, 12), f"{man['pack']} · {F}x{F} frames, baseline row {ex['baselineRow']} · review only, not read by the game", fill=(244, 205, 128))
    for r, s in enumerate(seqs):
        y = 40 + r * cell
        d.text((12, y + cell // 2 - 6), s['id'], fill=(238, 233, 218))
        for c, rel in enumerate(s['framesBackToFront']):
            fr = Image.open(ROOT / rel).convert('RGBA').resize((F * zoom, F * zoom), Image.NEAREST)
            x = label + c * cell
            d.rectangle((x, y, x + F * zoom - 1, y + F * zoom - 1), fill=(38, 46, 62, 255))
            im.alpha_composite(fr, (x, y))
    return im


PLAYER = """<!doctype html>
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>%(pack)s — sprite preview</title>
<!-- Written by tools/art_hero_pack.py from %(manifest)s. Review only: the game reads the sheet, not this page. -->
<style>
  :root { color-scheme: dark; font: 16px system-ui, sans-serif; background: #191e2a; color: #eee9da; }
  body { margin: 2rem auto; max-width: 820px; padding: 0 1rem; } h1 { color: #f4cd80; font-size: 1.3rem; }
  .controls { display: flex; gap: .5rem; flex-wrap: wrap; }
  button { color: inherit; background: #393447; border: 1px solid #756a78; border-radius: .35rem; padding: .45rem .7rem; cursor: pointer; }
  button[aria-pressed="true"] { background: #6b5a2e; border-color: #f4cd80; }
  .stage { margin: 1rem 0; min-height: 300px; display: grid; place-items: center; border: 1px solid #393447;
    background: repeating-conic-gradient(#202636 0 25%%, #1b2230 0 50%%) 50%% / 32px 32px; }
  .stage img { width: 288px; height: 288px; image-rendering: pixelated; } .note { color: #c0aa8e; }
</style>
<body>
<h1>%(pack)s</h1>
<div class="controls" role="group" aria-label="Sequence"></div>
<div class="stage"><img id="sprite" alt=""></div>
<p id="label" aria-live="polite"></p>
<p class="note">Each frame is its own %(frame)s×%(frame)s PNG. Animated sequences play at 6 frames a second (loops repeat,
one-shots hold their last frame); held states show their one frame.</p>
<script>
const SEQ = %(seqs)s;
const img = document.querySelector('#sprite'), label = document.querySelector('#label'), bar = document.querySelector('.controls');
let cur = SEQ[0], f = 0, last = 0;
const show = () => { img.src = cur.frames[f]; img.alt = `${cur.id}, frame ${f + 1} of ${cur.frames.length}`; label.textContent = img.alt; };
SEQ.forEach(s => { const b = document.createElement('button'); b.textContent = s.id; b.setAttribute('aria-pressed', s === cur);
  b.onclick = () => { cur = s; f = 0; last = 0; bar.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); show(); }; bar.append(b); });
const loop = id => /idle|running/.test(id);
(function tick(now) { if (cur.frames.length > 1 && now - last >= 166 && (loop(cur.id) || f < cur.frames.length - 1)) {
  f = (f + 1) %% cur.frames.length; last = now; show(); } requestAnimationFrame(tick); })(0);
show();
</script>
</body></html>
"""


def player_of(man, manifest_rel, ex):
    out = ROOT / man['animationPreview']
    seqs = [{'id': s['id'], 'frames': [str(pathlib.Path(*(['..'] * (len(out.relative_to(ROOT).parts) - 1)), rel)).replace('\\', '/')
                                        for rel in s['framesBackToFront']]} for s in man['sequences']]
    return PLAYER % {'pack': man['pack'], 'manifest': manifest_rel, 'frame': ex['frame'], 'seqs': json.dumps(seqs, indent=1)}


def save_if_changed(img, path):
    """write a PNG only when its pixels change, so re-running the tool leaves committed files alone"""
    path = pathlib.Path(path)
    if path.is_file():
        old = Image.open(path)
        if old.size == img.size and old.mode == img.mode and not ImageChops.difference(old.convert('RGBA'), img.convert('RGBA')).getbbox():
            return
    img.save(path, optimize=True)


def outputs(stem):
    base = ROOT / 'art/exports/characters' / stem
    return base / f'{stem}-sheet.png', base / f'{stem}-sheet.json'


def validate(manifest_rel):
    """every problem with the pack as committed, as a list of strings (empty = valid)"""
    stem, man, ex, pal = load(manifest_rel)
    F, base, bad = ex['frame'], ex['baselineRow'], []
    palset = {tuple(int(v) for v in c) for c in pal}
    for s in man['sequences']:
        n = len(s['framesBackToFront'])
        want = 1 if s['id'] in HELD else 4
        if n != want:
            bad.append(f"{s['id']}: {n} frames, the convention is {want}")
        for rel in s['framesBackToFront']:
            p = ROOT / rel
            if not p.is_file():
                bad.append(f'{rel}: missing'); continue
            a = np.array(Image.open(p).convert('RGBA'))
            if a.shape[:2] != (F, F):
                bad.append(f'{rel}: {a.shape[1]}×{a.shape[0]}, expected {F}×{F}'); continue
            if not set(np.unique(a[..., 3])) <= {0, 255}:
                bad.append(f'{rel}: alpha is not binary')
            ys = np.nonzero(a[..., 3])[0]
            if not len(ys) or ys.max() != base:
                bad.append(f'{rel}: lowest pixel is not on row {base}')
            cols = {tuple(int(v) for v in c) for c in a[a[..., 3] == 255][:, :3]}
            if not cols <= palset:
                bad.append(f'{rel}: {len(cols - palset)} colours outside the pack palette')
    if bad:
        return bad
    png, js = outputs(stem)
    sheet, idx = sheet_of(man, ex)
    if not (png.is_file() and js.is_file()) or json.loads(js.read_text(encoding='utf-8')) != idx \
            or ImageChops.difference(Image.open(png).convert('RGBA'), sheet).getbbox():
        bad.append(f'{png.relative_to(ROOT)} is out of date: run python3 tools/art_hero_pack.py {manifest_rel}')
    strip, sp = strip_of(man, ex), ROOT / man['runtimeSheet']['path']
    if not sp.is_file() or ImageChops.difference(Image.open(sp).convert('RGBA'), strip).getbbox():
        bad.append(f"{man['runtimeSheet']['path']} is out of date: run python3 tools/art_hero_pack.py {manifest_rel}")
    return bad


def build(manifest_rel, only=None):
    stem, man, ex, pal = load(manifest_rel)
    for s in man['sequences']:
        missing = not all((ROOT / r).is_file() for r in s['framesBackToFront'])
        if not (only and s['id'] in only) and not (not only and missing):
            continue
        frames = export_sequence(s, ex, pal)
        if len(frames) != len(s['framesBackToFront']):
            raise ValueError(f"{s['id']}: the layout gives {len(frames)} frames, the manifest lists {len(s['framesBackToFront'])}")
        for rel, fr in zip(s['framesBackToFront'], frames):
            (ROOT / rel).parent.mkdir(parents=True, exist_ok=True)
            Image.fromarray(fr).save(ROOT / rel, optimize=True)
        print(f"{s['id']}: {len(frames)} frames exported")
    png, js = outputs(stem)
    sheet, idx = sheet_of(man, ex)
    save_if_changed(sheet, png)
    js.write_text(json.dumps(idx, indent=1) + '\n', encoding='utf-8')
    save_if_changed(strip_of(man, ex), ROOT / man['runtimeSheet']['path'])
    if man.get('preview'):
        save_if_changed(contact_sheet(man, ex).convert('RGB'), ROOT / man['preview'])
    if man.get('animationPreview'):
        (ROOT / man['animationPreview']).write_text(player_of(man, manifest_rel, ex), encoding='utf-8')
    print(f'{png.relative_to(ROOT)}: {sheet.size[0]}×{sheet.size[1]}, {len(idx["seqs"])} sequences')
    bad = validate(manifest_rel)
    for b in bad:
        print('  ✗', b)
    return not bad


if __name__ == '__main__':
    argv = sys.argv[1:]
    if '--only' in argv:   # --only a,b  is the same as  --only=a,b
        i = argv.index('--only'); argv[i:i + 2] = ['--only=' + (argv[i + 1] if i + 1 < len(argv) else '')]
    args = [a for a in argv if not a.startswith('--')]
    if '--check' in argv:
        mans = args or [h['manifest'] for h in json.loads(REGISTRY.read_text(encoding='utf-8'))['heroes'].values()]
        problems = [f'{m}: {b}' for m in mans for b in validate(m)]
        print('\n'.join(problems) if problems else f'ok: {len(mans)} hero pack(s)')
        sys.exit(1 if problems else 0)
    if len(args) != 1:
        sys.exit(__doc__)
    only = next((a.split('=', 1)[1] for a in argv if a.startswith('--only=')), None)
    sys.exit(0 if build(args[0], set(only.split(',')) if only else None) else 1)
