"""The packed word list: build it (tools/build_lexicon.py) and read it (check_reports.py, cluebank.py).

data/lexicon.bin is a minimised acyclic automaton (a DAWG) over symbol strings

    form  SEP  STRIP  lemma-suffix

- form: the word as played, letters a..ž of the Slovene alphabet (25 letters, no q w x y)
- SEP: '+' if the game may suggest the word (proposals, hints, word counts, darts, rock
  slide), '|' if it only accepts it
- STRIP, lemma-suffix: the base form (lemma) is form[:len(form) - STRIP] + lemma-suffix,
  e.g. volkom + 2 -> volk, ljudje + 6 človek -> človek

Every form has exactly one path, so after SEP the rest of the path is just its lemma code.
Equal word endings collapse into shared states, which keeps ~1 M Slovene forms small.

Binary layout: a 16-byte header (b'ZGLX', then edge count, form count and suggested count
as little-endian uint32) followed by one little-endian uint32 per edge:

    bits 0-5   label (symbol, see SYMBOLS)
    bit  6     last edge of its state
    bit  7     the target state can still reach a suggested word ('+')
    bits 8-31  index of the target state's first edge (0 = no edges: end of a lemma code)

The edges of a state are contiguous and sorted by label; a state is named by the index of
its first edge, and the root state is 0. src/lexicon.js reads the same format.
"""
import array, collections, struct, sys

LETTERS = 'abcčdefghijklmnoprsštuvzž'
SEP_ACCEPT, SEP_SUGGEST = 26, 27
STRIP0 = 28                       # STRIP n is symbol 28 + n
MAX_STRIP = 63 - STRIP0           # 35, longer than any form
CODE = {ch: i + 1 for i, ch in enumerate(LETTERS)}
SYMBOLS = {**{v: k for k, v in CODE.items()}, SEP_ACCEPT: '|', SEP_SUGGEST: '+'}
MAGIC = b'ZGLX'


def lemma_code(form, lemma):
    """(strip, suffix) so that form[:len(form)-strip] + suffix == lemma."""
    if any(ch not in CODE for ch in lemma): lemma = form
    k = 0
    while k < min(len(form), len(lemma)) and form[k] == lemma[k]: k += 1
    return len(form) - k, lemma[k:]


def encode(form, lemma, suggested):
    strip, suffix = lemma_code(form, lemma)
    assert strip <= MAX_STRIP, (form, lemma)
    return tuple(CODE[c] for c in form) + (SEP_SUGGEST if suggested else SEP_ACCEPT, STRIP0 + strip) + tuple(CODE[c] for c in suffix)


class _State:
    __slots__ = ('edges', 'sugg', 'id')
    def __init__(self): self.edges, self.sugg, self.id = {}, False, None


def build(entries):
    """entries: iterable of (form, lemma, suggested). Returns the .bin bytes."""
    seqs = sorted(set(encode(f, l, s) for f, l, s in entries))
    n_forms, n_sugg = len(seqs), sum(1 for q in seqs if SEP_SUGGEST in q)
    root, register, unchecked, prev = _State(), {}, [], ()
    next_id = [0]

    def minimise(down_to):
        while len(unchecked) > down_to:
            parent, label, child = unchecked.pop()
            child.sugg = any(l == SEP_SUGGEST or c.sugg for l, c in child.edges.items())
            key = tuple((l, c.id) for l, c in child.edges.items())
            hit = register.get(key)
            if hit is not None: parent.edges[label] = hit
            else:
                child.id = next_id[0]; next_id[0] += 1
                register[key] = child

    for seq in seqs:
        cp = 0
        while cp < len(seq) and cp < len(prev) and seq[cp] == prev[cp]: cp += 1
        minimise(cp)
        node = unchecked[-1][2] if unchecked else root
        for label in seq[cp:]:
            nxt = _State(); node.edges[label] = nxt; unchecked.append((node, label, nxt)); node = nxt
        prev = seq
    minimise(0)

    # lay the states out: root first, then breadth-first, so each state's edges are contiguous
    order, start, seen, queue, pos = [], {}, {id(root)}, collections.deque([root]), 0
    while queue:
        st = queue.popleft()
        if st.edges:
            start[id(st)] = pos; pos += len(st.edges)
            order.append(st)
        for _, c in sorted(st.edges.items()):
            if id(c) not in seen: seen.add(id(c)); queue.append(c)
    words = array.array('I')
    for st in order:
        items = sorted(st.edges.items())
        for i, (label, c) in enumerate(items):
            tgt = start.get(id(c), 0)
            assert tgt < (1 << 24), 'lexicon too large for 24-bit edge targets'
            words.append(label | ((i == len(items) - 1) << 6) | ((c.sugg or label == SEP_SUGGEST) << 7) | (tgt << 8))
    if sys.byteorder != 'little': words.byteswap()
    return MAGIC + struct.pack('<3I', len(words), n_forms, n_sugg) + words.tobytes()


class Lexicon:
    """Read-only view of data/lexicon.bin."""
    def __init__(self, data):
        assert data[:4] == MAGIC, 'not a Za govor lexicon'
        self.n_edges, self.n_forms, self.n_suggested = struct.unpack('<3I', data[4:16])
        self.e = array.array('I', data[16:16 + 4 * self.n_edges])
        if sys.byteorder != 'little': self.e.byteswap()

    @classmethod
    def load(cls, path):
        with open(path, 'rb') as f: return cls(f.read())

    def _child(self, state, label):
        e, i = self.e, state
        while True:
            w = e[i]; l = w & 63
            if l == label: return w >> 8, w
            if l > label or w & 64: return None
            i += 1

    def _walk(self, word):
        st = 0
        for ch in word:
            c = CODE.get(ch)
            if c is None: return None
            r = self._child(st, c)
            if r is None or r[0] == 0: return None
            st = r[0]
        return st

    def _sep(self, word):
        st = self._walk(word)
        if st is None: return None
        for sep in (SEP_SUGGEST, SEP_ACCEPT):
            r = self._child(st, sep)
            if r is not None: return sep, r[0]
        return None

    def __contains__(self, word): return self._sep(word) is not None
    def suggested(self, word):
        r = self._sep(word); return r is not None and r[0] == SEP_SUGGEST

    def lemma(self, word):
        r = self._sep(word)
        if r is None: return None
        st, e = r[1], self.e
        strip, suffix = (e[st] & 63) - STRIP0, []
        st = e[st] >> 8
        while st:
            w = e[st]; suffix.append(SYMBOLS[w & 63]); st = w >> 8
        return word[:len(word) - strip] + ''.join(suffix)

    def __iter__(self):
        """Yield (form, lemma, suggested) for every form, in symbol order."""
        e, stack = self.e, [(0, '')]
        while stack:
            st, prefix = stack.pop()
            i, kids = st, []
            while True:
                w = e[i]; l = w & 63
                if l in (SEP_ACCEPT, SEP_SUGGEST):
                    yield prefix, self.lemma(prefix), l == SEP_SUGGEST
                else: kids.append((w >> 8, prefix + SYMBOLS[l]))
                if w & 64: break
                i += 1
            stack.extend(reversed(kids))
