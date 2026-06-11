const CONTACT_CHOICES = {
  repair: {
    title: 'Liên hệ sửa chữa tivi',
    globalTitle: 'Sửa chữa tivi',
    description: 'Chọn số kỹ thuật/sửa chữa để Anh Minh Store kiểm tra và tư vấn nhanh hơn.',
    globalDescription: 'Liên hệ kỹ thuật Anh Minh để kiểm tra, sửa chữa hoặc bảo hành sản phẩm.',
    zaloNumbers: ['0905111223', '0774111223'],
    callNumbers: ['0905111223', '0774111223'],
  },
  sales: {
    title: 'Tư vấn thu hư đổi mới',
    globalTitle: 'Tư vấn mua bán',
    description: 'Chọn số tư vấn mua bán/thu đổi để Anh Minh Store hỗ trợ nhanh hơn.',
    globalDescription: 'Liên hệ Anh Minh Store để được tư vấn mua tivi mới, tivi cũ hoặc sản phẩm phù hợp ngân sách.',
    zaloNumbers: ['0702386544', '0389660779'],
    callNumbers: ['0702386544', '0389660779'],
  },
};

const ZALO_CHOICES = [CONTACT_CHOICES.repair, CONTACT_CHOICES.sales];

let lastZaloChoiceTrigger = null;

const getZaloChoiceModal = () => {
  let modal = document.querySelector('.zalo-choice-modal');
  if (modal) return modal;

  modal = document.createElement('div');
  modal.className = 'zalo-choice-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'zalo-choice-title');
  modal.setAttribute('aria-describedby', 'zalo-choice-subtitle');
  modal.innerHTML = `
    <div class="zalo-choice-modal__backdrop" data-zalo-choice-close></div>
    <div class="zalo-choice-modal__dialog" role="document" tabindex="-1">
      <button class="zalo-choice-modal__close" type="button" aria-label="Đóng lựa chọn Zalo" data-zalo-choice-close>×</button>
      <div class="zalo-choice-modal__header">
        <h2 id="zalo-choice-title">Bạn muốn nhắn Zalo về nội dung nào?</h2>
        <p id="zalo-choice-subtitle">Chọn đúng nhu cầu để Anh Minh Store hỗ trợ nhanh hơn.</p>
      </div>
      <div class="zalo-choice-grid"></div>
    </div>`;
  document.body.appendChild(modal);
  return modal;
};

const renderContactChoiceCard = (choice, useGlobalCopy = false) => `
  <article class="zalo-choice-card">
    <h3>${useGlobalCopy ? choice.globalTitle : choice.title}</h3>
    <p>${useGlobalCopy ? choice.globalDescription : choice.description}</p>
    <div class="zalo-choice-actions">
      ${choice.callNumbers.map((number) => `<a class="zalo-choice-button zalo-choice-button--call" href="tel:${number}">Gọi ${number}</a>`).join('')}
    </div>
    <div class="zalo-choice-actions zalo-choice-actions--secondary">
      ${choice.zaloNumbers.map((number) => `<a class="zalo-choice-button zalo-choice-button--zalo" href="https://zalo.me/${number}" target="_blank" rel="noopener noreferrer">Nhắn Zalo ${number}</a>`).join('')}
    </div>
  </article>`;

const renderZaloChoiceModal = (mode) => {
  const modal = getZaloChoiceModal();
  const title = modal.querySelector('#zalo-choice-title');
  const subtitle = modal.querySelector('#zalo-choice-subtitle');
  const grid = modal.querySelector('.zalo-choice-grid');
  const choice = CONTACT_CHOICES[mode];

  if (choice) {
    title.textContent = choice.title;
    subtitle.textContent = choice.description;
    grid.classList.add('zalo-choice-grid--single');
    grid.innerHTML = renderContactChoiceCard(choice);
    return modal;
  }

  title.textContent = 'Bạn muốn nhắn Zalo về nội dung nào?';
  subtitle.textContent = 'Chọn đúng nhu cầu để Anh Minh Store hỗ trợ nhanh hơn.';
  grid.classList.remove('zalo-choice-grid--single');
  grid.innerHTML = ZALO_CHOICES.map((item) => renderContactChoiceCard(item, true)).join('');
  return modal;
};

const closeZaloChoiceModal = () => {
  const modal = document.querySelector('.zalo-choice-modal');
  if (!modal) return;
  modal.classList.remove('is-open');
  document.body.classList.remove('zalo-choice-modal-open');
  if (lastZaloChoiceTrigger && typeof lastZaloChoiceTrigger.focus === 'function') {
    lastZaloChoiceTrigger.focus({ preventScroll: true });
  }
};

const openZaloChoiceModal = (trigger, mode) => {
  const modal = renderZaloChoiceModal(mode);
  lastZaloChoiceTrigger = trigger || document.activeElement;
  modal.classList.add('is-open');
  document.body.classList.add('zalo-choice-modal-open');
  window.requestAnimationFrame(() => {
    modal.querySelector('.zalo-choice-modal__dialog')?.focus({ preventScroll: true });
  });
};

document.addEventListener('click', (event) => {
  const contactChoiceTrigger = event.target.closest('[data-contact-choice]');
  if (contactChoiceTrigger) {
    event.preventDefault();
    event.stopPropagation();
    openZaloChoiceModal(contactChoiceTrigger, contactChoiceTrigger.dataset.contactChoice);
    return;
  }

  const zaloTrigger = event.target.closest('[data-zalo-choice]');
  if (zaloTrigger) {
    event.preventDefault();
    event.stopPropagation();
    openZaloChoiceModal(zaloTrigger, zaloTrigger.dataset.zaloChoice);
    return;
  }

  if (event.target.closest('[data-zalo-choice-close]')) {
    event.preventDefault();
    closeZaloChoiceModal();
  }
}, true);

document.addEventListener('keydown', (event) => {
  const modal = document.querySelector('.zalo-choice-modal.is-open');
  if (!modal) return;

  if (event.key === 'Escape') {
    event.preventDefault();
    closeZaloChoiceModal();
    return;
  }

  if (event.key !== 'Tab') return;
  const focusable = Array.from(modal.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'));
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

const dom = {
  menuWrap: document.querySelector('.menu-wrap'),
  hamburger: document.querySelector('.hamburger'),
  dropdownLinks: document.querySelectorAll('[data-menu-link]'),
  navLinks: document.querySelectorAll('.nav-link, [data-menu-link]'),
  hashLinks: document.querySelectorAll('a[href^="#"]'),
  sections: document.querySelectorAll('.section-anchor[id]'),
  carousel: document.querySelector('[data-carousel]'),
  homeRightBanner: document.querySelector('[data-home-right-banner]'),
  homeRightBannerCard: document.querySelector('[data-home-right-banner-card]'),
  productGrid: document.querySelector('[data-product-grid]'),
  featuredLoadMoreButton: document.querySelector('[data-load-more="featured"]'),
  sizeOptions: document.querySelector('.size-options'),
  featuredSelectedSize: document.querySelector('.selected-size span'),
  searchForm: document.querySelector('.search-box'),
  searchInput: document.querySelector('#search-input'),
  backToTop: document.querySelector('.back-to-top'),
  mobileCall: document.querySelector('[data-call-button]'),
  brandList: document.querySelector('[data-brand-list]'),
  oldTvSeriesBlock: document.querySelector('[data-old-tv-series-block]'),
  oldTvSeriesOptions: document.querySelector('[data-old-tv-series-options]'),
  oldTvSeriesTitle: document.querySelector('[data-old-tv-series-title]'),
  oldTvSeriesStatus: document.querySelector('[data-old-tv-series-status]'),
  newTvSeriesBlock: document.querySelector('[data-new-tv-series-block]'),
  newTvSeriesOptions: document.querySelector('[data-new-tv-series-options]'),
  newTvSeriesTitle: document.querySelector('[data-new-tv-series-title]'),
  newTvSeriesStatus: document.querySelector('[data-new-tv-series-status]'),
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
const PUBLIC_PRODUCTS_EMPTY_MESSAGE = 'Chưa có sản phẩm phù hợp. Vui lòng liên hệ Anh Minh Store để được tư vấn.';
let productIds = new Set();
let activeSize = dom.featuredSelectedSize?.textContent?.trim() === 'Tất cả' ? '' : dom.featuredSelectedSize?.textContent?.trim() || '';
let activeBrand = '';
let activeType = '';
let featuredSelectedBrand = '';
let featuredSelectedSize = activeSize;
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
    { label: 'OLED', aliases: ['oled'] },
    { label: 'Mini LED', aliases: ['mini led'] },
    { label: 'Full Array LED', aliases: ['full array led', 'full array'] },
    { label: 'BRAVIA XR', aliases: ['bravia xr', 'cognitive processor xr', 'xr cognitive', 'processor xr'] },
    { label: 'BRAVIA', aliases: ['bravia'] },
    { label: 'Google TV', aliases: ['google tv', 'google tivi'] },
    { label: 'UHD / 4K UHD', aliases: ['uhd', '4k uhd', 'ultra hd'] },
    { label: 'LED', aliases: ['led'] },
  ],
  Toshiba: [
    { label: 'Z Series', aliases: ['z series', 'z670', 'z770'] },
    { label: 'M Series', aliases: ['m series', 'm550', 'm650'] },
    { label: 'C Series', aliases: ['c series', 'c350', 'c350lp', '50c350', '55c350', '65c350', '75c350', '50c350lp', '55c350lp', '65c350lp', '75c350lp', 'c450'] },
    { label: 'V Series', aliases: ['v series', 'v35', 'v35rp', '32v35', '43v35', '32v35rp', '43v35rp'] },
    { label: 'QLED', aliases: ['qled'] },
    { label: 'REGZA', aliases: ['regza'] },
    { label: 'Google TV', aliases: ['google tv'] },
    { label: 'Android TV', aliases: ['android tv'] },
    { label: 'UHD / 4K UHD', aliases: ['uhd', '4k uhd', 'ultra hd'] },
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
  { label: 'Crystal UHD', aliases: ['crystal uhd', 'crystal', 'crystal 4k'] },
  { label: 'QLED', aliases: ['qled', 'quantum dot'] },
  { label: 'Neo QLED', aliases: ['neo qled', 'neo quantum'] },
  { label: 'OLED', aliases: ['oled'] },
  { label: 'Mini LED', aliases: ['mini led', 'uled mini led'] },
  { label: 'QNED', aliases: ['qned'] },
  { label: 'NanoCell', aliases: ['nanocell', 'nano cell', 'nano'] },
  { label: 'LED', aliases: ['led'] },
  { label: 'UHD / 4K UHD', aliases: ['uhd', '4k uhd', 'ultra hd'] },
  { label: 'Google TV', aliases: ['google tv'] },
  { label: 'Android TV', aliases: ['android tv'] },
  { label: 'Smart TV', aliases: ['smart tv', 'smart tivi'] },
];
const FILTER_ALL_VALUE = 'all';
const FILTER_ALL_LABEL = 'Tất cả';
const TV_SERIES_ALL_LABEL = 'Tất cả dòng';
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

publishProductsForChatbot();

const getBrandNameFromLogo = (image) => image.alt.replace(/^Logo\s+/i, '').trim();
const normalizeFilterValue = (value = '') => String(value).trim();
const isAllFilter = (value = '') => {
  const normalizedValue = normalizeText(normalizeFilterValue(value));
  return ['', FILTER_ALL_VALUE, normalizeText(FILTER_ALL_LABEL), normalizeText(BRAND_ALL_LABEL), normalizeText(TV_SERIES_ALL_LABEL)].includes(normalizedValue);
};
const normalizeFilterSelection = (value = '') => (isAllFilter(value) ? FILTER_ALL_VALUE : normalizeFilterValue(value));
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

const getSeriesOptionsForBrand = (brand = '') => (isAllFilter(brand) ? [] : getBrandSeriesConfig(brand));

const escapeRegExp = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isWeakSeriesAlias = (alias = '') => {
  const compactAlias = normalizeText(alias).replace(/\s+/g, '');
  return compactAlias.length <= 2 && !/\d/.test(compactAlias);
};
const textHasSeriesAlias = (text = '', alias = '') => {
  const normalizedText = normalizeText(text);
  const normalizedAlias = normalizeText(alias);
  if (!normalizedText || !normalizedAlias || isWeakSeriesAlias(normalizedAlias)) return false;
  if (normalizedAlias.includes(' ')) {
    const phrasePattern = new RegExp(`(^|[^a-z0-9])${escapeRegExp(normalizedAlias).replace(/\s+/g, '\\s+')}([^a-z0-9]|$)`);
    return phrasePattern.test(normalizedText);
  }
  return new RegExp(`(^|[^a-z0-9])${escapeRegExp(normalizedAlias)}([^a-z0-9]|$)`).test(normalizedText);
};
const PRIMARY_SERIES_PRIORITY_BY_BRAND = {
  samsung: ['OLED', 'Neo QLED', 'QLED', 'Crystal UHD', 'The Frame', 'The Serif', 'The Sero', 'Lifestyle TV', 'UHD / 4K UHD', 'LED'],
  lg: ['OLED', 'QNED', 'NanoCell', 'StanbyME', 'UHD / 4K UHD', 'LED', 'webOS'],
  sony: ['BRAVIA XR', 'OLED', 'Mini LED', 'Full Array LED', 'BRAVIA', 'Google TV', 'UHD / 4K UHD', 'LED'],
  tcl: ['Mini LED', 'QLED', 'C Series', 'P Series', 'S Series', 'Google TV', 'Android TV', 'UHD / 4K UHD', 'LED'],
  hisense: ['ULED Mini LED', 'ULED', 'QLED', 'Laser TV', 'U Series', 'A Series', 'Google TV', 'VIDAA', 'UHD / 4K UHD', 'LED'],
  toshiba: ['Z Series', 'M Series', 'C Series', 'V Series', 'QLED', 'REGZA', 'Google TV', 'Android TV', 'UHD / 4K UHD', 'LED'],
};

const GENERIC_PRIMARY_SERIES_PRIORITY = [
  'OLED',
  'Mini LED',
  'Neo QLED',
  'QLED',
  'ULED Mini LED',
  'ULED',
  'QNED',
  'NanoCell',
  'Laser TV',
  'REGZA',
  'AQUOS',
  'The Frame',
  'The Serif',
  'The Sero',
  'Lifestyle TV',
  'C Series',
  'M Series',
  'Z Series',
  'U Series',
  'A Series',
  'P Series',
  'S Series',
  'Y Series',
  'MX Series',
  'LX Series',
  'JX Series',
  'Xiaomi TV A Pro',
  'Xiaomi TV A',
  'Xiaomi TV P1',
  'Casper Smart TV',
  'Coocaa Smart TV',
  'Skyworth Smart TV',
  'SUE Series',
  'G Series',
  'Performance Series',
  'Google TV',
  'Android TV',
  'Tizen',
  'webOS',
  'VIDAA',
  'Smart TV',
  'UHD / 4K UHD',
  'HD / Full HD',
  'LED',
];

const sortSeriesOptionsByPriority = (options = [], priorityLabels = []) => {
  const priorityMap = new Map(priorityLabels.map((label, index) => [normalizeText(label), index]));
  return [...options].sort((a, b) => {
    const priorityA = priorityMap.has(normalizeText(a.label)) ? priorityMap.get(normalizeText(a.label)) : Number.MAX_SAFE_INTEGER;
    const priorityB = priorityMap.has(normalizeText(b.label)) ? priorityMap.get(normalizeText(b.label)) : Number.MAX_SAFE_INTEGER;
    return priorityA - priorityB;
  });
};

const getPrimarySeriesOptionsForBrand = (brand = '') => {
  const options = isAllFilter(brand) ? GENERAL_TV_SERIES_OPTIONS : getSeriesOptionsForBrand(brand);
  const priority = PRIMARY_SERIES_PRIORITY_BY_BRAND[normalizeBrand(brand)] || GENERIC_PRIMARY_SERIES_PRIORITY;
  return sortSeriesOptionsByPriority(options, priority);
};

const getProductSeriesSearchText = (product = {}) => [
  product.series,
  product.line,
  product.tv_line,
  product.product_line,
  getProductSearchText(product),
].map(stringifySearchPart).join(' ');

const seriesOptionHasAlias = (text = '', option = {}) => {
  const values = [option.label, ...(option.aliases || [])];
  return values.some((value) => textHasSeriesAlias(text, value));
};

const TOSHIBA_MODEL_SERIES_PATTERNS = [
  { label: 'Z Series', patterns: [/\b(?:\d{2})?z(?:670|770)[a-z0-9]*\b/] },
  { label: 'M Series', patterns: [/\b(?:\d{2})?m(?:550|650)[a-z0-9]*\b/] },
  { label: 'C Series', patterns: [/\b(?:\d{2})?c350(?:lp)?\b/, /\b(?:\d{2})?c450[a-z0-9]*\b/] },
  { label: 'V Series', patterns: [/\b(?:32|43)?v35(?:rp)?\b/] },
];

const detectToshibaModelSeries = (product = {}) => {
  const modelText = normalizeText([product.model, product.full_name, product.fullName, product.name].map(stringifySearchPart).join(' '));
  const detailText = normalizeText([product.description, product.features, product.specifications, product.overview].map(stringifySearchPart).join(' '));
  const compactText = `${modelText} ${detailText}`.replace(/[^a-z0-9]+/g, ' ');
  return TOSHIBA_MODEL_SERIES_PATTERNS.find((series) => series.patterns.some((pattern) => pattern.test(compactText)))?.label || '';
};

const productMatchesSeriesOption = (product = {}, option = {}, brand = FILTER_ALL_VALUE, text = '') => {
  const haystack = text || getProductSeriesSearchText(product);
  const normalizedBrand = normalizeBrand(brand);
  const normalizedLabel = normalizeText(option.label);

  if (normalizedBrand === 'sony' && normalizedLabel === 'bravia xr') {
    return ['bravia xr', 'cognitive processor xr', 'xr processor'].some((alias) => textHasSeriesAlias(haystack, alias));
  }

  if (normalizedBrand === 'sony' && normalizedLabel === 'bravia') {
    return textHasSeriesAlias(haystack, 'bravia');
  }

  if (normalizedBrand === 'samsung' && normalizedLabel === 'qled') {
    return !textHasSeriesAlias(haystack, 'neo qled') && seriesOptionHasAlias(haystack, option);
  }

  return seriesOptionHasAlias(haystack, option);
};

const findSeriesMatch = (text = '', options = [], product = {}, brand = FILTER_ALL_VALUE) => {
  if (!normalizeText(text)) return '';
  const match = options.find((option) => productMatchesSeriesOption(product, option, brand, text));
  return match?.label || '';
};

const getPrimarySeriesForProduct = (product = {}, brand = FILTER_ALL_VALUE) => {
  const productBrand = isAllFilter(brand) ? product.brand : brand;
  if (normalizeBrand(productBrand) === 'toshiba') {
    const modelSeries = detectToshibaModelSeries(product);
    if (modelSeries) return modelSeries;
  }
  const options = getPrimarySeriesOptionsForBrand(productBrand);
  return findSeriesMatch(getProductSeriesSearchText(product), options, product, productBrand);
};

const detectProductSeries = (product = {}, brand = FILTER_ALL_VALUE) => getPrimarySeriesForProduct(product, brand) || 'Dòng phổ thông';

const productMatchesBrand = (product = {}, brand = FILTER_ALL_VALUE) => (isAllFilter(brand) ? true : normalizeBrand(product.brand) === normalizeBrand(brand));
const productMatchesSize = (product = {}, size = FILTER_ALL_VALUE) => (isAllFilter(size) ? true : normalizeText(product.size).includes(normalizeText(size)));
const productMatchesSeries = (product = {}, series = FILTER_ALL_LABEL, brand = '') => {
  if (isAllFilter(brand) || isAllFilter(series)) return true;
  return normalizeText(getPrimarySeriesForProduct(product, brand)) === normalizeText(series);
};

const productMatchesGlobalFilters = (product = {}) => (
  productMatchesBrand(product, featuredSelectedBrand)
  && productMatchesSize(product, featuredSelectedSize)
);

const getSectionDomConfig = (sectionKey) => {
  if (sectionKey === 'newTv') {
    return {
      block: dom.newTvSeriesBlock,
      options: dom.newTvSeriesOptions,
      title: dom.newTvSeriesTitle,
      status: dom.newTvSeriesStatus,
      filterState: newTvFilters,
      titlePrefix: 'Chọn dòng tivi mới',
    };
  }
  if (sectionKey === 'oldTv') {
    return {
      block: dom.oldTvSeriesBlock,
      options: dom.oldTvSeriesOptions,
      title: dom.oldTvSeriesTitle,
      status: dom.oldTvSeriesStatus,
      filterState: oldTvFilters,
      titlePrefix: 'Chọn dòng tivi cũ',
    };
  }
  return null;
};

const getSeriesCountForSection = (sectionKey, filterState, seriesLabel = '') => {
  const sectionProducts = sectionKey === 'newTv' ? getNewTvProducts(products) : getOldTvProducts(products);
  return sectionProducts.filter((product) => (
    productMatchesBrand(product, filterState.brand)
    && productMatchesSize(product, filterState.size)
    && (seriesLabel ? productMatchesSeries(product, seriesLabel, filterState.brand) : true)
    && productMatchesSearch(product)
  )).length;
};

const resetSeriesForSection = (sectionKey) => {
  const config = getSectionDomConfig(sectionKey);
  if (config?.filterState) config.filterState.series = FILTER_ALL_VALUE;
};

const renderSeriesSelectorForSection = (sectionKey, brand) => {
  const config = getSectionDomConfig(sectionKey);
  if (!config?.block || !config.options) return;

  const filterState = config.filterState;
  const isAllBrand = isAllFilter(brand);

  if (isAllBrand) {
    filterState.series = FILTER_ALL_VALUE;
    config.options.innerHTML = '';
    config.block.hidden = true;
    config.block.classList.add('is-series-hidden');
    return;
  }

  config.block.hidden = false;
  config.block.classList.remove('is-series-hidden');

  const options = getSeriesOptionsForBrand(brand);
  const optionLabels = options.map((option) => option.label);
  if (!isAllFilter(filterState.series) && !optionLabels.some((label) => normalizeText(label) === normalizeText(filterState.series))) {
    filterState.series = FILTER_ALL_VALUE;
  }

  const normalizedBrandLabel = normalizeFilterValue(brand);
  const allLabel = isAllBrand ? TV_SERIES_ALL_LABEL : `Tất cả dòng ${normalizedBrandLabel}`;
  if (config.title) config.title.textContent = isAllBrand ? 'Dòng tivi' : `Dòng tivi ${normalizedBrandLabel}`;
  if (config.status) config.status.textContent = `Đang chọn: ${isAllFilter(filterState.series) ? allLabel : filterState.series}`;

  const allCount = getSeriesCountForSection(sectionKey, filterState, '');
  const allActive = isAllFilter(filterState.series);
  const allButton = `<button class="tv-series-pill${allActive ? ' is-active' : ''}" type="button" data-series="all" aria-pressed="${String(allActive)}">${escapeHtml(allLabel)} <span>${allCount}</span></button>`;
  const buttons = options.map((option) => {
    const count = getSeriesCountForSection(sectionKey, filterState, option.label);
    const isActive = normalizeText(filterState.series) === normalizeText(option.label);
    return `<button class="tv-series-pill${isActive ? ' is-active' : ''}" type="button" data-series="${escapeHtml(option.label)}" aria-pressed="${String(isActive)}"${count ? '' : ' disabled'}>${escapeHtml(option.label)} <span>${count}</span></button>`;
  }).join('');

  config.options.innerHTML = `${allButton}${buttons}`;
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
  const allCard = `<button class="${cardClass} is-active" type="button" ${dataAttr}="all" aria-pressed="true">
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



const oldTvFilters = {
  brand: FILTER_ALL_VALUE,
  series: FILTER_ALL_VALUE,
  size: FILTER_ALL_VALUE,
};

const newTvFilters = {
  brand: FILTER_ALL_VALUE,
  series: FILTER_ALL_VALUE,
  size: FILTER_ALL_VALUE,
};

const updatePressedState = (container, activeButton) => {
  container?.querySelectorAll('button[aria-pressed]').forEach((button) => {
    const isActive = button === activeButton;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
};

const syncSectionSizeRow = (sectionKey) => {
  const config = sectionKey === 'newTv'
    ? { row: dom.newTvSizeRow, filterState: newTvFilters, dataKey: 'newSize' }
    : { row: dom.usedTvSizeRow, filterState: oldTvFilters, dataKey: 'usedSize' };

  config.row?.querySelectorAll('button[aria-pressed]').forEach((button) => {
    const buttonSize = button.dataset[config.dataKey] || FILTER_ALL_VALUE;
    const isActive = (isAllFilter(buttonSize) && isAllFilter(config.filterState.size)) || normalizeText(buttonSize) === normalizeText(config.filterState.size);
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
};

const productMatchesSearch = (product) => {
  if (!searchTerm) return true;
  return normalizeText(getProductSearchText(product)).includes(searchTerm);
};

const productMatchesSectionFilter = (product, filterState) => {
  const matchesSectionSize = productMatchesSize(product, filterState.size);
  const matchesSectionBrand = productMatchesBrand(product, filterState.brand);
  const matchesSectionSeries = isAllFilter(filterState.brand) ? true : productMatchesSeries(product, filterState.series, filterState.brand);
  return matchesSectionSize && matchesSectionBrand && matchesSectionSeries && productMatchesSearch(product);
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
  const emptyMarkup = `<p class="empty-state used-tv-empty${sectionType === 'new' ? ' new-tv-empty' : ''}" ${sectionType === 'new' ? 'data-new-tv-empty' : 'data-used-tv-empty'}${filteredProducts.length ? ' hidden' : ''}>${PUBLIC_PRODUCTS_EMPTY_MESSAGE}</p>`;
  grid.innerHTML = `${cards}${emptyMarkup}`;
  if (count) count.textContent = `Đang hiển thị: ${visibleProducts.length} sản phẩm`;
  if (empty) empty.hidden = filteredProducts.length > 0;
  updateLoadMoreButton(loadMoreButton, sectionKey, filteredProducts.length);
  bindProductImageFallbacks(grid);
};

const renderUsedTvSection = () => renderTvSection({ grid: dom.usedTvGrid, empty: dom.usedTvEmpty, count: dom.usedTvCount, sectionKey: 'oldTv', filterState: oldTvFilters, sectionType: 'used', loadMoreButton: dom.usedTvLoadMoreButton });
const renderNewTvSection = () => renderTvSection({ grid: dom.newTvGrid, empty: dom.newTvEmpty, count: dom.newTvCount, sectionKey: 'newTv', filterState: newTvFilters, sectionType: 'new', loadMoreButton: dom.newTvLoadMoreButton });

const syncSectionBrandRows = () => {
  dom.usedTvBrandRow?.querySelectorAll('.old-tv-brand-card').forEach((button) => {
    const buttonBrand = button.dataset.usedBrand || '';
    const currentBrand = oldTvFilters.brand || '';
    const isActive = (isAllFilter(buttonBrand) && isAllFilter(currentBrand)) || normalizeBrand(buttonBrand) === normalizeBrand(currentBrand);
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
  dom.newTvBrandRow?.querySelectorAll('.new-tv-brand-card').forEach((button) => {
    const buttonBrand = button.dataset.newBrand || '';
    const currentBrand = newTvFilters.brand || '';
    const isActive = (isAllFilter(buttonBrand) && isAllFilter(currentBrand)) || normalizeBrand(buttonBrand) === normalizeBrand(currentBrand);
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
};

const applyBrandFilter = (brand = '') => {
  const nextBrand = normalizeFilterValue(brand);
  activeBrand = nextBrand;
  featuredSelectedBrand = nextBrand;
  activeSize = '';
  featuredSelectedSize = '';
  activeType = '';
  searchTerm = '';
  if (dom.searchInput) dom.searchInput.value = '';
  if (dom.featuredSelectedSize) dom.featuredSelectedSize.textContent = nextBrand || FILTER_ALL_LABEL;
  dom.sizeOptions?.querySelectorAll('.size-pill').forEach((button) => {
    const isActive = !(button.dataset.size || '');
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
  syncBrandPanelActive();
  applyProductFilters({ resetSections: ['featured'] });
};

const applySectionBrandFilter = (sectionKey, brand = '') => {
  const config = getSectionDomConfig(sectionKey);
  if (!config?.filterState) return;
  config.filterState.brand = normalizeFilterSelection(brand);
  resetSeriesForSection(sectionKey);
  syncSectionSizeRow(sectionKey);
  syncSectionBrandRows();
  applyFiltersForSection(sectionKey);
};

const applySectionSeriesFilter = (sectionKey, series = '') => {
  const config = getSectionDomConfig(sectionKey);
  if (!config?.filterState) return;
  config.filterState.series = normalizeFilterSelection(series);
  applyFiltersForSection(sectionKey);
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
  oldTvFilters.size = normalizeFilterSelection(button.dataset.usedSize || FILTER_ALL_VALUE);
  updatePressedState(dom.usedTvSizeRow, button);
  applyFiltersForSection('oldTv');
});

dom.usedTvBrandRow?.addEventListener('click', (event) => {
  const button = event.target.closest('.old-tv-brand-card');
  if (!button) return;
  applySectionBrandFilter('oldTv', button.dataset.usedBrand || '');
});

dom.newTvSizeRow?.addEventListener('click', (event) => {
  const button = event.target.closest('.new-tv-size-pill');
  if (!button) return;
  newTvFilters.size = normalizeFilterSelection(button.dataset.newSize || FILTER_ALL_VALUE);
  updatePressedState(dom.newTvSizeRow, button);
  applyFiltersForSection('newTv');
});

dom.newTvBrandRow?.addEventListener('click', (event) => {
  const button = event.target.closest('.new-tv-brand-card');
  if (!button) return;
  applySectionBrandFilter('newTv', button.dataset.newBrand || '');
});

dom.oldTvSeriesOptions?.addEventListener('click', (event) => {
  const pill = event.target.closest('.tv-series-pill');
  if (!pill || pill.disabled) return;
  applySectionSeriesFilter('oldTv', pill.dataset.series || '');
});

dom.newTvSeriesOptions?.addEventListener('click', (event) => {
  const pill = event.target.closest('.tv-series-pill');
  if (!pill || pill.disabled) return;
  applySectionSeriesFilter('newTv', pill.dataset.series || '');
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
    dom.productGrid.innerHTML = `<p class="empty-state">${PUBLIC_PRODUCTS_EMPTY_MESSAGE}</p>`;
    updateLoadMoreButton(dom.featuredLoadMoreButton, 'featured', 0);
    return;
  }

  const filteredProducts = getSectionProducts('featured');
  if (!filteredProducts.length) {
    dom.productGrid.innerHTML = `<p class="empty-state">${PUBLIC_PRODUCTS_EMPTY_MESSAGE}</p>`;
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
  renderSeriesSelectorForSection('oldTv', oldTvFilters.brand);
  renderSeriesSelectorForSection('newTv', newTvFilters.brand);
  renderProductCards();
  renderUsedTvSection();
  renderNewTvSection();
};

const applyProductFilters = (options = {}) => applyFiltersAndRender(options);

const applyFiltersForSection = (sectionKey) => {
  resetVisibleCount(sectionKey);
  if (sectionKey === 'oldTv') {
    renderSeriesSelectorForSection('oldTv', oldTvFilters.brand);
    renderUsedTvSection();
  }
  if (sectionKey === 'newTv') {
    renderSeriesSelectorForSection('newTv', newTvFilters.brand);
    renderNewTvSection();
  }
};

renderBrandPanel();
renderBrandFilterRow({ container: dom.usedTvBrandRow, sectionType: 'used' });
renderBrandFilterRow({ container: dom.newTvBrandRow, sectionType: 'new' });
applyFiltersAndRender();

dom.sizeOptions?.addEventListener('click', (event) => {
  const pill = event.target.closest('.size-pill');
  if (!pill) return;
  activeSize = pill.dataset.size || '';
  featuredSelectedSize = activeSize;
  activeType = '';
  dom.sizeOptions.querySelectorAll('.size-pill').forEach((button) => {
    const isActive = button === pill;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
  if (dom.featuredSelectedSize) dom.featuredSelectedSize.textContent = activeSize || 'Tất cả';
  applyProductFilters();
  dom.productGrid?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
});

dom.searchForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  searchTerm = normalizeText(dom.searchInput?.value.trim() || '');
  if (dom.featuredSelectedSize) dom.featuredSelectedSize.textContent = searchTerm ? `Tìm: ${dom.searchInput.value.trim()}` : (featuredSelectedSize || featuredSelectedBrand || 'Tất cả');
  applyProductFilters();
  scrollToHash('#san-pham');
});

dom.productFilterLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const filterType = link.dataset.productFilter;
    const filterValue = link.dataset.filterValue || '';
    activeSize = filterType === 'size' ? filterValue : '';
    featuredSelectedSize = activeSize;
    activeBrand = filterType === 'brand' ? filterValue : '';
    featuredSelectedBrand = activeBrand;
        activeType = filterType === 'type' ? filterValue : '';
    searchTerm = '';
    if (dom.searchInput) dom.searchInput.value = '';

    dom.sizeOptions?.querySelectorAll('.size-pill').forEach((button) => {
      const isActive = filterType === 'size' && (button.dataset.size || '') === filterValue;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });

    syncBrandPanelActive();
    applyProductFilters();

    const label = filterValue || 'Tất cả';
    if (dom.featuredSelectedSize) dom.featuredSelectedSize.textContent = label;
    setMenuState(false);
    scrollToHash('#san-pham');
  });
});


dom.featuredLoadMoreButton?.addEventListener('click', () => showMoreProducts('featured'));
dom.usedTvLoadMoreButton?.addEventListener('click', () => showMoreProducts('oldTv'));
dom.newTvLoadMoreButton?.addEventListener('click', () => showMoreProducts('newTv'));

const refreshPublicProductsFromSupabase = async () => {
  const storeSupabase = window.AnhMinhSupabase;
  if (!storeSupabase?.isConfigured || !storeSupabase.client) {
    publishProductsForChatbot();
    return;
  }

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
    console.warn('Không thể tải sản phẩm từ Supabase. Website công khai sẽ không dùng dữ liệu demo products.js.', error);
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
      .select('title,image_url,alt_text,sort_order,created_at,placement')
      .eq('is_active', true)
      .eq('placement', 'home_main_carousel')
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

const renderHomeRightBannerFallback = () => {
  const card = dom.homeRightBannerCard;
  if (!card) return;
  card.removeAttribute('role');
  card.removeAttribute('tabindex');
  card.removeAttribute('aria-label');
  card.classList.remove('is-clickable');
  card.onclick = null;
  card.onkeydown = null;
  card.innerHTML = `<div class="home-hero-right-banner-placeholder" data-home-right-banner-placeholder>
    <strong>Ưu đãi nổi bật</strong>
    <span>Cập nhật banner trong trang quản trị</span>
  </div>`;
};

const normalizeUrl = (value = '') => String(value).trim();

const renderHomeRightBanner = (banner) => {
  const card = dom.homeRightBannerCard;
  if (!card) return;
  if (!banner?.image_url) {
    renderHomeRightBannerFallback();
    return;
  }

  const title = banner.title || 'Ưu đãi nổi bật Anh Minh Store';
  const linkUrl = normalizeUrl(banner.link_url);
  card.classList.toggle('is-clickable', Boolean(linkUrl));
  card.innerHTML = `<img class="home-hero-right-banner-image" src="${escapeAttribute(banner.image_url)}" alt="${escapeAttribute(title)}" loading="lazy" />`;

  if (linkUrl) {
    card.setAttribute('role', 'link');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', title);
    const openBannerLink = () => { window.location.href = linkUrl; };
    card.onclick = openBannerLink;
    card.onkeydown = (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openBannerLink();
      }
    };
  } else {
    card.removeAttribute('role');
    card.removeAttribute('tabindex');
    card.removeAttribute('aria-label');
    card.onclick = null;
    card.onkeydown = null;
  }
};

const loadHomeRightBanner = async () => {
  if (!dom.homeRightBannerCard) return;
  const storeSupabase = window.AnhMinhSupabase || window.anhMinhSupabase;
  if (!storeSupabase?.isConfigured || !storeSupabase.client) {
    renderHomeRightBannerFallback();
    return;
  }

  try {
    const { data, error } = await storeSupabase.client
      .from('hero_banners')
      .select('title,image_url,link_url,sort_order,created_at,placement')
      .eq('placement', 'home_right_9_16')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    renderHomeRightBanner(data);
  } catch (error) {
    console.warn('Không thể tải banner dọc trang chủ từ Supabase, dùng khung mặc định.', error);
    renderHomeRightBannerFallback();
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

  const getActiveSlideImage = () => slides[currentIndex]?.querySelector('img') || carousel.querySelector('.carousel-slide img');

  const syncHeroCarouselHeightToActiveImage = () => {
    const activeImg = getActiveSlideImage();
    if (!activeImg) return;

    const applySize = () => {
      if (!activeImg.naturalWidth || !activeImg.naturalHeight) return;
      const width = carousel.clientWidth;
      if (!width) return;
      const height = width * activeImg.naturalHeight / activeImg.naturalWidth;
      carousel.style.height = `${height}px`;
      carousel.classList.add('is-height-synced');
      console.log('[Hero Banner] image natural size', activeImg.naturalWidth, activeImg.naturalHeight);
      console.log('[Hero Banner] calculated carousel size', width, height);
    };

    if (activeImg.complete) applySize();
    else activeImg.addEventListener('load', applySize, { once: true });
  };

  console.log('[Hero Banner] no-crop mode applied');

  const applyTransform = (animate = true) => {
    track.style.transition = animate && !reduceMotion ? 'transform 420ms ease' : 'none';
    track.style.transform = `translate3d(${currentIndex * -slideWidth + dragOffset}px, 0, 0)`;
    slides.forEach((slide, index) => {
      slide.classList.toggle('is-active', index === currentIndex);
      slide.classList.toggle('active', index === currentIndex);
    });
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
    syncHeroCarouselHeightToActiveImage();
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
        syncHeroCarouselHeightToActiveImage();
        slideWidth = viewport.clientWidth;
        goToSlide(currentIndex, false);
      }, 120);
    },
    { passive: true },
  );

  slides.forEach((slide) => {
    const image = slide.querySelector('img');
    image?.addEventListener('load', syncHeroCarouselHeightToActiveImage);
  });

  applyTransform(false);
  syncHeroCarouselHeightToActiveImage();
  startAutoplay();
};

initCarousel();
loadHomeRightBanner();

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
