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
  const WELCOME_MESSAGE = 'Xin chào 👋 Mình là AM AI – trợ lý của Anh Minh Store. Mình có thể giúp bạn tìm tivi phù hợp, tư vấn tivi mới/tivi cũ, thu cũ đổi mới, sửa tivi, bảo hành và thông tin cửa hàng.';

  let elements = {};
  let chatHistory = [];
  let hasRenderedQuickReplies = false;

  const normalizeText = (text = '') => String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, ' ')
    .trim();

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
    // TODO: Replace with real Zalo link if needed.
    return window.location.pathname.includes('product-detail') ? 'index.html#lien-he' : '#lien-he';
  };

  const createAction = (label, href, primary = false) => ({ label, type: 'link', href, primary });
  const callAction = () => createAction('Gọi ngay', `tel:${HOTLINE}`, true);
  const zaloAction = () => createAction('Nhắn Zalo', getZaloHref());
  const newTvAction = () => createAction('Xem tivi mới', 'index.html#tivi-moi', true);
  const oldTvAction = () => createAction('Xem tivi cũ', 'index.html#tivi-cu', true);
  const featuredAction = () => createAction('Xem sản phẩm nổi bật', 'index.html#san-pham');

  const createProductDetailUrl = (product) => {
    if (!product || !product.id) return 'index.html#san-pham';
    return `product-detail.html?id=${encodeURIComponent(product.id)}`;
  };

  const getProductValue = (product, keys) => {
    for (const key of keys) {
      if (product && product[key] !== undefined && product[key] !== null && product[key] !== '') return product[key];
    }
    return '';
  };

  const normalizeProduct = (product = {}, index = 0) => {
    const name = getProductValue(product, ['fullName', 'full_name', 'name', 'title']);
    return {
      id: getProductValue(product, ['id', 'slug', 'code']) || `product-${index}`,
      brand: getProductValue(product, ['brand']),
      model: getProductValue(product, ['model']),
      fullName: name,
      size: getProductValue(product, ['size']),
      type: getProductValue(product, ['type', 'condition']),
      price: getProductValue(product, ['price', 'salePrice', 'sale_price']) || 'Giá đang cập nhật',
    };
  };

  const getProductsFromPageOrGlobal = () => {
    const sources = [];
    ['products', 'PRODUCTS', 'allProducts', 'anhMinhProducts'].forEach((key) => {
      if (Array.isArray(window[key])) sources.push(...window[key]);
    });

    document.querySelectorAll('.product-card, .used-tv-card, [data-product-card]').forEach((card, index) => {
      const name = card.querySelector('.product-card-name, h3, [data-product-name]')?.textContent || '';
      const model = card.querySelector('.product-card-model, [data-product-model]')?.textContent || '';
      const brand = card.querySelector('.product-card-brand, [data-product-brand]')?.textContent || '';
      const size = card.querySelector('.product-size, [data-product-size]')?.textContent || '';
      const type = card.querySelector('.product-type, [data-product-type]')?.textContent || '';
      const price = card.querySelector('.product-price__sale, .product-price, [data-product-price]')?.textContent || '';
      const href = card.matches('a') ? card.getAttribute('href') : card.querySelector('a[href]')?.getAttribute('href');
      if (name || model || brand) sources.push({ id: href ? href.replace(/^.*id=/, '') : `dom-product-${index}`, fullName: name, model, brand, size, type, price, href });
    });

    const unique = new Map();
    sources.forEach((item, index) => {
      const product = normalizeProduct(item, index);
      const key = `${product.id}-${product.model}-${product.fullName}`;
      if (!unique.has(key)) unique.set(key, { ...product, href: item.href });
    });
    return Array.from(unique.values());
  };

  const findMatchingProducts = (message = '') => {
    const normalizedMessage = normalizeText(message);
    const products = getProductsFromPageOrGlobal();
    if (!normalizedMessage || !products.length) return [];

    const words = normalizedMessage.split(' ').filter((word) => word.length >= 2);
    const brands = ['samsung', 'lg', 'sony', 'toshiba', 'tcl', 'panasonic', 'sharp', 'xiaomi', 'casper', 'coocaa', 'skyworth', 'philips', 'hitachi', 'hisense'];
    const brandHits = brands.filter((brand) => normalizedMessage.includes(brand));
    const sizeHits = normalizedMessage.match(/\b\d{2}\s*(inch|in|")?\b/g) || [];
    const typeHits = ['tivi moi', 'tv moi', 'hang moi', 'tivi cu', 'tv cu', 'second hand'].filter((type) => normalizedMessage.includes(type));

    const scored = products.map((product) => {
      const haystack = normalizeText([
        product.fullName,
        product.model,
        product.brand,
        product.size,
        product.type,
        product.price,
      ].join(' '));
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
    const brands = ['samsung', 'lg', 'sony', 'toshiba', 'tcl', 'panasonic', 'sharp', 'xiaomi', 'casper', 'coocaa', 'skyworth', 'philips', 'hitachi', 'hisense'];
    const matchedBrand = brands.find((brand) => normalizedMessage.includes(brand));
    if (!matchedBrand) return null;
    return brandReplies[matchedBrand] || 'Thương hiệu này có nhiều mẫu tivi theo từng phân khúc. Bạn có thể lọc theo hãng trên website hoặc gửi model cụ thể để mình hỗ trợ tốt hơn.';
  };

  const hasAny = (text, keywords) => keywords.some((keyword) => text.includes(normalizeText(keyword)));

  const formatProductText = (products) => products.map((product, index) => {
    const name = product.fullName || product.model || 'Sản phẩm tivi';
    const model = product.model ? ` – Model ${product.model}` : '';
    const price = product.price ? ` – Giá: ${product.price}` : '';
    return `${index + 1}. ${name}${model}${price}`;
  }).join('\n');

  const getBotReply = (message) => {
    const normalizedMessage = normalizeText(message);
    const matchedProducts = findMatchingProducts(message);
    const likelyProductSearch = /\d{2}|qled|oled|mini led|4k|smart|model|gia|inch|ua|qa|kd|oled|tcl|sony|samsung|lg/i.test(message);

    if (matchedProducts.length && likelyProductSearch) {
      return {
        text: `Mình tìm thấy vài sản phẩm phù hợp:\n\n${formatProductText(matchedProducts)}\n\nBạn có thể bấm xem chi tiết để kiểm tra hình ảnh, bảo hành và đặt hàng.`,
        actions: [featuredAction(), zaloAction()],
        products: matchedProducts,
      };
    }

    // Future AI API integration can be added here.
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

  const renderProducts = (products = []) => {
    if (!products.length) return '';
    return `<div class="am-chatbot-product-list">${products.map((product) => {
      const name = product.fullName || product.model || 'Sản phẩm tivi';
      const meta = [product.model, product.size, product.price].filter(Boolean).join(' • ');
      const href = product.href || createProductDetailUrl(product);
      return `<article class="am-chatbot-product-card"><strong>${escapeHtml(name)}</strong><span>${escapeHtml(meta || 'Xem thêm thông tin sản phẩm')}</span><a href="${escapeHtml(href)}">Xem chi tiết</a></article>`;
    }).join('')}</div>`;
  };

  const appendMessage = (role, content, actions = [], products = [], shouldSave = true) => {
    if (!elements.body) return;
    const messageEl = document.createElement('div');
    messageEl.className = `am-chatbot-message ${role}`;
    messageEl.innerHTML = `<div class="am-chatbot-bubble">${escapeHtml(content)}${role === 'bot' ? renderActions(actions) + renderProducts(products) : ''}</div>`;
    elements.body.appendChild(messageEl);

    if (shouldSave) {
      chatHistory.push({ role, content, actions, products });
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
      appendMessage('bot', reply.text, reply.actions, reply.products);
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
      chatHistory.forEach((item) => appendMessage(item.role, item.content, item.actions, item.products, false));
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnhMinhChatbot, { once: true });
  } else {
    initAnhMinhChatbot();
  }
})();
