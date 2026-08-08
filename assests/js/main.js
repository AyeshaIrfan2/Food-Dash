/**
 * Food Dash - Interactive Application Logic
 * Handles cart management, food ordering modals, regional filtering,
 * live search, order tracking, and page navigation.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Cart from localStorage or default
  let cart = JSON.parse(localStorage.getItem('fooddash_cart')) || [];

  // DOM Elements
  const searchIcon = document.querySelector('.search-icon');
  const navCustomerImg = document.querySelector('nav .d-flex.align-items-center img');
  const trackOrderBtn = document.querySelector('.btn-track-order');
  const regionItems = document.querySelectorAll('.region-item');

  // Inject Cart Badge in Header
  setupHeaderCartAndUser();

  // Attach Event Listeners
  initSearchModal();
  initOrderSystem();
  initTrackOrderModal();
  initRegionFilter();
  initSmoothScroll();
  initAuthForms();

  /**
   * Header Cart Badge & User Profile Link Setup
   */
  function setupHeaderCartAndUser() {
    const headerContainer = document.querySelector('header nav .d-flex.align-items-center');
    if (!headerContainer) return;

    // Make customer image link to login/signup page if not already linked
    if (navCustomerImg && navCustomerImg.parentElement.tagName !== 'A') {
      const authLink = document.createElement('a');
      authLink.href = 'login.html';
      authLink.className = 'd-inline-flex align-items-center text-decoration-none ms-2 user-avatar-link';
      authLink.title = 'Account / Login';
      
      // Wrap image in link
      navCustomerImg.parentNode.insertBefore(authLink, navCustomerImg);
      authLink.appendChild(navCustomerImg);
    }

    // Add Cart Icon with Dynamic Badge
    let cartBtn = document.getElementById('cartHeaderBtn');
    if (!cartBtn) {
      cartBtn = document.createElement('div');
      cartBtn.id = 'cartHeaderBtn';
      cartBtn.className = 'cart-icon rounded-circle d-flex align-items-center justify-content-center me-2 position-relative cursor-pointer';
      cartBtn.setAttribute('title', 'View Cart');
      cartBtn.innerHTML = `
        <i class="bi bi-cart3 fs-5"></i>
        <span id="cartCountBadge" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="font-size: 0.7rem; display: ${cart.length > 0 ? 'inline-block' : 'none'};">
          ${cart.reduce((total, item) => total + item.quantity, 0)}
        </span>
      `;
      // Insert before search icon or first element
      headerContainer.insertBefore(cartBtn, headerContainer.firstChild);
    }

    cartBtn.addEventListener('click', openCartModal);
  }

  /**
   * Update Cart Count Badge
   */
  function updateCartBadge() {
    localStorage.setItem('fooddash_cart', JSON.stringify(cart));
    const badge = document.getElementById('cartCountBadge');
    if (badge) {
      const count = cart.reduce((total, item) => total + item.quantity, 0);
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-block' : 'none';
      badge.classList.add('pulse-anim');
      setTimeout(() => badge.classList.remove('pulse-anim'), 300);
    }
  }

  /**
   * Order Modal & Buy Now Logic
   */
  function initOrderSystem() {
    // Inject Order Confirmation & Cart Modal into body
    if (!document.getElementById('orderModal')) {
      const modalHTML = `
        <div class="modal fade" id="orderModal" tabindex="-1" aria-labelledby="orderModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg rounded-4">
              <div class="modal-header border-0 bg-light-orange rounded-top-4">
                <h5 class="modal-header-title text-orange fw-bold m-0" id="orderModalLabel">
                  <i class="bi bi-bag-check-fill me-2"></i>Order Food
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body p-4" id="orderModalBody">
                <!-- Dynamic Content -->
              </div>
            </div>
          </div>
        </div>

        <div class="modal fade" id="cartModal" tabindex="-1" aria-labelledby="cartModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content border-0 shadow-lg rounded-4">
              <div class="modal-header border-0 bg-light-orange rounded-top-4">
                <h5 class="modal-title text-orange fw-bold m-0" id="cartModalLabel">
                  <i class="bi bi-cart4 me-2"></i>Your Food Cart
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body p-4" id="cartModalBody">
                <!-- Cart Items List -->
              </div>
              <div class="modal-footer border-0" id="cartModalFooter">
                <button type="button" class="btn btn-outline-secondary rounded-pill px-4" data-bs-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary btn-order-now rounded-pill px-4 text-white fw-semibold" id="checkoutBtn">Proceed to Checkout</button>
              </div>
            </div>
          </div>
        </div>

        <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1100;">
          <div id="foodToast" class="toast align-items-center text-white bg-success border-0 rounded-3 shadow" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
              <div class="toast-body d-flex align-items-center gap-2" id="toastMessage">
                <i class="bi bi-check-circle-fill fs-5"></i> Item added to cart!
              </div>
              <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Attach click handlers to dish cards & Buy Now / Order buttons
    document.body.addEventListener('click', (e) => {
      const orderBtn = e.target.closest('.m-btn, .btn-order-now, .p-link');
      if (!orderBtn) return;

      e.preventDefault();

      // If it's a dish order button, extract details from card
      const card = orderBtn.closest('.f-name, .col-md-4');
      let title = "Special Food Dish";
      let price = 250;
      let imgSrc = "assests/images/logo.png";

      if (card) {
        const titleEl = card.querySelector('.f-text, .p-name');
        const priceEl = card.querySelector('h2');
        const imgEl = card.querySelector('img:not(.m-img)');

        if (titleEl) title = titleEl.textContent.replace(/⭐/g, '').trim();
        if (priceEl) {
          const num = priceEl.textContent.replace(/[^0-9]/g, '');
          if (num) price = parseInt(num, 10);
        }
        if (imgEl && imgEl.src) imgSrc = imgEl.src;
      }

      openDishOrderModal(title, price, imgSrc);
    });
  }

  /**
   * Open Order Modal for a Specific Dish
   */
  function openDishOrderModal(title, price, imgSrc) {
    const modalBody = document.getElementById('orderModalBody');
    if (!modalBody) return;

    let qty = 1;

    modalBody.innerHTML = `
      <div class="text-center mb-3">
        <img src="${imgSrc}" alt="${title}" style="max-height: 140px; width: auto; object-fit: contain;" class="mb-3">
        <h4 class="fw-bold text-dark mb-1">${title}</h4>
        <h3 class="text-orange fw-bold mb-3">₹<span id="modalItemPrice">${price}</span></h3>
      </div>
      <div class="d-flex align-items-center justify-content-center gap-3 mb-4">
        <span class="fw-semibold">Quantity:</span>
        <div class="input-group style-qty-group" style="width: 130px;">
          <button class="btn btn-outline-secondary rounded-circle" type="button" id="minusQtyBtn">-</button>
          <span class="form-control text-center border-0 bg-transparent fw-bold fs-5" id="modalQtyDisplay">1</span>
          <button class="btn btn-outline-secondary rounded-circle" type="button" id="plusQtyBtn">+</button>
        </div>
      </div>
      <div class="mb-3">
        <label class="form-label small fw-semibold text-secondary">Delivery Note / Customization:</label>
        <input type="text" class="form-control rounded-3" id="orderCustomNote" placeholder="e.g. Less spicy, extra sauce">
      </div>
      <div class="d-grid gap-2">
        <button class="btn btn-primary btn-order-now w-100 rounded-pill py-2 text-white fw-bold" id="confirmAddToCartBtn">
          Add to Cart (₹<span id="modalTotalPrice">${price}</span>)
        </button>
      </div>
    `;

    const minusBtn = document.getElementById('minusQtyBtn');
    const plusBtn = document.getElementById('plusQtyBtn');
    const qtyDisplay = document.getElementById('modalQtyDisplay');
    const totalPriceEl = document.getElementById('modalTotalPrice');
    const confirmBtn = document.getElementById('confirmAddToCartBtn');

    plusBtn.addEventListener('click', () => {
      qty++;
      qtyDisplay.textContent = qty;
      totalPriceEl.textContent = price * qty;
    });

    minusBtn.addEventListener('click', () => {
      if (qty > 1) {
        qty--;
        qtyDisplay.textContent = qty;
        totalPriceEl.textContent = price * qty;
      }
    });

    confirmBtn.addEventListener('click', () => {
      const note = document.getElementById('orderCustomNote').value;
      const existing = cart.find(item => item.title === title);

      if (existing) {
        existing.quantity += qty;
        existing.note = note || existing.note;
      } else {
        cart.push({ title, price, quantity: qty, imgSrc, note });
      }

      updateCartBadge();

      const bsModal = bootstrap.Modal.getInstance(document.getElementById('orderModal'));
      if (bsModal) bsModal.hide();

      showToast(`Added ${qty}x ${title} to your cart!`);
    });

    const bsModal = new bootstrap.Modal(document.getElementById('orderModal'));
    bsModal.show();
  }

  /**
   * Open Cart View Modal
   */
  function openCartModal() {
    const cartBody = document.getElementById('cartModalBody');
    const cartFooter = document.getElementById('cartModalFooter');
    if (!cartBody) return;

    if (cart.length === 0) {
      cartBody.innerHTML = `
        <div class="text-center py-5">
          <i class="bi bi-cart-x text-muted" style="font-size: 4rem;"></i>
          <h4 class="mt-3 text-secondary">Your Cart is Empty</h4>
          <p class="text-muted">Explore our delicious menu and add items to your cart!</p>
        </div>
      `;
      cartFooter.style.display = 'none';
    } else {
      let grandTotal = 0;
      let itemsHTML = '<div class="list-group list-group-flush">';

      cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        grandTotal += itemTotal;

        itemsHTML += `
          <div class="list-group-item d-flex align-items-center justify-content-between py-3 border-bottom">
            <div class="d-flex align-items-center gap-3">
              <img src="${item.imgSrc}" alt="${item.title}" style="width: 55px; height: 55px; object-fit: contain;" class="rounded-3 bg-light p-1">
              <div>
                <h6 class="mb-0 fw-bold">${item.title}</h6>
                <small class="text-muted">₹${item.price} x ${item.quantity}</small>
                ${item.note ? `<br><small class="text-orange">Note: ${item.note}</small>` : ''}
              </div>
            </div>
            <div class="d-flex align-items-center gap-3">
              <span class="fw-bold text-dark">₹${itemTotal}</span>
              <button class="btn btn-sm btn-outline-danger border-0 rounded-circle remove-cart-item" data-index="${index}">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        `;
      });

      itemsHTML += `
        </div>
        <div class="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
          <h5 class="fw-bold m-0">Total Amount:</h5>
          <h4 class="fw-bold text-orange m-0">₹${grandTotal}</h4>
        </div>
      `;

      cartBody.innerHTML = itemsHTML;
      cartFooter.style.display = 'flex';

      // Attach remove item handlers
      document.querySelectorAll('.remove-cart-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
          cart.splice(idx, 1);
          updateCartBadge();
          openCartModal(); // Refresh view
        });
      });

      // Checkout handler
      const checkoutBtn = document.getElementById('checkoutBtn');
      checkoutBtn.onclick = () => {
        cart = [];
        updateCartBadge();
        const bsModal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
        if (bsModal) bsModal.hide();
        showToast('🎉 Thank you! Your order has been placed successfully.', 'success');
      };
    }

    const bsCartModal = new bootstrap.Modal(document.getElementById('cartModal'));
    bsCartModal.show();
  }

  /**
   * Interactive Search Modal / Filter Logic
   */
  function initSearchModal() {
    if (!searchIcon) return;

    searchIcon.style.cursor = 'pointer';
    searchIcon.addEventListener('click', () => {
      let searchModalEl = document.getElementById('searchModal');
      if (!searchModalEl) {
        const searchHTML = `
          <div class="modal fade" id="searchModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
              <div class="modal-content border-0 shadow-lg rounded-4">
                <div class="modal-body p-4">
                  <div class="input-group mb-3">
                    <span class="input-group-text bg-white border-end-0 text-orange fs-4"><i class="bi bi-search"></i></span>
                    <input type="text" id="searchInput" class="form-control border-start-0 ps-0 shadow-none fs-5" placeholder="Search dish, sweets, snacks..." autofocus>
                    <button class="btn btn-outline-secondary" type="button" data-bs-dismiss="modal">Close</button>
                  </div>
                  <div id="searchResults" class="list-group list-group-flush max-vh-50 overflow-auto">
                    <p class="text-muted text-center py-3">Type to search menu items...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
        document.body.insertAdjacentHTML('beforeend', searchHTML);
        searchModalEl = document.getElementById('searchModal');
      }

      const bsSearchModal = new bootstrap.Modal(searchModalEl);
      bsSearchModal.show();

      const searchInput = document.getElementById('searchInput');
      const searchResults = document.getElementById('searchResults');

      setTimeout(() => searchInput.focus(), 300);

      searchInput.oninput = (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (!query) {
          searchResults.innerHTML = '<p class="text-muted text-center py-3">Type to search menu items...</p>';
          return;
        }

        const cards = document.querySelectorAll('.f-name, .col-md-4');
        const matches = [];

        cards.forEach(card => {
          const titleEl = card.querySelector('.f-text, .p-name');
          const priceEl = card.querySelector('h2');
          const imgEl = card.querySelector('img:not(.m-img)');

          if (titleEl) {
            const title = titleEl.textContent.replace(/⭐/g, '').trim();
            if (title.toLowerCase().includes(query)) {
              matches.push({
                title,
                price: priceEl ? priceEl.textContent : '₹200',
                imgSrc: imgEl ? imgEl.src : 'assests/images/logo.png'
              });
            }
          }
        });

        if (matches.length === 0) {
          searchResults.innerHTML = `<p class="text-muted text-center py-3">No dishes found matching "${query}"</p>`;
        } else {
          searchResults.innerHTML = matches.map(item => `
            <a href="#" class="list-group-item list-group-item-action d-flex align-items-center justify-content-between py-2 border-bottom search-item-link" data-title="${item.title}">
              <div class="d-flex align-items-center gap-3">
                <img src="${item.imgSrc}" style="width: 45px; height: 45px; object-fit: contain;">
                <span class="fw-semibold text-dark">${item.title}</span>
              </div>
              <span class="fw-bold text-orange">${item.price}</span>
            </a>
          `).join('');

          document.querySelectorAll('.search-item-link').forEach(link => {
            link.onclick = (evt) => {
              evt.preventDefault();
              bsSearchModal.hide();
              const itemTitle = link.getAttribute('data-title');
              openDishOrderModal(itemTitle, 250, link.querySelector('img').src);
            };
          });
        }
      };
    });
  }

  /**
   * Track Order Modal Logic
   */
  function initTrackOrderModal() {
    if (!trackOrderBtn) return;

    trackOrderBtn.addEventListener('click', (e) => {
      e.preventDefault();

      let trackModalEl = document.getElementById('trackOrderModal');
      if (!trackModalEl) {
        const trackHTML = `
          <div class="modal fade" id="trackOrderModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
              <div class="modal-content border-0 shadow-lg rounded-4">
                <div class="modal-header border-0 bg-light-orange rounded-top-4">
                  <h5 class="modal-title text-orange fw-bold m-0"><i class="bi bi-geo-alt-fill me-2"></i>Track Your Order</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4 text-center">
                  <div class="mb-4">
                    <span class="badge bg-success-subtle text-success border border-success rounded-pill px-3 py-2 fs-6">
                      <i class="bi bi-clock-history me-1"></i> Delivery in 22 mins
                    </span>
                  </div>
                  <div class="position-relative m-4">
                    <div class="progress" style="height: 4px;">
                      <div class="progress-bar bg-warning" role="progressbar" style="width: 65%;"></div>
                    </div>
                    <div class="d-flex justify-content-between position-relative" style="top: -15px;">
                      <span class="badge rounded-circle bg-warning text-white p-2" title="Order Received"><i class="bi bi-check-lg"></i></span>
                      <span class="badge rounded-circle bg-warning text-white p-2" title="Preparing"><i class="bi bi-egg-fried"></i></span>
                      <span class="badge rounded-circle bg-warning text-white p-2" title="Out for Delivery"><i class="bi bi-bicycle"></i></span>
                      <span class="badge rounded-circle bg-secondary text-white p-2" title="Delivered"><i class="bi bi-house"></i></span>
                    </div>
                  </div>
                  <h6 class="fw-bold mt-4 text-dark">Driver is on the way!</h6>
                  <p class="text-muted small">Delivery Executive: Rahul M. (+91 9876543210)</p>
                </div>
              </div>
            </div>
          </div>
        `;
        document.body.insertAdjacentHTML('beforeend', trackHTML);
        trackModalEl = document.getElementById('trackOrderModal');
      }

      const bsTrackModal = new bootstrap.Modal(trackModalEl);
      bsTrackModal.show();
    });
  }

  /**
   * Regional Filter Tags Logic
   */
  function initRegionFilter() {
    if (regionItems.length === 0) return;

    regionItems.forEach(item => {
      item.style.cursor = 'pointer';
      item.addEventListener('click', () => {
        const regionName = item.textContent.trim();
        
        regionItems.forEach(r => r.classList.remove('active-region'));
        item.classList.add('active-region');

        const foodCards = document.querySelectorAll('.menu-margin .col-lg-4, .indian-head .col-md-4');
        
        foodCards.forEach(card => {
          const text = card.textContent.toLowerCase();
          if (regionName.toLowerCase() === 'all' || text.includes(regionName.toLowerCase())) {
            card.style.display = 'block';
            card.classList.add('fade-in-anim');
          } else {
            card.style.display = 'none';
          }
        });

        showToast(`Filtered menu by: ${regionName}`);
      });
    });
  }

  /**
   * Smooth Scrolling for Nav Links
   */
  function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId && targetId !== '#') {
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            targetEl.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });
  }

  /**
   * Login & Sign-Up Form Enhancement Logic
   */
  function initAuthForms() {
    const loginBtnAnchor = document.querySelector('.login .btn-anchor');
    const emailInput = document.querySelector('.login input[type="email"]');
    const passInput = document.querySelector('.login input[type="password"]');

    if (loginBtnAnchor) {
      loginBtnAnchor.addEventListener('click', (e) => {
        if (emailInput && !emailInput.value) {
          e.preventDefault();
          emailInput.style.borderColor = '#ff3333';
          emailInput.focus();
          alert('Please enter your email address to continue.');
          return;
        }
        if (passInput && !passInput.value) {
          e.preventDefault();
          passInput.style.borderColor = '#ff3333';
          passInput.focus();
          alert('Please enter your password.');
          return;
        }
        // Save user login state
        localStorage.setItem('fooddash_user', JSON.stringify({ email: emailInput ? emailInput.value : 'user@fooddash.com', loggedIn: true }));
      });
    }
  }

  /**
   * Helper Toast Notification
   */
  function showToast(msg, type = 'success') {
    const toastEl = document.getElementById('foodToast');
    const toastMsg = document.getElementById('toastMessage');
    if (!toastEl || !toastMsg) return;

    toastMsg.innerHTML = `<i class="bi bi-${type === 'success' ? 'check-circle-fill' : 'info-circle-fill'} fs-5 me-2"></i> ${msg}`;
    toastEl.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : 'primary'} border-0 rounded-3 shadow`;
    
    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();
  }
});
