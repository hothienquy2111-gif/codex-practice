const dom = {
  menuWrap: document.querySelector('.menu-wrap'),
  hamburger: document.querySelector('.hamburger'),
  dropdownLinks: document.querySelectorAll('[data-menu-link]'),
  navLinks: document.querySelectorAll('.nav-link, [data-menu-link]'),
  hashLinks: document.querySelectorAll('a[href^="#"]'),
  sections: document.querySelectorAll('.section-anchor[id]'),
  carousel: document.querySelector('[data-carousel]'),
  productGrid: document.querySelector('[data-product-grid]'),
  featuredLoadMoreButton: document.querySelector('[data-load-more="featured"]'),
  sizeOptions: document.querySelector('.size-options'),
  selectedSize: document.querySelector('.selected-size span'),
  searchForm: document.querySelector('.search-box'),
  searchInput: document.querySelector('#search-input'),
  backToTop: document.querySelector('.back-to-top'),
  mobileCall: document.querySelector('[data-call-button]'),
  brandList: document.querySelector('[data-brand-list]'),
  tvSeriesOptions: document.querySelector('[data-tv-series-options]'),
  tvSeriesTitle: document.querySelector('[data-tv-series-title]'),
  tvSeriesStatus: document.querySelector('[data-tv-series-status]'),
  otherProductsMenus: document.querySelectorAll('[data-other-products-menu]'),
  otherProductsToggles: document.querySelectorAll('[data-other-products-toggle]'),
  brandLogoImages: document.querySelectorAll('.brand-logo-box img'),
  serviceIconImages: document.querySelectorAll('[data-service-icon]'),
  productFilterLinks: document.querySelectorAll('[data-product-filter]'),
  usedTvSizeRow: document.querySelector('[data-old-tv-size-row]'),
  usedTvBrandRow: document.querySelector('[data-old-tv-brand-row]'),
  usedTvGrid: document.querySelector('[data-used-tv-grid]'),
  usedTvCount: document.querySelector('[data-used-tv-count]'),
  usedTvEmpty: document.querySelector('[data-used-tv-empty]'),
  usedTvLoadMoreButton: document.querySelector('[data-load-more="oldTv"]'),
  newTvSizeRow: document.querySelector('[data-new-tv-size-row]'),
  newTvBrandRow: document.querySelector('[data-new-tv-brand-row]'),
  newTvGrid: document.querySelector('[data-new-tv-grid]'),
  newTvCount: document.querySelector('[data-new-tv-count]'),
  newTvEmpty: document.querySelector('[data-new-tv-empty]'),
  newTvLoadMoreButton: document.querySelector('[data-load-more="newTv"]'),
};

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FALLBACK_PRODUCTS = Array.isArray(window.products) ? window.products : [];
let productIds = new Set();
let activeSize = dom.selectedSize?.textContent?.trim() === 'Tất cả' ? '' : dom.selectedSize?.textContent?.trim() || '';
let activeBrand = '';
let activeType = '';
let selectedBrand = '';
let selectedSeries = '';
let selectedSize = activeSize;
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
const TV_SERIES_BY_BRAND = {
  Samsung: [
    { label: 'Crystal UHD', aliases: ['crystal uhd', 'crystal', 'crystal 4k'] },
    { label: 'QLED', aliases: ['qled', 'quantum dot'] },
    { label: 'Neo QLED', aliases: ['neo qled', 'neo quantum', 'mini led', 'neo led'] },
    { label: 'OLED', aliases: ['oled'] },
    { label: 'Lifestyle TV', aliases: ['lifestyle', 'the frame', 'the serif', 'the sero', 'the terrace'] },
    { label: 'The Frame', aliases: ['the frame'] },
    { label: 'The Serif', aliases: ['the serif'] },
    { label: 'The Sero', aliases: ['the sero'] },
    { label: 'UHD / 4K UHD', aliases: ['uhd', '4k uhd', 'ultra hd'] },
    { label: 'LED', aliases: ['led'] },
  ],
  LG: [
    { label: 'OLED', aliases: ['oled'] },
    { label: 'QNED', aliases: ['qned'] },
    { label: 'NanoCell', aliases: ['nanocell', 'nano cell', 'nano'] },
    { label: 'UHD / 4K UHD', aliases: ['uhd', '4k uhd', 'ultra hd'] },
    { label: 'LED', aliases: ['led'] },
    { label: 'webOS', aliases: ['webos', 'web os'] },
    { label: 'StanbyME', aliases: ['stanbyme', 'stanby me'] },
  ],
  Sony: [
    { label: 'BRAVIA', aliases: ['bravia'] },
    { label: 'BRAVIA XR', aliases: ['bravia xr', 'xr'] },
    { label: 'OLED', aliases: ['oled'] },
    { label: 'Mini LED', aliases: ['mini led'] },
    { label: 'Full Array LED', aliases: ['full array', 'full array led'] },
    { label: 'Google TV', aliases: ['google tv'] },
    { label: 'UHD / 4K UHD', aliases: ['uhd', '4k uhd', 'ultra hd'] },
    { label: 'LED', aliases: ['led'] },
  ],
  Toshiba: [
    { label: 'REGZA', aliases: ['regza'] },
    { label: 'C Series', aliases: ['c series', 'c350', 'c450'] },
    { label: 'M Series', aliases: ['m series', 'm550', 'm650'] },
    { label: 'Z Series', aliases: ['z series', 'z670', 'z770'] },
    { label: 'QLED', aliases: ['qled'] },
    { label: 'UHD / 4K UHD', aliases: ['uhd', '4k uhd', 'ultra hd'] },
    { label: 'Android TV', aliases: ['android tv'] },
    { label: 'Google TV', aliases: ['google tv'] },
    { label: 'LED', aliases: ['led'] },
  ],
  Hisense: [
    { label: 'ULED', aliases: ['uled'] },
    { label: 'ULED Mini LED', aliases: ['uled mini led', 'mini led'] },
    { label: 'QLED', aliases: ['qled', 'quantum dot'] },
    { label: 'Laser TV', aliases: ['laser tv', 'laser'] },
    { label: 'U Series', aliases: ['u series', 'u6', 'u7', 'u8'] },
    { label: 'A Series', aliases: ['a series', 'a4', 'a6'] },
    { label: 'UHD / 4K UHD', aliases: ['uhd', '4k uhd', 'ultra hd'] },
    { label: 'Google TV', aliases: ['google tv'] },
    { label: 'VIDAA', aliases: ['vidaa'] },
  ],
  TCL: [
    { label: 'QLED', aliases: ['qled', 'quantum dot'] },
    { label: 'Mini LED', aliases: ['mini led'] },
    { label: 'C Series', aliases: ['c series', 'c645', 'c745', 'c755', 'c845'] },
    { label: 'P Series', aliases: ['p series', 'p635', 'p735', 'p745'] },
    { label: 'S Series', aliases: ['s series', 's5400', 's5500'] },
    { label: 'Google TV', aliases: ['google tv'] },
    { label: 'Android TV', aliases: ['android tv'] },
    { label: 'UHD / 4K UHD', aliases: ['uhd', '4k uhd', 'ultra hd'] },
    { label: 'LED', aliases: ['led'] },
  ],
  Panasonic: [
    { label: 'OLED', aliases: ['oled'] },
    { label: 'LED', aliases: ['led'] },
    { label: 'UHD / 4K UHD', aliases: ['uhd', '4k uhd', 'ultra hd'] },
    { label: 'Android TV', aliases: ['android tv'] },
    { label: 'Google TV', aliases: ['google tv'] },
    { label: 'MX Series', aliases: ['mx series', 'mx'] },
    { label: 'LX Series', aliases: ['lx series', 'lx'] },
    { label: 'JX Series', aliases: ['jx series', 'jx'] },
  ],
  Sharp: [
    { label: 'AQUOS', aliases: ['aquos'] },
    { label: 'QLED', aliases: ['qled'] },
    { label: 'Android TV', aliases: ['android tv'] },
    { label: 'Google TV', aliases: ['google tv'] },
    { label: 'UHD / 4K UHD', aliases: ['uhd', '4k uhd', 'ultra hd'] },
    { label: 'LED', aliases: ['led'] },
  ],
  Xiaomi: [
    { label: 'Xiaomi TV A', aliases: ['tv a', 'xiaomi tv a', 'a series'] },
    { label: 'Xiaomi TV A Pro', aliases: ['a pro', 'tv a pro'] },
    { label: 'Xiaomi TV P1', aliases: ['p1', 'tv p1'] },
    { label: 'QLED', aliases: ['qled'] },
    { label: 'UHD / 4K UHD', aliases: ['uhd', '4k uhd', 'ultra hd'] },
    { label: 'Google TV', aliases: ['google tv'] },
    { label: 'Android TV', aliases: ['android tv'] },
  ],
  Casper: [
    { label: 'Casper Smart TV', aliases: ['smart tv', 'casper smart'] },
    { label: 'Android TV', aliases: ['android tv'] },
    { label: 'Google TV', aliases: ['google tv'] },
    { label: 'QLED', aliases: ['qled'] },
    { label: 'UHD / 4K UHD', aliases: ['uhd', '4k uhd', 'ultra hd'] },
    { label: 'HD / Full HD', aliases: ['hd', 'full hd', 'fhd'] },
    { label: 'LED', aliases: ['led'] },
  ],
  Coocaa: [
    { label: 'Coocaa Smart TV', aliases: ['smart tv', 'coocaa smart'] },
    { label: 'S Series', aliases: ['s series', 's3', 's6', 's7'] },
    { label: 'Y Series', aliases: ['y series', 'y72'] },
    { label: 'QLED', aliases: ['qled'] },
    { label: 'UHD / 4K UHD', aliases: ['uhd', '4k uhd', 'ultra hd'] },
    { label: 'Google TV', aliases: ['google tv'] },
    { label: 'Android TV', aliases: ['android tv'] },
    { label: 'LED', aliases: ['led'] },
  ],
  Skyworth: [
    { label: 'Skyworth Smart TV', aliases: ['smart tv', 'skyworth smart'] },
    { label: 'QLED', aliases: ['qled'] },
    { label: 'OLED', aliases: ['oled'] },
    { label: 'UHD / 4K UHD', aliases: ['uhd', '4k uhd', 'ultra hd'] },
    { label: 'Google TV', aliases: ['google tv'] },
    { label: 'Android TV', aliases: ['android tv'] },
    { label: 'SUE Series', aliases: ['sue', 'sue series'] },
    { label: 'G Series', aliases: ['g series', 'g3a'] },
  ],
  Philips: [
    { label: 'Ambilight', aliases: ['ambilight'] },
    { label: 'OLED', aliases: ['oled'] },
    { label: 'The One', aliases: ['the one'] },
    { label: 'Performance Series', aliases: ['performance series'] },
    { label: 'UHD / 4K UHD', aliases: ['uhd', '4k uhd', 'ultra hd'] },
    { label: 'Google TV', aliases: ['google tv'] },
    { label: 'Android TV', aliases: ['android tv'] },
    { label: 'LED', aliases: ['led'] },
  ],
  Hitachi: [
    { label: 'Hitachi Smart TV', aliases: ['smart tv', 'hitachi smart'] },
    { label: 'Android TV', aliases: ['android tv'] },
    { label: 'Google TV', aliases: ['google tv'] },
    { label: 'QLED', aliases: ['qled'] },
    { label: 'UHD / 4K UHD', aliases: ['uhd', '4k uhd', 'ultra hd'] },
    { label: 'LED', aliases: ['led'] },
  ],
};

const GENERAL_TV_SERIES_OPTIONS = [
  { label: 'QLED', aliases: ['qled', 'quantum dot'] },
  { label: 'OLED', aliases: ['oled'] },
  { label: 'Mini LED', aliases: ['mini led', 'neo qled', 'uled mini led'] },
  { label: 'UHD / 4K UHD', aliases: ['uhd', '4k uhd', 'ultra hd'] },
  { label: 'Google TV', aliases: ['google tv'] },
  { label: 'Android TV', aliases: ['android tv'] },
];
const FILTER_ALL_LABEL = 'Tất cả';
const BRAND_ALL_LABEL = 'Tất cả hãng';
const PRODUCTS_BATCH_SIZE = 12;
const visibleCounts = {
  featured: PRODUCTS_BATCH_SIZE,
  newTv: PRODUCTS_BATCH_SIZE,
  oldTv: PRODUCTS_BATCH_SIZE,
};

const FILTER_EMPTY_MESSAGE = 'Chưa có sản phẩm thuộc hãng này. Vui lòng chọn hãng khác hoặc liên hệ Anh Minh Store.';

const escapeHtml = (value = '') =>
  String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);

const formatProductCardSize = (size = '') =>
  String(size)
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\binch\b/gi, 'inch');

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
    name: product.name || '',
    fullName: product.fullName || product.full_name || product.name || product.model || 'Tivi đang cập nhật',
    full_name: product.full_name || product.fullName || product.name || product.model || 'Tivi đang cập nhật',
    size: product.size || 'Liên hệ tư vấn',
    type: product.type || 'Tivi',
    series: product.series || '',
    line: product.line || '',
    tv_line: product.tv_line || '',
    product_line: product.product_line || '',
    condition: product.condition || 'Liên hệ kiểm tra tình trạng',
    warranty: product.warranty || '',
    features: Array.isArray(product.features) && product.features.length ? product.features : [],
    oldPrice: product.oldPrice || product.old_price || '',
    price: product.price || 'Giá đang cập nhật',
    image: product.image || '',
    images: Array.isArray(product.images) ? product.images : [],
    badge: product.badge || 'Tư vấn',
    description: product.description || 'Vui lòng liên hệ Anh Minh Store để được tư vấn chi tiết.',
    overview: product.overview || '',
    specifications: product.specifications || product.specs || '',
    searchableText: product.searchableText || product.searchable_text || '',
    sortOrder: Number(product.sort_order ?? product.sortOrder ?? index),
    isFeatured: Boolean(product.is_featured ?? product.isFeatured ?? false),
  };
};

let products = [];

const publishProductsForChatbot = () => {
  window.anhMinhProducts = products;
  window.siteProducts = products;
  window.currentProducts = products;
};

const normalizeSourceProducts = (sourceProducts = []) => {
  productIds = new Set();
  return sourceProducts.map(normalizeProduct).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
};

products = normalizeSourceProducts(FALLBACK_PRODUCTS);
publishProductsForChatbot();

const getBrandNameFromLogo = (image) => image.alt.replace(/^Logo\s+/i, '').trim();
const normalizeFilterValue = (value = '') => String(value).trim();
const isAllFilter = (value = '') => normalizeFilterValue(value) === '' || normalizeFilterValue(value) === FILTER_ALL_LABEL;
const normalizeBrand = (value = '') => normalizeFilterValue(value).toLowerCase();
const getBrandInitial = (brandName = '') => normalizeFilterValue(brandName).charAt(0).toUpperCase() || 'T';
const normalizeVietnameseText = (value = '') => String(value)
  .trim()
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .replace(/\s+/g, ' ');

const normalizeText = normalizeVietnameseText;

const stringifySearchPart = (value) => {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.map(stringifySearchPart).join(' ');
  if (typeof value === 'object') return Object.values(value).map(stringifySearchPart).join(' ');
  return String(value);
};

const getProductSearchText = (product = {}) => [
  product.brand,
  product.model,
  product.fullName,
  product.full_name,
  product.name,
  product.type,
  product.features,
  product.description,
  product.overview,
  product.specifications,
  product.searchableText,
]
  .map(stringifySearchPart)
  .join(' ');

const getBrandSeriesConfig = (brand = '') => {
  const normalizedBrand = normalizeBrand(brand);
  return Object.entries(TV_SERIES_BY_BRAND).find(([brandName]) => normalizeBrand(brandName) === normalizedBrand)?.[1] || [];
};

const getSeriesOptionsForBrand = (brand = '') => (isAllFilter(brand) ? GENERAL_TV_SERIES_OPTIONS : getBrandSeriesConfig(brand));

const findSeriesMatch = (text = '', options = []) => {
  const normalized = normalizeText(text);
  if (!normalized) return '';
  const matches = [];
  options.forEach((option, optionIndex) => {
    const values = [option.label, ...(option.aliases || [])];
    values.forEach((value) => {
      const alias = normalizeText(value);
      if (alias && normalized.includes(alias)) {
        matches.push({ label: option.label, optionIndex, aliasLength: alias.length });
      }
    });
  });
  matches.sort((a, b) => b.aliasLength - a.aliasLength || a.optionIndex - b.optionIndex);
  return matches[0]?.label || '';
};

const detectProductSeries = (product = {}, brand = selectedBrand) => {
  const options = isAllFilter(brand) ? GENERAL_TV_SERIES_OPTIONS : getSeriesOptionsForBrand(brand);
  const explicitSeries = [product.series, product.line, product.tv_line, product.product_line].map(stringifySearchPart).find((value) => value.trim());
  if (explicitSeries) return findSeriesMatch(explicitSeries, options) || explicitSeries.trim();
  return findSeriesMatch(getProductSearchText(product), options) || 'Dòng phổ thông';
};

const productMatchesBrand = (product = {}, brand = selectedBrand) => (isAllFilter(brand) ? true : normalizeBrand(product.brand) === normalizeBrand(brand));
const productMatchesSize = (product = {}, size = selectedSize) => (isAllFilter(size) ? true : normalizeText(product.size).includes(normalizeText(size)));
const productMatchesSeries = (product = {}, series = selectedSeries, brand = selectedBrand) => (
  isAllFilter(series) ? true : normalizeText(detectProductSeries(product, brand)) === normalizeText(series)
);

const productMatchesGlobalFilters = (product = {}) => (
  productMatchesBrand(product, selectedBrand)
  && productMatchesSize(product, selectedSize)
  && productMatchesSeries(product, selectedSeries, selectedBrand)
);

const getSeriesCount = (seriesLabel = '', brand = selectedBrand) => products.filter((product) => (
  productMatchesBrand(product, brand)
  && productMatchesSize(product, selectedSize)
  && (seriesLabel ? productMatchesSeries(product, seriesLabel, brand) : true)
)).length;

const renderTvSeriesSelector = (brand = selectedBrand) => {
  if (!dom.tvSeriesOptions) return;
  const hasBrand = !isAllFilter(brand);
  const title = hasBrand ? `Dòng tivi ${brand}` : 'Dòng tivi';
  const allLabel = hasBrand ? `Tất cả dòng ${brand}` : 'Tất cả dòng';
  const options = getSeriesOptionsForBrand(brand);
  const optionLabels = options.map((option) => option.label);

  if (selectedSeries && !optionLabels.some((label) => normalizeText(label) === normalizeText(selectedSeries))) {
    selectedSeries = '';
  }

  if (dom.tvSeriesTitle) dom.tvSeriesTitle.textContent = title;
  if (dom.tvSeriesStatus) {
    dom.tvSeriesStatus.textContent = hasBrand
      ? `Đang chọn: ${selectedSeries || allLabel}`
      : 'Chọn dòng phổ biến hoặc chọn hãng để xem dòng tivi chi tiết hơn.';
  }

  const allCount = getSeriesCount('', brand);
  const allButton = `<button class="tv-series-pill${selectedSeries ? '' : ' is-active'}" type="button" data-series="" aria-pressed="${selectedSeries ? 'false' : 'true'}">${escapeHtml(allLabel)} <span>${allCount}</span></button>`;
  const buttons = options.map((option) => {
    const count = getSeriesCount(option.label, brand);
    const isActive = normalizeText(selectedSeries) === normalizeText(option.label);
    return `<button class="tv-series-pill${isActive ? ' is-active' : ''}" type="button" data-series="${escapeHtml(option.label)}" aria-pressed="${String(isActive)}"${count ? '' : ' disabled'}>${escapeHtml(option.label)} <span>${count}</span></button>`;
  }).join('');

  dom.tvSeriesOptions.innerHTML = `${allButton}${buttons}`;
};

const normalizeProductType = (product = {}) => {
  const rawType = normalizeVietnameseText(product.type || product.productType || '');
  if (['tivi moi', 'tv moi', 'moi', 'new'].includes(rawType) || rawType.includes('tivi moi') || rawType.includes('tv moi')) return 'Tivi mới';
  if (['tivi cu', 'tv cu', 'cu', 'used', 'da qua su dung'].includes(rawType) || rawType.includes('tivi cu') || rawType.includes('tv cu') || rawType.includes('da qua su dung')) return 'Tivi cũ';
  return normalizeFilterValue(product.type || 'Tivi');
};

const getFeaturedProducts = (sourceProducts = products) => sourceProducts.filter((product) => product.isFeatured === true);
const getNewTvProducts = (sourceProducts = products) => sourceProducts.filter((product) => normalizeProductType(product) === 'Tivi mới');
const getOldTvProducts = (sourceProducts = products) => sourceProducts.filter((product) => normalizeProductType(product) === 'Tivi cũ');
const resetVisibleCount = (sectionKey) => { visibleCounts[sectionKey] = PRODUCTS_BATCH_SIZE; };
const resetAllVisibleCounts = () => Object.keys(visibleCounts).forEach(resetVisibleCount);


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

const productMatchesSearch = (product) => {
  if (!searchTerm) return true;
  return normalizeText(getProductSearchText(product)).includes(searchTerm);
};

const productMatchesSectionFilter = (product, filterState) => {
  const matchesSectionSize = isAllFilter(filterState.selectedSize) ? true : normalizeText(product.size).includes(normalizeText(filterState.selectedSize));
  const matchesSectionBrand = isAllFilter(filterState.selectedBrand) ? true : normalizeBrand(product.brand) === normalizeBrand(filterState.selectedBrand);
  return matchesSectionSize && matchesSectionBrand && productMatchesGlobalFilters(product) && productMatchesSearch(product);
};

const getSectionProducts = (sectionKey, filterState = {}) => {
  const sectionProducts = sectionKey === 'featured'
    ? getFeaturedProducts(products)
    : sectionKey === 'newTv'
      ? getNewTvProducts(products)
      : getOldTvProducts(products);

  if (sectionKey === 'featured') {
    return sectionProducts.filter((product) => {
      const matchesType = activeType ? normalizeProductType(product) === normalizeProductType({ type: activeType }) : true;
      return productMatchesGlobalFilters(product) && matchesType && productMatchesSearch(product);
    });
  }

  return sectionProducts.filter((product) => productMatchesSectionFilter(product, filterState));
};

const updateLoadMoreButton = (button, sectionKey, totalProducts) => {
  if (!button) return;
  const shouldShow = totalProducts > visibleCounts[sectionKey];
  button.hidden = !shouldShow;
  button.disabled = !shouldShow;
};

const bindProductImageFallbacks = (root) => {
  root?.querySelectorAll('.product-card__image').forEach((image) => {
    image.addEventListener('error', () => {
      image.closest('.product-card__media')?.classList.add('is-image-error');
    }, { once: true });
  });
};

const renderFeaturedProductCard = (product) => {
  const brand = product.brand || '';
  const model = product.model || '';
  const fullName = product.fullName || product.full_name || '';
  const oldPrice = product.oldPrice || product.old_price || '';
  const price = product.price || '';
  const label = `${fullName} ${model}`.trim();
  const media = renderProductMedia(product, label);
  const renderedOldPrice = oldPrice ? `<span class="product-price__old">${escapeHtml(oldPrice)}</span>` : '';

  return `
    <article class="product-card-wrap">
      <a class="product-card" href="${createProductDetailUrl(product)}" aria-label="Xem chi tiết ${escapeHtml(label)}">
        <span class="product-card__badge">${escapeHtml(product.badge)}</span>
        ${media}
        <div class="product-card-meta">
          <span class="product-card-brand">${escapeHtml(brand)}</span>
          <span class="product-card-model">${escapeHtml(model)}</span>
        </div>
        <h3 class="product-card-name">${escapeHtml(fullName || model)}</h3>
        <p class="product-size">${escapeHtml(formatProductCardSize(product.size))}</p>
        <p class="product-type">${escapeHtml(product.type)}</p>
        <strong class="product-price"><span>Giá:</span> ${renderedOldPrice}<span class="product-price__sale">${escapeHtml(price)}</span></strong>
        <span class="btn btn--primary product-card__cta" aria-hidden="true">Xem chi tiết</span>
      </a>
    </article>`;
};


const renderSectionProductCard = (product, sectionType) => {
  const brand = product.brand || '';
  const model = product.model || '';
  const fullName = product.fullName || product.full_name || '';
  const oldPrice = product.oldPrice || product.old_price || '';
  const price = product.price || '';
  const isUsed = sectionType === 'used';
  const cardDataset = isUsed
    ? `data-used-tv-card data-used-size="${escapeHtml(product.size)}" data-used-brand="${escapeHtml(brand)}"`
    : `data-new-tv-card data-new-size="${escapeHtml(product.size)}" data-new-brand="${escapeHtml(brand)}"`;
  const classes = isUsed ? 'used-tv-card' : 'used-tv-card new-tv-card';
  const renderedOldPrice = oldPrice ? `<span class="product-price__old">${escapeHtml(oldPrice)}</span>` : '';
  const title = fullName || model;

  return `
    <article class="${classes}" ${cardDataset}>
      <span class="product-card__badge">${escapeHtml(product.badge)}</span>
      ${renderProductMedia(product, title)}
      <div class="product-card-meta">
        <span class="product-card-brand">${escapeHtml(brand)}</span>
        <span class="product-card-model">${escapeHtml(model)}</span>
      </div>
      <h3 class="product-card-name">${escapeHtml(title)}</h3>
      <p class="product-size">${escapeHtml(formatProductCardSize(product.size))}</p>
      <p class="product-type">${escapeHtml(product.type)}</p>
      <strong class="product-price"><span>Giá:</span> ${renderedOldPrice}<span class="product-price__sale">${escapeHtml(price)}</span></strong>
      <a class="btn btn--primary product-card__cta" href="${createProductDetailUrl(product)}">Xem chi tiết</a>
    </article>`;
};

const renderTvSection = ({ grid, empty, count, sectionKey, filterState, sectionType, loadMoreButton }) => {
  if (!grid) return;
  const filteredProducts = getSectionProducts(sectionKey, filterState);
  const visibleProducts = filteredProducts.slice(0, visibleCounts[sectionKey]);
  const cards = visibleProducts.map((product) => renderSectionProductCard(product, sectionType)).join('');
  const emptyMarkup = `<p class="empty-state used-tv-empty${sectionType === 'new' ? ' new-tv-empty' : ''}" ${sectionType === 'new' ? 'data-new-tv-empty' : 'data-used-tv-empty'}${filteredProducts.length ? ' hidden' : ''}>Chưa có sản phẩm phù hợp với bộ lọc này.</p>`;
  grid.innerHTML = `${cards}${emptyMarkup}`;
  if (count) count.textContent = `Đang hiển thị: ${visibleProducts.length} sản phẩm`;
  if (empty) empty.hidden = filteredProducts.length > 0;
  updateLoadMoreButton(loadMoreButton, sectionKey, filteredProducts.length);
  bindProductImageFallbacks(grid);
};

const renderUsedTvSection = () => renderTvSection({ grid: dom.usedTvGrid, empty: dom.usedTvEmpty, count: dom.usedTvCount, sectionKey: 'oldTv', filterState: usedTvFilter, sectionType: 'used', loadMoreButton: dom.usedTvLoadMoreButton });
const renderNewTvSection = () => renderTvSection({ grid: dom.newTvGrid, empty: dom.newTvEmpty, count: dom.newTvCount, sectionKey: 'newTv', filterState: newTvFilter, sectionType: 'new', loadMoreButton: dom.newTvLoadMoreButton });

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
  const nextBrand = normalizeFilterValue(brand);
  activeBrand = nextBrand;
  selectedBrand = nextBrand;
  activeSize = '';
  selectedSize = '';
  selectedSeries = '';
  activeType = '';
  searchTerm = '';
  usedTvFilter.selectedBrand = nextBrand || FILTER_ALL_LABEL;
  newTvFilter.selectedBrand = nextBrand || FILTER_ALL_LABEL;
  if (dom.searchInput) dom.searchInput.value = '';
  if (dom.selectedSize) dom.selectedSize.textContent = nextBrand || FILTER_ALL_LABEL;
  dom.sizeOptions?.querySelectorAll('.size-pill').forEach((button) => {
    const isActive = !(button.dataset.size || '');
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
  syncBrandPanelActive();
  syncSectionBrandRows();
  applyProductFilters();
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
  resetVisibleCount('oldTv');
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
  resetVisibleCount('newTv');
  renderNewTvSection();
});

dom.newTvBrandRow?.addEventListener('click', (event) => {
  const button = event.target.closest('.new-tv-brand-card');
  if (!button) return;
  applyBrandFilter(button.dataset.newBrand || '');
});



const setOtherProductsMenuState = (menu, isOpen) => {
  if (!menu) return;
  menu.classList.toggle('is-open', isOpen);
  const toggle = menu.querySelector('[data-other-products-toggle]');
  toggle?.setAttribute('aria-expanded', String(isOpen));
};

const closeOtherProductsMenus = (exceptMenu = null) => {
  dom.otherProductsMenus.forEach((menu) => {
    if (menu !== exceptMenu) setOtherProductsMenuState(menu, false);
  });
};

dom.otherProductsToggles.forEach((toggle) => {
  toggle.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const menu = toggle.closest('[data-other-products-menu]');
    const isOpen = !menu?.classList.contains('is-open');
    closeOtherProductsMenus(menu);
    setOtherProductsMenuState(menu, isOpen);
  });
});

dom.otherProductsMenus.forEach((menu) => {
  menu.addEventListener('mouseleave', () => setOtherProductsMenuState(menu, false));
  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      closeOtherProductsMenus();
      setMenuState(false);
    });
  });
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
  if (!event.target.closest('[data-other-products-menu]')) closeOtherProductsMenus();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    setMenuState(false);
    closeOtherProductsMenus();
  }
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

const getFilteredProducts = () => products.filter((product) => {
  const matchesType = activeType ? normalizeProductType(product) === normalizeProductType({ type: activeType }) : true;
  return productMatchesGlobalFilters(product) && matchesType && productMatchesSearch(product);
});

const renderProductCards = () => {
  if (!dom.productGrid) return;
  if (!products.length) {
    dom.productGrid.innerHTML = '<p class="empty-state">Sản phẩm đang được cập nhật.</p>';
    updateLoadMoreButton(dom.featuredLoadMoreButton, 'featured', 0);
    return;
  }

  const filteredProducts = getSectionProducts('featured');
  if (!filteredProducts.length) {
    dom.productGrid.innerHTML = '<p class="empty-state">Chưa có sản phẩm phù hợp với bộ lọc này.</p>';
    updateLoadMoreButton(dom.featuredLoadMoreButton, 'featured', 0);
    return;
  }

  const visibleProducts = filteredProducts.slice(0, visibleCounts.featured);
  dom.productGrid.innerHTML = visibleProducts.map(renderFeaturedProductCard).join('');
  updateLoadMoreButton(dom.featuredLoadMoreButton, 'featured', filteredProducts.length);
  bindProductImageFallbacks(dom.productGrid);
};

const renderProductSection = (sectionKey) => {
  if (sectionKey === 'featured') renderProductCards();
  if (sectionKey === 'newTv') renderNewTvSection();
  if (sectionKey === 'oldTv') renderUsedTvSection();
};

const showMoreProducts = (sectionKey) => {
  if (!Object.prototype.hasOwnProperty.call(visibleCounts, sectionKey)) return;
  visibleCounts[sectionKey] += PRODUCTS_BATCH_SIZE;
  renderProductSection(sectionKey);
};

const applyFiltersAndRender = ({ resetSections = ['featured', 'newTv', 'oldTv'] } = {}) => {
  resetSections.forEach(resetVisibleCount);
  renderTvSeriesSelector(selectedBrand);
  renderProductCards();
  renderUsedTvSection();
  renderNewTvSection();
};

const applyProductFilters = (options = {}) => applyFiltersAndRender(options);

renderBrandPanel();
renderBrandFilterRow({ container: dom.usedTvBrandRow, sectionType: 'used' });
renderBrandFilterRow({ container: dom.newTvBrandRow, sectionType: 'new' });
applyFiltersAndRender();

dom.tvSeriesOptions?.addEventListener('click', (event) => {
  const pill = event.target.closest('.tv-series-pill');
  if (!pill || pill.disabled) return;
  selectedSeries = pill.dataset.series || '';
  applyProductFilters();
  dom.productGrid?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
});

dom.sizeOptions?.addEventListener('click', (event) => {
  const pill = event.target.closest('.size-pill');
  if (!pill) return;
  activeSize = pill.dataset.size || '';
  selectedSize = activeSize;
  activeType = '';
  dom.sizeOptions.querySelectorAll('.size-pill').forEach((button) => {
    const isActive = button === pill;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
  if (dom.selectedSize) dom.selectedSize.textContent = activeSize || 'Tất cả';
  applyProductFilters();
  dom.productGrid?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
});

dom.searchForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  searchTerm = normalizeText(dom.searchInput?.value.trim() || '');
  if (dom.selectedSize) dom.selectedSize.textContent = searchTerm ? `Tìm: ${dom.searchInput.value.trim()}` : (selectedSize || selectedBrand || 'Tất cả');
  applyProductFilters();
  scrollToHash('#san-pham');
});

dom.productFilterLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const filterType = link.dataset.productFilter;
    const filterValue = link.dataset.filterValue || '';
    activeSize = filterType === 'size' ? filterValue : '';
    selectedSize = activeSize;
    activeBrand = filterType === 'brand' ? filterValue : '';
    selectedBrand = activeBrand;
    selectedSeries = '';
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
    applyProductFilters();

    const label = filterValue || 'Tất cả';
    if (dom.selectedSize) dom.selectedSize.textContent = label;
    setMenuState(false);
    scrollToHash('#san-pham');
  });
});


dom.featuredLoadMoreButton?.addEventListener('click', () => showMoreProducts('featured'));
dom.usedTvLoadMoreButton?.addEventListener('click', () => showMoreProducts('oldTv'));
dom.newTvLoadMoreButton?.addEventListener('click', () => showMoreProducts('newTv'));

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
    publishProductsForChatbot();
    renderBrandFilterRow({ container: dom.usedTvBrandRow, sectionType: 'used' });
    renderBrandFilterRow({ container: dom.newTvBrandRow, sectionType: 'new' });
    syncBrandPanelActive();
    syncSectionBrandRows();
    applyProductFilters();
  } catch (error) {
    console.warn('Không thể tải sản phẩm từ Supabase, dùng dữ liệu products.js dự phòng.', error);
  }
};

refreshPublicProductsFromSupabase();

const escapeAttribute = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);

const loadSupabaseHeroBanners = async (track) => {
  const storeSupabase = window.AnhMinhSupabase || window.anhMinhSupabase;
  if (!track || !storeSupabase?.isConfigured || !storeSupabase.client) return false;

  try {
    const { data, error } = await storeSupabase.client
      .from('hero_banners')
      .select('title,image_url,alt_text,sort_order,created_at')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw error;
    const banners = Array.isArray(data) ? data.filter((banner) => banner?.image_url) : [];
    if (!banners.length) return false;

    track.innerHTML = banners.map((banner, index) => {
      const label = banner.title || banner.alt_text || `Banner trang chủ ${index + 1}`;
      const altText = banner.alt_text || banner.title || 'Banner trang chủ Anh Minh Store';
      return `<article class="carousel-slide" aria-label="${escapeAttribute(label)}">
        <img src="${escapeAttribute(banner.image_url)}" alt="${escapeAttribute(altText)}" draggable="false" />
      </article>`;
    }).join('');
    return true;
  } catch (error) {
    console.warn('Không thể tải banner từ Supabase, dùng ảnh banner mặc định.', error);
    return false;
  }
};

const initCarousel = async () => {
  const carousel = dom.carousel;
  if (!carousel) return;
  const viewport = carousel.querySelector('.carousel-viewport');
  const track = carousel.querySelector('.carousel-track');
  const dotsWrap = carousel.querySelector('.carousel-dots');
  if (!viewport || !track) return;

  await loadSupabaseHeroBanners(track);
  const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
  if (!slides.length) return;
  dotsWrap.innerHTML = '';

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
    if (reduceMotion || slides.length < 2 || autoplayId || document.hidden) return;
    autoplayId = window.setInterval(() => goToSlide(currentIndex + 1), 5000);
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
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAutoplay();
    else startAutoplay();
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
