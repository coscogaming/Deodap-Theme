/**
 * Deodap Theme - Main JavaScript File
 * Handles theme functionality and interactions
 */

// Theme object to namespace all functions
const DeodapTheme = {
  // Initialize theme
  init: function() {
    this.setupMobileMenu();
    this.setupProductGrid();
    this.setupQuantitySelector();
    this.setupCartDrawer();
    this.setupSearch();
    this.setupLazyLoading();
    this.setupNewsletterForm();
  },

  // Mobile menu functionality
  setupMobileMenu: function() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const menuClose = document.querySelector('.mobile-menu-close');

    if (menuToggle && mobileMenu) {
      menuToggle.addEventListener('click', function() {
        mobileMenu.classList.add('active');
        document.body.classList.add('menu-open');
      });
    }

    if (menuClose && mobileMenu) {
      menuClose.addEventListener('click', function() {
        mobileMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
      });
    }

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
      if (mobileMenu && mobileMenu.classList.contains('active')) {
        if (!mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
          mobileMenu.classList.remove('active');
          document.body.classList.remove('menu-open');
        }
      }
    });
  },

  // Product grid functionality
  setupProductGrid: function() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
      const quickAddBtn = card.querySelector('.quick-add-btn');
      
      if (quickAddBtn) {
        quickAddBtn.addEventListener('click', function(e) {
          e.preventDefault();
          const productId = this.dataset.productId;
          const variantId = this.dataset.variantId;
          
          if (variantId) {
            DeodapTheme.addToCart(variantId, 1);
          }
        });
      }
    });
  },

  // Quantity selector functionality
  setupQuantitySelector: function() {
    const quantitySelectors = document.querySelectorAll('.quantity-selector');
    
    quantitySelectors.forEach(selector => {
      const minusBtn = selector.querySelector('.quantity-minus');
      const plusBtn = selector.querySelector('.quantity-plus');
      const input = selector.querySelector('.quantity-input');
      
      if (minusBtn && plusBtn && input) {
        minusBtn.addEventListener('click', function() {
          const currentValue = parseInt(input.value);
          if (currentValue > 1) {
            input.value = currentValue - 1;
            input.dispatchEvent(new Event('change'));
          }
        });
        
        plusBtn.addEventListener('click', function() {
          const currentValue = parseInt(input.value);
          input.value = currentValue + 1;
          input.dispatchEvent(new Event('change'));
        });
      }
    });
  },

  // Cart drawer functionality
  setupCartDrawer: function() {
    const cartIcon = document.querySelector('.cart-icon');
    const cartDrawer = document.querySelector('.cart-drawer');
    const cartClose = document.querySelector('.cart-drawer-close');
    const cartOverlay = document.querySelector('.cart-drawer-overlay');

    if (cartIcon && cartDrawer) {
      cartIcon.addEventListener('click', function(e) {
        e.preventDefault();
        DeodapTheme.openCartDrawer();
      });
    }

    if (cartClose && cartDrawer) {
      cartClose.addEventListener('click', function() {
        DeodapTheme.closeCartDrawer();
      });
    }

    if (cartOverlay) {
      cartOverlay.addEventListener('click', function() {
        DeodapTheme.closeCartDrawer();
      });
    }
  },

  // Search functionality
  setupSearch: function() {
    const searchToggle = document.querySelector('.search-toggle');
    const searchBox = document.querySelector('.search-box');
    const searchInput = document.querySelector('.search-input');
    const searchResults = document.querySelector('.search-results');

    if (searchToggle && searchBox) {
      searchToggle.addEventListener('click', function() {
        searchBox.classList.toggle('active');
        if (searchBox.classList.contains('active')) {
          searchInput.focus();
        }
      });
    }

    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        const query = this.value.trim();
        
        if (query.length > 2) {
          searchTimeout = setTimeout(() => {
            DeodapTheme.performSearch(query);
          }, 300);
        } else {
          searchResults.innerHTML = '';
          searchResults.style.display = 'none';
        }
      });
    }
  },

  // Lazy loading for images
  setupLazyLoading: function() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        });
      });
      
      lazyImages.forEach(img => imageObserver.observe(img));
    } else {
      // Fallback for browsers without IntersectionObserver
      lazyImages.forEach(img => {
        img.src = img.dataset.src;
        img.classList.remove('lazy');
      });
    }
  },

  // Newsletter form
  setupNewsletterForm: function() {
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value;
        
        if (DeodapTheme.validateEmail(email)) {
          DeodapTheme.subscribeNewsletter(email);
        } else {
          DeodapTheme.showMessage('Please enter a valid email address', 'error');
        }
      });
    }
  },

  // Add to cart functionality
  addToCart: function(variantId, quantity = 1) {
    const data = {
      items: [{
        id: variantId,
        quantity: quantity
      }]
    };

    fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
      DeodapTheme.updateCartCount();
      DeodapTheme.showMessage('Product added to cart!', 'success');
      DeodapTheme.openCartDrawer();
    })
    .catch(error => {
      console.error('Error:', error);
      DeodapTheme.showMessage('Error adding product to cart', 'error');
    });
  },

  // Update cart count
  updateCartCount: function() {
    fetch('/cart.js')
      .then(response => response.json())
      .then(cart => {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
          cartCount.textContent = cart.item_count;
          cartCount.style.display = cart.item_count > 0 ? 'block' : 'none';
        }
      });
  },

  // Open cart drawer
  openCartDrawer: function() {
    const cartDrawer = document.querySelector('.cart-drawer');
    const cartOverlay = document.querySelector('.cart-drawer-overlay');
    
    if (cartDrawer) {
      cartDrawer.classList.add('active');
      document.body.classList.add('cart-open');
    }
    
    if (cartOverlay) {
      cartOverlay.classList.add('active');
    }
    
    // Load cart contents
    this.loadCartContents();
  },

  // Close cart drawer
  closeCartDrawer: function() {
    const cartDrawer = document.querySelector('.cart-drawer');
    const cartOverlay = document.querySelector('.cart-drawer-overlay');
    
    if (cartDrawer) {
      cartDrawer.classList.remove('active');
      document.body.classList.remove('cart-open');
    }
    
    if (cartOverlay) {
      cartOverlay.classList.remove('active');
    }
  },

  // Load cart contents
  loadCartContents: function() {
    fetch('/cart.js')
      .then(response => response.json())
      .then(cart => {
        const cartItems = document.querySelector('.cart-items');
        if (cartItems) {
          if (cart.items.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
          } else {
            let itemsHTML = '';
            cart.items.forEach(item => {
              itemsHTML += `
                <div class="cart-item" data-key="${item.key}">
                  <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.product_title}">
                  </div>
                  <div class="cart-item-details">
                    <h4>${item.product_title}</h4>
                    <p class="cart-item-price">${Shopify.formatMoney(item.price)}</p>
                    <div class="cart-item-quantity">
                      <button class="quantity-minus" data-key="${item.key}">-</button>
                      <span>${item.quantity}</span>
                      <button class="quantity-plus" data-key="${item.key}">+</button>
                    </div>
                  </div>
                  <button class="cart-item-remove" data-key="${item.key}">×</button>
                </div>
              `;
            });
            cartItems.innerHTML = itemsHTML;
            
            // Update cart total
            const cartTotal = document.querySelector('.cart-total');
            if (cartTotal) {
              cartTotal.textContent = Shopify.formatMoney(cart.total_price);
            }
          }
        }
      });
  },

  // Perform search
  performSearch: function(query) {
    const searchResults = document.querySelector('.search-results');
    
    fetch(`/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product&resources[limit]=5`)
      .then(response => response.json())
      .then(data => {
        if (data.resources && data.resources.results && data.resources.results.products) {
          const products = data.resources.results.products;
          let resultsHTML = '';
          
          products.forEach(product => {
            resultsHTML += `
              <div class="search-result-item">
                <a href="${product.url}">
                  <img src="${product.image}" alt="${product.title}">
                  <div class="search-result-details">
                    <h4>${product.title}</h4>
                    <p class="search-result-price">${Shopify.formatMoney(product.price)}</p>
                  </div>
                </a>
              </div>
            `;
          });
          
          searchResults.innerHTML = resultsHTML;
          searchResults.style.display = 'block';
        }
      });
  },

  // Subscribe to newsletter
  subscribeNewsletter: function(email) {
    // This would typically integrate with Shopify's customer API or a third-party service
    // For now, we'll just show a success message
    DeodapTheme.showMessage('Thank you for subscribing!', 'success');
  },

  // Validate email
  validateEmail: function(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  // Show message
  showMessage: function(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
      messageDiv.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      messageDiv.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(messageDiv);
      }, 300);
    }, 3000);
  }
};

// Initialize theme when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  DeodapTheme.init();
});

// Initialize Shopify money formatting if not already available
if (typeof Shopify === 'undefined') {
  window.Shopify = {};
}

if (!Shopify.formatMoney) {
  Shopify.formatMoney = function(cents, format) {
    if (typeof cents === 'string') {
      cents = cents.replace('.', '');
    }
    
    const value = cents / 100;
    const formatString = format || '${{amount}}';
    
    return formatString.replace('{{amount}}', value.toFixed(2));
  };
}