import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useUnitPicker } from './unit-picker-context';
import './WhatsAppFab.css';

/** Botão flutuante — fica oculto enquanto o Hero está visível. */
export function WhatsAppFab() {
  // Sem IntersectionObserver o botão fica sempre disponível.
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined');
  const { open } = useUnitPicker();

  useEffect(() => {
    const hero = document.getElementById('inicio');
    if (!hero || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry?.isIntersecting),
      { threshold: 0.25 },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <button
      type="button"
      className={`fab ${visible ? 'fab--in' : ''}`}
      onClick={() => open()}
      aria-label="Falar com a Nice One no WhatsApp"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
    >
      <MessageCircle size={22} aria-hidden="true" />
      <span className="fab__label">Falar com a Nice One</span>
    </button>
  );
}
