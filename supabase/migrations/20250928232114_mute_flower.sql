/*
  # Product Database Management System s

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text)
      - `slug` (text, unique for URLs)
      - `parent_id` (uuid, for hierarchical categories)
      - `is_active` (boolean, default true)
      - `sort_order` (integer, for display ordering)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `products`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `slug` (text, unique for URLs)
      - `description` (text)
      - `short_description` (text)
      - `price` (decimal, required)
      - `compare_price` (decimal, for discounts)
      - `cost_price` (decimal, for profit calculations)
      - `sku` (text, unique stock keeping unit)
      - `barcode` (text)
      - `stock_quantity` (integer, default 0)
      - `low_stock_threshold` (integer, default 5)
      - `track_inventory` (boolean, default true)
      - `weight` (decimal)
      - `dimensions` (jsonb, for length/width/height)
      - `is_active` (boolean, default true)
      - `is_featured` (boolean, default false)
      - `meta_title` (text, for SEO)
      - `meta_description` (text, for SEO)
      - `tags` (text array)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `product_categories`
      - `product_id` (uuid, foreign key)
      - `category_id` (uuid, foreign key)
      - `is_primary` (boolean, default false)

    - `product_images`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key)
      - `image_url` (text, required)
      - `alt_text` (text)
      - `sort_order` (integer, default 0)
      - `is_primary` (boolean, default false)
      - `created_at` (timestamp)

    - `product_specifications`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key)
      - `spec_name` (text, required)
      - `spec_value` (text, required)
      - `sort_order` (integer, default 0)

    - `inventory_logs`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key)
      - `change_type` (text, check constraint)
      - `quantity_change` (integer)
      - `previous_quantity` (integer)
      - `new_quantity` (integer)
      - `reason` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage products
    - Add policies for public users to read active products

  3. Indexes
    - Performance indexes on frequently queried columns
    - Full-text search indexes for product search
    - Composite indexes for complex queries

  4. Functions
    - Automatic slug generation
    - Inventory management functions
    - Search functions with ranking
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  slug text UNIQUE NOT NULL,
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT categories_name_check CHECK (length(name) >= 1),
  CONSTRAINT categories_slug_check CHECK (length(slug) >= 1)
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  short_description text,
  price decimal(10,2) NOT NULL CHECK (price >= 0),
  compare_price decimal(10,2) CHECK (compare_price >= 0),
  cost_price decimal(10,2) CHECK (cost_price >= 0),
  sku text UNIQUE,
  barcode text,
  stock_quantity integer DEFAULT 0 CHECK (stock_quantity >= 0),
  low_stock_threshold integer DEFAULT 5 CHECK (low_stock_threshold >= 0),
  track_inventory boolean DEFAULT true,
  weight decimal(8,3) CHECK (weight >= 0),
  dimensions jsonb,
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  meta_title text,
  meta_description text,
  tags text[],
  seller_whatsapp text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT products_name_check CHECK (length(name) >= 1),
  CONSTRAINT products_slug_check CHECK (length(slug) >= 1)
);

-- Product categories junction table
CREATE TABLE IF NOT EXISTS product_categories (
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  is_primary boolean DEFAULT false,
  PRIMARY KEY (product_id, category_id)
);

-- Product images table
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  alt_text text,
  sort_order integer DEFAULT 0,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Product specifications table
CREATE TABLE IF NOT EXISTS product_specifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  spec_name text NOT NULL,
  spec_value text NOT NULL,
  sort_order integer DEFAULT 0,
  CONSTRAINT spec_name_check CHECK (length(spec_name) >= 1),
  CONSTRAINT spec_value_check CHECK (length(spec_value) >= 1)
);

-- Inventory logs table
CREATE TABLE IF NOT EXISTS inventory_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  change_type text NOT NULL CHECK (change_type IN ('restock', 'sale', 'adjustment', 'return')),
  quantity_change integer NOT NULL,
  previous_quantity integer NOT NULL,
  new_quantity integer NOT NULL,
  reason text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_description_trgm ON products USING gin(description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_specs_product ON product_specifications(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_product ON inventory_logs(product_id);

-- Function to generate slug from name
CREATE OR REPLACE FUNCTION generate_slug(input_text text)
RETURNS text AS $$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(trim(input_text), '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically generate slug if not provided
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug = generate_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic slug generation
CREATE TRIGGER auto_generate_category_slug BEFORE INSERT OR UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION auto_generate_slug();

CREATE TRIGGER auto_generate_product_slug BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION auto_generate_slug();

-- Function to log inventory changes
CREATE OR REPLACE FUNCTION log_inventory_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.stock_quantity != NEW.stock_quantity THEN
    INSERT INTO inventory_logs (
      product_id,
      change_type,
      quantity_change,
      previous_quantity,
      new_quantity,
      reason
    ) VALUES (
      NEW.id,
      'adjustment',
      NEW.stock_quantity - OLD.stock_quantity,
      OLD.stock_quantity,
      NEW.stock_quantity,
      'Stock quantity updated'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for inventory logging
CREATE TRIGGER log_product_inventory_changes AFTER UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION log_inventory_change();

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;

-- Policies for public read access to active products
CREATE POLICY "Public can read active categories"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Public can read active products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Public can read product categories"
  ON product_categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can read product images"
  ON product_images FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can read product specifications"
  ON product_specifications FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policies for authenticated users (admin access)
CREATE POLICY "Authenticated users can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage products"
  ON products FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage product categories"
  ON product_categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage product images"
  ON product_images FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage product specifications"
  ON product_specifications FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read inventory logs"
  ON inventory_logs FOR SELECT
  TO authenticated
  USING (true);

-- Insert default categories
INSERT INTO categories (name, slug, description) VALUES
  ('Todo', 'todo', 'Todos los productos'),
  ('Destacado', 'destacado', 'Productos destacados'),
  ('Nuevo', 'nuevo', 'Productos recién llegados'),
  ('Articulados', 'articulados', 'Figuras articuladas'),
  ('Tendencia', 'tendencia', 'Productos en tendencia')
ON CONFLICT (slug) DO NOTHING;