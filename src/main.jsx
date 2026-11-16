import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { supabase } from './supabase';
import './style.css';
import Auth from './Auth';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(Boolean(supabase));
  useEffect(() => {
    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next); setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);
  return (
    <main>
      <h1>Patalpų gedimų registras</h1>
      <p>Čia galėsite registruoti patalpų gedimus ir pažymėti, kuriuos reikia spręsti skubiai.</p>
      {!supabase ? <p role="alert">Įrašykite Supabase URL ir viešą kliento raktą į .env.local pagal .env.example.</p>
        : loading ? <p role="status">Tikrinamas prisijungimas…</p>
        : session ? <SignedIn session={session} /> : <Auth />}
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);

function SignedIn({ session }) {
  const [error, setError] = useState('');
  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) setError(error.message);
  }
  return <section><p>Prisijungta: {session.user.email}</p><button onClick={signOut}>Atsijungti</button>{error && <p role="alert">{error}</p>}</section>;
}
