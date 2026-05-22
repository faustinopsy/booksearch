export function aplicarTema(tema) {
  document.documentElement.dataset.tema = tema;
  localStorage.setItem('bs_tema', tema);
  const btn = document.getElementById('btnTema');
  if (btn) btn.textContent = tema === 'escuro' ? '☀️' : '🌙';
}

export function inicializarTema() {
  const salvo   = localStorage.getItem('bs_tema');
  const sistema = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro';
  aplicarTema(salvo || sistema);
}

export function toggleTema() {
  const atual = document.documentElement.dataset.tema;
  aplicarTema(atual === 'escuro' ? 'claro' : 'escuro');
}
