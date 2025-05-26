import { getProductsByCategory, getAllCategories } from "../data/products.js";
import {
  formatPrice,
  createSkeletonLoaders,
  initLazyLoading,
} from "../js/utils.js";
import { navigateTo } from "../js/router.js";

export function loadHomePage(mainContent) {
  // Set title
  document.title = "3Dynamo - Marketplace";

  // Show loading skeletons
  mainContent.innerHTML = `
    <div class="home-header">
      <h1>Presume tu mini mundo 3D</h1>
      <p class="subtitle">Mira la selección de objetos impresos en 3D para llevar a todo lado</p>
    </div>

    <section class="featured-section">
      <h2>Productos DESTACADOS</h2>
      <div class="product-grid">
        ${createSkeletonLoaders(4, "product")}
      </div>
    </section>

    <section class="new-arrivals-section">
      <h2>Recién llegados</h2>
      <div class="product-grid">
        ${createSkeletonLoaders(4, "product")}
      </div>
    </section>

    <section class="categories-section">
      <h2>Comprar por Categoría</h2>
      <div class="category-grid">
        ${createSkeletonLoaders(4, "category")}
      </div>
    </section>
  `;

  // Simulate API fetch delay
  setTimeout(() => {
    renderHomePage(mainContent);
  }, 500);
}

function renderHomePage(mainContent) {
  // Get products
  const featuredProducts = getProductsByCategory("featured").slice(0, 4);
  const newProducts = getProductsByCategory("new").slice(0, 4);
  const categories = getAllCategories().filter((cat) => cat !== "todo");

  // Hero banner
  const hero = `
    <div class="hero-banner animate-fade-in">
      <div class="hero-content">
        <h1>Cada detalle cuenta</h1>
        <p>Descubre nuestra colección de productos hechos para ti.</p>
        <a href="/category/todo" class="hero-button">Compra ahora</a>
      </div>
    </div>
  `;

  // Featured products section
  const featuredSection = `
    <section class="featured-section animate-slide-up">
      <div class="section-header">
        <h2>Productos destacados</h2>
        <a href="/category/destacado" class="view-all">Ver todo</a>
      </div>
      <div class="product-grid">
        ${featuredProducts.map((product) => createProductCard(product)).join("")}
      </div>
    </section>
  `;

  // New arrivals section
  const newArrivalsSection = `
    <section class="new-arrivals-section animate-slide-up">
      <div class="section-header">
        <h2>Recién Llegados</h2>
        <a href="/category/nuevo" class="view-all">Ver todo</a>
      </div>
      <div class="product-grid">
        ${newProducts.map((product) => createProductCard(product)).join("")}
      </div>
    </section>
  `;

  // Categories section
  const categoriesSection = `
    <section class="categories-section animate-slide-up">
      <div class="section-header">
        <h2>Comprar por Categoría</h2>
      </div>
      <div class="category-grid">
        ${categories
          .slice(0, 6)
          .map(
            (category) => `
          <a href="/category/${category}" class="category-card">
            <div class="category-name">${capitalizeFirst(category)}</div>
          </a>
        `,
          )
          .join("")}
      </div>
    </section>
  `;

  // Promotion banner
  const promotionBanner = `
    <section class="promotion-banner animate-slide-up">
      <div class="promotion-content">
        <h2>Ofertas especiales</h2>
        <p>Descubre nuestra última colección con descuentos exclusivos</p>
        <a href="/category/destacado" class="promotion-button">Compra ahora</a>
      </div>
    </section>
  `;

  // Update content
  mainContent.innerHTML = `
    ${hero}
    <div class="container">
      ${featuredSection}
      ${promotionBanner}
      ${newArrivalsSection}
      ${categoriesSection}
    </div>
  `;

  // Initialize lazy loading
  initLazyLoading();

  // Add event listeners
  addProductCardEventListeners();
}

function createProductCard(product) {
  return `
    <div class="product-card" data-product-id="${product.id}">
      <div class="product-card-image">
        <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
      </div>
      <div class="product-card-body">
        <h3 class="product-card-title">${product.name}</h3>
        <div class="product-card-price">${formatPrice(product.price)}</div>
        <p class="product-card-description">${product.description}</p>
        <a href="/product/${product.id}" class="product-card-button">Ver Detalles</a>
      </div>
    </div>
  `;
}

function addProductCardEventListeners() {
  const productCards = document.querySelectorAll(".product-card");

  productCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      // Only navigate if not clicking on the button (which has its own link)
      if (!e.target.classList.contains("product-card-button")) {
        e.preventDefault();
        const productId = card.dataset.productId;
        navigateTo(`/product/${productId}`);
      }
    });
  });
}

function capitalizeFirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Add some extra styles for the home page
const style = document.createElement("style");
style.textContent = `
  .hero-banner {
    background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5)), url('https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2');
    background-size: cover;
    background-position: center;
    height: 500px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    text-align: center;
    margin-bottom: var(--space-8);
    user-select: none;
  }

  .hero-content {
    max-width: 800px;
    padding: var(--space-4);
  }

  .hero-content h1 {
    font-size: var(--font-size-4xl);
    margin-bottom: var(--space-4);
    color: white;
  }

  .hero-content p {
    font-size: var(--font-size-xl);
    margin-bottom: var(--space-6);
  }

  .hero-button {
    display: inline-block;
    background-color: var(--color-primary);
    color: #eee9;
    padding: var(--space-3) var(--space-6);
    border-radius: 20px;
    font-weight: bold;
    transition: all var(--transition-fast);
  }

  .hero-button:hover {
    background-color: var(--color-primary-dark);
    color: #eeed;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-6);
  }

  .view-all {
    font-weight: 500;
  }

  .category-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: var(--space-4);
  }

  .category-card {
    height: 150px;
    background-color: var(--color-primary-light);
    border-radius: 55px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #eee9;
    font-weight: bold;
    transition: all var(--transition-fast);
  }

  .category-card:hover {
    background-color: var(--color-primary);
    transform: translateY(-4px);
    color: white;
    font-size: 135%;
  }

  .promotion-banner {
    background: #264E84;
    background: linear-gradient(135deg, #264E84, #96DCE0);
    color: white;
    padding: var(--space-8) var(--space-4);
    border-radius: 0;
    margin: var(--space-8) 0;
    text-align: center;
  }

  .promotion-content h2 {
    color: white;
    margin-bottom: var(--space-2);
  }

  .promotion-button {
    display: inline-block;
    background-color: white;
    color: var(--color-primary-dark);
    padding: var(--space-3) var(--space-6);
    border-radius: var(--radius-lg);
    font-weight: 500;
    margin-top: var(--space-4);
    transition: all var(--transition-fast);
  }

  .promotion-button:hover {
    background-color: var(--color-neutral-100);
    transform: translateY(-2px);
  }

  .subtitle {
    font-size: var(--font-size-lg);
    margin-bottom: var(--space-6);
    color: var(--color-neutral-600);
  }

  .home-header {
    text-align: center;
    margin-bottom: var(--space-8);
  }

  .featured-section,
  .new-arrivals-section,
  .categories-section {
    margin-bottom: var(--space-10);
  }
`;

document.head.appendChild(style);
