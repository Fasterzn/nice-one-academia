/**
 * Prepara o dist/ para o GitHub Pages.
 *
 *   node scripts/deploy-pages.mjs
 *
 * O que ele resolve, e que o `vite build` sozinho não resolve:
 *
 * 1. O site mora numa subpasta (/nice-one-academia/), então BASE_PATH entra
 *    no vite.config e o roteador ganha basename.
 * 2. O Pages não conhece rotas de SPA: recarregar /area-do-aluno daria 404.
 *    A saída padrão é servir o index.html como 404.html.
 * 3. canonical, og:url e og:image precisam apontar para um endereço que
 *    responde — senão a prévia do link sai sem imagem.
 * 4. robots.txt e sitemap.xml são estáticos e não passam pela substituição
 *    de variáveis do Vite; reescrevemos aqui.
 * 5. Sem SUPABASE_* no ambiente, `isSupabaseConfigured` fica falso e a Área
 *    do Aluno sai do ar sozinha — é assim que ela fica escondida enquanto
 *    não há SMTP. Para religar, exporte as duas variáveis antes de rodar.
 */
import { execSync } from 'node:child_process';
import { copyFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(raiz, 'dist');

const SITE = process.env.VITE_SITE_URL ?? 'https://fasterzn.github.io/nice-one-academia/';
const BASE = process.env.BASE_PATH ?? new URL(SITE).pathname;

// Área do Aluno: só entra se as duas variáveis vierem preenchidas.
const comAluno = Boolean(process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_PUBLISHABLE_KEY);

console.log(`site ........... ${SITE}`);
console.log(`base ........... ${BASE}`);
console.log(`area do aluno .. ${comAluno ? 'LIGADA' : 'desligada (sem SUPABASE_* no ambiente)'}`);
console.log('');

execSync('npm run build', {
  cwd: raiz,
  stdio: 'inherit',
  env: {
    ...process.env,
    BASE_PATH: BASE,
    VITE_SITE_URL: SITE,
    // Precisa ser string vazia, e não "ausente": o .env.local tem as chaves
    // e o Vite daria preferência a ele.
    VITE_SUPABASE_URL: comAluno ? process.env.VITE_SUPABASE_URL : '',
    VITE_SUPABASE_PUBLISHABLE_KEY: comAluno ? process.env.VITE_SUPABASE_PUBLISHABLE_KEY : '',
  },
});

// Rotas de SPA no Pages
copyFileSync(join(dist, 'index.html'), join(dist, '404.html'));

// Sem isso o Pages ignora arquivos e pastas começados por "_"
writeFileSync(join(dist, '.nojekyll'), '');

writeFileSync(
  join(dist, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE}sitemap.xml\n`,
);

writeFileSync(
  join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE}</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`,
);

// Confere o que foi gerado, em vez de confiar
const indexHtml = readdirSync(dist).includes('index.html');
const html = indexHtml ? await import('node:fs').then((m) => m.readFileSync(join(dist, 'index.html'), 'utf8')) : '';
const problemas = [];
if (!indexHtml) problemas.push('dist/index.html nao existe');
if (!existsSync(join(dist, '404.html'))) problemas.push('404.html nao foi criado');
if (!existsSync(join(dist, 'og-image.jpg'))) problemas.push('og-image.jpg nao foi copiado do public/');
if (html.includes('%VITE_SITE_URL%')) problemas.push('VITE_SITE_URL nao foi substituido');
if (!html.includes(`href="${BASE}`)) problemas.push(`os assets nao receberam a base ${BASE}`);

// comentarios do proprio HTML nao contam como "apontar para"
const semComentario = html.replace(/<!--[\s\S]*?-->/g, '');
if (semComentario.includes('niceone.com.br')) problemas.push('ainda aponta para niceone.com.br');

// Caminho absoluto de public/ escrito no código não passa pela reescrita do
// Vite e apontaria para a raiz do domínio — em subpasta, 404 em toda foto.
// Use o helper asset() de src/lib/asset.ts.
if (BASE !== '/') {
  const fs3 = await import('node:fs');
  const soltos = readdirSync(join(dist, 'assets'))
    .filter((f) => f.endsWith('.js'))
    .flatMap((f) => [...fs3.readFileSync(join(dist, 'assets', f), 'utf8').matchAll(/"\/images\/[^"]+"/g)].map((m) => m[0]));
  if (soltos.length) {
    problemas.push(`caminho de imagem sem a base (use asset()): ${[...new Set(soltos)].slice(0, 3).join(', ')}`);
  }
}

if (!comAluno) {
  // "*.supabase.co" aparece dentro da propria biblioteca; o que nao pode
  // vazar e a URL concreta do projeto.
  const fs2 = await import('node:fs');
  const vazou = readdirSync(join(dist, 'assets'))
    .filter((f) => f.endsWith('.js'))
    .filter((f) => /https:\/\/[a-z0-9]{10,}\.supabase\.co/.test(fs2.readFileSync(join(dist, 'assets', f), 'utf8')));
  if (vazou.length) problemas.push('URL do projeto Supabase no bundle: ' + vazou.join(', '));
}

console.log('');
if (problemas.length) {
  console.error('### PROBLEMAS ###\n' + problemas.map((p) => '  ' + p).join('\n'));
  process.exit(1);
}
console.log('### dist/ pronto para o Pages ###');
