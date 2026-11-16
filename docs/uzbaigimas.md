# Projekto užbaigimas ir demonstracija

Oficialios nuorodos: [Supabase Database Webhooks](https://supabase.com/docs/guides/database/webhooks), [Vite diegimas Vercel](https://vercel.com/docs/frameworks/frontend/vite).

## Vercel

Prijunkite šio projekto GitHub saugyklą prie Vercel. Naudokite Vite projektą, komandą `npm run build` ir išvesties katalogą `dist`.
Pridėkite abu README aprašytus `VITE_SUPABASE_*` aplinkos kintamuosius ir atlikite diegimą.
Supabase Auth Site URL pakeiskite į gautą Vercel adresą. Pakeitus Vite aplinkos kintamuosius, reikia naujo diegimo.
Viešą nuorodą įrašykite į README ir Notion.

## Supabase → Zapier → Gmail

Automatizavimas vykdomas serveryje: naršyklė tik įterpia gedimą į `faults`.

1. Zapier sukurkite Webhooks „Catch Hook“ ir nukopijuokite jo adresą.
2. Supabase Database Webhooks sukurkite `public.faults` įvykio `INSERT` webhook į tą adresą. Adreso nedėkite į frontend ar Git.
3. Užregistruokite vieną bandomą gedimą ir Zapier patikrinkite gautą įvykį.
4. Filter žingsnyje praleiskite tik `type = INSERT`, `table = faults` ir `schema = public`.
5. Paths sudarykite dvi nesikertančias sąlygas: `record.priority = high` ir `record.priority = normal`.
6. Kiekvienoje šakoje prijunkite Gmail laiško siuntimą projekto savininko adresu. Skubaus laiško tema: „SKUBUS patalpos gedimas“, įprasto: „Naujas patalpos gedimas“.
7. Laiško turinyje perduokite `record.title`, `record.room_id` ir `record.id`. Patalpos pavadinimo webhook įvykis nesiunčia – paprastai versijai pakanka ID.
8. Įjunkite automatizavimą ir patikrinkite abu prioritetus. Pakartotas webhook gali sukelti pakartotinį laišką; jei reikalinga deduplikacija, naudokite `record.id`.

Gmail paskyros prijungimas ir bandomųjų laiškų siuntimas dar neatliktas. Prieš konfigūruojant patikrinkite, ar pasirinktas Zapier planas palaiko Webhooks ir Paths.

## Rankinis priėmimo bandymas

1. Be aplinkos kintamųjų matomas konfigūravimo pranešimas.
2. Registracija su vartotojo vardu A ir slaptažodžiu, prisijungimas iškart be el. pašto patvirtinimo.
3. Sukurti patalpą „204 kabinetas“. Tuščias ir vien tarpų pavadinimas neturi būti išsaugotas.
4. Užregistruoti po vieną įprastą ir skubų gedimą. Patikrinti sąrašą ir atnaujinti naršyklės puslapį.
5. Atsijungti, prisijungti vartotoju B. A patalpų ir gedimų B neturi matyti.
6. RLS tikrinti ir tiesiogiai per Supabase Data API su B sesijos tokenu: A patalpos bei gedimo SELECT turi grąžinti tuščią sąrašą; INSERT į A patalpą turi būti atmestas. UPDATE / DELETE neturi pakeisti A duomenų. Testams nenaudoti `service_role` ir nedėti tokenų į dokumentaciją.
7. Neprisijungusio kliento SELECT ir INSERT turi būti atmesti. SQL Editor administratoriaus užklausa savaime RLS nepatikrina.
8. Patikrinti abu Gmail laiškus, telefono ekrano išdėstymą ir viešą Vercel adresą privačiame naršyklės lange.

## Trumpas tekstas Notion puslapiui

**Patalpų gedimų registras** – baigiamasis projektas, skirtas registruoti savo patalpų gedimus ir išskirti skubius atvejus.

Technologijos: React, Vite, Supabase Auth ir PostgreSQL su RLS, Vercel, Zapier bei Gmail.
Duomenys: vartotojas turi patalpas (`rooms`); patalpa turi gedimus (`faults`). Prioritetas – `normal` arba `high`.
RLS apriboja prieigą patalpų savininkui. Supabase kliento viešas raktas naudojamas su prisijungusio vartotojo sesija.
Naujo gedimo INSERT perduodamas į Zapier; pagal prioritetą Gmail išsiunčia laišką savininkui.

Prieš pateikimą papildyti: GitHub saugyklos adresas, 3 sujungtų PR adresai, viešas Vercel adresas, Auth / RLS bandymų rezultatai ir abiejų prioritetų laiškų ekrano vaizdai.
