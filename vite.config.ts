import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * SINGLE_FILE=1 gera um bundle sem divisão de código, usado pelo
 * scripts/build-single-file.mjs para montar o HTML único do celular.
 */
const arquivoUnico = process.env.SINGLE_FILE === '1';

/**
 * No GitHub Pages o site mora numa subpasta (/nice-one-academia/), então os
 * caminhos dos assets precisam sair com esse prefixo. BASE_PATH permite
 * trocar isso sem mexer no código; o arquivo único embute tudo e usa './'.
 */
const base = arquivoUnico ? './' : (process.env.BASE_PATH ?? '/');

export default defineConfig({
  base,
  plugins: [react()],
  build: arquivoUnico
    ? {
        rollupOptions: {
          output: { inlineDynamicImports: true },
        },
      }
    : {},
});
