import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

/**
 * Diz se a Área do Aluno pode funcionar. É avaliado sem carregar o supabase-js,
 * para que o site público não pague por isso.
 */
export const isSupabaseConfigured = Boolean(url && publishableKey);

if (!isSupabaseConfigured && import.meta.env.DEV) {
  // Só em desenvolvimento, e sem dado de usuário nenhum.
  console.error(
    '[Nice One] VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY não estão definidos em .env.local. ' +
      'A Área do Aluno fica indisponível; o site público continua funcionando.',
  );
}

export type NiceOneClient = SupabaseClient<Database>;

let clientPromise: Promise<NiceOneClient> | null = null;

/**
 * Cliente único, criado uma vez e sob demanda.
 *
 * O import é dinâmico de propósito: assim o supabase-js fica num chunk separado
 * e não entra no bundle inicial do site público.
 */
export function getSupabase(): Promise<NiceOneClient> {
  if (!isSupabaseConfigured) {
    return Promise.reject(new Error('SUPABASE_NAO_CONFIGURADO'));
  }

  clientPromise ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient<Database>(url as string, publishableKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // Nenhum fluxo depende de link: todo e-mail manda código de 6 dígitos.
        detectSessionInUrl: false,
        flowType: 'pkce',
      },
    }),
  );

  return clientPromise;
}

/** URL da Edge Function de exclusão de conta. */
export function functionsUrl(name: string): string {
  return `${(url as string).replace(/\/$/, '')}/functions/v1/${name}`;
}
