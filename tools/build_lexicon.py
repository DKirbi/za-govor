"""Build the game's word list, data/lexicon.bin, from Slovene language resources.

    python3 tools/build_lexicon.py ~/Downloads/SlovenianResource        # folder with the zips
    python3 tools/build_lexicon.py ~/Downloads/SlovenianResource --maxlen 12

The folder needs three zips from CLARIN.SI (keep them zipped):
  Sloleks.3.1.zip                             http://hdl.handle.net/11356/2080   CC BY-SA 4.0
  FrancekPortalHeadwordList.zip               http://hdl.handle.net/11356/1445   CC BY 4.0
  CJVT-Thesaurus-of-Modern-Slovene-v2.2.zip   http://hdl.handle.net/11356/2092   CC BY-SA 4.0

The first run extracts every form from Sloleks into build/sloleks_forms.tsv.gz (about a
minute, see tools/sloleks_extract.py); later runs reuse it. tools/xref_sources.py then shows
what each dictionary still has that the game does not accept.

Two tiers, one file (format: tools/lexicon.py):
  accepted   every lowercase form of every Sloleks lexeme that is not a proper noun,
             MINLEN..MAXLEN letters of the Slovene alphabet (no q w x y), plus
             - Franček headwords that Sloleks lacks (about 24,000: zborišče, kombajnar, kolarna…),
               with their forms borrowed from Sloleks words that end the same way
               (tools/inflect.py); a headword whose analogues disagree keeps its base form only
             - Thesaurus of Modern Slovene headwords that both lack (about 4,000: sedemkotnik,
               oceanologija…), inflected the same way
             - data/myth.json and data/allow.json,
             minus data/deny.json (foreign words; exact lemma match)
  suggested  what the game may put in front of a player (proposals, hints, word counts in the
             mesh, darts and rock-slide words). A form is suggested when a lexeme it belongs to
             - is attested: checked by hand in Sloleks (status MANUAL, from Sloleks 2.0), listed
               in the Franček headword list, or a closed class (pronoun, numeral, preposition…)
             - is common: Gigafida 2.0 frequency >= LEMMA_FREQ
             - is not in data/never-suggest.json (vulgar words and slurs: accepted, never offered)
             and the form itself is standard and common (>= FORM_FREQ, or the base form; three-
             letter forms need >= SHORT_FREQ). data/myth.json words are always suggested.

Each form also carries its base form (lemma), used for the repeat penalty and shown to players.
"""
import argparse, collections, gzip, html, json, pathlib, re, subprocess, sys, time, zipfile

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import inflect, lexicon
from sloleks_extract import COLUMNS

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA, BUILD = ROOT / 'data', ROOT / 'build'
ALPHA = re.compile(r'^[abcčdefghijklmnoprsštuvzž]+$')
CLOSED = {'pronoun', 'numeral', 'conjunction', 'particle', 'preposition', 'interjection'}
LEMMA_FREQ, FORM_FREQ, SHORT_FREQ = 1000, 20, 3000
GENDER = {'masculine': 'm', 'feminine': 'ž', 'neuter': 's'}
# Franček part of speech (BV) -> the class tools/inflect.py inflects it as; other classes
# (adverbs, interjections, particles, "ž mn.", indeclinable "kot pridevnik"…) keep the base form
FR_CLASS = {'m': ('noun', 'm'), 'ž': ('noun', 'ž'), 's': ('noun', 's'), 'prid.': ('adjective',),
            'dov.': ('verb',), 'nedov.': ('verb',), 'dov. in nedov.': ('verb',), 'nedov. in dov.': ('verb',)}


def load_json(name):
    p = DATA / name
    d = json.loads(p.read_text(encoding='utf-8')) if p.exists() else {}
    return {k: v for k, v in d.items() if not k.startswith('_')} if isinstance(d, dict) else d


def francek_headwords(src):
    """headword -> set of its parts of speech (BV), for every lowercase headword."""
    with zipfile.ZipFile(src / 'FrancekPortalHeadwordList.zip') as z:
        xml = z.read('FR-geslovnik.xml').decode('utf-8')
    entries = {}                                        # fr-id -> (headword, BV, fr-id of the entry it points to)
    for attrs, body in re.findall(r'<geslo\b([^>]*)>(.*?)</geslo>', xml):
        fid = re.search(r'fr-id="([^"]+)"', attrs).group(1)
        h = re.search(r'<neonaglasena_iztocnica>([^<]*)</neonaglasena_iztocnica>', body)
        bv = re.search(r'<BV>(.*?)</BV>', body); ref = re.search(r'<KAZALKA fr-sklic="([^"]+)"', body)
        if h: entries[fid] = (html.unescape(h.group(1)).strip(), re.sub(r'<[^>]+>', '', bv.group(1)).strip() if bv else '', ref and ref.group(1))
    out, every = collections.defaultdict(set), set()
    for h, bv, ref in entries.values():
        # a variant spelling (ahromat) points to its main entry (akromat) and inflects like it
        if not bv and ref in entries: bv = entries[ref][1]
        # reflexive verbs are listed as "zavedati se", Sloleks lemmatises them as "zavedati"
        h = re.sub(r' s[ei]$', '', h)
        every.add(h.lower())
        if h != h.lower(): continue                     # names (Ljubljana, Cankar) stay out, like Sloleks proper nouns
        out[h].add(bv)
    return out, every


MSD_CLASS = {'Ncm': ('noun', 'm'), 'Ncf': ('noun', 'ž'), 'Ncn': ('noun', 's'), 'A': ('adjective',), 'Vm': ('verb',)}


def thesaurus_headwords(src):
    """lowercase headword -> set of inflection classes (None = keep the base form) from the
    MULTEXT-East tag of its lexeme (Ncfsn = common feminine noun, Agpmsnn = adjective, …)."""
    out = collections.defaultdict(set)
    with zipfile.ZipFile(src / 'CJVT-Thesaurus-of-Modern-Slovene-v2.2.zip') as z:
        xml = z.read('CJVT-Thesaurus-of-Modern-Slovene-v2.2/CJVT-Thesaurus-of-Modern-Slovene-v2.2.xml').decode('utf-8')
    for head in re.findall(r'<head>(.*?)</head>', xml, re.S):
        lemma = re.search(r'<lemma>([^<]*)</lemma>', head)
        msd = re.search(r'msd="([^"]*)"', head)
        if not lemma or not msd or msd.group(1)[:2] == 'Np' or msd.group(1)[0] == 'X': continue   # names, foreign words (the, people)
        h = html.unescape(lemma.group(1)).strip()
        if h != h.lower() or ' ' in h: continue
        m = msd.group(1)
        out[h].add(MSD_CLASS.get(m[:3]) or MSD_CLASS.get(m[:2]) or MSD_CLASS.get(m[:1]))
    return out


def sloleks_rows(src):
    cache = BUILD / 'sloleks_forms.tsv.gz'
    if cache.exists():                                  # an extract from an older tools/sloleks_extract.py
        with gzip.open(cache, 'rt', encoding='utf-8') as f:
            if len(f.readline().rstrip('\n').split('\t')) != COLUMNS: cache.unlink()
    if not cache.exists():
        BUILD.mkdir(exist_ok=True)
        subprocess.run([sys.executable, str(ROOT / 'tools' / 'sloleks_extract.py'), str(src / 'Sloleks.3.1.zip'), str(cache)], check=True)
    with gzip.open(cache, 'rt', encoding='utf-8') as f:
        for line in f:
            p = line.rstrip('\n').split('\t')
            if len(p) == COLUMNS: yield p


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('sources', type=pathlib.Path, help='folder with the Sloleks, Franček and thesaurus zips')
    ap.add_argument('--minlen', type=int, default=3)
    ap.add_argument('--maxlen', type=int, default=15)
    a = ap.parse_args()
    src = a.sources.expanduser()
    t0 = time.time()

    fr_pos, fr = francek_headwords(src)
    th_pos = thesaurus_headwords(src)
    deny_json = load_json('deny.json')
    deny = set(deny_json.get('lemmas', [])) | set(deny_json.get('foreign_headwords', []))
    never = set(load_json('never-suggest.json').get('lemmas', []))
    myth, allow = load_json('myth.json'), load_json('allow.json')

    # --- read Sloleks: lexeme -> its forms, status, frequency
    lex_forms = collections.defaultdict(set)          # (lemma, cat) -> every written form (any spelling)
    info = {}                                          # (lemma, cat) -> [status, lemma_freq]
    rows = collections.defaultdict(list)               # form -> [(lemma, cat, form_freq, nonstandard)]
    paradigms = collections.defaultdict(set)           # (class, lemma) -> standard forms of hand-checked lexemes
    proper = 0
    for form, lemma, cat, typ, status, lf, ff, ns, gender in sloleks_rows(src):
        if typ == 'proper': proper += 1; continue
        k = (lemma, cat)
        lex_forms[k].add(form)
        st = info.setdefault(k, [status, int(lf)])
        st[1] = max(st[1], int(lf), int(ff))           # the auxiliary "biti" has no lemma count
        if ALPHA.match(form) and a.minlen <= len(form) <= a.maxlen:
            rows[form].append((lemma, cat, int(ff), ns == '1'))
        if status == 'MANUAL' and ns == '0' and cat in ('noun', 'adjective', 'verb') and ALPHA.match(form) and ALPHA.match(lemma):
            paradigms[((cat, GENDER.get(gender, '-')) if cat == 'noun' else (cat,), lemma)].add(form)

    attested = {k for k, fs in lex_forms.items() if info[k][0] == 'MANUAL' or k[0] in fr or fs & fr or k[1] in CLOSED}
    known = {k[0] for k in info}
    denied_hit = deny & (known | set(fr_pos) | set(th_pos))
    never_hit = never & known

    # --- decide every form: its base form, and whether the game may suggest it.
    # Suggested if any lexeme it belongs to qualifies. The base form is chosen separately: the
    # form itself if it is a base form (riti stays riti, not the dative of rit), else the
    # hand-checked, most frequent lexeme (volkom -> volk, although Gigafida credits that form
    # to volek).
    out, src_count = {}, collections.Counter()
    for form, cands in rows.items():
        cands = [c for c in cands if c[0] not in deny]
        if not cands: continue
        common = any((lemma, cat) in attested and info[(lemma, cat)][1] >= LEMMA_FREQ and lemma not in never and not ns and
                     (ff >= SHORT_FREQ if len(form) == 3 else (ff >= FORM_FREQ or form == lemma))
                     for lemma, cat, ff, ns in cands)
        lemma = max(cands, key=lambda c: (c[0] == form, info[c[:2]][0] == 'MANUAL', c[:2] in attested, info[c[:2]][1]))[0]
        out[form] = (lemma, common); src_count['sloleks'] += 1

    # --- Franček headwords that Sloleks lacks: accepted (never suggested; Gigafida has no count
    # for them), inflected by analogy with hand-checked Sloleks words (tools/inflect.py)
    par = [(cls, lemma, forms | {lemma}) for (cls, lemma), forms in paradigms.items()]
    inf = inflect.Inflector(par)
    fr_new = {h: pos for h, pos in fr_pos.items() if ALPHA.match(h) and a.minlen <= len(h) <= a.maxlen and h not in known and h not in deny}
    fr_kind = collections.Counter()
    for h, pos in sorted(fr_new.items()):
        forms = set()
        for p in pos:
            if p in FR_CLASS: forms |= inf.inflect(h, FR_CLASS[p]) or set()
        fr_kind['inflected' if forms else 'base form only'] += 1
        for f in sorted(forms | {h}):
            if ALPHA.match(f) and a.minlen <= len(f) <= a.maxlen and f not in out:
                out[f] = (h, False); src_count['Franček (inflected)' if forms else 'Franček (base form)'] += 1
    # a headword Sloleks has as a lemma without listing the lemma itself as a form
    # (ohromiti, whose Sloleks entry lists the forms of ohrometi)
    for h in sorted(fr_pos):
        if ALPHA.match(h) and a.minlen <= len(h) <= a.maxlen and h not in out and h not in deny:
            out[h] = (h, False); src_count['Franček (base form)'] += 1

    # --- Thesaurus of Modern Slovene headwords that neither has: same treatment, classes from
    # their MULTEXT-East tags. Built automatically from corpora, so it comes last.
    th_new = {h: cls for h, cls in th_pos.items()
              if ALPHA.match(h) and a.minlen <= len(h) <= a.maxlen and h not in known and h not in out and h not in deny}
    th_kind = collections.Counter()
    for h, classes in sorted(th_new.items()):
        forms = set()
        for cls in classes:
            if cls: forms |= inf.inflect(h, cls) or set()
        th_kind['inflected' if forms else 'base form only'] += 1
        for f in sorted(forms | {h}):
            if ALPHA.match(f) and a.minlen <= len(f) <= a.maxlen and f not in out:
                out[f] = (h, False); src_count['thesaurus (inflected)' if forms else 'thesaurus (base form)'] += 1
    for name, extra, sugg in (('myth.json', myth, True), ('allow.json', allow, False)):
        for lemma, forms in extra.items():
            for f in [lemma] + forms:
                if not (ALPHA.match(f) and a.minlen <= len(f) <= a.maxlen): continue
                if f not in out: out[f] = (lemma, sugg); src_count[name] += 1
                elif sugg and not out[f][1]: out[f] = (out[f][0], True); src_count[name + ' (now suggested)'] += 1

    blob = lexicon.build((f, l, s) for f, (l, s) in out.items())
    (DATA / 'lexicon.bin').write_bytes(blob)
    L = lexicon.Lexicon(blob)
    assert L.n_forms == len(out)

    # --- report
    print(f'Sloleks: {len(info):,} lexemes (proper nouns skipped: {proper:,} form lines), Franček: {len(fr):,} headwords')
    print(f'accepted forms: {len(out):,} ({a.minlen}..{a.maxlen} letters), suggested: {L.n_suggested:,}')
    print('  added by source:', ', '.join(f'{k} {v:,}' for k, v in src_count.items()))
    cov, prec, rec = inflect.evaluate(inf, par, sample=4000, seed=11)
    print(f'  Franček headwords not in Sloleks: {len(fr_new):,} ({fr_kind["inflected"]:,} inflected, {fr_kind["base form only"]:,} base form only); '
          f'inflection check on {inf.n:,} hand-checked Sloleks words held out of their own vote: {cov:.1%} inflected, '
          f'{prec:.1%} of guessed forms right, {rec:.1%} of true forms found')
    print(f'  thesaurus headwords in neither: {len(th_new):,} ({th_kind["inflected"]:,} inflected, {th_kind["base form only"]:,} base form only)')
    print(f'  deny.json: {len(denied_hit)}/{len(deny)} lemmas found and removed' + (f'; in no source: {sorted(deny - denied_hit)}' if deny - denied_hit else ''))
    print(f'  never-suggest.json: {len(never_hit)}/{len(never)} lemmas found' + (f'; not in Sloleks: {sorted(never - never_hit)}' if never - never_hit else ''))
    by_len = collections.Counter(len(f) for f in out)
    print('  by length:', ' '.join(f'{n}:{by_len[n]:,}' for n in sorted(by_len)))
    print(f'data/lexicon.bin: {len(blob):,} bytes, {L.n_edges:,} edges, built in {time.time() - t0:.0f} s')
    cov = json.loads((ROOT / 'tests' / 'data' / 'coverage-words.json').read_text(encoding='utf-8'))
    valid = [w for ws in cov['valid'].values() for w in ws.split()]
    miss = [w for w in valid if w not in L]
    bad = [w for w in cov['invalid'].split() if w in L]
    print(f'coverage set: {len(valid) - len(miss)}/{len(valid)} valid accepted' + (f' (missing: {miss})' if miss else '') +
          f', {len(bad)} non-words accepted' + (f' ({bad})' if bad else ''))


if __name__ == '__main__':
    main()
