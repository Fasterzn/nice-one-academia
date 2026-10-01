/**
 * Prepara as imagens do site a partir das fotos reais das unidades.
 *
 * Origem : ../../assets/UNIDADE 1..5  (fotos enviadas pela Nice One)
 * Destino: public/images/...          (nomes usados pelo site)
 *
 * As fotos originais sao pequenas (max. 680x510), entao o script NUNCA amplia:
 * a largura final e sempre min(largura original, largura maxima do slot).
 * Rode com: npm run images
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = path.dirname(fileURLToPath(import.meta.url));
const project = path.resolve(here, '..');
const source = path.resolve(project, '..', '..', 'assets');
const dest = path.join(project, 'public', 'images');

/**
 * `from` aceita uma lista: usa o primeiro arquivo que existir.
 * É assim que as fachadas novas entram — basta salvar o arquivo com o nome
 * esperado em assets/UNIDADE N/ e rodar o script de novo.
 * @type {{from: string | string[], to: string, aspect: number, maxW: number, pos?: string}[]}
 */
const plan = [
  // Hero — foto ampla do salao com a marca na parede
  // O hero recebe um leve desfoque no CSS, então resolução extra seria peso
  // jogado fora — sai menor de propósito, e o LCP agradece.
  { from: 'UNIDADE 4/unnamed (1).webp', to: 'hero.webp', aspect: 16 / 9, maxW: 900 },
  // Hero mobile — recorte vertical, aluno em treino
  { from: 'UNIDADE 2/unnamed (5).webp', to: 'hero-mobile.webp', aspect: 9 / 16, maxW: 460 },
  // Sobre
  { from: 'UNIDADE 4/unnamed (4).webp', to: 'sobre.webp', aspect: 3 / 4, maxW: 800, pos: 'centre' },

  // Unidades — SEMPRE a fachada, com recorte centralizado para o prédio
  // aparecer inteiro (a busca por "atenção" cortava o topo ou a lateral).
  { from: 'UNIDADE 1/unnamed.webp', to: 'unidades/unidade-1.webp', aspect: 4 / 3, maxW: 1400, pos: 'centre' },
  { from: 'UNIDADE 2/unnamed (10).webp', to: 'unidades/unidade-2.webp', aspect: 4 / 3, maxW: 1400, pos: 'centre' },
  { from: 'UNIDADE 3/unnamed (13).webp', to: 'unidades/unidade-3.webp', aspect: 4 / 3, maxW: 1400, pos: 'centre' },
  {
    // Fachada oficial em alta quando existir; por ora a única foto de fachada
    // da Unidade 4 é pequena (213x160), mas é a fachada — o que foi pedido.
    from: [
      'UNIDADE 4/fachada.jpg',
      'UNIDADE 4/fachada.webp',
      // Fachada em alta enviada pelo cliente (675x510), com o letreiro e o 24h.
      'UNIDADE 4/unnamed (6).webp',
      'UNIDADE 4/download.jpg',
    ],
    to: 'unidades/unidade-4.webp',
    aspect: 4 / 3,
    maxW: 1400,
    pos: 'centre',
  },
  {
    // Fachada em alta enviada pelo cliente (810x720).
    from: [
      'UNIDADE 5/9d1dzxhcsns0impef6mijugnm7ntgyo72d0zwkusgik52itbo1bbqxd9aecd.webp',
      'UNIDADE 5/unnamed (7).webp',
    ],
    to: 'unidades/unidade-5.webp',
    aspect: 4 / 3,
    maxW: 1400,
    pos: 'centre',
  },

  // Comunidade — mosaico editorial
  { from: 'UNIDADE 2/unnamed (12).webp', to: 'comunidade/comunidade-1.webp', aspect: 4 / 5, maxW: 1200 },
  { from: 'UNIDADE 1/unnamed (8).webp', to: 'comunidade/comunidade-2.webp', aspect: 1, maxW: 1200 },
  { from: 'UNIDADE 5/unnamed (1).webp', to: 'comunidade/comunidade-3.webp', aspect: 1, maxW: 1200 },
  { from: 'UNIDADE 2/unnamed (7).webp', to: 'comunidade/comunidade-4.webp', aspect: 4 / 5, maxW: 1200 },
  { from: 'UNIDADE 1/unnamed (2).webp', to: 'comunidade/comunidade-5.webp', aspect: 1, maxW: 1200 },
  { from: 'UNIDADE 5/unnamed (3).webp', to: 'comunidade/comunidade-6.webp', aspect: 1, maxW: 1200 },

  // Grade do Instagram — quadrados
  { from: 'UNIDADE 1/unnamed (1).webp', to: 'instagram/post-1.webp', aspect: 1, maxW: 1000 },
  { from: 'UNIDADE 1/unnamed (4).webp', to: 'instagram/post-2.webp', aspect: 1, maxW: 1000 },
  { from: 'UNIDADE 2/unnamed (3).webp', to: 'instagram/post-3.webp', aspect: 1, maxW: 1000 },
  { from: 'UNIDADE 2/unnamed (11).webp', to: 'instagram/post-4.webp', aspect: 1, maxW: 1000 },
  { from: 'UNIDADE 5/unnamed (5).webp', to: 'instagram/post-5.webp', aspect: 1, maxW: 1000 },
  { from: 'UNIDADE 4/unnamed (3).webp', to: 'instagram/post-6.webp', aspect: 1, maxW: 1000 },
];

/** Densidade de tela alvo: gera a imagem no dobro do recorte disponível. */
const ESCALA = 2;

let done = 0;
let missing = 0;

for (const item of plan) {
  const candidates = Array.isArray(item.from) ? item.from : [item.from];
  const found = candidates.find((candidate) => fs.existsSync(path.join(source, candidate)));
  if (!found) {
    console.warn(`  faltando: ${candidates[0]}`);
    missing += 1;
    continue;
  }
  const src = path.join(source, found);
  const out = path.join(dest, item.to);
  fs.mkdirSync(path.dirname(out), { recursive: true });

  const image = sharp(src);
  const meta = await image.metadata();
  const nativeW = meta.width ?? item.maxW;
  const nativeH = meta.height ?? item.maxW;

  // Recorte máximo possível dentro da foto original, sem inventar enquadramento.
  const recorteW = Math.floor(Math.min(nativeW, nativeH * item.aspect));
  const recorteH = Math.round(recorteW / item.aspect);

  // As fotos da Nice One são pequenas (máx. 680x510). Em tela retina o navegador
  // ampliaria por conta própria, com interpolação pobre — o que dá o aspecto
  // "pixelado". Aqui a ampliação é feita com Lanczos3 + leve nitidez, que
  // preserva muito melhor as bordas, e o arquivo sai no tamanho que a tela pede.
  const largura = Math.min(recorteW * ESCALA, item.maxW);
  const altura = Math.round(largura / item.aspect);
  const ampliou = largura > recorteW;

  let pipeline = image.resize(largura, altura, {
    fit: 'cover',
    position: item.pos ?? sharp.strategy.attention,
    kernel: sharp.kernel.lanczos3,
  });

  if (ampliou) {
    pipeline = pipeline.sharpen({ sigma: 0.7, m1: 0.5, m2: 0.3 });
  }

  await pipeline.webp({ quality: 88, effort: 6 }).toFile(out);

  console.log(
    `  ${item.to.padEnd(34)} ${largura}x${altura}${ampliou ? `  (de ${recorteW}x${recorteH})` : ''}`,
  );
  done += 1;
}

console.log(`\n${done} imagens geradas${missing ? `, ${missing} faltando` : ''}.`);
