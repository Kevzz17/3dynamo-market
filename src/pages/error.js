// Error page
export function loadErrorPage(mainContent) {
  // Set title
  document.title = "Page Not Found - 404";

  // Update content
  mainContent.innerHTML = `
    <div class="container">
      <div class="error-container">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>La página que buscas no existe o ha sido movida.</p>
        <a href="/" class="error-button">Back to Home</a>
      </div>
    </div>
  `;
}

// Add some extra styles for the error page
const style = document.createElement("style");
style.textContent = `
  .error-container {
    text-align: center;
    padding: var(--space-16) var(--space-4);
    max-width: 600px;
    margin: 0 auto;
  }

  .error-container h1 {
    font-size: 6rem;
    color: var(--color-primary);
    margin-bottom: var(--space-4);
  }

  .error-container h2 {
    margin-bottom: var(--space-6);
    font-size: var(--font-size-2xl);
  }

  .error-container p {
    margin-bottom: var(--space-8);
    color: var(--color-neutral-600);
  }

  .error-button {
    display: inline-block;
    background-color: var(--color-primary);
    color: var(--color-white);
    padding: var(--space-3) var(--space-6);
    border-radius: var(--radius-lg);
    font-weight: 500;
    transition: background-color var(--transition-fast);
  }

  .error-button:hover {
    background-color: var(--color-primary-dark);
    color: var(--color-white);
  }
`;

document.head.appendChild(style);
