# Spletna stran — Mizarske storitve in montaža, Matjaž Pesjak s.p.

Statična spletna stran (čisti HTML, CSS in JavaScript, brez ogrodij in brez
strežniškega dela). Deluje na katerem koli gostovanju, tudi na najcenejšem.

---

## 1. Kaj je v mapi

```
index.html            glavna stran (vse sekcije)
zasebnost.html        politika zasebnosti in piškotkov
robots.txt            navodila iskalnikom
sitemap.xml           kazalo strani za Google
site.webmanifest      ikone in ime ob dodajanju na domači zaslon
assets/
  styles.css          ves videz strani (barve, postavitev, animacije)
  main.js             interakcije (meni, galerija, obrazec, piškotki)
  favicon-48.png      ikona v zavihku brskalnika
  img/                vse slike, pripravljene v dveh velikostih (800 in 1400 px)
  video/              dva posnetka (delavnica, dnevna soba)
  orig/               izvirne, nepomanjšane fotografije — NE nalagaj na strežnik
server.js             samo za lokalni predogled — NE nalagaj na strežnik
.claude/              nastavitve razvojnega okolja — NE nalagaj na strežnik
BERI-ME.md            ta datoteka
```

**Na strežnik naložiš:** `index.html`, `zasebnost.html`, `robots.txt`,
`sitemap.xml`, `site.webmanifest` in celotno mapo `assets/` **brez podmape
`assets/orig/`**. Skupaj približno 6,5 MB.

---

## 2. Kaj je treba dopolniti pred objavo

V kodi so označena mesta s komentarjem `DEPLOY STEP`. Poišči jih z iskanjem
po mapi (v urejevalniku `Ctrl+Shift+F` → `DEPLOY STEP`).

| # | Kaj | Kje |
|---|-----|-----|
| 1 | **Domena** — zamenjaj `https://www.mizarstvo-pesjak.si` s pravo | `index.html` (glava + strukturirani podatki), `zasebnost.html`, `robots.txt`, `sitemap.xml` |
| 2 | ~~E-naslov~~ — vpisan: `matjaz.mizarstvo@gmail.com` | ✔ opravljeno |
| 3 | **Matična in davčna številka** | `index.html` (noga, zakomentirano), `zasebnost.html` (preglednica) |
| 4 | **Delovni čas** — Google navaja odprtje ob 7.00 in zaprtje ob 16.00; potrdi dneve in soboto | `index.html` (razdelek Kontakt + strukturirani podatki) |
| 5 | **Besedilo »O nas«** — Matjaž naj ga prebere in dopolni z leti izkušenj, letom ustanovitve, šolanjem | `index.html`, razdelek `#o-nas` |
| 6 | **Ponudnik gostovanja** — vpiši ime v politiko zasebnosti | `zasebnost.html`, točka 2.4 |
| 7 | **Trditev »Brezplačen ogled in ponudba«** — potrdi, da drži (pojavi se na več mestih) | `index.html` |
| 8 | **Kuhinje po meri** — preveri, ali jih Matjaž res izdeluje; če ne, izbriši kartico in postavko | `index.html` (kartica v razdelku Storitve, izbirnik v obrazcu, strukturirani podatki, noga) |

Neobvezno, a priporočeno: pisave Alfa Slab One, IBM Plex Sans in Caveat
prenesi z Google Fonts in jih gosti v `assets/fonts/`. Stran se bo naložila hitreje, obiskovalčev IP pa ne bo
več potoval do Googla (potem lahko v politiki zasebnosti izbrišeš točko 6.2).

### Naslovna fotografija

Naslovna slika je `assets/img/hero-mizarska-miza-*.webp` — pogled od zgoraj na
mizarsko delovno mizo z orodjem, deskami in tehnično skico. Izvirnik meri
**1536 × 1024 px** in je shranjen v `assets/orig/`.

Slika je računalniško ustvarjena, ne fotografija Matjaževe delavnice. Za
naslovnico je to v redu, ker ne prikazuje konkretnega izdelka — **fotografije
v galeriji pa so vse z njegovih objektov** in naj tako tudi ostane, saj je pod
galerijo zapisano prav to.

Prejšnje naslovne fotografije so ostale v galeriji oziroma v `assets/orig/`.

---

## 3. Lokalni predogled

```bash
node server.js
```

Nato odpri `http://localhost:4173`.

> **Opomba o animacijah:** ta računalnik ima v Windows izklopljene animacije
> (Nastavitve → Dostopnost → Vizualni učinki → *Učinki animacije*). Vsi brskalniki
> zato javljajo `prefers-reduced-motion: reduce` in stran se prikaže brez gibanja —
> to je pravilno vedenje, ne napaka. Za preizkus animacij bodisi vklopi
> *Učinke animacije* v Windows bodisi odpri `http://localhost:4173/?nomotion=1`
> (ta parameter dela samo v `server.js` in na objavljeni strani nima učinka).

---

## 4. Objava

1. Kupi domeno (npr. `mizarstvo-pesjak.si`) in gostovanje z SSL (HTTPS).
2. Naloži datoteke s FTP ali prek nadzorne plošče gostitelja v korensko mapo
   (običajno `public_html/`).
3. Preveri, da stran deluje na `https://` in da se `http://` preusmerja nanj.
4. Prijavi stran v [Google Search Console](https://search.google.com/search-console)
   in oddaj `sitemap.xml`.
5. Na Google Zemljevidih dodaj povezavo do strani: odpri
   [poslovni profil](https://maps.google.com/?cid=15731232031138961253) →
   *Predlagajte urejanje* → *Dodaj spletno mesto*.

---

## 5. Kaj še najbolj pomaga pri uvrstitvi na Googlu

Stran je pripravljena tako, da jo Google lahko dobro razume: vsebuje
strukturirane podatke o podjetju (`LocalBusiness`), seznam storitev, pogosta
vprašanja (`FAQPage`), oceno strank, območje delovanja in opisna imena vseh slik.
Tehnika je s tem opravljena — naprej odločajo trije dejavniki:

1. **Google poslovni profil.** Največ prinese redno objavljanje fotografij
   opravljenih del in dopolnjen seznam storitev. Profil in spletna stran se
   krepita medsebojno.
2. **Mnenja.** Trenutno sta dve. Vsaka nova ocena opazno dvigne uvrstitev v
   lokalnem iskanju. Na strani je gumb »Napišite mnenje«, ki stranko pripelje
   naravnost do obrazca — povezavo lahko pošlješ tudi po SMS-u:
   `https://search.google.com/local/writereview?placeid=ChIJryAOXnVjZUcRZddIRy-QUNo`
3. **Nove fotografije.** Ko pribudeta dve ali tri opravljena dela, jih dodaj v
   galerijo (glej spodaj). Sveža vsebina pomaga.

Naslednji korak, ko bo stran nekaj mesecev v zraku: vsaki večji storitvi
(vgradne omare, stopnice, kuhinje, lesene obloge) narediti svojo podstran.
Sekcije na tej strani so zato napisane tako, da jih je mogoče preprosto
prenesti na lastno podstran.

---

## 6. Kako dodaš novo fotografijo v galerijo

1. Sliko pomanjšaj na dve velikosti in shrani v `assets/img/`:

   ```bash
   ffmpeg -i izvirnik.jpg -vf "scale=1400:-2" -quality 76 "assets/img/opis-dela-1400.webp"
   ffmpeg -i izvirnik.jpg -vf "scale=800:-2"  -quality 72 "assets/img/opis-dela-800.webp"
   ```

   Ime datoteke naj opisuje izdelek s slovenskimi besedami, z vezaji namesto
   presledkov (npr. `vgradna-omara-po-meri-predsoba`) — tako sliko najde tudi
   Google Slike.

2. V `index.html` poišči razdelek `<div class="gallery" id="gallery">` in
   prekopiraj eno obstoječo `<button class="gallery__item">` skupino.
   Zamenjaj:
   - `data-cat` — ena od vrednosti: `pohistvo`, `omare`, `kopalnice`, `masiva`,
     `stopnice`, `zunanji`, `poslovni`
   - `data-full` — pot do različice `-1400.webp`
   - `data-caption` — opis pod povečano sliko
   - `src` — pot do različice `-800.webp`
   - `alt` — opis slike za bralnike zaslona in Google
   - besedilo v `<span class="gallery__cap">`

3. V razdelku s števci popravi število fotografij (`data-count="27"`) in v
   mobilnem meniju besedilo »27 fotografij«.

---

## 7. Videz: barve, pisave in znak

### Barve

Tema je delavniški plakat: skoraj črna, topel papir in ena temno modra.

| Barva | Spremenljivka | Kje se pojavi |
|-------|---------------|---------------|
| Skoraj črna | `--black` #0C0B09 | glava, Postopek, Kontakt, noga, vstopni zaslon |
| Temna, malo svetlejša | `--ink` #15130F | razdelek Storitve (razred `.section--ink`) |
| Topel papir | `--paper` #F7F4ED | glavno ozadje |
| Temno modra | `--blue` #1C4E73 | gumbi, poudarki, prva kartica v četverici |
| Gozdna zelena | `--sage` #4E6A3A | vsaka 2. kartica, razdelek Materiali, aktivni filter galerije |
| Medenina | `--brass` #7A5C0C | vsaka 3. kartica, plusi pri vprašanjih, zvezdice |
| Žgana glina | `--clay` #9C4A2F | vsaka 4. kartica |
| Hrastova | `--logo` #D2A24C | **samo znak** — namenoma ni modra, da izstopa |

Na gumbih je modra podlaga z **belim** besedilom (kontrast 8,8:1). Na temnih
sekcijah se namesto `--blue` vedno uporabi `--blue-hi` (#7FB3D5), ker je
osnovna modra na črni pretemna. Vsaka poudarna barva ima različice `-ink`
(besedilo na papirju), `-hi` (besedilo na črni) in `-bg` (ploščica pod ikono).
Vse kombinacije so preverjene po WCAG AA.

Kartico prebarvaš z razredom `card--sage`, `card--brass` ali `card--clay` —
kartica brez teh razredov je modra. Enako velja za števce: `stat--blue`,
`stat--sage`, `stat--brass`, `stat--clay`.

Zaobljenost gumbov nastavlja `--radius-btn: 6px` na vrhu `assets/styles.css`.

**Temne ploskve in povezave.** Barve besedila na temni podlagi so zbrane v
skupinskih pravilih za `.on-dark, .section--dark, .section--ink,
.section--sage, .footer, .drawer`. Če dodaš novo temno sekcijo, ji dodaj
enega od teh razredov, sicer bosta uvodni odstavek in povezave ostali v barvi
za svetlo podlago.

Pozor na obratni primer: obrazec za povpraševanje je **svetla ploskev znotraj
temne sekcije**, zato ima svoje pravilo `.form a`, ki povezavam vrne temno
barvo. Enako bo treba storiti pri vsaki novi svetli kartici v temni sekciji.

### Pisave

| Vloga | Pisava | Zakaj |
|-------|--------|-------|
| h1, h2, velike številke | **Alfa Slab One** | težek ploščati serif, deluje kot vžgan pečat v les |
| h3, h4, besedilo, gumbi | **IBM Plex Sans** 400–700 | berljiva, s polno podporo šumnikom |
| Ročni pripis | **Caveat** (razred `.hand`) | za drobne osebne dodatke, če jih boš želel |

**Alfa Slab One ima samo težo 400.** Če jo kjer koli zapišeš s `font-weight: 600`
ali več, jo bo brskalnik ponaredil in besedilo bo zamazano — prav to je bilo
narobe pri prvi različici. Za vse, kar mora biti krepko, uporabi
`var(--font-body)` (IBM Plex Sans ima prave različice 400–700).

Pravilo za temne sekcije: barve besedila na temni podlagi so zbrane v
skupinskih pravilih za `.on-dark, .section--dark, .section--sage, .footer,
.drawer`. Če dodaš novo temno sekcijo, ji dodaj enega od teh razredov —
sicer bo uvodni odstavek ostal v barvi za svetlo podlago.

### Znak

Znak je **slika**, ne več risba v kodi: zlati oblič na leseni deski z napisom
MIZARSTVO in prekrižanima kladivoma. Izvirnik je v `assets/orig/`.

Uporabljata se dve različici:

| Datoteka | Kje |
|----------|-----|
| `logo-mizarstvo-840.webp` / `-480` | celoten znak z napisom — samo vstopni zaslon |
| `logo-emblem-320.webp` / `-160` | samo oblič z desko — glava, noga, podpis pri »O nas« |

V glavi je uporabljen samo emblem, ker napis »MIZARSTVO PESJAK« stoji že
poleg njega in bi se sicer podvajal.

Črna podlaga je iz slike odstranjena (prosojno ozadje), zato znak deluje na
temni in na svetli podlagi. Na svetli je zlato nekoliko bledo — to je za
logotip sprejemljivo, saj zanj kontrastne zahteve ne veljajo, za besedilo pa
te barve ne uporabljaj.

Ikone za zavihek in domači zaslon (`favicon-48.png`, `apple-touch-icon.png`,
`logo-mizarstvo-192/512.png`) so emblem na črni podlagi.

### Vstopna animacija

Ob prvem obisku se čez stran postavi črn zaslon, na katerem znak **maska
odkrije od leve proti desni** (približno 0,9 sekunde) — kot bi ga oblič
odkrival iz lesa. Nato se zaslon dvigne navzgor in odkrije naslovnico.

Prej se je znak izrisoval potezo za potezo, kar je bilo mogoče, dokler je bil
risba v kodi (SVG). Slike ni mogoče risati, zato je zdaj razkritje z masko
(`clip-path`) — to je poleg `transform` in `opacity` edina lastnost, ki
za animacijo ne sproži preračuna postavitve.

Podrobnosti:

- Prikaže se **enkrat na sejo** — zapomni si jo `sessionStorage` pod ključem
  `mp-uvod`. Med premikanjem po strani ne moti več.
- Če ima obiskovalec vklopljeno sistemsko nastavitev »manj gibanja«, se zaslon
  **sploh ne prikaže** in vsebina je takoj vidna.
- Če JavaScript odpove ali je izklopljen, se zaslon ne prikaže — skrit je s
  CSS-om in ga odklene šele skripta. Stran tako nikoli ne more obtičati za njim.
- Varovalka po 3,5 sekunde zaslon odstrani tudi, če se nalaganje zatakne.

Hitrost razkritja nastavlja pravilo `.logo-reveal.play` v `assets/styles.css`
(trenutno 800 ms). Če želiš krajši uvod, zmanjšaj `najmanj = 1400` v
`assets/main.js`.

### Gladkost drsenja

Če bo drsenje kdaj spet zateglo, so tu štiri mesta, ki so bila kriva prvič:

1. `backdrop-filter` na lepljivi glavi — zameglitev ozadja se preračunava ob
   vsakem okvirju. Odstranjen; ostal je samo v svetlobni škatli in na gumbu
   za video, kjer stran ne drsi.
2. `mix-blend-mode` na zrnati teksturi — vsako sekcijo prisili v svojo plast.
   Odstranjen, ostala je le nizka prosojnost.
3. `will-change` na vseh razkrivajočih se elementih hkrati — ustvari ~60
   plasti. Odstranjen.
4. Branje postavitve (`getBoundingClientRect`) ob vsakem okvirju drsenja.
   Zdaj se pometanje preskočenih razdelkov izvede največ petkrat na sekundo,
   časovnica postopka pa se meri samo, kadar je blizu vidnega polja.

---

## 8. Dostopnost in zasebnost — na kratko

- Vse barve dosegajo kontrast WCAG AA (preverjeno pri načrtovanju).
- Celotno stran je mogoče uporabljati s tipkovnico; fokus je vedno viden.
- Galerija se odpira s tipkami `Enter`, premika s puščicami, zapre z `Esc`.
- Vse animacije upoštevajo sistemsko nastavitev »manj gibanja«.
- Stran ne uporablja piškotkov za sledenje in nima analitike.
  Shrani samo tvojo odločitev o piškotkih (v brskalniku obiskovalca).
- Zemljevid Google Zemljevidov se naloži šele po privolitvi, zato do takrat
  Google o obiskovalcu ne izve ničesar.
- Obrazec nima strežnika: podatke prepiše v obiskovalčev e-poštni program.
  Posledično ni baze osebnih podatkov, ki bi jo bilo mogoče ukrasti.

Če boš kdaj dodal Google Analytics ali piškotke za oglaševanje, ju **obvezno**
priklopi na obstoječo privolitev (`localStorage` ključ `mp-piskotki`, vrednost
`vse` ali `nujni`) in dopolni točko 6.1 v politiki zasebnosti.
