/**
 * Caminho de um arquivo que mora em `public/`.
 *
 * O Vite só reescreve os caminhos que ele próprio vê (imports, `src` no
 * index.html). Uma string como `/images/hero.webp` escrita no código passa
 * intacta — e aponta para a raiz do domínio. Isso funciona enquanto o site
 * está em `/`, mas quebra no GitHub Pages, onde ele mora em
 * `/nice-one-academia/`: o navegador vai buscar em `fasterzn.github.io/images/…`
 * e recebe 404.
 *
 * `BASE_URL` é injetado pelo Vite a partir do `base` e já termina em barra.
 */
export function asset(caminho: string): string {
  return import.meta.env.BASE_URL + caminho.replace(/^\/+/, '');
}
