import { supabase, dbCache, DB_CONFIG } from './supabase.js'

/**
 * Product Service - Handles all product-related database operations
 */
export class ProductService {
  constructor() {
    this.tableName = DB_CONFIG.tables.PRODUCTS
  }

  /**
   * Create a new product
   * @param {Object} productData - Product data
   * @returns {Promise<Object>} Created product
   */
  async createProduct(productData) {
    try {
      // Validate required fields
      this.validateProductData(productData)

      const { data, error } = await supabase
        .from(this.tableName)
        .insert([{
          name: productData.name,
          description: productData.description,
          short_description: productData.short_description,
          price: parseFloat(productData.price),
          compare_price: productData.compare_price ? parseFloat(productData.compare_price) : null,
          cost_price: productData.cost_price ? parseFloat(productData.cost_price) : null,
          sku: productData.sku,
          barcode: productData.barcode,
          stock_quantity: parseInt(productData.stock_quantity) || 0,
          low_stock_threshold: parseInt(productData.low_stock_threshold) || 5,
          track_inventory: productData.track_inventory !== false,
          weight: productData.weight ? parseFloat(productData.weight) : null,
          dimensions: productData.dimensions,
          is_active: productData.is_active !== false,
          is_featured: productData.is_featured === true,
          meta_title: productData.meta_title,
          meta_description: productData.meta_description,
          tags: productData.tags || [],
          seller_whatsapp: productData.seller_whatsapp
        }])
        .select()
        .single()

      if (error) throw error

      // Clear cache
      dbCache.clear()

      // Add categories if provided
      if (productData.categories && productData.categories.length > 0) {
        await this.updateProductCategories(data.id, productData.categories)
      }

      // Add images if provided
      if (productData.images && productData.images.length > 0) {
        await this.updateProductImages(data.id, productData.images)
      }

      // Add specifications if provided
      if (productData.specifications && productData.specifications.length > 0) {
        await this.updateProductSpecifications(data.id, productData.specifications)
      }

      return data
    } catch (error) {
      console.error('Error creating product:', error)
      throw new Error(`Failed to create product: ${error.message}`)
    }
  }

  /**
   * Get all products with optional filtering
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of products
   */
  async getProducts(options = {}) {
    try {
      const cacheKey = `products_${JSON.stringify(options)}`
      const cached = dbCache.get(cacheKey)
      if (cached) return cached

      let query = supabase
        .from(this.tableName)
        .select(`
          *,
          product_categories!inner(
            categories(name, slug)
          ),
          product_images(image_url, alt_text, is_primary, sort_order),
          product_specifications(spec_name, spec_value, sort_order)
        `)

      // Apply filters
      if (options.category) {
        query = query.eq('product_categories.categories.slug', options.category)
      }

      if (options.is_active !== undefined) {
        query = query.eq('is_active', options.is_active)
      }

      if (options.is_featured !== undefined) {
        query = query.eq('is_featured', options.is_featured)
      }

      if (options.search) {
        query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%`)
      }

      if (options.min_price) {
        query = query.gte('price', options.min_price)
      }

      if (options.max_price) {
        query = query.lte('price', options.max_price)
      }

      // Apply sorting
      const sortBy = options.sort_by || 'created_at'
      const sortOrder = options.sort_order || 'desc'
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit)
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
      }

      const { data, error } = await query

      if (error) throw error

      // Transform data for easier use
      const transformedData = data.map(product => ({
        ...product,
        categories: product.product_categories?.map(pc => pc.categories) || [],
        images: product.product_images?.sort((a, b) => a.sort_order - b.sort_order) || [],
        specifications: product.product_specifications?.sort((a, b) => a.sort_order - b.sort_order) || []
      }))

      dbCache.set(cacheKey, transformedData)
      return transformedData
    } catch (error) {
      console.error('Error fetching products:', error)
      throw new Error(`Failed to fetch products: ${error.message}`)
    }
  }

  /**
   * Get a single product by ID
   * @param {string} id - Product ID
   * @returns {Promise<Object|null>} Product data or null
   */
  async getProductById(id) {
    try {
      const cacheKey = `product_${id}`
      const cached = dbCache.get(cacheKey)
      if (cached) return cached

      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          product_categories(
            categories(name, slug)
          ),
          product_images(image_url, alt_text, is_primary, sort_order),
          product_specifications(spec_name, spec_value, sort_order)
        `)
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // Not found
        throw error
      }

      // Transform data
      const transformedData = {
        ...data,
        categories: data.product_categories?.map(pc => pc.categories) || [],
        images: data.product_images?.sort((a, b) => a.sort_order - b.sort_order) || [],
        specifications: data.product_specifications?.sort((a, b) => a.sort_order - b.sort_order) || []
      }

      dbCache.set(cacheKey, transformedData)
      return transformedData
    } catch (error) {
      console.error('Error fetching product:', error)
      throw new Error(`Failed to fetch product: ${error.message}`)
    }
  }

  /**
   * Update a product
   * @param {string} id - Product ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated product
   */
  async updateProduct(id, updateData) {
    try {
      this.validateProductData(updateData, false) // Skip required field validation for updates

      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          ...updateData,
          price: updateData.price ? parseFloat(updateData.price) : undefined,
          compare_price: updateData.compare_price ? parseFloat(updateData.compare_price) : undefined,
          cost_price: updateData.cost_price ? parseFloat(updateData.cost_price) : undefined,
          stock_quantity: updateData.stock_quantity ? parseInt(updateData.stock_quantity) : undefined,
          low_stock_threshold: updateData.low_stock_threshold ? parseInt(updateData.low_stock_threshold) : undefined,
          weight: updateData.weight ? parseFloat(updateData.weight) : undefined
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Clear cache
      dbCache.delete(`product_${id}`)
      dbCache.clear() // Clear all products cache

      return data
    } catch (error) {
      console.error('Error updating product:', error)
      throw new Error(`Failed to update product: ${error.message}`)
    }
  }

  /**
   * Delete a product (soft delete by setting is_active to false)
   * @param {string} id - Product ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteProduct(id) {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error

      // Clear cache
      dbCache.delete(`product_${id}`)
      dbCache.clear()

      return true
    } catch (error) {
      console.error('Error deleting product:', error)
      throw new Error(`Failed to delete product: ${error.message}`)
    }
  }

  /**
   * Permanently delete a product
   * @param {string} id - Product ID
   * @returns {Promise<boolean>} Success status
   */
  async permanentlyDeleteProduct(id) {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id)

      if (error) throw error

      // Clear cache
      dbCache.delete(`product_${id}`)
      dbCache.clear()

      return true
    } catch (error) {
      console.error('Error permanently deleting product:', error)
      throw new Error(`Failed to permanently delete product: ${error.message}`)
    }
  }

  /**
   * Update product stock quantity
   * @param {string} id - Product ID
   * @param {number} quantity - New quantity
   * @param {string} reason - Reason for change
   * @returns {Promise<Object>} Updated product
   */
  async updateStock(id, quantity, reason = 'Manual adjustment') {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({ stock_quantity: parseInt(quantity) })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Clear cache
      dbCache.delete(`product_${id}`)
      dbCache.clear()

      return data
    } catch (error) {
      console.error('Error updating stock:', error)
      throw new Error(`Failed to update stock: ${error.message}`)
    }
  }

  /**
   * Search products with full-text search
   * @param {string} query - Search query
   * @param {Object} options - Additional options
   * @returns {Promise<Array>} Search results
   */
  async searchProducts(query, options = {}) {
    try {
      const cacheKey = `search_${query}_${JSON.stringify(options)}`
      const cached = dbCache.get(cacheKey)
      if (cached) return cached

      let supabaseQuery = supabase
        .from(this.tableName)
        .select(`
          *,
          product_categories(
            categories(name, slug)
          ),
          product_images(image_url, alt_text, is_primary, sort_order),
          product_specifications(spec_name, spec_value, sort_order)
        `)
        .eq('is_active', true)

      // Full-text search
      if (query) {
        supabaseQuery = supabaseQuery.or(
          `name.ilike.%${query}%,description.ilike.%${query}%,short_description.ilike.%${query}%,tags.cs.{${query}}`
        )
      }

      // Apply additional filters
      if (options.category) {
        supabaseQuery = supabaseQuery.eq('product_categories.categories.slug', options.category)
      }

      const { data, error } = await supabaseQuery.limit(options.limit || 50)

      if (error) throw error

      // Transform and rank results
      const transformedData = data.map(product => ({
        ...product,
        categories: product.product_categories?.map(pc => pc.categories) || [],
        images: product.product_images?.sort((a, b) => a.sort_order - b.sort_order) || [],
        specifications: product.product_specifications?.sort((a, b) => a.sort_order - b.sort_order) || []
      }))

      dbCache.set(cacheKey, transformedData)
      return transformedData
    } catch (error) {
      console.error('Error searching products:', error)
      throw new Error(`Failed to search products: ${error.message}`)
    }
  }

  /**
   * Get low stock products
   * @returns {Promise<Array>} Products with low stock
   */
  async getLowStockProducts() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('is_active', true)
        .eq('track_inventory', true)
        .filter('stock_quantity', 'lte', 'low_stock_threshold')

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching low stock products:', error)
      throw new Error(`Failed to fetch low stock products: ${error.message}`)
    }
  }

  /**
   * Update product categories
   * @param {string} productId - Product ID
   * @param {Array} categories - Array of category IDs
   */
  async updateProductCategories(productId, categories) {
    try {
      // Remove existing categories
      await supabase
        .from(DB_CONFIG.tables.PRODUCT_CATEGORIES)
        .delete()
        .eq('product_id', productId)

      // Add new categories
      if (categories.length > 0) {
        const categoryData = categories.map((categoryId, index) => ({
          product_id: productId,
          category_id: categoryId,
          is_primary: index === 0
        }))

        const { error } = await supabase
          .from(DB_CONFIG.tables.PRODUCT_CATEGORIES)
          .insert(categoryData)

        if (error) throw error
      }
    } catch (error) {
      console.error('Error updating product categories:', error)
      throw error
    }
  }

  /**
   * Update product images
   * @param {string} productId - Product ID
   * @param {Array} images - Array of image objects
   */
  async updateProductImages(productId, images) {
    try {
      // Remove existing images
      await supabase
        .from(DB_CONFIG.tables.PRODUCT_IMAGES)
        .delete()
        .eq('product_id', productId)

      // Add new images
      if (images.length > 0) {
        const imageData = images.map((image, index) => ({
          product_id: productId,
          image_url: image.url,
          alt_text: image.alt_text || '',
          sort_order: index,
          is_primary: index === 0
        }))

        const { error } = await supabase
          .from(DB_CONFIG.tables.PRODUCT_IMAGES)
          .insert(imageData)

        if (error) throw error
      }
    } catch (error) {
      console.error('Error updating product images:', error)
      throw error
    }
  }

  /**
   * Update product specifications
   * @param {string} productId - Product ID
   * @param {Array} specifications - Array of specification objects
   */
  async updateProductSpecifications(productId, specifications) {
    try {
      // Remove existing specifications
      await supabase
        .from(DB_CONFIG.tables.PRODUCT_SPECIFICATIONS)
        .delete()
        .eq('product_id', productId)

      // Add new specifications
      if (specifications.length > 0) {
        const specData = specifications.map((spec, index) => ({
          product_id: productId,
          spec_name: spec.name || spec.label,
          spec_value: spec.value,
          sort_order: index
        }))

        const { error } = await supabase
          .from(DB_CONFIG.tables.PRODUCT_SPECIFICATIONS)
          .insert(specData)

        if (error) throw error
      }
    } catch (error) {
      console.error('Error updating product specifications:', error)
      throw error
    }
  }

  /**
   * Validate product data
   * @param {Object} productData - Product data to validate
   * @param {boolean} requireAll - Whether all required fields must be present
   */
  validateProductData(productData, requireAll = true) {
    const errors = []

    if (requireAll || productData.name !== undefined) {
      if (!productData.name || productData.name.trim().length === 0) {
        errors.push('Product name is required')
      }
    }

    if (requireAll || productData.price !== undefined) {
      if (!productData.price || isNaN(parseFloat(productData.price)) || parseFloat(productData.price) < 0) {
        errors.push('Valid price is required')
      }
    }

    if (productData.compare_price !== undefined && productData.compare_price !== null) {
      if (isNaN(parseFloat(productData.compare_price)) || parseFloat(productData.compare_price) < 0) {
        errors.push('Compare price must be a valid positive number')
      }
    }

    if (productData.stock_quantity !== undefined) {
      if (isNaN(parseInt(productData.stock_quantity)) || parseInt(productData.stock_quantity) < 0) {
        errors.push('Stock quantity must be a valid non-negative number')
      }
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '))
    }
  }
}

// Export singleton instance
export const productService = new ProductService()