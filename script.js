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
  brandList: document.querySelector('[data-brand-list]'),
  brandLogoImages: document.querySelectorAll('.brand-logo-box img'),
  serviceIconImages: document.querySelectorAll('[data-service-icon]'),
  productFilterLinks: document.querySelectorAll('[data-product-filter]'),
  usedTvSizeRow: document.querySelector('[data-old-tv-size-row]'),
  usedTvBrandRow: document.querySelector('[data-old-tv-brand-row]'),
  usedTvGrid: document.querySelector('[data-used-tv-grid]'),
  usedTvCount: document.querySelector('[data-used-tv-count]'),
  usedTvEmpty: document.querySelector('[data-used-tv-empty]'),
  newTvSizeRow: document.querySelector('[data-new-tv-size-row]'),
  newTvBrandRow: document.querySelector('[data-new-tv-brand-row]'),
  newTvGrid: document.querySelector('[data-new-tv-grid]'),
  newTvCount: document.querySelector('[data-new-tv-count]'),
  newTvEmpty: document.querySelector('[data-new-tv-empty]'),
};

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FALLBACK_PRODUCTS = Array.isArray(window.products) ? window.products : [];
let productIds = new Set();
let activeSize = dom.selectedSize?.textContent?.trim() === 'Tất cả' ? '' : dom.selectedSize?.textContent?.trim() || '';
let activeBrand = '';
let activeType = '';
let searchTerm = '';


const BRAND_LOGO_WIDTH = 48;
const BRAND_LOGO_HEIGHT = 48;
const BRAND_DATA = [
  { name: 'Samsung', logo: 'samsung.jpeg', wide: true },
  { name: 'LG', logo: 'LG.jpeg', wide: true },
  { name: 'Sony', logo: 'sony.jpeg', wide: true },
  { name: 'Toshiba', logo: 'toshiba.jpeg', wide: true },
  { name: 'Hisense', logo: 'Hisense.svg', wide: true },
  { name: 'TCL', logo: 'TCL.jpeg', wide: true },
  { name: 'Panasonic', logo: 'panasonic.jpeg', wide: true },
  { name: 'Sharp', logo: 'sharp.jpeg', wide: true },
  { name: 'Xiaomi', logo: 'xiaomi.jpeg', wide: true },
  { name: 'Casper', logo: 'casper.jpeg', wide: true },
  { name: 'Coocaa', logo: 'coocaa.jpeg', wide: true },
  { name: 'Skyworth', logo: 'skyworth.png', wide: true },
  { name: 'Philips', logo: 'philips.jpeg', wide: true },
  { name: 'Hitachi', logo: 'hitachi.jpeg', wide: true },
];
const FILTER_ALL_LABEL = 'Tất cả';
const BRAND_ALL_LABEL = 'Tất cả hãng';
const FILTER_EMPTY_MESSAGE = 'Chưa có sản phẩm thuộc hãng này. Vui lòng chọn hãng khác hoặc liên hệ Anh Minh Store.';

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
    fullName: product.fullName || product.full_name || product.model || 'Tivi đang cập nhật',
    size: product.size || 'Liên hệ tư vấn',
    type: product.type || 'Tivi',
    condition: product.condition || 'Liên hệ kiểm tra tình trạng',
    warranty: product.warranty || '',
    features: Array.isArray(product.features) && product.features.length ? product.features : ['Thông tin đang được cập nhật'],
    oldPrice: product.oldPrice || product.old_price || '',
    price: product.price || 'Giá đang cập nhật',
    image: product.image || '',
    images: Array.isArray(product.images) ? product.images : [],
    badge: product.badge || 'Tư vấn',
    description: product.description || 'Vui lòng liên hệ Anh Minh Store để được tư vấn chi tiết.',
    sortOrder: Number(product.sort_order ?? product.sortOrder ?? index),
  };
};

let products = [];

const normalizeSourceProducts = (sourceProducts = []) => {
  productIds = new Set();
  return sourceProducts.map(normalizeProduct).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
};

products = normalizeSourceProducts(FALLBACK_PRODUCTS);

const getBrandNameFromLogo = (image) => image.alt.replace(/^Logo\s+/i, '').trim();
const normalizeFilterValue = (value = '') => String(value).trim();
const isAllFilter = (value = '') => normalizeFilterValue(value) === '' || normalizeFilterValue(value) === FILTER_ALL_LABEL;
const normalizeBrand = (value = '') => normalizeFilterValue(value).toLowerCase();
const getBrandInitial = (brandName = '') => normalizeFilterValue(brandName).charAt(0).toUpperCase() || 'T';

const createBrandLogoElement = (brand, extraClass = '') => {
  const brandName = brand?.name || BRAND_ALL_LABEL;
  if (!brand?.logo) {
    return `<span class="brand-logo-box ${extraClass} is-logo-error" aria-label="${escapeHtml(brandName)}">
      <span class="brand-fallback-badge" aria-hidden="false">${escapeHtml(getBrandInitial(brandName))}</span>
    </span>`;
  }

  const wideClass = brand.wide ? ' is-wide' : '';
  return `<span class="brand-logo-box ${extraClass}">
    <img class="brand-logo-img${wideClass}" src="${escapeHtml(brand.logo)}" alt="Logo ${escapeHtml(brandName)}" loading="eager" decoding="async" width="${BRAND_LOGO_WIDTH}" height="${BRAND_LOGO_HEIGHT}" />
    <span class="brand-fallback-badge" aria-hidden="true">${escapeHtml(getBrandInitial(brandName))}</span>
  </span>`;
};

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
    fallback.textContent = getBrandInitial(brandName);
    fallback.setAttribute('aria-hidden', 'false');
  }
  logoBox.setAttribute('aria-label', `Logo ${brandName || 'hãng tivi'} đang được cập nhật`);
};

const initBrandLogoFallbacks = (root = document) => {
  root.querySelectorAll('.brand-logo-box img').forEach((image) => {
    image.addEventListener('load', () => showBrandLogoImage(image));
    image.addEventListener('error', () => showBrandLogoFallback(image));

    if (image.complete) {
      if (image.naturalWidth > 0) showBrandLogoImage(image);
      else showBrandLogoFallback(image);
    }
  });
};

const syncBrandPanelActive = () => {
  dom.brandList?.querySelectorAll('.brand-list__button').forEach((button) => {
    const isActive = normalizeBrand(button.dataset.brand || '') === normalizeBrand(activeBrand || '');
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
};

const renderBrandPanel = () => {
  if (!dom.brandList) return;
  const allButton = `<li>
    <button class="brand-list__button is-active" type="button" data-brand="" aria-pressed="true">
      ${createBrandLogoElement(null)}
      <span class="brand-name">${BRAND_ALL_LABEL}</span>
    </button>
  </li>`;
  const brandButtons = BRAND_DATA.map((brand) => `<li>
    <button class="brand-list__button" type="button" data-brand="${escapeHtml(brand.name)}" aria-pressed="false">
      ${createBrandLogoElement(brand)}
      <span class="brand-name">${escapeHtml(brand.name)}</span>
    </button>
  </li>`).join('');

  dom.brandList.innerHTML = `${allButton}${brandButtons}`;
  initBrandLogoFallbacks(dom.brandList);
};

const renderBrandFilterRow = ({ container, sectionType }) => {
  if (!container) return;
  const isUsed = sectionType === 'used';
  const dataAttr = isUsed ? 'data-used-brand' : 'data-new-brand';
  const cardClass = isUsed ? 'old-tv-brand-card' : 'old-tv-brand-card new-tv-brand-card';
  const logoClass = isUsed ? 'old-tv-brand-card__logo' : 'old-tv-brand-card__logo new-tv-brand-card__logo';
  const allCard = `<button class="${cardClass} is-active" type="button" ${dataAttr}="" aria-pressed="true">
    ${createBrandLogoElement(null, logoClass)}
    <span class="old-tv-brand-card__name">Tất cả</span>
  </button>`;
  const brandCards = BRAND_DATA.map((brand) => `<button class="${cardClass}" type="button" ${dataAttr}="${escapeHtml(brand.name)}" aria-pressed="false">
    ${createBrandLogoElement(brand, logoClass)}
    <span class="old-tv-brand-card__name">${escapeHtml(brand.name)}</span>
  </button>`).join('');

  container.innerHTML = `${allCard}${brandCards}`;
  initBrandLogoFallbacks(container);
};

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


const usedTvFilter = {
  selectedSize: 'Tất cả',
  selectedBrand: 'Tất cả',
};

const newTvFilter = {
  selectedSize: 'Tất cả',
  selectedBrand: 'Tất cả',
};

const updatePressedState = (container, activeButton) => {
  container?.querySelectorAll('button[aria-pressed]').forEach((button) => {
    const isActive = button === activeButton;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
};

const getSectionProducts = (type, filterState) =>
  products.filter((product) => {
    if (product.type !== type) return false;
    const matchesSize = isAllFilter(filterState.selectedSize) ? true : product.size === filterState.selectedSize;
    const matchesBrand = isAllFilter(filterState.selectedBrand) ? true : normalizeBrand(product.brand) === normalizeBrand(filterState.selectedBrand);
    return matchesSize && matchesBrand;
  });

const renderSectionProductCard = (product, sectionType) => {
  const isUsed = sectionType === 'used';
  const cardDataset = isUsed
    ? `data-used-tv-card data-used-size="${escapeHtml(product.size)}" data-used-brand="${escapeHtml(product.brand)}"`
    : `data-new-tv-card data-new-size="${escapeHtml(product.size)}" data-new-brand="${escapeHtml(product.brand)}"`;
  const classes = isUsed ? 'used-tv-card' : 'used-tv-card new-tv-card';
  const featureItems = product.features.slice(0, 4).map((feature) => `<li>${escapeHtml(feature)}</li>`).join('');
  const oldPrice = product.oldPrice ? `<span class="product-price__old">${escapeHtml(product.oldPrice)}</span>` : '';
  const warrantyRow = product.warranty ? `<div><dt>Bảo hành</dt><dd>${escapeHtml(product.warranty)}</dd></div>` : '';
  const title = product.fullName || product.model;

  return `
    <article class="${classes}" ${cardDataset}>
      <span class="product-card__badge">${escapeHtml(product.badge)}</span>
      ${renderProductMedia(product, title)}
      <span class="product-brand">${escapeHtml(product.brand)}</span>
      <h3>${escapeHtml(title)}</h3>
      <dl class="used-tv-card__meta">
        <div><dt>Model</dt><dd>${escapeHtml(product.model)}</dd></div>
        <div><dt>Kích thước</dt><dd>${escapeHtml(product.size)}</dd></div>
        <div><dt>Loại</dt><dd>${escapeHtml(product.type)}</dd></div>
        <div><dt>Tình trạng</dt><dd>${escapeHtml(product.condition)}</dd></div>
        ${warrantyRow}
      </dl>
      <ul>${featureItems}</ul>
      <strong class="product-price"><span>Giá:</span> ${oldPrice}<span class="product-price__sale">${escapeHtml(product.price)}</span></strong>
      <a class="btn btn--primary product-card__cta" href="${createProductDetailUrl(product)}">Xem chi tiết</a>
    </article>`;
};

const renderTvSection = ({ grid, empty, count, type, filterState, sectionType }) => {
  if (!grid) return;
  const filteredProducts = getSectionProducts(type, filterState);
  const cards = filteredProducts.map((product) => renderSectionProductCard(product, sectionType)).join('');
  const emptyMarkup = `<p class="empty-state used-tv-empty${sectionType === 'new' ? ' new-tv-empty' : ''}" ${sectionType === 'new' ? 'data-new-tv-empty' : 'data-used-tv-empty'}${filteredProducts.length ? ' hidden' : ''}>${FILTER_EMPTY_MESSAGE}</p>`;
  grid.innerHTML = `${cards}${emptyMarkup}`;
  if (count) count.textContent = `Đang hiển thị: ${filteredProducts.length} sản phẩm`;
  if (empty) empty.hidden = filteredProducts.length > 0;
  grid.querySelectorAll('.product-card__image').forEach((image) => {
    image.addEventListener('error', () => {
      image.closest('.product-card__media')?.classList.add('is-image-error');
    }, { once: true });
  });
};

const renderUsedTvSection = () => renderTvSection({ grid: dom.usedTvGrid, empty: dom.usedTvEmpty, count: dom.usedTvCount, type: 'Tivi cũ', filterState: usedTvFilter, sectionType: 'used' });
const renderNewTvSection = () => renderTvSection({ grid: dom.newTvGrid, empty: dom.newTvEmpty, count: dom.newTvCount, type: 'Tivi mới', filterState: newTvFilter, sectionType: 'new' });

const syncSectionBrandRows = () => {
  dom.usedTvBrandRow?.querySelectorAll('.old-tv-brand-card').forEach((button) => {
    const isActive = normalizeBrand(button.dataset.usedBrand || '') === normalizeBrand(usedTvFilter.selectedBrand || '');
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
  dom.newTvBrandRow?.querySelectorAll('.new-tv-brand-card').forEach((button) => {
    const isActive = normalizeBrand(button.dataset.newBrand || '') === normalizeBrand(newTvFilter.selectedBrand || '');
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
};

const applyBrandFilter = (brand = '') => {
  const selectedBrand = normalizeFilterValue(brand);
  activeBrand = selectedBrand;
  activeSize = '';
  activeType = '';
  searchTerm = '';
  usedTvFilter.selectedBrand = selectedBrand || FILTER_ALL_LABEL;
  newTvFilter.selectedBrand = selectedBrand || FILTER_ALL_LABEL;
  if (dom.searchInput) dom.searchInput.value = '';
  if (dom.selectedSize) dom.selectedSize.textContent = selectedBrand || FILTER_ALL_LABEL;
  syncBrandPanelActive();
  syncSectionBrandRows();
  renderProductCards();
  renderUsedTvSection();
  renderNewTvSection();
};

dom.brandList?.addEventListener('click', (event) => {
  const button = event.target.closest('.brand-list__button');
  if (!button) return;
  applyBrandFilter(button.dataset.brand || '');
  scrollToHash('#san-pham');
});

dom.usedTvSizeRow?.addEventListener('click', (event) => {
  const button = event.target.closest('.old-tv-size-pill');
  if (!button) return;
  usedTvFilter.selectedSize = button.dataset.usedSize || FILTER_ALL_LABEL;
  updatePressedState(dom.usedTvSizeRow, button);
  renderUsedTvSection();
});

dom.usedTvBrandRow?.addEventListener('click', (event) => {
  const button = event.target.closest('.old-tv-brand-card');
  if (!button) return;
  applyBrandFilter(button.dataset.usedBrand || '');
});

dom.newTvSizeRow?.addEventListener('click', (event) => {
  const button = event.target.closest('.new-tv-size-pill');
  if (!button) return;
  newTvFilter.selectedSize = button.dataset.newSize || FILTER_ALL_LABEL;
  updatePressedState(dom.newTvSizeRow, button);
  renderNewTvSection();
});

dom.newTvBrandRow?.addEventListener('click', (event) => {
  const button = event.target.closest('.new-tv-brand-card');
  if (!button) return;
  applyBrandFilter(button.dataset.newBrand || '');
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

const renderProductMedia = (product, label) => {
  const placeholder = renderTvPlaceholder(label);
  if (!product.image) return placeholder;
  return `
    <div class="product-card__media">
      <img class="product-card__image" src="${escapeHtml(product.image)}" alt="${escapeHtml(label)}" loading="lazy" decoding="async" />
      <div class="product-card__fallback" aria-hidden="true">${placeholder}</div>
    </div>`;
};

const getFilteredProducts = () => {
  if (searchTerm) {
    return products.filter((product) =>
      [product.brand, product.model, product.fullName, product.size, product.type, product.condition, product.warranty, product.features.join(' ')]
        .join(' ')
        .toLowerCase()
        .includes(searchTerm),
    );
  }

  return products.filter((product) => {
    const matchesSize = activeSize ? product.size.toLowerCase().includes(activeSize.toLowerCase()) : true;
    const matchesBrand = activeBrand ? product.brand.toLowerCase() === activeBrand.toLowerCase() : true;
    const matchesType = activeType ? product.type.toLowerCase().includes(activeType.toLowerCase()) : true;
    return matchesSize && matchesBrand && matchesType;
  });
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
      const label = `${product.fullName} ${product.model}`.trim();
      const media = renderProductMedia(product, label);
      const featureItems = product.features.slice(0, 2).map((feature) => `<li>${escapeHtml(feature)}</li>`).join('');
      const oldPrice = product.oldPrice ? `<span class="product-price__old">${escapeHtml(product.oldPrice)}</span>` : '';

      return `
        <article class="product-card-wrap">
          <a class="product-card" href="${createProductDetailUrl(product)}" aria-label="Xem chi tiết ${escapeHtml(label)}">
            <span class="product-card__badge">${escapeHtml(product.badge)}</span>
            ${media}
            <span class="product-brand">${escapeHtml(product.brand)}</span>
            <h3>${escapeHtml(product.model)}</h3>
            <p class="product-full-name">${escapeHtml(product.fullName)}</p>
            <p class="product-size">${escapeHtml(product.size)}</p>
            <p class="product-type">${escapeHtml(product.type)}</p>
            <ul>${featureItems}</ul>
            <strong class="product-price"><span>Giá:</span> ${oldPrice}<span class="product-price__sale">${escapeHtml(product.price)}</span></strong>
            <span class="btn btn--primary product-card__cta" aria-hidden="true">Xem chi tiết</span>
          </a>
        </article>`;
    })
    .join('');

  dom.productGrid.querySelectorAll('.product-card__image').forEach((image) => {
    image.addEventListener('error', () => {
      image.closest('.product-card__media')?.classList.add('is-image-error');
    }, { once: true });
  });
};

renderBrandPanel();
renderBrandFilterRow({ container: dom.usedTvBrandRow, sectionType: 'used' });
renderBrandFilterRow({ container: dom.newTvBrandRow, sectionType: 'new' });
renderProductCards();
renderUsedTvSection();
renderNewTvSection();

dom.sizeOptions?.addEventListener('click', (event) => {
  const pill = event.target.closest('.size-pill');
  if (!pill) return;
  activeSize = pill.dataset.size || '';
  activeBrand = '';
  usedTvFilter.selectedBrand = FILTER_ALL_LABEL;
  newTvFilter.selectedBrand = FILTER_ALL_LABEL;
  syncBrandPanelActive();
  syncSectionBrandRows();
  activeType = '';
  searchTerm = '';
  if (dom.searchInput) dom.searchInput.value = '';
  dom.sizeOptions.querySelectorAll('.size-pill').forEach((button) => {
    const isActive = button === pill;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
  if (dom.selectedSize) dom.selectedSize.textContent = activeSize || 'Tất cả';
  renderProductCards();
  dom.productGrid?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
});

dom.searchForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  searchTerm = dom.searchInput?.value.trim().toLowerCase() || '';
  activeSize = '';
  activeBrand = '';
  activeType = '';
  usedTvFilter.selectedBrand = FILTER_ALL_LABEL;
  newTvFilter.selectedBrand = FILTER_ALL_LABEL;
  syncBrandPanelActive();
  syncSectionBrandRows();
  if (dom.selectedSize) dom.selectedSize.textContent = searchTerm ? `Tìm: ${dom.searchInput.value.trim()}` : 'Tất cả';
  dom.sizeOptions?.querySelectorAll('.size-pill').forEach((button) => {
    button.classList.remove('is-active');
    button.setAttribute('aria-pressed', 'false');
  });
  renderProductCards();
  scrollToHash('#san-pham');
});

dom.productFilterLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const filterType = link.dataset.productFilter;
    const filterValue = link.dataset.filterValue || '';
    activeSize = filterType === 'size' ? filterValue : '';
    activeBrand = filterType === 'brand' ? filterValue : '';
    activeType = filterType === 'type' ? filterValue : '';
    searchTerm = '';
    if (dom.searchInput) dom.searchInput.value = '';

    dom.sizeOptions?.querySelectorAll('.size-pill').forEach((button) => {
      const isActive = filterType === 'size' && (button.dataset.size || '') === filterValue;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });

    usedTvFilter.selectedBrand = filterType === 'brand' ? filterValue || FILTER_ALL_LABEL : FILTER_ALL_LABEL;
    newTvFilter.selectedBrand = filterType === 'brand' ? filterValue || FILTER_ALL_LABEL : FILTER_ALL_LABEL;
    syncBrandPanelActive();
    syncSectionBrandRows();
    renderUsedTvSection();
    renderNewTvSection();

    const label = filterValue || 'Tất cả';
    if (dom.selectedSize) dom.selectedSize.textContent = label;
    renderProductCards();
    setMenuState(false);
    scrollToHash('#san-pham');
  });
});


const refreshPublicProductsFromSupabase = async () => {
  const storeSupabase = window.AnhMinhSupabase;
  if (!storeSupabase?.isConfigured || !storeSupabase.client) return;

  try {
    const { data, error } = await storeSupabase.client
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!Array.isArray(data)) return;

    products = normalizeSourceProducts(data);
    renderBrandFilterRow({ container: dom.usedTvBrandRow, sectionType: 'used' });
    renderBrandFilterRow({ container: dom.newTvBrandRow, sectionType: 'new' });
    syncBrandPanelActive();
    syncSectionBrandRows();
    renderProductCards();
    renderUsedTvSection();
    renderNewTvSection();
  } catch (error) {
    console.warn('Không thể tải sản phẩm từ Supabase, dùng dữ liệu products.js dự phòng.', error);
  }
};

refreshPublicProductsFromSupabase();

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
