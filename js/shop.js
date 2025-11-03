document.addEventListener('DOMContentLoaded', function () {
  const grid = document.querySelector('.shop-grid');

  // Modal elements
  const modal = document.getElementById('item-modal');
  const modalDialog = modal.querySelector('.modal-dialog');
  const modalImg = document.getElementById('modal-image');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalPrice = document.getElementById('modal-price');
  const modalAdd = document.getElementById('modal-add');

  let currentItem = null;

  // ----------------------------
  // Cart storage helpers
  // ----------------------------
  const CART_KEY = 'museumCartV1';

  function readCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
  }
  function writeCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  // Main Add-to-Cart per assignment
  window.addToCart = function (btn) {
    const id = btn.dataset.id;
    const name = btn.dataset.name;
    const unitPrice = Number(btn.dataset.price);
    const image = btn.dataset.image;

    let cart = readCart();
    const idx = cart.findIndex(it => it.id === id);
    if (idx >= 0) {
      cart[idx].qty += 1;
    } else {
      cart.push({ id, name, unitPrice, qty: 1, image });
    }
    writeCart(cart);

    // Update the item-card qty badge
    const card = btn.closest('.souvenir-item');
    if (card) {
      const badge = card.querySelector('.qty-badge');
      if (badge) {
        const item = cart.find(it => it.id === id);
        badge.textContent = item ? `Qty: ${item.qty}` : '';
      }
    }
  };

  // ----------------------------
  // Modal open/close
  // ----------------------------
  function openModal(card) {
    const id = card.dataset.id;
    const title = card.dataset.title;
    const price = Number(card.dataset.price || 0).toFixed(2);
    const img = card.dataset.img;

    currentItem = { id, title, price, img };

    modalImg.src = img;
    modalImg.alt = title;
    modalTitle.textContent = title;
    modalDesc.textContent = `Collection item — reference replica.`;
    modalPrice.textContent = `$${price}`;

    // Make modal "Add" use the same dataset contract
    modalAdd.dataset.id = id;
    modalAdd.dataset.name = title;
    modalAdd.dataset.price = price;
    modalAdd.dataset.image = img;

    modal.removeAttribute('hidden');
    modalDialog.focus();
  }

  function closeModal() {
    modal.setAttribute('hidden', '');
    currentItem = null;
  }

  // Card interactions
  grid.addEventListener('click', (e) => {
    const img = e.target.closest('.souvenir-img');
    if (img) {
      const card = e.target.closest('.souvenir-item');
      if (card) openModal(card);
      return;
    }
    // add buttons use inline onclick="addToCart(this)" now
  });

  // Modal interactions
  modal.addEventListener('click', (e) => {
    if (e.target.dataset.close || e.target.classList.contains('modal-backdrop')) {
      closeModal();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (!modal.hasAttribute('hidden') && e.key === 'Escape') closeModal();
  });
  modalAdd.addEventListener('click', (e) => {
    // Use the unified addToCart
    window.addToCart(e.currentTarget);
  });

  // Hydrate qty badges from stored cart on load
  (function hydrateBadges() {
    const cart = readCart();
    document.querySelectorAll('.souvenir-item').forEach(card => {
      const btn = card.querySelector('.add-btn');
      const badge = card.querySelector('.qty-badge');
      if (btn && badge) {
        const id = btn.dataset.id;
        const found = cart.find(it => it.id === id);
        badge.textContent = found ? `Qty: ${found.qty}` : '';
      }
    });
  })();
});
