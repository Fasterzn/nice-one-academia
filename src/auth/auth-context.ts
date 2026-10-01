import { createContext } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import type { Profile } from '../types/database.types';
import type { Aal } from './api';

export type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  aal: Aal;
  /** Buscando perfil ou nível de garantia. */
  loading: boolean;
  /** A primeira leitura da sessão já terminou. Só então dá para redirecionar. */
  initialized: boolean;
  /** Recarrega perfil e AAL (ex.: depois de ativar 2FA). */
  refresh: () => Promise<void>;
  setProfile: (profile: Profile) => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
