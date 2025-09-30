export class ImageOptimizer {
  constructor() {
    this.observer = null;
    this.preloadedImages = new Set();
    this.initObserver();
  }

  initObserver() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.loadImage(entry.target);
              this.observer.unobserve(entry.target);
            }
          });
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.01
        }
      );
    }
  }

  loadImage(img) {
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;

    if (!src) return;

    img.classList.add('loading');

    const tempImage = new Image();

    tempImage.onload = () => {
      if (srcset) {
        img.srcset = srcset;
      }
      img.src = src;
      img.classList.remove('loading');
      img.classList.add('loaded');
    };

    tempImage.onerror = () => {
      img.classList.remove('loading');
      img.classList.add('error');
      img.src = '/Assets/product-imgs/placeholder.jpg';
    };

    if (srcset) {
      tempImage.srcset = srcset;
    }
    tempImage.src = src;
  }

  observe(elements) {
    if (!this.observer) {
      elements.forEach((el) => {
        if (el.dataset.src) {
          this.loadImage(el);
        }
      });
      return;
    }

    elements.forEach((el) => {
      if (el.dataset.src) {
        this.observer.observe(el);
      }
    });
  }

  preloadCriticalImages(urls) {
    urls.forEach((url) => {
      if (this.preloadedImages.has(url)) return;

      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;

      if (url.includes('?')) {
        link.imageSrcset = url;
      }

      document.head.appendChild(link);
      this.preloadedImages.add(url);
    });
  }

  createResponsiveImage(src, alt, sizes = '100vw') {
    const baseSrc = src.split('?')[0];
    const isExternal = src.startsWith('http');

    if (isExternal && src.includes('pexels.com')) {
      const srcset = this.generatePexelsSrcset(src);
      return this.createImageElement(src, srcset, alt, sizes);
    }

    return this.createImageElement(src, '', alt, sizes);
  }

  generatePexelsSrcset(url) {
    const widths = [640, 750, 828, 1080, 1200, 1920];
    const srcsetParts = widths.map((width) => {
      const optimizedUrl = url.replace(/w=\d+/, `w=${width}`).replace(/h=\d+/, `h=${Math.round(width * 0.6)}`);
      return `${optimizedUrl} ${width}w`;
    });
    return srcsetParts.join(', ');
  }

  createImageElement(src, srcset, alt, sizes) {
    return `
      <img
        data-src="${src}"
        ${srcset ? `data-srcset="${srcset}"` : ''}
        ${sizes ? `sizes="${sizes}"` : ''}
        alt="${alt}"
        class="lazy-image"
        decoding="async"
      />
    `;
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

export const imageOptimizer = new ImageOptimizer();
