import './css/style.css';
import './css/components.css';
import './css/admin.css';
import { initializeRouter } from './js/router.js';
import { initializeHeader } from './js/components/header.js';
import { initializeFooter } from './js/components/footer.js';

// Initialize app components
document.addEventListener('DOMContentLoaded', () => {
  // Set up application container
  const appContainer = document.getElementById('app');
  appContainer.innerHTML = `
    <header id="main-header" class="header"></header>
    <main id="main-content" class="main-content"></main>
    <footer id="main-footer" class="footer"></footer>
  `;

  // Initialize components
  initializeHeader();
  initializeFooter();
  
  // Set up router
  initializeRouter();
});