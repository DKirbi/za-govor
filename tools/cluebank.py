"""Everyday clue bank for generated crosswords -> data/clues.json.

    python3 tools/cluebank.py

Validates every clue (Slovene alphabet, 3-8 letters, no duplicates, answer not leaked
in the clue, enough row words for every keyword letter) and writes data/clues.json,
which build.py inlines into the prototype. Edit the BANK and THEMES below, then rerun
this script and build.py.
"""
# Everyday clue bank for generated crosswords.
# Original clues, written for this game in the modern Slovene style: everyday words,
# adjectives and verbs allowed, proverbs and fixed phrases as fill-ins, no obscure fillers.
# Format: ANSWER | clue | topic | difficulty (1 = everyone knows it, 2 = a bit harder)
# Mythology words are NOT in the bank: they only appear as the hidden keyword (geslo)
# or, sometimes, as one main entry. See THEMES at the bottom.
import json, pathlib, re, sys

BANK = """
KRUH|Vsakdanji ___, pečen iz moke|hrana|1
MLEKO|Bela pijača, ki jo daje krava|hrana|1
SIR|Ementalec, gavda ali trapist|hrana|1
MASLO|Namažemo ga na kruh, narejeno je iz smetane|hrana|1
JAJCE|Kaj je bilo prej: kura ali ___?|hrana|1
MED|Sladek pridelek čebel|hrana|1
SOL|Morska ali kamena začimba|hrana|1
POPER|Črna ali bela pekoča začimba|hrana|1
JUHA|Z njo se začne nedeljsko kosilo|hrana|1
POTICA|Praznično pecivo z orehovim nadevom|hrana|1
ŽGANCI|Ajdovi ___ z ocvirki|hrana|1
JOTA|Primorska enolončnica s kislim zeljem in fižolom|hrana|1
KLOBASA|Kranjska ___|hrana|1
ZELJE|Kislo ___ in kisla repa|hrana|1
REPA|Kislo zelje in kisla ___|hrana|1
FIŽOL|Stročnica v joti in ričetu|hrana|2
RIČET|Enolončnica iz ješprenja in fižola|hrana|2
JABOLKO|Ne pade daleč od drevesa|hrana|1
HRUŠKA|Sadež, po katerem se imenuje tudi žarnica|hrana|1
SLIVA|Modri sadež za cmoke in žganje|hrana|1
ČEŠNJA|Rdeč koščičast sadež, zori junija|hrana|1
JAGODA|Majhen rdeč sadež, gozdni ali vrtni|hrana|1
LIMONA|Kisel rumen sadež|hrana|1
BANANA|Rumen sadež, ki ga olupimo|hrana|1
GROZDJE|Iz njega stisnejo vino|hrana|1
VINO|Cviček, teran ali refošk|hrana|1
PIVO|Pijača iz ječmena in hmelja|hrana|1
ČAJ|Kamilični, lipov ali metin napitek|hrana|1
KAVA|Jutranji napitek iz praženih zrn|hrana|1
SOK|Jabolčni ali pomarančni napitek|hrana|1
TORTA|Pecivo s svečkami za rojstni dan|hrana|1
PICA|Okrogla italijanska jed s sirom|hrana|1
RIŽ|Bela zrna, ki jih jedo s paličicami|hrana|1
MOKA|Zmleto žito|hrana|1
SLADKOR|Z njim sladkamo kavo|hrana|1
OLJE|Oljčno, bučno ali sončnično|hrana|1
KIS|Jabolčni ali vinski, za solato|hrana|1
SOLATA|Zelena priloga z oljem in kisom|hrana|1
KROMPIR|Gomolj za pire ali pražen ___|hrana|1
KORENJE|Oranžna zelenjava, ki jo ima rad zajec|hrana|1
ČEBULA|Ob rezanju nas spravi v jok|hrana|1
ČESEN|Pravijo, da odganja vampirje|hrana|1
PAPRIKA|Rdeča, rumena ali zelena zelenjava|hrana|1
KUMARA|Zelena zelenjava za solato, tudi vložena|hrana|1
BUČA|Oranžna jesenska zelenjava, iz semen stisnejo olje|hrana|1
OREH|Lupino strem, jedrce pojem|hrana|1
KOSTANJ|Jeseni ga pečemo in lupimo|hrana|1
GOBA|Jurček ali lisička|hrana|1
ŽLICA|Z njo jemo juho|hrana|1
VILICE|Z njimi napičimo hrano|hrana|1
NOŽ|Ostro orodje za rezanje|hrana|1
LONEC|V njem kuhamo juho|hrana|1
KROŽNIK|Plitev ali globok, za hrano|hrana|1
PEČ|Krušna ali kmečka, na njej se grejemo|dom|1
KUHAR|Mojster v kuhinji|ljudje|1
KROF|Ocvrto pecivo za pust|hrana|1
HIŠA|Dom s streho, vrati in okni|dom|1
STREHA|Nad glavo, pokrita z opeko|dom|1
OKNO|Skozi njega gledamo ven|dom|1
VRATA|Odpremo jih, ko kdo potrka|dom|1
MIZA|Za njo sedemo h kosilu|dom|1
STOL|Na njem sedimo|dom|1
POSTELJA|V njej spimo|dom|1
OMARA|V njej visijo obleke|dom|1
KLJUČ|Z njim odklenemo vrata|dom|1
STENA|Na njej visi slika|dom|1
TLA|Po njih hodimo|dom|1
KLET|Prostor pod hišo, tudi za vino|dom|1
VRT|Zelenjavni ali cvetlični, za hišo|dom|1
OGRAJA|Obdaja vrt ali dvorišče|dom|1
DIMNIK|Po njem se vali dim|dom|1
LUČ|Prižgemo jo, ko se zmrači|dom|1
SVEČA|Gori na torti ali v cerkvi|dom|1
URA|Kaže čas|dom|1
ZVONEC|Pozvoni pri vratih|dom|1
PREPROGA|Leži na tleh v dnevni sobi|dom|1
BLAZINA|Mehka podloga pod glavo|dom|1
ODEJA|Pokrijemo se z njo|dom|1
MILO|Z njim si umijemo roke|dom|1
BRISAČA|Z njo se obrišemo|dom|1
METLA|Z njo pometamo, čarovnica leti na njej|dom|1
PIPA|Iz nje teče voda|dom|1
SONCE|Sije podnevi|narava|1
LUNA|Ponoči sveti, polna je ob ščipu|narava|1
ZVEZDA|Ponoči migota na nebu|narava|1
NEBO|Modro je nad nami|narava|1
OBLAK|Bel ali siv, plava po nebu|narava|1
DEŽ|Pada iz oblakov|narava|1
SNEG|Bela zimska odeja|narava|1
TOČA|Ledena zrna, ki klestijo vinograde|narava|1
VETER|Piha, lahko je burja ali jugo|narava|1
BURJA|Močan sunkovit veter na Krasu|narava|1
MAVRICA|Barvni lok po dežju|narava|1
MEGLA|Gosta siva tančica v dolini|narava|1
ROSA|Jutranje kapljice na travi|narava|1
LED|Zamrznjena voda|narava|1
REKA|Sava, Drava ali Mura|narava|1
MORJE|Jadransko ___|narava|1
JEZERO|Blejsko ali Bohinjsko ___|narava|1
POTOK|Majhna tekoča voda|narava|1
SLAP|Savica ali Peričnik|narava|1
GORA|Triglav je najvišja pri nas|narava|1
HRIB|Manjši od gore|narava|1
DOLINA|Svet med dvema gorama|narava|1
JAMA|Postojnska ali Škocjanska|narava|1
GOZD|Veliko dreves skupaj|narava|1
DREVO|Ima deblo in krošnjo|narava|1
LIST|Zelen je na drevesu, bel v zvezku|narava|1
CVET|Del rastline, ki ga obišče čebela|narava|1
ROŽA|Lepa je, a ima trne|narava|1
TRAVA|Raste na travniku, krave jo mulijo|narava|1
LIPA|Slovensko drevo, iz cvetov je čaj|narava|1
HRAST|Mogočno drevo z želodom|narava|1
BREZA|Drevo z belim lubjem|narava|1
SMREKA|Iglavec, ki ga okrasimo za božič|narava|1
KAMEN|Trd kos skale|narava|1
PESEK|Na plaži in v peskovniku|narava|1
ZEMLJA|Naš planet, pa tudi prst na vrtu|narava|1
ZRAK|Dihamo ga|narava|1
OGENJ|Gori in greje|narava|1
ISKRA|Iz nje se vname ogenj|narava|1
VODA|Tiha ___ bregove dere|narava|1
OTOK|Blejski ___ s cerkvico|narava|1
PES|___, ki laja, ne grize|zivali|1
MAČKA|Hodi kot ___ okoli vrele kaše|zivali|1
MIŠ|Reven kot cerkvena ___|zivali|1
KRAVA|Muka na pašniku in daje mleko|zivali|1
KONJ|Rezgeta, na njem jezdimo|zivali|1
OVCA|Daje volno|zivali|1
KOZA|Meketa in ima brado|zivali|1
PRAŠIČ|Kruli v svinjaku|zivali|1
KOKOŠ|Kokodaka in znese jajce|zivali|1
PETELIN|Zjutraj zapoje kikiriki|zivali|1
RACA|Gaga na ribniku|zivali|1
GOS|Gaga, iz njenega puha so pernice|zivali|1
ZAJEC|Dolgouhec, ki rad je korenje|zivali|1
MEDVED|Kosmatinec iz kočevskih gozdov|zivali|1
VOLK|Lačen kot ___|zivali|1
LISICA|Zvita kot ___|zivali|1
SRNA|Plaha gozdna žival, samec je srnjak|zivali|1
JELEN|Gozdni samec z rogovjem|zivali|1
RIS|Gozdna mačka s čopki na ušesih|zivali|2
OREL|Kralj ptic|zivali|1
SOVA|Ponoči huka|zivali|1
VRANA|Črna ptica, ki kraka|zivali|1
LASTOVKA|Ena še ne prinese pomladi|zivali|1
ŠTORKLJA|Po pravljici prinaša dojenčke|zivali|1
ČEBELA|Kranjska ___ nabira med|zivali|1
MRAVLJA|Pridna žuželka, ki gradi kup|zivali|1
PAJEK|Plete mrežo|zivali|1
POLŽ|Počasen kot ___|zivali|1
ŽABA|Rega v mlaki|zivali|1
RIBA|Zdrav kot ___|zivali|1
POSTRV|Soška ___|zivali|2
KAČA|Plazilec brez nog|zivali|1
METULJ|Iz bube izleti ___|zivali|1
KIT|Velikanski morski sesalec|zivali|1
LEV|Kralj živali z grivo|zivali|1
SLON|Ima rilec in čekane|zivali|1
OPICA|Pleza po drevju in je banane|zivali|1
TIGER|Črtasta velika mačka|zivali|1
ŽIRAFA|Žival z najdaljšim vratom|zivali|1
KAMELA|Ima grbo in živi v puščavi|zivali|1
DELFIN|Pameten morski sesalec, ki rad skače|zivali|1
OSEL|Trmast kot ___|zivali|1
ROKA|___ roko umije|telo|1
NOGA|Z njo hodimo|telo|1
GLAVA|Na vratu, v njej so možgani|telo|1
OKO|Z njim gledamo|telo|1
UHO|Z njim poslušamo|telo|1
NOS|Z njim vohamo|telo|1
USTA|Z njimi jemo in govorimo|telo|1
ZOB|Oko za oko, ___ za ___|telo|1
JEZIK|Nima kosti, a kosti lomi|telo|1
SRCE|Bije v prsih|telo|1
LASJE|Rastejo na glavi|telo|1
PRST|Palec ali kazalec|telo|1
KOLENO|Pregib sredi noge|telo|1
KOMOLEC|Pregib sredi roke|telo|1
RAMA|Na njej nosimo torbo|telo|1
HRBET|Zadnja stran telesa|telo|1
TREBUH|Ko je lačen, kruli|telo|1
KOST|Pes jo rad gloda|telo|1
KRI|Rdeča tekočina v žilah|telo|1
KOŽA|Pokriva vse telo|telo|1
OČI|Česar ___ ne vidijo, srce ne boli|telo|1
ŽOGA|Okrogla, brcamo jo|sport|1
GOL|Zadetek pri nogometu|sport|1
SMUČI|Z njimi drsimo po snegu|sport|1
SKOK|Odriv v zrak|sport|1
TEK|Maraton je dolg ___|sport|1
KOLO|Vozimo ga s pedali|sport|1
TEKMA|Športno srečanje dveh ekip|sport|1
ŠAH|Igra s kraljem, kraljico in kmeti|sport|1
KARTE|Z njimi igramo tarok|sport|1
KOCKA|Ima šest ploskev in pike|sport|1
ZMAGA|Nasprotje poraza|sport|1
MEDALJA|Zlata, srebrna ali bronasta|sport|1
KOŠ|Za smeti ali pleten iz šibja|sport|1
MREŽA|Pri tenisu loči obe polovici igrišča|sport|1
LOPAR|Teniški ali za namizni tenis|sport|1
SANKE|Pozimi se z njimi spuščamo po bregu|sport|1
PLES|Valček ali polka|sport|1
PESEM|Zapojemo jo|sport|1
KITARA|Glasbilo s šestimi strunami|sport|1
BOBEN|Nanj tolčemo s palicami|sport|1
VIOLINA|Godalo, ki ga držimo pod brado|sport|1
POLKA|Hiter ples ob harmoniki|sport|2
CESTA|Po njej vozijo avtomobili|mesto|1
AVTO|Vozilo s štirimi kolesi|mesto|1
VLAK|Vozi po tirih|mesto|1
LETALO|Vzleti z letališča|mesto|1
LADJA|Pluje po morju|mesto|1
MOST|Pelje čez reko|mesto|1
TRG|Prešernov ___ v Ljubljani|mesto|1
ŠOLA|Tam se učimo|mesto|1
POŠTA|Tja nesemo paket in pismo|mesto|1
PISMO|Vržemo ga v nabiralnik|mesto|1
BANKA|Tam hranimo denar|mesto|1
DENAR|Evri v listnici|mesto|1
TRGOVINA|Tam kupujemo|mesto|1
CERKEV|Ima zvonik|mesto|1
GRAD|Ljubljanski ___ na hribu|mesto|1
MESTO|Ljubljana ali Maribor|mesto|1
VAS|Manjše naselje na podeželju|mesto|1
KMET|Orje njivo|ljudje|1
NJIVA|Kmet jo orje|mesto|1
PARK|Zelenica sredi mesta|mesto|1
AVTOBUS|Mestni prevoz s postajami|mesto|1
SEMAFOR|Rdeča, rumena in zelena luč|mesto|1
TAKSI|Plačljiv prevoz z voznikom|mesto|1
KOZOLEC|Lesena stavba za sušenje sena|mesto|1
MAMA|Ona te je rodila|ljudje|1
OČE|Ata, tata|ljudje|1
BRAT|Sin istih staršev|ljudje|1
SESTRA|Hči istih staršev, tudi medicinska|ljudje|1
BABICA|Mamina ali očetova mama|ljudje|1
DEDEK|Mamin ali očetov oče|ljudje|1
OTROK|Še ni odrasel|ljudje|1
SOSED|Živi v hiši zraven|ljudje|1
UČITELJ|Uči v šoli|ljudje|1
ZDRAVNIK|Pregleda bolnika|ljudje|1
PEK|Peče kruh|ljudje|1
KOVAČ|Vsak je sam svoje sreče ___|ljudje|1
ZIDAR|Zida hiše|ljudje|1
MIZAR|Izdeluje pohištvo iz lesa|ljudje|1
RIBIČ|Lovi ribe|ljudje|1
PASTIR|Pase ovce|ljudje|1
KRALJ|Nosi krono|ljudje|1
VOJAK|Služi v vojski|ljudje|1
PILOT|Upravlja letalo|ljudje|1
SLIKAR|Slika s čopičem|ljudje|1
KNJIGA|Ima platnice in strani|predmeti|1
ZVEZEK|Vanj pišemo v šoli|predmeti|1
SVINČNIK|Kar napišemo z njim, lahko zradiramo|predmeti|1
PERO|Ptičje ali nalivno|predmeti|1
TABLA|Nanjo pišemo s kredo|predmeti|1
KREDA|Z njo pišemo po tabli|predmeti|1
TORBA|Šolska ___ na hrbtu|predmeti|1
SLIKA|Visi na steni v okvirju|predmeti|1
PAPIR|Nanj pišemo in rišemo|predmeti|1
ŠKARJE|Z njimi režemo papir|predmeti|1
IGLA|Z njo šivamo|predmeti|1
NIT|Vdenemo jo v šivanko|predmeti|1
GUMB|Na srajci ali na daljincu|predmeti|1
ČEVELJ|Obujemo ga na nogo|predmeti|1
KAPA|Pozimi jo nosimo na glavi|predmeti|1
PLAŠČ|Topel zimski površnik|predmeti|1
SRAJCA|Ima ovratnik in gumbe|predmeti|1
HLAČE|Imajo dve hlačnici|predmeti|1
KRILO|Nosijo ga dekleta, ima ga tudi ptica|predmeti|1
DEŽNIK|Varuje pred dežjem|predmeti|1
OČALA|Pomagajo, ko slabo vidimo|predmeti|1
TELEFON|Z njim pokličemo|predmeti|1
RADIO|Iz njega sta glasba in novice|predmeti|1
LUTKA|Igrača, podobna človeku|predmeti|1
BALON|Napihnjen poleti v zrak|predmeti|1
ZASTAVA|Plapola na drogu|predmeti|1
KLOBUK|Pokrivalo s krajci|predmeti|1
ROBEC|Z njim si obrišemo nos|predmeti|1
VREČA|Za smeti ali krompir|predmeti|1
ŠKATLA|Kartonska ali za čevlje|predmeti|1
LESTEV|Po njej splezamo na podstrešje|predmeti|1
VEDRO|Posoda z ročajem za vodo|predmeti|1
SEKIRA|Z njo cepimo drva|predmeti|1
KLADIVO|Z njim zabijamo žeblje|predmeti|1
ŽEBELJ|Zabijemo ga s kladivom|predmeti|1
VRV|Z njo kaj zvežemo|predmeti|1
PODKOVA|Prinaša srečo nad vrati|predmeti|1
DAN|Ima 24 ur|cas|1
NOČ|Nasprotje dneva|cas|1
JUTRO|Del dneva po zori|cas|1
VEČER|Del dneva pred nočjo|cas|1
TEDEN|Sedem dni|cas|1
MESEC|Ima okrog trideset dni|cas|1
LETO|Ima 365 dni|cas|1
POMLAD|Letni čas, ko vse ozeleni|cas|1
POLETJE|Najtoplejši letni čas|cas|1
JESEN|Letni čas, ko odpada listje|cas|1
ZIMA|Letni čas s snegom|cas|1
MAJ|Peti mesec v letu|cas|1
JUNIJ|Šesti mesec v letu|cas|1
PETEK|Zadnji delovni dan v tednu|cas|1
NEDELJA|Dan počitka|cas|1
BOŽIČ|Praznik 25. decembra|cas|1
PUST|Čas mask in krofov|cas|1
PIRH|Pobarvano velikonočno jajce|cas|1
RDEČ|Barva češnje|lastnosti|1
MODER|Barva neba|lastnosti|1
ZELEN|Barva trave|lastnosti|1
BEL|Barva snega|lastnosti|1
ČRN|Barva oglja|lastnosti|1
RUMEN|Barva limone|lastnosti|1
LAČEN|___ kot volk|lastnosti|1
VELIK|Nasprotje majhnega|lastnosti|1
MAJHEN|Nasprotje velikega|lastnosti|1
STAR|Nasprotje mladega|lastnosti|1
MLAD|Nasprotje starega|lastnosti|1
TOPEL|Nasprotje mrzlega|lastnosti|1
HITER|Nasprotje počasnega|lastnosti|1
SLADEK|Okus medu|lastnosti|1
KISEL|Okus limone|lastnosti|1
SLAN|Okus morske vode|lastnosti|1
PETI|Kar počne pevski zbor|glagoli|1
TEČI|Hitro se premikati z nogami|glagoli|1
SPATI|Kar počnemo ponoči v postelji|glagoli|1
JESTI|Kar počnemo pri kosilu|glagoli|1
PITI|Kar storimo, ko smo žejni|glagoli|1
BRATI|Kar počnemo s knjigo|glagoli|1
PISATI|Kar počnemo s svinčnikom|glagoli|1
PLESATI|Kar počnemo ob polki|glagoli|1
BLED|Jezero z otokom in kremšnito|slovenija|1
PIRAN|Obmorsko mesto s Tartinijevim trgom|slovenija|1
SAVA|Najdaljša slovenska reka|slovenija|1
DRAVA|Reka skozi Maribor|slovenija|1
MURA|Reka v Prekmurju|slovenija|1
SOČA|Smaragdna reka|slovenija|1
KRKA|Dolenjska reka, tudi tovarna zdravil|slovenija|1
KRAS|Pokrajina s teranom in burjo|slovenija|1
PTUJ|Najstarejše slovensko mesto, slovi po kurentovanju|slovenija|1
KOPER|Mesto z edinim slovenskim tovornim pristaniščem|slovenija|1
CELJE|Mesto Celjskih grofov|slovenija|1
KRANJ|Prešernovo mesto na Gorenjskem|slovenija|1
BOHINJ|Dolina z našim največjim stalnim jezerom|slovenija|1
POSTOJNA|Mesto z najbolj znano kraško jamo|slovenija|1
PLANICA|Dolina letalnic|slovenija|1
EVRO|Slovenska valuta|slovenija|1
LIPICA|Kobilarna belih konj na Krasu|slovenija|2
PREŠEREN|Pesnik Zdravljice|slovenija|1
CANKAR|Pisatelj Hlapca Jerneja|slovenija|2
ZLATO|Ni vse ___, kar se sveti|pregovori|1
JAMO|Kdor drugemu ___ koplje, sam vanjo pade|pregovori|1
RANA|___ ura, zlata ura|pregovori|1
LAŽ|Ima kratke noge|pregovori|1
DELO|Brez ___ ni jela|pregovori|1
SREČA|___ je opoteča|pregovori|1
RESNICA|Nasprotje laži|pregovori|1
SVET|Ves planet z ljudmi, tudi občinski ___|pregovori|1
ROG|Ima ga koza ali jelen|zivali|1
"""

# Mythology keywords per crossword theme. style: None = random (geslo column or mixed crossword),
# 'geslo' = always a hidden keyword column, 'cross' = everyday words only.
THEMES = {
  'perun':   {'title': 'Perunov zagovor', 'style': None, 'keys': [['PERUN', 'Slovanski bog groma in strele']]},
  'kres':    {'title': 'Kresni zagovor', 'style': None, 'keys': [['KRESNIK', 'Junak, ki se v pripovedkah bori z zmajem'],
                                                               ['KURENT', 'Kosmata pustna šema s Ptujskega polja']]},
  'mokos':   {'title': 'Mokošin zagovor', 'style': None, 'keys': [['MOKOŠ', 'Boginja zemlje, preje in žena'],
                                                                ['VILA', 'Lepotica iz gozdov in voda v pripovedkah']]},
  'triglav': {'title': 'Triglavov zagovor', 'style': None, 'keys': [['TRIGLAV', 'Troglavo božanstvo in naša najvišja gora'],
                                                                  ['VELES', 'Bog podzemlja in živine, Perunov tekmec'],
                                                                  ['ZLATOROG', 'Beli gams z zlatimi rogovi']]},
  'zaseda':  {'title': 'Zaseda ob reki', 'style': 'cross', 'keys': []},
  'vrtinec': {'title': 'Vrtinec', 'style': 'geslo', 'keys': [['URŠKA', 'Prevzetna plesalka iz Prešernove balade Povodni mož']]},
  'zmaj':    {'title': 'Zmajeva uganka', 'style': 'geslo', 'keys': [['ZMAJ', 'Varuh Ljubljane z mestnega grba']]},
}

ALPHA = set('ABCČDEFGHIJKLMNOPRSŠTUVZŽ')
root = pathlib.Path(__file__).resolve().parent.parent / 'data'
rows, seen, problems = [], set(), []
for line in BANK.strip().splitlines():
    a, c, t, d = [x.strip() for x in line.split('|')]
    if a in seen: problems.append('duplicate ' + a)
    seen.add(a)
    if not set(a) <= ALPHA: problems.append('bad letters ' + a)
    if not 3 <= len(a) <= 8: problems.append('bad length ' + a)
    if '___' not in c and a.lower() in c.lower(): problems.append('answer in clue ' + a)
    rows.append([a, c, t, int(d)])

# every keyword letter needs enough row words for the geslo column style
for tid, th in THEMES.items():
    for k, _ in th['keys']:
        assert set(k) <= ALPHA, k
        if k in seen: problems.append('keyword also in bank ' + k)
        easy = th['style'] == 'geslo'
        for ch in set(k):
            n = sum(1 for a, _, _, d in rows if ch in a and (not easy or (d == 1 and len(a) <= 5)))
            if n < 4: problems.append(f'{tid}/{k}: only {n} row words with {ch}')

# words the battle dictionary doesn't know (proper nouns are expected here) — printed for review
d = json.loads((root / 'dict.json').read_text())
forms = set()
for lemma, fs in d.items():
    forms.add(lemma); forms.update(fs if isinstance(fs, list) else [])
unknown = [a for a, *_ in rows if a.lower() not in forms]

if problems:
    print('\n'.join(problems)); sys.exit(1)
(root / 'clues.json').write_text(json.dumps({'bank': rows, 'themes': THEMES}, ensure_ascii=False, separators=(',', ':')))
from collections import Counter
print(len(rows), 'clues;', dict(Counter(t for _, _, t, _ in rows)))
print('not in battle dictionary (check spelling):', ' '.join(unknown))
