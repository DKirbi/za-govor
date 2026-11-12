"""Inflect dictionary headwords that Sloleks lacks, by analogy with hand-checked Sloleks words.

The Franček headword list has about 22,000 words that Sloleks 3.1 does not (zborišče, kombajnar,
kolarna, biter, …). Sloleks lists every form of its own words, so a missing headword borrows the
endings of Sloleks words of the same class (part of speech, and gender for nouns) that end the
same way: zborišče ends like igrišče and smetišče, so it gets zborišča, zborišču, zboriščem, …

A paradigm is described by its endings. The stem is the longest common beginning of the lemma and
all its forms; the rest is the lemma's ending and each form's ending:

    veter, vetra, vetru, vetrom, vetrovi, …   stem "vet", lemma ending "er", endings {er, ra, ru, rom, rovi, …}

A new word that ends in "er", such as biter, takes the same endings: bitra, bitru, bitrom, …

Choosing the analogues: the hand-checked (MANUAL) Sloleks words of the word's class that share
its longest ending, from MAX_SUFFIX letters down to MIN_SUFFIX. They vote:
  - first on the lemma ending (how much of the word changes), which needs a MAJORITY;
  - then, among the analogues with that lemma ending, on every form ending: an ending is used
    when at least a MAJORITY of them have it. Where they disagree (fleeting vowel or not, a
    comparative or not) the form is left out rather than guessed.
At least MIN_VOTES analogues are needed; otherwise the word keeps only its base form.
tools/build_lexicon.py measures the result on hand-checked Sloleks words held out of their own
vote (12 Nov 2026: 94 % inflected, 98.5 % of the guessed forms right, 95.5 % of the true forms
found; a lone analogue or a 60 % majority raised coverage by 2 points but cut precision to 97.5 %).
"""
import collections, random

MAX_SUFFIX, MIN_SUFFIX = 7, 3
MIN_VOTES, MAJORITY = 2, 0.7


def signature(lemma, forms):
    """(lemma ending, form endings) after the longest common beginning of lemma and forms."""
    k = len(lemma)
    for f in forms:
        j = 0
        while j < k and j < len(f) and f[j] == lemma[j]: j += 1
        k = j
    return lemma[k:], frozenset(f[k:] for f in forms)


class Inflector:
    def __init__(self, paradigms):
        """paradigms: iterable of (cls, lemma, forms); cls is a hashable class such as ('noun', 'feminine')."""
        self.idx = collections.defaultdict(list)      # (cls, ending of the lemma) -> [(lemma, signature)]
        self.n = 0
        for cls, lemma, forms in paradigms:
            sig = signature(lemma, forms)
            for s in range(MIN_SUFFIX, min(MAX_SUFFIX, len(lemma)) + 1):
                self.idx[(cls, lemma[-s:])].append((lemma, sig))
            self.n += 1

    def inflect(self, word, cls, exclude=None):
        """Forms of `word` (a set incl. the word itself), or None when the analogues disagree or are too few."""
        for s in range(min(MAX_SUFFIX, len(word) - 1), MIN_SUFFIX - 1, -1):
            cands = [sig for lemma, sig in self.idx.get((cls, word[-s:]), ())
                     if lemma != word and lemma != exclude and len(sig[0]) <= s]
            if not cands: continue
            if len(cands) < MIN_VOTES: continue                          # look wider for more analogues
            ending, votes = collections.Counter(sig[0] for sig in cands).most_common(1)[0]
            if votes / len(cands) < MAJORITY: return None
            group = [sig[1] for sig in cands if sig[0] == ending]
            count = collections.Counter(e for endings in group for e in endings)
            stem = word[:len(word) - len(ending)]
            forms = {stem + e for e, c in count.items() if c / len(group) >= MAJORITY}
            return forms | {word} if forms else None
        return None


def evaluate(inflector, paradigms, sample=2000, seed=7):
    """Hold each sampled word out of its own vote and compare the guessed forms with Sloleks.
    Returns (share inflected, form precision, form recall) over the inflected ones."""
    rnd = random.Random(seed)
    pool = list(paradigms)
    picked = rnd.sample(pool, min(sample, len(pool)))
    done = tp = gen = true = 0
    for cls, lemma, forms in picked:
        got = inflector.inflect(lemma, cls, exclude=lemma)
        if not got: continue
        done += 1; tp += len(got & forms); gen += len(got); true += len(forms)
    return done / len(picked), tp / max(1, gen), tp / max(1, true)
