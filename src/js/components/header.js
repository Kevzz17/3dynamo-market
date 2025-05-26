// Header component
export function initializeHeader() {
  const header = document.getElementById("main-header");

  if (!header) return;

  // Get current path to highlight active menu item
  const currentPath = window.location.pathname;

  // Create header content
  header.innerHTML = `
    <div class="header-container">
      <a href="/" class="logo">
        <img src="/src/Assets/LogoIMG.png" alt="3Dynamo Logo" class="logo-icon">
        <img src="/src/Assets/LogoTXT.png" alt="3Dynamo Logo" class="logo-icon">
      </a>

      <div class="search-bar">
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input type="text" placeholder="Busca productos..." aria-label="Search products" id="search-input">
      </div>

      <nav class="nav-menu">
        <ul>
          <li><a href="/" class="${currentPath === "./" ? "active" : ""}">Inicio</a></li>
          <li><a href="/category/todo" class="${currentPath === "/category/todo" ? "active" : ""}">Tienda</a></li>
          <li><a href="/category/destacado" class="${currentPath === "/category/destacado" ? "active" : ""}">Destacado</a></li>
          <li><a href="/category/nuevo" class="${currentPath === "/category/nuevo" ? "active" : ""}">Recién llegado</a></li>
        </ul>
      </nav>

      <button class="mobile-nav-toggle" aria-label="Toggle mobile menu">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
    </div>

    <div class="mobile-menu">
      <div class="mobile-menu-header">
        <span class="logo">3Dynamo</span>
        <button class="mobile-menu-close" aria-label="Close menu">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <ul class="mobile-menu-list">
        <li><a href="/" class="${currentPath === "./" ? "active" : ""}">Inicio</a></li>
        <li><a href="/category/todo" class="${currentPath === "/category/todo" ? "active" : ""}">Explorar</a></li>
      </ul>
    </div>

    <div class="overlay"></div>
  `;

  // Handle mobile menu toggle
  const mobileMenuToggle = header.querySelector(".mobile-nav-toggle");
  const mobileMenuClose = header.querySelector(".mobile-menu-close");
  const mobileMenu = header.querySelector(".mobile-menu");
  const overlay = header.querySelector(".overlay");

  function openMobileMenu() {
    mobileMenu.classList.add("active");
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeMobileMenu() {
    mobileMenu.classList.remove("active");
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  mobileMenuToggle.addEventListener("click", openMobileMenu);
  mobileMenuClose.addEventListener("click", closeMobileMenu);
  overlay.addEventListener("click", closeMobileMenu);
  mobileMenu.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      closeMobileMenu();
      setTimeout(() => {
        window.location.reload();
      }, 300);
    }
  });

  // Select the nav links (no mobile)
  const navLinks = header.querySelectorAll(".nav-menu ul li a");
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      setTimeout(() => {
        window.location.reload();
      }, 300);
    });
  });

  // Handle search
  const searchInput = header.querySelector("#search-input");

  searchInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      const query = searchInput.value.trim();
      if (query) {
        window.location.href = `/category/todo?search=${encodeURIComponent(query)}`;
      }
    }
  });
}
