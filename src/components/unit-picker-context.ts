import { createContext, useContext } from 'react';

export type UnitPickerContextValue = {
  /** Abre o seletor de unidade com a mensagem de WhatsApp do contexto. */
  open: (message?: string) => void;
};

export const UnitPickerContext = createContext<UnitPickerContextValue | null>(null);

export function useUnitPicker(): UnitPickerContextValue {
  const context = useContext(UnitPickerContext);
  if (!context) throw new Error('useUnitPicker precisa estar dentro de <UnitPickerProvider>.');
  return context;
}
