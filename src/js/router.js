// Simple router for single page application
import { loadHomePage } from '../pages/home.js';
import { loadProductPage } from '../pages/product.js';
import { loadCategoryPage } from '../pages/category.js';
import { loadErrorPage } from '../pages/error.js';

// Routes configuration
const routes = [
  { path: '/', handler: loadHomePage },
  { path: '/product/:id', handler: loadProductPage, dynamic: true },
  { path: '/category/:id', handler: loadCategoryPage, dynamic: true },
  { path: '*', handler: loadErrorPage }
];

// Parse the current URL and extract parameters
function parseUrl(url) {
  const parsedUrl = new URL(url, window.location.origin);
  const pathname = parsedUrl.pathname;
  const searchParams = parsedUrl.searchParams;
  
  return { pathname, searchParams };
}

// Match route with dynamic parameters
function matchRoute(pathname) {
  // Try to find an exact match first
  let route = routes.find(r => r.path === pathname);
  
  if (route) {
    return { route, params: {} };
  }
  
  // Try to match dynamic routes
  for (const r of routes) {
    if (!r.dynamic) continue;
    
    const pathParts = r.path.split('/');
    const urlParts = pathname.split('/');
    
    if (pathParts.length !== urlParts.length) continue;
    
    const params = {};
    let match = true;
    
    for (let i = 0; i < pathParts.length; i++) {
      if (pathParts[i].startsWith(':')) {
        // This is a parameter
        const paramName = pathParts[i].slice(1);
        params[paramName] = urlParts[i];
      } else if (pathParts[i] !== urlParts[i]) {
        match = false;
        break;
      }
    }
    
    if (match) {
      return { route: r, params };
    }
  }
  
  // Return the wildcard route as fallback
  return { route: routes.find(r => r.path === '*'), params: {} };
}

// Navigate to a given URL
export function navigateTo(url) {
  window.history.pushState(null, null, url);
  handleRouteChange();
}

// Handle route change
async function handleRouteChange() {
  const { pathname, searchParams } = parseUrl(window.location.href);
  const { route, params } = matchRoute(pathname);
  
  // Get the main content container
  const mainContent = document.getElementById('main-content');
  
  // Show loading state
  mainContent.innerHTML = `
    <div class="loading-container">
      <div class="loading-spinner"></div>
    </div>
  `;
  
  // Execute the route handler
  await route.handler(mainContent, params, searchParams);
  
  // Scroll to the top
  window.scrollTo(0, 0);
}

// Initialize the router
export function initializeRouter() {
  // Handle initial page load
  handleRouteChange().catch(console.error);
  
  // Handle browser back/forward navigation
  window.addEventListener('popstate', () => {
    handleRouteChange().catch(console.error);
  });
  
  // Intercept link clicks for SPA navigation
  document.addEventListener('click', (e) => {
    // Find closest anchor tag
    const anchor = e.target.closest('a');
    
    if (anchor && anchor.href && anchor.href.startsWith(window.location.origin)) {
      e.preventDefault();
      navigateTo(anchor.href);
    }
  });
}