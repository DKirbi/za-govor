"""Extract every written word form from Sloleks 3.1 into one compact TSV.

    python3 tools/sloleks_extract.py ~/Downloads/SlovenianResource/Sloleks.3.1.zip build/sloleks_forms.tsv.gz

Sloleks 3.1 (CJVT, CC BY-SA 4.0, http://hdl.handle.net/11356/2080) is 106 XML files, 13 GB
unpacked. This reads them straight from the zip (no unpacking), one file per CPU core, and
writes one line per (form, lemma) pair:

    form  lemma  category  lexeme_type  status  lemma_freq  form_freq  nonstandard  gender

- form / lemma: as written in Sloleks (orthography, not accentuation)
- category: noun, verb, adjective, adverb, pronoun, numeral, preposition, conjunction,
  particle, interjection, abbreviation, residual
- lexeme_type: the head-level "type" feature (common / proper for nouns, main / auxiliary for
  verbs, general / possessive / participle for adjectives, …), '-' if none
- status: MANUAL (from Sloleks 2.0, checked by hand) or AUTOMATIC
- lemma_freq / form_freq: absolute frequency in the Gigafida 2.0 corpus; form_freq sums
  every grammatical slot the written form fills
- nonstandard: 1 when the orthography carries norm="non-standard"
- gender: masculine / feminine / neuter for nouns, '-' otherwise (tools/inflect.py uses it
  to inflect dictionary headwords that Sloleks lacks)

Only forms made of letters are written (no digits, spaces, hyphens or dots), so phrases,
numerals and symbols drop out here; tools/build_lexicon.py decides the rest.
"""
import gzip, multiprocessing as mp, re, sys, zipfile

ENTRY_END = '</entry>'
RX_LEMMA = re.compile(r'<lemma>([^<]*)</lemma>')
RX_STATUS = re.compile(r'<status>([^<]*)</status>')
RX_CAT = re.compile(r'<category>([^<]*)</category>')
RX_PRON = re.compile(r'<subcategory type="pronunciation">([^<]*)</subcategory>')
RX_TYPE = re.compile(r'<grammarFeature name="type">([^<]*)</grammarFeature>')
RX_GENDER = re.compile(r'<grammarFeature name="gender">([^<]*)</grammarFeature>')
COLUMNS = 9
RX_FREQ = re.compile(r'<measure type="frequency"[^>]*>(\d+)</measure>')
RX_ORTH = re.compile(r'<orthography([^>]*)>\s*<form>([^<]*)</form>(?:\s*<measureList>\s*<measure type="frequency"[^>]*>(\d+)</measure>)?')
WORDLIKE = re.compile(r'^[^\W\d_]+$')
SKIP_PRON = {'Acronym', 'Abbreviation', 'Numeral', 'Symbol'}


def parse_entry(block):
    head, _, body = block.partition('<body>')
    lemma = RX_LEMMA.search(head)
    if not lemma: return []
    pron = RX_PRON.search(head)
    if pron and pron.group(1) in SKIP_PRON: return []
    cat = RX_CAT.search(head); typ = RX_TYPE.search(head); st = RX_STATUS.search(head); lf = RX_FREQ.search(head)
    gen = RX_GENDER.search(head)
    row = (lemma.group(1), cat.group(1) if cat else '-', typ.group(1) if typ else '-',
           st.group(1) if st else '-', lf.group(1) if lf else '0')
    tail = (gen.group(1) if gen else '-',)
    # one written form can fill several slots (navodil = genitive dual and genitive plural);
    # each slot has its own corpus count, so the form's frequency is their sum
    freq = {}
    for attrs, form, ff in RX_ORTH.findall(body):
        if not WORDLIKE.match(form): continue
        key = (form, '1' if 'non-standard' in attrs else '0')
        freq[key] = freq.get(key, 0) + int(ff or 0)
    return ['\t'.join((form,) + row + (str(f), ns) + tail) for (form, ns), f in freq.items()]


def work(args):
    zpath, member = args
    lines, entries = [], 0
    with zipfile.ZipFile(zpath) as z, z.open(member) as f:
        rest = ''
        while True:
            chunk = f.read(64 << 20)
            if not chunk: break
            text = rest + chunk.decode('utf-8')
            cut = text.rfind(ENTRY_END)
            if cut < 0: rest = text; continue
            rest = text[cut + len(ENTRY_END):]
            for block in text[:cut].split(ENTRY_END):
                entries += 1
                lines.extend(parse_entry(block))
    return member, entries, lines


def main(zpath, out):
    with zipfile.ZipFile(zpath) as z:
        members = sorted(n for n in z.namelist() if re.search(r'sloleks_3\.1_[^/]*\.xml$', n))
    # largest files first so the cores finish together
    sizes = {i.filename: i.file_size for i in zipfile.ZipFile(zpath).infolist()}
    members.sort(key=lambda m: -sizes[m])
    total_e = total_l = 0
    with gzip.open(out, 'wt', encoding='utf-8', compresslevel=6) as w, mp.Pool(max(1, mp.cpu_count())) as pool:
        for i, (member, entries, lines) in enumerate(pool.imap_unordered(work, [(zpath, m) for m in members]), 1):
            total_e += entries; total_l += len(lines)
            w.write('\n'.join(lines)); w.write('\n')
            print(f'[{i}/{len(members)}] {member.split("/")[-1]}: {entries} entries, {len(lines)} forms', flush=True)
    print(f'done: {total_e} entries, {total_l} form lines -> {out}')


if __name__ == '__main__':
    if len(sys.argv) != 3: sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
