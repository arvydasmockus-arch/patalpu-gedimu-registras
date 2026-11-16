import { useEffect, useState } from 'react';
import { supabase } from './supabase';

const pages = [
  { path: '/gedimai', name: 'Gedimų registras', hint: 'Peržiūrėti gedimus ir jų būsenas' },
  { path: '/registruoti', name: 'Registruoti gedimą', hint: 'Pranešti apie naują gedimą' },
  { path: '/patalpos', name: 'Patalpos', hint: 'Peržiūrėti ir pridėti kabinetus' },
];

export default function Register({ session }) {
  const path = window.location.pathname.replace(/\/$/, '') || '/gedimai';
  const [rooms, setRooms] = useState([]);
  const [faults, setFaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [revision, setRevision] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    Promise.all([
      supabase.from('rooms').select('id,name').order('name'),
      supabase.from('faults').select('id,room_id,title,priority,status').order('title'),
    ]).then(([r, f]) => {
      if (!active) return;
      if (r.error || f.error) throw r.error || f.error;
      setRooms(r.data); setFaults(f.data);
    }).catch(error => { if (active) setError(`Nepavyko įkelti duomenų: ${error.message}`); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [revision]);

  async function save(event, table) {
    event.preventDefault();
    const element = event.currentTarget;
    const form = new FormData(element);
    const value = String(form.get(table === 'rooms' ? 'name' : 'title')).trim();
    if (!value) { setNotice(''); setError('Įrašykite pavadinimą.'); return; }
    setBusy(true); setError(''); setNotice('');
    try {
      const row = table === 'rooms' ? { name: value } : { room_id: form.get('room_id'), title: value, priority: form.get('priority') };
      const { error } = await supabase.from(table).insert(row);
      if (error) throw error;
      element.reset();
      setNotice(table === 'rooms' ? 'Patalpa pridėta. Dabar galite joje registruoti gedimą.' : 'Gedimas užregistruotas. Jį rasite gedimų registre.');
      setRevision(value => value + 1);
    } catch (error) { setError(`Nepavyko išsaugoti: ${error.message}`); }
    finally { setBusy(false); }
  }

  async function changeStatus(fault) {
    const status = fault.status === 'resolved' ? 'registered' : 'resolved';
    setBusy(true); setError(''); setNotice('');
    try {
      const { error } = await supabase.from('faults').update({ status }).eq('id', fault.id).select('id').single();
      if (error) throw error;
      setFaults(items => items.map(item => item.id === fault.id ? { ...item, status } : item));
      setNotice(status === 'resolved' ? 'Gedimas pažymėtas kaip sutvarkytas. Jį rasite pasirinkę „Sutvarkyti“ arba „Visi“.' : 'Gedimas vėl pažymėtas kaip užregistruotas.');
    } catch (error) { setError(`Nepavyko pakeisti būsenos: ${error.message}`); }
    finally { setBusy(false); }
  }

  async function deleteFault(fault) {
    if (!window.confirm(`Ištrinti gedimą „${fault.title}“? Šio veiksmo atšaukti negalima.`)) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const { error } = await supabase.from('faults').delete().eq('id', fault.id).select('id').single();
      if (error) throw error;
      setFaults(items => items.filter(item => item.id !== fault.id));
      setNotice('Gedimas ištrintas.');
    } catch (error) { setError(`Nepavyko ištrinti gedimo: ${error.message}`); }
    finally { setBusy(false); }
  }

  async function deleteRoom(room) {
    const faultCount = faults.filter(fault => fault.room_id === room.id).length;
    const consequence = faultCount ? ` Taip pat bus ištrinti visi ${faultCount} šios patalpos gedimai.` : '';
    if (!window.confirm(`Ištrinti patalpą „${room.name}“?${consequence} Šio veiksmo atšaukti negalima.`)) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const { error } = await supabase.from('rooms').delete().eq('id', room.id).select('id').single();
      if (error) throw error;
      setRooms(items => items.filter(item => item.id !== room.id));
      setFaults(items => items.filter(item => item.room_id !== room.id));
      setNotice(faultCount ? 'Patalpa ir visi jos gedimai ištrinti.' : 'Patalpa ištrinta.');
    } catch (error) { setError(`Nepavyko ištrinti patalpos: ${error.message}`); }
    finally { setBusy(false); }
  }

  async function signOut() {
    setBusy(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.assign('/prisijungimas');
    } catch (error) { setError(`Nepavyko atsijungti: ${error.message}`); }
    finally { setBusy(false); }
  }

  const unresolved = faults.filter(fault => fault.status !== 'resolved').length;
  const visibleFaults = faults.filter(fault => statusFilter === 'all' || fault.status === statusFilter);
  return <>
    <div className="account"><span>{session.user.user_metadata?.username || session.user.email?.split('@')[0]}</span><button className="secondary" disabled={busy} onClick={signOut}>Atsijungti</button></div>
    <nav className="tabs" aria-label="Programos puslapiai">{pages.map(page => <a key={page.path} href={page.path} aria-current={path === page.path ? 'page' : undefined}><strong>{page.name}</strong><span>{page.hint}</span></a>)}</nav>
    {error && <div role="alert" className="error"><p>{error}</p><button disabled={loading || busy} onClick={() => setRevision(value => value + 1)}>Bandyti dar kartą</button></div>}
    {notice && <p role="status" className="success">{notice}</p>}
    {loading && <p role="status">Įkeliama…</p>}

    {path === '/gedimai' && <section aria-labelledby="register-title">
      <div className="section-heading"><h2 id="register-title">Gedimų registras</h2><button className="secondary" disabled={loading || busy} onClick={() => setRevision(value => value + 1)}>Atnaujinti sąrašą</button></div>
      <p>Čia matote savo patalpų gedimus ir ar jie jau sutvarkyti.</p>
      {!loading && !error && (!faults.length ? <div className="empty"><p>Gedimų dar nėra.</p><a href={rooms.length ? '/registruoti' : '/patalpos'}>{rooms.length ? 'Registruoti pirmą gedimą' : 'Pirmiausia pridėti patalpą'}</a></div> : <>
        <p className="summary">Užregistruota: <strong>{unresolved}</strong> · Sutvarkyta: <strong>{faults.length - unresolved}</strong></p>
        <div className="status-filters" role="group" aria-label="Filtruoti pagal gedimo būseną">{[
          { value: 'all', label: 'Visi', count: faults.length },
          { value: 'registered', label: 'Užregistruoti', count: unresolved },
          { value: 'resolved', label: 'Sutvarkyti', count: faults.length - unresolved },
        ].map(filter => <button key={filter.value} className="secondary" aria-pressed={statusFilter === filter.value} onClick={() => setStatusFilter(filter.value)}>{filter.label} ({filter.count})</button>)}</div>
        {!visibleFaults.length && <p className="empty">Šioje būsenoje gedimų nėra. Visus įrašus matysite pasirinkę „Visi“.</p>}
        <ul className="fault-list">{[...visibleFaults].sort((a, b) => Number(b.priority === 'high') - Number(a.priority === 'high')).map(fault => <li className="fault" key={fault.id}>
          <div className="fault-tags"><span className={fault.priority === 'high' ? 'badge urgent' : 'badge'}>{fault.priority === 'high' ? 'Skubus' : 'Įprastas'}</span><span className={fault.status === 'resolved' ? 'badge resolved' : 'badge pending'}>{fault.status === 'resolved' ? 'Sutvarkyta' : 'Užregistruota'}</span></div>
          <h3>{fault.title}</h3><p>{rooms.find(room => room.id === fault.room_id)?.name}</p>
          <div className="card-actions"><button className="secondary" disabled={busy} onClick={() => changeStatus(fault)}>{fault.status === 'resolved' ? 'Atverti iš naujo' : 'Pažymėti sutvarkytu'}</button><button className="danger" disabled={busy} onClick={() => deleteFault(fault)}>Ištrinti</button></div>
        </li>)}</ul>
      </>)}
    </section>}

    {path === '/registruoti' && <section aria-labelledby="create-title"><h2 id="create-title">Registruoti gedimą</h2>
      <p>Pasirinkite kabinetą ir trumpai aprašykite, kas sugedę.</p>
      {!loading && !error && (!rooms.length ? <div className="empty"><p>Pirmiausia pridėkite patalpą, kurioje registruosite gedimą.</p><a href="/patalpos">Atidaryti patalpas</a></div> : <form onSubmit={event => save(event, 'faults')}>
        <label>Patalpa<select name="room_id" required defaultValue=""><option value="" disabled>Pasirinkite patalpą</option>{rooms.map(room => <option key={room.id} value={room.id}>{room.name}</option>)}</select></label>
        <label>Gedimo aprašymas<input name="title" placeholder="Pvz., neveikia projektorius" maxLength={500} required /></label>
        <label>Prioritetas<select name="priority"><option value="normal">Įprastas</option><option value="high">Skubus</option></select></label>
        <p className="hint">Skubus: trūko vamzdis, teka vanduo arba sugedusi spyna neleidžia patekti į patalpą ar jos užrakinti.</p>
        <button disabled={busy}>Registruoti gedimą</button>
      </form>)}
      <p><a href="/gedimai">Peržiūrėti gedimų registrą</a></p>
    </section>}

    {path === '/patalpos' && <>
      <section aria-labelledby="rooms-title"><h2 id="rooms-title">Mano patalpos</h2><p>Pridėkite kabinetus, kuriuose norėsite registruoti gedimus.</p>
        {!loading && !error && (!rooms.length ? <p className="empty">Patalpų dar nėra. Pridėkite pirmą patalpą žemiau.</p> : <ul className="room-list">{rooms.map(room => <li key={room.id}><strong>{room.name}</strong><span>Gedimų: {faults.filter(fault => fault.room_id === room.id).length}</span><button className="danger" disabled={busy} onClick={() => deleteRoom(room)}>Ištrinti</button></li>)}</ul>)}
      </section>
      <section aria-labelledby="room-create-title"><h2 id="room-create-title">Pridėti patalpą</h2><form onSubmit={event => save(event, 'rooms')}>
        <label>Patalpos pavadinimas<input name="name" placeholder="Pvz., Kabinetas 212" maxLength={120} required /></label>
        <button disabled={busy || loading}>Pridėti patalpą</button>
      </form><p><a href="/registruoti">Registruoti gedimą patalpoje</a></p></section>
    </>}
    {!pages.some(page => page.path === path) && <section><h2>Puslapis nerastas</h2><a href="/gedimai">Atidaryti gedimų registrą</a></section>}
  </>;
}
