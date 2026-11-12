"""Build the battle word list (data/dict.json) for the prototype.

    pip install simplemma wordfreq
    python3 tools/build_dict.py            # defaults: 3 9 2.5 3.0
    python3 tools/build_dict.py MINLEN MAXLEN FORM_ZIPF LEMMA_ZIPF

Takes every Slovene form -> lemma pair from simplemma's dictionary, keeps lowercase
common words of MINLEN..MAXLEN letters, and keeps a form if the form itself has a
wordfreq Zipf frequency >= FORM_ZIPF or its lemma has >= LEMMA_ZIPF (so every
inflected form of a common word counts). A short block list removes profanity, and a
MANUAL list adds mythology and enemy names. Output is grouped lemma -> [forms].

The real game will use Sloleks 3 (CC BY-SA 4.0) instead; this list is only for the
prototype.
"""
import json, pathlib, re, collections, sys
import wordfreq
from simplemma.strategies.dictionaries.dictionary_factory import DefaultDictionaryFactory

d = DefaultDictionaryFactory().get_dictionary('sl')
ALPHA = re.compile(r'^[abcčdefghijklmnoprsštuvzž]+$')
BLOCK = ('jeb','pičk','pizd','kurac','kurc','fuk','kurb','drek','sranj','usran','prdec','rit')
def blocked(w): return any(w.startswith(b) for b in BLOCK)

args = sys.argv[1:] or ['3', '9', '2.5', '3.0']
MINLEN, MAXLEN = int(args[0]), int(args[1])
FORM_Z, LEMMA_Z = float(args[2]), float(args[3])
OUT = pathlib.Path(__file__).resolve().parent.parent / 'data' / 'dict.json'

all_lemmas = set(l.lower() for l in d.values())
lemma_of = {}
for form, lemma in d.items():
    if not ALPHA.match(form): continue            # lowercase common words only (skips proper nouns)
    if not (MINLEN <= len(form) <= MAXLEN): continue
    lemma = lemma.lower()
    if not ALPHA.match(lemma): continue
    if blocked(form) or blocked(lemma): continue
    lemma_of[form] = form if form in all_lemmas else lemma

keep = {}
for form, lemma in lemma_of.items():
    fz = wordfreq.zipf_frequency(form, 'sl')
    lz = wordfreq.zipf_frequency(lemma, 'sl')
    if fz >= FORM_Z or lz >= LEMMA_Z:   # every form of a common word counts
        keep[form] = lemma

# A word whose inflected form is accepted is accepted in its dictionary form too. Before this,
# 2,462 base forms were missing (jasa, sodelovati, vabiti, copata…) because only an inflected
# form passed the frequency cut. Three-letter base forms come only from a reviewed list:
# simplemma's short lemmas include junk (tea, mia, avt).
SHORT_OK = {'brk', 'kov', 'seč', 'soj', 'tog', 'uta', 'vit', 'čer'}
for lemma in set(keep.values()):
    if lemma in keep or not ALPHA.match(lemma) or blocked(lemma): continue
    if not (MINLEN <= len(lemma) <= MAXLEN) or (len(lemma) == 3 and lemma not in SHORT_OK): continue
    keep[lemma] = lemma

MANUAL = {
 'perun':['perun','peruna','perunu','perunom'],
 'veles':['veles','velesa','velesu','velesom'],
 'triglav':['triglav','triglava','triglavu','triglavom'],
 'zlatorog':['zlatorog','zlatoroga','zlatorogu','zlatorogom'],
 'kurent':['kurent','kurenta','kurentu','kurentom','kurenti','kurentov'],
 'mokoš':['mokoš','mokoši','mokošjo'],
 'svarog':['svarog','svaroga','svarogu','svarogom'],
 'kresnik':['kresnik','kresnika','kresniku','kresnikom'],
 'lintvern':['lintvern','lintverna','lintvernu','lintvernom'],
 'luska':['luska','luske','luski','lusko','lusk','luskam','luskami'],
 'preja':['preja','preje','preji','prejo'],
 'škrat':['škrat','škrata','škratu','škratom','škrati','škratov','škratje'],
 'vedomec':['vedomec','vedomca','vedomcu','vedomcem','vedomci'],
 'volkodlak':['volkodlak','volkodlaka','volkodlaku','volkodlakom','volkodlaki'],
 'mora':['mora','more','mori','moro'],
 'vila':['vila','vile','vili','vilo','vil','vilam'],
 'urška':['urška','urške','urški','urško'],
 'kres':['kres','kresa','kresu','kresom','kresovi'],
 'strela':['strela','strele','streli','strelo','strel'],
 'volk':['volk','volka','volku','volkom','volkova','volkovi','volkov','volkove','volkovoma'],
 'zmaj':['zmaj','zmaja','zmaju','zmajem','zmaji','zmajev','zmajema'],
}
# data/allow.json: words players reported (Prijavi besedo), checked by hand, lemma -> forms
ALLOW = json.loads((OUT.parent / 'allow.json').read_text(encoding='utf-8')) if (OUT.parent / 'allow.json').exists() else {}
MANUAL.update({l: fs for l, fs in ALLOW.items() if not l.startswith('_')})
for l, fs in MANUAL.items():
    for f in fs:
        if MINLEN <= len(f) <= MAXLEN: keep[f] = l
groups = collections.defaultdict(list)
for f, l in keep.items(): groups[l].append(f)
print('forms', len(keep), 'lemmas', len(groups))
out = {l: sorted(fs) for l, fs in sorted(groups.items())}
s = json.dumps(out, ensure_ascii=False, separators=(',',':'))
print('json bytes', len(s.encode()))
OUT.write_text(s, encoding='utf-8')
print('wrote', OUT)
for w in ['jasa','jase','sodelovati','vabiti','copata','volk','volka','volkom','volkova','strela','strele','grom','hrast','kres','ogenj','iskra','sonce','voda','riba','reka','zmaj','luska','grad','vila','kovač','preja','zvonec','vrtinec','barje','zlatorog','triglav','perun','veles','urška']:
    print(w, w in keep, keep.get(w))
