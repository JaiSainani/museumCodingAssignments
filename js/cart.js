// ================================
// Shopping Cart (single render model)
// ================================
const CART_KEY = 'museumCartV1';
const MEMBER_KEY = 'museumCartMember';
const DISCOUNT_CHOICE_KEY = 'museumCartDiscountChoice';

// Constants per spec
const TAX_RATE = 0.102;                // 10.2%
const MEMBER_DISCOUNT_RATE = 0.15;     // 15%
const SHIPPING_RATE = 25.00;

const moneyNF = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

// Provided helpers (allowed)
function readCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}
function writeCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

document.addEventListener('DOMContentLoaded', () => {
  // hydrate member checkbox from storage
  const memberToggle = document.getElementById('memberToggle');
  memberToggle.checked = localStorage.getItem(MEMBER_KEY) === '1';

  // wire controls
  document.getElementById('keepShoppingBtn').addEventListener('click', () => {
    location.href = 'shop.html';
  });
  document.getElementById('clearCartBtn').addEventListener('click', () => {
    writeCart([]);
    render();
  });
  memberToggle.addEventListener('change', () => {
    localStorage.setItem(MEMBER_KEY, memberToggle.checked ? '1' : '0');
    // Reset prior choice when membership flips; re-prompt if needed
    localStorage.removeItem(DISCOUNT_CHOICE_KEY);
    render();
  });

  // delegate Remove buttons
  document.getElementById('cart-root').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    let cart = readCart();
    if (btn.dataset.action === 'remove') {
      const id = btn.dataset.id;
      cart = cart.filter(it => it.id !== id);
      writeCart(cart);
      render();
    }
  });

  render();
});

function render() {
  const root = document.getElementById('cart-root');
  const isMember = document.getElementById('memberToggle').checked;

  // Read + normalize cart
  const cart = readCart()
    .filter(it => it && Number(it.unitPrice) > 0 && Number(it.qty) > 0);

  // Empty cart UX
  if (cart.length === 0) {
    root.innerHTML = `
      <div class="empty-cart">
        <p>Your cart is empty.</p>
        <div class="cart-summary">
          <div class="sum-row"><span>Subtotal of items</span><span class="amount">$0.00</span></div>
          <div class="sum-row"><span>Volume discount</span><span class="amount">$0.00</span></div>
          <div class="sum-row"><span>Member discount</span><span class="amount">$0.00</span></div>
          <div class="sum-row"><span>Shipping</span><span class="amount">${moneyNF.format(SHIPPING_RATE)}</span></div>
          <div class="sum-row sum-subtotal"><span>Subtotal (taxable)</span><span class="amount">${moneyNF.format(SHIPPING_RATE)}</span></div>
          <div class="sum-row"><span>Tax rate</span><span class="amount">${(TAX_RATE*100).toFixed(1)}%</span></div>
          <div class="sum-row"><span>Tax amount</span><span class="amount">${moneyNF.format(SHIPPING_RATE * TAX_RATE)}</span></div>
          <div class="sum-row sum-total"><span>Invoice total</span><span class="amount">${moneyNF.format(SHIPPING_RATE + SHIPPING_RATE*TAX_RATE)}</span></div>
        </div>
      </div>`;
    return;
  }

  // Item totals
  let itemTotal = 0;
  cart.forEach(it => { itemTotal += Number(it.unitPrice) * Number(it.qty); });

  // Volume tiers
  let volRate = 0;
  if (itemTotal >= 200) volRate = 0.15;
  else if (itemTotal >= 100) volRate = 0.10;
  else if (itemTotal >= 50) volRate = 0.05;

  // Choose ONE discount (mutually exclusive)
  let chosen = localStorage.getItem(DISCOUNT_CHOICE_KEY) || 'auto';
  if (isMember && volRate > 0 && chosen === 'auto') {
    const okMember = window.confirm(
      `Both discounts are available:\n\n• Membership 15%\n• Volume ${Math.round(volRate*100)}%\n\nOK = Membership,  Cancel = Volume`
    );
    chosen = okMember ? 'member' : 'volume';
    localStorage.setItem(DISCOUNT_CHOICE_KEY, chosen);
  }
  if (!isMember && volRate > 0 && chosen === 'auto') chosen = 'volume';
  if (!isMember && volRate === 0) chosen = 'none';

  let memberDiscount = 0, volumeDiscount = 0;
  if (chosen === 'member' && isMember) memberDiscount = itemTotal * MEMBER_DISCOUNT_RATE;
  else if (chosen === 'volume' && volRate > 0) volumeDiscount = itemTotal * volRate;

  const discounts = memberDiscount + volumeDiscount;

  // Subtotal (taxable) after discounts + shipping
  const taxableSub = (itemTotal - discounts + SHIPPING_RATE);
  const taxAmt = taxableSub * TAX_RATE;
  const invoiceTotal = taxableSub + taxAmt;

  // Small inline formatter to show negatives in parentheses
  const fmt = (v) => {
    const r = Math.round(Math.abs(v) * 100) / 100;
    const s = moneyNF.format(r);
    return v < 0 ? `(${s})` : moneyNF.format(r);
  };

  // Build rows
  const rows = cart.map(it => {
    const line = Number(it.unitPrice) * Number(it.qty);
    const u = moneyNF.format(Number(it.unitPrice));
    return `
      <tr class="cart-row">
        <td class="cart-thumb"><img src="${it.image}" alt="" /></td>
        <td class="cart-name">
          <strong>${it.name}</strong><br/>
          <span class="muted">Unit: ${u} × ${it.qty}</span>
        </td>
        <td class="amount">${moneyNF.format(line)}</td>
        <td class="cart-actions">
          <button type="button" class="add-btn" data-action="remove" data-id="${it.id}">Remove</button>
        </td>
      </tr>`;
  }).join('');

  // Render
  root.innerHTML = `
    <table class="cart-table" aria-describedby="summary">
      <thead>
        <tr>
          <th>Item</th>
          <th>Description</th>
          <th class="amounts-col">Amount</th>
          <th></th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <div class="cart-summary" id="summary">
      <div class="sum-row"><span>Subtotal of items</span><span class="amount">${moneyNF.format(itemTotal)}</span></div>
      <div class="sum-row"><span>Volume discount ${volRate>0 ? '('+Math.round(volRate*100)+'%)' : ''}</span><span class="amount">${fmt(-volumeDiscount)}</span></div>
      <div class="sum-row"><span>Member discount ${isMember ? '(15%)' : ''}</span><span class="amount">${fmt(-memberDiscount)}</span></div>
      <div class="sum-row"><span>Shipping</span><span class="amount">${moneyNF.format(SHIPPING_RATE)}</span></div>
      <div class="sum-row sum-subtotal"><span>Subtotal (taxable)</span><span class="amount">${moneyNF.format(taxableSub)}</span></div>
      <div class="sum-row"><span>Tax rate</span><span class="amount">${(TAX_RATE*100).toFixed(1)}%</span></div>
      <div class="sum-row"><span>Tax amount</span><span class="amount">${moneyNF.format(taxAmt)}</span></div>
      <div class="sum-row sum-total"><span>Invoice total</span><span class="amount">${moneyNF.format(invoiceTotal)}</span></div>
    </div>
  `;
}
