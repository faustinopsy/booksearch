const BASE  = import.meta.env.VITE_OLLAMA_URL   || 'http://localhost:11434';
const MODEL = import.meta.env.VITE_OLLAMA_MODEL || 'gemma4:latest';

async function chamar(prompt) {
  const res = await fetch(`${BASE}/api/generate`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ model: MODEL, prompt, stream: false }),
  });
  if (!res.ok) throw new Error(`Ollama retornou ${res.status} — o serviço está rodando em ${BASE}?`);
  const data = await res.json();
  return data.response;
}

export function createOllamaProvider() {
  return {
    nome: `Ollama (${MODEL})`,

    async gerarResenha(titulo, autores, categoria) {
      return chamar(
        `Escreva uma resenha crítica de 3 parágrafos em português brasileiro ` +
        `sobre o livro "${titulo}" de ${autores.join(', ')} ` +
        `(categoria: ${categoria || 'não especificada'}). ` +
        `Seja informativo, imparcial e envolvente. Não use markdown.`
      );
    },

    async sugerirSimilares(titulo, categoria) {
      const texto = await chamar(
        `Sugira exatamente 3 livros similares a "${titulo}" ` +
        `da categoria ${categoria || 'literatura'}. ` +
        `Responda SOMENTE em JSON válido, sem markdown, sem explicação: ` +
        `[{"titulo":"...","autor":"..."},{"titulo":"...","autor":"..."},{"titulo":"...","autor":"..."}]`
      );
      return JSON.parse(texto.replace(/```json|```/g, '').trim());
    },
  };
}
