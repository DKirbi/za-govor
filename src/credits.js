
// ============================================================ credits ("Zasluge")
// Za govor is inspired by Words for Evil (Chromosphere Games, 2014). The game says so in three
// places: a line on the start screen, the ending after the dragon, and this screen, which also
// lists every source the prototype uses.
const WFE = { title: 'Words for Evil', by: 'Chromosphere Games', person: 'Dylan Loney', year: 2014,
  url: 'https://store.steampowered.com/app/335790/Words_for_Evil/' };
const extLink = (href, text) => h('a', { href, target: '_blank', rel: 'noopener noreferrer' }, text, h('span', { 'aria-hidden': 'true' }, ' ↗'));
// one line, used on the start screen and on the ending
const inspiredLine = () => h('p', { class: 'inspired' },
  'Za govor je nastal po navdihu igre ', h('i', {}, WFE.title), ` (${WFE.by}, ${WFE.year}). `,
  h('button', { class: 'linkbtn', onclick: () => go('credits') }, 'Zasluge'));

function renderCredits() {
  const sec = (title, ...kids) => h('section', {}, h('h3', {}, title), ...kids);
  SCR.append(h('div', { class: 'title credits' },
    h('div', { class: 'logo' }, 'Zasluge'),
    h('div', { class: 'tagline' }, 'Za govor — besedna igra s slovanskimi bogovi in slovenskim ljudskim izročilom'),
    h('div', { class: 'folk-rule' }),
    sec('Navdih',
      h('p', {}, 'Za govor je nastal po navdihu igre ', h('b', {}, h('i', {}, WFE.title)),
        `, ki jo je leta ${WFE.year} izdal studio ${WFE.by} (${WFE.person}). Od nje izhaja zamisel o igri vlog, v kateri se junaki bojujejo z besedami iz mreže črk, barva črk pa določa, kateri junak napade.`),
      h('p', {}, 'Za govor je samostojna igra z lastnimi junaki, slikami, ugankami in besedili v slovenščini. Z avtorji igre ', h('i', {}, WFE.title), ' ni uradno povezana.'),
      h('p', {}, extLink(WFE.url, `${WFE.title} na Steamu`))),
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
      h('p', {}, 'Aplikacija za Android uporablja Capacitor (licenca MIT).')),
    h('div', { class: 'row', style: { 'justify-content': 'flex-start' } },
      h('button', { class: 'btn primary', onclick: () => go('title') }, 'Nazaj ', h('kbd', {}, 'Esc')))));
}
