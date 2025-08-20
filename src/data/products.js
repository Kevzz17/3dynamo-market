const seller_number = "12345678901";

// Product data
export const products = [
  {
    id: "1",
    name: "Lagartija Articulada",
    price: 5000,
    description: "Lagartija verde articulada.",
    category: ["articulados", "destacado", "nuevo"],
    images: ["/Assets/product-imgs/001.jpeg", "/Assets/product-imgs/002.jpeg"],
    specifications: [
      { label: "Color", value: "Verde menta" },
      { label: "Peso", value: "20g" },
      { label: "Longitud", value: "8cm" },
    ],
    seller_whatsapp: seller_number,
  },
];

/**
 * Get all product categories
 * @returns {string[]} Array of unique categories
 */
export function getAllCategories() {
  const categoriesSet = new Set();

  products.forEach((product) => {
    product.category.forEach((category) => {
      categoriesSet.add(category);
    });
  });

  return ["todo", ...Array.from(categoriesSet)];
}

/**
 * Get products by category
 * @param {string} category - Category to filter by
 * @returns {Object[]} Array of products
 */
export function getProductsByCategory(category) {
  if (category === "todo") {
    return products;
  }

  return products.filter((product) => product.category.includes(category));
}

/**
 * Get product by ID
 * @param {string} id - Product ID
 * @returns {Object|null} Product object or null if not found
 */
export function getProductById(id) {
  return products.find((product) => product.id === id) || null;
}

/**
 * Search products by keyword
 * @param {string} query - Search query
 * @returns {Object[]} Array of matching products
 */
export function searchProducts(query) {
  if (!query) return products;

  const searchTerm = query.toLowerCase();

  return products.filter((product) => {
    return (
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.category.some((cat) => cat.toLowerCase().includes(searchTerm))
    );
  });
}
