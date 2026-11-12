"""Cross-reference the game's word list with the other Slovene dictionaries: what does each know
that the game does not accept?

    python3 tools/xref_sources.py ~/Downloads/SlovenianResource            # folder with the zips
    python3 tools/xref_sources.py ~/Downloads/SlovenianResource --show 200 # longer samples
    python3 tools/xref_sources.py ~/Downloads/SlovenianResource --out gaps.json

Checked against data/lexicon.bin (built by tools/build_lexicon.py from Sloleks 3.1 and Franček):

  Franček headword list      FrancekPortalHeadwordList.zip                      11356/1445  CC BY 4.0
  eSSKJ, school edition      eSSKJSchoolEdition.zip (headwords via Franček ids) 11356/1456  CC BY 4.0
  School dictionary          SchoolDictionaryOfSlovenianLanguage-semantic.zip   11356/1451  CC BY 4.0
  Thesaurus of Modern Slov.  CJVT-Thesaurus-of-Modern-Slovene-v2.2.zip          11356/2092  CC BY-SA 4.0
                             (headwords and their synonyms; built automatically from corpora)
  (download each from http://hdl.handle.net/<number>)

Only lowercase one-word entries spelled with the Slovene alphabet and within the game's word
lengths count; names, phrases and foreign spellings (q w x y) are left out. For each source it
prints how many it has, how many the game accepts and a sample of the rest, plus how many of
those the game turns down on purpose (data/deny.json). Missing words that turn out to be real
go into data/allow.json (lemma: [forms]); then rebuild with tools/build_lexicon.py and build.py.
"""
import argparse, collections, html, json, pathlib, random, re, sys, zipfile

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from lexicon import Lexicon

ROOT = pathlib.Path(__file__).resolve().parent.parent
ALPHA = re.compile(r'^[abcčdefghijklmnoprsštuvzž]+$')


def read_zip(path, suffix):
    with zipfile.ZipFile(path) as z:
        name = next(n for n in z.namelist() if n.endswith(suffix))
        return z.read(name).decode('utf-8')


def sources(src):
    fr_xml = read_zip(src / 'FrancekPortalHeadwordList.zip', 'FR-geslovnik.xml')
    fr = {}
    for attrs, body in re.findall(r'<geslo\b([^>]*)>(.*?)</geslo>', fr_xml):
        h = re.search(r'<neonaglasena_iztocnica>([^<]*)<', body)
        if h: fr[re.search(r'fr-id="([^"]+)"', attrs).group(1)] = html.unescape(h.group(1)).strip()
    yield 'Franček headword list', list(fr.values())
    ess = re.findall(r'<eSSKJ fr-sklic="([^"]+)"', read_zip(src / 'eSSKJSchoolEdition.zip', 'FR-pomen-eSSKJ.xml'))
    yield 'eSSKJ, school edition', [fr[i] for i in ess if i in fr]
    sol = re.findall(r'<iztocnica>([^<]*)</iztocnica>', read_zip(src / 'SchoolDictionaryOfSlovenianLanguage-semantic.zip', 'FR-pomen-solski.xml'))
    yield 'School dictionary', [html.unescape(h).strip() for h in sol]
    th = read_zip(src / 'CJVT-Thesaurus-of-Modern-Slovene-v2.2.zip', 'CJVT-Thesaurus-of-Modern-Slovene-v2.2.xml')
    yield 'Thesaurus (headwords)', [html.unescape(h).strip() for h in re.findall(r'<lemma>([^<]*)</lemma>', th)]
    yield 'Thesaurus (synonyms)', [html.unescape(h).strip() for h in re.findall(r'type="synonym"[^>]*>([^<]*)</relatedSense>', th)]


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('sources', type=pathlib.Path, help='folder with the CLARIN.SI zips')
    ap.add_argument('--show', type=int, default=60, help='sample size of missing words per source')
    ap.add_argument('--out', type=pathlib.Path, help='write every missing word per source to this JSON file')
    ap.add_argument('--minlen', type=int, default=3)
    ap.add_argument('--maxlen', type=int, default=15)
    a = ap.parse_args()
    L = Lexicon.load(ROOT / 'data' / 'lexicon.bin')
    deny = json.loads((ROOT / 'data' / 'deny.json').read_text(encoding='utf-8'))
    deny = set(deny.get('lemmas', [])) | set(deny.get('foreign_headwords', []))
    print(f'data/lexicon.bin: {L.n_forms:,} forms accepted, {L.n_suggested:,} suggested\n')
    gaps = {}
    for name, words in sources(a.sources.expanduser()):
        cand = {re.sub(r' s[ei]$', '', w) for w in words if w == w.lower()}
        cand = {w for w in cand if ALPHA.match(w) and a.minlen <= len(w) <= a.maxlen}
        miss = sorted(w for w in cand if w not in L)
        denied = [w for w in miss if w in deny]
        gaps[name] = miss
        print(f'{name:24} {len(cand):7,} words  accepted {len(cand) - len(miss):7,} ({100 * (len(cand) - len(miss)) / max(1, len(cand)):.1f} %)'
              f'  missing {len(miss):6,}' + (f' (of which {len(denied)} in deny.json)' if denied else ''))
    rnd = random.Random(1)
    for name, miss in gaps.items():
        if miss: print(f'\n{name}, missing (sample): ' + ' '.join(sorted(rnd.sample(miss, min(a.show, len(miss))))))
    if a.out:
        a.out.write_text(json.dumps(gaps, ensure_ascii=False, indent=1), encoding='utf-8')
        print(f'\nevery missing word: {a.out}')


if __name__ == '__main__':
    main()
