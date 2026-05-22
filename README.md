# BookSearch

Buscador de livros com resenhas geradas por IA.
Google Books API + Gemini API + Vite + GitHub Pages.

---

## Para o agente de código

Este README é o plano de construção completo da aplicação. Siga cada fase em ordem. Não pule etapas. Ao final de cada fase, todos os arquivos listados devem existir e a aplicação deve rodar sem erros no terminal.

---

## Stack e versões

- Node.js >= 18
- Vite 5
- JavaScript ES6+ Vanilla (sem frameworks)
- Google Books API (sem chave para buscas públicas)
- Gemini API (chave gratuita em https://aistudio.google.com)
-- e ollama ou ollama primeiro, ou configuravel
- gh-pages para deploy
- Leaflet.js 1.9 via CDN (opcional, aula 11)

---

## Estrutura de arquivos final

```
booksearch/
├── index.html
├── vite.config.js
├── package.json
├── .gitignore
├── .env                        ← criado manualmente, nunca commitado
├── README.md
└── src/
    ├── css/
    │   └── style.css
    └── js/
        ├── app.js              ← ponto de entrada, importa tudo
        ├── router.js           ← SPA routing por hash
        ├── ui.js               ← funções que escrevem no DOM
        ├── api.js              ← fetch Google Books e Gemini
        ├── utils.js            ← funções puras sem efeitos colaterais
        └── storage.js          ← toda leitura/escrita no localStorage
```

---

## Fase 1 — Setup e estrutura

### 1.1 Criar os arquivos de configuração

**package.json** — criar com o conteúdo abaixo:

```json
{
  "name": "booksearch",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev":     "vite",
    "build":   "vite build",
    "preview": "vite preview",
    "deploy":  "npm run build && gh-pages -d dist"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "gh-pages": "^6.0.0"
  }
}
```

**vite.config.js** — criar com o conteúdo abaixo:

```js
export default {
  base: '/booksearch/',
  build: {
    outDir: 'dist',
  },
};
```

**.gitignore** — criar com o conteúdo abaixo:

```
node_modules/
dist/
.env
.DS_Store
*.log
```

**.env** — criar com o conteúdo abaixo (o agente não preenche a chave, apenas cria o arquivo):

```
VITE_GEMINI_KEY=coloque_sua_chave_aqui
```

Rodar após criar os arquivos:

```bash
npm install
```

---

### 1.2 Criar index.html

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BookSearch</title>
  <link rel="stylesheet" href="/src/css/style.css">
</head>
<body>

  <header class="bs-header">
    <h1 class="bs-logo">📚 BookSearch</h1>
    <div class="bs-busca">
      <input
        id="inputBusca"
        type="search"
        placeholder="Título, autor ou assunto..."
        autocomplete="off"
      >
      <button id="btnBuscar">Buscar</button>
      <button id="btnTema" title="Alternar tema">🌙</button>
    </div>
    <div id="historicoContainer" class="historico-container"></div>
  </header>

  <nav class="bs-nav" id="bsNav">
    <a href="#/inicio"    class="nav-link">Início</a>
    <a href="#/favoritos" class="nav-link">Favoritos</a>
    <a href="#/sobre"     class="nav-link">Sobre</a>
  </nav>

  <main id="app">
    <div id="loading"       class="hidden">⏳ Buscando...</div>
    <div id="erro"          class="hidden"></div>
    <div id="selectWrapper" class="select-wrapper hidden">
      <select id="selectCat">
        <option value="">Todas as categorias</option>
      </select>
      <select id="selectOrdem">
        <option value="relevance">Relevância</option>
        <option value="newest">Mais recentes</option>
      </select>
    </div>
    <section id="grade-livros"></section>
    <div id="paginacao" class="paginacao"></div>
    <aside id="detalhe-livro" class="hidden"></aside>
  </main>

  <script type="module" src="/src/js/app.js"></script>
</body>
</html>
```

---

### 1.3 Criar src/css/style.css

O CSS usa variáveis para suportar tema claro e escuro sem reescrever regras.

```css
/* ── Variáveis de tema ── */
:root {
  --bg-primario:     #ffffff;
  --bg-secundario:   #f3f4f6;
  --bg-card:         #ffffff;
  --texto-primario:  #1f2937;
  --texto-secundario:#6b7280;
  --cor-destaque:    #1a56db;
  --borda:           #d1d5db;
  --sombra:          0 2px 8px rgba(0,0,0,.08);
  --raio:            8px;
}

[data-tema="escuro"] {
  --bg-primario:     #0f172a;
  --bg-secundario:   #1e293b;
  --bg-card:         #1e293b;
  --texto-primario:  #f1f5f9;
  --texto-secundario:#94a3b8;
  --cor-destaque:    #60a5fa;
  --borda:           #334155;
  --sombra:          0 2px 8px rgba(0,0,0,.4);
}

/* ── Reset ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: Arial, sans-serif;
  background: var(--bg-primario);
  color: var(--texto-primario);
  transition: background .2s, color .2s;
}
.hidden { display: none !important; }

/* ── Header ── */
.bs-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg-secundario);
  border-bottom: 1px solid var(--borda);
  padding: 12px 16px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}
.bs-logo { font-size: 1.4rem; }
.bs-busca {
  display: flex;
  gap: 8px;
  flex: 1;
  min-width: 260px;
}
.bs-busca input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--borda);
  border-radius: var(--raio);
  background: var(--bg-card);
  color: var(--texto-primario);
  font-size: 1rem;
}
.bs-busca button {
  padding: 8px 16px;
  background: var(--cor-destaque);
  color: #fff;
  border: none;
  border-radius: var(--raio);
  cursor: pointer;
  font-size: 1rem;
}
#btnTema {
  background: transparent;
  color: var(--texto-primario);
  border: 1px solid var(--borda);
  padding: 8px;
  font-size: 1.1rem;
}

/* ── Histórico de buscas ── */
.historico-container {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.chip-historico {
  padding: 4px 10px;
  background: var(--bg-card);
  border: 1px solid var(--borda);
  border-radius: 999px;
  font-size: .85rem;
  cursor: pointer;
  color: var(--texto-secundario);
}
.chip-historico:hover { border-color: var(--cor-destaque); color: var(--cor-destaque); }

/* ── Navegação ── */
.bs-nav {
  display: flex;
  gap: 4px;
  padding: 8px 16px;
  background: var(--bg-secundario);
  border-bottom: 1px solid var(--borda);
}
.bs-nav.nav-mobile {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  justify-content: space-around;
  border-top: 1px solid var(--borda);
  border-bottom: none;
  z-index: 100;
}
.nav-link {
  padding: 8px 16px;
  text-decoration: none;
  color: var(--texto-secundario);
  border-radius: var(--raio);
  font-size: .95rem;
}
.nav-link.ativo { color: var(--cor-destaque); font-weight: bold; }
.nav-link:hover { background: var(--bg-card); }

/* ── Filtros ── */
.select-wrapper {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  flex-wrap: wrap;
}
.select-wrapper select {
  padding: 6px 10px;
  border: 1px solid var(--borda);
  border-radius: var(--raio);
  background: var(--bg-card);
  color: var(--texto-primario);
}

/* ── Grade de livros ── */
#grade-livros {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  padding: 16px;
}
.grade-vazia {
  grid-column: 1 / -1;
  text-align: center;
  padding: 48px;
  color: var(--texto-secundario);
}

/* ── Card ── */
.card-livro {
  background: var(--bg-card);
  border: 1px solid var(--borda);
  border-radius: var(--raio);
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow .15s, transform .15s;
  box-shadow: var(--sombra);
  position: relative;
}
.card-livro:hover { box-shadow: 0 4px 16px rgba(0,0,0,.15); transform: translateY(-2px); }
.card-livro img {
  width: 100%;
  aspect-ratio: 2/3;
  object-fit: cover;
  background: var(--bg-secundario);
}
.card-info { padding: 10px; display: flex; flex-direction: column; gap: 4px; }
.card-titulo { font-size: .9rem; font-weight: bold; line-height: 1.3; }
.card-autor  { font-size: .8rem; color: var(--texto-secundario); }
.card-badge  {
  font-size: .75rem;
  padding: 2px 6px;
  border-radius: 999px;
  align-self: flex-start;
  font-weight: bold;
}
.btn-fav {
  position: absolute;
  top: 8px; right: 8px;
  background: rgba(0,0,0,.4);
  border: none;
  border-radius: 50%;
  width: 28px; height: 28px;
  cursor: pointer;
  font-size: .9rem;
  display: flex; align-items: center; justify-content: center;
  color: #fff;
}
.btn-fav.favoritado { background: #b91c1c; }

/* ── Paginação ── */
.paginacao {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  color: var(--texto-secundario);
}
.btn-pag {
  padding: 8px 16px;
  border: 1px solid var(--borda);
  border-radius: var(--raio);
  background: var(--bg-card);
  color: var(--texto-primario);
  cursor: pointer;
}
.btn-pag:disabled { opacity: .4; cursor: not-allowed; }

/* ── Painel de detalhe ── */
#detalhe-livro {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.5);
  z-index: 200;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  overflow-y: auto;
}
.detalhe-inner {
  width: min(480px, 100%);
  min-height: 100vh;
  background: var(--bg-card);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.detalhe-capa {
  width: 120px;
  border-radius: var(--raio);
  box-shadow: var(--sombra);
  align-self: center;
}
.detalhe-titulo  { font-size: 1.2rem; font-weight: bold; }
.detalhe-autor   { color: var(--texto-secundario); }
.detalhe-desc    { font-size: .9rem; line-height: 1.6; color: var(--texto-secundario); }
.btn-fechar      { align-self: flex-end; background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--texto-secundario); }
.btn-ia          { padding: 10px; border: 1px solid var(--cor-destaque); border-radius: var(--raio); background: none; color: var(--cor-destaque); cursor: pointer; font-size: .95rem; }
.btn-ia:disabled { opacity: .5; cursor: not-allowed; }
.resenha-ia      { font-size: .9rem; line-height: 1.7; border-left: 3px solid var(--cor-destaque); padding-left: 12px; }
.btn-copiar      { align-self: flex-start; padding: 6px 12px; border: 1px solid var(--borda); border-radius: var(--raio); background: var(--bg-secundario); cursor: pointer; font-size: .85rem; color: var(--texto-primario); }

/* ── Loading ── */
#loading {
  text-align: center;
  padding: 48px;
  font-size: 1.1rem;
  color: var(--texto-secundario);
}
#erro {
  margin: 16px;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: var(--raio);
  color: #b91c1c;
}

/* ── Mobile padding (navbar fixa na base) ── */
@media (max-width: 767px) {
  body { padding-bottom: 60px; }
}

/* ── Sobre ── */
.pagina-sobre {
  max-width: 600px;
  margin: 32px auto;
  padding: 0 16px;
  line-height: 1.7;
}
.pagina-sobre h2 { margin-bottom: 12px; }
.pagina-sobre p  { color: var(--texto-secundario); margin-bottom: 8px; }
```

---

### 1.4 Criar os arquivos JavaScript — esqueletos iniciais

Criar cada arquivo com apenas o export para que os imports não quebrem nas fases seguintes.

**src/js/utils.js** — versão inicial:

```js
// Classificação por nota (escala 0–5 do Google Books)
export function classificarLivro(nota) {
  if (nota >= 4.5) return { label: 'Excelente', cor: '#057A55', bg: '#DEF7EC' };
  if (nota >= 3.5) return { label: 'Bom',       cor: '#1A56DB', bg: '#EBF5FF' };
  if (nota >= 2.0) return { label: 'Regular',   cor: '#B45309', bg: '#FFFBEB' };
  return                  { label: 'Sem nota',  cor: '#6B7280', bg: '#F3F4F6' };
}

// Formata lista de autores — máximo 2 nomes + "e outros"
export function formatarAutores(autores) {
  if (!autores || autores.length === 0) return 'Autor desconhecido';
  if (autores.length === 1) return autores[0];
  return autores.slice(0, 2).join(', ') + (autores.length > 2 ? ' e outros' : '');
}

// Traduz categoria da Google Books para português
export function traduzirCategoria(cat) {
  if (!cat) return '';
  const map = {
    'fiction':          'Ficção',
    'science fiction':  'Ficção Científica',
    'mystery':          'Mistério',
    'thriller':         'Suspense',
    'biography':        'Biografia',
    'history':          'História',
    'technology':       'Tecnologia',
    'computers':        'Computação',
    'self-help':        'Autoajuda',
    'romance':          'Romance',
    'fantasy':          'Fantasia',
    'horror':           'Terror',
    'science':          'Ciência',
    'business':         'Negócios',
    'philosophy':       'Filosofia',
    'poetry':           'Poesia',
    'comics':           'Quadrinhos',
    'cooking':          'Culinária',
    'travel':           'Viagens',
    'art':              'Arte',
  };
  return map[cat.toLowerCase()] || cat;
}

// Posiciona a navbar: base em mobile, topo em desktop
export function posicionarNav() {
  const nav = document.getElementById('bsNav');
  if (!nav) return;
  if (window.innerWidth >= 768) {
    nav.classList.remove('nav-mobile');
  } else {
    nav.classList.add('nav-mobile');
  }
}

// Filtra lista por termo (título, autor ou descrição)
export function buscaLocal(lista, termo) {
  if (!termo) return lista;
  const t = termo.toLowerCase();
  return lista.filter(l =>
    l.titulo.toLowerCase().includes(t) ||
    l.autores.some(a => a.toLowerCase().includes(t)) ||
    (l.descricao || '').toLowerCase().includes(t)
  );
}

// Filtra lista por categoria
export function filtrarCategoria(lista, cat) {
  if (!cat) return lista;
  return lista.filter(l => l.categoria === cat);
}

// Retorna a fatia da lista para a página solicitada
export function paginar(lista, pagina, porPagina = 12) {
  const inicio = (pagina - 1) * porPagina;
  return lista.slice(inicio, inicio + porPagina);
}

// Total de páginas para uma lista e tamanho de página
export function totalPaginas(lista, porPagina = 12) {
  return Math.max(1, Math.ceil(lista.length / porPagina));
}

// Categorias únicas e ordenadas de uma lista de livros
export function categoriasUnicas(lista) {
  const set = new Set(lista.map(l => l.categoria).filter(Boolean));
  return Array.from(set).sort();
}

// Serializa o estado para hash da URL
export function estadoParaHash(estado) {
  const p = new URLSearchParams();
  if (estado.termoBusca)     p.set('q',   estado.termoBusca);
  if (estado.categoriaAtiva) p.set('cat', estado.categoriaAtiva);
  if (estado.paginaAtual > 1) p.set('p',  String(estado.paginaAtual));
  const qs = p.toString();
  return qs ? `#/busca?${qs}` : '#/inicio';
}

// Lê o hash e retorna os parâmetros de estado
export function hashParaEstado() {
  const hash   = window.location.hash || '#/inicio';
  const rota   = hash.split('?')[0];
  const params = new URLSearchParams(hash.split('?')[1] || '');
  return {
    rota,
    termoBusca:     params.get('q')   || '',
    categoriaAtiva: params.get('cat') || '',
    paginaAtual:    Number(params.get('p')) || 1,
  };
}

// Tema
export function inicializarTema() {
  const salvo   = localStorage.getItem('bs_tema');
  const sistema = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro';
  aplicarTema(salvo || sistema);
}

export function aplicarTema(tema) {
  document.documentElement.dataset.tema = tema;
  localStorage.setItem('bs_tema', tema);
  const btn = document.getElementById('btnTema');
  if (btn) btn.textContent = tema === 'escuro' ? '☀️' : '🌙';
}

export function toggleTema() {
  const atual = document.documentElement.dataset.tema;
  aplicarTema(atual === 'escuro' ? 'claro' : 'escuro');
}

// Debounce simples
export function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
```

**src/js/storage.js** — versão inicial:

```js
const KEYS = {
  FAVORITOS: 'bs_favoritos',
  HISTORICO: 'bs_historico',
};

function lerJSON(chave, fallback) {
  try {
    return JSON.parse(localStorage.getItem(chave)) ?? fallback;
  } catch {
    return fallback;
  }
}

export function carregarFavoritos() {
  return lerJSON(KEYS.FAVORITOS, []);
}

export function salvarFavoritos(lista) {
  localStorage.setItem(KEYS.FAVORITOS, JSON.stringify(lista));
}

export function isFavorito(id) {
  return carregarFavoritos().includes(id);
}

// Retorna true se foi adicionado, false se foi removido
export function toggleFavorito(id) {
  const favs = carregarFavoritos();
  const idx  = favs.indexOf(id);
  if (idx === -1) {
    favs.push(id);
  } else {
    favs.splice(idx, 1);
  }
  salvarFavoritos(favs);
  return idx === -1;
}

export function carregarHistorico() {
  return lerJSON(KEYS.HISTORICO, []);
}

export function registrarBusca(termo) {
  if (!termo || !termo.trim()) return;
  let hist = carregarHistorico();
  hist = [termo, ...hist.filter(t => t !== termo)].slice(0, 5);
  localStorage.setItem(KEYS.HISTORICO, JSON.stringify(hist));
}
```

**src/js/api.js** — versão inicial:

```js
// Google Books — sem chave para buscas públicas
const BASE_BOOKS = 'https://www.googleapis.com/books/v1/volumes';

// Gemini — chave via variável de ambiente do Vite
const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY || '';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_KEY}`;

// Converte o formato da API para o formato interno da aplicação
function normalizarLivro(item) {
  const info = item.volumeInfo || {};
  return {
    id:        item.id,
    titulo:    info.title                          || 'Sem título',
    autores:   info.authors                        || [],
    categoria: (info.categories || [])[0]          || '',
    descricao: info.description                    || '',
    capa:      info.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
    paginas:   info.pageCount                      || 0,
    ano:       (info.publishedDate || '').substring(0, 4),
    nota:      info.averageRating                  || 0,
    link:      info.previewLink                    || '',
    editora:   info.publisher                      || '',
    idioma:    info.language                       || '',
  };
}

// Busca livros por termo — retorna array normalizado
export async function buscarLivros(termo, maxResultados = 12, ordenacao = 'relevance') {
  if (!termo || !termo.trim()) return [];
  const url = new URL(BASE_BOOKS);
  url.searchParams.set('q',          encodeURIComponent(termo));
  url.searchParams.set('maxResults', String(maxResultados));
  url.searchParams.set('orderBy',    ordenacao);
  url.searchParams.set('langRestrict', 'pt');

  const resp = await fetch(url.toString());
  if (!resp.ok) throw new Error(`Google Books retornou ${resp.status}`);
  const dados = await resp.json();
  return (dados.items || []).map(normalizarLivro);
}

// Busca detalhes de um livro pelo id
export async function buscarDetalheLivro(id) {
  const resp = await fetch(`${BASE_BOOKS}/${id}`);
  if (!resp.ok) throw new Error(`Livro ${id} não encontrado`);
  const item = await resp.json();
  return normalizarLivro(item);
}

// Chama Gemini com um prompt e retorna o texto da resposta
async function chamarGemini(prompt) {
  if (!GEMINI_KEY) throw new Error('VITE_GEMINI_KEY não configurada no .env');
  const resp = await fetch(GEMINI_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  if (!resp.ok) throw new Error(`Gemini retornou ${resp.status}`);
  const dados = await resp.json();
  return dados.candidates[0].content.parts[0].text;
}

// Gera resenha crítica de um livro
export async function gerarResenha(titulo, autores, categoria) {
  const prompt =
    `Escreva uma resenha crítica de 3 parágrafos em português brasileiro ` +
    `sobre o livro "${titulo}" de ${autores.join(', ')} ` +
    `(categoria: ${categoria || 'não especificada'}). ` +
    `Seja informativo, imparcial e envolvente. Não use markdown.`;
  return chamarGemini(prompt);
}

// Sugere livros similares — retorna array de { titulo, autor }
export async function sugerirSimilares(titulo, categoria) {
  const prompt =
    `Sugira exatamente 3 livros similares a "${titulo}" ` +
    `da categoria ${categoria || 'literatura'}. ` +
    `Responda SOMENTE em JSON válido, sem markdown, sem explicação: ` +
    `[{"titulo":"...","autor":"..."},{"titulo":"...","autor":"..."},{"titulo":"...","autor":"..."}]`;
  const texto = await chamarGemini(prompt);
  const limpo = texto.replace(/```json|```/g, '').trim();
  return JSON.parse(limpo);
}
```

**src/js/ui.js** — versão inicial:

```js
import { classificarLivro, formatarAutores, traduzirCategoria, totalPaginas } from './utils.js';
import { isFavorito } from './storage.js';

// Gera o HTML de um card de livro
export function criarCardLivro(livro) {
  const badge = classificarLivro(livro.nota);
  const autor = formatarAutores(livro.autores);
  const cat   = traduzirCategoria(livro.categoria);
  const capa  = livro.capa || 'https://via.placeholder.com/128x192?text=Sem+Capa';
  const fav   = isFavorito(livro.id);

  return `
    <article class="card-livro" data-id="${livro.id}" role="button" tabindex="0"
      aria-label="Ver detalhes de ${livro.titulo}">
      <img src="${capa}" alt="Capa: ${livro.titulo}" loading="lazy">
      <button class="btn-fav ${fav ? 'favoritado' : ''}"
        data-fav="${livro.id}"
        aria-label="${fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}"
        aria-pressed="${fav}">
        ${fav ? '❤️' : '🤍'}
      </button>
      <div class="card-info">
        <span class="card-badge" style="color:${badge.cor};background:${badge.bg}">
          ${badge.label}
        </span>
        <h3 class="card-titulo">${livro.titulo}</h3>
        <p  class="card-autor">${autor}</p>
        ${cat ? `<span class="card-cat" style="font-size:.75rem;color:var(--texto-secundario)">${cat}</span>` : ''}
      </div>
    </article>
  `;
}

// Renderiza a grade de livros
export function renderizarLivros(lista) {
  const grade = document.getElementById('grade-livros');
  if (!lista || lista.length === 0) {
    grade.innerHTML = '<p class="grade-vazia">Nenhum livro encontrado.</p>';
    return;
  }
  grade.innerHTML = lista.map(criarCardLivro).join('');
}

// Renderiza os botões de paginação
export function renderizarPaginacao(paginaAtual, total, onNavegar) {
  const cont = document.getElementById('paginacao');
  if (total <= 1) { cont.innerHTML = ''; return; }
  cont.innerHTML = `
    <button class="btn-pag" data-pag="${paginaAtual - 1}"
      ${paginaAtual <= 1 ? 'disabled' : ''}
      aria-label="Página anterior">← Anterior</button>
    <span>${paginaAtual} de ${total}</span>
    <button class="btn-pag" data-pag="${paginaAtual + 1}"
      ${paginaAtual >= total ? 'disabled' : ''}
      aria-label="Próxima página">Próximo →</button>
  `;
  cont.querySelectorAll('.btn-pag:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => onNavegar(Number(btn.dataset.pag)));
  });
}

// Popula o select de categorias com as categorias únicas da lista
export function popularSelectCategorias(lista, catAtiva) {
  const select = document.getElementById('selectCat');
  if (!select) return;
  const cats = [...new Set(lista.map(l => l.categoria).filter(Boolean))].sort();
  select.innerHTML =
    '<option value="">Todas as categorias</option>' +
    cats.map(c =>
      `<option value="${c}" ${c === catAtiva ? 'selected' : ''}>${traduzirCategoria(c)}</option>`
    ).join('');
}

// Renderiza o histórico de buscas como chips clicáveis
export function renderizarHistorico(historico, onClicar) {
  const cont = document.getElementById('historicoContainer');
  if (!cont) return;
  if (!historico.length) { cont.innerHTML = ''; return; }
  cont.innerHTML = historico
    .map(t => `<button class="chip-historico" data-termo="${t}">${t}</button>`)
    .join('');
  cont.querySelectorAll('.chip-historico').forEach(btn => {
    btn.addEventListener('click', () => onClicar(btn.dataset.termo));
  });
}

// Abre o painel de detalhe com os dados do livro
export function abrirDetalhe(livro, onGerarResenha, onSimilares) {
  const painel = document.getElementById('detalhe-livro');
  const fav    = isFavorito(livro.id);
  const capa   = livro.capa || 'https://via.placeholder.com/120x180?text=Sem+Capa';

  painel.innerHTML = `
    <div class="detalhe-inner" role="dialog" aria-label="Detalhes: ${livro.titulo}">
      <button class="btn-fechar" id="btnFecharDetalhe" aria-label="Fechar painel">✕</button>
      <img class="detalhe-capa" src="${capa}" alt="Capa: ${livro.titulo}">
      <h2 class="detalhe-titulo">${livro.titulo}</h2>
      <p  class="detalhe-autor">${formatarAutores(livro.autores)}</p>
      ${livro.editora ? `<p style="font-size:.85rem;color:var(--texto-secundario)">${livro.editora}${livro.ano ? ', ' + livro.ano : ''}</p>` : ''}
      ${livro.paginas ? `<p style="font-size:.85rem;color:var(--texto-secundario)">${livro.paginas} páginas</p>` : ''}
      ${livro.descricao ? `<p class="detalhe-desc">${livro.descricao}</p>` : ''}
      ${livro.link ? `<a href="${livro.link}" target="_blank" rel="noopener" style="font-size:.85rem;color:var(--cor-destaque)">Ver no Google Books ↗</a>` : ''}
      <button class="btn-ia" id="btnGerarResenha">✨ Gerar resenha com IA</button>
      <button class="btn-ia" id="btnSimilares">📚 Sugerir livros similares</button>
      <div id="outputIA"></div>
    </div>
  `;

  painel.classList.remove('hidden');
  const focoAnterior = document.activeElement;

  // Fechar
  const fechar = () => {
    painel.classList.add('hidden');
    document.removeEventListener('keydown', escHandler);
    focoAnterior?.focus();
  };

  document.getElementById('btnFecharDetalhe').addEventListener('click', fechar);
  painel.addEventListener('click', e => { if (e.target === painel) fechar(); });
  const escHandler = e => { if (e.key === 'Escape') fechar(); };
  document.addEventListener('keydown', escHandler);

  // Gerar resenha
  document.getElementById('btnGerarResenha').addEventListener('click', () =>
    onGerarResenha(livro, document.getElementById('outputIA'))
  );

  // Sugerir similares
  document.getElementById('btnSimilares').addEventListener('click', () =>
    onSimilares(livro, document.getElementById('outputIA'))
  );
}

// Exibe loading
export function mostrarLoading(msg = 'Buscando...') {
  document.getElementById('loading').textContent = '⏳ ' + msg;
  document.getElementById('loading').classList.remove('hidden');
  document.getElementById('grade-livros').classList.add('hidden');
  document.getElementById('paginacao').classList.add('hidden');
}

// Esconde loading
export function esconderLoading() {
  document.getElementById('loading').classList.add('hidden');
  document.getElementById('grade-livros').classList.remove('hidden');
  document.getElementById('paginacao').classList.remove('hidden');
}

// Exibe mensagem de erro
export function mostrarErro(msg) {
  const div = document.getElementById('erro');
  div.textContent = '⚠️ ' + msg;
  div.classList.remove('hidden');
  esconderLoading();
}

// Esconde mensagem de erro
export function esconderErro() {
  document.getElementById('erro').classList.add('hidden');
}
```

**src/js/router.js** — versão inicial:

```js
import { hashParaEstado }             from './utils.js';
import { renderizarLivros,
         renderizarPaginacao,
         popularSelectCategorias,
         mostrarErro, esconderErro }  from './ui.js';
import { carregarFavoritos }          from './storage.js';

// Estado central da aplicação
export const estado = {
  resultados:     [],     // lista completa retornada pela última busca/rota
  paginaAtual:    1,
  termoBusca:     '',
  categoriaAtiva: '',
  carregando:     false,
  erro:           null,
};

export function atualizarEstado(dados) {
  Object.assign(estado, dados);
}

// Renderiza a página atual com filtros e paginação aplicados
export function renderizarPaginaAtual() {
  const { resultados, paginaAtual, categoriaAtiva } = estado;

  const filtrados = categoriaAtiva
    ? resultados.filter(l => l.categoria === categoriaAtiva)
    : resultados;

  const POR_PAG = 12;
  const inicio  = (paginaAtual - 1) * POR_PAG;
  const visiveis = filtrados.slice(inicio, inicio + POR_PAG);
  const total    = Math.max(1, Math.ceil(filtrados.length / POR_PAG));

  esconderErro();
  renderizarLivros(visiveis);
  renderizarPaginacao(paginaAtual, total, (pag) => {
    atualizarEstado({ paginaAtual: pag });
    renderizarPaginaAtual();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  popularSelectCategorias(resultados, categoriaAtiva);

  const sw = document.getElementById('selectWrapper');
  if (sw) sw.classList.toggle('hidden', resultados.length === 0);
}

// Atualiza o link ativo na navbar
function atualizarNavAtiva(rota) {
  document.querySelectorAll('.nav-link').forEach(link => {
    const destino = link.getAttribute('href').split('?')[0];
    link.classList.toggle('ativo', destino === rota);
  });
}

// ── Handlers de rota ──────────────────────────────────────────
function rotaInicio() {
  atualizarEstado({ resultados: [], paginaAtual: 1, termoBusca: '', categoriaAtiva: '' });
  renderizarPaginaAtual();
}

function rotaBusca(estado_url) {
  // A busca real é executada em app.js ao detectar o hash
  // Aqui só sincronizamos o estado com a URL
  atualizarEstado({
    termoBusca:     estado_url.termoBusca,
    categoriaAtiva: estado_url.categoriaAtiva,
    paginaAtual:    estado_url.paginaAtual,
  });
}

function rotaFavoritos() {
  // Importação dinâmica para evitar ciclo com storage
  import('./storage.js').then(({ carregarFavoritos }) => {
    import('./api.js').then(async ({ buscarDetalheLivro }) => {
      const ids = carregarFavoritos();
      if (ids.length === 0) {
        atualizarEstado({ resultados: [], paginaAtual: 1 });
        renderizarPaginaAtual();
        return;
      }
      // Busca os detalhes de cada livro favoritado
      const livros = await Promise.all(
        ids.map(id => buscarDetalheLivro(id).catch(() => null))
      );
      atualizarEstado({ resultados: livros.filter(Boolean), paginaAtual: 1 });
      renderizarPaginaAtual();
    });
  });
}

function rotaSobre() {
  document.getElementById('grade-livros').innerHTML = `
    <div class="pagina-sobre">
      <h2>Sobre o BookSearch</h2>
      <p>Buscador de livros desenvolvido durante o curso de JavaScript Frontend.</p>
      <p>Usa a Google Books API para busca e a Gemini API para gerar resenhas com IA.</p>
    </div>
  `;
  document.getElementById('paginacao').innerHTML = '';
  const sw = document.getElementById('selectWrapper');
  if (sw) sw.classList.add('hidden');
}

// ── Roteador principal ────────────────────────────────────────
export function roteador(onBusca) {
  const { rota, termoBusca, categoriaAtiva, paginaAtual } = hashParaEstado();

  atualizarNavAtiva(rota);

  switch (rota) {
    case '#/busca':
      rotaBusca({ termoBusca, categoriaAtiva, paginaAtual });
      if (termoBusca) onBusca(termoBusca);
      break;
    case '#/favoritos':
      rotaFavoritos();
      break;
    case '#/sobre':
      rotaSobre();
      break;
    default:
      rotaInicio();
  }
}

export function iniciarRouter(onBusca) {
  window.addEventListener('hashchange', () => roteador(onBusca));
  window.addEventListener('load',       () => roteador(onBusca));
}
```

**src/js/app.js** — versão inicial:

```js
import { iniciarRouter, estado, atualizarEstado, renderizarPaginaAtual } from './router.js';
import { buscarLivros, gerarResenha, sugerirSimilares }                   from './api.js';
import { abrirDetalhe, mostrarLoading, esconderLoading,
         mostrarErro, renderizarHistorico }                               from './ui.js';
import { toggleFavorito, registrarBusca, carregarHistorico }              from './storage.js';
import { posicionarNav, toggleTema, inicializarTema,
         estadoParaHash, debounce }                                       from './utils.js';

// ── Busca principal ───────────────────────────────────────────
async function executarBusca(termo) {
  if (!termo || !termo.trim()) return;

  mostrarLoading(`Buscando "${termo}"...`);
  registrarBusca(termo);
  atualizarHistorico();

  try {
    const ordem  = document.getElementById('selectOrdem')?.value || 'relevance';
    const livros = await buscarLivros(termo, 40, ordem);
    atualizarEstado({ resultados: livros, termoBusca: termo, paginaAtual: 1, erro: null });
    esconderLoading();
    renderizarPaginaAtual();
  } catch (e) {
    mostrarErro(e.message);
  }
}

// Navega para a rota de busca (muda o hash e dispara o router)
function navegarParaBusca(termo) {
  const hash = `#/busca?q=${encodeURIComponent(termo.trim())}`;
  if (window.location.hash !== hash) {
    window.location.hash = hash;
  } else {
    // Hash igual: router não dispara hashchange, executar direto
    executarBusca(termo);
  }
}

// ── Handlers de IA ────────────────────────────────────────────
async function handleGerarResenha(livro, container) {
  const btn = document.getElementById('btnGerarResenha');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Gerando...'; }

  try {
    const texto = await gerarResenha(livro.titulo, livro.autores, livro.categoria);
    container.innerHTML = `
      <div class="resenha-ia">${texto.replace(/\n/g, '<br>')}</div>
      <button class="btn-copiar" id="btnCopiar">📋 Copiar resenha</button>
    `;
    document.getElementById('btnCopiar')?.addEventListener('click', async () => {
      await navigator.clipboard.writeText(texto).catch(() => {});
      const b = document.getElementById('btnCopiar');
      if (b) { b.textContent = '✅ Copiado!'; setTimeout(() => { b.textContent = '📋 Copiar resenha'; }, 2000); }
    });
  } catch (e) {
    container.innerHTML = `<p style="color:#b91c1c">Erro: ${e.message}</p>`;
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '✨ Gerar resenha com IA'; }
  }
}

async function handleSugerirSimilares(livro, container) {
  const btn = document.getElementById('btnSimilares');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Buscando...'; }

  try {
    const sugestoes = await sugerirSimilares(livro.titulo, livro.categoria);
    container.innerHTML = `
      <p style="font-weight:bold;margin-bottom:8px">Livros similares:</p>
      <ul style="list-style:none;display:flex;flex-direction:column;gap:8px">
        ${sugestoes.map(s =>
          `<li>
            <button class="chip-historico" data-busca="${s.titulo}">
              📖 ${s.titulo} — ${s.autor}
            </button>
          </li>`
        ).join('')}
      </ul>
    `;
    container.querySelectorAll('[data-busca]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('detalhe-livro').classList.add('hidden');
        navegarParaBusca(btn.dataset.busca);
      });
    });
  } catch (e) {
    container.innerHTML = `<p style="color:#b91c1c">Erro: ${e.message}</p>`;
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '📚 Sugerir livros similares'; }
  }
}

// ── Favoritos ─────────────────────────────────────────────────
function handleToggleFavorito(id, e) {
  e.stopPropagation();
  const adicionado = toggleFavorito(id);
  const btn = e.currentTarget;
  btn.textContent  = adicionado ? '❤️' : '🤍';
  btn.classList.toggle('favoritado', adicionado);
  btn.setAttribute('aria-pressed',  String(adicionado));
  btn.setAttribute('aria-label',    adicionado ? 'Remover dos favoritos' : 'Adicionar aos favoritos');
}

// ── Delegação de eventos na grade ─────────────────────────────
function configurarGrade() {
  document.getElementById('grade-livros').addEventListener('click', async (e) => {
    // Botão de favorito
    const btnFav = e.target.closest('[data-fav]');
    if (btnFav) { handleToggleFavorito(btnFav.dataset.fav, e); return; }

    // Card — abrir detalhe
    const card = e.target.closest('.card-livro');
    if (!card) return;

    const id    = card.dataset.id;
    const livro = estado.resultados.find(l => l.id === id);
    if (livro) {
      abrirDetalhe(livro, handleGerarResenha, handleSugerirSimilares);
    }
  });

  // Navegação por teclado nos cards
  document.getElementById('grade-livros').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const card = e.target.closest('.card-livro');
      if (card) card.click();
    }
  });
}

// ── Histórico ─────────────────────────────────────────────────
function atualizarHistorico() {
  renderizarHistorico(carregarHistorico(), (termo) => navegarParaBusca(termo));
}

// ── Inicialização ─────────────────────────────────────────────
function init() {
  inicializarTema();
  posicionarNav();

  // Buscar ao clicar
  document.getElementById('btnBuscar').addEventListener('click', () => {
    const termo = document.getElementById('inputBusca').value.trim();
    if (termo) navegarParaBusca(termo);
  });

  // Buscar ao pressionar Enter
  document.getElementById('inputBusca').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const termo = document.getElementById('inputBusca').value.trim();
      if (termo) navegarParaBusca(termo);
    }
  });

  // Toggle de tema
  document.getElementById('btnTema').addEventListener('click', toggleTema);

  // Filtro de categoria
  document.getElementById('selectCat').addEventListener('change', (e) => {
    atualizarEstado({ categoriaAtiva: e.target.value, paginaAtual: 1 });
    renderizarPaginaAtual();
  });

  // Ordenação (re-busca ao mudar)
  document.getElementById('selectOrdem').addEventListener('change', () => {
    const { termoBusca } = estado;
    if (termoBusca) executarBusca(termoBusca);
  });

  // Navbar responsiva
  window.addEventListener('resize', debounce(posicionarNav, 150));

  // Delegação na grade
  configurarGrade();

  // Histórico inicial
  atualizarHistorico();

  // Sincronizar input com o termo da URL ao carregar
  const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const termoURL = params.get('q') || '';
  if (termoURL) document.getElementById('inputBusca').value = termoURL;

  // Iniciar roteador
  iniciarRouter(executarBusca);
}

init();
```

---

## Fase 2 — Instalar dependências e verificar

```bash
npm install
npm run dev
```

A aplicação deve abrir em `http://localhost:5173`. Verificar:

- [ ] Página carrega sem erros no console
- [ ] Botão de tema alterna claro/escuro
- [ ] Links da navbar mudam o hash da URL
- [ ] Input + Enter navega para `#/busca?q=TERMO`
- [ ] Buscar "tolkien" retorna livros reais da API
- [ ] Clicar num card abre o painel de detalhe
- [ ] Botão ❤️ persiste ao recarregar (requer chave Gemini para IA)

---

## Fase 3 — Configurar Git e branches

```bash
# Inicializar (se ainda não feito)
git init
git add .
git commit -m "feat: estrutura completa do BookSearch"

# Criar branch de desenvolvimento
git checkout -b dev

# Conectar ao GitHub (criar o repositório antes no github.com)
git remote add origin https://github.com/SEU_USUARIO/booksearch.git
git push -u origin main
git push -u origin dev
```

Configurar o GitHub Pages no repositório: Settings → Pages → Source: Deploy from branch → Branch: `gh-pages`.

---

## Fase 4 — Build e deploy

```bash
# Sempre fazer deploy a partir da main
git checkout main
git merge dev
git push origin main
npm run deploy
```

O projeto ficará disponível em `https://SEU_USUARIO.github.io/booksearch/` em até 2 minutos.

---

## Variáveis de ambiente necessárias

| Variável            | Onde obter                              | Obrigatória |
|---------------------|-----------------------------------------|-------------|
| `VITE_GEMINI_KEY`   | https://aistudio.google.com/app/apikey  | Para IA     |

A Google Books API não exige chave para buscas públicas com até 1000 requisições por dia.

---

## Funcionalidades implementadas

- [x] Busca por título, autor ou assunto via Google Books API
- [x] Filtro em tempo real por categoria
- [x] Ordenação por relevância ou data
- [x] Paginação (12 livros por página)
- [x] Painel de detalhe com informações completas
- [x] Resenha automática gerada por Gemini
- [x] Sugestão de livros similares via IA
- [x] Favoritos persistidos no localStorage
- [x] Histórico das últimas 5 buscas
- [x] Tema claro/escuro com detecção do sistema operacional
- [x] URL reflete o estado completo da busca
- [x] Navbar responsiva (base em mobile, topo em desktop)
- [x] Navegação por teclado (Enter nos cards)
- [x] Deploy automático no GitHub Pages

---

## Autor

Desenvolvido durante o curso técnico de JavaScript Frontend.
