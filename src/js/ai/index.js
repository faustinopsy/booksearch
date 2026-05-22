import { createGeminiProvider } from './gemini.js';
import { createOllamaProvider } from './ollama.js';

const PROVIDER = (import.meta.env.VITE_AI_PROVIDER || 'gemini').toLowerCase();

let _instancia = null;

export function getAIProvider() {
  if (_instancia) return _instancia;
  _instancia = PROVIDER === 'ollama'
    ? createOllamaProvider()
    : createGeminiProvider();
  return _instancia;
}
