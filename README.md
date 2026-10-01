# Nice One Academia

Site institucional das 5 unidades da **Nice One Academia**, em Sertãozinho/SP.

🔗 **https://fasterzn.github.io/nice-one-academia/**
📱 **[Arquivo único](https://fasterzn.github.io/nice-one-academia/nice-one-arquivo-unico.html)** — abre no celular sem as pastas

Vite + React 19 + TypeScript. Tema verde e branco.

---

## Atualizar o site

Mexeu em alguma coisa? São três comandos:

```bash
npm run pages                      # build para o GitHub Pages
git add -A && git commit -m "..."  # versiona
git push && git subtree push --prefix dist origin gh-pages
```

O link **não muda** — em cerca de um minuto o mesmo endereço já serve a
versão nova.

Se mexeu no site e quer atualizar o arquivo do celular também:

```bash
npm run single
```

## A Área do Aluno está fora do ar

De propósito. Sem **SMTP próprio**, o Supabase não envia o código de 6 dígitos:
quem tentasse se cadastrar travaria na tela de verificação. Então o acesso some
do menu e as rotas caem no 404.

Isso não é uma flag nova — é o `isSupabaseConfigured` que já existia. **Para
religar**, basta buildar com as duas variáveis preenchidas:

```bash
VITE_SUPABASE_URL=... VITE_SUPABASE_PUBLISHABLE_KEY=... npm run pages
```

O `deploy-pages.mjs` avisa qual dos dois modos está gerando.

## Cuidados que o deploy exige

O site mora numa **subpasta** (`/nice-one-academia/`), e isso quebra duas coisas
que funcionariam na raiz:

1. **Caminhos de `public/`.** Uma string `/images/x.webp` escrita no código passa
   intacta pelo Vite e aponta para a raiz do domínio — 404 em toda foto. Use o
   helper [`asset()`](src/lib/asset.ts). O `npm run pages` reprova o build se
   algum caminho solto voltar.
2. **Rotas de SPA.** O Pages não as conhece: recarregar `/area-do-aluno` daria
   404. O script copia o `index.html` como `404.html`.

Ele também reescreve `canonical`, `og:url`, `og:image`, `robots.txt` e
`sitemap.xml` a partir de `VITE_SITE_URL`. Hoje apontam para o GitHub Pages
porque **niceone.com.br ainda não existe** — quando existir:

```bash
VITE_SITE_URL=https://niceone.com.br/ BASE_PATH=/ npm run pages
```

## Comandos

| | |
|---|---|
| `npm run dev` | desenvolvimento |
| `npm run pages` | build para o GitHub Pages |
| `npm run single` | HTML único do celular |
| `npm run images` | reamostra as fotos |
| `npm run typecheck` / `lint` / `test` | verificações |

## Pendências

- **SMTP próprio** — trava a Área do Aluno
- Logo oficial (hoje é um SVG recriado)
- Fachada da Unidade 4, número e CEP da Unidade 2
- Grade de horários das unidades 1, 2 e 4
- Deploy da Edge Function `delete-account`
