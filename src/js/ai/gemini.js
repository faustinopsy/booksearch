const KEY = import.meta.env.VITE_GEMINI_KEY || '';
const URL  = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${KEY}`;

async function chamar(prompt) {
  if (!KEY) throw new Error('VITE_GEMINI_KEY não configurada no .env');
  const res = await fetch(URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  if (!res.ok) throw new Error(`Gemini retornou ${res.status}`);
  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}

export function createGeminiProvider() {
  return {
    nome: 'Gemini',

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
