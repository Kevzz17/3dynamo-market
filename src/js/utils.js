// Utility functions

/**
 * Format price with currency symbol
 * @param {number} price - Price to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted price
 */
export function formatPrice(price, currency = 'COP') {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency
  }).format(price);
}

/**
 * Sanitize HTML to prevent XSS
 * @param {string} html - HTML string to sanitize
 * @returns {string} Sanitized HTML
 */
export function sanitizeHTML(html) {
  const temp = document.createElement('div');
  temp.textContent = html;
  return temp.innerHTML;
}

/**
 * Generate a random ID
 * @param {number} length - Length of the ID (default: 8)
 * @returns {string} Random ID
 */
export function generateId(length = 8) {
  return Math.random().toString(36).substring(2, 2 + length);
}

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Create skeleton loading elements
 * @param {number} count - Number of skeleton elements
 * @param {string} type - Type of skeleton (product, category)
 * @returns {string} HTML string for skeleton loaders
 */
export function createSkeletonLoaders(count, type = 'product') {
  let html = '';
  
  for (let i = 0; i < count; i++) {
    if (type === 'product') {
      html += `
        <div class="product-card skeleton-product-card">
          <div class="skeleton skeleton-image"></div>
          <div class="product-card-body">
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-price"></div>
            <div class="skeleton skeleton-description"></div>
            <div class="skeleton skeleton-description"></div>
            <div class="skeleton skeleton-button"></div>
          </div>
        </div>
      `;
    }
  }
  
  return html;
}

/**
 * Lazy load images
 */
export function initLazyLoading() {
  if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          imageObserver.unobserve(img);
        }
      });
    });
    
    lazyImages.forEach(img => {
      imageObserver.observe(img);
    });
  } else {
    // Fallback for browsers that don't support Intersection Observer
    const lazyImages = document.querySelectorAll('[data-src]');
    
    lazyImages.forEach(img => {
      img.src = img.dataset.src;
    });
  }
}

/**
 * Create WhatsApp message link
 * @param {string} phoneNumber - WhatsApp phone number
 * @param {string} productName - Product name
 * @param {string} productId - Product ID
 * @param {number} price - Product price
 * @returns {string} WhatsApp link
 */
export function createWhatsAppLink(phoneNumber, productName, productId, price) {
  const formattedPrice = formatPrice(price);
  const message = `
👋 Hello! I'm interested in purchasing:

🛍️ Product: ${productName}
💰 Price: ${formattedPrice}
📦 Product ID: #${productId}

Could you please provide more information about availability and shipping?
`;
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Get parameter from URL
 * @param {string} name - Parameter name
 * @returns {string|null} Parameter value
 */
export function getUrlParameter(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}