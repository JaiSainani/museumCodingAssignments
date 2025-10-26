document.addEventListener('DOMContentLoaded', function () {
  const buttons = document.querySelectorAll('.tab-btn');
  const sections = document.querySelectorAll('.collection-section');

  function showSection(id) {
    sections.forEach(s => {
      s.style.display = (s.id === id) ? 'block' : 'none';
    });
    buttons.forEach(b => {
      const active = b.dataset.target === id;
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => showSection(btn.dataset.target));
  });

  // Default
  showSection('archaeology');
});
