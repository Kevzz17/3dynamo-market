import { getProductById } from "../data/products.js";
import { formatPrice, createWhatsAppLink } from "../js/utils.js";
import { navigateTo } from "../js/router.js";

export function loadProductPage(mainContent, params) {
  const productId = params.id;

  // Show loading state
  mainContent.innerHTML = `
    <div class="container">
      <div class="product-details">
        <div class="product-details-grid">
          <div class="product-gallery">
            <div class="skeleton skeleton-image" style="height: 400px;"></div>
            <div style="display: flex; gap: 8px; margin-top: 16px;">
              <div class="skeleton" style="height: 80px; width: 80px;"></div>
              <div class="skeleton" style="height: 80px; width: 80px;"></div>
              <div class="skeleton" style="height: 80px; width: 80px;"></div>
              <div class="skeleton" style="height: 80px; width: 80px;"></div>
            </div>
          </div>

          <div class="product-info">
            <div class="skeleton" style="height: 40px; width: 70%; margin-bottom: 16px;"></div>
            <div class="skeleton" style="height: 32px; width: 30%; margin-bottom: 24px;"></div>
            <div class="skeleton" style="height: 20px; width: 100%; margin-bottom: 8px;"></div>
            <div class="skeleton" style="height: 20px; width: 100%; margin-bottom: 8px;"></div>
            <div class="skeleton" style="height: 20px; width: 90%; margin-bottom: 32px;"></div>

            <div class="skeleton" style="height: 24px; width: 40%; margin-bottom: 16px;"></div>
            <div class="skeleton" style="height: 20px; width: 100%; margin-bottom: 8px;"></div>
            <div class="skeleton" style="height: 20px; width: 100%; margin-bottom: 8px;"></div>
            <div class="skeleton" style="height: 20px; width: 100%; margin-bottom: 8px;"></div>
            <div class="skeleton" style="height: 20px; width: 100%; margin-bottom: 32px;"></div>

            <div class="skeleton" style="height: 48px; width: 200px;"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  renderProductPage(mainContent, productId);
}

function renderProductPage(mainContent, productId) {
  // Get product data
  const product = getProductById(productId);

  // If product not found, show error
  if (!product) {
    mainContent.innerHTML = `
      <div class="container">
        <div class="error-message">
          <h1>Product Not Found</h1>
          <p>The product you're looking for doesn't exist or has been removed.</p>
          <a href="/category/todo" class="button">Back to Products</a>
        </div>
      </div>
    `;
    return;
  }

  // Set page title
  document.title = `${product.name}`;

  // Create the WhatsApp link
  const whatsappLink = createWhatsAppLink(
    product.seller_whatsapp,
    product.name,
    product.id,
    product.price,
  );

  // Create product gallery
  const productGallery = `
    <div class="product-gallery animate-fade-in">
      <div class="product-main-image" id="main-product-image">
        <img src="${product.images[0]}" alt="${product.name}" id="featured-image">
      </div>
      <div class="product-thumbnails">
        ${product.images
          .map(
            (image, index) => `
          <div class="product-thumbnail ${index === 0 ? "active" : ""}" data-image="${image}">
            <img src="${image}" alt="${product.name} ${index + 1}">
          </div>
        `,
          )
          .join("")}
      </div>
    </div>
  `;

  // Create product information
  const productInfo = `
    <div class="product-info animate-slide-up">
      <h1>${product.name}</h1>
      <div class="product-id">Product ID: #${product.id}</div>
      <div class="product-price">${formatPrice(product.price)}</div>
      <div class="product-description">
        ${product.description}
      </div>

      <div class="product-specs">
        <h3 class="product-specs-title">Specifications</h3>
        <ul class="product-specs-list">
          ${product.specifications
            .map(
              (spec) => `
            <li class="product-specs-item">
              <span class="product-specs-label">${spec.label}</span>
              <span class="product-specs-value">${spec.value}</span>
            </li>
          `,
            )
            .join("")}
        </ul>
      </div>

      <!-- ${whatsappLink} -->
      <a href="http://www.patience-is-a-virtue.org/" class="whatsapp-button" target="_blank" rel="noopener noreferrer">
        <svg class="whatsapp-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        Contact Seller via WhatsApp
      </a>

      <div class="related-categories">
        <span>Categories: </span>
        ${product.category
          .map(
            (cat) => `
          <a href="/category/${cat}" class="related-category">${capitalizeFirst(cat)}</a>
        `,
          )
          .join(", ")}
      </div>
    </div>
  `;

  // Create zoom overlay
  const zoomOverlay = `
    <div class="zoom-overlay" id="zoom-overlay">
      <div class="zoom-image-container">
        <img src="${product.images[0]}" alt="${product.name}" class="zoom-image" id="zoom-image">
      </div>
      <button class="zoom-close" id="zoom-close" aria-label="Close zoom view">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  `;

  // Update content
  mainContent.innerHTML = `
    <div class="container">
      <div class="breadcrumbs animate-fade-in">
        <a href="/">Home</a> &gt;
        <a href="/category/${product.category[0]}">${capitalizeFirst(product.category[0])}</a> &gt;
        <span>${product.name}</span>
      </div>

      <div class="product-details">
        <div class="product-details-grid">
          ${productGallery}
          ${productInfo}
        </div>
      </div>

      ${zoomOverlay}
    </div>
  `;

  // Add event listeners
  initializeProductPage();
}

function initializeProductPage() {
  // Thumbnail switching
  const thumbnails = document.querySelectorAll(".product-thumbnail");
  const featuredImage = document.getElementById("featured-image");
  const zoomImage = document.getElementById("zoom-image");

  thumbnails.forEach((thumbnail) => {
    thumbnail.addEventListener("click", () => {
      // Update active class
      thumbnails.forEach((t) => t.classList.remove("active"));
      thumbnail.classList.add("active");

      // Update images
      const imageUrl = thumbnail.dataset.image;
      featuredImage.src = imageUrl;
      zoomImage.src = imageUrl;
    });
  });

  // Image zoom functionality
  const mainImage = document.getElementById("main-product-image");
  const zoomOverlay = document.getElementById("zoom-overlay");
  const zoomClose = document.getElementById("zoom-close");

  mainImage.addEventListener("click", () => {
    zoomOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  });

  zoomClose.addEventListener("click", () => {
    zoomOverlay.classList.remove("active");
    document.body.style.overflow = "";
  });

  zoomOverlay.addEventListener("click", (e) => {
    if (e.target === zoomOverlay) {
      zoomOverlay.classList.remove("active");
      document.body.style.overflow = "";
    }
  });
}

function capitalizeFirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Add some extra styles for the product page
const style = document.createElement("style");
style.textContent = `
  .breadcrumbs {
    margin-bottom: var(--space-4);
    font-size: var(--font-size-sm);
    color: var(--color-neutral-600);
  }

  .breadcrumbs a {
    color: var(--color-neutral-600);
    text-decoration: none;
  }

  .breadcrumbs a:hover {
    color: var(--color-primary);
  }

  .product-id {
    font-size: var(--font-size-sm);
    color: var(--color-neutral-600);
    margin-bottom: var(--space-2);
  }

  .related-categories {
    margin-top: var(--space-6);
    font-size: var(--font-size-sm);
    color: var(--color-neutral-600);
  }

  .related-category {
    color: var(--color-primary);
    text-decoration: none;
  }

  .related-category:hover {
    text-decoration: underline;
  }
`;

document.head.appendChild(style);
