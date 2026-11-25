#!/usr/bin/env python3
# „Áll vagy dől?” – alapozós játék: allvagydol/index.html (magyar) és allvagydol/en.html (angol) egy forrásból.
# sablon: page.tpl.html · számítás: core.js (Node-ban is fut: node test.cjs) · játék: game.js · formázás-őr: ../ar-labor/guard.js
# Minden szöveg itt van, mindkét nyelven; a „~” nem törő szóköz. Futtatás: python3 _src/allvagydol/build.py
import json, pathlib, re
here = pathlib.Path(__file__).resolve().parent
root = here.parent.parent
tpl = (here / 'page.tpl.html').read_text(encoding='utf-8')
core = (here / 'core.js').read_text(encoding='utf-8')
game = (here / 'game.js').read_text(encoding='utf-8')
guard = (here.parent / 'ar-labor' / 'guard.js').read_text(encoding='utf-8')
SITE = 'https://bme-alapozas.vercel.app'
A = lambda host, en: 'https://' + host + ('/en' if en else '')

def texts(en):
    H = not en
    apps = {
        'terv': ['Design of shallow foundations' if en else 'Síkalapok tervezése', A('sikalapoktervezese.vercel.app', en)],
        'teher': ['Bearing resistance of shallow foundations' if en else 'Síkalapok teherbírásszámítása', A('sikalapok-teherbirasszamitasa.vercel.app', en)],
        'kedv': ['Foundations on problematic ground' if en else 'Alapozás kedvezőtlen altalajon', A('kedvezotlen-altalaj.vercel.app', en)],
        'sully': ['Settlement of shallow foundations' if en else 'Síkalapok süllyedésszámítása', A('sikalapok-sullyedesszamitasa.vercel.app', en)],
        'mely': ['Deep foundations' if en else 'Mélyalapozások', A('melyalapozasok.vercel.app', en)],
        'hely': ['Geotechnical CSI' if en else 'Geotechnikai helyszínelők', A('bme-alapozas.vercel.app/helyszinelok', en)],
    }
    if H:
        T = {
            'dec': ',', 'mft': 'M~Ft', 'bshort': 'F',
            'soil': {'fill': 'laza feltöltés', 'sandL': 'laza homok', 'sandM': 'közepesen tömör homok', 'sandD': 'tömör homok', 'grav': 'homokos kavics', 'clayS': 'puha agyag', 'clayM': 'gyúrható agyag', 'clayH': 'kemény agyag', 'peat': 'tőzeg'},
            'soils_none': 'Amit a fúrások megmutatnak, az itt jelenik meg.',
            'lv': {
                'homok': {'name': 'Családi ház a homokon', 'bld': 'kétszintes családi ház', 'bld_s': '2~szint', 'app': apps['terv'],
                          'brief': 'Kétszintes családi ház, a környéken mindenütt homok van. Könnyű eset – a kérdés csak az, mennyit költesz rá.',
                          'lesson': 'Jó talajon elég a fagyhatár alá vitt, keskeny sávalap. Ami ennél több, az kidobott pénz; ami kevesebb – 0,8~m-nél sekélyebb alapsík –, azt télen megemeli a fagy.'},
                'viz': {'name': 'Raktár a tóparton', 'bld': 'egyszintes raktár', 'bld_s': '1~szint', 'app': apps['teher'],
                        'brief': 'Egyszintes, nehéz raktár a tó mellett. A víz közel van – a felszín alatt is.',
                        'lesson': 'A talajvíz alatt a talaj hatékony térfogatsúlya nagyjából a felére csökken, vele a teherbírás is: szélesebb alap kell. A víz alá ásni viszont víztelenítést jelent – az alapsík maradjon a talajvíz fölött, ha lehet.'},
                'feltoltes': {'name': 'Társasház a feltöltésen', 'bld': 'háromszintes társasház', 'bld_s': '3~szint', 'app': apps['kedv'],
                              'brief': 'Háromszintes társasház egy régi, betemetett gödör szélén. Hogy a feltöltés hol milyen vastag, azt senki sem tudja.',
                              'lesson': 'Laza feltöltésre nem alapozunk: az alapsíkot mindkét fal alatt a teherbíró rétegbe kell levinni. A feltöltés a telek két szélén nem egyforma vastag – egyetlen fúrásból ez nem derül ki.'},
                'lencse': {'name': 'Irodaház a rejtett lencse fölött', 'bld': 'négyszintes irodaház', 'bld_s': '4~szint', 'app': apps['sully'],
                           'brief': 'Négyszintes irodaház tömör homokon. A szomszéd szerint a telek egyik sarkában valaha láp volt.',
                           'lesson': 'A tömör homokban tőzeglencse ült, épp a jobb oldali fal alatt. Két fúrás között a talaj nem feltétlenül az, aminek a két fúrás mutatja: a feltárást az épület alá és elég sűrűn kell tenni. A megoldás a lencsén átvitt cölöp.'},
                'agyag': {'name': 'Nyolcszintes a puha agyagon', 'bld': 'nyolcszintes lakóház', 'bld_s': '8~szint', 'app': apps['mely'],
                          'brief': 'Nyolcszintes lakóház. A felszín közelében mindenütt puha agyag van – a kérdés az, mi van alatta.',
                          'lesson': 'Vastag, puha agyagon a sávalap alatt talajtörés lesz, a lemezalap pedig több deciméterrel megsüllyed. A terhet cölöpökkel a mélyebben fekvő kavicsba kell levinni – ehhez viszont olyan mély fúrás kell, amely eléri a teherbíró réteget.'},
                'pisa': {'name': 'Harangtorony – kis Pisa', 'bld': 'hatszintes harangtorony', 'bld_s': '6~szint', 'app': apps['hely'],
                         'brief': 'Hatszintes, karcsú harangtorony. A környék régi tornyai közül több is ferde…',
                         'lesson': 'A puha agyagréteg egyenlőtlen vastagságú: a torony egyik oldala alatt jóval vastagabb, ezért az az oldal jobban süllyed, és a torony megdől – ez történt Pisában is. Ide olyan cölöp kell, amely mindkét oldalon eléri az agyag alatti tömör homokot.'},
            },
            'k_bld': 'épület', 'k_load': 'teher falanként', 'k_budget': 'keret',
            'bor_btn': '{d}~m mély fúrás', 'bor_hint': 'Koppints a telekre a rajzon: oda kerül a fúrás. A kész fúrásra koppintva megnézheted a rétegsorát.',
            'to_found': 'Tovább az alapozáshoz', 'to_found_blind': 'Tovább fúrás nélkül', 'spent': 'eddig', 'budget': 'keret',
            'gw': 'talajvíz', 'gw_none': 'a fúrás nem ért talajvizet', 'log_end': 'A fúrás {d}~m mélyen állt meg; az alján: {s}.',
            'found_h': 'Milyen alap legyen?', 'ft': {'strip': 'Sávalap', 'raft': 'Lemezalap', 'pile': 'Cölöpalap'}, 'ft_s': {'strip': 'a két fal alatt', 'raft': 'az egész ház alatt', 'pile': 'Ø~80~cm'},
            'sl_B': 'Alapszélesség, B', 'sl_D': 'Alapsík mélysége, D', 'sl_L': 'Cölöphossz, L', 'sl_a': 'Cölöptávolság, a',
            'est_h': 'Becslés a fúrásaid alapján', 'back_bor': 'Még fúrok', 'build': 'Építsd meg!', 'build_over': 'Nem fér a keretbe',
            'building_h': 'Épül…', 'building_p': 'Most a valódi talaj dönt – nem az, amit a fúrásokból gondoltál róla.',
            'r_bear': 'Teherbírás', 'r_set': 'Süllyedés', 'r_rot': 'Dőlés', 'r_frost': 'Alapsík (fagyhatár: 0,8~m)', 'r_cost': 'Alapozás ára',
            'w_none': 'Fúrás nélkül nincs miből becsülni: vakon tervezel.', 'w_dew': 'Az alapsík a talajvíz alatt van: víztelenítés is kell.',
            'w_shallow': 'A fúrás nem ért le odáig, ameddig a teher hat: alatta csak feltételezés, hogy a talaj ugyanaz.',
            'w_outside': 'Az egyik fal messze esik a fúrásoktól: ott csak feltételezés a talaj.', 'w_one': 'Egyetlen fúrásból nem látszik, változik-e a talaj az épület alatt.',
            'w_ok': 'A becslés a fúrások között egyenletesen változó talajjal számol.',
            'too_close': 'Itt már van fúrás – válassz távolabbi helyet!', 'no_money': 'Erre a fúrásra már nincs keret.',
            'a_found': 'Készül az alap…', 'a_build': 'Épül a ház…', 'a_load': 'Rákerül a teher…', 'a_years': 'Telnek az évek…', 'a_move': 'Valami mozog…', 'a_reveal': 'Lehull a lepel…',
            'zlim': 'határmélység', 'magn': 'a mozgás felnagyítva látszik',
            'v_t': {'ok': 'ÁLL!', 'collapse': 'TÖNKREMENT!', 'tilt': 'DŐL!', 'uls': 'KEVÉS A BIZTONSÁG', 'crack': 'MEGREPEDT', 'settle': 'MEGSÜLLYEDT', 'frost': 'FAGYKÁR'},
            'v_h': {'ok': 'Áll, és megfelel', 'collapse': 'Tönkrement', 'tilt': 'Megdőlt', 'uls': 'Áll, de nem felel meg', 'crack': 'Megrepedt', 'settle': 'Túl sokat süllyedt', 'frost': 'Megemelte a fagy'},
            'd_strip': 'sávalap, B~=~{B}~m, D~=~{D}~m', 'd_raft': 'lemezalap, D~=~{D}~m', 'd_pile': 'cölöpalap, L~=~{L}~m, a~=~{a}~m',
            'y_coll': 'A teher nagyobb, mint amit a talaj elbír (V<sub>k</sub>~/~R<sub>k</sub>~=~{k}): az alap alatt a talaj kitér, az épület lezökken és megbillen.',
            'y_coll_p': 'A cölöpök ellenállása kisebb a tehernél (E<sub>k</sub>~/~R<sub>k</sub>~=~{k}): az épület lezökken. A cölöp akkor ér valamit, ha a talpa teherbíró rétegben áll.',
            'y_tilt': 'A két oldal süllyedése között {ds}~mm a különbség: a dőlés 1~:~{n}, szabad szemmel is látszik. A megengedett 1~:~500.',
            'y_uls': 'A tervezési teher nagyobb a tervezési ellenállásnál (Λ~=~{l}~>~1): nincs meg az előírt biztonság, a terv nem fogadható el.',
            'y_crack': 'A süllyedéskülönbség {ds}~mm, a dőlés 1~:~{n} – ez több az 1~:~500 határnál: a falak megrepednek.',
            'y_settle': 'A süllyedés {s}~mm, a megengedett {lim}~mm: a közműbekötések és a burkolatok tönkremennek.',
            'y_frost': 'Az alapsík csak {D}~m mélyen van, a fagyhatár 0,8~m: télen a megfagyó talaj megemeli az alapot.',
            'y_ok': 'Teherbírás: Λ~=~{l}~≤~1. A süllyedés {s}~mm, a dőlés a határon belül van.',
            'y_surprise': 'A becslésed szerint megfelelt volna – a fúrásaid nem mutatták meg, mi van valójában a falak alatt.',
            'y_blind': 'Fúrás nélkül terveztél: nem tudhattad, mire építesz.',
            'y_dew': 'Az alapgödörben talajvíz volt: a víztelenítés +{c}~M~Ft.', 'y_over': 'A költség ({c}~M~Ft) túllépte a keretet ({b}~M~Ft).',
            'y_econ': 'Gazdaságos: legfeljebb 30~%-kal drágább a legolcsóbb megfelelő megoldásnál.',
            'y_exp': 'Megfelel, de drága: {k}-szer annyiba került, mint a legolcsóbb megfelelő megoldás.',
            'y_found': 'Alapos feltárás: a fúrásaid megmutatták a telek titkát.',
            'y_nfound': 'A feltárás hiányos: legalább két fúrás kell az épülethez, ott és olyan mélyen, hogy a telek titka kiderüljön.',
            'y_opt': 'A legolcsóbb megfelelő megoldás: {d} – {c}~M~Ft.',
            'cmp_h': 'Becslés és valóság', 'cmp_est': 'becslésed', 'cmp_real': 'valóság',
            'lesson_h': 'Mit tanít ez a telek?', 'lesson_link': 'Tananyag:', 'again': 'Újra', 'next_lv': 'Következő telek',
            'lv_n': '{n}. telek', 'lec': '{n}. előadás', 'ranks': ['Gyakornok', 'Tervező', 'Vezető tervező', 'Szakértő', 'Alapozó mester'],
        }
        S = {
            'lang': 'hu', 'imgsuf': '', 'home': '/', 'nav_home': 'Alapozás nyitóoldal',
            'title': 'Áll vagy dől? – alapozós játék | BME Alapozás', 'title_short': 'Áll vagy dől?',
            'desc': 'Hat telek, hat megbízás: fúrással ismered meg a talajt, alapozást választasz, felépíted a házat – aztán kiderül, hogy áll, megreped vagy megdől. Játék a BME Alapozás tárgyához.',
            'kick': 'BME Alapozás · játék az egész félévhez', 'h1': 'Áll vagy <em>dől?</em>',
            'lead': 'Hat telek, hat megbízás. A talajt nem látod: fúrnod kell, hogy megismerd, de minden fúrás pénzbe kerül. Válassz alapozást, építsd fel a házat, és nézd meg, mi lesz vele: áll, megreped vagy megdől. A végén lehull a lepel, és megmutatjuk, mi volt valójában a föld alatt.',
            's1_t': 'Fúrj!', 's1_p': 'Koppints a telekre: oda kerül a fúrás. A mély fúrás többet lát, de drágább – és ahol nem fúrtál, ott csak sejted a talajt.',
            's2_t': 'Alapozz!', 's2_p': 'Sávalap, lemezalap vagy cölöp? A becslés abból számol, amit a fúrásaid mutattak – nem abból, ami valójában lent van.',
            's3_t': 'Építs!', 's3_p': 'A ház felépül, rákerül a teher, telnek az évek – és a valódi talaj dönt. Utána összevetheted a becslésedet a valósággal.',
            'st1': 'áll és megfelel', 'st2': 'gazdaságos', 'st3': 'alapos feltárás',
            'pick_h': 'Válassz telket!', 'scene_aria': 'A telek metszete: fent az épület, lent a talaj a fúrásokkal',
            'tab1': '1 · Feltárás', 'tab2': '2 · Alapozás', 'tab3': '3 · Építés',
            'how_h': 'Hogyan számol a játék?',
            'n1_t': 'Teherbírás', 'n1_p': 'Sávalapra, a talaj nyírószilárdságából: homokban és kavicsban a súrlódási szögből, agyagban a drénezetlen nyírószilárdságból. Ha az alap alatt gyengébb réteg van, azt is ellenőrzi. Megfelel, ha <span class="nw">Λ = V<sub>d</sub> / R<sub>d</sub> ≤ 1.</span>',
            'n2_t': 'Süllyedés', 'n2_p': 'A többletfeszültség a mélységgel csökken. A játék a határmélységig – ahol a többletfeszültség az önsúlyfeszültség ötödére csökken – rétegenként összegzi az összenyomódást. A két fal süllyedésének különbsége adja a dőlést.',
            'n3_t': 'Cölöp', 'n3_p': 'A 80~cm átmérőjű cölöp palástja és talpa rétegenként más ellenállást ad. Akkor ér valamit, ha a talpa teherbíró rétegben áll – a puha agyagban „lebegő” cölöp megsüllyed.',
            'n4_t': 'Játék, nem tervezés', 'n4_p': 'A modell erősen egyszerűsített: egy méter széles szeletet néz, a talajjellemzők kerek tankönyvi értékek, az árak nagyságrendi becslések. Arra való, hogy ráérezz az összefüggésekre.',
            'more_h': 'Még több játék',
            'foot': 'BME Geotechnika és Mérnökgeológia Tanszék · Alapozás · A csillagaid csak ebben a böngészőben maradnak meg.', 'foot_link': 'Vissza az Alapozás nyitóoldalára',
            'langsw': '<a class="langbtn" id="langSw" href="en" hreflang="en" lang="en" aria-label="English version"><b>HU</b><span>EN</span></a>',
            'langjs': "<script>/*nyelv*/try{if(localStorage.getItem('alap-lang')==='en'&&!/[?&]hu\\b/.test(location.search))location.replace('en'+location.search)}catch(e){}</script>",
        }
        more = [('Geotechnikai helyszínelők', 'Alapozási kárügyek: a nyomokból kell kideríteni, mi történt.', SITE + '/helyszinelok'),
                ('Tippelj, aztán számolj', 'Előbb becsülsz, aztán megnézed a számítást.', SITE + '/tippelj'),
                ('Egy telek, egy félév', 'Te vagy a geotechnikus: kilenc feladat egyetlen telken.', SITE + '/telek'),
                ('Alapozás AR labor', 'Tíz mozgó 3D-modell – a telefonodon az asztalra teheted.', SITE + '/ar-labor')]
    else:
        T = {
            'dec': '.', 'mft': 'M~HUF', 'bshort': 'B',
            'soil': {'fill': 'loose fill', 'sandL': 'loose sand', 'sandM': 'medium dense sand', 'sandD': 'dense sand', 'grav': 'sandy gravel', 'clayS': 'soft clay', 'clayM': 'firm clay', 'clayH': 'stiff clay', 'peat': 'peat'},
            'soils_none': 'Whatever your boreholes reveal will appear here.',
            'lv': {
                'homok': {'name': 'Family house on sand', 'bld': 'two-storey family house', 'bld_s': '2~storeys', 'app': apps['terv'],
                          'brief': 'A two-storey family house, with sand everywhere around. An easy case – the only question is how much you spend on it.',
                          'lesson': 'On good ground a narrow strip footing taken below the frost depth is enough. Anything more is money wasted; anything less – a founding level shallower than 0.8~m – will be lifted by frost in winter.'},
                'viz': {'name': 'Warehouse by the lake', 'bld': 'single-storey warehouse', 'bld_s': '1~storey', 'app': apps['teher'],
                        'brief': 'A heavy single-storey warehouse beside the lake. The water is close – below the surface, too.',
                        'lesson': 'Below the groundwater table the effective unit weight of the soil is roughly halved, and so is the bearing resistance: a wider footing is needed. Digging below the water, however, means dewatering – keep the founding level above the groundwater if you can.'},
                'feltoltes': {'name': 'Apartment block on fill', 'bld': 'three-storey apartment block', 'bld_s': '3~storeys', 'app': apps['kedv'],
                              'brief': 'A three-storey apartment block at the edge of an old, backfilled pit. Nobody knows how thick the fill is, or where.',
                              'lesson': 'We do not found on loose fill: the founding level must be taken down into the bearing stratum under both walls. The fill is not equally thick at the two ends of the site – a single borehole will not tell you that.'},
                'lencse': {'name': 'Office block above the hidden lens', 'bld': 'four-storey office block', 'bld_s': '4~storeys', 'app': apps['sully'],
                           'brief': 'A four-storey office block on dense sand. According to the neighbour, one corner of the site used to be a bog.',
                           'lesson': 'A lens of peat was sitting in the dense sand, right under the right-hand wall. Between two boreholes the ground is not necessarily what the two boreholes show: the investigation must be under the building and close enough. The solution is piles taken through the lens.'},
                'agyag': {'name': 'Eight storeys on soft clay', 'bld': 'eight-storey residential block', 'bld_s': '8~storeys', 'app': apps['mely'],
                          'brief': 'An eight-storey residential block. Near the surface there is soft clay everywhere – the question is what lies beneath it.',
                          'lesson': 'On thick soft clay a strip footing ends in bearing failure, and a raft settles by several decimetres. The load must be carried by piles down to the gravel below – but that takes a borehole deep enough to reach the bearing stratum.'},
                'pisa': {'name': 'Bell tower – a little Pisa', 'bld': 'six-storey bell tower', 'bld_s': '6~storeys', 'app': apps['hely'],
                         'brief': 'A slender six-storey bell tower. Several of the old towers around here are leaning…',
                         'lesson': 'The soft clay layer is of uneven thickness: it is much thicker under one side of the tower, so that side settles more and the tower leans – this is what happened in Pisa, too. Here you need piles that reach the dense sand beneath the clay on both sides.'},
            },
            'k_bld': 'building', 'k_load': 'load per wall', 'k_budget': 'budget',
            'bor_btn': '{d}~m deep borehole', 'bor_hint': 'Tap the site in the drawing: that is where the borehole goes. Tap a finished borehole to see its log.',
            'to_found': 'On to the foundation', 'to_found_blind': 'Continue without boreholes', 'spent': 'spent', 'budget': 'budget',
            'gw': 'groundwater', 'gw_none': 'the borehole met no groundwater', 'log_end': 'The borehole stopped at {d}~m; at its base: {s}.',
            'found_h': 'Which foundation?', 'ft': {'strip': 'Strip footing', 'raft': 'Raft', 'pile': 'Piles'}, 'ft_s': {'strip': 'under the two walls', 'raft': 'under the whole building', 'pile': 'Ø~80~cm'},
            'sl_B': 'Footing width, B', 'sl_D': 'Founding depth, D', 'sl_L': 'Pile length, L', 'sl_a': 'Pile spacing, a',
            'est_h': 'Estimate from your boreholes', 'back_bor': 'More boreholes', 'build': 'Build it!', 'build_over': 'Over budget',
            'building_h': 'Under construction…', 'building_p': 'Now the real ground decides – not what you thought of it from the boreholes.',
            'r_bear': 'Bearing resistance', 'r_set': 'Settlement', 'r_rot': 'Tilt', 'r_frost': 'Founding level (frost depth: 0.8~m)', 'r_cost': 'Foundation cost',
            'w_none': 'Without a borehole there is nothing to estimate from: you are designing blind.', 'w_dew': 'The founding level is below the groundwater: dewatering is needed as well.',
            'w_shallow': 'The borehole did not reach as deep as the load does: below it, the ground is only assumed to be the same.',
            'w_outside': 'One of the walls is far from the boreholes: the ground there is only assumed.', 'w_one': 'A single borehole cannot show whether the ground changes under the building.',
            'w_ok': 'The estimate assumes the ground changes evenly between the boreholes.',
            'too_close': 'There is already a borehole here – pick a spot further away!', 'no_money': 'There is no budget left for this borehole.',
            'a_found': 'Building the foundation…', 'a_build': 'The building goes up…', 'a_load': 'The load comes on…', 'a_years': 'The years go by…', 'a_move': 'Something is moving…', 'a_reveal': 'The veil lifts…',
            'zlim': 'depth of influence', 'magn': 'movements are exaggerated',
            'v_t': {'ok': 'IT STANDS!', 'collapse': 'FAILURE!', 'tilt': 'IT LEANS!', 'uls': 'NOT SAFE ENOUGH', 'crack': 'CRACKED', 'settle': 'IT SANK', 'frost': 'FROST DAMAGE'},
            'v_h': {'ok': 'It stands, and it complies', 'collapse': 'It failed', 'tilt': 'It leans', 'uls': 'It stands, but does not comply', 'crack': 'It cracked', 'settle': 'It settled too much', 'frost': 'Lifted by frost'},
            'd_strip': 'strip footing, B~=~{B}~m, D~=~{D}~m', 'd_raft': 'raft, D~=~{D}~m', 'd_pile': 'piles, L~=~{L}~m, a~=~{a}~m',
            'y_coll': 'The load is more than the ground can carry (V<sub>k</sub>~/~R<sub>k</sub>~=~{k}): the soil beneath the footing is pushed aside, and the building drops and tilts.',
            'y_coll_p': 'The resistance of the piles is smaller than the load (E<sub>k</sub>~/~R<sub>k</sub>~=~{k}): the building drops. A pile is only worth something if its base stands in a bearing stratum.',
            'y_tilt': 'The two sides settle {ds}~mm differently: the tilt is 1~:~{n}, visible to the naked eye. The limit is 1~:~500.',
            'y_uls': 'The design load exceeds the design resistance (Λ~=~{l}~>~1): the required safety is missing, and the design cannot be accepted.',
            'y_crack': 'The differential settlement is {ds}~mm and the tilt 1~:~{n} – more than the 1~:~500 limit: the walls crack.',
            'y_settle': 'The settlement is {s}~mm, the limit {lim}~mm: service connections and finishes are ruined.',
            'y_frost': 'The founding level is only {D}~m deep, the frost depth is 0.8~m: in winter the freezing ground lifts the footing.',
            'y_ok': 'Bearing resistance: Λ~=~{l}~≤~1. The settlement is {s}~mm, and the tilt is within the limit.',
            'y_surprise': 'By your estimate it would have complied – your boreholes did not show what is really beneath the walls.',
            'y_blind': 'You designed without a borehole: you could not know what you were building on.',
            'y_dew': 'There was groundwater in the excavation: dewatering cost +{c}~M~HUF.', 'y_over': 'The cost ({c}~M~HUF) exceeded the budget ({b}~M~HUF).',
            'y_econ': 'Economical: at most 30% more expensive than the cheapest solution that complies.',
            'y_exp': 'It complies, but it is expensive: it cost {k} times the cheapest solution that complies.',
            'y_found': 'Thorough investigation: your boreholes revealed the secret of the site.',
            'y_nfound': 'The investigation is incomplete: you need at least two boreholes at the building, placed and deep enough to reveal the secret of the site.',
            'y_opt': 'The cheapest solution that complies: {d} – {c}~M~HUF.',
            'cmp_h': 'Estimate and reality', 'cmp_est': 'your estimate', 'cmp_real': 'reality',
            'lesson_h': 'What does this site teach?', 'lesson_link': 'Course material:', 'again': 'Again', 'next_lv': 'Next site',
            'lv_n': 'Site {n}', 'lec': 'Lecture {n}', 'ranks': ['Trainee', 'Designer', 'Lead designer', 'Expert', 'Master of foundations'],
        }
        S = {
            'lang': 'en', 'imgsuf': '-en', 'home': '/en', 'nav_home': 'Course home',
            'title': 'Stand or fall? – a foundation game | BME Foundation Engineering', 'title_short': 'Stand or fall?',
            'desc': 'Six sites, six commissions: you explore the ground with boreholes, choose a foundation and build – then find out whether the building stands, cracks or leans. A game for the BME Foundation Engineering course.',
            'kick': 'BME Foundation Engineering · a game for the whole semester', 'h1': 'Stand or <em>fall?</em>',
            'lead': 'Six sites, six commissions. You cannot see the ground: you have to drill to get to know it, but every borehole costs money. Choose a foundation, build the building and watch what happens to it: it stands, it cracks or it leans. At the end the veil lifts, and we show you what was really down there.',
            's1_t': 'Drill!', 's1_p': 'Tap the site: that is where the borehole goes. A deep borehole sees more but costs more – and where you did not drill, you can only guess the ground.',
            's2_t': 'Design!', 's2_p': 'Strip footing, raft or piles? The estimate works from what your boreholes showed – not from what is really down there.',
            's3_t': 'Build!', 's3_p': 'The building goes up, the load comes on, the years go by – and the real ground decides. Then you can compare your estimate with reality.',
            'st1': 'it stands and complies', 'st2': 'economical', 'st3': 'thorough investigation',
            'pick_h': 'Pick a site!', 'scene_aria': 'Cross-section of the site: the building above, the ground with the boreholes below',
            'tab1': '1 · Investigate', 'tab2': '2 · Foundation', 'tab3': '3 · Build',
            'how_h': 'How does the game calculate?',
            'n1_t': 'Bearing resistance', 'n1_p': 'For a strip footing, from the shear strength of the soil: from the friction angle in sand and gravel, from the undrained shear strength in clay. A weaker layer beneath the footing is checked as well. It complies if <span class="nw">Λ = V<sub>d</sub> / R<sub>d</sub> ≤ 1.</span>',
            'n2_t': 'Settlement', 'n2_p': 'The stress increase fades with depth. Down to the depth of influence – where it falls to one fifth of the overburden stress – the game adds up the compression layer by layer. The difference between the settlements of the two walls gives the tilt.',
            'n3_t': 'Piles', 'n3_p': 'The shaft and the base of an 80~cm diameter pile give a different resistance in each layer. A pile is only worth something if its base stands in a bearing stratum – a pile “floating” in soft clay settles.',
            'n4_t': 'A game, not a design', 'n4_p': 'The model is heavily simplified: it looks at a one-metre-wide slice, the soil parameters are round textbook values and the prices are order-of-magnitude estimates. It is there to give you a feel for how things are connected.',
            'more_h': 'More games',
            'foot': 'BME Department of Engineering Geology and Geotechnics · Foundation Engineering · Your stars are kept in this browser only.', 'foot_link': 'Back to the course home page',
            'langsw': '<a class="langbtn" id="langSw" href="./" hreflang="hu" lang="hu" aria-label="Magyar változat"><span>HU</span><b>EN</b></a>',
            'langjs': '',
        }
        more = [('Geotechnical CSI', 'Foundation damage cases: work out from the clues what happened.', SITE + '/helyszinelok/en'),
                ('Guess, then calculate', 'First you estimate, then you look at the calculation.', SITE + '/tippelj/en'),
                ('One site, one semester', 'You are the geotechnical engineer: nine tasks on a single site.', SITE + '/telek/en'),
                ('Foundation Engineering AR lab', 'Ten moving 3D models – put them on your table with your phone.', SITE + '/ar-labor/en')]
    S['more'] = ''.join(f'<a class="box link" href="{u}" target="_blank" rel="noopener"><h3>{t} ↗</h3><p class="hyphenate">{d}</p></a>' for t, d, u in more)
    return S, T

def nb(o):
    if isinstance(o, str): return o.replace('~', ' ')
    if isinstance(o, list): return [nb(x) for x in o]
    if isinstance(o, dict): return {k: nb(v) for k, v in o.items()}
    return o

HYPH = '<script src="../vendor/hyphenopoly/Hyphenopoly_Loader.js"></script>\n<script>Hyphenopoly.config({ require: { "hu": "FORCEHYPHENOPOLY" }, setup: { hide: "none", selectors: { ".hyphenate": { minWordLength: 6, compound: "auto" } } } });</script>'

def keys(o, pre=''):
    out = set()
    for k, v in o.items():
        out.add(pre + k)
        if isinstance(v, dict): out |= keys(v, pre + k + '.')
    return out

def page(en, out):
    S, T = texts(en); S, T = nb(S), nb(T)
    s = tpl.replace('{{hyph}}', '' if en else HYPH)
    for k, v in S.items(): s = s.replace('{{' + k + '}}', v)
    assert '{{' not in s, s[s.index('{{'):s.index('{{') + 40]
    for a in ('/*DATA*/null', '/*CORE*/', '/*GAME*/', '/*GUARD*/'): assert a in s, a
    s = s.replace('/*DATA*/null', json.dumps({'lang': S['lang'], 'T': T}, ensure_ascii=False)).replace('/*CORE*/', core.strip()).replace('/*GAME*/', game.strip()).replace('/*GUARD*/', guard.strip())
    (root / 'allvagydol' / out).write_text(s, encoding='utf-8'); print(out, len(s)); return T

TH, TE = page(False, 'index.html'), page(True, 'en.html')
# ellenőrzés: a két nyelv kulcsai egyeznek, és a játék minden T.kulcsa létezik
assert keys(TH) == keys(TE), keys(TH) ^ keys(TE)
used = set(re.findall(r'\bT\.([A-Za-z_]\w*)', game)); miss = used - set(TH); unused = set(TH) - used
assert not miss, ('hiányzó szöveg', miss)
print('szövegkulcsok:', len(keys(TH)), '· nem használt:', sorted(unused) or 'nincs')
