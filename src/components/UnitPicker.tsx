import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { X, MessageCircle, MapPin } from 'lucide-react';
import { units, unitLocation } from '../data/units';
import { whatsappLink } from '../utils/whatsapp';
import { UnitPickerContext } from './unit-picker-context';
import './UnitPicker.css';

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function UnitPickerProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const open = useCallback((contextMessage?: string) => {
    openerRef.current = document.activeElement as HTMLElement | null;
    setMessage(contextMessage);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Devolve o foco ao botão que abriu o seletor.
    openerRef.current?.focus();
  }, []);

  // Bloqueia o scroll do body, prende o foco e fecha com ESC.
  useEffect(() => {
    if (!isOpen) return;

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    const dialog = dialogRef.current;
    dialog?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== 'Tab' || !dialog) return;

      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [isOpen, close]);

  const value = useMemo(() => ({ open }), [open]);

  return (
    <UnitPickerContext.Provider value={value}>
      {children}

      {isOpen && (
        <div className="picker" role="presentation" onClick={close}>
          <div
            className="picker__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="picker-title"
            ref={dialogRef}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="picker__head">
              <h2 className="picker__title" id="picker-title">
                Qual unidade fica melhor para você?
              </h2>
              <button type="button" className="picker__close" onClick={close} aria-label="Fechar">
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <ul className="picker__list">
              {units.map((unit) => (
                <li key={unit.id}>
                  <a
                    className="picker__item"
                    href={whatsappLink(unit, message)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={close}
                  >
                    <span className="picker__item-main">
                      <span className="picker__item-name">{unit.name}</span>
                      <span className="picker__item-place">
                        <MapPin size={13} aria-hidden="true" />
                        {unit.neighborhood ?? unitLocation(unit)}
                      </span>
                    </span>
                    <span className="picker__item-action">
                      <MessageCircle size={18} aria-hidden="true" />
                    </span>
                    <span className="visually-hidden">— abrir WhatsApp em nova aba</span>
                  </a>
                </li>
              ))}
            </ul>

            <p className="picker__note">A conversa abre direto no WhatsApp da unidade.</p>
          </div>
        </div>
      )}
    </UnitPickerContext.Provider>
  );
}
