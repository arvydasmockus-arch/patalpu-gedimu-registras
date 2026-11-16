import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export default function Register({ session }) {
  const [rooms, setRooms] = useState([]);
  const [faults, setFaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [revision, setRevision] = useState(0);
  const [screen, setScreen] = useState('list');
  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      supabase.from('rooms').select('id,name').order('name'),
      supabase.from('faults').select('id,room_id,title,priority'),
    ]).then(([r, f]) => {
      if (!active) return;
      if (r.error || f.error) throw r.error || f.error;
      setRooms(r.data); setFaults(f.data); setError('');
    }).catch(error => { if (active) setError(`Nepavyko įkelti duomenų: ${error.message}`); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [revision]);
  async function save(event, table) {
    event.preventDefault();
    const element = event.currentTarget;
    const form = new FormData(element);
    const value = String(form.get(table === 'rooms' ? 'name' : 'title')).trim();
    if (!value) { setError('Įrašykite pavadinimą.'); return; }
    setBusy(true); setError(''); setNotice('');
    try {
      const row = table === 'rooms' ? { name: value } : { room_id: form.get('room_id'), title: value, priority: form.get('priority') };
      const { error } = await supabase.from(table).insert(row);
      if (error) throw error;
      element.reset();
      setNotice(table === 'rooms' ? 'Patalpa pridėta.' : 'Gedimas užregistruotas.');
      setRevision(value => value + 1);
    } catch (error) { setError(`Nepavyko išsaugoti: ${error.message}`); }
    finally { setBusy(false); }
  }
  async function signOut() {
    setBusy(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) { setError(`Nepavyko atsijungti: ${error.message}`); }
    finally { setBusy(false); }
  }
  return <>
    <div className="account"><span>{session.user.user_metadata?.username || session.user.email?.split('@')[0]}</span><button className="secondary" disabled={busy} onClick={signOut}>Atsijungti</button></div>
    <nav aria-label="Programos ekranai"><button className="secondary" aria-pressed={screen === 'list'} onClick={() => setScreen('list')}>Mano sąrašas</button>{' '}<button className="secondary" aria-pressed={screen === 'create'} onClick={() => setScreen('create')}>Kurti įrašą</button></nav>
    {error && <div role="alert" className="error"><p>{error}</p><button disabled={loading || busy} onClick={() => setRevision(value => value + 1)}>Bandyti dar kartą</button></div>}<p role="status">{notice}</p>
    <div hidden={screen !== 'create'}><section><h2>Pridėti patalpą</h2><form onSubmit={event => save(event, 'rooms')}>
      <label>Patalpos pavadinimas<input name="name" placeholder="Pvz., Kabinetas 212" maxLength={120} required /></label>
      <button disabled={busy || loading}>Pridėti patalpą</button>
    </form></section>
    <section><h2>Registruoti gedimą</h2>
      {!loading && !rooms.length && <p>Pirmiausia pridėkite patalpą.</p>}
      <form onSubmit={event => save(event, 'faults')}>
        <label>Patalpa<select name="room_id" required disabled={!rooms.length} defaultValue=""><option value="" disabled>Pasirinkite patalpą</option>{rooms.map(room => <option key={room.id} value={room.id}>{room.name}</option>)}</select></label>
        <label>Gedimo aprašymas<input name="title" placeholder="Pvz., neveikia apšvietimas" maxLength={500} required /></label>
        <label>Prioritetas<select name="priority"><option value="normal">Įprastas</option><option value="high">Skubus</option></select></label>
        <p>Skubus: trūko vamzdis, teka vanduo arba sugedusi spyna neleidžia patekti į patalpą ar jos užrakinti.</p>
        <button disabled={busy || loading || !rooms.length}>Registruoti gedimą</button>
      </form>
    </section></div>
    <section hidden={screen !== 'list'}><h2>Mano patalpos ir gedimai</h2><button className="secondary" disabled={loading || busy} onClick={() => setRevision(value => value + 1)}>Atnaujinti sąrašą</button>
      {loading ? <p role="status">Įkeliama…</p> : !rooms.length ? <p>Patalpų dar nėra.</p> : rooms.map(room => {
        const items = faults.filter(fault => fault.room_id === room.id);
        return <article key={room.id}><h3>{room.name}</h3>{!items.length ? <p>Gedimų nėra.</p> : <ul>{items.map(fault => <li key={fault.id}><span className={fault.priority === 'high' ? 'badge urgent' : 'badge'}>{fault.priority === 'high' ? 'Skubus' : 'Įprastas'}</span> {fault.title}</li>)}</ul>}</article>;
      })}
    </section>
  </>;
}
