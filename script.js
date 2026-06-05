const dom = {
  menuWrap: document.querySelector('.menu-wrap'),
  hamburger: document.querySelector('.hamburger'),
  dropdownLinks: document.querySelectorAll('[data-menu-link]'),
  navLinks: document.querySelectorAll('.nav-link, [data-menu-link]'),
  hashLinks: document.querySelectorAll('a[href^="#"]'),
  sections: document.querySelectorAll('.section-anchor[id]'),
  carousel: document.querySelector('[data-carousel]'),
  productGrid: document.querySelector('[data-product-grid]'),
  sizeOptions: document.querySelector('.size-options'),
  selectedSize: document.querySelector('.selected-size span'),
  searchForm: document.querySelector('.search-box'),
  searchInput: document.querySelector('#search-input'),
  backToTop: document.querySelector('.back-to-top'),
  mobileCall: document.querySelector('[data-call-button]'),
  brandLogoImages: document.querySelectorAll('.brand-logo-box img'),
  serviceIconImages: document.querySelectorAll('[data-service-icon]'),
};

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const PRODUCTS = Array.isArray(window.products) ? window.products : [];
const productIds = new Set();
let activeSize = dom.selectedSize?.textContent?.trim() || '55 inch';
let searchTerm = '';

const escapeHtml = (value = '') =>
  String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);

const normalizeProduct = (product = {}, index = 0) => {
  const fallbackId = `san-pham-${index + 1}`;
  const id = String(product.id || fallbackId).trim();

  if (productIds.has(id)) {
    console.warn(`Sản phẩm trùng id: ${id}`);
  }
  productIds.add(id);

  return {
    id,
    brand: product.brand || 'Anh Minh Store',
    model: product.model || 'Tivi đang cập nhật',
    size: product.size || 'Liên hệ tư vấn',
    type: product.type || 'Tivi',
    condition: product.condition || 'Liên hệ kiểm tra tình trạng',
    features: Array.isArray(product.features) && product.features.length ? product.features : ['Thông tin đang được cập nhật'],
    oldPrice: product.oldPrice || '',
    price: product.price || 'Giá đang cập nhật',
    image: product.image || '',
    badge: product.badge || 'Tư vấn',
    description: product.description || 'Vui lòng liên hệ Anh Minh Store để được tư vấn chi tiết.',
  };
};

const products = PRODUCTS.map(normalizeProduct);

const getBrandNameFromLogo = (image) => image.alt.replace(/^Logo\s+/i, '').trim();

const showBrandLogoImage = (image) => {
  const logoBox = image.closest('.brand-logo-box');
  if (!logoBox) return;
  logoBox.classList.remove('is-logo-error');
  logoBox.removeAttribute('aria-label');
  image.hidden = false;
  const fallback = logoBox.querySelector('.brand-fallback-badge');
  if (fallback) fallback.setAttribute('aria-hidden', 'true');
};

const showBrandLogoFallback = (image) => {
  const logoBox = image.closest('.brand-logo-box');
  if (!logoBox) return;
  const brandName = getBrandNameFromLogo(image);
  const fallback = logoBox.querySelector('.brand-fallback-badge');
  logoBox.classList.add('is-logo-error');
  image.hidden = true;
  if (fallback) {
    fallback.textContent = brandName.charAt(0).toUpperCase() || '?';
    fallback.setAttribute('aria-hidden', 'false');
  }
  logoBox.setAttribute('aria-label', `Logo ${brandName || 'hãng tivi'} đang được cập nhật`);
};

dom.brandLogoImages.forEach((image) => {
  image.addEventListener('load', () => showBrandLogoImage(image));
  image.addEventListener('error', () => showBrandLogoFallback(image));

  if (image.complete && typeof image.decode === 'function') {
    image.decode().then(() => showBrandLogoImage(image)).catch(() => showBrandLogoFallback(image));
  }
});

const showServiceIconImage = (image) => {
  const iconBox = image.closest('.service-icon-box');
  if (!iconBox) return;
  iconBox.classList.remove('is-icon-error');
  image.hidden = false;
  const fallback = iconBox.querySelector('.service-icon-fallback');
  if (fallback) fallback.setAttribute('aria-hidden', 'true');
};

const showServiceIconFallback = (image) => {
  const iconBox = image.closest('.service-icon-box');
  if (!iconBox) return;
  const fallback = iconBox.querySelector('.service-icon-fallback');
  iconBox.classList.add('is-icon-error');
  image.hidden = true;
  if (fallback) {
    fallback.textContent = image.dataset.fallback || 'TV';
    fallback.setAttribute('aria-hidden', 'false');
  }
};

dom.serviceIconImages.forEach((image) => {
  image.addEventListener('load', () => showServiceIconImage(image));
  image.addEventListener('error', () => showServiceIconFallback(image));

  if (image.complete && typeof image.decode === 'function') {
    image.decode().then(() => showServiceIconImage(image)).catch(() => showServiceIconFallback(image));
  }
});

const setMenuState = (isOpen) => {
  if (!dom.menuWrap || !dom.hamburger) return;
  dom.menuWrap.classList.toggle('is-open', isOpen);
  document.body.classList.toggle('menu-open', isOpen);
  dom.hamburger.setAttribute('aria-expanded', String(isOpen));
  dom.hamburger.setAttribute('aria-label', isOpen ? 'Đóng danh mục' : 'Mở danh mục');
};

const scrollToHash = (hash) => {
  if (!hash || hash === '#') return;
  const target = document.querySelector(hash);
  if (!target) return;
  target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
};

const setActiveLink = (id) => {
  dom.navLinks.forEach((link) => {
    const href = link.getAttribute('href') || '';
    const isActive = href === `#${id}` || href.endsWith(`#${id}`);
    link.classList.toggle('is-active', isActive);
    isActive ? link.setAttribute('aria-current', 'page') : link.removeAttribute('aria-current');
  });
};

const handleNavClick = (event) => {
  const link = event.currentTarget;
  const hash = link.getAttribute('href');
  if (!hash || hash === '#') return;
  const target = document.querySelector(hash);
  if (!target) return;
  event.preventDefault();
  setMenuState(false);
  scrollToHash(hash);
  history.pushState(null, '', hash);
};

if (dom.hamburger) {
  dom.hamburger.addEventListener('click', (event) => {
    event.stopPropagation();
    setMenuState(!dom.menuWrap?.classList.contains('is-open'));
  });
}

dom.dropdownLinks.forEach((link) => link.addEventListener('click', () => setMenuState(false)));
dom.hashLinks.forEach((link) => link.addEventListener('click', handleNavClick));

document.addEventListener('click', (event) => {
  if (dom.menuWrap && !dom.menuWrap.contains(event.target)) setMenuState(false);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenuState(false);
});

dom.mobileCall?.addEventListener('click', () => {
  window.location.href = 'tel:0905111223';
});

if ('IntersectionObserver' in window && dom.sections.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target?.id) setActiveLink(visible.target.id);
    },
    { rootMargin: '-35% 0px -55% 0px', threshold: [0.1, 0.25, 0.5] },
  );
  dom.sections.forEach((section) => observer.observe(section));
}

const createProductDetailUrl = (product) => `product-detail.html?id=${encodeURIComponent(product.id)}`;

const renderTvPlaceholder = (label = 'Tivi Anh Minh Store') => `
  <div class="tv-mockup" role="img" aria-label="Ảnh minh họa ${escapeHtml(label)}">
    <span></span>
  </div>`;

const getFilteredProducts = () => {
  const bySize = activeSize ? products.filter((product) => product.size.toLowerCase().includes(activeSize.toLowerCase())) : products;
  if (!searchTerm) return bySize.length ? bySize : products;
  return products.filter((product) =>
    [product.brand, product.model, product.size, product.type, product.condition, product.features.join(' ')]
      .join(' ')
      .toLowerCase()
      .includes(searchTerm),
  );
};

const renderProductCards = () => {
  if (!dom.productGrid) return;
  if (!products.length) {
    dom.productGrid.innerHTML = '<p class="empty-state">Sản phẩm đang được cập nhật.</p>';
    return;
  }

  const visibleProducts = getFilteredProducts();
  if (!visibleProducts.length) {
    dom.productGrid.innerHTML = '<p class="empty-state">Chưa có sản phẩm phù hợp. Vui lòng chọn kích thước khác hoặc gọi 0905111223 để được tư vấn.</p>';
    return;
  }

  dom.productGrid.innerHTML = visibleProducts
    .map((product) => {
      const label = `${product.brand} ${product.model}`.trim();
      const featureItems = product.features.slice(0, 2).map((feature) => `<li>${escapeHtml(feature)}</li>`).join('');
      const media = product.image
        ? `<img class="product-card__image" src="${escapeHtml(product.image)}" alt="${escapeHtml(label)}" loading="lazy" decoding="async" />`
        : renderTvPlaceholder(label);

      return `
        <article class="product-card-wrap">
          <a class="product-card" href="${createProductDetailUrl(product)}" aria-label="Xem chi tiết ${escapeHtml(label)}">
            <span class="product-card__badge">${escapeHtml(product.badge)}</span>
            ${media}
            <span class="product-brand">${escapeHtml(product.brand)}</span>
            <h3>${escapeHtml(product.model)}</h3>
            <p class="product-size">${escapeHtml(product.size)}</p>
            <ul>${featureItems}</ul>
            <strong class="product-price">${escapeHtml(product.price)}</strong>
            <span class="btn btn--primary product-card__cta" aria-hidden="true">Xem chi tiết</span>
          </a>
        </article>`;
    })
    .join('');
};

renderProductCards();

dom.sizeOptions?.addEventListener('click', (event) => {
  const pill = event.target.closest('.size-pill');
  if (!pill) return;
  activeSize = pill.dataset.size || pill.textContent.trim();
  dom.sizeOptions.querySelectorAll('.size-pill').forEach((button) => {
    const isActive = button === pill;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
  if (dom.selectedSize) dom.selectedSize.textContent = activeSize;
  renderProductCards();
  dom.productGrid?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
});

dom.searchForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  searchTerm = dom.searchInput?.value.trim().toLowerCase() || '';
  activeSize = '';
  if (dom.selectedSize) dom.selectedSize.textContent = searchTerm ? `Tìm: ${dom.searchInput.value.trim()}` : 'Tất cả';
  dom.sizeOptions?.querySelectorAll('.size-pill').forEach((button) => {
    button.classList.remove('is-active');
    button.setAttribute('aria-pressed', 'false');
  });
  renderProductCards();
  scrollToHash('#san-pham');
});

const initCarousel = () => {
  const carousel = dom.carousel;
  if (!carousel) return;
  const viewport = carousel.querySelector('.carousel-viewport');
  const track = carousel.querySelector('.carousel-track');
  const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
  const prevButton = carousel.querySelector('.carousel-btn--prev');
  const nextButton = carousel.querySelector('.carousel-btn--next');
  const dotsWrap = carousel.querySelector('.carousel-dots');
  if (!viewport || !track || !slides.length) return;

  let currentIndex = 0;
  let slideWidth = viewport.clientWidth;
  let startX = 0;
  let dragOffset = 0;
  let isDragging = false;
  let rafId = 0;
  let autoplayId = 0;

  const dots = slides.map((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Xem banner ${index + 1}`);
    dotsWrap?.appendChild(dot);
    return dot;
  });

  const applyTransform = (animate = true) => {
    track.style.transition = animate && !reduceMotion ? 'transform 420ms ease' : 'none';
    track.style.transform = `translate3d(${currentIndex * -slideWidth + dragOffset}px, 0, 0)`;
    dots.forEach((dot, index) => {
      dot.classList.toggle('is-active', index === currentIndex);
      dot.setAttribute('aria-current', index === currentIndex ? 'true' : 'false');
    });
  };

  const requestUpdate = (animate = false) => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => applyTransform(animate));
  };

  const goToSlide = (index, animate = true) => {
    currentIndex = (index + slides.length) % slides.length;
    dragOffset = 0;
    requestUpdate(animate);
  };

  const stopAutoplay = () => {
    if (autoplayId) window.clearInterval(autoplayId);
    autoplayId = 0;
  };

  const startAutoplay = () => {
    if (reduceMotion || slides.length < 2 || autoplayId) return;
    autoplayId = window.setInterval(() => goToSlide(currentIndex + 1), 4500);
  };

  const restartAutoplay = () => {
    stopAutoplay();
    startAutoplay();
  };

  const pointerX = (event) => event.clientX || 0;

  const startDrag = (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    isDragging = true;
    startX = pointerX(event);
    dragOffset = 0;
    carousel.classList.add('is-dragging');
    document.body.classList.add('is-dragging');
    stopAutoplay();
    viewport.setPointerCapture?.(event.pointerId);
    applyTransform(false);
  };

  const moveDrag = (event) => {
    if (!isDragging) return;
    dragOffset = pointerX(event) - startX;
    requestUpdate(false);
  };

  const endDrag = () => {
    if (!isDragging) return;
    const threshold = Math.max(48, slideWidth * 0.16);
    const direction = dragOffset <= -threshold ? 1 : dragOffset >= threshold ? -1 : 0;
    isDragging = false;
    carousel.classList.remove('is-dragging');
    document.body.classList.remove('is-dragging');
    goToSlide(currentIndex + direction, true);
    startAutoplay();
  };

  prevButton?.addEventListener('click', () => {
    goToSlide(currentIndex - 1);
    restartAutoplay();
  });

  nextButton?.addEventListener('click', () => {
    goToSlide(currentIndex + 1);
    restartAutoplay();
  });

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      goToSlide(index);
      restartAutoplay();
    });
  });

  viewport.addEventListener('pointerdown', startDrag);
  viewport.addEventListener('pointermove', moveDrag);
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);
  carousel.addEventListener('mouseenter', stopAutoplay);
  carousel.addEventListener('mouseleave', () => {
    if (!isDragging) startAutoplay();
  });

  let resizeId = 0;
  window.addEventListener(
    'resize',
    () => {
      window.clearTimeout(resizeId);
      resizeId = window.setTimeout(() => {
        slideWidth = viewport.clientWidth;
        goToSlide(currentIndex, false);
      }, 120);
    },
    { passive: true },
  );

  applyTransform(false);
  startAutoplay();
};

initCarousel();

let ticking = false;
window.addEventListener(
  'scroll',
  () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      dom.backToTop?.classList.toggle('is-visible', window.scrollY > 520);
      ticking = false;
    });
  },
  { passive: true },
);

dom.backToTop?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
});
