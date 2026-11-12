// ============================================================ phone specifics ("Mobilni prikaz")
// Everything a phone or tablet needs beyond the layout: an in-game Slovene keyboard, so
// crosswords and the rock slide never depend on the system keyboard (it covers half the
// screen, autocorrects, hides Č Š Ž behind a long press and behaves differently on every
// phone — and it is the weak spot of every game-engine export to Android), plus light
// haptics and a pause when the app goes to the background.

// The 25 letters of the Slovene alphabet in their QWERTZ places; Š, Ž and Č are plain keys.
const VK_ROWS = ['ertzuiopšž', 'asdfghjklč', 'cvbnm'];
function buzz(pattern) { if (S.mobile && navigator.vibrate) { try { navigator.vibrate(pattern); } catch (e) { /* not allowed here */ } } }
// onChar(letter), onBack(); extra = { label, fn } adds one wide action key (next word, …)
function vkbd({ onChar, onBack, extra }) {
  const key = (label, fn, cls, aria) => h('button', { class: 'vkey' + (cls ? ' ' + cls : ''), type: 'button', 'aria-label': aria,
    onpointerdown: e => e.preventDefault(),   // keys never take focus from the puzzle
    onclick: e => { e.preventDefault(); if (held()) return; buzz(8); fn(); } }, label);
  return h('div', { class: 'vkbd', role: 'group', 'aria-label': 'Slovenska tipkovnica' },
    VK_ROWS.map((row, r) => h('div', { class: 'vrow' },
      [...row].map(ch => key(ch, () => onChar(ch), '', 'črka ' + ch.toUpperCase())),
      r === 2 ? key('⌫', onBack, 'wide back', 'Briši črko') : null,
      r === 2 && extra ? key(extra.label, extra.fn, 'wide primary') : null)));
}
const cwKeyboard = () => vkbd({
  onChar: ch => { if (B && B.cw) cwType(ch); },
  onBack: () => { if (B && B.cw) cwBackspace(); },
  extra: { label: 'Naprej ▸', fn: () => { if (B && B.cw) cwNext(); } } });
const TRAP_MAX = 12;
const trapKeyboard = () => vkbd({
  onChar: ch => { const f = UI.trapInput; if (f && f.value.length < TRAP_MAX) f.value += ch; },
  onBack: () => { const f = UI.trapInput; if (f) f.value = f.value.slice(0, -1); } });

// A phone app that goes to the background (call, notification, home button) pauses itself.
document.addEventListener('visibilitychange', () => { if (document.hidden && !held()) setPause(true); });

// The Android app's back button (android/app/src/main/java/.../MainActivity.java) asks the game
// what to do. It answers 'exit' only on the start screen; everywhere else back pauses a running
// puzzle, resumes from the pause, closes an open panel or steps back to the start screen.
window.zgBack = () => {
  try {
    if (G.tut) { closeTut(); return 'ok'; }
    if (G.paused) { setPause(false); return 'ok'; }
    if (S.overlayKey) { S.overlayKey(new KeyboardEvent('keydown', { key: 'Escape' })); return 'ok'; }
    if (pausable()) { setPause(true); return 'ok'; }
    if (S.screen === 'title') return 'exit';
    if (S.ev && S.ev.done && (S.screen === 'chest' || S.screen === 'trap' || S.screen === 'darts')) { finishEvent(); return 'ok'; }
    if (S.screen === 'result' || S.screen === 'hero') return 'ok';   // these move on with their own button
    if (S.screen === 'ending') resetRun();
    go('title');
    return 'ok';
  } catch (err) { console.error(err); return 'ok'; }
};
