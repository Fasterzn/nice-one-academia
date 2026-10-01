/**
 * Traduz erros do Supabase para português.
 *
 * A tradução é feita por `code` e por `status` — nunca pelo texto em inglês,
 * que muda entre versões da API.
 */

export const MENSAGEM_GENERICA = 'Algo deu errado. Tente novamente em instantes.';
export const MENSAGEM_SEM_CONEXAO = 'Sem conexão. Verifique sua internet.';
export const MENSAGEM_MUITAS_TENTATIVAS =
  'Muitas tentativas. Aguarde alguns minutos e tente de novo.';
export const MENSAGEM_CODIGO_INVALIDO =
  'Código incorreto ou expirado. Confira o e-mail mais recente ou peça um novo código.';
export const MENSAGEM_CREDENCIAIS = 'E-mail ou senha incorretos.';

/** Erro do Supabase, sem depender do tipo exato da lib. */
type ErroDesconhecido = {
  code?: string;
  status?: number;
  name?: string;
  message?: string;
};

const PORTUGUES_POR_CODIGO: Record<string, string> = {
  // Credenciais — sempre genérico, para não revelar se o e-mail existe.
  invalid_credentials: MENSAGEM_CREDENCIAIS,
  email_not_confirmed: 'Confirme seu e-mail para entrar. Podemos reenviar o código.',
  user_not_found: MENSAGEM_CREDENCIAIS,
  no_authorization: 'Sua sessão expirou. Entre de novo.',
  bad_jwt: 'Sua sessão expirou. Entre de novo.',
  session_not_found: 'Sua sessão expirou. Entre de novo.',
  session_expired: 'Sua sessão expirou. Entre de novo.',
  refresh_token_not_found: 'Sua sessão expirou. Entre de novo.',
  refresh_token_already_used: 'Sua sessão expirou. Entre de novo.',

  // Códigos de e-mail
  otp_expired: MENSAGEM_CODIGO_INVALIDO,
  otp_disabled: 'Este tipo de acesso está desativado. Fale com a unidade.',
  invalid_otp: MENSAGEM_CODIGO_INVALIDO,

  // Senha
  weak_password: 'Senha fraca. Use pelo menos 8 caracteres, com letras e números.',
  same_password: 'A nova senha precisa ser diferente da atual.',

  // Cadastro
  signup_disabled: 'Cadastro indisponível no momento.',
  email_address_invalid: 'E-mail inválido.',
  email_address_not_authorized: 'Este e-mail não está autorizado a receber mensagens.',
  user_already_exists: 'Se este e-mail puder ser cadastrado, você receberá um código.',
  email_exists: 'Se este e-mail puder ser cadastrado, você receberá um código.',
  provider_disabled: 'Este tipo de acesso está desativado.',

  // Limites
  over_email_send_rate_limit: MENSAGEM_MUITAS_TENTATIVAS,
  over_request_rate_limit: MENSAGEM_MUITAS_TENTATIVAS,
  over_sms_send_rate_limit: MENSAGEM_MUITAS_TENTATIVAS,

  // Dois fatores
  mfa_challenge_expired: 'O desafio expirou. Tente de novo.',
  mfa_verification_failed: 'Código do aplicativo incorreto. Tente de novo.',
  mfa_verification_rejected: 'Código do aplicativo recusado. Tente de novo.',
  mfa_factor_name_conflict: 'Já existe um aplicativo com esse nome.',
  mfa_factor_not_found: 'Aplicativo autenticador não encontrado.',
  insufficient_aal: 'Confirme o código do seu aplicativo autenticador para continuar.',
  reauthentication_needed: 'Por segurança, confirme sua senha atual.',
  reauthentication_not_valid: 'Não foi possível confirmar. Verifique a senha atual.',

  // E-mail
  email_change_token_already_used: MENSAGEM_CODIGO_INVALIDO,
  validation_failed: 'Confira os dados preenchidos.',
};

function ehFalhaDeRede(erro: ErroDesconhecido): boolean {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return true;
  // AuthRetryableFetchError é o nome usado pelo supabase-js quando o fetch falha.
  return erro.name === 'AuthRetryableFetchError' || erro.name === 'TypeError';
}

/** Mensagem pronta para mostrar ao aluno. */
export function traduzirErro(erro: unknown): string {
  if (!erro) return MENSAGEM_GENERICA;

  const e = erro as ErroDesconhecido;

  if (e.message === 'SUPABASE_NAO_CONFIGURADO') {
    return 'Área do aluno temporariamente indisponível.';
  }

  if (ehFalhaDeRede(e)) return MENSAGEM_SEM_CONEXAO;

  if (e.code && PORTUGUES_POR_CODIGO[e.code]) {
    return PORTUGUES_POR_CODIGO[e.code] as string;
  }

  if (e.status === 429) return MENSAGEM_MUITAS_TENTATIVAS;
  if (e.status === 401 || e.status === 403) return MENSAGEM_CREDENCIAIS;
  if (e.status === 422) return 'Confira os dados preenchidos.';
  if (typeof e.status === 'number' && e.status >= 500) {
    return 'O serviço está instável agora. Tente de novo em instantes.';
  }

  return MENSAGEM_GENERICA;
}

/** True quando o erro indica e-mail ainda não confirmado. */
export function precisaConfirmarEmail(erro: unknown): boolean {
  return (erro as ErroDesconhecido)?.code === 'email_not_confirmed';
}

/** True quando a ação exige o segundo fator (AAL2). */
export function precisaSegundoFator(erro: unknown): boolean {
  const e = erro as ErroDesconhecido;
  return e?.code === 'insufficient_aal';
}
