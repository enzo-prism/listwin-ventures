document.addEventListener('DOMContentLoaded', () => {
  const button = document.querySelector('[data-print-cv]');
  button?.addEventListener('click', () => window.print());
});
