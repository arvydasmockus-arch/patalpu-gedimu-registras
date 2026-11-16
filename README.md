# Patalpų gedimų registras

Baigiamasis projektas. Vartotojas registruoja įprastus arba skubius gedimus savo patalpose. Apie naują gedimą projekto savininkas gaus laišką.

## Paleidimas

Reikia Node.js 20.19+ arba 22.12+.

```sh
npm install
npm run dev
```

Duomenų bazės schema yra `supabase/001_initial.sql`. Ją paleiskite šio projekto Supabase SQL Editor. Prisijungimo integracijai nukopijuokite `.env.example` į `.env.local` ir įrašykite projekto URL bei viešą kliento raktą.

## Apimtis

- `rooms` – vartotojo patalpos.
- `faults` – pasirinktos patalpos gedimai. Prioritetas `normal` arba `high`.
- Naujas gedimas sukuria vieną įrašą `faults` lentelėje. Planuojamas Supabase INSERT webhook → Zapier Filter → Paths → Gmail.

