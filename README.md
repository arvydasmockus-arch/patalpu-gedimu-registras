# Patalpų gedimų registras

Baigiamasis projektas. Vartotojas registruoja įprastus arba skubius gedimus savo patalpose. Apie naują gedimą projekto savininkas gaus laišką.

## Projekto nuorodos

- [Vieša programa](https://patalpu-gedimu-registras.vercel.app)
- [GitHub](https://github.com/arvydasmockus-arch/patalpu-gedimu-registras)
- [Supabase valdymas](https://supabase.com/dashboard/project/mbtlhhhkjgdkbzkhdigh)
- [Notion dokumentacija](https://app.notion.com/p/41a185e1333d8175b63bc5a4cbe7cdf2)
- [Įjungtas Zapier automatizavimas](https://zapier.com/editor/386877733)
- [Zapier vykdymų istorija](https://zapier.com/app/history?root_id=386877733)

## Paleidimas

Reikia Node.js 22.12+ (patikrinta su 24.21.0).

```sh
npm install
npm run dev
```

Pakartotiniam diegimui naudokite `npm ci`. Patikrinimas: `npm run build`.

Duomenų bazės schema yra `supabase/001_initial.sql`. Ją paleiskite šio projekto Supabase SQL Editor. Prisijungimo integracijai nukopijuokite `.env.example` į `.env.local` ir įrašykite projekto URL bei viešą kliento raktą.

Po pradinės schemos pritaikykite `supabase/migrations/20261116182101_add_fault_status.sql`, kuris prideda gedimo būseną. Webhook integracija aprašyta `docs/uzbaigimas.md`.

```env
VITE_SUPABASE_URL=https://PROJEKTAS.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=VIESAS_KLIENTO_RAKTAS
```

Nenaudokite `service_role` ar slapto serverio rakto. `.env.local` nekeliamas į Git.
Mokomojoje programoje naudojamas tik vartotojo vardas ir slaptažodis. Vardas: 3–24 lotyniškos raidės, skaičiai, taškas, brūkšnelis arba pabraukimas; slaptažodis – bent 6 simboliai. Vardo didžiosios ir mažosios raidės laikomos vienodomis.
Supabase Authentication palikite Email provider įjungtą, o `Confirm email` išjunkite. Programa viduje vardą paverčia techniniu adresu `vardas@users.patalpu-registras.invalid`; laiškai vartotojams nesiunčiami. Tai paprastas mokomasis sprendimas be el. pašto slaptažodžio atkūrimo.
SQL failą naujame projekte vykdykite vieną kartą – jis nėra skirtas pakartotiniam paleidimui.

## Apimtis

- `rooms` – vartotojo patalpos.
- `faults` – pasirinktos patalpos gedimai. Prioritetas `normal` arba `high`, būsena `registered` (Užregistruota) arba `resolved` (Sutvarkyta).
- Naujas gedimas sukuria vieną įrašą `faults` lentelėje. Supabase INSERT webhook perduoda įvykį į Zapier. Įjungta Filter → Paths → Gmail eiga automatiškai siunčia laišką pagal prioritetą.

## Įgyvendinta

- Paprasta registracija ir prisijungimas vartotojo vardu bei slaptažodžiu, sesijos atkūrimas, atsijungimas.
- Patalpos kūrimas, gedimo registravimas su įprastu arba skubiu prioritetu.
- Savo patalpų ir gedimų sąrašas, gedimo pažymėjimas sutvarkytu ir atvėrimas iš naujo. Filtrai „Visi“, „Užregistruoti“, „Sutvarkyti“ su skaičiais leidžia matyti ir sutvarkytų gedimų istoriją. Gedimus ir patalpas galima ištrinti; trinant patalpą kartu pašalinami susieti gedimai.
- SQL RLS: vartotojas pasiekia tik savo patalpas ir jų gedimus; neprisijungusiam prieiga nesuteikta.
- Prisijungimas / registracija (`/prisijungimas`) ir trys puslapiai su navigacijos skirtukais: „Gedimų registras“ (`/gedimai`), „Registruoti gedimą“ (`/registruoti`), „Patalpos“ (`/patalpos`). Kiekvieną adresą galima atidaryti tiesiogiai ir atnaujinti. Vercel SPA perrašymas nustatytas `vercel.json`.
- Keturios UI būsenos: įkėlimas, klaida su „Bandyti dar kartą“, tuščias sąrašas su kito veiksmo nuoroda ir sėkmės patvirtinimas po išsaugojimo. Tai atskira nuo gedimo būsenų „Užregistruota“ / „Sutvarkyta“.
- Prisijungęs vartotojas pats keičia savo gedimo būseną. Atskiro administratoriaus vaidmens nėra. Būsenos UPDATE nesukelia naujo Gmail laiško: webhook veikia tik po INSERT.

Patikrinta: surinkimas ir tikras Supabase Auth. Naršyklėje sukurta paskyra vartotojo vardu, patalpa ir skubus gedimas; patikrintas sesijos atkūrimas, atsijungimas bei pakartotinis prisijungimas. Viešoje Vercel svetainėje patikrintas prisijungimas ir antros paskyros duomenų izoliacija, taip pat 390 px pločio ekranas. Tikroje duomenų bazėje patikrinta RLS izoliacija su `authenticated` vaidmeniu. Pakartojamas SQL bandymas: `supabase/check_rls.sql` (bandomi duomenys atšaukiami su ROLLBACK). Pradinė lentelių saugumo patikra RLS pastabų nerado.

Atnaujintoje programoje naršyklėje patikrinta patalpos ir gedimo kūrimo eiga, būsenos keitimas, jos išlikimas atnaujinus puslapį, atvėrimas iš naujo, navigacija ir naršyklės grįžimas. Tinklo klaida parodė Error, „Bandyti dar kartą“ atkūrė sąrašą; 390 px pločiu horizontalaus slinkimo nėra. Naujo įprasto gedimo laiškas apie kabinetą 218 gautas gavėjo INBOX. SQL bandymas taip pat tikrina numatytą būseną, leistinas reikšmes ir draudimą keisti svetimo gedimo būseną.

## Kūrimo istorija

Pradinis commit: `82d6c8e`. Pakeitimai sujungti per [GitHub pull requestus](https://github.com/arvydasmockus-arch/patalpu-gedimu-registras/pulls?q=is%3Apr+is%3Amerged).

Zapier sukonfigūruoti webhook, filtras, `high` ir `normal` šakos bei Gmail laiškai. Supabase webhook atsakymas – HTTP 200. Laiškuose perduodamas kabinetas, gedimo aprašymas ir lietuviškas prioritetas, be UUID. Siuntėjas `12arvydas12@gmail.com`, gavėjas `arvydas.mockus@gmail.com`.

2026-11-16 publikuota ir įjungta Zap versija v1. Po publikavimo viešoje svetainėje užregistruoti du nauji gedimai be rankinio „Test step“: „Kabinetas 212 – Sugedo durų spyna, negalima užrakinti kabineto“ (skubus) ir „Kabinetas 316 – Projektorius nerodo vaizdo“ (įprastas). Abu laiškai patikrinti gavėjo INBOX; Zapier istorijoje du Successful vykdymai (18:53:04 ir 18:53:06, Europe/Vilnius).

Integracijų ir patikrų aprašymas: [docs/uzbaigimas.md](docs/uzbaigimas.md).

Supabase Auth metodai patikrinti pagal oficialią [prisijungimo](https://supabase.com/docs/reference/javascript/auth-signinwithpassword) ir [registracijos](https://supabase.com/docs/reference/javascript/auth-signup) dokumentaciją.
