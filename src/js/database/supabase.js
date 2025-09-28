import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database configuration and helper functions
export const DB_CONFIG = {
  tables: {
    PRODUCTS: 'products',
    CATEGORIES: 'categories',
    PRODUCT_CATEGORIES: 'product_categories',
    PRODUCT_IMAGES: 'product_images',
    PRODUCT_SPECIFICATIONS: 'product_specifications',
    INVENTORY_LOGS: 'inventory_logs'
  },
  cache: {
    TTL: 5 * 60 * 1000, // 5 minutes
    maxSize: 1000
  }
}

// Simple in-memory cache for performance
class DatabaseCache {
  constructor(maxSize = 1000, ttl = 5 * 60 * 1000) {
    this.cache = new Map()
    this.maxSize = maxSize
    this.ttl = ttl
  }

  set(key, value) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    })
  }

  get(key) {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return item.value
  }

  clear() {
    this.cache.clear()
  }

  delete(key) {
    this.cache.delete(key)
  }
}

export const dbCache = new DatabaseCache(
  DB_CONFIG.cache.maxSize,
  DB_CONFIG.cache.TTL
)