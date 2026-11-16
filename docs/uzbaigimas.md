# Integracijos ir patikros

## Diegimas

React sąsają aptarnauja Vite, o viešą programos versiją – Vercel. Supabase projekto URL ir viešasis publishable raktas pateikiami per `VITE_SUPABASE_URL` ir `VITE_SUPABASE_PUBLISHABLE_KEY`. Vietinė aplinka aprašyta `.env.example`; `.env.local` į Git neįtraukiamas.

## Duomenų bazė ir prieigos kontrolė

`rooms` saugo vartotojui priklausančias patalpas, o `faults` – su jomis susietus gedimus. Gedimo prioritetas yra `normal` arba `high`; būsena – `registered` arba `resolved`. RLS taisyklės leidžia vartotojui pasiekti tik savo patalpas ir jų gedimus. Gedimą galima ištrinti atskirai; patalpos ištrynimas per `ON DELETE CASCADE` pašalina ir jos gedimus.

Pradinė schema yra `supabase/001_initial.sql`. Gedimo būsenos migracija – `supabase/migrations/20261116182101_add_fault_status.sql`. Pakartojamas RLS patikrinimas – `supabase/check_rls.sql`.

## Automatizavimas

Tik naujas `INSERT` į `public.faults` sukuria Supabase Database Webhook įvykį. Zapier filtras priima `INSERT` įrašus iš `public.faults`; Paths siunčia `high` prioritetą skubiu Gmail keliu, o kitus leistinus įrašus – įprastu Fallback keliu. Laiške pateikiamas kabineto pavadinimas, gedimo aprašymas ir prioritetas. Webhook adresas laikomas Supabase duomenų bazės nustatymuose ir į repozitoriją neįtraukiamas.

## Patikros rezultatai

- `npm run build` sėkmingai surenka programą.
- Patikrinta registracija, prisijungimas, sesijos atkūrimas ir atsijungimas.
- Patikrinti trys puslapiai (`/gedimai`, `/registruoti`, `/patalpos`), tiesioginis jų atidarymas, atnaujinimas ir navigacija.
- Patikrintos keturios sąsajos būsenos: įkėlimas, klaida su pakartojimu, tuščias sąrašas ir sėkmingas išsaugojimas.
- RLS SQL bandymai patvirtino duomenų izoliaciją, būsenos reikšmių apribojimus ir draudimą vienam vartotojui keisti kito vartotojo duomenis.
- Patikrinta, kad gedimo būsenos pakeitimas išlieka atnaujinus puslapį ir nesukuria naujo webhook įvykio.
- Gedimo ištrynimo patvirtinimo dialogą atšaukus, gedimas liko sąraše; patvirtinus ištrinta laikina bandymo patalpa.
- Iš viešos programos užregistruoti skubus ir įprastas gedimai. Zapier abiem atvejais įvykdė atitinkamą Gmail veiksmą; laiškai gauti gavėjo pašto dėžutėje.
- Patikrintas Zapier klaidos kelias, kuris praneša savininkui apie nepavykusį skubaus Gmail veiksmą.
- Patikrintas siauras, 390 px pločio, ekrano vaizdas; horizontalaus slinkimo nėra.

Ekrano nuotraukos ir papildomi įrodymai pateikti [Notion dokumentacijoje](https://app.notion.com/p/41a185e1333d8175b63bc5a4cbe7cdf2).

## Automatizavimo apimtis

Esant 50 naujų gedimų per mėnesį ir vienam sėkmingam Gmail veiksmui kiekvienam įrašui, numatoma apie 50 Zapier užduočių per mėnesį. Papildomi pranešimai klaidos atveju gali padidinti užduočių skaičių.
