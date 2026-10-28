# Alapozás – nyitóoldal

A tárgy nyitóoldala: bevezetés (talaj és szerkezet kölcsönhatása, az alapozás feladata, alaptípusok, határállapotok, interaktív feladatok),
a tárgy útja kilenc állomásban (görgetésre felépülő, ráközelítő metszettel), gyűjtőoldal az összes tananyaghoz, a félév menete, bevezető animáció.

- Egyfájlos `index.html` (a CSS és a JS beágyazva), mellette `fonts/`, `img/`, `vendor/hyphenopoly/`, `video/bevezeto.html`.
- Forrás: `_src/` (index.src.html, style.css, app.js) → `cd _src && python3 build.py` → `../index.html` (és `../artifact.html` az előnézethez).
- A tananyagok adatai (címek, URL-ek, leírások, jelvények) az `_src/app.js` elején, az `S` tömbben vannak; a félév órarendje a `W` tömbben (2026-os dátumokkal).
- Formázás: sorkizárás + magyar elválasztás (Hyphenopoly hu.wasm), nem törő egységek őre, keskeny dobozban lyuk esetén balra zárt tartalék.
- A bevezető videó forrása: `Claude videók/_forras/bevezeto_forras.zip` (a kit a `hatasok_forras.zip`-ben van).
