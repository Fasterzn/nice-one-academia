/** Espera de 60s entre reenvios de código, sobrevivendo a recarregar a página. */

export const ESPERA_SEGUNDOS = 60;

function chave(escopo: string) {
  return `niceone:reenvio:${escopo}`;
}

export function lerFimDaEspera(escopo: string): number {
  try {
    const bruto = sessionStorage.getItem(chave(escopo));
    return bruto ? Number(bruto) : 0;
  } catch {
    // Navegação privada pode bloquear: a contagem segue só em memória.
    return 0;
  }
}

function gravarFim(escopo: string, valor: number) {
  try {
    sessionStorage.setItem(chave(escopo), String(valor));
  } catch {
    // Sem sessionStorage, a contagem vale só para esta tela.
  }
}

/** Marca a espera logo após enviar um código. */
export function iniciarEsperaDeReenvio(escopo: string) {
  gravarFim(escopo, Date.now() + ESPERA_SEGUNDOS * 1000);
}

export function segundosRestantes(fim: number): number {
  return Math.max(0, Math.ceil((fim - Date.now()) / 1000));
}
