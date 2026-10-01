/**
 * Utilidades de rota e foco.
 *
 * Fica separado de validators.ts de propósito: as guardas de rota entram no
 * bundle inicial, e este arquivo não importa zod — o site público não carrega
 * a biblioteca de validação.
 */

/**
 * Só aceita rota interna do próprio site.
 * Bloqueia "//site.com", "https://site.com" e qualquer coisa que não comece com "/".
 */
export function rotaDeRetornoSegura(valor: string | null | undefined): string | null {
  if (!valor) return null;
  if (!valor.startsWith('/')) return null;
  if (valor.startsWith('//')) return null;
  if (valor.includes('\\')) return null;
  if (/^\/+\s*https?:/i.test(valor)) return null;
  return valor;
}

/** Leva o foco ao primeiro campo inválido do formulário. */
export function focarPrimeiroErro(formulario: HTMLFormElement | null) {
  if (!formulario) return;
  requestAnimationFrame(() => {
    const alvo = formulario.querySelector<HTMLElement>('[aria-invalid="true"]');
    alvo?.focus();
    alvo?.scrollIntoView({ block: 'center' });
  });
}
