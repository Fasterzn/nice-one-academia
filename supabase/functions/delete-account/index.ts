/**
 * Exclusão da própria conta (LGPD).
 *
 * O aluno chama esta função com o próprio JWT. A service_role fica só aqui,
 * como variável de ambiente da função — nunca no front-end.
 * O `on delete cascade` de public.profiles apaga o perfil junto.
 *
 * Deploy:  supabase functions deploy delete-account
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';

const ORIGENS_PERMITIDAS = new Set([
  'https://niceone.com.br',
  'https://www.niceone.com.br',
  'http://localhost:5173',
]);

function cabecalhosCors(origem: string | null) {
  const permitida = origem && ORIGENS_PERMITIDAS.has(origem) ? origem : 'https://niceone.com.br';
  return {
    'Access-Control-Allow-Origin': permitida,
    'Access-Control-Allow-Headers': 'authorization, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
}

function json(corpo: unknown, status: number, origem: string | null) {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { ...cabecalhosCors(origem), 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  const origem = req.headers.get('Origin');

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cabecalhosCors(origem) });
  }
  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405, origem);
  }
  // Só aceita chamada vinda das origens conhecidas.
  if (origem && !ORIGENS_PERMITIDAS.has(origem)) {
    return json({ error: 'origin_not_allowed' }, 403, origem);
  }

  const autorizacao = req.headers.get('Authorization') ?? '';
  const token = autorizacao.startsWith('Bearer ') ? autorizacao.slice(7) : '';
  if (!token) {
    return json({ error: 'missing_token' }, 401, origem);
  }

  const url = Deno.env.get('SUPABASE_URL');
  const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceRole) {
    return json({ error: 'server_misconfigured' }, 500, origem);
  }

  const admin = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Valida o JWT: quem é o dono da sessão que está chamando?
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) {
    return json({ error: 'invalid_token' }, 401, origem);
  }

  // Apaga somente a própria conta — o id vem do token, nunca do corpo da chamada.
  const { error: erroExclusao } = await admin.auth.admin.deleteUser(data.user.id);
  if (erroExclusao) {
    return json({ error: 'delete_failed' }, 500, origem);
  }

  return json({ ok: true }, 200, origem);
});
