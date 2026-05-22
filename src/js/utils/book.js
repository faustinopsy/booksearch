export function classificarLivro(nota) {
  if (nota >= 4.5) return { label: 'Excelente', cor: '#057A55', bg: '#DEF7EC' };
  if (nota >= 3.5) return { label: 'Bom',       cor: '#1A56DB', bg: '#EBF5FF' };
  if (nota >= 2.0) return { label: 'Regular',   cor: '#B45309', bg: '#FFFBEB' };
  return                  { label: 'Sem nota',  cor: '#6B7280', bg: '#F3F4F6' };
}

export function formatarAutores(autores) {
  if (!autores?.length) return 'Autor desconhecido';
  if (autores.length === 1) return autores[0];
  return autores.slice(0, 2).join(', ') + (autores.length > 2 ? ' e outros' : '');
}

export function traduzirCategoria(cat) {
  if (!cat) return '';
  const map = {
    'fiction':         'Ficção',
    'science fiction': 'Ficção Científica',
    'mystery':         'Mistério',
    'thriller':        'Suspense',
    'biography':       'Biografia',
    'history':         'História',
    'technology':      'Tecnologia',
    'computers':       'Computação',
    'self-help':       'Autoajuda',
    'romance':         'Romance',
    'fantasy':         'Fantasia',
    'horror':          'Terror',
    'science':         'Ciência',
    'business':        'Negócios',
    'philosophy':      'Filosofia',
    'poetry':          'Poesia',
    'comics':          'Quadrinhos',
    'cooking':         'Culinária',
    'travel':          'Viagens',
    'art':             'Arte',
  };
  return map[cat.toLowerCase()] || cat;
}

export function filtrarCategoria(lista, cat) {
  if (!cat) return lista;
  return lista.filter(l => l.categoria === cat);
}

export function paginar(lista, pagina, porPagina = 12) {
  const inicio = (pagina - 1) * porPagina;
  return lista.slice(inicio, inicio + porPagina);
}

export function totalPaginas(lista, porPagina = 12) {
  return Math.max(1, Math.ceil(lista.length / porPagina));
}

export function categoriasUnicas(lista) {
  return [...new Set(lista.map(l => l.categoria).filter(Boolean))].sort();
}
