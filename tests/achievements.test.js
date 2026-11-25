// Achievements, story cards and skill cards (25 Nov 2026; src/achievements.js, data/achievements.json).
// Only real journeys count: not test mode, not practice battles. The profile (zg-dosezki) survives a reload and a new
// journey; toasts come one after another; the Dosežki in junaki page groups them with tiers and progress bars; a story
// card is earned by the heroes alive when Lintvern falls; a skill's painted card is collected the first time it fires.
// Battle cards: the painting in variant B of the card test (Visoka or ?karte=B), the SVG board in A (Nizka).
const { openGame, runner, sleep } = require('./harness');
const { check, run } = runner('Achievements and folk cards');

run(async () => {
  const ctx = await openGame();
  const { page, errors } = ctx;
  const ev = (fn, ...a) => page.evaluate(fn, ...a);
  // a word the mesh holds, sent the way a player sends it (Enter)
  const playWord = (min = 4) => ev(min => { const Z = window.__ZG, B = Z.B; if (!B || B.over) return null;
    const w = [...Z.allWords().keys()].find(x => x.length >= min); Z.closeTut(); B.path = Z.findPath(w); B.typed = w;
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })); return w; }, min);
  const prof = () => ev(() => JSON.parse(JSON.stringify(window.__ZG.ACHP)));
  const battle = (testMode, kind = 'battle') => ev(([testMode, kind]) => { const Z = window.__ZG; Z.S.testMode = testMode; Z.S.mode = 'calm';
    if (!Z.S.run) { Z.newRun('krpan'); Z.joinHero('kurent'); }
    Z.stopBattle(Z.S.run.stops.find(s => s.kind === kind && !s.done)); Z.B.enemies.forEach(e => { e.charge = -99; }); }, [testMode, kind]);

  // ---------------------------------------------------------------- the catalogue
  const cat = await ev(() => { const A = window.__ZG.ACH.achievements;
    return { n: A.length, groups: [...new Set(A.map(a => a.group))], story: A.filter(a => a.group === 'Zgodbe').length, hidden: A.filter(a => a.hidden).map(a => a.id),
      typed: A.every(a => a.rule && (a.rule.count || a.rule.set || a.rule.event)), tiers: [...new Set(A.map(a => a.tier))], party: A.find(a => a.id === 'druzina-ostane-skupaj').text }; });
  check(cat.n === 59 && cat.story === 15 && cat.hidden.join() === 'zlatorogova-zapuscina,zadnja-beseda' && cat.typed && cat.tiers.join() === 'bronasta,srebrna,zlata',
    'data/achievements.json: 59 achievements with typed rules (15 story cards, two hidden), bronasta, srebrna, zlata', JSON.stringify(cat));
  check(/trije/.test(cat.party), 'Družina ostane skupaj asks for the party of three', cat.party);

  // ---------------------------------------------------------------- test mode and practice battles do not count
  await ev(() => { localStorage.removeItem('zg-dosezki'); window.__ZG.achReset(); });
  await battle(true); await sleep(300); await playWord(); await sleep(400);
  const t1 = await prof();
  check(!t1.counters.words && !Object.keys(t1.unlocked).length && !Object.keys(t1.cards.skill).length, 'a word in test mode counts for nothing', JSON.stringify(t1.counters));
  await ev(() => { const Z = window.__ZG; Z.S.testMode = false; const run = Z.S.run; Z.S.run = null;
    Z.go('battle', Z.NODES.find(n => n.battle && !n.stop) || { battle: { enemies: ['skrat'], scale: 1, meterStart: 0 }, title: 'Vaja', sub: '' }); window.__run = run; });
  await sleep(300); await playWord(); await sleep(400);
  await ev(() => { window.__ZG.S.run = window.__run; });
  const t2 = await prof();
  check(!t2.counters.words && !Object.keys(t2.unlocked).length, 'a practice battle (no journey) counts for nothing', JSON.stringify(t2.counters));

  // ---------------------------------------------------------------- a real journey battle: words, the first skill card, toasts
  await ev(() => { const Z = window.__ZG; Z.resetRun(); Z.S.testMode = false; Z.setCardForce('B'); Z.newRun('krpan'); Z.joinHero('kurent'); });
  await battle(false); await sleep(300);
  const w1 = await playWord(); await sleep(120);
  const card = await ev(() => { const c = document.querySelector('.card.folk.paint'); return c ? { img: !!c.querySelector('.pic.paint img[src^="data:image/webp"]'), cls: c.className } : null; });
  await sleep(500);
  const p1 = await prof(), toast1 = await ev(() => (document.querySelector('.toast') || {}).textContent || '');
  check(p1.counters.words === 1 && p1.unlocked['prva-beseda'] && p1.words.length === 1, 'the first real word: counted once, its base form kept, Prva beseda unlocked', JSON.stringify({ w1, c: p1.counters, words: p1.words }));
  check(Object.keys(p1.cards.skill).some(k => /^(krpan|kurent):[123]$/.test(k)), 'the skill that fired collects its painted card (first time in a journey battle)', JSON.stringify(p1.cards.skill));
  check(card && card.img, 'with ?karte=B the battle card shows Codex\'s painting', JSON.stringify(card));
  check(/^(Dosežek: Prva beseda|Nova karta: )/.test(toast1), 'a short toast, never a dialog: the first unlock is on screen', toast1);
  const queued = await ev(async () => { const seen = new Set(), t0 = Date.now(); while (Date.now() - t0 < 7200) { const t = document.querySelector('.toast'); if (t) seen.add(t.textContent); await new Promise(r => setTimeout(r, 150)); } return [...seen]; });
  check(queued.length >= 2 && queued.some(t => /^Nova karta: .+ \((Martin Krpan|Kurent)\)$/.test(t)) && queued.some(t => /Prva beseda/.test(t)), 'several unlocks at once: the toasts come one after another', JSON.stringify(queued));

  // the A side of the card test: the SVG board (Nizka keeps it whatever the test says)
  await ev(() => { localStorage.setItem('zg-fidelity', 'low'); });
  await playWord(); await sleep(150);
  const svg = await ev(() => { const c = [...document.querySelectorAll('.card.folk')].pop(); return c ? { svg: !!c.querySelector('.pic svg'), paint: c.classList.contains('paint') } : null; });
  check(svg && svg.svg && !svg.paint, 'Kakovost slik → Nizka keeps the hand-made SVG board in battle', JSON.stringify(svg));
  await ev(() => { localStorage.removeItem('zg-fidelity'); window.__ZG.setCardForce(null); });
  const tags = await ev(() => window.__ZG.bgStatTags().filter(t => t.startsWith('karte=')));
  check(tags.length === 1 && /^karte=[AB]$/.test(tags[0]), 'the card variant goes into the tester statistics', JSON.stringify(tags));

  // ---------------------------------------------------------------- the battle is won: counters and the page
  await ev(() => { const Z = window.__ZG; Z.B.enemies.forEach(e => { if (e.hp > 0) Z.damageEnemy(e, 9999); }); });
  await sleep(1900);
  const p2 = await prof();
  check(p2.counters.battlesWon === 1 && p2.unlocked['prva-zmaga'] && Object.keys(p2.counters).some(k => k.startsWith('foe:')) && (p2.sets.foeTypes || []).length >= 1,
    'a won battle: Prva zmaga, the enemy kinds counted', JSON.stringify({ c: p2.counters, s: p2.sets }));

  // persists through a reload and a new journey
  await page.reload(); await page.waitForFunction(() => !!window.__ZG); await sleep(300);
  await ev(() => { const Z = window.__ZG; Z.S.tutOn = false; Z.newRun('kurent'); });
  const p3 = await prof();
  check(p3.counters.words === p2.counters.words && p3.unlocked['prva-zmaga'] && Object.keys(p3.cards.skill).length === Object.keys(p2.cards.skill).length,
    'the profile survives a reload and a new journey', JSON.stringify({ before: p2.counters.words, after: p3.counters.words }));

  await ev(() => window.__ZG.go('heroes')); await sleep(300);
  const pg = await ev(() => { const q = s => [...document.querySelectorAll(s)];
    return { groups: q('.achs .achgroup h3').map(h => h.firstChild.textContent), got: q('.ach.got').length, bars: q('.ach .ach-bar').length,
      secret: q('.ach.secret b').slice(0, 1).map(b => b.firstChild.textContent), tier: (document.querySelector('.ach.got .ach-tier') || {}).textContent,
      lockedStory: q('.storycards .ach.secret').length, count: document.querySelector('.achs h2 .tag').textContent }; });
  check(pg.groups.join() === 'Besede,Pošasti,Pot,Druščina,Skrivnost,Karte zgodb' && pg.got >= 2 && pg.bars > 10 && pg.secret[0] === '???' && pg.tier === 'bronasta' && pg.lockedStory >= 10 && /^\d+ od 59$/.test(pg.count),
    'Dosežki in junaki: groups, tier tags, progress bars, ??? for secrets and for the cards of heroes not met', JSON.stringify(pg));

  // ---------------------------------------------------------------- the hero screen: bio ↔ skill cards, a card full screen
  await ev(() => { const Z = window.__ZG; Z.go('hero', { kind: 'codex', ids: ['krpan'], crumb: 'Nazaj', next: () => Z.go('heroes') }); }); await sleep(300);
  const hs = await ev(async () => { const btn = [...document.querySelectorAll('.hm-actions .btn')].find(b => b.textContent === 'Karte veščin'); if (!btn) return null; btn.click();
    await new Promise(r => setTimeout(r, 100));
    const q = s => [...document.querySelectorAll(s)];
    const out = { shown: !document.querySelector('.skillcards').hidden, flipHidden: document.querySelector('.flip').hidden, open: q('.skillcards .sc:not(.locked) img').length, locked: q('.skillcards .sc.locked').length };
    const o = document.querySelector('.skillcards .sc-open'); if (o) { o.click(); await new Promise(r => setTimeout(r, 100)); out.viewer = !!document.querySelector('.cardview img'); }
    return out; });
  await page.keyboard.press('Escape'); await sleep(150);
  const closed = await ev(() => !document.querySelector('.cardview'));
  const krpanCards = Object.keys(p3.cards.skill).filter(k => k.startsWith('krpan:')).length;
  check(hs && hs.shown && hs.flipHidden && hs.open === krpanCards && hs.open + hs.locked === 3, 'the hero screen switches to the skill cards: collected ones painted, the rest ???', JSON.stringify({ hs, krpanCards }));
  check(hs && (hs.open ? hs.viewer && closed : true), 'a tapped card opens full screen; Esc closes it', JSON.stringify({ viewer: hs && hs.viewer, closed }));

  // ---------------------------------------------------------------- Lintvern falls: story cards for the heroes alive
  await ev(() => { const Z = window.__ZG; Z.achReset(); Z.resetRun(); Z.S.testMode = false; Z.S.mode = 'calm'; Z.newRun('krpan'); Z.joinHero('kurent'); Z.joinHero('matjaz');
    Z.enterRegion(Z.WORLD.regions.length - 1); });
  await ev(() => { const Z = window.__ZG; Z.S.heroes[1].hp = 0; Z.S.heroes[1].down = true; Z.stopBattle(Z.S.run.stops.find(s => s.kind === 'boss')); Z.B.enemies.forEach(e => { e.charge = -99; }); });
  await sleep(300);
  await ev(() => { const Z = window.__ZG; Z.B.enemies.forEach(e => { if (e.hp > 0) Z.damageEnemy(e, 99999); }); });
  await sleep(1900);
  await ev(() => window.__ZG.go('ending')); await sleep(300);
  const fin = await prof();
  check(fin.cards.story.krpan && fin.cards.story.matjaz && !fin.cards.story.kurent && fin.unlocked['slovenija-v-besedah'] && fin.unlocked['zmajeva-tehtnica'],
    'Lintvern falls: Krpan and Matjaž (alive) earn their story cards, Kurent (down at the win) does not; Slovenija v besedah', JSON.stringify({ story: fin.cards.story, unlocked: Object.keys(fin.unlocked) }));
  check(!fin.unlocked['druzina-ostane-skupaj'], 'one hero down: Družina ostane skupaj stays locked');
  check((fin.sets.knowsWon || []).length === 1 && (fin.sets.folkWon || []).includes('kurent'), 'the journey counts for its Znanje and for every hero who travelled to the end', JSON.stringify(fin.sets));

  check(errors.length === 0, 'no page errors', errors.join(' | '));
  return ctx;
});
