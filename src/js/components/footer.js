// Footer component
export function initializeFooter() {
  const footer = document.getElementById("main-footer");

  if (!footer) return;

  // Create footer content
  footer.innerHTML = `
    <div class="footer-container">
      <div class="footer-column">
        <a href="/" class="footer-logo">
          <img src="/src/Assets/LogoIMG.png" alt="3Dynamo Logo" class="logo-icon footer-icon">
          3Dynamo
        </a>
        <p class="footer-about">3Dynamo, tu siempre confiable, ofrece una selección de productos de alta calidad para tu satisfacción como comprador. Nos enfocamos en el cliente siempre :).</p>
      </div>

      <div class="footer-column">
        <h3 class="footer-heading">Tienda</h3>
        <ul class="footer-links">
          <li><a href="/category/todo">Todos los productos</a></li>
          <li><a href="/category/destacado">Productos destacados</a></li>
          <li><a href="/category/nuevo">Recién llegados</a></li>
          <li><a href="/category/tendencia">Más vendidos</a></li>
        </ul>
      </div>

      <div class="footer-column">
        <h3 class="footer-heading">Categorías</h3>
        <ul class="footer-links">
          <li><a href="/category/electronics">Electronicos</a></li>
          <li><a href="/category/fashion">Fashion</a></li>
          <li><a href="/category/home">Home & Living</a></li>
          <li><a href="/category/beauty">Beauty & Health</a></li>
        </ul>
      </div>

      <div class="footer-column">
        <h3 class="footer-heading">Sobre Nosotros</h3>
        <ul class="footer-links">
          <li><a href="#">Nuestra historia</a></li>
          <li><a href="mailto:3dynamo.ilcgs@gmail.com">Contáctanos</a></li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom container">
      <p>&copy; ${new Date().getFullYear()} 3Dynamo. Todos los derechos reservados.</p>
    </div>
  `;
}
