import { useState } from 'react';
import { supabase } from './supabase';

export default function Auth() {
  const [register, setRegister] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true); setMessage('');
    try {
      const username = form.get('username').trim().toLowerCase();
      const credentials = { email: `${username}@users.patalpu-registras.invalid`, password: form.get('password') };
      const { data, error } = register ? await supabase.auth.signUp({ ...credentials, options: { data: { username } } }) : await supabase.auth.signInWithPassword(credentials);
      if (error) throw error;
      if (register && !data.session) setMessage('Registracija dar neparuošta. Kreipkitės į projekto administratorių.');
    } catch (error) {
      setMessage(error.code === 'invalid_credentials' ? 'Neteisingas vartotojo vardas arba slaptažodis.' : error.code === 'user_already_exists' ? 'Šis vartotojo vardas jau užimtas.' : 'Nepavyko prisijungti arba sukurti paskyros. Patikrinkite duomenis ir bandykite dar kartą.');
    }
    finally { setBusy(false); }
  }
  return <section><h2>{register ? 'Registracija' : 'Prisijungimas'}</h2>
    <form onSubmit={submit}>
      <label>Vartotojo vardas<input name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} pattern={'[A-Za-z0-9._\\-]{3,24}'} minLength={3} maxLength={24} title="3–24 lotyniškos raidės, skaičiai, taškas, brūkšnelis arba pabraukimas" placeholder="Pvz., jonas" required /></label>
      <label>Slaptažodis<input name="password" type="password" minLength={6} autoComplete={register ? 'new-password' : 'current-password'} required /></label>
      <button disabled={busy}>{busy ? 'Palaukite…' : register ? 'Registruotis' : 'Prisijungti'}</button>
    </form>
    <button className="secondary" disabled={busy} onClick={() => { setRegister(!register); setMessage(''); }}>{register ? 'Jau turiu paskyrą' : 'Sukurti paskyrą'}</button>
    <p role="status">{message}</p>
  </section>;
}
