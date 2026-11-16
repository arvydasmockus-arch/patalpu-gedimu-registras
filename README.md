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
Jeigu PowerShell blokuoja `npm.ps1`, naudokite `npm.cmd`.
Šioje Windows aplinkoje diegimas ir surinkimas pavyko suteikus prieigą už ribotos vykdymo aplinkos ribų; projekto kodo keisti dėl EPERM neprireikė.

Duomenų bazės schema yra `supabase/001_initial.sql`. Ją paleiskite šio projekto Supabase SQL Editor. Prisijungimo integracijai nukopijuokite `.env.example` į `.env.local` ir įrašykite projekto URL bei viešą kliento raktą.

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
- `faults` – pasirinktos patalpos gedimai. Prioritetas `normal` arba `high`.
- Naujas gedimas sukuria vieną įrašą `faults` lentelėje. Supabase INSERT webhook perduoda įvykį į Zapier. Įjungta Filter → Paths → Gmail eiga automatiškai siunčia laišką pagal prioritetą.

## Įgyvendinta

- Paprasta registracija ir prisijungimas vartotojo vardu bei slaptažodžiu, sesijos atkūrimas, atsijungimas.
- Patalpos kūrimas, gedimo registravimas su įprastu arba skubiu prioritetu.
- Savo patalpų ir gedimų sąrašas, įkėlimo ir klaidų pranešimai.
- SQL RLS: vartotojas pasiekia tik savo patalpas ir jų gedimus; neprisijungusiam prieiga nesuteikta.
- Trys ekranai: prisijungimas / registracija, „Mano sąrašas“ ir „Kurti įrašą“. Būsenos: įkėlimas, klaida su „Bandyti dar kartą“, tuščias sąrašas ir sėkmingo išsaugojimo pranešimas.

Patikrinta: surinkimas ir tikras Supabase Auth. Naršyklėje sukurta paskyra vartotojo vardu, patalpa ir skubus gedimas; patikrintas sesijos atkūrimas, atsijungimas bei pakartotinis prisijungimas. Viešoje Vercel svetainėje patikrintas prisijungimas ir antros paskyros duomenų izoliacija, taip pat 390 px pločio ekranas. Tikroje duomenų bazėje patikrinta RLS izoliacija su `authenticated` vaidmeniu. Pakartojamas SQL bandymas: `supabase/check_rls.sql` (bandomi duomenys atšaukiami su ROLLBACK). Pradinė lentelių saugumo patikra RLS pastabų nerado.

## Įskaitos darbų eiga

Išsaugokite tris atskirus pakeitimų rinkinius ir sujunkite juos per GitHub PR:

1. `feat/auth`: atkuriamas diegimas, Supabase klientas, registracija ir prisijungimas.
2. `feat/rooms-faults`: patalpų ir gedimų formos, sąrašai, RLS patikrinimas.
3. `docs/integrations`: Zapier, Vercel ir dokumentacija su demonstracijos įrodymais.

Pradinis commit: `82d6c8e`. Sujungti trys PR: [PR 1 – Auth](https://github.com/arvydasmockus-arch/patalpu-gedimu-registras/pull/1), [PR 2 – formos](https://github.com/arvydasmockus-arch/patalpu-gedimu-registras/pull/2), [PR 3 – paprastas prisijungimas ir dokumentacija](https://github.com/arvydasmockus-arch/patalpu-gedimu-registras/pull/3).

Zapier sukonfigūruoti webhook, filtras, `high` ir `normal` šakos bei Gmail laiškai. Supabase webhook atsakymas – HTTP 200. Laiškuose perduodamas kabinetas, gedimo aprašymas ir lietuviškas prioritetas, be UUID. Siuntėjas `12arvydas12@gmail.com`, gavėjas `arvydas.mockus@gmail.com`.

2026-11-16 publikuota ir įjungta Zap versija v1. Po publikavimo viešoje svetainėje užregistruoti du nauji gedimai be rankinio „Test step“: „Kabinetas 212 – Sugedo durų spyna, negalima užrakinti kabineto“ (skubus) ir „Kabinetas 316 – Projektorius nerodo vaizdo“ (įprastas). Abu laiškai patikrinti gavėjo INBOX; Zapier istorijoje du Successful vykdymai (18:53:04 ir 18:53:06, Europe/Vilnius).

**Prieš gynimą:** patikrinkite, kad Zapier Professional prieiga dar aktyvi. Publikavimo metu paskyra rodė 14 dienų bandomąjį laikotarpį; jam pasibaigus šiai eigai reikės tinkamo plano. Mokamas planas neužsakytas.
Diegimo, automatizavimo ir bandymo žingsniai: [docs/uzbaigimas.md](docs/uzbaigimas.md).

Supabase Auth metodai patikrinti pagal oficialią [prisijungimo](https://supabase.com/docs/reference/javascript/auth-signinwithpassword) ir [registracijos](https://supabase.com/docs/reference/javascript/auth-signup) dokumentaciją.
