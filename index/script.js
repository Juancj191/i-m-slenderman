// ===== Juan Clothing - Full JS =====

document.addEventListener('DOMContentLoaded', () => {

  let cart = JSON.parse(localStorage.getItem('juan_cart')) || [];
  let favorites = JSON.parse(localStorage.getItem('juan_favs')) || [];
  let currentProduct = null;

  const products = document.querySelectorAll('.product-card');
  const categories = document.querySelectorAll('.category');
  const searchInput = document.getElementById('searchInput');

  const productModal = document.getElementById('productModal');
  const modalClose = document.getElementById('modalClose');
  const modalImg = document.getElementById('modalImg');
  const modalName = document.getElementById('modalName');
  const modalColor = document.getElementById('modalColor');
  const modalPrice = document.getElementById('modalPrice');
  const modalLast = document.getElementById('modalLast');
  const addToCartBtn = document.getElementById('addToCartBtn');
  const modalFavBtn = document.getElementById('modalFavBtn');

  const cartBtn = document.getElementById('cartBtn');
  const cartSidebar = document.getElementById('cartSidebar');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartClose = document.getElementById('cartClose');
  const cartItems = document.getElementById('cartItems');
  const cartCount = document.getElementById('cartCount');
  const cartTotal = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');

  const favBtn = document.getElementById('favBtn');
  const favSidebar = document.getElementById('favSidebar');
  const favOverlay = document.getElementById('favOverlay');
  const favClose = document.getElementById('favClose');
  const favItems = document.getElementById('favItems');
  const favCount = document.getElementById('favCount');

  const toast = document.getElementById('toast');

  function formatPrice(n) {
    return 'RD$' + Number(n).toLocaleString('es-DO');
  }

  function save() {
    localStorage.setItem('juan_cart', JSON.stringify(cart));
    localStorage.setItem('juan_favs', JSON.stringify(favorites));
  }

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2200);
  }

  function updateBadges() {
    const cCount = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCount.textContent = cCount;
    cartCount.classList.toggle('show', cCount > 0);
    favCount.textContent = favorites.length;
    favCount.classList.toggle('show', favorites.length > 0);
  }

  function renderCart() {
    if (cart.length === 0) {
      cartItems.innerHTML = '<div class="cart-empty">Tu carrito está vacío</div>';
      cartTotal.textContent = 'RD$0';
      return;
    }

    cartItems.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img src="${item.img}" alt="${item.name}">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p>${item.color}</p>
          <div class="cart-item-price">${formatPrice(item.price)} × ${item.qty}</div>
        </div>
        <button class="cart-item-remove" data-id="${item.id}">&times;</button>
      </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    cartTotal.textContent = formatPrice(total);

    cartItems.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        cart = cart.filter(item => item.id !== btn.dataset.id);
        save();
        renderCart();
        updateBadges();
        showToast('Producto eliminado del carrito');
      });
    });
  }

  function renderFavs() {
    if (favorites.length === 0) {
      favItems.innerHTML = '<div class="cart-empty">No tienes favoritos todavía</div>';
      return;
    }

    favItems.innerHTML = favorites.map(item => `
      <div class="cart-item">
        <img src="${item.img}" alt="${item.name}">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p>${item.color}</p>
          <div class="cart-item-price">${formatPrice(item.price)}</div>
        </div>
        <button class="cart-item-remove" data-id="${item.id}">&times;</button>
      </div>
    `).join('');

    favItems.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        favorites = favorites.filter(item => item.id !== btn.dataset.id);
        save();
        renderFavs();
        updateFavButtons();
        updateBadges();
        showToast('Eliminado de favoritos');
      });
    });
  }

  function updateFavButtons() {
    document.querySelectorAll('.fav-btn').forEach(btn => {
      btn.classList.toggle('active', favorites.some(f => f.id === btn.dataset.id));
    });
  }

  function openModal(card) {
    currentProduct = {
      id: card.dataset.id,
      name: card.dataset.name,
      color: card.dataset.color,
      price: Number(card.dataset.price),
      last: card.dataset.last,
      img: card.dataset.img
    };

    modalImg.src = currentProduct.img;
    modalName.textContent = currentProduct.name;
    modalColor.textContent = currentProduct.color;
    modalPrice.textContent = formatPrice(currentProduct.price);
    modalLast.textContent = 'Última venta: ' + formatPrice(currentProduct.last);
    modalFavBtn.classList.toggle('active', favorites.some(f => f.id === currentProduct.id));

    productModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    productModal.classList.remove('open');
    document.body.style.overflow = '';
    currentProduct = null;
  }

  products.forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.fav-btn')) return;
      openModal(card);
    });

    const btn = card.querySelector('.fav-btn');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(card.dataset.id, card);
      });
    }
  });

  function toggleFavorite(id, card = null) {
    const exists = favorites.findIndex(f => f.id === id);
    if (exists > -1) {
      favorites.splice(exists, 1);
      showToast('Eliminado de favoritos');
    } else {
      const source = card || document.querySelector(`.product-card[data-id="${id}"]`);
      if (!source) return;
      favorites.push({
        id: source.dataset.id,
        name: source.dataset.name,
        color: source.dataset.color,
        price: Number(source.dataset.price),
        img: source.dataset.img
      });
      showToast('Añadido a favoritos ♥');
    }
    save();
    updateFavButtons();
    updateBadges();
    renderFavs();
  }

  addToCartBtn.addEventListener('click', () => {
    if (!currentProduct) return;
    const existing = cart.find(item => item.id === currentProduct.id);
    if (existing) existing.qty += 1;
    else cart.push({ ...currentProduct, qty: 1 });
    save();
    renderCart();
    updateBadges();
    showToast('Añadido al carrito 🛒');
    closeModal();
  });

  modalFavBtn.addEventListener('click', () => {
    if (!currentProduct) return;
    toggleFavorite(currentProduct.id);
    modalFavBtn.classList.toggle('active', favorites.some(f => f.id === currentProduct.id));
  });

  cartBtn.addEventListener('click', () => {
    renderCart();
    cartSidebar.classList.add('open');
    cartOverlay.classList.add('open');
  });
  cartClose.addEventListener('click', () => {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('open');
  });
  cartOverlay.addEventListener('click', () => {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('open');
  });

  favBtn.addEventListener('click', () => {
    renderFavs();
    favSidebar.classList.add('open');
    favOverlay.classList.add('open');
  });
  favClose.addEventListener('click', () => {
    favSidebar.classList.remove('open');
    favOverlay.classList.remove('open');
  });
  favOverlay.addEventListener('click', () => {
    favSidebar.classList.remove('open');
    favOverlay.classList.remove('open');
  });

  modalClose.addEventListener('click', closeModal);
  productModal.addEventListener('click', (e) => {
    if (e.target === productModal) closeModal();
  });

  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) return showToast('El carrito está vacío');
    showToast('¡Compra simulada con éxito! 🎉');
    cart = [];
    save();
    renderCart();
    updateBadges();
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('open');
  });

  categories.forEach(cat => {
    cat.addEventListener('click', (e) => {
      e.preventDefault();
      categories.forEach(c => c.classList.remove('active'));
      cat.classList.add('active');
      const filter = cat.dataset.filter;
      products.forEach(p => {
        p.classList.toggle('hidden', filter !== 'all' && p.dataset.brand !== filter);
      });
    });
  });

  searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase().trim();
    products.forEach(p => {
      const match = p.dataset.name.toLowerCase().includes(q) || p.dataset.color.toLowerCase().includes(q);
      p.classList.toggle('hidden', q && !match);
    });
  });

  updateBadges();
  updateFavButtons();
  console.log('Juan Clothing cargado 🖤');
});