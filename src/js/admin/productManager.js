import { productService } from '../database/productService.js'
import { categoryService } from '../database/categoryService.js'
import { formatPrice } from '../utils.js'

/**
 * Product Manager - Admin interface for managing products
 */
export class ProductManager {
  constructor() {
    this.currentProducts = []
    this.currentCategories = []
    this.filters = {
      category: 'all',
      status: 'all',
      search: ''
    }
  }

  /**
   * Initialize the product manager
   */
  async initialize() {
    try {
      await this.loadCategories()
      await this.loadProducts()
      this.setupEventListeners()
    } catch (error) {
      console.error('Error initializing product manager:', error)
      this.showError('Failed to initialize product manager')
    }
  }

  /**
   * Load all categories
   */
  async loadCategories() {
    try {
      this.currentCategories = await categoryService.getCategories({ is_active: true })
    } catch (error) {
      console.error('Error loading categories:', error)
      throw error
    }
  }

  /**
   * Load products with current filters
   */
  async loadProducts() {
    try {
      const options = {
        is_active: this.filters.status === 'active' ? true : this.filters.status === 'inactive' ? false : undefined,
        category: this.filters.category !== 'all' ? this.filters.category : undefined,
        search: this.filters.search || undefined,
        limit: 50
      }

      this.currentProducts = await productService.getProducts(options)
      this.renderProductList()
    } catch (error) {
      console.error('Error loading products:', error)
      this.showError('Failed to load products')
    }
  }

  /**
   * Render the product management interface
   */
  render(container) {
    container.innerHTML = `
      <div class="product-manager">
        <div class="manager-header">
          <h1>Product Management</h1>
          <button class="btn btn-primary" id="add-product-btn">Add New Product</button>
        </div>

        <div class="manager-filters">
          <div class="filter-group">
            <label for="category-filter">Category:</label>
            <select id="category-filter">
              <option value="all">All Categories</option>
              ${this.currentCategories.map(cat => 
                `<option value="${cat.slug}" ${this.filters.category === cat.slug ? 'selected' : ''}>${cat.name}</option>`
              ).join('')}
            </select>
          </div>

          <div class="filter-group">
            <label for="status-filter">Status:</label>
            <select id="status-filter">
              <option value="all" ${this.filters.status === 'all' ? 'selected' : ''}>All</option>
              <option value="active" ${this.filters.status === 'active' ? 'selected' : ''}>Active</option>
              <option value="inactive" ${this.filters.status === 'inactive' ? 'selected' : ''}>Inactive</option>
            </select>
          </div>

          <div class="filter-group">
            <label for="search-filter">Search:</label>
            <input type="text" id="search-filter" placeholder="Search products..." value="${this.filters.search}">
          </div>

          <button class="btn btn-secondary" id="clear-filters-btn">Clear Filters</button>
        </div>

        <div class="manager-stats">
          <div class="stat-card">
            <h3>Total Products</h3>
            <span class="stat-number">${this.currentProducts.length}</span>
          </div>
          <div class="stat-card">
            <h3>Active Products</h3>
            <span class="stat-number">${this.currentProducts.filter(p => p.is_active).length}</span>
          </div>
          <div class="stat-card">
            <h3>Low Stock</h3>
            <span class="stat-number">${this.currentProducts.filter(p => p.track_inventory && p.stock_quantity <= p.low_stock_threshold).length}</span>
          </div>
        </div>

        <div class="product-list" id="product-list">
          <!-- Products will be rendered here -->
        </div>

        <!-- Product Form Modal -->
        <div class="modal" id="product-modal">
          <div class="modal-content">
            <div class="modal-header">
              <h2 id="modal-title">Add New Product</h2>
              <button class="modal-close" id="modal-close">&times;</button>
            </div>
            <form id="product-form">
              <div class="form-grid">
                <div class="form-group">
                  <label for="product-name">Product Name *</label>
                  <input type="text" id="product-name" name="name" required>
                </div>

                <div class="form-group">
                  <label for="product-sku">SKU</label>
                  <input type="text" id="product-sku" name="sku">
                </div>

                <div class="form-group">
                  <label for="product-price">Price *</label>
                  <input type="number" id="product-price" name="price" step="0.01" min="0" required>
                </div>

                <div class="form-group">
                  <label for="product-compare-price">Compare Price</label>
                  <input type="number" id="product-compare-price" name="compare_price" step="0.01" min="0">
                </div>

                <div class="form-group">
                  <label for="product-stock">Stock Quantity</label>
                  <input type="number" id="product-stock" name="stock_quantity" min="0" value="0">
                </div>

                <div class="form-group">
                  <label for="product-low-stock">Low Stock Threshold</label>
                  <input type="number" id="product-low-stock" name="low_stock_threshold" min="0" value="5">
                </div>

                <div class="form-group full-width">
                  <label for="product-description">Description</label>
                  <textarea id="product-description" name="description" rows="4"></textarea>
                </div>

                <div class="form-group full-width">
                  <label for="product-short-description">Short Description</label>
                  <textarea id="product-short-description" name="short_description" rows="2"></textarea>
                </div>

                <div class="form-group">
                  <label for="product-weight">Weight (kg)</label>
                  <input type="number" id="product-weight" name="weight" step="0.001" min="0">
                </div>

                <div class="form-group">
                  <label for="product-whatsapp">WhatsApp Number</label>
                  <input type="text" id="product-whatsapp" name="seller_whatsapp">
                </div>

                <div class="form-group">
                  <label>
                    <input type="checkbox" id="product-active" name="is_active" checked>
                    Active
                  </label>
                </div>

                <div class="form-group">
                  <label>
                    <input type="checkbox" id="product-featured" name="is_featured">
                    Featured
                  </label>
                </div>

                <div class="form-group">
                  <label>
                    <input type="checkbox" id="product-track-inventory" name="track_inventory" checked>
                    Track Inventory
                  </label>
                </div>
              </div>

              <div class="form-actions">
                <button type="button" class="btn btn-secondary" id="cancel-btn">Cancel</button>
                <button type="submit" class="btn btn-primary" id="save-btn">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `

    this.setupEventListeners()
  }

  /**
   * Render the product list
   */
  renderProductList() {
    const container = document.getElementById('product-list')
    if (!container) return

    if (this.currentProducts.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>No products found matching your criteria.</p>
        </div>
      `
      return
    }

    container.innerHTML = `
      <div class="product-table">
        <div class="table-header">
          <div class="table-cell">Product</div>
          <div class="table-cell">SKU</div>
          <div class="table-cell">Price</div>
          <div class="table-cell">Stock</div>
          <div class="table-cell">Status</div>
          <div class="table-cell">Actions</div>
        </div>
        ${this.currentProducts.map(product => this.renderProductRow(product)).join('')}
      </div>
    `
  }

  /**
   * Render a single product row
   */
  renderProductRow(product) {
    const stockStatus = product.track_inventory 
      ? (product.stock_quantity <= product.low_stock_threshold ? 'low' : 'normal')
      : 'not-tracked'

    return `
      <div class="table-row" data-product-id="${product.id}">
        <div class="table-cell">
          <div class="product-info">
            ${product.images.length > 0 ? 
              `<img src="${product.images[0].image_url}" alt="${product.name}" class="product-thumb">` : 
              '<div class="product-thumb-placeholder"></div>'
            }
            <div>
              <div class="product-name">${product.name}</div>
              <div class="product-categories">${product.categories.map(cat => cat.name).join(', ')}</div>
            </div>
          </div>
        </div>
        <div class="table-cell">${product.sku || '-'}</div>
        <div class="table-cell">${formatPrice(product.price)}</div>
        <div class="table-cell">
          <span class="stock-badge stock-${stockStatus}">
            ${product.track_inventory ? product.stock_quantity : 'N/A'}
          </span>
        </div>
        <div class="table-cell">
          <span class="status-badge ${product.is_active ? 'active' : 'inactive'}">
            ${product.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div class="table-cell">
          <div class="action-buttons">
            <button class="btn btn-sm btn-secondary edit-btn" data-product-id="${product.id}">Edit</button>
            <button class="btn btn-sm btn-danger delete-btn" data-product-id="${product.id}">Delete</button>
          </div>
        </div>
      </div>
    `
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Filter changes
    const categoryFilter = document.getElementById('category-filter')
    const statusFilter = document.getElementById('status-filter')
    const searchFilter = document.getElementById('search-filter')
    const clearFiltersBtn = document.getElementById('clear-filters-btn')

    if (categoryFilter) {
      categoryFilter.addEventListener('change', (e) => {
        this.filters.category = e.target.value
        this.loadProducts()
      })
    }

    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        this.filters.status = e.target.value
        this.loadProducts()
      })
    }

    if (searchFilter) {
      let searchTimeout
      searchFilter.addEventListener('input', (e) => {
        clearTimeout(searchTimeout)
        searchTimeout = setTimeout(() => {
          this.filters.search = e.target.value
          this.loadProducts()
        }, 300)
      })
    }

    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', () => {
        this.filters = { category: 'all', status: 'all', search: '' }
        if (categoryFilter) categoryFilter.value = 'all'
        if (statusFilter) statusFilter.value = 'all'
        if (searchFilter) searchFilter.value = ''
        this.loadProducts()
      })
    }

    // Add product button
    const addProductBtn = document.getElementById('add-product-btn')
    if (addProductBtn) {
      addProductBtn.addEventListener('click', () => this.showProductModal())
    }

    // Modal close
    const modalClose = document.getElementById('modal-close')
    if (modalClose) {
      modalClose.addEventListener('click', () => this.hideProductModal())
    }

    // Form submission
    const productForm = document.getElementById('product-form')
    if (productForm) {
      productForm.addEventListener('submit', (e) => this.handleFormSubmit(e))
    }

    // Cancel button
    const cancelBtn = document.getElementById('cancel-btn')
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.hideProductModal())
    }

    // Product actions (edit, delete)
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('edit-btn')) {
        const productId = e.target.dataset.productId
        this.editProduct(productId)
      } else if (e.target.classList.contains('delete-btn')) {
        const productId = e.target.dataset.productId
        this.deleteProduct(productId)
      }
    })
  }

  /**
   * Show product modal for adding/editing
   */
  showProductModal(product = null) {
    const modal = document.getElementById('product-modal')
    const title = document.getElementById('modal-title')
    const form = document.getElementById('product-form')

    if (product) {
      title.textContent = 'Edit Product'
      this.populateForm(product)
    } else {
      title.textContent = 'Add New Product'
      form.reset()
    }

    modal.style.display = 'block'
  }

  /**
   * Hide product modal
   */
  hideProductModal() {
    const modal = document.getElementById('product-modal')
    modal.style.display = 'none'
  }

  /**
   * Populate form with product data
   */
  populateForm(product) {
    const form = document.getElementById('product-form')
    const formData = new FormData()

    // Populate form fields
    Object.keys(product).forEach(key => {
      const input = form.querySelector(`[name="${key}"]`)
      if (input) {
        if (input.type === 'checkbox') {
          input.checked = product[key]
        } else {
          input.value = product[key] || ''
        }
      }
    })

    // Store product ID for editing
    form.dataset.productId = product.id
  }

  /**
   * Handle form submission
   */
  async handleFormSubmit(e) {
    e.preventDefault()
    
    const form = e.target
    const formData = new FormData(form)
    const productData = {}

    // Convert form data to object
    for (let [key, value] of formData.entries()) {
      if (value !== '') {
        productData[key] = value
      }
    }

    // Handle checkboxes
    productData.is_active = form.querySelector('[name="is_active"]').checked
    productData.is_featured = form.querySelector('[name="is_featured"]').checked
    productData.track_inventory = form.querySelector('[name="track_inventory"]').checked

    try {
      const saveBtn = document.getElementById('save-btn')
      saveBtn.disabled = true
      saveBtn.textContent = 'Saving...'

      if (form.dataset.productId) {
        // Update existing product
        await productService.updateProduct(form.dataset.productId, productData)
        this.showSuccess('Product updated successfully')
      } else {
        // Create new product
        await productService.createProduct(productData)
        this.showSuccess('Product created successfully')
      }

      this.hideProductModal()
      await this.loadProducts()
    } catch (error) {
      console.error('Error saving product:', error)
      this.showError(error.message)
    } finally {
      const saveBtn = document.getElementById('save-btn')
      saveBtn.disabled = false
      saveBtn.textContent = 'Save Product'
    }
  }

  /**
   * Edit a product
   */
  async editProduct(productId) {
    try {
      const product = await productService.getProductById(productId)
      if (product) {
        this.showProductModal(product)
      }
    } catch (error) {
      console.error('Error loading product for edit:', error)
      this.showError('Failed to load product data')
    }
  }

  /**
   * Delete a product
   */
  async deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
      return
    }

    try {
      await productService.deleteProduct(productId)
      this.showSuccess('Product deleted successfully')
      await this.loadProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      this.showError('Failed to delete product')
    }
  }

  /**
   * Show success message
   */
  showSuccess(message) {
    // Implementation depends on your notification system
    alert(message) // Simple implementation
  }

  /**
   * Show error message
   */
  showError(message) {
    // Implementation depends on your notification system
    alert('Error: ' + message) // Simple implementation
  }
}

// Export singleton instance
export const productManager = new ProductManager()