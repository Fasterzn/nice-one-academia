import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import type { Profile } from '../types/database.types';
import { buscarPerfil, nivelDeGarantia, type Aal } from './api';
import { AuthContext, type AuthContextValue } from './auth-context';

const AAL_VAZIO: Aal = { currentLevel: null, nextLevel: null };

/**
 * Existe sessão guardada neste navegador?
 * Serve para não baixar o supabase-js (≈200 kB) para quem só está visitando
 * o site público e nunca entrou.
 */
function temSessaoGuardada(): boolean {
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const chave = localStorage.key(i);
      if (chave?.startsWith('sb-') && chave.includes('-auth-token')) return true;
    }
  } catch {
    // Navegação privada pode bloquear o acesso: assume que não há sessão.
  }
  return false;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [perfilCarregado, setPerfilCarregado] = useState<Profile | null>(null);
  const [aalCarregado, setAalCarregado] = useState<Aal>(AAL_VAZIO);
  /** Usuário cujo perfil já terminou de carregar — usado para derivar `loading`. */
  const [perfilDe, setPerfilDe] = useState<string | null>(null);
  // Sem configuração não há sessão a esperar: já nasce inicializado.
  const [initialized, setInitialized] = useState(!isSupabaseConfigured);
  const [chaveDeRecarga, setChaveDeRecarga] = useState(0);

  const userId = session?.user.id ?? null;
  const accessToken = session?.access_token ?? null;

  // Sem sessão, perfil e AAL são vazios por derivação — nada de limpar em efeito.
  const profile = userId ? perfilCarregado : null;
  const aal = accessToken ? aalCarregado : AAL_VAZIO;
  const loading = Boolean(userId) && perfilDe !== userId;

  // Na home sem sessão guardada, a autenticação nem é carregada.
  const { pathname } = useLocation();
  const precisaDeAuth = pathname !== '/' || temSessaoGuardada();

  // Sessão: lê uma vez e depois só escuta. Uma única inscrição, mesmo em StrictMode.
  useEffect(() => {
    if (!isSupabaseConfigured || !precisaDeAuth) return;

    let cancelado = false;
    let inscricao: { unsubscribe: () => void } | null = null;

    getSupabase()
      .then(async (supabase) => {
        const { data } = await supabase.auth.getSession();
        if (cancelado) return;

        setSession(data.session);
        setInitialized(true);

        const { data: assinatura } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
          // Nada de await aqui dentro: só atualiza o estado.
          // O perfil e o AAL são buscados nos efeitos abaixo.
          setSession(novaSessao);
        });

        inscricao = assinatura.subscription;
        if (cancelado) inscricao.unsubscribe();
      })
      .catch(() => {
        if (!cancelado) setInitialized(true);
      });

    return () => {
      cancelado = true;
      inscricao?.unsubscribe();
    };
  }, [precisaDeAuth]);

  // Perfil: reage à troca de usuário.
  useEffect(() => {
    if (!userId) return;

    let ativo = true;

    buscarPerfil(userId)
      .then((dados) => {
        if (ativo) setPerfilCarregado(dados);
      })
      .catch(() => {
        // Perfil indisponível não derruba a sessão; as telas tratam o nulo.
        if (ativo) setPerfilCarregado(null);
      })
      .finally(() => {
        if (ativo) setPerfilDe(userId);
      });

    return () => {
      ativo = false;
    };
  }, [userId, chaveDeRecarga]);

  // Nível de garantia: muda quando o token muda (ex.: após confirmar o 2FA).
  useEffect(() => {
    if (!accessToken) return;

    let ativo = true;
    nivelDeGarantia()
      .then((nivel) => {
        if (ativo) setAalCarregado(nivel);
      })
      .catch(() => {
        if (ativo) setAalCarregado(AAL_VAZIO);
      });

    return () => {
      ativo = false;
    };
  }, [accessToken, chaveDeRecarga]);

  const refresh = useCallback(async () => {
    setChaveDeRecarga((valor) => valor + 1);
  }, []);

  const valor = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      aal,
      loading,
      initialized: initialized || !precisaDeAuth,
      refresh,
      setProfile: setPerfilCarregado,
    }),
    [session, profile, aal, loading, initialized, precisaDeAuth, refresh],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
