import {
  getProductsByCategory,
  getAllCategories,
  searchProducts,
} from "../data/products.js";
import {
  formatPrice,
  getUrlParameter,
  createSkeletonLoaders,
  initLazyLoading,
} from "../js/utils.js";
import { navigateTo } from "../js/router.js";

export async function loadCategoryPage(mainContent, params, searchParams) {
  const categoryId = params.id || "todo";
  const searchQuery = searchParams.get("search");

  // Set title
  document.title = `${capitalizeFirst(categoryId)}`;

  // Show loading skeletons
  mainContent.innerHTML = `
    <div class="container">
      <header class="category-header">
        <h1>${searchQuery ? `Search: ${searchQuery}` : capitalizeFirst(categoryId)}</h1>
        <p class="category-description">
          ${searchQuery ? `Mostrando resultados para "${searchQuery}"` : `Explore nuestros productos de ${categoryId}`}
        </p>
      </header>

      <div class="category-filter">
        <ul class="category-filter-list">
          ${createSkeletonLoaders(6, "filter")}
        </ul>
      </div>

      <div class="product-grid">
        ${createSkeletonLoaders(8, "product")}
      </div>
    </div>
  `;

  // Simulate API fetch delay
  await renderCategoryPage(mainContent, categoryId, searchQuery);
}

async function renderCategoryPage(mainContent, categoryId, searchQuery) {
  // Get all categories for the filter
  const allCategories = await getAllCategories();

  // Get products based on category and search query
  let products = [];
  if (searchQuery) {
    products = await searchProducts(searchQuery);
  } else {
    products = await getProductsByCategory(categoryId);
  }

  // Create a category filter
  const categoryFilter = `
    <div class="category-filter animate-fade-in">
      <ul class="category-filter-list">
        ${allCategories
          .map(
            (category) => `
          <li class="category-filter-item">
            <a href="/category/${category}"
               class="category-filter-button ${category === categoryId ? "active" : ""}">
              ${capitalizeFirst(category)}
            </a>
          </li>
        `,
          )
          .join("")}
      </ul>
    </div>
  `;

  // Create product grid
  const productGrid = `
    <div class="product-grid animate-slide-up">
      ${
        products.length > 0
          ? products.map((product) => createProductCard(product)).join("")
          : `<div class="no-products">
          <p>No hay productos${searchQuery ? ` para "${searchQuery}"` : " en esta categoría"}.</p>
        </div>`
      }
    </div>
  `;

  // Update content
  mainContent.innerHTML = `
    <div class="container">
      <header class="category-header animate-fade-in">
        <h1>${searchQuery ? `Search: ${searchQuery}` : capitalizeFirst(categoryId)}</h1>
        <p class="category-description">
          ${searchQuery ? `Mostrando resultados para "${searchQuery}"` : `Explore nuestros productos de: ${categoryId}`}
        </p>
      </header>

      ${categoryFilter}

      ${productGrid}
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

// Add some extra styles for the category page
const style = document.createElement("style");
style.textContent = `
  .category-header {
    margin-bottom: var(--space-6);
  }

  .category-description {
    color: var(--color-neutral-600);
    margin-bottom: var(--space-6);
  }

  .no-products {
    grid-column: 1 / -1;
    text-align: center;
    padding: var(--space-8);
    background-color: var(--color-white);
    border-radius: var(--radius-lg);
    font-size: var(--font-size-lg);
    color: var(--color-neutral-600);
  }
`;

document.head.appendChild(style);
