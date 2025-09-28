import { productManager } from '../js/admin/productManager.js'

export function loadAdminPage(mainContent) {
  // Set title
  document.title = "Admin Panel - 3Dynamo"

  // Check if user is authenticated (you can implement proper auth later)
  const isAuthenticated = checkAuthentication()
  
  if (!isAuthenticated) {
    showLoginForm(mainContent)
    return
  }

  // Show admin interface
  showAdminInterface(mainContent)
}

function checkAuthentication() {
  // Simple authentication check - replace with proper auth
  const adminPassword = localStorage.getItem('admin_authenticated')
  return adminPassword === 'true'
}

function showLoginForm(mainContent) {
  mainContent.innerHTML = `
    <div class="admin-login">
      <div class="login-container">
        <h1>Admin Login</h1>
        <form id="admin-login-form">
          <div class="form-group">
            <label for="admin-password">Password:</label>
            <input type="password" id="admin-password" required>
          </div>
          <button type="submit" class="btn btn-primary">Login</button>
        </form>
      </div>
    </div>
  `

  // Handle login
  const loginForm = document.getElementById('admin-login-form')
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const password = document.getElementById('admin-password').value
    
    // Simple password check - replace with proper auth
    if (password === 'admin123') {
      localStorage.setItem('admin_authenticated', 'true')
      showAdminInterface(mainContent)
    } else {
      alert('Invalid password')
    }
  })
}

async function showAdminInterface(mainContent) {
  // Show loading state
  mainContent.innerHTML = `
    <div class="admin-loading">
      <div class="loading-spinner"></div>
      <p>Loading admin interface...</p>
    </div>
  `

  try {
    // Initialize product manager
    await productManager.initialize()
    
    // Render admin interface
    productManager.render(mainContent)
  } catch (error) {
    console.error('Error loading admin interface:', error)
    mainContent.innerHTML = `
      <div class="admin-error">
        <h1>Error Loading Admin Interface</h1>
        <p>There was an error loading the admin interface. Please try again.</p>
        <button class="btn btn-primary" onclick="window.location.reload()">Retry</button>
      </div>
    `
  }
}

// Add admin styles
const style = document.createElement('style')
style.textContent = `
  .admin-login {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 60vh;
  }

  .login-container {
    background-color: var(--color-white);
    padding: var(--space-8);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    width: 100%;
    max-width: 400px;
  }

  .login-container h1 {
    text-align: center;
    margin-bottom: var(--space-6);
    color: var(--color-neutral-900);
  }

  .admin-loading {
    text-align: center;
    padding: var(--space-8);
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--color-neutral-200);
    border-top: 4px solid var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto var(--space-4);
  }

  .admin-error {
    text-align: center;
    padding: var(--space-8);
  }

  .admin-error h1 {
    color: var(--color-error);
    margin-bottom: var(--space-4);
  }
`

document.head.appendChild(style)