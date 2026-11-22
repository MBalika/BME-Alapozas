#!/usr/bin/env python3
# Alapozás AR labor: ar-labor/index.html (magyar) és ar-labor/en.html (angol) – a sablon (page.tpl.html) + a szövegek és a modellek adatai
# + a formázás-őr (guard.js); mellé az xr.js (térbeli lerakás koppintással) és a nyomtatható QR-lap (qr.html).
# A sablon az Építőmérnök bemutató AR Laborjából való (MBalika/geotechnika-bemutato, _src/ar-labor), az Alapozás tárgyhoz igazítva:
# a csoportok itt az előadások (állomások), mindegyik a saját tananyagára mutat.
# Futtatás: python3 _src/ar-labor/build.py
import json, pathlib, copy, shutil
here = pathlib.Path(__file__).resolve().parent
root = here.parent.parent
tpl = (here / 'page.tpl.html').read_text(encoding='utf-8')
guard = (here / 'guard.js').read_text(encoding='utf-8')
SITE = 'https://bme-alapozas.vercel.app'

# az állomások színe (a nyitóoldal színei, sötét háttérhez világosítva)
SPEC_C = {'3': '#ff6a4d', '5': '#e866c8', '7': '#938fff', '8': '#4f9dff', '9': '#2cc7d6', 'all': '#ffb23e'}
SPEC_U = {'3': 'https://sikalapoktervezese.vercel.app', '5': 'https://sikalapok-sullyedesszamitasa.vercel.app', '7': 'https://sikalapokaterohatasok.vercel.app',
          '8': 'https://melyalapozasok.vercel.app', '9': 'https://munkaterhatarolasok.vercel.app', 'all': SITE + '/telek'}

HU = {
  'lang': 'hu',
  'S': {
    'title': 'Alapozás AR labor – mozgó 3D-modellek az előadásokhoz | BME',
    'desc': 'Forgasd, nagyítsd, és nézd meg a telefonodon térben: talajtörés, feszültséghagyma, a pisai torony, cölöpök, munkagödrök – mozgó 3D-modellek az Alapozás tárgy előadásaihoz.',
    'home': '/', 'brand': 'AR labor', 'brand2': 'Alapozás',
    'nav_models': 'Modellek', 'nav_specs': 'Előadások', 'nav_back': 'Alapozás nyitóoldal', 'nav_aula': 'Vetítő mód',
    'prev': 'Előző modell', 'next': 'Következő modell', 'hint': 'Forgasd · nagyíts · próbáld ki a gombot',
    'ar': 'Nézd meg térben', 'close': 'Bezárás', 'ars_t': 'Nézd meg térben', 'xr_exit': 'Kilépés', 'xr_move': 'Áthelyezés', 'xr_reset': 'Eredeti méret', 'xr_lbl': 'Feliratok', 'pause': 'Szünet', 'labels': 'Feliratok', 'rotate': 'Körbeforgatás', 'fullscreen': 'Teljes képernyő',
    'abrand': '<b>BME Alapozás</b> · AR labor', 'aqr_t': 'Nézd meg térben!', 'aqr_s': 'Olvasd be a telefonoddal: a modell megjelenik előtted az asztalon vagy a padlón.',
    'aula_exit': 'Kilépés a vetítő módból',
    'models_h': 'Válassz <em>modellt!</em>',
    'qr_t': 'Nézd meg térben', 'qr_s': 'Olvasd be a telefonoddal: a modell megjelenik előtted az asztalon vagy a padlón, és körbejárhatod.',
    'specs_h': 'Melyik <em>előadáshoz?</em>',
    'foot': 'BME Geotechnika és Mérnökgeológia Tanszék · Alapozás · AR labor. A modellek oktatási célú, egyszerűsített makettek.',
    'foot_link': 'Vissza az Alapozás nyitóoldalára',
    'langsw': '<span class="lang"><span>HU</span><a href="/ar-labor/en" id="langLink" hreflang="en">EN</a></span>',
  },
  'T': {
    'all': 'Mind', 'soon': 'Hamarosan', 'learn': 'a modellhez tartozó tananyag', 'open': 'A tananyag megnyitása', 'play': 'Lejátszás', 'pause': 'Szünet',
    'manual': 'Te irányítasz · {s} mp múlva továbblépek', 'fsHint': 'F: teljes képernyő · ←/→: léptetés',
    'arGo': 'Indítás', 'arCopy': 'Link másolása', 'arCopied': 'Kimásolva – illeszd be a böngészőbe',
    'arNo': 'Ebben a böngészőben nem indul a térbeli nézet. Nyisd meg az oldalt Chrome-ban (Android) vagy Safariban (iPhone): a menüben válaszd a „Megnyitás böngészőben” pontot, vagy másold ki a linket.',
    'arSteps': {'xr': ['Nézz a padlóra vagy egy asztalra, és mozgasd lassan a telefont.', 'Megjelenik egy világító keret: ekkora lesz a modell, és oda kerül. Koppints, ha jó a hely.', 'Két ujjal nagyíthatod és forgathatod, el is távolodhatsz tőle, és körbejárhatod.'],
                'ql': ['Nézz a padlóra vagy egy asztalra, és mozgasd lassan a telefont.', 'A modell leül az első felismert felületre, egy ujjal odébb húzhatod.', 'Két ujjal nagyíthatod és forgathatod, el is távolodhatsz tőle, és körbejárhatod.']},
    'xr': {'scan': 'Mozgasd lassan a telefont, és nézz a padlóra vagy egy asztalra', 'aim': 'Koppints: ide kerül a modell', 'placed': 'Két ujjal nagyíts és forgass · járd körbe!', 'loading': 'Betöltés…', 'loadErr': 'A modell nem töltődött be', 'dec': ','},
  },
  'BSC': {'ut': {'n': 'A tárgy útja', 'd': 'öt előadás és az esettanulmány'}},
  'SPECS': {
    '3': {'k': '3. előadás', 'n': 'Síkalapok tervezése', 'short': '3 · Síkalapok', 'b': 'ut', 'd': 'Milyen alap kell, és milyen mélyre? Alaptípusok, az alapsík felvétele és a talajtörés mechanizmusa – majd a teherbírás számítása.'},
    '5': {'k': '5. előadás', 'n': 'Síkalapok süllyedés­számítása', 'short': '5 · Süllyedés', 'b': 'ut', 'd': 'Mennyit és mennyire egyenlőtlenül süllyed? Feszültségeloszlás az alap alatt, határmélység és rétegenkénti összenyomódás.'},
    '7': {'k': '7. előadás', 'n': 'Síkalapokat érő hatások', 'short': '7 · Külső hatások', 'b': 'ut', 'd': 'Mi éri még az alapot? Rezgés, földrengés, üreg, víz és fagy: ezeket nem kiszámítani, hanem felismerni és megelőzni kell.'},
    '8': {'k': '8. előadás', 'n': 'Mélyalapozások', 'short': '8 · Mélyalapozás', 'b': 'ut', 'd': 'Mikor nem elég a síkalap? Cölöpök, résfalak, kút- és szekrényalapok: a teher mélyebbre, a teherbíró rétegbe kerül.'},
    '9': {'k': '9. előadás', 'n': 'Munkatér­határolások', 'short': '9 · Munkatér', 'b': 'ut', 'd': 'Hogyan jutunk le biztonságosan? Dúcolás, szádfal, résfal, talajhorgony: a gödör falát meg kell tartani, a vizet ki kell zárni.'},
    'all': {'k': 'Esettanulmány', 'n': 'Egy telek, egy félév', 'short': 'Egy telek', 'b': 'ut', 'd': 'Az egész félév egyetlen telken: a talajfelderítéstől az alapok megválasztásán át a munkagödörig, két házzal.'},
  },
  'M': [
    {'id': 'tores', 'f': 'talajtores', 'en': True, 'sec': True, 'sp': '3', 'anim': True, 'labelT': 9.5, 'orbit': '24deg 70deg 118%', 'kind': 'restart',
     'name': 'Talajtörés a sávalap alatt', 'act': 'Terheld meg!', 'hook': 'Nő a teher – és egyszer csak megindul a talaj.',
     'facts': [['30°', 'φ′ a homokban'], ['2,0 m', 'alapszélesség'], ['≈ 10 m', 'a csúszólap kifutása']],
     'info': 'A falra egyre nagyobb teher jut. Amikor a talaj nyírószilárdsága kimerül, kirajzolódik a csúszólap: az alap az aktív ékkel együtt lesüllyed és megdől, a radiális nyírási zóna a logaritmikus spirál mentén elfordul, a passzív zóna a csúszólapon felfelé-kifelé tolódik, a felszín pedig felpúposodik. Általános nyírási törés homokban; a mozgások torzítva látszanak.'},
    {'id': 'hagyma', 'f': 'feszultseghagyma', 'en': True, 'sec': True, 'sp': '5', 'anim': True, 'labelT': 11, 'orbit': '45deg 66deg 170%', 'kind': 'restart',
     'name': 'Feszültséghagyma', 'act': 'Tedd rá a terhet!', 'hook': 'A teher nem áll meg az alap alatt: szétterjed és elhal.',
     'facts': [['1,8 m', 'a 40 %-os héj alja'], ['2,8 m', 'a 20 %-os héj alja'], ['4,2 m', 'a 10 %-os héj alja']],
     'info': 'A pillérre teher kerül, és az alap alatt megjelenik a többletfeszültség: a színes héjak a talpfeszültség 80, 60, 40, 20 és 10 %-ánál húzódnak, belülről kifelé. A nyitott negyedben a héjak lépcsősen visszavágva látszanak, így mindegyik megfigyelhető. Boussinesq szerint készültek, a 2 × 2 m-es alappal azonos területű, egyenletesen terhelt kör alatt.'},
    {'id': 'pisa', 'f': 'pisa-makett', 'en': True, 'sec': True, 'sp': '5', 'anim': True, 'labelT': 15.5, 'orbit': '22deg 78deg 122%', 'kind': 'restart',
     'name': 'A pisai ferde torony', 'act': 'Építsd fel!', 'hook': 'Kétszáz évig épült – és közben végig dőlt.',
     'facts': [['3,97°', 'dőlés ma'], ['5,5°', 'dőlés 1990-ben'], ['14 500 t', 'a torony tömege']],
     'info': 'A torony 1173 és 1372 között, három szakaszban épült fel, és már a harmadik szintnél megdőlt. A talaj felül kb. 3 m feltöltés, alatta homokos iszap és homok, amely dél felé elvékonyodik; ez alatt puha agyag van, amely a déli oldalon vastagabb – ott nagyobb a süllyedés, arra dől a torony. 1990-re a dőlés elérte az 5,5°-ot; az északi oldal alóli óvatos talajkiemeléssel kb. 3,97°-ra csökkentették. A piros pálca az eredeti függőlegest mutatja.',
     'link': ['Geotechnikai helyszínelők', 'a pisai ügy nyomozása', SITE + '/helyszinelok']},
    {'id': 'renges', 'f': 'foldrenges-razoasztal', 'sp': '7', 'anim': True, 'labelT': 4.3, 'orbit': '24deg 68deg 80%', 'kind': 'restart',
     'name': 'Földrengés a laborban', 'act': 'Rázd meg!', 'hook': 'Két egyforma épületmodell egy rázóasztalon – az egyik gumisarukon áll.',
     'facts': [['2', 'azonos épületmodell'], ['5', 'szint'], ['gumisaru', 'szeizmikus szigetelés']],
     'info': 'A szerkezetvizsgáló laborban hidraulikus munkahenger rázza az asztalt úgy, ahogy a talaj mozog földrengéskor. A mereven lekötött modell szintjei egyre nagyobbat lengenek, a szinteltolódás a szerkezetet terheli. A gumisarukra állított, szeizmikusan szigetelt modell alatt az asztal szinte „kicsúszik”: maga az épület alig mozdul. A mozgást gyorsulásmérők és kamerák rögzítik. A rengés a talajból, az alapon át jut az épületbe: ezért számít, mire és hogyan alapozunk. (A csarnok általános szemléltető labor, a mozgás felnagyított.)'},
    {'id': 'mobilgat', 'sec': True, 'sp': '7', 'anim': True, 'labelT': 12.5, 'orbit': '26deg 70deg 78%', 'kind': 'restart',
     'name': 'Szentendrei mobilgát', 'act': 'Jöjjön az árvíz!', 'hook': 'Árvízkor alumíniumfal nő a Duna korzón – az ország első mobilgátja.',
     'facts': [['333 m', 'hosszú'], ['2013', 'az első árvíz, amelyet megtartott'], ['1,35 m', 'a mértékadó árvízszint fölött']],
     'info': 'Szentendre óvárosát a Duna korzón nem takarja magas gát: árvíz előtt a munkások alumínium oszlopokat állítanak a kész alaptestre, és soronként beemelik a betétgerendákat. A fal a víz nyomását az alapozásnak adja át, a talajban pedig vízzáró fal akadályozza meg, hogy a víz a fal alatt átszivárogjon. A víz az alapok egyik legveszélyesebb ellenfele: ha utat talál az alap alatt, kimossa a talajt. A modellen a házsor, a tornyok és az alapozás elvi ábrázolás.'},
    {'id': 'cfa', 'f': 'cfa-makett', 'sec': True, 'sp': '8', 'anim': True, 'orbit': '28deg 74deg 114%', 'kind': 'labels',
     'name': 'CFA-cölöp fúrás közben', 'act': 'Mutasd, mi micsoda!', 'hook': 'A spirál egy menetben fúr le – a talaj tartja a furatot.',
     'facts': [['80 cm', 'cölöpátmérő'], ['10 m', 'fúrásmélység'], ['20 m', 'spirálhossz']],
     'info': 'A CFA-cölöp folyamatos spirálfúróval készül. A spirál 10 m mélyen jár, a menetei tele vannak talajjal: ez a talaj támasztja meg a furat falát, ezért nem kell béléscső vagy zagy. A betont tömlő hozza a forgatófejig, onnan a spirál üreges szárán jut le a talpig, és a spirál visszahúzásával kitölti a furatot; a vasalást utána engedik bele a friss betonba. A gépet a fülkében ülő gépkezelő irányítja.',
     'link': ['A teljes CFA-animáció', 'a cölöp készítése lépésről lépésre', 'https://cfa-colop-3d.vercel.app']},
    {'id': 'mol-campus', 'sec': True, 'sp': '8', 'anim': True, 'labelT': 29, 'orbit': '28deg 76deg 92%', 'kind': 'restart',
     'name': 'MOL Campus', 'act': 'Építsd fel!', 'hook': '143 méter a Duna-parton – és a titka a föld alatt van.',
     'facts': [['143 m', 'magas a csúccsal'], ['135', 'cölöp a torony alatt'], ['16 m', 'mély munkagödör']],
     'info': 'Budapest legmagasabb épülete feltöltésen és dunai homokos kavicson áll, a talajvíz 8 m mélyen van. Előbb körbe a 21 m mély résfal készül el: ez tartja meg a földet, és kizárja a vizet. Utána jöhet a földkiemelés a négyszintes mélygarázshoz, majd a 2,2 m vastag alaplemez, amelyet 135 cölöp segít a kemény kiscelli agyagig. Csak ezután nőhet a torony. Résfal, munkagödör, cölöpökkel gyámolított lemezalap: a 8. és a 9. előadás egyetlen épület alatt.'},
    {'id': 'godor', 'f': 'munkagodor', 'en': True, 'sec': True, 'sp': '9', 'anim': True, 'labelT': 16, 'orbit': '16deg 74deg 112%', 'kind': 'restart',
     'name': 'Horgonyzott résfalas munkagödör', 'act': 'Emeld ki a gödröt!', 'hook': 'Lefelé csak lépésenként: kiemelés, horgony, kiemelés.',
     'facts': [['9 m', 'gödörmélység'], ['15 m', 'résfal'], ['2 sor', 'talajhorgony']],
     'info': 'A 15 m mély résfal a vízzáró agyagba köt be, így a víztelenítés nem szívja le a környék talajvizét. A 9 m mély gödröt három lépcsőben emelik ki: az első kiemelés után beépül az első horgonysor a hevederrel, a második után a második sor, végül elkészül az alaplemez. A két horgonysor párhuzamos, egymástól 3,3 m-re fut; a felső sor a homokban, az alsó a homokos kavicsban van befogva.'},
    {'id': 'metro', 'f': 'metro-pajzs', 'sec': True, 'sp': '9', 'anim': True, 'labelT': 8, 'orbit': '22deg 66deg 80%', 'kind': 'restart',
     'name': 'M4-metró a Duna alatt – Szent Gellért tér', 'act': 'Indítsd a szerelvényt!', 'hook': '31 méterrel a felszín alatt, közvetlenül a Duna mellett: a vonal legmélyebb állomása.',
     'facts': [['31 m', 'mélyen a felszín alatt'], ['87 m', 'hosszú az állomás'], ['80 m', 'hosszú a peron']],
     'info': 'A modell a mai Szent Gellért teret mutatja a metróalagút tengelyében elmetszve: fent a Gellért Szálló, a Szabadság híd és a Műegyetem CH épülete, lent a Szent Gellért tér – Műegyetem állomás. A rakpart alatt felülről, résfalak között épült dobozszerkezet áll, amelyet többszintű vasbeton gerendarács merevít; a peronalagút bányászati módszerrel készült a CH épület alatt; a Duna alatt pajzzsal fúrt, tübbinggyűrűkkel bélelt alagút vezet Pestre. Résfalas doboz, bányászati módszer és pajzs: három építési mód egyetlen állomás körül.'},
    {'id': 'telek', 'f': 'egy-telek', 'en': True, 'sec': True, 'sp': 'all', 'anim': True, 'labelT': 18.5, 'orbit': '14deg 73deg 112%', 'kind': 'restart',
     'name': 'Egy telek, egy félév', 'act': 'Építsd fel!', 'hook': 'Az egész félév egyetlen telken.',
     'facts': [['2', 'ház'], ['9', 'állomás'], ['−3,0 m', 'talajvíz']],
     'info': 'Az „Egy telek, egy félév” esettanulmány telke felépül. Az A ház pilléralapokon áll a homokban; a B ház alatt puha agyag van, ezért résfalas, horgonyzott munkagödörben, CFA-cölöpökön épül, amelyek a homokos kavicsig érnek. A tömb elöl el van metszve, így az alapok, a pince és a cölöpök is látszanak.'},
  ],
}
for k, v in HU['SPECS'].items(): v['url'] = SPEC_U[k]

EN_S = {
    'title': 'Foundation Engineering AR lab – moving 3D models for the lectures | BME',
    'desc': 'Rotate, zoom and view them in AR on your phone: bearing failure, the pressure bulb, the Leaning Tower of Pisa, piles and excavations – moving 3D models for the lectures of the Foundation Engineering course.',
    'home': '/en', 'brand': 'AR lab', 'brand2': 'Foundation Engineering',
    'nav_models': 'Models', 'nav_specs': 'Lectures', 'nav_back': 'Course home', 'nav_aula': 'Projector mode',
    'prev': 'Previous model', 'next': 'Next model', 'hint': 'Rotate · zoom · try the button',
    'ar': 'See it in AR', 'close': 'Close', 'ars_t': 'See it in AR', 'xr_exit': 'Exit', 'xr_move': 'Move', 'xr_reset': 'Original size', 'xr_lbl': 'Labels', 'pause': 'Pause', 'labels': 'Labels', 'rotate': 'Auto-rotate', 'fullscreen': 'Full screen',
    'abrand': '<b>BME Foundation Engineering</b> · AR lab', 'aqr_t': 'See it in AR!', 'aqr_s': 'Scan it with your phone: the model appears in front of you on the table or the floor.',
    'aula_exit': 'Exit projector mode',
    'models_h': 'Pick a <em>model!</em>',
    'qr_t': 'See it in AR', 'qr_s': 'Scan it with your phone: the model appears in front of you on the table or the floor, and you can walk around it.',
    'specs_h': 'Which <em>lecture?</em>',
    'foot': 'BME Department of Engineering Geology and Geotechnics · Foundation Engineering · AR lab. The models are simplified, for teaching purposes.',
    'foot_link': 'Back to the course home page',
    'langsw': '<span class="lang"><a href="/ar-labor" id="langLink" hreflang="hu">HU</a><span>EN</span></span>',
}
EN_T = {'all': 'All', 'soon': 'Coming soon', 'learn': 'the course material for this model', 'open': 'Open the course material', 'play': 'Play', 'pause': 'Pause',
    'manual': 'You’re in control · moving on in {s} s', 'fsHint': 'F: full screen · ←/→: browse',
    'arGo': 'Start', 'arCopy': 'Copy link', 'arCopied': 'Copied – paste it into your browser',
    'arNo': 'This browser can’t start the AR view. Open the page in Chrome (Android) or Safari (iPhone): choose “Open in browser” in the menu, or copy the link.',
    'arSteps': {'xr': ['Point the phone at the floor or a table and move it slowly.', 'A glowing frame appears: that is where the model goes and how big it will be. Tap when the spot is right.', 'Pinch to zoom and twist to rotate, step back from it and walk around it.'],
                'ql': ['Point the phone at the floor or a table and move it slowly.', 'The model sits down on the first surface found; drag it with one finger to move it.', 'Pinch to zoom and twist to rotate, step back from it and walk around it.']},
    'xr': {'scan': 'Move the phone slowly and look at the floor or a table', 'aim': 'Tap: the model goes here', 'placed': 'Pinch to zoom, twist to rotate · walk around it!', 'loading': 'Loading…', 'loadErr': 'The model could not be loaded', 'dec': '.'}}
EN_BSC = {'ut': {'n': 'The route of the course', 'd': 'five lectures and the case study'}}
EN_SPECS = {
    '3': {'k': 'Lecture 3', 'n': 'Design of shallow foundations', 'short': '3 · Shallow foundations', 'b': 'ut', 'd': 'What kind of foundation, and how deep? Foundation types, choosing the founding level and the mechanism of bearing failure – then the bearing resistance calculation.'},
    '5': {'k': 'Lecture 5', 'n': 'Settlement of shallow foundations', 'short': '5 · Settlement', 'b': 'ut', 'd': 'How much does it settle, and how unevenly? Stress distribution beneath the footing, the depth of influence and the compression of each layer.'},
    '7': {'k': 'Lecture 7', 'n': 'External effects on shallow foundations', 'short': '7 · External effects', 'b': 'ut', 'd': 'What else acts on a foundation? Vibration, earthquakes, cavities, water and frost: these have to be recognised and prevented rather than calculated.'},
    '8': {'k': 'Lecture 8', 'n': 'Deep foundations', 'short': '8 · Deep foundations', 'b': 'ut', 'd': 'When is a shallow foundation not enough? Piles, diaphragm walls, wells and caissons carry the load deeper, down to the bearing stratum.'},
    '9': {'k': 'Lecture 9', 'n': 'Excavation support', 'short': '9 · Excavations', 'b': 'ut', 'd': 'How do we get down safely? Bracing, sheet piles, diaphragm walls and ground anchors: the sides of the pit must be held and the water kept out.'},
    'all': {'k': 'Case study', 'n': 'One site, one semester', 'short': 'One site', 'b': 'ut', 'd': 'The whole semester on a single site: from ground investigation through the choice of foundations to the excavation, with two buildings.'},
}
EN_U = {k: (v + '/en') for k, v in SPEC_U.items()}
# name, act, hook, facts, info, link (label, sub)
EN_M = {
  'tores': ('Bearing failure beneath a strip footing', 'Load it!', 'The load grows – and suddenly the ground gives way.',
    [['30°', 'φ′ of the sand'], ['2.0 m', 'footing width'], ['≈ 10 m', 'reach of the slip surface']],
    'More and more load comes onto the wall. When the shear strength of the soil is exhausted, the slip surface appears: the footing sinks and tilts together with the active wedge, the radial shear zone rotates along the logarithmic spiral, the passive zone is pushed up and outwards along the slip surface, and the ground surface heaves. General shear failure in sand; the movements are exaggerated.', None),
  'hagyma': ('Pressure bulb', 'Put the load on!', 'The load does not stop beneath the footing: it spreads and fades.',
    [['1.8 m', 'base of the 40% shell'], ['2.8 m', 'base of the 20% shell'], ['4.2 m', 'base of the 10% shell']],
    'Load comes onto the column, and the stress increase appears beneath the footing: the coloured shells mark 80, 60, 40, 20 and 10% of the contact pressure, from the inside outwards. In the open quarter the shells are cut back in steps, so each of them can be seen. They follow Boussinesq’s solution for a uniformly loaded circle with the same area as the 2 × 2 m footing.', None),
  'pisa': ('The Leaning Tower of Pisa', 'Build it!', 'It took two hundred years to build – and it leaned all the way.',
    [['3.97°', 'tilt today'], ['5.5°', 'tilt in 1990'], ['14,500 t', 'mass of the tower']],
    'The tower was built in three stages between 1173 and 1372, and it began to lean as early as the third storey. The ground consists of about 3 m of made ground, then sandy silt and sand that thins out towards the south; beneath it lies soft clay, which is thicker on the south side – the settlement is larger there, and that is the way the tower leans. By 1990 the tilt had reached 5.5°; careful soil extraction from beneath the north side reduced it to about 3.97°. The red rod shows the original vertical.',
    ['Geotechnical CSI', 'investigate the Pisa case']),
  'renges': ('An earthquake in the lab', 'Shake it!', 'Two identical building models on one shake table – one of them stands on rubber bearings.',
    [['2', 'identical building models'], ['5', 'storeys'], ['rubber bearings', 'base isolation']],
    'In the structures laboratory a hydraulic actuator shakes the table the way the ground moves in an earthquake. The storeys of the rigidly fixed model sway more and more, and the storey drift strains the structure. Under the base-isolated model on rubber bearings the table almost slides away: the building itself hardly moves. Accelerometers and cameras record the motion. The shaking reaches the building from the ground, through its foundation: that is why it matters what we found on, and how. (The hall is a generic illustrative lab and the motion is exaggerated.)', None),
  'mobilgat': ('Szentendre demountable flood wall', 'Bring on the flood!', 'When the Danube rises, an aluminium wall grows on the promenade – Hungary’s first demountable flood wall.',
    [['333 m', 'long'], ['2013', 'the first flood it held back'], ['1.35 m', 'above the design flood level']],
    'No high embankment hides the old town of Szentendre from the Danube: before a flood, workers stand aluminium posts on the permanent foundation and lift the stop logs in row by row. The wall passes the water pressure to its foundation, and a cut-off wall in the ground stops water from seeping underneath. Water is one of the most dangerous enemies of a foundation: if it finds a way beneath, it washes the soil out. The houses, the towers and the foundation in the model are schematic.', None),
  'cfa': ('CFA pile during drilling', 'Show me what’s what!', 'The auger drills down in a single pass – the soil supports the borehole.',
    [['80 cm', 'pile diameter'], ['10 m', 'drilling depth'], ['20 m', 'auger length']],
    'A CFA pile is made with a continuous flight auger. The auger is 10 m deep, and its flights are full of soil: this soil supports the borehole wall, which is why no casing or slurry is needed. The concrete is brought by a hose to the rotary head, and from there it runs down the hollow stem of the auger to the base, filling the borehole as the auger is withdrawn; the reinforcement cage is then pushed into the fresh concrete. The rig is controlled by the operator sitting in the cab.',
    ['The full CFA animation', 'making the pile, step by step']),
  'mol-campus': ('MOL Campus', 'Build it!', '143 metres on the Danube bank – and its secret lies underground.',
    [['143 m', 'tall including the spire'], ['135', 'piles under the tower'], ['16 m', 'deep excavation']],
    'Budapest’s tallest building stands on made ground and Danube sandy gravel, with groundwater 8 m below the surface. First the 21 m deep diaphragm wall goes in all around: it retains the soil and keeps the water out. Then comes the excavation for the four-level basement, followed by the 2.2 m thick raft, supported by 135 piles reaching down to the stiff Kiscell clay. Only then can the tower rise. A diaphragm wall, a deep excavation and a piled raft: Lectures 8 and 9 beneath a single building.', None),
  'godor': ('Anchored diaphragm-wall excavation', 'Dig the pit!', 'Down only step by step: dig, anchor, dig.',
    [['9 m', 'excavation depth'], ['15 m', 'diaphragm wall'], ['2 rows', 'of ground anchors']],
    'The 15 m deep diaphragm wall is keyed into the low-permeability clay, so dewatering does not draw down the groundwater of the surroundings. The 9 m deep pit is excavated in three stages: after the first stage the first row of anchors is installed with its waler, after the second stage the second row, and finally the base slab is cast. The two anchor rows are parallel, 3.3 m apart; the upper row is fixed in the sand, the lower one in the sandy gravel.', None),
  'metro': ('Metro line M4 under the Danube – Szent Gellért tér', 'Start the train!', '31 metres below the surface, right beside the Danube: the deepest station of the line.',
    [['31 m', 'below the surface'], ['87 m', 'station length'], ['80 m', 'platform length']],
    'The model shows today’s Szent Gellért Square, cut along the axis of the metro tunnel: above, Hotel Gellért, Liberty Bridge and the “CH” building of the university; below, Szent Gellért tér – Műegyetem station. Under the embankment stands a box built top-down between diaphragm walls and braced by a multi-level concrete beam grid; the platform tunnel was mined beneath the CH building; and a shield-driven tunnel lined with segmental rings leads under the Danube to Pest. A diaphragm-wall box, a mined tunnel and a shield drive: three construction methods around a single station.', None),
  'telek': ('One site, one semester', 'Build it!', 'The whole semester on a single site.',
    [['2', 'buildings'], ['9', 'stations'], ['−3.0 m', 'groundwater']],
    'The site of the “One site, one semester” case study is built up. Building A stands on pad footings in the sand; beneath Building B there is soft clay, so it is built in an anchored diaphragm-wall excavation, on CFA piles that reach down to the sandy gravel. The block is cut open at the front, so the footings, the basement and the piles can all be seen.', None),
}
EN = {'lang': 'en', 'S': EN_S, 'T': EN_T, 'BSC': EN_BSC, 'SPECS': EN_SPECS, 'M': []}
for k, v in EN_SPECS.items(): v['url'] = EN_U[k]
for m in HU['M']:
    e = copy.deepcopy(m); n, a, h, f, i, l = EN_M[m['id']]; e.update({'name': n, 'act': a, 'hook': h, 'facts': f, 'info': i})
    if 'link' in m:
        e['link'] = [l[0], l[1], m['link'][2] + '/en']   # a hivatkozott oldalaknak van angol változata (/en)
    EN['M'].append(e)

HYPH = '<script src="../vendor/hyphenopoly/Hyphenopoly_Loader.js"></script>\n<script>Hyphenopoly.config({ require: { "hu": "FORCEHYPHENOPOLY" }, setup: { hide: "none", selectors: { ".hyphenate": { minWordLength: 6, compound: "auto" } } } });</script>'

def page(L, out):
    for k, v in L['SPECS'].items(): v['c'] = SPEC_C[k]
    data = {'lang': L['lang'], 'SPECS': L['SPECS'], 'BSC': L['BSC'], 'M': L['M'], 'T': L['T']}
    s = tpl.replace('{{lang}}', L['lang']).replace('{{hyph}}', HYPH if L['lang'] == 'hu' else '')
    for k, v in L['S'].items(): s = s.replace('{{' + k + '}}', v)
    assert '{{' not in s, s[s.index('{{'):s.index('{{') + 40]
    assert '/*DATA*/null' in s and '/*GUARD*/' in s
    s = s.replace('/*DATA*/null', json.dumps(data, ensure_ascii=False)).replace('/*GUARD*/', guard.strip())
    (root / 'ar-labor' / out).write_text(s, encoding='utf-8'); print(out, len(s))

shutil.copy(here / 'xr.js', root / 'ar-labor' / 'xr.js')
page(HU, 'index.html')
page(EN, 'en.html')

# nyomtatható QR-lap (A4): címlap az oldal kódjával, utána modellenként egy kártya (?m=…&ar=1: a telefonon rögtön az AR-indító nyílik meg)
qd = {'site': SITE, 'M': [{'id': m['id'], 'name': m['name'], 'hook': m['hook'], 'img': m.get('img') or m.get('f') or m['id'], 'sp': HU['SPECS'][m['sp']]['short'], 'c': SPEC_C[m['sp']]} for m in HU['M']]}
q = (here / 'qr.tpl.html').read_text(encoding='utf-8'); assert '/*DATA*/null' in q
(root / 'ar-labor' / 'qr.html').write_text(q.replace('/*DATA*/null', json.dumps(qd, ensure_ascii=False)), encoding='utf-8'); print('qr.html', len(qd['M']), 'modell')
