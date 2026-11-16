# Patalpų gedimų registras

Baigiamasis projektas. Vartotojas registruoja įprastus arba skubius gedimus savo patalpose. Apie naują gedimą projekto savininkas gaus laišką.

## Projekto nuorodos

- [Vieša programa](https://patalpu-gedimu-registras.vercel.app)
- [GitHub](https://github.com/arvydasmockus-arch/patalpu-gedimu-registras)
- [Supabase valdymas](https://supabase.com/dashboard/project/mbtlhhhkjgdkbzkhdigh)
- [Notion dokumentacija](https://app.notion.com/p/41a185e1333d8175b63bc5a4cbe7cdf2)
- [Zapier automatizavimo juodraštis](https://zapier.com/editor/386821336)

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
- Naujas gedimas sukuria vieną įrašą `faults` lentelėje. Supabase INSERT webhook perduoda įvykį į Zapier. Paruošta ir atskirais žingsniais patikrinta Filter → Paths → Gmail eiga; automatinis vykdymas dar neįjungtas dėl Zapier plano apribojimo.

## Įgyvendinta

- Paprasta registracija ir prisijungimas vartotojo vardu bei slaptažodžiu, sesijos atkūrimas, atsijungimas.
- Patalpos kūrimas, gedimo registravimas su įprastu arba skubiu prioritetu.
- Savo patalpų ir gedimų sąrašas, įkėlimo ir klaidų pranešimai.
- SQL RLS: vartotojas pasiekia tik savo patalpas ir jų gedimus; neprisijungusiam prieiga nesuteikta.

Patikrinta: surinkimas ir tikras Supabase Auth. Naršyklėje sukurta paskyra vartotojo vardu, patalpa ir skubus gedimas; patikrintas sesijos atkūrimas, atsijungimas bei pakartotinis prisijungimas. Viešoje Vercel svetainėje patikrintas prisijungimas ir antros paskyros duomenų izoliacija, taip pat 390 px pločio ekranas. Tikroje duomenų bazėje patikrinta RLS izoliacija su `authenticated` vaidmeniu. Pakartojamas SQL bandymas: `supabase/check_rls.sql` (bandomi duomenys atšaukiami su ROLLBACK). Pradinė lentelių saugumo patikra RLS pastabų nerado.

## Įskaitos darbų eiga

Išsaugokite tris atskirus pakeitimų rinkinius ir sujunkite juos per GitHub PR:

1. `feat/auth`: atkuriamas diegimas, Supabase klientas, registracija ir prisijungimas.
2. `feat/rooms-faults`: patalpų ir gedimų formos, sąrašai, RLS patikrinimas.
3. `docs/integrations`: Zapier, Vercel ir dokumentacija su demonstracijos įrodymais.

Pradinis commit: `82d6c8e`. Sujungti trys PR: [PR 1 – Auth](https://github.com/arvydasmockus-arch/patalpu-gedimu-registras/pull/1), [PR 2 – formos](https://github.com/arvydasmockus-arch/patalpu-gedimu-registras/pull/2), [PR 3 – paprastas prisijungimas ir dokumentacija](https://github.com/arvydasmockus-arch/patalpu-gedimu-registras/pull/3).

Zapier juodraštyje sukonfigūruoti webhook, filtras, `high` ir `normal` šakos bei Gmail laiškai. Supabase webhook atsakymas – HTTP 200. Abi sąlygos ir abu Gmail veiksmai patikrinti su tikrais gedimų įrašais; abu laiškai gauti projekto savininko Gmail. Tai redaktoriaus žingsnių bandymai, o ne įjungto automatizavimo vykdymų istorija.

**Liko prieš galutinį gynimą:** Zapier nemokamas planas neleidžia publikuoti šios eigos (Webhooks, keli žingsniai ir Paths). Reikia tinkamo plano arba paskyros su aktyvia prieiga, tuomet publikuoti Zap ir patikrinti du naujus gedimus be rankinio „Test step“. Mokamas planas nebuvo užsakytas.
Diegimo, automatizavimo ir bandymo žingsniai: [docs/uzbaigimas.md](docs/uzbaigimas.md).

Supabase Auth metodai patikrinti pagal oficialią [prisijungimo](https://supabase.com/docs/reference/javascript/auth-signinwithpassword) ir [registracijos](https://supabase.com/docs/reference/javascript/auth-signup) dokumentaciją.
