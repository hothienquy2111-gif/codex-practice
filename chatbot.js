(() => {
  'use strict';

  const CHATBOT_ID = 'anh-minh-chatbot';
  const HISTORY_KEY = 'anhMinhChatHistory';
  const MAX_HISTORY = 20;
  const AVATAR_SRC = 'linh%20v%E1%BA%ADt%20AM.jpeg';
  const HOTLINE = '0905111223';
  const QUICK_REPLIES = [
    'Tư vấn chọn tivi',
    'Tivi mới',
    'Tivi cũ',
    'Thu cũ đổi mới',
    'Sửa tivi',
    'Bảo hành',
    'Đặt hàng',
    'Liên hệ cửa hàng',
  ];
  const SMART_RECOMMENDER_QUICK_REPLIES = ['Phòng ngủ', 'Phòng khách', 'Dưới 10 triệu', '10–15 triệu', 'Tivi mới', 'Tivi cũ'];
  const WELCOME_MESSAGE = 'Xin chào 👋 Mình là AM AI – trợ lý của Anh Minh Store. Mình có thể giúp bạn tìm tivi phù hợp, tư vấn tivi mới/tivi cũ, thu cũ đổi mới, sửa tivi, bảo hành và thông tin cửa hàng.';
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
  const RECOMMENDATION_INTENT_KEYWORDS = [
    'nên mua', 'nen mua', 'tư vấn', 'tu van', 'chọn', 'chon', 'phù hợp', 'phu hop', 'loại nào', 'loai nao',
    'con nào', 'con nao', 'mua tivi', 'mua tv', 'tivi nào', 'tivi nao', 'tv nào', 'tv nao', 'phòng', 'phong',
    'ngân sách', 'ngan sach', 'dưới', 'duoi', 'tầm', 'tam', 'khoảng', 'khoang', 'triệu', 'trieu', 'tr',
    'inch', 'in ', 'inh', 'giá rẻ', 'gia re', 'cao cấp', 'cao cap', 'world cup', 'bóng đá', 'bong da',
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

  const parseVietnamesePriceToNumber = (value) => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    const raw = String(value ?? '').trim();
    if (!raw) return null;
    const normalized = normalizeVietnameseText(raw).replace(/,/g, '.');
    const millionMatch = normalized.match(/(\d+(?:[.,]\d+)?)\s*(trieu|tr\b|m\b)/);
    if (millionMatch) return Math.round(Number(millionMatch[1].replace(',', '.')) * 1000000);

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
    const id = getProductValue(product, ['id', 'slug', 'code']);
    const brand = String(getProductValue(product, ['brand']) || '').trim();
    const model = String(getProductValue(product, ['model']) || '').trim();
    const name = String(getProductValue(product, ['full_name', 'fullName', 'name', 'title']) || model || brand || 'Sản phẩm tivi').trim();
    const size = getProductValue(product, ['size']);
    const type = String(getProductValue(product, ['type']) || '').trim();
    const condition = String(getProductValue(product, ['condition']) || '').trim();
    const warranty = String(getProductValue(product, ['warranty', 'badge']) || '').trim();
    const price = getProductValue(product, ['price', 'salePrice', 'sale_price']);
    const oldPrice = getProductValue(product, ['old_price', 'oldPrice']);
    const images = getProductValue(product, ['images']);
    const image = String(getProductValue(product, ['image']) || (Array.isArray(images) ? images[0] : '') || '').trim();
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
      priceText: formatPriceText(price),
      oldPriceText: oldPrice ? formatPriceText(oldPrice) : '',
      image,
      detailUrl: '',
      featuresText,
      isFeatured: Boolean(product.is_featured ?? product.isFeatured ?? product.featured ?? false),
      href: product.href || '',
      sourceIndex: index,
    };
    normalizedProduct.detailUrl = product.href || createProductDetailUrl(normalizedProduct);
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

  const readDomProductsForChatbot = () => {
    const productsFromDom = [];
    document.querySelectorAll('.product-card, .used-tv-card, [data-product-card]').forEach((card, index) => {
      const name = card.querySelector('.product-card-name, h3, [data-product-name]')?.textContent || '';
      const model = card.querySelector('.product-card-model, [data-product-model]')?.textContent || '';
      const brand = card.querySelector('.product-card-brand, [data-product-brand]')?.textContent || '';
      const size = card.querySelector('.product-size, .product-card__size, [data-product-size]')?.textContent || '';
      const type = card.querySelector('.product-type, .product-card__type, [data-product-type]')?.textContent || '';
      const price = card.querySelector('.product-price__sale, .product-price, [data-product-price]')?.textContent || '';
      const image = card.querySelector('img')?.getAttribute('src') || '';
      const href = card.matches('a') ? card.getAttribute('href') : card.querySelector('a[href]')?.getAttribute('href');
      if (name || model || brand || price) {
        productsFromDom.push({ id: href?.includes('id=') ? href.replace(/^.*id=/, '') : '', fullName: name, model, brand, size, type, price, image, href });
      }
      if (!name && !model && !brand && card.textContent) productsFromDom.push({ id: `dom-product-${index}`, fullName: card.textContent.trim().slice(0, 90) });
    });
    return productsFromDom;
  };

  const getAvailableProductsForChatbot = () => {
    const rawProducts = [];
    try {
      ['anhMinhProducts', 'products', 'PRODUCTS', 'allProducts', 'loadedProducts', 'supabaseProducts'].forEach((key) => {
        if (Array.isArray(window[key])) rawProducts.push(...window[key]);
      });
      const appStates = [window.AnhMinhStore, window.anhMinhStore, window.AnhMinhProductsState].filter(Boolean);
      appStates.forEach((state) => {
        ['products', 'allProducts', 'loadedProducts', 'supabaseProducts'].forEach((key) => {
          if (Array.isArray(state[key])) rawProducts.push(...state[key]);
        });
      });
      if (!rawProducts.length) rawProducts.push(...readDomProductsForChatbot());
    } catch (error) {
      return [];
    }

    const unique = new Map();
    rawProducts.forEach((item, index) => {
      const product = normalizeProductForChatbot(item, index);
      if (!product.name && !product.model && !product.brand) return;
      const key = product.id || `${product.brand}-${product.model}-${product.name}-${product.priceText}` || `product-${index}`;
      if (!unique.has(key)) unique.set(key, product);
    });
    return Array.from(unique.values());
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

  const parseBudgetFromMessage = (message, normalizedMessage) => {
    const need = {};
    const rangeMatch = normalizedMessage.match(/(?:tu\s*)?(\d+(?:[.,]\d+)?)\s*(?:-|den|toi|–)\s*(\d+(?:[.,]\d+)?)\s*(trieu|tr\b|m\b)?/);
    if (rangeMatch) {
      need.minBudget = Math.round(Number(rangeMatch[1].replace(',', '.')) * 1000000);
      need.maxBudget = Math.round(Number(rangeMatch[2].replace(',', '.')) * 1000000);
      need.budgetLabel = `${rangeMatch[1]}–${rangeMatch[2]} triệu`;
      return need;
    }

    const belowMatch = normalizedMessage.match(/(?:duoi|khong qua|toi da|do lai)\s*(\d+(?:[.,]\d+)?)\s*(trieu|tr\b|m\b)?|(?:tam|khoang)?\s*(\d+(?:[.,]\d+)?)\s*(trieu|tr\b|m\b)?\s*(?:do lai|tro xuong)/);
    if (belowMatch) {
      const value = Number((belowMatch[1] || belowMatch[3]).replace(',', '.'));
      need.maxBudget = Math.round(value * 1000000);
      need.budgetLabel = `dưới ${value} triệu`;
      return need;
    }

    const aroundMatch = normalizedMessage.match(/(?:tam|khoang|khoan|gan)\s*(\d+(?:[.,]\d+)?)\s*(trieu|tr\b|m\b)/);
    if (aroundMatch) {
      const value = Number(aroundMatch[1].replace(',', '.'));
      need.targetBudget = Math.round(value * 1000000);
      need.minBudget = Math.round(value * 0.85 * 1000000);
      need.maxBudget = Math.round(value * 1.125 * 1000000);
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
    }
    if (hasAny(normalizedMessage, ['cao cap', 'xịn', 'xin', 'premium'])) {
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

    const sizeMatch = normalizedMessage.match(/\b(32|43|49|50|55|65|75|85)\s*(inch|in|inh|\")?\b/);
    if (sizeMatch) need.requestedSize = Number(sizeMatch[1]);

    Object.assign(need, parseBudgetFromMessage(originalMessage, normalizedMessage));

    if (hasAny(normalizedMessage, ['tivi moi', 'tv moi', 'hang moi', 'moi 100%', 'chinh hang'])) need.type = 'Tivi mới';
    if (hasAny(normalizedMessage, ['tivi cu', 'tv cu', 'da qua su dung', 'second hand', 'gia re'])) need.type = 'Tivi cũ';

    if (hasAny(normalizedMessage, ['xem phim', 'netflix'])) need.usage.push('movies');
    if (hasAny(normalizedMessage, ['bong da', 'world cup', 'the thao'])) need.usage.push('sports');
    if (hasAny(normalizedMessage, ['choi game', 'gaming', 'game'])) need.usage.push('gaming');
    if (hasAny(normalizedMessage, ['nguoi lon tuoi'])) need.usage.push('elderly');
    if (hasAny(normalizedMessage, ['youtube'])) need.usage.push('youtube');
    if (hasAny(normalizedMessage, ['hoc online'])) need.usage.push('learning');
    if (hasAny(normalizedMessage, ['karaoke'])) need.usage.push('karaoke');

    ['qled', 'oled', 'mini led', '4k', 'google tv', 'tizen', 'webos', 'am thanh tot', 'hinh anh dep', 'tiet kiem dien', 'bao hanh lau'].forEach((preference) => {
      if (normalizedMessage.includes(preference)) need.preferences.push(preference);
    });
    if (hasAny(normalizedMessage, ['gia re', 're'])) need.usage.push('cheap');
    if (hasAny(normalizedMessage, ['cao cap'])) need.usage.push('premium');

    const meaningfulSignals = [need.brand, need.requestedSize, need.roomArea, need.roomType, need.minBudget, need.maxBudget, need.type, ...need.usage, ...need.preferences].filter(Boolean).length;
    need.isVagueAdvice = need.hasBuyingIntent && meaningfulSignals <= 1 && hasAny(normalizedMessage, ['tu van tivi', 'tu van chon tivi', 'chon tivi']);
    return need;
  };

  const hasAny = (text, keywords) => keywords.some((keyword) => text.includes(normalizeText(keyword)));

  const productMatchesType = (product, type) => {
    if (!type) return false;
    const haystack = normalizeVietnameseText([product.type, product.condition, product.searchableText].join(' '));
    if (type === 'Tivi mới') return hasAny(haystack, ['tivi moi', 'hang moi', 'moi 100%', 'chinh hang', 'moi']);
    if (type === 'Tivi cũ') return hasAny(haystack, ['tivi cu', 'da qua su dung', 'second hand', 'cu']);
    return false;
  };

  const scoreProductForNeed = (product, need) => {
    let score = 0;
    const reasons = [];
    const haystack = product.searchableText || normalizeVietnameseText(JSON.stringify(product));
    const size = product.sizeNumber || parseSizeToNumber([product.size, product.name, product.model].join(' '));
    const price = product.priceNumber;

    if (need.brand && haystack.includes(normalizeVietnameseText(need.brand))) {
      score += 25;
      reasons.push(`đúng hãng ${need.brand}`);
    }

    if (need.type && productMatchesType(product, need.type)) {
      score += 25;
      reasons.push(`phù hợp nhu cầu ${need.type.toLowerCase()}`);
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

    if ((need.minBudget || need.maxBudget || need.targetBudget) && price) {
      const min = need.minBudget || 0;
      const max = need.maxBudget || need.targetBudget || Infinity;
      if (price >= min && price <= max) {
        score += 35;
        reasons.push(`giá phù hợp ${need.budgetLabel || 'ngân sách'}`);
      } else if (Number.isFinite(max) && price > max && price <= max * 1.1) {
        score += 20;
        reasons.push('giá chỉ nhỉnh hơn ngân sách khoảng 10%');
      } else if (price < min || (Number.isFinite(max) && price < max)) {
        score += 10;
        reasons.push('giá thấp hơn ngân sách dự kiến');
      } else if (Number.isFinite(max) && price > max * 1.1) {
        score -= 30;
      }
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
    const parts = [];
    if (need.roomType === 'bedroom') parts.push('phòng ngủ');
    if (need.roomType === 'livingroom') parts.push('phòng khách');
    if (need.roomArea) parts.push(`khoảng ${need.roomArea}m²`);
    if (need.requestedSize) parts.push(`${need.requestedSize} inch`);
    if (need.brand) parts.push(`hãng ${need.brand}`);
    if (need.budgetLabel) parts.push(need.budgetLabel);
    if (need.type) parts.push(need.type.toLowerCase());
    if (!parts.length) return 'Mình đã hiểu bạn đang cần tư vấn chọn tivi phù hợp.';
    return `Mình hiểu bạn đang tìm tivi cho ${parts.join(', ')}.`;
  };

  const buildRecommendationSummary = (need, hasStrongMatch) => {
    if (need.recommendedRange) return `Dựa trên nhu cầu này, mình gợi ý ưu tiên tivi ${need.recommendedRange.label} để xem cân đối với không gian.`;
    if (need.requestedSize) return `Mình sẽ ưu tiên các mẫu ${need.requestedSize} inch đang có trong dữ liệu sản phẩm của Anh Minh Store.`;
    if (need.usage.includes('sports')) return 'Với nhu cầu xem bóng đá/World Cup, mình ưu tiên tivi màn hình lớn, 4K và có công nghệ chuyển động tốt.';
    if (need.usage.includes('movies')) return 'Với nhu cầu xem phim, mình ưu tiên tivi 4K, QLED/OLED/Mini LED hoặc mẫu có HDR khi dữ liệu sản phẩm có thông tin này.';
    if (need.usage.includes('cheap')) return 'Với nhu cầu giá rẻ, mình ưu tiên mẫu có giá thấp hơn hoặc tivi cũ đã kiểm tra.';
    if (!hasStrongMatch) return 'Dữ liệu hiện có chưa khớp thật mạnh, nên mình hiển thị các mẫu gần nhất để bạn tham khảo thêm.';
    return 'Trong dữ liệu hiện có trên website, các mẫu phù hợp nhất là:';
  };

  const recommendProductsForMessage = (message = '') => {
    const need = parseTvCustomerNeed(message);
    if (!need.hasBuyingIntent) return null;

    if (need.isVagueAdvice) {
      return {
        text: 'Bạn cho mình thêm 3 thông tin để tư vấn sát hơn nha: diện tích phòng, ngân sách khoảng bao nhiêu và bạn thích tivi mới hay tivi cũ?',
        actions: [callAction(), zaloAction()],
        quickReplies: SMART_RECOMMENDER_QUICK_REPLIES,
        products: [],
      };
    }

    const products = getAvailableProductsForChatbot();
    if (!products.length) {
      return {
        text: 'Hiện mình chưa tải được dữ liệu sản phẩm trên web. Bạn có thể thử lại sau vài giây hoặc bấm Gọi ngay/Nhắn Zalo để Anh Minh Store tư vấn nhanh hơn.',
        actions: [callAction(), zaloAction()],
        products: [],
      };
    }

    const scored = products
      .map((product) => scoreProductForNeed(product, need))
      .sort((a, b) => b.score - a.score);
    const strongMatches = scored.filter((item) => item.score >= 25);
    const selected = (strongMatches.length ? strongMatches : scored.filter((item) => item.score > 0)).slice(0, 3);

    if (!selected.length) {
      return {
        text: 'Mình chưa thấy mẫu nào khớp rõ với nhu cầu này trong dữ liệu hiện có. Bạn có thể cho mình thêm diện tích phòng, ngân sách và thích tivi mới hay cũ; hoặc bấm Gọi ngay/Nhắn Zalo để Anh Minh Store tư vấn chính xác hơn.',
        actions: [featuredAction(), callAction(), zaloAction()],
        products: scored.slice(0, 3).map((item) => ({ ...item.product, reason: 'Mẫu gần nhất trong dữ liệu hiện có.' })),
      };
    }

    const recommendedProducts = selected.map((item) => ({
      ...item.product,
      reason: item.reasons.length ? item.reasons.join(', ') : 'phù hợp nhất theo dữ liệu hiện có',
      score: item.score,
    }));
    const intro = buildUnderstandingText(need);
    const summary = buildRecommendationSummary(need, strongMatches.length > 0);
    const detailHint = strongMatches.length
      ? 'Bạn có thể bấm “Xem chi tiết” để xem hình ảnh, thông số và đặt hàng.'
      : 'Các mẫu này là lựa chọn gần nhất; nếu muốn chắc hơn, bạn có thể gọi hoặc nhắn Zalo để cửa hàng kiểm tra tồn kho và tư vấn nhanh.';

    return {
      text: `${intro}\n${summary}\nTrong dữ liệu hiện có của Anh Minh Store, mình gợi ý 3 mẫu sau:\n${detailHint}`,
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
      if (normalizeText(product.model) && normalizedMessage.includes(normalizeText(product.model))) score += 8;
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

  const getBotReply = (message) => {
    const normalizedMessage = normalizeText(message);
    const recommendationReply = recommendProductsForMessage(message);
    if (recommendationReply?.products?.length || recommendationReply?.quickReplies?.length || recommendationReply?.text?.includes('chưa tải được dữ liệu')) {
      return recommendationReply;
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

    if (hasAny(normalizedMessage, ['bảo hành', 'bảo hành bao lâu', 'đổi trả', 'lỗi', 'hậu mãi'])) {
      return { text: 'Thông tin bảo hành sẽ tuỳ từng sản phẩm và được hiển thị trong phần chi tiết sản phẩm. Với tivi mới thường có bảo hành chính hãng hoặc theo chính sách bán hàng. Với tivi cũ, thời gian bảo hành sẽ tuỳ tình trạng từng máy. Bạn có thể gửi model để Anh Minh Store kiểm tra cụ thể.', actions: [zaloAction(), featuredAction()], products: [] };
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
      return { text: 'Hiện mình chưa tìm thấy sản phẩm phù hợp trong dữ liệu đang hiển thị. Bạn có thể thử tìm theo model khác hoặc nhắn Zalo để Anh Minh Store tư vấn nhanh hơn.', actions: [featuredAction(), zaloAction()], products: [] };
    }

    return { text: 'Mình chưa hiểu rõ câu hỏi này. Bạn có thể hỏi về tivi mới, tivi cũ, thu cũ đổi mới, sửa tivi, bảo hành, giá sản phẩm hoặc địa chỉ cửa hàng nha.', actions: [newTvAction(), oldTvAction(), callAction(), zaloAction()], products: [] };
  };

  const saveChatHistory = () => {
    safeLocalStorage.set(HISTORY_KEY, JSON.stringify(chatHistory.slice(-MAX_HISTORY)));
  };

  const loadChatHistory = () => {
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
      return `<article class="am-chatbot-product-card"><div class="am-chatbot-product-thumb">${imageHtml}</div><div class="am-chatbot-product-info"><strong>${escapeHtml(name)}</strong><span class="am-chatbot-product-meta">${escapeHtml(meta || 'Sản phẩm tivi')}</span><span class="am-chatbot-product-price">${escapeHtml(product.priceText || product.price || 'Giá đang cập nhật')}</span><p>${escapeHtml(reason)}</p>${detailButton}</div></article>`;
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
      chatHistory.push({ role, content, actions, products, quickReplies });
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

  const clearChatHistory = () => {
    chatHistory = [];
    hasRenderedQuickReplies = false;
    safeLocalStorage.remove(HISTORY_KEY);
    elements.body.innerHTML = '';
    appendMessage('bot', WELCOME_MESSAGE);
    renderQuickReplies();
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
          <button class="am-chatbot-clear" type="button">Xoá hội thoại</button>
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
