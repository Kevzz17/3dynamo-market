import { supabase } from './supabase.js';

/**
 * Get all product categories from Supabase
 * @returns {string[]} Array of unique categories
 */
export async function getAllCategories() {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('slug, name')
      .eq('is_active', true)
      .order('sort_order');

    if (error) throw error;

    const categoryList = ['todo'];
    categories.forEach(category => {
      categoryList.push(category.slug);
    });

    return categoryList;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return ['todo', 'articulados', 'destacado', 'nuevo'];
  }
}

/**
 * Get products by category from Supabase
 * @param {string} category - Category to filter by
 * @returns {Object[]} Array of products
 */
export async function getProductsByCategory(category) {
  try {
    let query = supabase
      .from('products')
      .select(`
        *,
        product_categories!inner(
          categories!inner(slug, name)
        ),
        product_images(image_url, alt_text, is_primary, sort_order),
        product_specifications(spec_name, spec_value, sort_order)
      `)
      .eq('is_active', true);

    // If not "todo", filter by category
    if (category !== 'todo') {
      query = query.eq('product_categories.categories.slug', category);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    // Transform data for easier use
    return data.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description || product.short_description || '',
      category: product.product_categories?.map(pc => pc.categories.slug) || [],
      images: product.product_images
        ?.sort((a, b) => a.sort_order - b.sort_order)
        ?.map(img => img.image_url) || ['/Assets/product-imgs/placeholder.jpg'],
      specifications: product.product_specifications
        ?.sort((a, b) => a.sort_order - b.sort_order)
        ?.map(spec => ({ label: spec.spec_name, value: spec.spec_value })) || [],
      seller_whatsapp: product.seller_whatsapp || '12345678901'
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    // Return fallback data if database fails
    return getFallbackProducts(category);
  }
}

/**
 * Get product by ID from Supabase
 * @param {string} id - Product ID
 * @returns {Object|null} Product object or null if not found
 */
export async function getProductById(id) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_categories(
          categories(slug, name)
        ),
        product_images(image_url, alt_text, is_primary, sort_order),
        product_specifications(spec_name, spec_value, sort_order)
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    // Transform data
    return {
      id: data.id,
      name: data.name,
      price: data.price,
      description: data.description || data.short_description || '',
      category: data.product_categories?.map(pc => pc.categories.slug) || [],
      images: data.product_images
        ?.sort((a, b) => a.sort_order - b.sort_order)
        ?.map(img => img.image_url) || ['/Assets/product-imgs/placeholder.jpg'],
      specifications: data.product_specifications
        ?.sort((a, b) => a.sort_order - b.sort_order)
        ?.map(spec => ({ label: spec.spec_name, value: spec.spec_value })) || [],
      seller_whatsapp: data.seller_whatsapp || '12345678901'
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

/**
 * Search products by keyword from Supabase
 * @param {string} query - Search query
 * @returns {Object[]} Array of matching products
 */
export async function searchProducts(query) {
  if (!query) return getProductsByCategory('todo');

  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_categories(
          categories(slug, name)
        ),
        product_images(image_url, alt_text, is_primary, sort_order),
        product_specifications(spec_name, spec_value, sort_order)
      `)
      .eq('is_active', true)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,short_description.ilike.%${query}%`)
      .limit(50);

    if (error) throw error;

    // Transform data
    return data.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description || product.short_description || '',
      category: product.product_categories?.map(pc => pc.categories.slug) || [],
      images: product.product_images
        ?.sort((a, b) => a.sort_order - b.sort_order)
        ?.map(img => img.image_url) || ['/Assets/product-imgs/placeholder.jpg'],
      specifications: product.product_specifications
        ?.sort((a, b) => a.sort_order - b.sort_order)
        ?.map(spec => ({ label: spec.spec_name, value: spec.spec_value })) || [],
      seller_whatsapp: product.seller_whatsapp || '12345678901'
    }));
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
}

// Fallback data in case database is not available
function getFallbackProducts(category) {
  const fallbackProducts = [
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
      seller_whatsapp: "12345678901",
    },
  ];

  if (category === "todo") {
    return fallbackProducts;
  }

  return fallbackProducts.filter((product) => product.category.includes(category));
}