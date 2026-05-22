import { getAIProvider }         from '../ai/index.js';
import { escaparHTML }           from '../utils/dom.js';
import { navegarParaBusca }      from './busca.js';

export async function handleGerarResenha(livro, container) {
  const btn = document.getElementById('btnGerarResenha');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Gerando resenha...'; }

  try {
    const ai    = getAIProvider();
    const texto = await ai.gerarResenha(livro.titulo, livro.autores, livro.categoria);

    container.innerHTML = `
      <div class="resenha-ia">${escaparHTML(texto).replace(/\n/g, '<br>')}</div>
      <button class="btn-copiar" id="btnCopiar">📋 Copiar</button>
    `;

    document.getElementById('btnCopiar')?.addEventListener('click', async () => {
      await navigator.clipboard.writeText(texto).catch(() => {});
      const b = document.getElementById('btnCopiar');
      if (b) {
        b.textContent = '✅ Copiado!';
        setTimeout(() => { b.textContent = '📋 Copiar'; }, 2000);
      }
    });
  } catch (e) {
    container.innerHTML = `<p style="color:var(--clr-danger);font-size:var(--text-sm)">⚠️ ${escaparHTML(e.message)}</p>`;
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '✨ Gerar resenha com IA'; }
  }
}

export async function handleSugerirSimilares(livro, container) {
  const btn = document.getElementById('btnSimilares');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Buscando similares...'; }

  try {
    const ai        = getAIProvider();
    const sugestoes = await ai.sugerirSimilares(livro.titulo, livro.categoria);

    container.innerHTML = `
      <p class="similares-titulo">Livros similares</p>
      <ul class="similares-lista">
        ${sugestoes.map(s => `
          <li>
            <button data-busca="${escaparHTML(s.titulo)}">
              📖 ${escaparHTML(s.titulo)} — ${escaparHTML(s.autor)}
            </button>
          </li>
        `).join('')}
      </ul>
    `;

    container.querySelectorAll('[data-busca]').forEach(b => {
      b.addEventListener('click', () => {
        document.getElementById('detalhe-livro').classList.add('hidden');
        navegarParaBusca(b.dataset.busca);
      });
    });
  } catch (e) {
    container.innerHTML = `<p style="color:var(--clr-danger);font-size:var(--text-sm)">⚠️ ${escaparHTML(e.message)}</p>`;
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '📚 Sugerir livros similares'; }
  }
}
