document.addEventListener('DOMContentLoaded', function () {
  const grid = document.querySelector('.shop-grid');
  const modal = document.getElementById('item-modal');
  const modalDialog = modal.querySelector('.modal-dialog');
  const modalImg = document.getElementById('modal-image');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalPrice = document.getElementById('modal-price');
  const modalAdd = document.getElementById('modal-add');

  let currentItem = null; 

  function openModal(itemEl) {
    const title = itemEl.dataset.title;
    const price = Number(itemEl.dataset.price || 0).toFixed(2);
    const img = itemEl.dataset.img;
    const coll = itemEl.dataset.collection;
    const mat = itemEl.dataset.material;
    const loc = itemEl.dataset.location;
    const purpose = itemEl.dataset.purpose;

    currentItem = {
      id: itemEl.dataset.id,
      title, price, img,
      coll, mat, loc, purpose
    };

    modalImg.src = img;
    modalImg.alt = title;
    modalTitle.textContent = title;
    modalDesc.textContent = `${coll} — Material: ${mat}; Location: ${loc}; Purpose: ${purpose}.`;
    modalPrice.textContent = `$${price}`;
    modalAdd.textContent = `Add ${title} to Cart`;

    modal.removeAttribute('hidden');
    modalDialog.focus();
  }

  function closeModal() {
    modal.setAttribute('hidden', '');
    currentItem = null;
  }

  function addToCart(title, price) {
    // Phase 1 spec: use a prompt to simulate cart action
    const msg = `${title}\nPrice: $${Number(price).toFixed(2)}\n\n(Phase 2 will implement the real cart.)\nEnter quantity (1-9) or Cancel:`;
    const input = prompt(msg, '1');
    if (input === null) return; // user canceled
    const qty = parseInt(input, 10);
    if (!isNaN(qty) && qty > 0) {
      alert(`Added ${qty} × ${title} to cart (placeholder).`);
    } else {
      alert('No valid quantity entered.');
    }
  }

  // Card interactions (open modal or add from card)
  grid.addEventListener('click', (e) => {
    const img = e.target.closest('.souvenir-img');
    if (img) {
      const card = e.target.closest('.souvenir-item');
      if (card) openModal(card);
      return;
    }
    const addBtn = e.target.closest('.add-btn');
    if (addBtn && e.target.closest('.souvenir-item')) {
      const card = e.target.closest('.souvenir-item');
      addToCart(card.dataset.title, card.dataset.price);
    }
  });

  // Modal interactions
  modal.addEventListener('click', (e) => {
    if (e.target.dataset.close || e.target.classList.contains('modal')) {
      closeModal();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (!modal.hasAttribute('hidden') && e.key === 'Escape') closeModal();
  });
  modalAdd.addEventListener('click', () => {
    if (currentItem) addToCart(currentItem.title, currentItem.price);
  });
});
