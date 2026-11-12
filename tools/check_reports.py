"""Check the words players reported with "Prijavi besedo".

    python3 tools/check_reports.py responses.csv                  # CSV downloaded from the form's Sheet
    python3 tools/check_reports.py jasa jase kozolček             # or words straight on the command line
    python3 tools/check_reports.py responses.csv --lexicon sloleks-forms.txt --lexicon hunspell-forms.txt

For every reported word (counted once per report, case-insensitive) it prints how often it was
reported, where it was turned down, any notes, and its status:

  v igri          the game accepts it now (added since, or a misreport)
  v <lexicon>     not in the game, but found in a word list given with --lexicon (one word per line),
                  for example the forms extracted from Sloleks: a safe candidate for data/allow.json
  manjka          found nowhere: check it by hand on Fran.si (the link is printed)

Reviewed words go into data/allow.json (lemma: [forms]); then run tools/build_dict.py and build.py.
"""
import csv, json, pathlib, sys, collections, urllib.parse

ROOT = pathlib.Path(__file__).resolve().parent.parent
LETTERS = set('abcčdefghijklmnoprsštuvzž')

def game_words():
    d = json.loads((ROOT / 'data' / 'dict.json').read_text(encoding='utf-8'))
    return {f for forms in d.values() for f in forms}

def clean(w):
    w = (w or '').strip().lower()
    return w if w and set(w) <= LETTERS else None

def read_reports(args):
    rows = []
    for a in args:
        p = pathlib.Path(a)
        if p.suffix.lower() in ('.csv', '.tsv') and p.exists():
            with p.open(encoding='utf-8-sig', newline='') as f:
                rd = csv.DictReader(f, delimiter='\t' if p.suffix.lower() == '.tsv' else ',')
                col = lambda name: next((h for h in rd.fieldnames or [] if h.strip().lower().startswith(name)), None)
                cw, ck, co, cp = col('beseda'), col('kje'), col('opomba'), col('podatki')
                if not cw: sys.exit(f'{p}: no "Beseda" column (columns: {rd.fieldnames})')
                for r in rd: rows.append((r.get(cw), r.get(ck) or '', r.get(co) or '', r.get(cp) or ''))
        else:
            rows.append((a, 'ukazna vrstica', '', ''))
    return rows

def main(argv):
    lex_paths = [argv[i + 1] for i, a in enumerate(argv) if a == '--lexicon' and i + 1 < len(argv)]
    args = [a for i, a in enumerate(argv) if a != '--lexicon' and (i == 0 or argv[i - 1] != '--lexicon')]
    if not args: sys.exit(__doc__)
    lexicons = [(pathlib.Path(p).stem, {l.strip().lower() for l in pathlib.Path(p).read_text(encoding='utf-8').splitlines() if l.strip()}) for p in lex_paths]
    game = game_words()
    seen = collections.OrderedDict()
    skipped = []
    for w, where, note, meta in read_reports(args):
        cw = clean(w)
        if not cw: skipped.append(w); continue
        e = seen.setdefault(cw, {'n': 0, 'where': collections.Counter(), 'notes': []})
        e['n'] += 1; e['where'][where] += 1
        if note.strip(): e['notes'].append(note.strip())
    order = sorted(seen.items(), key=lambda kv: (-kv[1]['n'], kv[0]))
    status = {}
    for w, _ in order:
        if w in game: status[w] = 'v igri'
        else: status[w] = next((f'v {name}' for name, words in lexicons if w in words), 'manjka')
    print(f'{len(order)} reported words ({sum(e["n"] for _, e in order)} reports)\n')
    for w, e in order:
        where = ', '.join(f'{k} {v}×' if v > 1 else k for k, v in e['where'].most_common())
        print(f'{w:<16} {e["n"]:>3}×  {status[w]:<14} {where}')
        for n in e['notes'][:3]: print(f'{"":>22}opomba: {n}')
        if status[w] == 'manjka': print(f'{"":>22}https://fran.si/iskanje?View=1&Query={urllib.parse.quote(w)}')
    if skipped: print(f'\nskipped (not one Slovene word): {", ".join(repr(s) for s in skipped[:20])}')
    todo = [w for w, _ in order if status[w] != 'v igri']
    if todo:
        print('\nCandidates for data/allow.json (add every form you confirm):')
        print(json.dumps({w: [w] for w in todo}, ensure_ascii=False, indent=2))

if __name__ == '__main__':
    main(sys.argv[1:])
