import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// Test connection
export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('count')
      .limit(1)

    if (error) {
      console.warn('Supabase connection failed, using fallback data:', error.message)
      return false
    }

    console.log('Supabase connected successfully')
    return true
  } catch (error) {
    console.warn('Supabase connection failed, using fallback data:', error.message)
    return false
  }
}