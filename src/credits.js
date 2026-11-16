// ============================================================ credits ("O igri": Avtor, Navdih, Zasluge)
// The game names its maker and why it was made, and says it grew out of playing word games with a role-playing
// game in mind. It names no other game, on any platform, so no store or platform review can stumble on it
// (zagovor-store-release.md, 16 Nov 2026); the README, which ships with the PC versions, keeps the full credit
// to the game that inspired it. Zasluge list every source, folded behind ©.
const AUTHOR = { studio: 'Oygn Productions', name: 'Davor Kirbiš' };
const extLink = (href, text) => h('a', { href, target: '_blank', rel: 'noopener noreferrer' }, text, h('span', { 'aria-hidden': 'true' }, ' ↗'));
const madeBy = () => ['Igro je razvil ', h('b', {}, AUTHOR.studio), ` (${AUTHOR.name}).`];
// one line, used on the ending
const inspiredLine = () => h('p', { class: 'inspired' }, ...madeBy(), ' ',
  h('button', { class: 'linkbtn', onclick: () => go('about', 'avtor') }, 'O igri in zasluge'));

// O igri → Avtor: who made it, and why
const creditAuthor = () => [
  h('p', { class: 'author' }, ...madeBy()),
  h('p', {}, 'Videoigre in pripovedovanje zgodb so moja neizmerna strast, ', h('i', {}, 'Za govor!'), ' pa je moj veliki projekt iz srca.'),
  h('p', {}, h('i', {}, 'Za govor!'), ' sem želel ustvariti za promocijo našega prelepega slovenskega jezika in naše zelo zanimive folklore, saj nas to dela Slovence.')];
// O igri → Navdih: no other game is named
const creditInspiration = () => [
  h('p', {}, h('i', {}, 'Za govor!'), ' je nastal ob igranju različnih besednih iger in ob misli, kako bi se besedne uganke povezale z igro vlog: da prava beseda postane junaški napad.'),
  h('p', {}, 'Igra je samostojno delo z lastno kodo, podobo, junaki in zgodbo ter iz drugih iger ne prevzema ničesar razen ljubezni do sestavljanja besed.')];
// O igri → Zasluge: every source, one sub-section each
function creditSources() {
  const sec = (title, ...kids) => h('section', { class: 'credit-sec' }, h('h3', {}, title), ...kids);
  return [
    sec('Besede in uganke',
      h('p', {}, 'Besede, ki jih igra sprejme, in njihove osnovne oblike so iz ',
        extLink('http://hdl.handle.net/11356/2080', 'morfološkega leksikona Sloleks 3.1'),
        ' (Jaka Čibej, Kaja Gantar, Kaja Dobrovoljc, Simon Krek idr., Center za jezikovne vire in tehnologije Univerze v Ljubljani; repozitorij CLARIN.SI, licenca CC BY-SA 4.0). Iz njega je tudi pogostost besed v korpusu Gigafida 2.0.'),
      h('p', {}, 'Besede, ki jih Sloleks nima, so dodane iz ',
        extLink('http://hdl.handle.net/11356/1445', 'Geslovnika portala Franček'),
        ' (ZRC SAZU, Inštitut za slovenski jezik Frana Ramovša; licenca CC BY 4.0) in iz ',
        extLink('http://hdl.handle.net/11356/2092', 'Tezavra sodobne slovenščine 2.2'),
        ' (Center za jezikovne vire in tehnologije Univerze v Ljubljani; repozitorij CLARIN.SI, licenca CC BY-SA 4.0). Njihove oblike so izpeljane po zgledu besed iz Sloleksa, ki se enako končajo. Geslovnik pomaga izbrati tudi besede, ki jih igra predlaga.'),
      h('p', {}, 'Seznam besed v igri je predelava teh virov (izbor oblik, izpeljane oblike, stisnjen zapis, imena iz mitologije) in je na voljo pod enako licenco CC BY-SA 4.0.'),
      h('p', {}, 'Vsa gesla za križanke so napisana posebej za to igro.')),
    sec('Izročilo',
      h('p', {}, 'Junaki in bitja izhajajo iz slovenskega ljudskega izročila (po delih Monike Kropej), iz slovanske mitologije in iz slovenske književnosti v javni domeni: Prešernov ', h('i', {}, 'Povodni mož'), ', Levstikov ', h('i', {}, 'Martin Krpan'), '.')),
    sec('Zvok, slike in programska oprema',
      h('p', {}, 'Zvočni učinki so sintetizirani z ZzFX (Frank Force, licenca MIT). Pikselne slike in ljudske poslikave so prototipne in narejene posebej za to igro.'),
      h('p', {}, 'Aplikacija za Android uporablja Capacitor (licenca MIT).'))];
}
// the sources take a lot of room: one line with © opens them
const creditSourcesFolded = () => h('details', { class: 'credits-more' },
  h('summary', {}, h('span', { class: 'copy', 'aria-hidden': 'true' }, '©'), ' Viri, licence in programska oprema'),
  ...creditSources());
