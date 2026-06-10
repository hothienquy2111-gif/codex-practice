(() => {
  'use strict';

  const CHATBOT_ID = 'anh-minh-chatbot';
  const HISTORY_KEY = 'anhMinhChatHistory';
  const HISTORY_VERSION_KEY = 'anhMinhChatHistoryVersion';
  const AM_CHATBOT_HISTORY_VERSION = 'support-intents-v7';
  const MAX_HISTORY = 20;
  const AVATAR_SRC = 'linh%20v%E1%BA%ADt%20AM.jpeg';
  const HOTLINE = '0905111223';
  const QUICK_REPLIES = [
    'Tư vấn chọn tivi',
    'Mình cần mua tivi',
    'Dưới 10 triệu',
    'Dưới 20 triệu',
    'Tivi mới',
    'Tivi cũ',
    'Thu cũ đổi mới',
    'Sửa tivi',
    'Liên hệ cửa hàng',
  ];
  const SMART_RECOMMENDER_QUICK_REPLIES = ['Dưới 10 triệu', 'Dưới 20 triệu', 'Tivi mới', 'Tivi cũ', 'Phòng ngủ', 'Phòng khách'];
  const WELCOME_MESSAGE = 'Xin chào 👋 Mình là AM AI – trợ lý của Anh Minh Store. Mình có thể giúp bạn tìm tivi phù hợp, tư vấn tivi mới/tivi cũ, thu cũ đổi mới, sửa tivi, bảo hành và thông tin cửa hàng.';
  const START_MESSAGE = 'AM AI sẵn sàng tư vấn lại từ đầu ạ 👋 Bạn đang cần mua tivi mới, tivi cũ, hỏi bảo hành hay muốn tư vấn theo ngân sách?';
  const TV_BRANDS = ['samsung', 'lg', 'sony', 'toshiba', 'tcl', 'panasonic', 'sharp', 'xiaomi', 'casper', 'coocaa', 'skyworth', 'philips', 'hitachi', 'hisense'];
  const TV_BRAND_LABELS = {
    samsung: 'Samsung',
    lg: 'LG',
    sony: 'Sony',
    toshiba: 'Toshiba',
    tcl: 'TCL',
    panasonic: 'Panasonic',
    sharp: 'Sharp',
    xiaomi: 'Xiaomi',
    casper: 'Casper',
    coocaa: 'Coocaa',
    skyworth: 'Skyworth',
    philips: 'Philips',
    hitachi: 'Hitachi',
    hisense: 'Hisense',
  };
  const PRODUCT_SOURCE_PRIORITY = { dom: 3, live: 2, supabase: 2, unknown: 0 };
  const TV_SERIES_BY_BRAND_CHATBOT = {
    Samsung: [
      { label: 'Crystal UHD', aliases: ['crystal uhd', 'crystal', 'crystal 4k'] },
      { label: 'Neo QLED', aliases: ['neo qled', 'neo quantum', 'mini led'] },
      { label: 'QLED', aliases: ['qled', 'quantum dot'] },
      { label: 'OLED', aliases: ['oled'] },
      { label: 'The Frame', aliases: ['the frame'] },
      { label: 'The Serif', aliases: ['the serif'] },
      { label: 'The Sero', aliases: ['the sero'] },
      { label: 'Lifestyle TV', aliases: ['lifestyle'] },
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
      { label: 'BRAVIA XR', aliases: ['bravia xr', 'xr'] },
      { label: 'BRAVIA', aliases: ['bravia'] },
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
      { label: 'ULED Mini LED', aliases: ['uled mini led', 'mini led'] },
      { label: 'ULED', aliases: ['uled'] },
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
      { label: 'Xiaomi TV A Pro', aliases: ['a pro', 'tv a pro'] },
      { label: 'Xiaomi TV A', aliases: ['tv a', 'xiaomi tv a', 'a series'] },
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

  const CHATBOT_PRODUCT_SOURCE_EXCLUDE_SELECTOR = [
    `#${CHATBOT_ID}`,
    '.am-chatbot-window',
    '.am-chatbot-popup',
    '.am-chatbot-panel',
    '.am-chatbot-widget',
  ].join(', ');

  const RECOMMENDATION_INTENT_KEYWORDS = [
    'nên mua', 'nen mua', 'tư vấn', 'tu van', 'chọn', 'chon', 'phù hợp', 'phu hop', 'loại nào', 'loai nao',
    'con nào', 'con nao', 'mua tivi', 'mua tv', 'tivi nào', 'tivi nao', 'tv nào', 'tv nao', 'phòng', 'phong',
    'ngân sách', 'ngan sach', 'dưới', 'duoi', 'tầm', 'tam', 'khoảng', 'khoang', 'triệu', 'trieu', 'tr',
    'inch', 'inh', 'giá rẻ', 'gia re', 'cao cấp', 'cao cap', 'world cup', 'bóng đá', 'bong da',
    'có mẫu', 'co mau', 'còn mẫu', 'con mau', 'mẫu nào', 'mau nao', 'còn hàng', 'con hang',
    'qled', 'oled', 'mini led', 'crystal', 'crystal uhd', 'nanocell', 'qned', 'bravia', 'google tv', 'android tv',
    ...TV_BRANDS,
  ];

  let elements = {};
  let chatHistory = [];
  let hasRenderedQuickReplies = false;

  const normalizeVietnameseText = (text = '') => String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

  const normalizeText = normalizeVietnameseText;

  const escapeHtml = (value = '') => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  const safeLocalStorage = {
    get(key) {
      try { return window.localStorage.getItem(key); } catch (error) { return null; }
    },
    set(key, value) {
      try { window.localStorage.setItem(key, value); } catch (error) { /* Chat still works without storage. */ }
    },
    remove(key) {
      try { window.localStorage.removeItem(key); } catch (error) { /* Chat still works without storage. */ }
    },
  };

  const getZaloHref = () => {
    const zaloLink = Array.from(document.querySelectorAll('a[href]')).find((link) => {
      const text = normalizeText(link.textContent || link.getAttribute('aria-label') || '');
      const href = link.getAttribute('href') || '';
      return text.includes('zalo') && href && href !== '#' && !href.startsWith('javascript:');
    });

    if (zaloLink) return zaloLink.getAttribute('href');
    return window.location?.pathname?.includes('product-detail') ? 'index.html#lien-he' : '#lien-he';
  };

  const createAction = (label, href, primary = false) => ({ label, type: 'link', href, primary });
  const callAction = () => createAction('Gọi ngay', `tel:${HOTLINE}`, true);
  const zaloAction = () => createAction('Nhắn Zalo', getZaloHref());
  const newTvAction = () => createAction('Xem tivi mới', 'index.html#tivi-moi', true);
  const oldTvAction = () => createAction('Xem tivi cũ', 'index.html#tivi-cu', true);
  const featuredAction = () => createAction('Xem sản phẩm nổi bật', 'index.html#san-pham');

  const createProductDetailUrl = (product) => {
    if (!product || !product.id) return '';
    return `product-detail.html?id=${encodeURIComponent(product.id)}`;
  };

  const getProductValue = (product, keys) => {
    for (const key of keys) {
      if (product && product[key] !== undefined && product[key] !== null && product[key] !== '') return product[key];
    }
    return '';
  };

  const stringifyProductInfo = (value) => {
    if (value === undefined || value === null) return '';
    if (Array.isArray(value)) return value.map(stringifyProductInfo).filter(Boolean).join(' ');
    if (typeof value === 'object') return Object.values(value).map(stringifyProductInfo).filter(Boolean).join(' ');
    return String(value);
  };

  const formatPriceText = (value) => {
    if (value === undefined || value === null || value === '') return 'Giá đang cập nhật';
    if (typeof value === 'number' && Number.isFinite(value)) return `${value.toLocaleString('vi-VN')}đ`;
    return String(value).trim() || 'Giá đang cập nhật';
  };

  const formatPriceNumberForChatbot = (value) => {
    const priceNumber = parseVietnamesePriceToNumber(value);
    return priceNumber ? `${priceNumber.toLocaleString('vi-VN')}đ` : formatPriceText(value);
  };

  const parseVietnamesePriceToNumber = (value) => {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value;
    const raw = String(value ?? '').trim();
    if (!raw) return null;
    const normalized = normalizeVietnameseText(raw)
      .replace(/vnđ|vnd|dong|dồng|đồng|₫|đ/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const rangeMillionMatch = normalized.match(/(\d+(?:[.,]\d+)?)\s*(?:-|den|toi|–)\s*(\d+(?:[.,]\d+)?)\s*(trieu|tr\b|m\b)/);
    if (rangeMillionMatch) return Math.round(Number(rangeMillionMatch[2].replace(',', '.')) * 1000000);

    const millionMatch = normalized.match(/(\d+(?:[.,]\d+)?)\s*(trieu|tr\b|m\b)/);
    if (millionMatch) return Math.round(Number(millionMatch[1].replace(',', '.')) * 1000000);

    const compact = normalized.replace(/\s+/g, '');
    const groupedMatches = compact.match(/\d{1,3}(?:[.,]\d{3}){1,3}/g);
    if (groupedMatches?.length) {
      const number = Number(groupedMatches[groupedMatches.length - 1].replace(/[.,]/g, ''));
      if (Number.isFinite(number) && number > 0) return number;
    }

    const digits = normalized.replace(/[^\d]/g, '');
    if (!digits) return null;
    const number = Number(digits);
    if (!Number.isFinite(number) || number <= 0) return null;
    return number < 1000 ? number * 1000000 : number;
  };

  const parseSizeToNumber = (value) => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    const text = normalizeVietnameseText(value ?? '');
    if (!text) return null;
    const explicit = text.match(/\b(32|40|42|43|49|50|55|58|60|65|70|75|77|85|86|98)\s*(inch|in|inh|\")?\b/);
    if (explicit) return Number(explicit[1]);
    const generic = text.match(/\b(\d{2})\b/);
    return generic ? Number(generic[1]) : null;
  };

  const normalizeProductForChatbot = (product = {}, index = 0) => {
    const id = getProductValue(product, ['id', 'slug', 'code', 'product_id', 'productId', 'sku']);
    const brand = String(getProductValue(product, ['brand', 'manufacturer', 'vendor']) || '').trim();
    const model = String(getProductValue(product, ['model', 'model_name', 'modelName', 'sku']) || '').trim();
    const name = String(getProductValue(product, ['full_name', 'fullName', 'name', 'title', 'product_name', 'productName']) || model || brand || 'Sản phẩm tivi').trim();
    const size = getProductValue(product, ['size', 'screen_size', 'screenSize']);
    const type = String(getProductValue(product, ['type', 'product_type', 'productType', 'category']) || '').trim();
    const condition = String(getProductValue(product, ['condition', 'status']) || '').trim();
    const warranty = String(getProductValue(product, ['warranty', 'badge']) || '').trim();
    const price = getProductValue(product, ['price', 'salePrice', 'sale_price', 'sellingPrice', 'selling_price', 'finalPrice', 'final_price']);
    const oldPrice = getProductValue(product, ['old_price', 'oldPrice', 'compareAtPrice', 'compare_at_price', 'originalPrice', 'original_price']);
    const images = getProductValue(product, ['images']);
    const image = String(getProductValue(product, ['image', 'image_url', 'imageUrl', 'thumbnail', 'thumbnail_url']) || (Array.isArray(images) ? images[0] : '') || '').trim();
    const featuresText = stringifyProductInfo([
      getProductValue(product, ['features']),
      getProductValue(product, ['description']),
      getProductValue(product, ['overview']),
      getProductValue(product, ['specifications']),
    ]);
    const normalizedProduct = {
      id: id ? String(id).trim() : '',
      brand,
      model,
      name,
      fullName: name,
      size: String(size || '').trim(),
      sizeNumber: parseSizeToNumber(size || name || model),
      type,
      condition,
      warranty,
      priceNumber: parseVietnamesePriceToNumber(price),
      priceText: formatPriceNumberForChatbot(price),
      oldPriceNumber: parseVietnamesePriceToNumber(oldPrice),
      oldPriceText: oldPrice ? formatPriceNumberForChatbot(oldPrice) : '',
      image,
      detailUrl: '',
      featuresText,
      isFeatured: Boolean(product.is_featured ?? product.isFeatured ?? product.featured ?? false),
      isActive: product.is_active ?? product.isActive ?? product.active ?? true,
      href: product.href || product.detailUrl || product.detail_url || product.url || '',
      source: product.__chatbotSource || 'unknown',
      sourcePriority: Number(product.__chatbotPriority || 0),
      sourceIndex: index,
    };
    normalizedProduct.detailUrl = normalizedProduct.href || createProductDetailUrl(normalizedProduct);
    normalizedProduct.searchableText = normalizeVietnameseText([
      normalizedProduct.id,
      normalizedProduct.brand,
      normalizedProduct.model,
      normalizedProduct.name,
      normalizedProduct.size,
      normalizedProduct.type,
      normalizedProduct.condition,
      normalizedProduct.warranty,
      normalizedProduct.priceText,
      normalizedProduct.featuresText,
    ].join(' '));
    return normalizedProduct;
  };

  const pickText = (root, selectors = []) => {
    for (const selector of selectors) {
      const element = root.querySelector(selector);
      const text = element?.textContent?.trim();
      if (text) return text;
      const attrText = element?.getAttribute?.('aria-label')?.trim();
      if (attrText) return attrText;
    }
    return '';
  };

  const pickAttribute = (root, selectors = [], attribute = 'src') => {
    for (const selector of selectors) {
      const element = root.querySelector(selector);
      const value = element?.getAttribute?.(attribute)?.trim();
      if (value) return value;
    }
    return '';
  };

  const isElementHiddenFromChatbotScrape = (element) => {
    if (!element) return true;
    if (element.hidden || element.getAttribute?.('aria-hidden') === 'true') return true;
    const style = window.getComputedStyle ? window.getComputedStyle(element) : null;
    return style?.display === 'none' || style?.visibility === 'hidden';
  };

  const isOldPriceElement = (element) => {
    if (!element) return false;
    const oldPricePattern = /old|original|compare|strike|was|line-through/i;
    const descriptor = [element.className, element.id, element.getAttribute?.('data-price-type'), element.getAttribute?.('aria-label')].join(' ');
    const style = window.getComputedStyle ? window.getComputedStyle(element) : null;
    return oldPricePattern.test(descriptor)
      || ['DEL', 'S', 'STRIKE'].includes(element.tagName)
      || Boolean(element.closest?.('del, s, strike, .product-price__old, .old-price, .compare-price, .original-price, .strike, [data-old-price]'))
      || style?.textDecorationLine?.includes('line-through');
  };

  const pickDomSalePrice = (root) => {
    const directSelectors = [
      '.product-price__sale',
      '.sale-price',
      '.current-price',
      '.price-current',
      '.price-sale',
      '[data-product-price]',
      '[data-price]',
    ];
    for (const selector of directSelectors) {
      const element = root.querySelector(selector);
      const text = element?.textContent?.trim() || element?.getAttribute?.('data-product-price') || element?.getAttribute?.('data-price') || '';
      if (text && !isElementHiddenFromChatbotScrape(element) && !isOldPriceElement(element) && parseVietnamesePriceToNumber(text)) return text.trim();
    }

    const priceContainer = root.querySelector('.product-price, .price, .product-card-price') || root;
    const candidates = Array.from(priceContainer.querySelectorAll('*'))
      .filter((element) => !isElementHiddenFromChatbotScrape(element) && !isOldPriceElement(element))
      .map((element) => ({ text: element.textContent?.trim() || '', price: parseVietnamesePriceToNumber(element.textContent || '') }))
      .filter((item) => item.text && item.price);

    if (candidates.length) return candidates[candidates.length - 1].text;

    const textWithoutOldPrices = Array.from(priceContainer.childNodes).map((node) => {
      if (node.nodeType === Node.ELEMENT_NODE && (isElementHiddenFromChatbotScrape(node) || isOldPriceElement(node))) return '';
      return node.textContent || '';
    }).join(' ');
    const match = textWithoutOldPrices.match(/(?:gia\s*:?\s*)?\d{1,3}(?:[.,]\d{3}){1,3}\s*(?:đ|₫|vnd|vnđ)?|\d+\s*(?:trieu|triệu|tr\b)/i);
    return match ? match[0].trim() : '';
  };

  const pickDomOldPrice = (root) => {
    const oldElement = root.querySelector('.product-price__old, .old-price, .compare-price, .original-price, del, s, strike, [data-old-price]');
    return oldElement?.textContent?.trim() || oldElement?.getAttribute?.('data-old-price') || '';
  };

  const findProductIdFromHref = (href = '') => {
    if (!href) return '';
    try {
      const url = new URL(href, window.location.href);
      return url.searchParams.get('id') || '';
    } catch (error) {
      const match = String(href).match(/[?&]id=([^&]+)/);
      return match ? decodeURIComponent(match[1]) : '';
    }
  };

  const readDomProductsForChatbot = () => {
    const productsFromDom = [];
    const cardSelector = [
      '.product-card',
      '.product-card-wrap',
      '.used-tv-card',
      '.product-item',
      '.product',
      '[data-product-id]',
      '[data-product-card]',
      '[data-used-tv-card]',
      '[data-new-tv-card]',
    ].join(', ');

    document.querySelectorAll(cardSelector).forEach((card, index) => {
      if (card.closest(CHATBOT_PRODUCT_SOURCE_EXCLUDE_SELECTOR) || isElementHiddenFromChatbotScrape(card)) return;
      const productRoot = card.matches('.product-card-wrap') ? card : card.closest('.product-card-wrap') || card;
      if (productRoot.closest(CHATBOT_PRODUCT_SOURCE_EXCLUDE_SELECTOR) || isElementHiddenFromChatbotScrape(productRoot)) return;
      const link = card.matches('a[href]') ? card : productRoot.querySelector('a[href]');
      const href = link?.getAttribute('href') || '';
      const name = pickText(productRoot, ['.product-card-name', '.product-title', '.product-name', 'h3', 'h2', '[data-product-name]', '[data-title]']);
      const explicitModel = pickText(productRoot, ['.product-card-model', '.product-model', '.model', '[data-product-model]', '[data-model]']);
      const inferredModel = (name || productRoot.textContent || '').match(/\b(?:UA|QA|KD|XR|KDL|OLED|QNED|TCL|L|55|43|50|65)[A-Z0-9-]{4,}\b/i)?.[0] || '';
      const model = explicitModel || inferredModel;
      const brand = pickText(productRoot, ['.product-card-brand', '.product-brand', '.brand', '[data-product-brand]', '[data-brand]'])
        || productRoot.getAttribute('data-used-brand')
        || productRoot.getAttribute('data-new-brand')
        || '';
      const size = pickText(productRoot, ['.product-size', '.product-card__size', '.screen-size', '[data-product-size]', '[data-size]'])
        || productRoot.getAttribute('data-used-size')
        || productRoot.getAttribute('data-new-size')
        || '';
      const type = pickText(productRoot, ['.product-type', '.product-card__type', '.category', '[data-product-type]', '[data-type]'])
        || productRoot.getAttribute('data-used-type')
        || productRoot.getAttribute('data-new-type')
        || '';
      const price = pickDomSalePrice(productRoot);
      const oldPrice = pickDomOldPrice(productRoot);
      const image = pickAttribute(productRoot, ['img.product-card__image', 'img'], 'src') || pickAttribute(productRoot, ['img'], 'data-src');
      const badge = pickText(productRoot, ['.product-card__badge', '.badge']);
      const allText = productRoot.textContent?.trim() || '';

      if (name || model || brand || price || allText) {
        productsFromDom.push({
          id: productRoot.getAttribute('data-product-id') || findProductIdFromHref(href) || '',
          fullName: name || allText.slice(0, 90),
          model,
          brand,
          size,
          type,
          price,
          oldPrice,
          image,
          href,
          badge,
          features: allText,
          __chatbotSource: 'dom',
          __chatbotPriority: PRODUCT_SOURCE_PRIORITY.dom,
        });
      }
    });
    return productsFromDom;
  };

  const cloneProductsWithSource = (items = [], source = 'unknown', priority = PRODUCT_SOURCE_PRIORITY.unknown) => items.map((item) => ({
    ...(item || {}),
    __chatbotSource: item?.__chatbotSource || source,
    __chatbotPriority: item?.__chatbotPriority ?? priority,
  }));

  const collectProductArraysFromObject = (source, rawProducts, sourceName = 'state', priority = PRODUCT_SOURCE_PRIORITY.live) => {
    if (!source || typeof source !== 'object') return;
    [
      'products',
      'allProducts',
      'loadedProducts',
      'siteProducts',
      'currentProducts',
      'filteredProducts',
      'visibleProducts',
      'supabaseProducts',
      'productCache',
      'cachedProducts',
      'items',
    ].forEach((key) => {
      if (Array.isArray(source[key])) rawProducts.push(...cloneProductsWithSource(source[key], `${sourceName}.${key}`, priority));
    });
  };

  const getProductDedupKeys = (product) => {
    const keys = [];
    const id = normalizeVietnameseText(product.id || '');
    const model = normalizeVietnameseText(product.model || '').replace(/\s+/g, '');
    if (id) keys.push(`id:${id}`);
    if (model) keys.push(`model:${model}`);
    return keys.length ? keys : [`name:${normalizeVietnameseText(product.name || product.fullName || '')}`];
  };

  const mergeChatbotProducts = (existing, incoming) => {
    const primary = incoming.sourcePriority >= existing.sourcePriority ? incoming : existing;
    const secondary = primary === incoming ? existing : incoming;
    return {
      ...secondary,
      ...primary,
      id: primary.id || secondary.id,
      brand: primary.brand || secondary.brand,
      model: primary.model || secondary.model,
      name: primary.name || secondary.name,
      fullName: primary.fullName || secondary.fullName,
      size: primary.size || secondary.size,
      sizeNumber: primary.sizeNumber || secondary.sizeNumber,
      type: primary.type || secondary.type,
      condition: primary.condition || secondary.condition,
      warranty: primary.warranty || secondary.warranty,
      priceNumber: primary.priceNumber,
      priceText: primary.priceText,
      oldPriceNumber: primary.oldPriceNumber,
      oldPriceText: primary.oldPriceText,
      image: primary.image || secondary.image,
      href: primary.href || secondary.href,
      detailUrl: primary.detailUrl || secondary.detailUrl,
      featuresText: primary.featuresText || secondary.featuresText || '',
      searchableText: primary.searchableText || secondary.searchableText || '',
      source: primary.source,
      sourcePriority: primary.sourcePriority,
      isActive: primary.isActive,
    };
  };

  const summarizeProductSources = (products = []) => products.reduce((summary, product) => {
    const source = product.source || 'unknown';
    summary[source] = (summary[source] || 0) + 1;
    return summary;
  }, {});

  const getAvailableProductsForChatbot = () => {
    const rawProducts = [];
    try {
      const currentKeys = [
        'currentProducts',
        'anhMinhProducts',
        'siteProducts',
        'loadedProducts',
        'allProducts',
        'filteredProducts',
        'visibleProducts',
        'supabaseProducts',
        'productCache',
        'cachedProducts',
      ];
      rawProducts.push(...readDomProductsForChatbot());

      currentKeys.forEach((key) => {
        if (Array.isArray(window[key])) rawProducts.push(...cloneProductsWithSource(window[key], `window.${key}`, PRODUCT_SOURCE_PRIORITY.live));
      });

      [
        window.AnhMinhStore,
        window.anhMinhStore,
        window.AnhMinhProductsState,
        window.AnhMinhProductStore,
        window.anhMinhProductStore,
        window.AnhMinhSupabase,
        window.anhMinhSupabase,
      ].forEach((state, index) => collectProductArraysFromObject(state, rawProducts, `state${index + 1}`, PRODUCT_SOURCE_PRIORITY.supabase));

    } catch (error) {
      console.warn('[AM AI] Không thể lấy dữ liệu sản phẩm cho chatbot.', error);
      return [];
    }

    const unique = new Map();
    const aliasToPrimaryKey = new Map();
    rawProducts.forEach((item, index) => {
      const product = normalizeProductForChatbot(item, index);
      if (!product.name && !product.model && !product.brand && !product.priceNumber) return;
      const keys = getProductDedupKeys(product).filter(Boolean);
      const existingKey = keys.map((key) => aliasToPrimaryKey.get(key) || (unique.has(key) ? key : '')).find(Boolean);
      const primaryKey = existingKey || keys[0] || `product-${index}`;
      const mergedProduct = existingKey ? mergeChatbotProducts(unique.get(existingKey), product) : product;
      unique.set(primaryKey, mergedProduct);
      keys.forEach((key) => aliasToPrimaryKey.set(key, primaryKey));
    });

    return Array.from(unique.values()).filter((product) => {
      const source = String(product.source || '').toLowerCase();
      if (source.includes('fallback') || source.includes('products.js')) return false;
      if (product.isActive === false || product.isActive === 'false') return false;
      return product.name || product.model || product.priceNumber;
    });
  };

  const getRecommendedRangeForArea = (area, roomType) => {
    if (roomType === 'bedroom' || roomType === 'small') return { min: 32, max: 43, label: '32–43 inch' };
    if (!area) return null;
    if (area <= 20) return { min: 43, max: 43, label: '43 inch' };
    if (area <= 25) return { min: 43, max: 50, label: '43–50 inch' };
    if (area < 30) return { min: 50, max: 55, label: '50–55 inch' };
    if (area <= 40) return { min: 55, max: 65, label: '55–65 inch' };
    return { min: 65, max: 75, label: '65–75 inch' };
  };

  const escapeRegExp = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const textHasAlias = (text = '', alias = '') => {
    const normalizedAlias = normalizeVietnameseText(alias);
    if (!text || !normalizedAlias) return false;
    const compactText = text.replace(/\s+/g, '');
    const compactAlias = normalizedAlias.replace(/\s+/g, '');
    if ((normalizedAlias.includes(' ') || compactAlias.length >= 4 || /\d/.test(compactAlias)) && compactText.includes(compactAlias)) return true;
    return new RegExp(`(^|[^a-z0-9])${escapeRegExp(normalizedAlias)}([^a-z0-9]|$)`).test(text);
  };

  const getSeriesOptionsForBrand = (brand) => {
    if (brand && TV_SERIES_BY_BRAND_CHATBOT[brand]) return TV_SERIES_BY_BRAND_CHATBOT[brand];
    return Object.values(TV_SERIES_BY_BRAND_CHATBOT)
      .flat()
      .filter((series, index, allSeries) => allSeries.findIndex((item) => item.label === series.label) === index);
  };

  const detectTvSeriesFromMessage = (normalizedMessage = '', brand = '') => {
    const message = normalizeVietnameseText(normalizedMessage);
    const options = getSeriesOptionsForBrand(brand)
      .flatMap((series) => series.aliases.map((alias) => ({ ...series, alias: normalizeVietnameseText(alias) })))
      .sort((a, b) => b.alias.length - a.alias.length || b.label.length - a.label.length);
    const match = options.find((series) => textHasAlias(message, series.alias));
    if (!match) return null;
    return {
      series: normalizeVietnameseText(match.label),
      seriesLabel: match.label,
      aliases: getSeriesOptionsForBrand(brand).find((series) => series.label === match.label)?.aliases || [match.alias],
    };
  };

  const productMatchesSeries = (product, need) => {
    if (!need?.seriesLabel) return false;
    const haystack = normalizeVietnameseText([
      product.name,
      product.fullName,
      product.model,
      product.type,
      product.condition,
      product.featuresText,
      product.description,
      product.specifications,
      product.searchableText,
    ].join(' '));
    const aliases = need.seriesAliases?.length
      ? need.seriesAliases
      : getSeriesOptionsForBrand(need.brand).find((series) => series.label === need.seriesLabel)?.aliases || [need.seriesLabel];
    return aliases.some((alias) => textHasAlias(haystack, alias));
  };

  const parseBudgetFromMessage = (message, normalizedMessage) => {
    const need = {};
    const toMillion = (numberText) => Math.round(Number(String(numberText).replace(',', '.')) * 1000000);
    const rangeMatch = normalizedMessage.match(/(?:tu\s*)?(\d+(?:[.,]\d+)?)\s*(?:-|den|toi|–)\s*(\d+(?:[.,]\d+)?)\s*(trieu|tr\b|m\b)?/);
    if (rangeMatch) {
      need.minBudget = toMillion(rangeMatch[1]);
      need.maxBudget = toMillion(rangeMatch[2]);
      need.budgetLabel = `${rangeMatch[1]}–${rangeMatch[2]} triệu`;
      return need;
    }

    const belowMatch = normalizedMessage.match(/(?:duoi|khong qua|toi da|duoi muc|nho hon|be hon)\s*(\d+(?:[.,]\d+)?)\s*(trieu|tr\b|m\b)?|(?:tam|khoang)?\s*(\d+(?:[.,]\d+)?)\s*(trieu|tr\b|m\b)?\s*(?:do lai|tro xuong|tro lai|quay dau)/);
    if (belowMatch) {
      const valueText = belowMatch[1] || belowMatch[3];
      const value = Number(valueText.replace(',', '.'));
      need.maxBudget = toMillion(valueText);
      need.isMaxBudgetStrict = true;
      need.budgetLabel = `dưới ${value} triệu`;
      return need;
    }

    const aroundMatch = normalizedMessage.match(/(?:tam|khoang|khoan|gan|tam gia|ngan sach|muc gia|budget)\s*(\d+(?:[.,]\d+)?)\s*(trieu|tr\b|m\b)/);
    if (aroundMatch) {
      const value = Number(aroundMatch[1].replace(',', '.'));
      need.targetBudget = Math.round(value * 1000000);
      need.minBudget = Math.round(value * 0.85 * 1000000);
      need.maxBudget = Math.round(value * 1.135 * 1000000);
      need.budgetLabel = `tầm ${value} triệu`;
      return need;
    }

    const millionMatch = normalizedMessage.match(/\b(\d+(?:[.,]\d+)?)\s*(trieu|tr\b|m\b)/);
    if (millionMatch) {
      const value = Number(millionMatch[1].replace(',', '.'));
      need.targetBudget = Math.round(value * 1000000);
      need.maxBudget = Math.round(value * 1.125 * 1000000);
      need.budgetLabel = `khoảng ${value} triệu`;
    }

    if (hasAny(normalizedMessage, ['gia re', 're', 'tiết kiệm', 'tiet kiem'])) {
      need.budgetPreference = 'cheap';
      need.budgetLabel = need.budgetLabel || 'ưu tiên giá rẻ';
      need.maxBudget = need.maxBudget || 10000000;
      need.isMaxBudgetStrict = need.isMaxBudgetStrict || !need.targetBudget;
    }
    if (hasAny(normalizedMessage, ['cao cap', 'hang xin', 'premium'])) {
      need.budgetPreference = 'premium';
      need.budgetLabel = need.budgetLabel || 'ưu tiên cao cấp';
    }
    return need;
  };

  const parseTvCustomerNeed = (message = '') => {
    const originalMessage = String(message || '');
    const normalizedMessage = normalizeVietnameseText(originalMessage);
    const need = {
      originalMessage,
      normalizedMessage,
      usage: [],
      preferences: [],
      requestedSize: null,
      recommendedRange: null,
      hasBuyingIntent: false,
      isVagueAdvice: false,
    };

    need.hasBuyingIntent = RECOMMENDATION_INTENT_KEYWORDS.some((keyword) => normalizedMessage.includes(normalizeVietnameseText(keyword)));
    const brand = TV_BRANDS.find((item) => normalizedMessage.includes(item));
    if (brand) need.brand = TV_BRAND_LABELS[brand];

    const detectedSeries = detectTvSeriesFromMessage(normalizedMessage, need.brand);
    if (detectedSeries) {
      need.series = detectedSeries.series;
      need.seriesLabel = detectedSeries.seriesLabel;
      need.seriesAliases = detectedSeries.aliases;
    }

    const areaMatch = normalizedMessage.match(/\b(\d{1,2})\s*(m2|m\s*2|met vuong|mét vuông)\b/);
    if (areaMatch) need.roomArea = Number(areaMatch[1]);
    if (hasAny(normalizedMessage, ['phong ngu'])) {
      need.roomType = 'bedroom';
      need.usage.push('bedroom');
    }
    if (hasAny(normalizedMessage, ['phong khach'])) {
      need.roomType = 'livingroom';
      need.usage.push('livingroom');
    }
    if (hasAny(normalizedMessage, ['phong nho'])) need.roomType = 'small';
    if (hasAny(normalizedMessage, ['phong rong', 'phong lon'])) need.roomType = 'large';
    need.recommendedRange = getRecommendedRangeForArea(need.roomArea, need.roomType);
    if (!need.recommendedRange && need.roomType === 'livingroom') need.recommendedRange = { min: 55, max: 65, label: '55–65 inch' };
    if (need.roomType === 'large' && !need.roomArea) need.recommendedRange = { min: 65, max: 75, label: '65–75 inch' };

    const sizeMatch = normalizedMessage.match(/\b(32|40|42|43|49|50|55|58|60|65|70|75|77|85|86|98)\s*(inch|in|inh|\")?\b/);
    if (sizeMatch) need.requestedSize = Number(sizeMatch[1]);

    Object.assign(need, parseBudgetFromMessage(originalMessage, normalizedMessage));

    if (hasAny(normalizedMessage, ['tivi moi', 'tv moi', 'hang moi', 'moi 100%', 'chinh hang'])) need.type = 'Tivi mới';
    if (hasAny(normalizedMessage, ['tivi cu', 'tv cu', 'da qua su dung', 'second hand'])) need.type = 'Tivi cũ';

    if (hasAny(normalizedMessage, ['xem phim', 'netflix'])) need.usage.push('movies');
    if (hasAny(normalizedMessage, ['bong da', 'world cup', 'the thao'])) need.usage.push('sports');
    if (hasAny(normalizedMessage, ['choi game', 'gaming', 'game'])) need.usage.push('gaming');
    if (hasAny(normalizedMessage, ['nguoi lon tuoi'])) need.usage.push('elderly');
    if (hasAny(normalizedMessage, ['youtube'])) need.usage.push('youtube');
    if (hasAny(normalizedMessage, ['hoc online'])) need.usage.push('learning');
    if (hasAny(normalizedMessage, ['karaoke'])) need.usage.push('karaoke');

    ['qled', 'oled', 'mini led', '4k', 'google tv', 'android tv', 'tizen', 'webos', 'am thanh tot', 'hinh anh dep', 'tiet kiem dien', 'bao hanh lau'].forEach((preference) => {
      if (normalizedMessage.includes(preference)) need.preferences.push(preference);
    });
    if (hasAny(normalizedMessage, ['gia re', 're'])) need.usage.push('cheap');
    if (hasAny(normalizedMessage, ['cao cap'])) need.usage.push('premium');

    const meaningfulSignals = [need.brand, need.seriesLabel, need.requestedSize, need.roomArea, need.roomType, need.minBudget, need.maxBudget, need.targetBudget, need.type, ...need.usage, ...need.preferences].filter(Boolean).length;
    const broadBuyingRequest = hasAny(normalizedMessage, [
      'tu van tivi', 'tu van chon tivi', 'chon tivi', 'tu van mua tivi', 'tu van mua tv',
      'shop tu van tivi', 'can mua tivi', 'can mua tv', 'minh can mua tivi', 'toi muon mua tivi',
      'muon mua tivi', 'mua tivi', 'mua tv',
    ]);
    need.isVagueAdvice = need.hasBuyingIntent && meaningfulSignals === 0 && broadBuyingRequest;
    return need;
  };

  const hasAny = (text, keywords) => keywords.some((keyword) => text.includes(normalizeText(keyword)));

  const productMatchesType = (product, type) => {
    if (!type) return false;
    const haystack = normalizeVietnameseText([product.type, product.condition, product.searchableText].join(' '));
    if (type === 'Tivi mới') return /\b(tivi moi|tv moi|hang moi|moi 100|chinh hang|moi)\b/.test(haystack);
    if (type === 'Tivi cũ') return /\b(tivi cu|tv cu|da qua su dung|second hand|cu)\b/.test(haystack);
    return false;
  };

  const scoreProductForNeed = (product, need) => {
    let score = 0;
    const reasons = [];
    const haystack = product.searchableText || normalizeVietnameseText(JSON.stringify(product));
    const size = product.sizeNumber || parseSizeToNumber([product.size, product.name, product.model].join(' '));
    const price = product.priceNumber;

    if (need.brand && haystack.includes(normalizeVietnameseText(need.brand))) {
      score += 35;
      reasons.push(`đúng hãng ${need.brand}`);
    }

    if (need.seriesLabel) {
      if (productMatchesSeries(product, need)) {
        score += 35;
        reasons.push(`đúng dòng ${need.seriesLabel}`);
      } else {
        score -= 20;
      }
    }

    if (need.type) {
      if (productMatchesType(product, need.type)) {
        score += 35;
        reasons.push(`phù hợp nhu cầu ${need.type.toLowerCase()}`);
      } else if (product.type || product.condition) {
        score -= 40;
      }
    }

    if (need.requestedSize && size) {
      const diff = Math.abs(size - need.requestedSize);
      if (diff === 0) {
        score += 35;
        reasons.push(`đúng kích thước ${need.requestedSize} inch`);
      } else if (diff <= 5) {
        score += 10;
        reasons.push(`kích thước gần ${need.requestedSize} inch`);
      }
    } else if (need.recommendedRange && size) {
      if (size >= need.recommendedRange.min && size <= need.recommendedRange.max) {
        score += 25;
        reasons.push(`nằm trong gợi ý ${need.recommendedRange.label}`);
      } else if (Math.abs(size - need.recommendedRange.min) <= 5 || Math.abs(size - need.recommendedRange.max) <= 5) {
        score += 10;
        reasons.push(`kích thước gần khoảng ${need.recommendedRange.label}`);
      }
    }

    if ((need.minBudget || need.maxBudget || need.targetBudget || need.budgetPreference === 'cheap') && price) {
      const min = need.minBudget || 0;
      const max = need.maxBudget || need.targetBudget || Infinity;
      if (price >= min && price <= max) {
        score += 50;
        if (need.maxBudget) {
          reasons.push(`Giá hiện tại dưới ${Math.round(need.maxBudget / 1000000)} triệu.`);
        } else {
          reasons.push(`giá phù hợp ${need.budgetLabel || 'ngân sách'}`);
        }
      } else if (!need.isMaxBudgetStrict && Number.isFinite(max) && price > max && price <= max * 1.1) {
        score += 15;
        reasons.push('giá chỉ nhỉnh hơn ngân sách khoảng 10%');
      } else if (price < min) {
        score += 15;
        reasons.push('giá thấp hơn ngân sách dự kiến');
      } else if (Number.isFinite(max) && price > max * 1.1) {
        score -= 50;
      }
      if (need.budgetPreference === 'cheap' && price <= 10000000) score += 10;
    }

    if (need.usage.includes('movies') || need.usage.includes('sports')) {
      if (/4k|qled|oled|mini led|hdr|motion/.test(haystack)) {
        score += 10;
        reasons.push(need.usage.includes('sports') ? 'hợp xem bóng đá/thể thao' : 'hợp xem phim');
      }
    }
    if (need.usage.includes('gaming') && /120hz|144hz|game mode|allm|freesync|hdmi 2\.1|hdmi2\.1/.test(haystack)) {
      score += 10;
      reasons.push('có điểm mạnh cho chơi game');
    }
    if (need.usage.includes('bedroom') && size >= 32 && size <= 43) {
      score += 10;
      reasons.push('gọn cho phòng ngủ');
    }
    if (need.usage.includes('livingroom') && size >= 55) {
      score += 10;
      reasons.push('màn hình lớn cho phòng khách');
    }
    if (need.usage.includes('cheap') && (productMatchesType(product, 'Tivi cũ') || (price && price <= 10000000))) {
      score += 10;
      reasons.push('ưu tiên tiết kiệm chi phí');
    }
    if (need.usage.includes('premium') && (/qled|oled|mini led|neo qled|sony|samsung/.test(haystack))) {
      score += 10;
      reasons.push('thiên về phân khúc cao cấp');
    }
    need.preferences.forEach((preference) => {
      if (haystack.includes(preference)) {
        score += 8;
        reasons.push(`có ${preference.toUpperCase()}`);
      }
    });
    if (need.preferences.includes('am thanh tot') && /dolby|sound|loa|am thanh/.test(haystack)) {
      score += 8;
      reasons.push('có điểm mạnh về âm thanh');
    }
    if (need.preferences.includes('hinh anh dep') && /4k|qled|oled|mini led|hdr|quantum|triluminos/.test(haystack)) {
      score += 8;
      reasons.push('hình ảnh đẹp trong tầm giá');
    }
    if (need.preferences.includes('bao hanh lau') && product.warranty) {
      score += 8;
      reasons.push('có thông tin bảo hành rõ');
    }

    if (product.isFeatured) score += 5;
    if (product.warranty) score += 5;
    if (!need.brand && !need.type && !need.requestedSize && !need.recommendedRange && !need.maxBudget && !need.usage.length && product.isFeatured) {
      score += 10;
      reasons.push('sản phẩm nổi bật trên website');
    }

    return { product, score, reasons: Array.from(new Set(reasons)).slice(0, 3) };
  };

  const buildUnderstandingText = (need) => {
    const filterParts = [];
    if (need.brand) filterParts.push(need.brand);
    if (need.seriesLabel) filterParts.push(`dòng ${need.seriesLabel}`);
    if (need.requestedSize) filterParts.push(`khoảng ${need.requestedSize} inch`);
    if (need.budgetLabel) filterParts.push(`ngân sách ${need.budgetLabel}`);
    if (need.type) filterParts.push(need.type.toLowerCase());
    if (filterParts.length) return `Dạ, mình sẽ lọc theo ${filterParts.join(', ')}.`;

    const parts = [];
    if (need.roomType === 'bedroom') parts.push('phòng ngủ');
    if (need.roomType === 'livingroom') parts.push('phòng khách');
    if (need.roomArea) parts.push(`khoảng ${need.roomArea}m²`);
    if (need.recommendedRange) parts.push(`kích thước gợi ý ${need.recommendedRange.label}`);
    if (!parts.length) return 'Dạ, mình đã hiểu bạn đang cần tư vấn chọn tivi phù hợp.';
    return `Dạ, mình hiểu bạn đang tìm tivi cho ${parts.join(', ')}.`;
  };

  const buildRecommendationSummary = (need, hasStrongMatch) => {
    if (need.brand && need.seriesLabel && !need.requestedSize && !need.budgetLabel) return `Dạ, mình sẽ ưu tiên ${need.brand} ${need.seriesLabel} trong dữ liệu sản phẩm đang có.`;
    if (need.budgetLabel && !need.brand && !need.seriesLabel && !need.requestedSize && !need.recommendedRange && !need.type) return `${need.budgetLabel.charAt(0).toUpperCase()}${need.budgetLabel.slice(1)} thì hiện trên web mình có vài mẫu phù hợp. Mình gợi ý bạn xem trước các mẫu này:`;
    if (need.recommendedRange) return `Dựa trên nhu cầu này, mình gợi ý ưu tiên tivi ${need.recommendedRange.label} để xem cân đối với không gian.`;
    if (need.seriesLabel && !need.brand) return `Mình sẽ ưu tiên dòng ${need.seriesLabel} trong dữ liệu sản phẩm đang có.`;
    if (need.requestedSize) return `Mình sẽ ưu tiên các mẫu ${need.requestedSize} inch đang có trong dữ liệu sản phẩm của Anh Minh Store.`;
    if (need.usage.includes('sports')) return 'Với nhu cầu xem bóng đá/World Cup, mình ưu tiên tivi màn hình lớn, 4K và có công nghệ chuyển động tốt.';
    if (need.usage.includes('movies')) return 'Với nhu cầu xem phim, mình ưu tiên tivi 4K, QLED/OLED/Mini LED hoặc mẫu có HDR khi dữ liệu sản phẩm có thông tin này.';
    if (need.usage.includes('cheap')) return 'Với nhu cầu giá rẻ, mình ưu tiên mẫu có giá thấp hơn hoặc tivi cũ đã kiểm tra.';
    if (!hasStrongMatch) return 'Dữ liệu hiện có chưa khớp thật mạnh, nên mình hiển thị các mẫu gần nhất để bạn tham khảo thêm.';
    return 'Trong dữ liệu hiện có trên website, các mẫu phù hợp nhất là:';
  };

  const debugChatbotRecommendations = (sourceSummary, products, need, recommendations) => {
    const ua43u8500f = products.find((product) => normalizeVietnameseText(product.model).replace(/\s+/g, '') === 'ua43u8500f');
    console.debug('[AM AI] product sources', { ...sourceSummary, UA43U8500F: ua43u8500f ? { source: ua43u8500f.source, priceNumber: ua43u8500f.priceNumber, priceText: ua43u8500f.priceText, oldPriceText: ua43u8500f.oldPriceText } : null });
    console.debug('[AM AI] normalized final products', products);
    console.debug('[AM AI] parsed need', need);
    console.debug('[AM AI] recommendations', recommendations);
  };

  const getProductRecommendationKey = (product = {}) => {
    const id = normalizeVietnameseText(product.id || '');
    const model = normalizeVietnameseText(product.model || '').replace(/\s+/g, '');
    const name = normalizeVietnameseText(product.name || product.fullName || '').replace(/\s+/g, '');
    return id || model || name;
  };

  const productMatchesExplicitNeed = (product, need = {}) => {
    const haystack = product.searchableText || normalizeVietnameseText(JSON.stringify(product));
    if (need.brand && !haystack.includes(normalizeVietnameseText(need.brand))) return false;
    if (need.seriesLabel && !productMatchesSeries(product, need)) return false;
    if (need.requestedSize) {
      const size = product.sizeNumber || parseSizeToNumber([product.size, product.name, product.model].join(' '));
      if (size !== need.requestedSize) return false;
    }
    return true;
  };

  const selectBalancedBudgetRecommendations = (scoredProducts = [], need = {}) => {
    const hasBudgetSignal = Boolean(need.maxBudget || need.targetBudget || need.budgetLabel);
    const obeysStrictBudget = (item) => !need.isMaxBudgetStrict || !need.maxBudget || (item.product.priceNumber && item.product.priceNumber <= need.maxBudget);
    const candidates = scoredProducts.filter(obeysStrictBudget);
    const selected = [];
    const selectedKeys = new Set();
    const addItem = (item) => {
      if (!item || selected.length >= 3) return false;
      const key = getProductRecommendationKey(item.product);
      if (key && selectedKeys.has(key)) return false;
      selected.push(item);
      if (key) selectedKeys.add(key);
      return true;
    };
    const addFrom = (items, limit) => {
      let added = 0;
      items.some((item) => {
        if (added >= limit || selected.length >= 3) return true;
        if (addItem(item)) added += 1;
        return false;
      });
    };

    if (need.type) {
      const preferredTypeMatches = candidates.filter((item) => productMatchesType(item.product, need.type));
      preferredTypeMatches.forEach(addItem);
      candidates.forEach(addItem);
      return selected.slice(0, 3);
    }

    if (hasBudgetSignal) {
      const newTvMatches = candidates.filter((item) => productMatchesType(item.product, 'Tivi mới'));
      const oldTvMatches = candidates.filter((item) => productMatchesType(item.product, 'Tivi cũ'));
      addFrom(newTvMatches, 2);
      addFrom(oldTvMatches, 1);
      candidates.forEach(addItem);
      return selected.slice(0, 3);
    }

    return candidates.slice(0, 3);
  };

  const recommendProductsForMessage = (message = '') => {
    const need = parseTvCustomerNeed(message);
    if (!need.hasBuyingIntent) return null;

    if (need.isVagueAdvice) {
      return {
        text: 'Dạ được ạ 😊 Bạn cho AM AI xin thêm ngân sách khoảng bao nhiêu, kích thước mong muốn và bạn muốn tivi mới hay tivi cũ để mình gợi ý sát hơn nha.',
        actions: [callAction(), zaloAction()],
        quickReplies: SMART_RECOMMENDER_QUICK_REPLIES,
        products: [],
      };
    }

    const products = getAvailableProductsForChatbot();
    const sourceSummary = summarizeProductSources(products);
    if (!products.length) {
      debugChatbotRecommendations(sourceSummary, products, need, []);
      return getNoMatchingProductsReply();
    }

    const eligibleProducts = products.filter((product) => {
      if (need.isMaxBudgetStrict && need.maxBudget && (!product.priceNumber || product.priceNumber > need.maxBudget)) return false;
      if (need.type && !productMatchesType(product, need.type)) return false;
      return true;
    });

    if (need.isMaxBudgetStrict && need.maxBudget && !eligibleProducts.length) {
      const emptyRecommendations = [];
      debugChatbotRecommendations(sourceSummary, products, need, emptyRecommendations);
      return getNoMatchingProductsReply();
    }

    const scored = eligibleProducts
      .map((product) => scoreProductForNeed(product, need))
      .sort((a, b) => b.score - a.score);
    const explicitMatches = scored.filter((item) => productMatchesExplicitNeed(item.product, need));
    const scoredMatches = (need.brand || need.seriesLabel || need.requestedSize) ? explicitMatches : scored;
    const strongMatches = scoredMatches.filter((item) => item.score >= 25);
    const positiveMatches = strongMatches.length ? strongMatches : scoredMatches.filter((item) => item.score > 0);
    const selected = selectBalancedBudgetRecommendations(positiveMatches, need);

    if (!selected.length) {
      debugChatbotRecommendations(sourceSummary, products, need, []);
      return getNoMatchingProductsReply();
    }

    const recommendedProducts = selected.map((item) => ({
      ...item.product,
      reason: item.reasons.length ? item.reasons.join(', ') : 'phù hợp nhất theo dữ liệu hiện có',
      score: item.score,
    }));
    debugChatbotRecommendations(sourceSummary, products, need, recommendedProducts);
    const intro = buildUnderstandingText(need);
    const summary = buildRecommendationSummary(need, strongMatches.length > 0);
    const budgetMixText = need.budgetLabel && !need.type && !need.brand && !need.seriesLabel && !need.requestedSize
      ? `Dạ, với ngân sách ${need.budgetLabel}, AM AI gợi ý 3 mẫu trong tầm giá: ưu tiên 2 tivi mới và 1 tivi cũ để bạn dễ so sánh.`
      : '';
    const detailHint = strongMatches.length
      ? 'Bạn có thể bấm “Xem chi tiết” để xem hình ảnh, thông số và đặt hàng.'
      : 'Các mẫu này là lựa chọn gần nhất; nếu muốn chắc hơn, bạn có thể gọi hoặc nhắn Zalo để cửa hàng kiểm tra tồn kho và tư vấn nhanh.';

    return {
      text: budgetMixText || `${intro}\n${summary}\nTrong dữ liệu hiện có của Anh Minh Store, mình gợi ý 3 mẫu sau:\n${detailHint}`,
      actions: [callAction(), zaloAction()],
      products: recommendedProducts,
    };
  };

  const findMatchingProducts = (message = '') => {
    const normalizedMessage = normalizeText(message);
    const products = getAvailableProductsForChatbot();
    if (!normalizedMessage || !products.length) return [];

    const words = normalizedMessage.split(' ').filter((word) => word.length >= 2);
    const brandHits = TV_BRANDS.filter((brand) => normalizedMessage.includes(brand));
    const sizeHits = normalizedMessage.match(/\b\d{2}\s*(inch|in|inh|")?\b/g) || [];
    const typeHits = ['tivi moi', 'tv moi', 'hang moi', 'tivi cu', 'tv cu', 'second hand'].filter((type) => normalizedMessage.includes(type));

    const scored = products.map((product) => {
      const haystack = product.searchableText;
      const haystackCompact = haystack.replace(/\s+/g, '');
      let score = 0;
      brandHits.forEach((brand) => { if (haystack.includes(brand)) score += 5; });
      sizeHits.forEach((size) => { if (haystackCompact.includes(normalizeText(size).replace(/\s+/g, ''))) score += 3; });
      typeHits.forEach((type) => { if (haystack.includes(type)) score += 3; });
      words.forEach((word) => { if (haystack.includes(word)) score += word.length > 3 ? 1 : 0.4; });
      const normalizedModel = normalizeText(product.model).replace(/\s+/g, '');
      const normalizedMessageCompact = normalizedMessage.replace(/\s+/g, '');
      if (normalizedModel && (normalizedMessageCompact.includes(normalizedModel) || normalizedModel.includes(normalizedMessageCompact))) score += 8;
      return { product, score };
    }).filter((item) => item.score >= 3);

    return scored.sort((a, b) => b.score - a.score).slice(0, 3).map((item) => item.product);
  };

  const getBrandReply = (normalizedMessage) => {
    const brandReplies = {
      samsung: 'Samsung thường mạnh về giao diện thông minh, màu sắc rực rỡ, nhiều mẫu 4K/QLED và tính năng kết nối tiện ích. Nếu bạn thích hình ảnh sáng, màu nổi và hệ sinh thái thông minh thì Samsung là lựa chọn dễ dùng.',
      lg: 'LG thường được đánh giá cao ở hệ điều hành webOS dễ dùng, màu sắc tự nhiên và nhiều lựa chọn từ LED đến OLED. Nếu bạn thích giao diện mượt và xem phim nhiều, LG là lựa chọn đáng cân nhắc.',
      sony: 'Sony thường nổi bật về xử lý hình ảnh tự nhiên, độ nét và trải nghiệm xem phim/thể thao. Nếu bạn ưu tiên chất lượng hình ảnh và âm thanh cân bằng, Sony là lựa chọn cao cấp hơn.',
    };
    const matchedBrand = TV_BRANDS.find((brand) => normalizedMessage.includes(brand));
    if (!matchedBrand) return null;
    return brandReplies[matchedBrand] || 'Thương hiệu này có nhiều mẫu tivi theo từng phân khúc. Bạn có thể lọc theo hãng trên website hoặc gửi model cụ thể để mình hỗ trợ tốt hơn.';
  };

  const formatProductText = (products) => products.map((product, index) => {
    const name = product.name || product.fullName || product.model || 'Sản phẩm tivi';
    const model = product.model ? ` – Model ${product.model}` : '';
    const price = product.priceText ? ` – Giá: ${product.priceText}` : '';
    return `${index + 1}. ${name}${model}${price}`;
  }).join('\n');

  const isMainlyGreeting = (normalizedMessage = '') => {
    const compactMessage = normalizedMessage.replace(/[!?.。]+/g, '').trim();
    return /^(xin chao|chao|hello|hi|alo|chao shop|shop oi|em oi|anh oi)(?:\s+(shop|am ai|anh minh|ban|nha|a|ạ))*$/.test(compactMessage);
  };

  const isMainlyThanks = (normalizedMessage = '') => {
    const compactMessage = normalizedMessage.replace(/[!?.。]+/g, '').trim();
    return /^(ok\s*)?(cam on|thank you|thanks|thank)(\s+(shop|ban|em|anh|am ai|nha|nhe|a|ạ))*$/.test(compactMessage);
  };

  const getConversationIntent = (normalizedMessage = '') => {
    if (!normalizedMessage) return null;
    const hasPurchaseSignal = RECOMMENDATION_INTENT_KEYWORDS.some((keyword) => normalizedMessage.includes(normalizeVietnameseText(keyword)))
      || /\b\d+(?:[.,]\d+)?\s*(trieu|tr\b|m\b)/.test(normalizedMessage);
    if (hasPurchaseSignal) return null;

    const compactMessage = normalizedMessage.replace(/[!?.。]+/g, '').trim();
    if (isMainlyGreeting(normalizedMessage)) {
      return {
        text: 'Dạ AM AI chào bạn 👋 Bạn đang cần mua tivi mới, tivi cũ hay muốn tư vấn theo ngân sách ạ?',
        actions: [newTvAction(), oldTvAction(), zaloAction()],
        products: [],
      };
    }

    if (isMainlyThanks(normalizedMessage)) {
      return {
        text: 'Dạ AM AI cảm ơn bạn ạ 😊 Khi cần xem giá, chọn tivi theo ngân sách hoặc hỏi về thu cũ đổi mới/sửa tivi, bạn cứ nhắn mình nha.',
        actions: [callAction(), zaloAction()],
        products: [],
      };
    }

    if (/^(ok|oke|okay|tam biet|bye|goodbye)(\s+(shop|ban|em|anh|nha|nhe|a|ạ))*$/.test(compactMessage)) {
      return {
        text: 'Dạ vâng ạ. Khi cần tư vấn thêm về tivi, bạn cứ nhắn AM AI nha.',
        actions: [callAction(), zaloAction()],
        products: [],
      };
    }

    return null;
  };

  const getRoomSizeProducts = (normalizedMessage = '') => {
    const need = parseTvCustomerNeed(normalizedMessage);
    const range = need.recommendedRange || getRecommendedRangeForArea(need.roomArea, need.roomType);
    if (!range) return [];
    return getAvailableProductsForChatbot()
      .filter((product) => product.sizeNumber && product.sizeNumber >= range.min && product.sizeNumber <= range.max)
      .slice(0, 3)
      .map((product) => ({ ...product, reason: `phù hợp khoảng ${range.label}` }));
  };

  const getNoMatchingProductsReply = () => ({
    text: 'Hiện AM AI chưa thấy mẫu phù hợp chính xác trong dữ liệu đang có ạ. Bạn có thể tăng/giảm ngân sách, đổi kích thước, hoặc nhắn Zalo để cửa hàng kiểm tra thêm mẫu mới về nha.',
    actions: [zaloAction(), callAction(), featuredAction()],
    products: [],
  });

  const getSupportIntentReply = (normalizedMessage = '') => {
    if (!normalizedMessage) return null;

    if (hasAny(normalizedMessage, [
      'con hang khong', 'con mau nay khong', 'mau nay con khong', 'co san khong', 'con con nay khong',
      'con 55 inch khong', 'con khong shop',
    ]) || /\bcon\s+(32|40|42|43|49|50|55|58|60|65|70|75|77|85|86|98)\s*(inch|in|inh)?\s*khong\b/.test(normalizedMessage)) {
      return {
        id: 'availability',
        text: 'Dạ sản phẩm trên web là dữ liệu đang được cập nhật ạ. Để chắc chắn mẫu còn hàng tại kho, bạn gửi model hoặc bấm xem chi tiết rồi nhắn Zalo/gọi hotline để Anh Minh Store kiểm tra nhanh và chính xác nhất nha.',
        actions: [zaloAction(), callAction(), featuredAction()],
        products: [],
      };
    }

    if (hasAny(normalizedMessage, ['tra gop', 'co tra gop khong', 'mua gop', 'gop duoc khong', 'tra truoc bao nhieu'])) {
      return {
        id: 'installment',
        text: 'Dạ Anh Minh Store có hỗ trợ tư vấn trả góp tuỳ sản phẩm và chương trình ạ. Bạn gửi mẫu tivi đang quan tâm hoặc ngân sách dự kiến, bên em sẽ kiểm tra phương án phù hợp cho mình nha.',
        actions: [zaloAction(), callAction()],
        products: [],
      };
    }

    if (hasAny(normalizedMessage, ['giao hang', 'giao tan noi', 'ship khong', 'co ship khong', 'co lap dat khong', 'treo tuong', 'lap gia treo', 'giao trong ngay khong'])) {
      return {
        id: 'delivery',
        text: 'Dạ bên em có hỗ trợ giao hàng và tư vấn lắp đặt tại Đà Nẵng ạ. Nếu cần treo tường hoặc lắp giá treo, bạn cho biết kích thước tivi và khu vực giao để cửa hàng báo hỗ trợ cụ thể nha.',
        actions: [callAction(), zaloAction()],
        products: [],
      };
    }

    if (hasAny(normalizedMessage, ['phong 20m2', 'phong 25m2', 'phong 30m2', 'phong 40m2', 'phong ngu nen dung tivi gi', 'phong khach nen mua may inch', 'may inch la vua', 'bao nhieu inch'])
      || /\bphong\s*\d{1,2}\s*(m2|m\s*2|met vuong)\b/.test(normalizedMessage)) {
      return {
        id: 'room-size',
        text: 'Dạ nếu phòng ngủ/phòng nhỏ thì mình nên ưu tiên 32–43 inch. Phòng khoảng 20–25m² có thể chọn 43–50 inch. Phòng 30–40m² nên chọn 55–65 inch để xem đã hơn, còn phòng rộng có thể lên 65–75 inch. Bạn cho AM AI biết thêm ngân sách để mình gợi ý mẫu phù hợp hơn nha.',
        actions: [newTvAction(), oldTvAction(), zaloAction()],
        products: getRoomSizeProducts(normalizedMessage),
      };
    }

    if (hasAny(normalizedMessage, ['tivi cu co tot khong', 'tivi cu co on khong', 'co nen mua tivi cu khong', 'tivi qua su dung co ben khong', 'mua tivi cu so hu'])) {
      return {
        id: 'old-tv-confidence',
        text: 'Dạ tivi cũ phù hợp khi mình muốn tiết kiệm chi phí ạ. Bên em ưu tiên tư vấn máy đã kiểm tra tình trạng, thông tin bảo hành rõ theo từng sản phẩm. Khi xem tivi cũ, bạn nên kiểm tra kỹ ảnh thực tế, model, tình trạng màn hình và thời gian bảo hành trước khi chốt nha.',
        actions: [oldTvAction(), zaloAction(), callAction()],
        products: [],
      };
    }

    if (hasAny(normalizedMessage, ['tivi khong len nguon', 'mat hinh', 'co tieng khong hinh', 'mat tieng', 'man hinh soc', 'be man', 'loi man', 'den nen', 'bo nguon', 'main', 'sua tivi'])) {
      return {
        id: 'repair',
        text: 'Dạ bên em có hỗ trợ kiểm tra và sửa tivi tại Đà Nẵng ạ. Bạn gửi giúp em 3 thông tin: hãng/model tivi, kích thước màn hình và ảnh hoặc video lỗi hiện tại. Kỹ thuật bên em sẽ tư vấn hướng xử lý rõ hơn qua Zalo hoặc hotline nha.',
        actions: [zaloAction(), callAction()],
        products: [],
      };
    }

    if (hasAny(normalizedMessage, ['mua sao', 'dat hang sao', 'dat tivi', 'chot don', 'giu hang', 'giu mau nay', 'minh muon mua', 'mua ngay'])) {
      return {
        id: 'order',
        text: 'Dạ bạn có thể bấm ‘Đặt hàng ngay’ ở trang sản phẩm, nhập họ tên và số điện thoại. Anh Minh Store sẽ liên hệ xác nhận lại mẫu, giá, bảo hành và thời gian giao trước khi chốt đơn ạ.',
        actions: [callAction(), zaloAction(), featuredAction()],
        products: [],
      };
    }

    if (hasAny(normalizedMessage, ['so dien thoai', 'hotline', 'lien he', 'goi tu van', 'tu van lai', 'cho minh so', 'dia chi', 'cua hang o dau'])) {
      return {
        id: 'contact',
        text: 'Dạ bạn có thể liên hệ Anh Minh Store qua hotline 0905111223 - 0774111223 ạ. Cơ sở 1: 100 Tiểu La, Hải Châu, Đà Nẵng. Cơ sở 2: 540B Nguyễn Hữu Thọ, Cẩm Lệ, Đà Nẵng.',
        actions: [callAction(), zaloAction()],
        products: [],
      };
    }

    if (hasAny(normalizedMessage, ['dat qua', 'mac qua', 'gia cao qua', 'co giam khong', 'bot duoc khong', 'giam gia khong', 'co khuyen mai khong', 'co qua tang khong', 'gia tot hon duoc khong', 'fix gia khong'])) {
      return {
        id: 'price-objection',
        text: 'Dạ em hiểu ạ 😊 Giá bên em đi kèm kiểm tra máy kỹ, tư vấn lắp đặt rõ ràng và hỗ trợ sau bán. Tuỳ sản phẩm hoặc chương trình, Anh Minh Store có thể hỗ trợ thêm quà tặng như remote, giá treo hoặc ưu đãi lắp đặt. Bạn gửi model hoặc ngân sách mong muốn, AM AI sẽ gợi ý mẫu hợp hơn ạ.',
        actions: [zaloAction(), callAction(), featuredAction()],
        products: [],
      };
    }

    if (hasAny(normalizedMessage, ['bao hanh', 'bao hanh bao lau', 'tivi moi bao hanh', 'san pham qua sua chua bao hanh', 'qua sua chua bao hanh may thang'])) {
      return {
        id: 'warranty',
        text: 'Dạ chính sách bảo hành bên em như sau ạ: sản phẩm tivi mới bảo hành 2 năm. Sản phẩm đã qua sửa chữa bảo hành 6 tháng. Riêng tivi cũ/đã qua sử dụng có thể tuỳ tình trạng máy và thông tin từng sản phẩm, bạn gửi model hoặc bấm xem chi tiết để AM AI hỗ trợ kiểm tra rõ hơn nha.',
        actions: [featuredAction(), zaloAction(), callAction()],
        products: [],
      };
    }

    return null;
  };

  const hasClearIntent = (message = '') => Boolean(getSupportIntentReply(normalizeText(message)));

  const hasStrongProductRecommendationIntent = (message = '') => {
    const need = parseTvCustomerNeed(message);
    const hasBudget = Boolean(need.minBudget || need.maxBudget || need.targetBudget);
    const hasSpecificProductFilter = Boolean(need.brand || need.seriesLabel || need.type || hasBudget);
    return Boolean(hasSpecificProductFilter || (need.requestedSize && hasBudget) || need.roomArea || need.roomType);
  };

  const getBotReply = (message) => {
    const normalizedMessage = normalizeText(message);
    const supportIntentReply = getSupportIntentReply(normalizedMessage);
    const strongProductIntent = hasStrongProductRecommendationIntent(message);

    if (supportIntentReply && (supportIntentReply.id === 'room-size' || !strongProductIntent)) return supportIntentReply;

    const recommendationReply = recommendProductsForMessage(message);
    if (recommendationReply) {
      if (supportIntentReply?.id === 'availability' && recommendationReply.products?.length) {
        return {
          ...recommendationReply,
          text: `${recommendationReply.text}
Dạ để chắc chắn mẫu còn hàng tại kho, bạn bấm xem chi tiết rồi nhắn Zalo/gọi hotline để Anh Minh Store kiểm tra nhanh nha.`,
          actions: [featuredAction(), zaloAction(), callAction()],
        };
      }
      return recommendationReply;
    }

    const conversationReply = getConversationIntent(normalizedMessage);
    if (conversationReply) return conversationReply;
    if (supportIntentReply) return supportIntentReply;

    const isPriceObjection = hasAny(normalizedMessage, [
      'đắt quá',
      'mắc quá',
      'giá cao quá',
      'có giảm không',
      'bớt được không',
      'giảm giá không',
      'có khuyến mãi không',
      'có quà tặng không',
      'giá tốt hơn được không',
    ]);
    if (isPriceObjection) {
      return {
        text: 'Dạ em hiểu ạ 😊 Giá bên em đi kèm kiểm tra máy kỹ, tư vấn lắp đặt rõ ràng và hỗ trợ sau bán. Tuỳ sản phẩm/chương trình, Anh Minh Store có thể hỗ trợ thêm quà tặng như remote, giá treo hoặc ưu đãi lắp đặt. Bạn gửi model hoặc ngân sách mong muốn, AM AI sẽ gợi ý mẫu hợp hơn ạ.',
        actions: [zaloAction(), callAction(), featuredAction()],
        products: [],
      };
    }

    const matchedProducts = findMatchingProducts(message);
    const likelyProductSearch = /\d{2}|qled|oled|mini led|4k|smart|model|gia|inch|inh|ua|qa|kd|tcl|sony|samsung|lg/i.test(message);

    if (matchedProducts.length && likelyProductSearch) {
      return {
        text: `Mình tìm thấy vài sản phẩm phù hợp:\n\n${formatProductText(matchedProducts)}\n\nBạn có thể bấm xem chi tiết để kiểm tra hình ảnh, bảo hành và đặt hàng.`,
        actions: [featuredAction(), zaloAction()],
        products: matchedProducts.map((product) => ({ ...product, reason: 'khớp với từ khóa bạn vừa hỏi' })),
      };
    }

    if (hasAny(normalizedMessage, ['tivi mới', 'tv mới', 'hàng mới', 'chính hãng', 'mới 100%'])) {
      return { text: 'Dạ, Anh Minh Store có các mẫu tivi mới chính hãng. Bạn có thể xem mục Tivi mới để lọc theo hãng, kích thước và giá. Nếu cần tư vấn nhanh, bạn có thể gửi ngân sách và kích thước mong muốn.', actions: [newTvAction(), zaloAction()], products: [] };
    }

    if (hasAny(normalizedMessage, ['tivi cũ', 'tv cũ', 'đã qua sử dụng', 'second hand'])) {
      return { text: 'Dạ, Anh Minh Store có tivi cũ đã qua sử dụng, phù hợp nếu bạn muốn tiết kiệm chi phí. Mỗi sản phẩm sẽ có thông tin tình trạng và bảo hành riêng. Bạn nên xem kỹ ảnh, model và bảo hành trước khi đặt.', actions: [oldTvAction(), zaloAction()], products: [] };
    }

    if (hasAny(normalizedMessage, ['thu cũ đổi mới', 'thu cũ', 'đổi tivi', 'đổi mới', 'bán tivi cũ', 'thu mua tivi cũ'])) {
      return { text: 'Dạ có. Anh Minh Store hỗ trợ thu cũ đổi mới. Bạn có thể gửi hình ảnh tivi, model, kích thước, tình trạng máy và lỗi nếu có qua Zalo để được báo giá nhanh hơn.', actions: [zaloAction(), callAction()], products: [] };
    }

    if (hasAny(normalizedMessage, ['sửa tivi', 'sửa tv', 'tivi hỏng', 'không lên nguồn', 'mất hình', 'mất tiếng', 'màn hình sọc', 'bể màn', 'lỗi màn', 'đèn nền', 'main', 'bo nguồn'])) {
      return { text: 'Dạ, Anh Minh Store có hỗ trợ sửa tivi tại Đà Nẵng. Bạn có thể mô tả lỗi, gửi ảnh hoặc video tình trạng tivi qua Zalo để kỹ thuật viên tư vấn và báo hướng xử lý trước.', actions: [zaloAction(), callAction()], products: [] };
    }

    if (hasAny(normalizedMessage, ['bảo hành', 'bảo hành bao lâu', 'sp mới bảo hành mấy năm', 'tivi mới bảo hành', 'sản phẩm qua sửa chữa bảo hành', 'qua sửa chữa bảo hành mấy tháng', 'đã sửa bảo hành bao lâu', 'đổi trả', 'lỗi', 'hậu mãi'])) {
      return { text: 'Dạ chính sách bảo hành bên em như sau ạ: sản phẩm tivi mới bảo hành 2 năm. Sản phẩm đã qua sửa chữa bảo hành 6 tháng. Riêng tivi cũ/đã qua sử dụng có thể tuỳ tình trạng máy và thông tin từng sản phẩm, bạn gửi model hoặc bấm xem chi tiết để AM AI hỗ trợ kiểm tra rõ hơn nha.', actions: [featuredAction(), zaloAction(), callAction()], products: [] };
    }

    if (hasAny(normalizedMessage, ['đặt hàng', 'mua', 'mua ngay', 'còn hàng', 'chốt đơn', 'giao hàng', 'ship', 'đặt tivi'])) {
      return { text: 'Bạn có thể bấm nút “Đặt hàng ngay” trong trang sản phẩm, điền họ tên và số điện thoại. Anh Minh Store sẽ liên hệ xác nhận thông tin trước khi sản phẩm được giao.', actions: [callAction(), zaloAction()], products: [] };
    }

    if (hasAny(normalizedMessage, ['địa chỉ', 'ở đâu', 'hotline', 'số điện thoại', 'liên hệ', 'cửa hàng', 'giờ làm', 'đà nẵng'])) {
      return { text: 'Bạn có thể liên hệ Anh Minh Store qua hotline 0905111223 - 0774111223. Cơ sở 1: 100 Tiểu La, Hải Châu, Đà Nẵng. Cơ sở 2: 540B Nguyễn Hữu Thọ, Cẩm Lệ, Đà Nẵng.', actions: [callAction(), zaloAction()], products: [] };
    }

    const brandReply = getBrandReply(normalizedMessage);
    if (brandReply) return { text: brandReply, actions: [featuredAction(), zaloAction()], products: [] };

    if (hasAny(normalizedMessage, ['tư vấn', 'chọn tivi', 'phòng ngủ', 'phòng khách', 'diện tích', 'mấy inch', 'bao nhiêu inch', '20m2', '25m2', '30m2', '40m2', 'giá rẻ', 'dưới 10 triệu', 'dưới 15 triệu', 'cao cấp'])) {
      return { text: 'Nếu bạn dùng cho phòng ngủ nhỏ, mình gợi ý 32–43 inch. Phòng khách khoảng 20–25m² nên chọn 43–50 inch. Phòng 30–40m² nên chọn 55–65 inch để xem đã hơn; phòng khách rộng có thể chọn từ 65 inch trở lên. Nếu hay xem phim/thể thao, bạn nên ưu tiên 4K, QLED/OLED/mini LED khi ngân sách cho phép. Bạn có thể cho mình biết ngân sách và diện tích phòng để mình gợi ý sát hơn nha.', actions: [newTvAction(), oldTvAction(), featuredAction()], products: [] };
    }

    if (likelyProductSearch && !matchedProducts.length) {
      return getNoMatchingProductsReply();
    }

    return { text: 'Mình chưa hiểu rõ câu hỏi này. Bạn có thể hỏi về tivi mới, tivi cũ, thu cũ đổi mới, sửa tivi, bảo hành, giá sản phẩm hoặc địa chỉ cửa hàng nha.', actions: [newTvAction(), oldTvAction(), callAction(), zaloAction()], products: [] };
  };

  const saveChatHistory = () => {
    const safeHistory = chatHistory.slice(-MAX_HISTORY).map((item) => ({
      role: item.role,
      content: item.content,
      actions: item.actions || [],
      quickReplies: item.quickReplies || [],
    }));
    safeLocalStorage.set(HISTORY_VERSION_KEY, AM_CHATBOT_HISTORY_VERSION);
    safeLocalStorage.set(HISTORY_KEY, JSON.stringify(safeHistory));
  };

  const loadChatHistory = () => {
    if (safeLocalStorage.get(HISTORY_VERSION_KEY) !== AM_CHATBOT_HISTORY_VERSION) {
      safeLocalStorage.remove(HISTORY_KEY);
      safeLocalStorage.set(HISTORY_VERSION_KEY, AM_CHATBOT_HISTORY_VERSION);
      return [];
    }
    const raw = safeLocalStorage.get(HISTORY_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.slice(-MAX_HISTORY) : [];
    } catch (error) {
      return [];
    }
  };

  const scrollChatToBottom = () => {
    if (!elements.body) return;
    elements.body.scrollTop = elements.body.scrollHeight;
  };

  const renderActions = (actions = []) => {
    if (!actions.length) return '';
    return `<div class="am-chatbot-actions">${actions.map((action) => `<a class="am-chatbot-action-btn${action.primary ? ' am-chatbot-action-btn--primary' : ''}" href="${escapeHtml(action.href)}">${escapeHtml(action.label)}</a>`).join('')}</div>`;
  };

  const renderQuickReplyButtons = (quickReplies = []) => {
    if (!quickReplies.length) return '';
    return `<div class="am-chatbot-quick-replies am-chatbot-quick-replies--inline">${quickReplies.map((reply) => `<button class="am-chatbot-quick-btn" type="button" data-chatbot-quick="${escapeHtml(reply)}">${escapeHtml(reply)}</button>`).join('')}</div>`;
  };

  const renderProductSuggestionCards = (products = []) => {
    if (!products.length) return '';
    return `<div class="am-chatbot-product-list">${products.map((product) => {
      const name = product.name || product.fullName || product.model || 'Sản phẩm tivi';
      const meta = [product.model, product.size].filter(Boolean).join(' • ');
      const reason = product.reason || 'Phù hợp với nhu cầu bạn vừa hỏi.';
      const href = product.detailUrl || product.href || createProductDetailUrl(product);
      const image = product.image || '';
      const imageHtml = image
        ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(name)}" loading="lazy" decoding="async">`
        : '<span class="am-chatbot-product-placeholder" aria-hidden="true">TV</span>';
      const detailButton = href ? `<a class="am-chatbot-product-detail" href="${escapeHtml(href)}">Xem chi tiết</a>` : '';
      const oldPrice = product.oldPriceText || product.oldPrice || product.old_price || '';
      const oldPriceHtml = oldPrice ? `<span class="am-chatbot-product-old-price">Giá cũ: ${escapeHtml(oldPrice)}</span>` : '';
      return `<article class="am-chatbot-product-card"><div class="am-chatbot-product-thumb">${imageHtml}</div><div class="am-chatbot-product-info"><strong>${escapeHtml(name)}</strong><span class="am-chatbot-product-meta">${escapeHtml(meta || 'Sản phẩm tivi')}</span><span class="am-chatbot-product-price">${escapeHtml(product.priceText || product.price || 'Giá đang cập nhật')}</span>${oldPriceHtml}<p>${escapeHtml(reason)}</p>${detailButton}</div></article>`;
    }).join('')}</div>`;
  };

  const renderProducts = renderProductSuggestionCards;

  const appendMessage = (role, content, actions = [], products = [], shouldSave = true, quickReplies = []) => {
    if (!elements.body) return;
    const messageEl = document.createElement('div');
    messageEl.className = `am-chatbot-message ${role}`;
    messageEl.innerHTML = `<div class="am-chatbot-bubble">${escapeHtml(content)}${role === 'bot' ? renderActions(actions) + renderProducts(products) + renderQuickReplyButtons(quickReplies) : ''}</div>`;
    elements.body.appendChild(messageEl);

    if (shouldSave) {
      chatHistory.push({ role, content, actions, quickReplies });
      chatHistory = chatHistory.slice(-MAX_HISTORY);
      saveChatHistory();
    }
    scrollChatToBottom();
  };

  const renderQuickReplies = () => {
    if (!elements.body || hasRenderedQuickReplies) return;
    const quickWrap = document.createElement('div');
    quickWrap.className = 'am-chatbot-quick-replies';
    quickWrap.innerHTML = QUICK_REPLIES.map((reply) => `<button class="am-chatbot-quick-btn" type="button" data-chatbot-quick="${escapeHtml(reply)}">${escapeHtml(reply)}</button>`).join('');
    elements.body.appendChild(quickWrap);
    hasRenderedQuickReplies = true;
    scrollChatToBottom();
  };

  const showTypingIndicator = () => {
    const typing = document.createElement('div');
    typing.className = 'am-chatbot-message bot am-chatbot-typing-wrap';
    typing.innerHTML = '<div class="am-chatbot-bubble am-chatbot-typing">AM AI đang trả lời...</div>';
    elements.body.appendChild(typing);
    scrollChatToBottom();
    return typing;
  };

  const handleUserMessage = (message) => {
    const trimmed = String(message || '').trim();
    if (!trimmed) return;
    appendMessage('user', trimmed);
    const typing = showTypingIndicator();
    window.setTimeout(() => {
      typing.remove();
      const reply = getBotReply(trimmed);
      appendMessage('bot', reply.text, reply.actions, reply.products, true, reply.quickReplies || []);
    }, 400 + Math.floor(Math.random() * 300));
  };

  const openChatbot = () => {
    elements.window?.classList.add('open');
    elements.button?.classList.add('is-open');
    elements.button?.setAttribute('aria-expanded', 'true');
    window.setTimeout(() => elements.input?.focus(), 120);
  };

  const closeChatbot = () => {
    elements.window?.classList.remove('open');
    elements.button?.classList.remove('is-open');
    elements.button?.setAttribute('aria-expanded', 'false');
  };

  const toggleChatbot = () => {
    if (elements.window?.classList.contains('open')) closeChatbot();
    else openChatbot();
  };

  const resetChatbotConversation = (welcomeText = WELCOME_MESSAGE) => {
    chatHistory = [];
    hasRenderedQuickReplies = false;
    safeLocalStorage.remove(HISTORY_KEY);
    safeLocalStorage.set(HISTORY_VERSION_KEY, AM_CHATBOT_HISTORY_VERSION);
    elements.body.innerHTML = '';
    appendMessage('bot', welcomeText);
    renderQuickReplies();
  };

  const clearChatHistory = () => {
    resetChatbotConversation(WELCOME_MESSAGE);
  };

  const startChatbotConversation = () => {
    resetChatbotConversation(START_MESSAGE);
  };

  const injectChatbot = () => {
    if (document.getElementById(CHATBOT_ID)) return;
    const root = document.createElement('div');
    root.id = CHATBOT_ID;
    root.className = 'am-chatbot-root';
    root.innerHTML = `
      <section class="am-chatbot-window" aria-label="AM AI - Trợ lý tư vấn" aria-live="polite">
        <header class="am-chatbot-header">
          <span class="am-chatbot-avatar-frame am-chatbot-avatar-frame--small"><img class="am-chatbot-avatar" src="${AVATAR_SRC}" alt="AM AI" loading="lazy" decoding="async"></span>
          <span class="am-chatbot-title-wrap"><strong class="am-chatbot-title">AM AI</strong><span class="am-chatbot-subtitle">Trợ lý tư vấn của Anh Minh Store</span><span class="am-chatbot-header-status">Đang hỗ trợ</span></span>
          <button class="am-chatbot-close" type="button" aria-label="Đóng chatbot">×</button>
        </header>
        <div class="am-chatbot-body" role="log" aria-live="polite"></div>
        <footer class="am-chatbot-footer">
          <div class="am-chatbot-footer-actions">
            <button class="am-chatbot-clear" type="button">Xoá hội thoại</button>
            <button class="am-chatbot-start" type="button">Bắt đầu</button>
          </div>
          <form class="am-chatbot-form">
            <input class="am-chatbot-input" type="text" placeholder="Nhập câu hỏi của bạn..." aria-label="Nhập câu hỏi cho AM AI" autocomplete="off">
            <button class="am-chatbot-send" type="submit">Gửi</button>
          </form>
          <p class="am-chatbot-note">AM AI trả lời tự động. Với thông tin chính xác nhất, vui lòng gọi hoặc nhắn Zalo cho cửa hàng.</p>
        </footer>
      </section>
      <div class="am-chatbot-button-wrap">
        <span class="am-chatbot-label">Hỏi AM AI</span>
        <button class="am-chatbot-button" type="button" aria-label="Mở AM AI" aria-expanded="false">
          <span class="am-chatbot-avatar-frame"><img class="am-chatbot-avatar" src="${AVATAR_SRC}" alt="Mascot AM AI" loading="lazy" decoding="async"><span class="am-chatbot-status-dot" aria-hidden="true"></span></span>
        </button>
      </div>`;
    document.body.appendChild(root);
  };

  const bindEvents = () => {
    elements.button.addEventListener('click', toggleChatbot);
    elements.close.addEventListener('click', closeChatbot);
    elements.clear.addEventListener('click', clearChatHistory);
    elements.start.addEventListener('click', startChatbotConversation);
    elements.form.addEventListener('submit', (event) => {
      event.preventDefault();
      const value = elements.input.value.trim();
      if (!value) return;
      elements.input.value = '';
      handleUserMessage(value);
    });
    elements.body.addEventListener('click', (event) => {
      const quickButton = event.target.closest('[data-chatbot-quick]');
      if (quickButton) handleUserMessage(quickButton.dataset.chatbotQuick);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeChatbot();
    });
  };

  const initAnhMinhChatbot = () => {
    injectChatbot();
    const root = document.getElementById(CHATBOT_ID);
    elements = {
      root,
      window: root.querySelector('.am-chatbot-window'),
      button: root.querySelector('.am-chatbot-button'),
      close: root.querySelector('.am-chatbot-close'),
      body: root.querySelector('.am-chatbot-body'),
      form: root.querySelector('.am-chatbot-form'),
      input: root.querySelector('.am-chatbot-input'),
      clear: root.querySelector('.am-chatbot-clear'),
      start: root.querySelector('.am-chatbot-start'),
    };

    chatHistory = loadChatHistory();
    if (chatHistory.length) {
      chatHistory.forEach((item) => appendMessage(item.role, item.content, item.actions, item.products, false, item.quickReplies || []));
    } else {
      appendMessage('bot', WELCOME_MESSAGE);
      renderQuickReplies();
    }
    bindEvents();
  };

  window.initAnhMinhChatbot = initAnhMinhChatbot;
  window.getBotReply = getBotReply;
  window.findMatchingProducts = findMatchingProducts;
  window.normalizeText = normalizeText;
  window.normalizeVietnameseText = normalizeVietnameseText;
  window.parseVietnamesePriceToNumber = parseVietnamesePriceToNumber;
  window.parseSizeToNumber = parseSizeToNumber;
  window.normalizeProductForChatbot = normalizeProductForChatbot;
  window.getAvailableProductsForChatbot = getAvailableProductsForChatbot;
  window.detectTvSeriesFromMessage = detectTvSeriesFromMessage;
  window.parseTvCustomerNeed = parseTvCustomerNeed;
  window.scoreProductForNeed = scoreProductForNeed;
  window.recommendProductsForMessage = recommendProductsForMessage;
  window.renderProductSuggestionCards = renderProductSuggestionCards;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnhMinhChatbot, { once: true });
  } else {
    initAnhMinhChatbot();
  }
})();
