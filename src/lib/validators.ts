import { z } from 'zod';

/** Regras iguais às constraints do banco — validação nas duas camadas. */

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Informe seu e-mail.')
  .email('E-mail inválido.')
  .transform((valor) => valor.toLowerCase());

export const senhaSchema = z
  .string()
  .min(8, 'A senha precisa de pelo menos 8 caracteres.')
  .regex(/[A-Za-zÀ-ÿ]/, 'A senha precisa ter pelo menos uma letra.')
  .regex(/\d/, 'A senha precisa ter pelo menos um número.');

export const nomeSchema = z
  .string()
  .trim()
  .min(2, 'Informe seu nome completo.')
  .max(120, 'Nome muito longo.');

/** Guardamos só dígitos, como o banco espera (10 a 13). */
export const telefoneSchema = z
  .string()
  .trim()
  .transform((valor) => valor.replace(/\D/g, ''))
  .refine((valor) => valor === '' || (valor.length >= 10 && valor.length <= 13), {
    message: 'Telefone inválido. Use DDD + número.',
  });

export const unidadeSchema = z
  .union([z.literal(''), z.coerce.number().int().min(1).max(5)])
  .transform((valor) => (valor === '' ? null : (valor as number)));

export const objetivoSchema = z
  .string()
  .trim()
  .max(300, 'Use no máximo 300 caracteres.')
  .transform((valor) => (valor === '' ? null : valor));

export const codigoSchema = z
  .string()
  .regex(/^\d{6}$/, 'O código tem 6 dígitos.');

export const cadastroSchema = z
  .object({
    fullName: nomeSchema,
    email: emailSchema,
    phone: telefoneSchema,
    preferredUnit: unidadeSchema,
    password: senhaSchema,
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, {
      message: 'É preciso aceitar os Termos e a Política de Privacidade.',
    }),
    marketingOptIn: z.boolean(),
  })
  .refine((dados) => dados.password === dados.confirmPassword, {
    message: 'As senhas não são iguais.',
    path: ['confirmPassword'],
  });

export const loginSenhaSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Informe sua senha.'),
});

export const perfilSchema = z.object({
  fullName: nomeSchema,
  phone: telefoneSchema,
  preferredUnit: unidadeSchema,
  goal: objetivoSchema,
  marketingOptIn: z.boolean(),
});

export const novaSenhaSchema = z
  .object({
    password: senhaSchema,
    confirmPassword: z.string(),
  })
  .refine((dados) => dados.password === dados.confirmPassword, {
    message: 'As senhas não são iguais.',
    path: ['confirmPassword'],
  });

export type CadastroInput = z.infer<typeof cadastroSchema>;
export type PerfilInput = z.infer<typeof perfilSchema>;

/** Primeiro erro de cada campo, no formato que os formulários usam. */
export function errosPorCampo(erro: z.ZodError): Record<string, string> {
  const saida: Record<string, string> = {};
  for (const item of erro.issues) {
    const campo = String(item.path[0] ?? 'form');
    saida[campo] ??= item.message;
  }
  return saida;
}

/** Máscara de telefone para exibição: (16) 99999-9999 */
export function formatarTelefone(valor: string): string {
  const digitos = valor.replace(/\D/g, '').slice(0, 11);
  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  if (digitos.length <= 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

/** Mostra o e-mail sem expor o endereço completo: j•••@gmail.com */
export function mascararEmail(email: string): string {
  const [usuario, dominio] = email.split('@');
  if (!usuario || !dominio) return email;
  const visivel = usuario.slice(0, 1);
  return `${visivel}${'•'.repeat(Math.max(usuario.length - 1, 1))}@${dominio}`;
}
