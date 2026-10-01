import './Loading.css';

/**
 * Indicador de carregamento das rotas.
 *
 * Vive fora do AuthLayout de propósito: o App e as guardas de rota entram no
 * bundle inicial, e importar o AuthLayout aqui arrastava o CSS das telas de
 * login para o caminho crítico da home.
 */
export function Loading() {
  return (
    <div className="loading" role="status" aria-live="polite">
      <span className="loading__spinner" aria-hidden="true" />
      <span className="visually-hidden">Carregando…</span>
    </div>
  );
}
