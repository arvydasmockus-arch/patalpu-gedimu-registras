import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { supabase } from './supabase';
import './style.css';
import Auth from './Auth';
import Register from './Register';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(Boolean(supabase));
  useEffect(() => {
    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => {
      if (next && ['/', '/prisijungimas', '/prisijungimas/'].includes(window.location.pathname)) window.history.replaceState(null, '', '/gedimai');
      setSession(next); setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);
  return (
    <main>
      <h1>Patalpų gedimų registras</h1>
      <p>Praneškite apie gedimą, pažymėkite skubumą ir stebėkite, kas jau sutvarkyta.</p>
      {!supabase ? <p role="alert">Įrašykite Supabase URL ir viešą kliento raktą į .env.local pagal .env.example.</p>
        : loading ? <p role="status">Tikrinamas prisijungimas…</p>
        : session ? <Register key={session.user.id} session={session} /> : <Auth />}
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);

