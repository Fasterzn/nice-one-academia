/**
 * Gera um HTML único (CSS, JS e imagens embutidos) para abrir o site direto no
 * celular, sem pastas. Rode depois do build: npm run build && npm run single
 * Saída: dist/nice-one-arquivo-unico.html
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(project, 'dist-single');
// Fica FORA de dist/ de propósito: `vite build` limpa a dist e levaria o
// arquivo único junto. Aqui ele sobrevive a qualquer build.
const destino = project;

// Build próprio, sem divisão de código: o HTML único precisa de um JS só.
console.log('Gerando bundle sem code splitting…');
const build = spawnSync('npx', ['vite', 'build', '--outDir', 'dist-single'], {
  cwd: project,
  env: { ...process.env, SINGLE_FILE: '1' },
  stdio: 'inherit',
  shell: true,
});

if (build.status !== 0 || !fs.existsSync(path.join(dist, 'index.html'))) {
  console.error('Falha ao gerar o bundle do arquivo único.');
  process.exit(1);
}

const mime = {
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

/** Cache para embutir cada imagem uma única vez. */
const cache = new Map();
function dataUri(urlPath) {
  if (cache.has(urlPath)) return cache.get(urlPath);
  const file = path.join(dist, urlPath.replace(/^\//, ''));
  if (!fs.existsSync(file)) return null;
  const type = mime[path.extname(file).toLowerCase()];
  if (!type) return null;
  const uri = `data:${type};base64,${fs.readFileSync(file).toString('base64')}`;
  cache.set(urlPath, uri);
  return uri;
}

/** Troca todo caminho /images/... , /favicon.svg e /og-image.jpg por data URI. */
function inlineAssets(text) {
  return text.replace(/\/(?:images\/[\w./-]+|favicon\.svg|og-image\.jpg|apple-touch-icon\.png)/g, (match) => {
    return dataUri(match) ?? match;
  });
}

let html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');

// CSS
html = html.replace(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g, (_m, href) => {
  const css = fs.readFileSync(path.join(dist, href.replace(/^\//, '')), 'utf8');
  return `<style>${inlineAssets(css)}</style>`;
});

// JS
html = html.replace(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/g, (_m, src) => {
  const js = fs.readFileSync(path.join(dist, src.replace(/^\//, '')), 'utf8');
  return `<script type="module">${inlineAssets(js)}</script>`;
});

// Preloads de imagem não fazem sentido embutidos
html = html.replace(/<link rel="preload"[^>]*>/g, '');

html = inlineAssets(html);

fs.mkdirSync(destino, { recursive: true });
const out = path.join(destino, 'nice-one-arquivo-unico.html');
fs.writeFileSync(out, html);
fs.rmSync(dist, { recursive: true, force: true });

const mb = (fs.statSync(out).size / 1024 / 1024).toFixed(2);
console.log(`\n${out}`);
console.log(`${mb} MB, ${cache.size} imagens embutidas — abre com duplo clique.`);
