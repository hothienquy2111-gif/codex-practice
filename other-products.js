(() => {
  const CATEGORY_CONFIG = {
    loa: { title: 'Loa' },
    'dieu-khien-tivi': { title: 'Điều khiển tivi' },
    'gia-treo-tivi': { title: 'Giá treo tivi' },
    'phu-kien-tivi': { title: 'Phụ kiện tivi' },
    'day-hdmi': { title: 'Dây HDMI' },
    'san-pham-gia-dinh': {
      title: 'Sản phẩm gia đình',
      subtitle: 'Các sản phẩm điện tử gia dụng tại Anh Minh Store sẽ được cập nhật theo hàng thực tế.',
      family: true,
    },
    'may-giat': {
      title: 'Máy giặt',
      subtitle: 'Máy giặt lồng đứng, lồng ngang, máy giặt sấy, một số mẫu có Inverter/Wifi tuỳ model và hàng hiện có.',
      family: true,
      active: true,
    },
    'tu-lanh': { title: 'Tủ lạnh', subtitle: 'Danh mục tủ lạnh sẽ được cập nhật sau.', family: true, comingSoon: true },
    'dieu-hoa': { title: 'Điều hoà', subtitle: 'Danh mục điều hoà sẽ được cập nhật sau.', family: true, comingSoon: true },
    'do-gia-dung': { title: 'Đồ gia dụng', subtitle: 'Danh mục đồ gia dụng sẽ được cập nhật sau.', family: true, comingSoon: true },
    'dich-vu-sua-chua': { title: 'Dịch vụ sửa chữa' },
    'thu-hu-doi-moi': { title: 'Thu hư đổi mới' },
  };

  const HOME_CATEGORY = 'san-pham-gia-dinh';
  const HOME_SUBCATEGORIES = new Set(['may-giat', 'tu-lanh', 'dieu-hoa', 'do-gia-dung']);

  const params = new URLSearchParams(window.location.search);
  const categoryKey = params.get('category') || '';
  const config = CATEGORY_CONFIG[categoryKey] || { title: 'Sản phẩm khác' };
  const titleElement = document.querySelector('[data-category-title]');
  const subtitleElement = document.querySelector('[data-category-subtitle]');
  const familyPlaceholder = document.querySelector('[data-family-placeholder]');
  const gridElement = document.querySelector('[data-other-products-grid]');
  const emptyElement = document.querySelector('[data-other-products-empty]');
  const countElement = document.querySelector('[data-other-products-count]');
  const SITE_ORIGIN = 'https://www.anhminhstore.io.vn';

  const updateMeta = (selector, value) => {
    const element = document.head.querySelector(selector);
    if (element) element.setAttribute('content', value);
  };

  const escapeHtml = (value = '') =>
    String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);

  const normalizeKey = (value = '') =>
    String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s+/g, '-')
      .trim();

  const normalizeProductType = (value = '') =>
    String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();

  const isPublicProduct = (product = {}) => product.is_active !== false && product.isActive !== false && !['hidden', 'sold'].includes(String(product.stock_status || product.stockStatus || '').toLowerCase());

  const getProductCategory = (product = {}) => normalizeKey(product.category);
  const getProductSubcategory = (product = {}) => normalizeKey(product.subcategory);
  const getProductTypeKey = (product = {}) => normalizeProductType(product.type);

  const isFamilyProduct = (product = {}) => {
    const category = getProductCategory(product);
    const subcategory = getProductSubcategory(product);
    const type = getProductTypeKey(product);
    return category === HOME_CATEGORY || HOME_SUBCATEGORIES.has(subcategory) || ['may giat', 'tu lanh', 'dieu hoa', 'do gia dung'].includes(type);
  };

  const matchesCategory = (product = {}) => {
    if (!categoryKey) return false;
    const subcategory = getProductSubcategory(product);
    const category = getProductCategory(product);
    const type = getProductTypeKey(product);
    if (categoryKey === HOME_CATEGORY) return isFamilyProduct(product);
    if (HOME_SUBCATEGORIES.has(categoryKey)) {
      return subcategory === categoryKey || category === categoryKey || normalizeKey(type) === categoryKey;
    }
    return category === categoryKey || subcategory === categoryKey || normalizeKey(type) === categoryKey;
  };

  const normalizeProducts = (items = []) => items
    .filter(isPublicProduct)
    .filter(matchesCategory)
    .sort((a, b) => {
      const sortA = Number(a.sort_order ?? a.sortOrder ?? Number.MAX_SAFE_INTEGER);
      const sortB = Number(b.sort_order ?? b.sortOrder ?? Number.MAX_SAFE_INTEGER);
      if (sortA !== sortB) return sortA - sortB;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });

  const renderProductCard = (product = {}) => {
    const id = String(product.id || '').trim();
    const mappedUrl = window.AnhMinhProductUrlMap?.[id]?.url;
    const detailUrl = typeof mappedUrl === 'string' && /^\/san-pham\/[a-z0-9-]+\.html$/.test(mappedUrl)
      ? mappedUrl
      : (id ? `product-detail.html?id=${encodeURIComponent(id)}` : '#');
    const title = product.full_name || product.fullName || product.model || 'Sản phẩm đang cập nhật';
    const image = product.image || (Array.isArray(product.images) ? product.images[0] : '');
    const size = product.capacity_or_size || product.capacityOrSize || product.size || 'Liên hệ tư vấn';
    const price = product.price || 'Giá đang cập nhật';
    const oldPrice = product.old_price || product.oldPrice || '';
    const renderedOldPrice = oldPrice ? `<span class="product-price__old">${escapeHtml(oldPrice)}</span>` : '';

    return `<article class="product-card product-card--clickable" data-product-detail-url="${escapeHtml(detailUrl)}">
      <div class="product-card__media${image ? '' : ' product-card__media--placeholder'}">
        ${image ? `<img class="product-card__image" src="${escapeHtml(image)}" alt="${escapeHtml(title)}" loading="lazy" decoding="async" />` : '<div class="product-card__fallback" aria-hidden="false">Đang cập nhật ảnh</div>'}
      </div>
      <div class="product-card__body">
        <div class="product-card-meta">
          <span class="product-card-brand">${escapeHtml(product.brand || 'Anh Minh Store')}</span>
          <span class="product-card-model">${escapeHtml(product.model || '')}</span>
        </div>
        <h3 class="product-card-name">${escapeHtml(title)}</h3>
        <p class="product-size">${escapeHtml(size)}</p>
        <p class="product-type">${escapeHtml(product.type || config.title)}</p>
        <strong class="product-price"><span>Giá:</span> ${renderedOldPrice}<span class="product-price__sale">${escapeHtml(price)}</span></strong>
      </div>
      <div class="product-card__actions">
        <a class="btn btn--primary product-card__cta" href="${escapeHtml(detailUrl)}">Xem chi tiết</a>
        <a class="btn btn--secondary product-card__compare" href="#" data-contact-choice="sales">Tư vấn</a>
      </div>
    </article>`;
  };

  const renderProducts = (items = []) => {
    if (countElement) countElement.textContent = items.length ? `Đang hiển thị: ${items.length} sản phẩm` : 'Đang hiển thị: 0 sản phẩm';
    if (!gridElement || !emptyElement) return;
    if (!items.length) {
      gridElement.innerHTML = '';
      emptyElement.hidden = false;
      emptyElement.textContent = config.comingSoon
        ? 'Danh mục này sắp cập nhật sản phẩm. Anh/chị bấm Gọi hoặc Zalo để được tư vấn nhanh.'
        : 'Danh mục này đang cập nhật sản phẩm. Anh/chị vui lòng quay lại sau hoặc liên hệ Anh Minh Store để được tư vấn.';
      return;
    }
    emptyElement.hidden = true;
    gridElement.innerHTML = items.map(renderProductCard).join('');
  };

  const loadProducts = async () => {
    const storeSupabase = window.AnhMinhSupabase || window.anhMinhSupabase;
    if (!storeSupabase?.isConfigured || !storeSupabase.client) {
      renderProducts([]);
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
      renderProducts(normalizeProducts(Array.isArray(data) ? data : []));
    } catch (error) {
      console.warn('Không thể tải danh mục sản phẩm khác.', error);
      renderProducts([]);
    }
  };

  if (titleElement) titleElement.textContent = config.title;
  const pageTitle = `${config.title} - Anh Minh Store`;
  const pageDescription = config.subtitle || 'Danh mục này đang được Anh Minh Store cập nhật. Vui lòng quay lại sau hoặc liên hệ cửa hàng để được tư vấn nhanh.';
  document.title = pageTitle;
  updateMeta('meta[name="description"]', pageDescription);
  updateMeta('meta[name="robots"]', 'noindex,follow');
  updateMeta('meta[property="og:title"]', pageTitle);
  updateMeta('meta[property="og:description"]', pageDescription);
  updateMeta('meta[property="og:url"]', `${SITE_ORIGIN}/other-products.html`);
  updateMeta('meta[name="twitter:title"]', pageTitle);
  updateMeta('meta[name="twitter:description"]', pageDescription);
  const categoryBreadcrumb = document.querySelector('[data-category-breadcrumb]');
  if (categoryBreadcrumb) categoryBreadcrumb.textContent = config.title;

  if (subtitleElement) {
    subtitleElement.textContent = pageDescription;
  }

  if (familyPlaceholder) {
    familyPlaceholder.hidden = categoryKey !== HOME_CATEGORY;
  }

  loadProducts();
})();
