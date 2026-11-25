#!/usr/bin/env python3
"""Game exports of Codex's folk skill cards (PR #38).

The masters are art/source/characters/<hero>/folk-art/skills/<skill>/skill-card-concept.png (1536x1024, listed in
art/manifests/folk-skill-cards.json and folk-skill-cards-additional.json). They are never changed. This tool only
resizes each into one lossy WebP, art/exports/characters/<hero>/folk-art/skills/<skill>/card.webp, 768x512: enough for
the battle card (the largest is 240 CSS px wide, .card.folk.t3, x2 for DPR) and for the card opened full screen on a
phone; one size instead of two keeps the single-file build small (a larger one can come with a PC build).

and writes art/exports/characters/skill-cards.json, which build.py inlines: one entry per hero id and skill number
(the tier, 1-3), matched to the skill names in src/game.js (CHARS ... moves).

  python3 tools/art_skill_cards.py           write missing or stale exports
  python3 tools/art_skill_cards.py --check   report missing or stale ones, exit 1 if any
"""
import hashlib, io, json, pathlib, re, sys, unicodedata
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
MANIFESTS = ['art/manifests/folk-skill-cards.json', 'art/manifests/folk-skill-cards-additional.json']
INDEX = 'art/exports/characters/skill-cards.json'
SIZES = {'card': (768, 512)}
QUALITY = {'card': 80}
# character folders (docs/characters, art/source/characters) -> hero ids in the game
HERO_ID = {'martin-krpan': 'krpan', 'ajdovska-deklica': 'ajda', 'erazem-predjamski': 'erazem', 'kralj-matjaz': 'matjaz',
           'lepa-vida': 'vida', 'kurent': 'kurent', 'kresnik': 'kresnik'}
# card folders whose name is not the skill's name in the game (Codex named Erazem's first card after his sword)
ALIAS = {('erazem', 'mec'): 'Zamah z mečem'}


def slug(s):
    s = unicodedata.normalize('NFKD', s.lower()).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')


def game_moves():
    """{hero id: [skill 1, skill 2, skill 3]} from CHARS in src/game.js"""
    src = (ROOT / 'src/game.js').read_text(encoding='utf-8')
    out = {}
    for m in re.finditer(r"\{ id: '([a-z]+)', name: '[^']*'.*?moves: \[([^\]]*)\]", src):
        out[m.group(1)] = re.findall(r"'([^']*)'", m.group(2))
    return out


def sha1(p):
    return hashlib.sha1(p.read_bytes()).hexdigest()


def cards():
    moves = game_moves()
    for mrel in MANIFESTS:
        for a in json.loads((ROOT / mrel).read_text(encoding='utf-8'))['assets']:
            hid = HERO_ID[a['character']]
            name = ALIAS.get((hid, a['skill'])) or next((m for m in moves[hid] if slug(m) == a['skill']), None)
            assert name, f"{a['file']}: no skill of {hid} is called {a['skill']} (moves: {moves[hid]})"
            yield {'hero': hid, 'tier': moves[hid].index(name) + 1, 'skill': name, 'card': a['skill'], 'character': a['character'],
                   'source': a['file'], 'manifest': mrel}


def out_dir(c):
    return f"art/exports/characters/{c['character']}/folk-art/skills/{c['card']}"


def main():
    idx_p = ROOT / INDEX
    old = json.loads(idx_p.read_text(encoding='utf-8')) if idx_p.is_file() else {}
    index, bad, total = {}, [], 0
    for c in cards():
        key = f"{c['hero']}:{c['tier']}"
        assert key not in index, f'two cards for {key}'
        src = ROOT / c['source']
        h = sha1(src)
        e = {**{k: c[k] for k in ('hero', 'tier', 'skill', 'source')}, 'sourceSha1': h,
             **{size: f'{out_dir(c)}/{size}.webp' for size in SIZES}}
        fresh = old.get(key, {}).get('sourceSha1') == h and all((ROOT / e[s]).is_file() for s in SIZES)
        if '--check' in sys.argv:
            if not fresh: bad.append(key)
        elif not fresh:
            im = Image.open(src).convert('RGB')
            for size, wh in SIZES.items():
                buf = io.BytesIO()
                im.resize(wh, Image.LANCZOS).save(buf, 'WEBP', quality=QUALITY[size], method=6)
                (ROOT / e[size]).parent.mkdir(parents=True, exist_ok=True)
                (ROOT / e[size]).write_bytes(buf.getvalue())
        total += sum((ROOT / e[s]).stat().st_size for s in SIZES if (ROOT / e[s]).is_file())
        index[key] = e
    if '--check' in sys.argv:
        print('ok' if not bad else f"{len(bad)} cards to export: {', '.join(bad)} — python3 tools/art_skill_cards.py")
        sys.exit(1 if bad else 0)
    idx_p.parent.mkdir(parents=True, exist_ok=True)
    idx_p.write_text(json.dumps(dict(sorted(index.items())), ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print(f'{len(index)} cards, {total / 1048576:.2f} MB WebP')


if __name__ == '__main__':
    main()
