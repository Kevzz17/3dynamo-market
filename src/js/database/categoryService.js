import { supabase, dbCache, DB_CONFIG } from './supabase.js'

/**
 * Category Service - Handles all category-related database operations
 */
export class CategoryService {
  constructor() {
    this.tableName = DB_CONFIG.tables.CATEGORIES
  }

  /**
   * Get all categories
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of categories
   */
  async getCategories(options = {}) {
    try {
      const cacheKey = `categories_${JSON.stringify(options)}`
      const cached = dbCache.get(cacheKey)
      if (cached) return cached

      let query = supabase
        .from(this.tableName)
        .select('*')

      if (options.is_active !== undefined) {
        query = query.eq('is_active', options.is_active)
      }

      if (options.parent_id !== undefined) {
        query = query.eq('parent_id', options.parent_id)
      }

      query = query.order('sort_order', { ascending: true })

      const { data, error } = await query

      if (error) throw error

      dbCache.set(cacheKey, data)
      return data
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw new Error(`Failed to fetch categories: ${error.message}`)
    }
  }

  /**
   * Get category by slug
   * @param {string} slug - Category slug
   * @returns {Promise<Object|null>} Category data or null
   */
  async getCategoryBySlug(slug) {
    try {
      const cacheKey = `category_slug_${slug}`
      const cached = dbCache.get(cacheKey)
      if (cached) return cached

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }

      dbCache.set(cacheKey, data)
      return data
    } catch (error) {
      console.error('Error fetching category by slug:', error)
      throw new Error(`Failed to fetch category: ${error.message}`)
    }
  }

  /**
   * Create a new category
   * @param {Object} categoryData - Category data
   * @returns {Promise<Object>} Created category
   */
  async createCategory(categoryData) {
    try {
      this.validateCategoryData(categoryData)

      const { data, error } = await supabase
        .from(this.tableName)
        .insert([{
          name: categoryData.name,
          description: categoryData.description,
          slug: categoryData.slug,
          parent_id: categoryData.parent_id || null,
          is_active: categoryData.is_active !== false,
          sort_order: categoryData.sort_order || 0
        }])
        .select()
        .single()

      if (error) throw error

      dbCache.clear()
      return data
    } catch (error) {
      console.error('Error creating category:', error)
      throw new Error(`Failed to create category: ${error.message}`)
    }
  }

  /**
   * Update a category
   * @param {string} id - Category ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated category
   */
  async updateCategory(id, updateData) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      dbCache.clear()
      return data
    } catch (error) {
      console.error('Error updating category:', error)
      throw new Error(`Failed to update category: ${error.message}`)
    }
  }

  /**
   * Delete a category
   * @param {string} id - Category ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteCategory(id) {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error

      dbCache.clear()
      return true
    } catch (error) {
      console.error('Error deleting category:', error)
      throw new Error(`Failed to delete category: ${error.message}`)
    }
  }

  /**
   * Validate category data
   * @param {Object} categoryData - Category data to validate
   */
  validateCategoryData(categoryData) {
    const errors = []

    if (!categoryData.name || categoryData.name.trim().length === 0) {
      errors.push('Category name is required')
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '))
    }
  }
}

export const categoryService = new CategoryService()