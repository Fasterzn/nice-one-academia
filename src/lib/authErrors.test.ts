import { describe, expect, it } from 'vitest';
import {
  MENSAGEM_CODIGO_INVALIDO,
  MENSAGEM_CREDENCIAIS,
  MENSAGEM_GENERICA,
  MENSAGEM_MUITAS_TENTATIVAS,
  precisaConfirmarEmail,
  precisaSegundoFator,
  traduzirErro,
} from './authErrors';

describe('traduzirErro', () => {
  it('traduz por code, não pelo texto em inglês', () => {
    expect(traduzirErro({ code: 'invalid_credentials', message: 'Invalid login credentials' })).toBe(
      MENSAGEM_CREDENCIAIS,
    );
    expect(traduzirErro({ code: 'otp_expired' })).toBe(MENSAGEM_CODIGO_INVALIDO);
  });

  it('usa o status quando não conhece o code', () => {
    expect(traduzirErro({ status: 429 })).toBe(MENSAGEM_MUITAS_TENTATIVAS);
    expect(traduzirErro({ status: 401 })).toBe(MENSAGEM_CREDENCIAIS);
    expect(traduzirErro({ status: 503 })).toContain('instável');
  });

  it('cai na mensagem genérica quando não reconhece nada', () => {
    expect(traduzirErro({ message: 'algo muito estranho' })).toBe(MENSAGEM_GENERICA);
    expect(traduzirErro(null)).toBe(MENSAGEM_GENERICA);
  });

  it('avisa que a área está indisponível quando falta configuração', () => {
    expect(traduzirErro(new Error('SUPABASE_NAO_CONFIGURADO'))).toContain('indisponível');
  });

  it('não revela se o e-mail já existe', () => {
    const mensagem = traduzirErro({ code: 'user_already_exists' });
    expect(mensagem).toBe('Se este e-mail puder ser cadastrado, você receberá um código.');
    expect(mensagem).not.toMatch(/já (existe|cadastrado)/i);
  });

  it('reconhece falha de rede', () => {
    expect(traduzirErro({ name: 'AuthRetryableFetchError' })).toContain('Sem conexão');
  });

  it('identifica e-mail não confirmado e necessidade de segundo fator', () => {
    expect(precisaConfirmarEmail({ code: 'email_not_confirmed' })).toBe(true);
    expect(precisaConfirmarEmail({ code: 'invalid_credentials' })).toBe(false);
    expect(precisaSegundoFator({ code: 'insufficient_aal' })).toBe(true);
    expect(precisaSegundoFator({ code: 'otp_expired' })).toBe(false);
  });
});
