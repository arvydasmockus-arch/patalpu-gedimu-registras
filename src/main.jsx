import { createRoot } from 'react-dom/client';
import './style.css';

function App() {
  return (
    <main>
      <h1>Patalpų gedimų registras</h1>
      <p>Čia galėsite registruoti patalpų gedimus ir pažymėti, kuriuos reikia spręsti skubiai.</p>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);

