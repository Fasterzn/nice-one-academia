/**
 * Único lugar do app que fala com o Supabase Auth.
 * Nenhum componente chama supabase.auth.* diretamente.
 */
import { getSupabase, functionsUrl } from '../lib/supabase';
import type { Profile, ProfileUpdate } from '../types/database.types';

export type FluxoCodigo = 'signup' | 'email' | 'recovery' | 'email_change';

export type DadosCadastro = {
  fullName: string;
  email: string;
  phone: string;
  preferredUnit: number | null;
  password: string;
  marketingOptIn: boolean;
};

export type Aal = {
  currentLevel: string | null;
  nextLevel: string | null;
};

/** Levanta o erro do Supabase para quem chamou traduzir. */
function lancar(erro: unknown): never {
  throw erro;
}

// ---------------------------------------------------------------- cadastro --

export async function cadastrar(dados: DadosCadastro): Promise<void> {
  const supabase = await getSupabase();
  const { error } = await supabase.auth.signUp({
    email: dados.email,
    password: dados.password,
    options: {
      data: {
        full_name: dados.fullName,
        phone: dados.phone || null,
        preferred_unit: dados.preferredUnit,
        marketing_opt_in: dados.marketingOptIn,
        terms_accepted_at: new Date().toISOString(),
      },
    },
  });
  if (error) lancar(error);
}

// -------------------------------------------------------------- código OTP --

export async function verificarCodigo(
  email: string,
  token: string,
  type: FluxoCodigo,
): Promise<void> {
  const supabase = await getSupabase();
  const { error } = await supabase.auth.verifyOtp({ email, token, type });
  if (error) lancar(error);
}

export async function enviarCodigoDeLogin(email: string): Promise<void> {
  const supabase = await getSupabase();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    // Login nunca cria conta: quem não tem cadastro vai pelo /cadastro.
    options: { shouldCreateUser: false },
  });
  if (error) lancar(error);
}

export async function reenviarCodigo(type: FluxoCodigo, email: string): Promise<void> {
  const supabase = await getSupabase();

  // "recovery" e "email" não são aceitos por resend: repetimos a ação de origem.
  if (type === 'recovery') {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) lancar(error);
    return;
  }

  if (type === 'email') {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
    if (error) lancar(error);
    return;
  }

  const { error } = await supabase.auth.resend({ type, email });
  if (error) lancar(error);
}

// ----------------------------------------------------------------- entrada --

export async function entrarComSenha(email: string, password: string): Promise<void> {
  const supabase = await getSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) lancar(error);
}

export async function pedirRedefinicaoDeSenha(email: string): Promise<void> {
  const supabase = await getSupabase();
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) lancar(error);
}

export async function sair(scope: 'local' | 'global' = 'local'): Promise<void> {
  const supabase = await getSupabase();
  const { error } = await supabase.auth.signOut({ scope });
  if (error) lancar(error);
}

// ------------------------------------------------------------ conta/sessão --

export async function trocarSenha(password: string): Promise<void> {
  const supabase = await getSupabase();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) lancar(error);
}

export async function trocarEmail(email: string): Promise<void> {
  const supabase = await getSupabase();
  const { error } = await supabase.auth.updateUser({ email });
  if (error) lancar(error);
}

/** Reautentica com a senha atual antes de uma ação sensível. */
export async function confirmarSenhaAtual(email: string, password: string): Promise<void> {
  const supabase = await getSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) lancar(error);
}

// ------------------------------------------------------------------ perfil --

export async function buscarPerfil(userId: string): Promise<Profile | null> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) lancar(error);
  return data;
}

export async function salvarPerfil(userId: string, dados: ProfileUpdate): Promise<Profile> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('profiles')
    .update(dados)
    .eq('id', userId)
    .select()
    .single();
  if (error) lancar(error);
  return data;
}

// ------------------------------------------------------------- dois fatores --

export async function nivelDeGarantia(): Promise<Aal> {
  const supabase = await getSupabase();
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error) lancar(error);
  return { currentLevel: data?.currentLevel ?? null, nextLevel: data?.nextLevel ?? null };
}

export type FatorTotp = { id: string; friendlyName: string; status: string };

export async function listarFatores(): Promise<FatorTotp[]> {
  const supabase = await getSupabase();
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error) lancar(error);
  return (data?.all ?? [])
    .filter((fator) => fator.factor_type === 'totp')
    .map((fator) => ({
      id: fator.id,
      friendlyName: fator.friendly_name ?? 'App autenticador',
      status: fator.status,
    }));
}

export type NovoFator = { factorId: string; qrSvg: string; secret: string };

/**
 * Inicia o cadastro do app autenticador.
 * Remove fatores não verificados antes, para não esbarrar em nome duplicado
 * quando o aluno desistiu no meio de uma tentativa anterior.
 */
export async function iniciarTotp(): Promise<NovoFator> {
  const supabase = await getSupabase();

  const { data: existentes } = await supabase.auth.mfa.listFactors();
  for (const fator of existentes?.all ?? []) {
    if (fator.factor_type === 'totp' && fator.status !== 'verified') {
      await supabase.auth.mfa.unenroll({ factorId: fator.id });
    }
  }

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    friendlyName: `App autenticador ${Date.now()}`,
  });
  if (error) lancar(error);

  return {
    factorId: data.id,
    qrSvg: data.totp.qr_code,
    secret: data.totp.secret,
  };
}

export async function confirmarTotp(factorId: string, code: string): Promise<void> {
  const supabase = await getSupabase();
  const { data: desafio, error: erroDesafio } = await supabase.auth.mfa.challenge({ factorId });
  if (erroDesafio) lancar(erroDesafio);

  const { error } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: desafio.id,
    code,
  });
  if (error) lancar(error);
}

export async function removerTotp(factorId: string): Promise<void> {
  const supabase = await getSupabase();
  const { error } = await supabase.auth.mfa.unenroll({ factorId });
  if (error) lancar(error);
}

// ---------------------------------------------------------------- exclusão --

export async function excluirConta(): Promise<void> {
  const supabase = await getSupabase();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('SEM_SESSAO');

  const resposta = await fetch(functionsUrl('delete-account'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!resposta.ok) {
    const corpo = (await resposta.json().catch(() => ({}))) as { error?: string };
    throw Object.assign(new Error(corpo.error ?? 'FALHA_EXCLUSAO'), {
      status: resposta.status,
    });
  }
}

// ------------------------------------------------------------------- admin --

export type PaginaDeAlunos = { alunos: Profile[]; total: number };

export async function listarAlunos(
  busca: string,
  pagina: number,
  porPagina: number,
): Promise<PaginaDeAlunos> {
  const supabase = await getSupabase();
  const de = (pagina - 1) * porPagina;

  let consulta = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(de, de + porPagina - 1);

  const termo = busca.trim();
  if (termo) {
    // Escapa % e _ para o termo ser tratado como texto literal.
    const seguro = termo.replace(/[%_]/g, (caractere) => `\\${caractere}`);
    consulta = consulta.ilike('full_name', `%${seguro}%`);
  }

  const { data, error, count } = await consulta;
  if (error) lancar(error);
  return { alunos: data ?? [], total: count ?? 0 };
}
