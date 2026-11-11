# Alapozás – nyitóoldal

A tárgy nyitóoldala: bevezetés (talaj és szerkezet kölcsönhatása, az alapozás feladata, alaptípusok, határállapotok, interaktív feladatok),
a tárgy útja kilenc állomásban (görgetésre felépülő, ráközelítő metszettel), gyűjtőoldal az összes tananyaghoz, a félév menete, bevezető animáció.

- Egyfájlos `index.html` (a CSS és a JS beágyazva), mellette `fonts/`, `img/`, `vendor/hyphenopoly/`, `video/bevezeto.html`.
- Forrás: `_src/` (index.src.html, style.css, app.js) → `cd _src && python3 build.py` → `../index.html` (és `../artifact.html` az előnézethez).
- A tananyagok adatai (címek, URL-ek, leírások, jelvények) az `_src/app.js` elején, az `S` tömbben vannak; a félév órarendje a `W` tömbben (2026-os dátumokkal).
- Formázás: sorkizárás + magyar elválasztás (Hyphenopoly hu.wasm), nem törő egységek őre, keskeny dobozban lyuk esetén balra zárt tartalék.
- A bevezető videó forrása: `Claude videók/_forras/bevezeto_forras.zip` (a kit a `hatasok_forras.zip`-ben van).
- Átfogó tananyagok almappákban: `telek/` (Egy telek, egy félév – esettanulmány 3D-makettel) és `helyszinelok/` (Geotechnikai helyszínelők – kárügyek). Mindkettő önálló, kész oldal; a forrásuk nem itt van.
- **Angol változat (/en):** a nyitóoldalé az `_src/i18n_en.py` párjaival készül (`python3 build.py` → `../en.html`). A három extra – `helyszinelok/` (Geotechnical CSI), `tippelj/` (Guess, then calculate), `vizsga/` (Exam simulator) – angolul is elérhető (`<app>/en.html` → `/<app>/en`): `cd _src && python3 build_sub.py` (előfeltétel: `cd _src/sub_i18n && npm install`). A fordítások: `_src/sub_i18n/en_*.tsv` (azonosító = a magyar szöveg sha1-ének első 7 jegye); ha a magyar szöveg változik, a build leáll, a hiányzók: `_src/sub_i18n/missing.tsv`. A magyar `index.html`-ekben benne van a HU | EN nyelvváltó, az `EN` jelző és az angol tördelési szabályok; ha valamelyiket külső forrásból újragenerálják, `python3 sub_prep_hu.py` visszateszi ezeket. Az `Egy telek, egy félév` (`telek/`) még csak magyarul van.


## Videók zenéje

A videók zenéje (2026-11) valódi hangszerek felvett mintáiból készült – zongora, vonósok, akusztikus és elektromos gitár, basszusgitár, fúvósok, akusztikus dob –, ütemre igazítva a képhez; a gép- és effekthangok a korábbi hangkönyvtárból vannak. Hangminták: Salamander Grand Piano (Alexander Holm, CC BY 3.0); tonejs-instruments (nbrosowsky; VSCO2, Karoryfer, Iowa, Freesound – CC BY 3.0); Tone.js dobminták.
