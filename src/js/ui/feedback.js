import { renderizarSkeletons } from './card.js';

export function mostrarAviso(msg) {
  let el = document.getElementById('aviso-provider');
  if (!el) {
    el = document.createElement('div');
    el.id = 'aviso-provider';
    el.className = 'aviso-provider';
    document.getElementById('grade-livros').before(el);
  }
  el.textContent = msg;
  el.classList.remove('hidden');
}

export function esconderAviso() {
  document.getElementById('aviso-provider')?.classList.add('hidden');
}

export function mostrarLoading(n = 12) {
  esconderErro();
  document.getElementById('paginacao').innerHTML = '';
  renderizarSkeletons(n);
  const sw = document.getElementById('selectWrapper');
  if (sw) sw.classList.add('hidden');
}

export function esconderLoading() {
  /* noop — renderizarLivros sobrescreve os skeletons */
}

export function mostrarErro(msg) {
  const div = document.getElementById('erro');
  div.textContent = '⚠️ ' + msg;
  div.classList.remove('hidden');
  document.getElementById('grade-livros').innerHTML = '';
  document.getElementById('paginacao').innerHTML = '';
}

export function esconderErro() {
  document.getElementById('erro').classList.add('hidden');
}
