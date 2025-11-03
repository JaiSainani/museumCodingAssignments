document.addEventListener('DOMContentLoaded', function () {
  /* ---------- Tabs (Archaeology / Anthropology / Histories) ---------- */
  const buttons  = document.querySelectorAll('.tab-btn');
  const sections = document.querySelectorAll('.collection-section');

  function showSection(id) {
    sections.forEach(s => { s.style.display = (s.id === id) ? 'block' : 'none'; });
    buttons.forEach(b => {
      const active = b.dataset.target === id;
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    // If user clicked a "Back to Collections" link, sync the active button
    const navBtn = document.querySelector(`.tab-btn[data-target="${id}"]`);
    if (navBtn) navBtn.classList.add('active');
  }

  buttons.forEach(btn => btn.addEventListener('click', () => showSection(btn.dataset.target)));

  // Allow links with .tab-link to switch sections (used by "Back to Collections")
  document.addEventListener('click', (e) => {
    const link = e.target.closest('.tab-link');
    if (link && link.dataset.target) {
      e.preventDefault();
      showSection(link.dataset.target);
    }
  });

  // Default
  showSection('archaeology');

  /* ---------- Text Modal for Collections (Phase 1) ---------- */
  const modal     = document.getElementById('modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn  = modal.querySelector('.close-modal');
  let lastTrigger = null;

  function openFrom(selector, trigger){
    const src = document.querySelector(selector);
    if (!src) { console.warn('Missing modal content:', selector); return; }
    modalBody.innerHTML = src.innerHTML;  // inject text HTML
    modal.style.display = 'grid';
    lastTrigger = trigger || null;
    closeBtn.focus();
    document.body.style.overflow = 'hidden'; // lock background scroll
  }

  function closeModal(){
    modal.style.display = 'none';
    modalBody.innerHTML = '';
    document.body.style.overflow = '';
    if (lastTrigger) lastTrigger.focus();
  }

  // Open on any element with data-modal-target
  document.addEventListener('click', (e)=>{
    const trigger = e.target.closest('[data-modal-target]');
    if (trigger){
      e.preventDefault();
      openFrom(trigger.getAttribute('data-modal-target'), trigger);
      return;
    }
    if (e.target === modal || e.target.closest('.close-modal')) closeModal();
  });

  document.addEventListener('keydown', (e)=>{
    if (e.key === 'Escape' && modal.style.display === 'grid') closeModal();
  });
});
