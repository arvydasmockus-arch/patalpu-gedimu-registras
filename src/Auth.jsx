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
      const credentials = { email: form.get('email').trim(), password: form.get('password') };
      const { data, error } = register ? await supabase.auth.signUp(credentials) : await supabase.auth.signInWithPassword(credentials);
      if (error) throw error;
      if (register && !data.session) setMessage('Patikrinkite el. paštą ir patvirtinkite registraciją.');
    } catch (error) { setMessage(`Nepavyko: ${error.message}`); }
    finally { setBusy(false); }
  }
  return <section><h2>{register ? 'Registracija' : 'Prisijungimas'}</h2>
    <form onSubmit={submit}>
      <label>El. paštas<input name="email" type="email" autoComplete="email" required /></label>
      <label>Slaptažodis<input name="password" type="password" minLength={8} autoComplete={register ? 'new-password' : 'current-password'} required /></label>
      <button disabled={busy}>{busy ? 'Palaukite…' : register ? 'Registruotis' : 'Prisijungti'}</button>
    </form>
    <button className="secondary" disabled={busy} onClick={() => { setRegister(!register); setMessage(''); }}>{register ? 'Jau turiu paskyrą' : 'Sukurti paskyrą'}</button>
    <p role="status">{message}</p>
  </section>;
}

