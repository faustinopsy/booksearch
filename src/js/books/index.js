import { createGoogleBooksProvider } from './googleBooks.js';
import { createOpenLibraryProvider }  from './openLibrary.js';
import { emit }                        from '../eventBus.js';

const providers = [
  createGoogleBooksProvider(),
  createOpenLibraryProvider(),
];

async function withFallback(fn) {
  let lastError;
  for (let i = 0; i < providers.length; i++) {
    try {
      const result = await fn(providers[i]);
      emit('books:provider', { nome: providers[i].nome, fallback: i > 0 });
      return result;
    } catch (err) {
      lastError = err;
      console.warn(`[${providers[i].nome}] falhou (${err.message}) — tentando próximo...`);
      if (i < providers.length - 1) {
        emit('books:fallback', { de: providers[i].nome, para: providers[i + 1].nome });
      }
    }
  }
  throw lastError;
}

export function buscarLivros(termo, maxResultados, ordenacao) {
  return withFallback(p => p.buscarLivros(termo, maxResultados, ordenacao));
}

export function buscarDetalheLivro(id) {
  // Roteia diretamente ao provider correto pelo prefixo do ID
  if (id.startsWith('ol:')) return providers[1].buscarDetalhe(id);
  return withFallback(p => p.buscarDetalhe(id));
}
