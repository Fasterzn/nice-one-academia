import { describe, expect, it } from 'vitest';
import {
  cadastroSchema,
  formatarTelefone,
  mascararEmail,
  senhaSchema,
  telefoneSchema,
  unidadeSchema,
} from './validators';
import { rotaDeRetornoSegura } from './routes';

describe('rotaDeRetornoSegura', () => {
  it('aceita rota interna', () => {
    expect(rotaDeRetornoSegura('/area-do-aluno')).toBe('/area-do-aluno');
    expect(rotaDeRetornoSegura('/area-do-aluno/perfil?x=1')).toBe('/area-do-aluno/perfil?x=1');
  });

  it('bloqueia redirecionamento aberto', () => {
    expect(rotaDeRetornoSegura('//evil.com')).toBeNull();
    expect(rotaDeRetornoSegura('https://evil.com')).toBeNull();
    expect(rotaDeRetornoSegura('http://evil.com')).toBeNull();
    expect(rotaDeRetornoSegura('evil.com')).toBeNull();
    expect(rotaDeRetornoSegura('/\\evil.com')).toBeNull();
    expect(rotaDeRetornoSegura(null)).toBeNull();
    expect(rotaDeRetornoSegura('')).toBeNull();
  });
});

describe('senha', () => {
  it('exige 8 caracteres com letra e número', () => {
    expect(senhaSchema.safeParse('abc12').success).toBe(false);
    expect(senhaSchema.safeParse('abcdefgh').success).toBe(false);
    expect(senhaSchema.safeParse('12345678').success).toBe(false);
    expect(senhaSchema.safeParse('academia1').success).toBe(true);
  });
});

describe('telefone', () => {
  it('guarda só dígitos e valida o tamanho', () => {
    expect(telefoneSchema.parse('(16) 99999-9999')).toBe('16999999999');
    expect(telefoneSchema.parse('')).toBe('');
    expect(telefoneSchema.safeParse('1699').success).toBe(false);
  });

  it('formata para exibição', () => {
    expect(formatarTelefone('16999999999')).toBe('(16) 99999-9999');
    expect(formatarTelefone('1635242224')).toBe('(16) 3524-2224');
    expect(formatarTelefone('16')).toBe('16');
  });
});

describe('unidade', () => {
  it('aceita 1 a 5 e trata vazio como null', () => {
    expect(unidadeSchema.parse('3')).toBe(3);
    expect(unidadeSchema.parse('')).toBeNull();
    expect(unidadeSchema.safeParse('9').success).toBe(false);
  });
});

describe('cadastroSchema', () => {
  const base = {
    fullName: 'Maria da Silva',
    email: 'MARIA@Exemplo.com ',
    phone: '(16) 99999-9999',
    preferredUnit: '3',
    password: 'academia1',
    confirmPassword: 'academia1',
    acceptTerms: true as const,
    marketingOptIn: false,
  };

  it('normaliza e-mail e telefone', () => {
    const resultado = cadastroSchema.parse(base);
    expect(resultado.email).toBe('maria@exemplo.com');
    expect(resultado.phone).toBe('16999999999');
    expect(resultado.preferredUnit).toBe(3);
  });

  it('recusa senhas diferentes', () => {
    const resultado = cadastroSchema.safeParse({ ...base, confirmPassword: 'outra123' });
    expect(resultado.success).toBe(false);
  });

  it('exige aceite dos termos', () => {
    const resultado = cadastroSchema.safeParse({ ...base, acceptTerms: false });
    expect(resultado.success).toBe(false);
  });
});

describe('mascararEmail', () => {
  it('esconde o usuário', () => {
    expect(mascararEmail('joao@gmail.com')).toBe('j•••@gmail.com');
    expect(mascararEmail('a@b.com')).toBe('a•@b.com');
  });
});
