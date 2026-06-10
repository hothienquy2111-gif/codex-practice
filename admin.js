(() => {
  const supabaseState = window.anhMinhSupabase || window.AnhMinhSupabase || {};
  const client = supabaseState.isReady ? supabaseState.client : null;
  const bucketName = supabaseState.bucketName || 'product-images';
  const bannerBucketName = 'site-banners';
  const maxBannerFileSize = 10 * 1024 * 1024;
  const allowedBannerTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

  const dom = {
    loginSection: document.querySelector('[data-admin-login]'),
    dashboard: document.querySelector('[data-admin-dashboard]'),
    loginForm: document.querySelector('[data-login-form]'),
    loginButton: document.querySelector('[data-login-button]'),
    loginMessage: document.querySelector('[data-login-message]'),
    adminMessage: document.querySelector('[data-admin-message]'),
    products: document.querySelector('[data-admin-products]'),
    productSearchInput: document.querySelector('[data-product-search]'),
    productSearchClear: document.querySelector('[data-product-search-clear]'),
    productSearchCount: document.querySelector('[data-product-search-count]'),
    orders: document.querySelector('[data-admin-orders]'),
    logoutButton: document.querySelector('[data-logout-button]'),
    openFormButton: document.querySelector('[data-open-product-form]'),
    modal: document.querySelector('[data-product-modal]'),
    duplicateModal: document.querySelector('[data-duplicate-modal]'),
    duplicateForm: document.querySelector('[data-duplicate-form]'),
    duplicateMessage: document.querySelector('[data-duplicate-message]'),
    duplicateSource: document.querySelector('[data-duplicate-source]'),
    createDuplicateButton: document.querySelector('[data-create-duplicate]'),
    form: document.querySelector('[data-product-form]'),
    formTitle: document.querySelector('[data-form-title]'),
    formMessage: document.querySelector('[data-form-message]'),
    existingImages: document.querySelector('[data-existing-images]'),
    saveButton: document.querySelector('[data-save-product]'),
    formatSpecificationsButton: document.querySelector('[data-format-specifications]'),
    previewSpecificationsButton: document.querySelector('[data-preview-specifications]'),
    clearSpecificationsButton: document.querySelector('[data-clear-specifications]'),
    formatOverviewButton: document.querySelector('[data-format-overview]'),
    previewOverviewButton: document.querySelector('[data-preview-overview]'),
    clearOverviewButton: document.querySelector('[data-clear-overview]'),
    overviewPreview: document.querySelector('[data-overview-preview]'),
    overviewCount: document.querySelector('[data-overview-count]'),
    specificationsPreview: document.querySelector('[data-specifications-preview]'),
    specificationsCount: document.querySelector('[data-specifications-count]'),
    openBannerFormButton: document.querySelector('[data-open-banner-form]'),
    bannerForm: document.querySelector('[data-banner-form]'),
    bannerMessage: document.querySelector('[data-banner-message]'),
    banners: document.querySelector('[data-admin-banners]'),
    saveBannerButton: document.querySelector('[data-save-banner]'),
    cancelBannerFormButton: document.querySelector('[data-cancel-banner-form]'),
    rightBannerForm: document.querySelector('[data-right-banner-form]'),
    rightBannerMessage: document.querySelector('[data-right-banner-message]'),
    rightBannerPreview: document.querySelector('[data-right-banner-preview]'),
    rightBannerCurrent: document.querySelector('[data-admin-right-banner-current]'),
    saveRightBannerButton: document.querySelector('[data-save-right-banner]'),
    deleteRightBannerButton: document.querySelector('[data-delete-right-banner]'),
  };

  let products = [];

  const getNextProductSortOrder = () => {
    const maxOrder = products.reduce((max, product) => {
      const value = Number(product.sort_order);
      return Number.isFinite(value) ? Math.max(max, value) : max;
    }, 0);
    return maxOrder + 1;
  };

  let editingProduct = null;
  let duplicatingProduct = null;
  let productIdManuallyEdited = false;
  let productSearchTerm = '';
  let productSearchTimer = null;
  let removedProductImages = new Set();
  let currentProductImages = [];
  let banners = [];
  let editingBanner = null;
  let rightBanner = null;
  let orders = [];

  const orderStatusLabels = {
    new: 'Đơn mới',
    contacted: 'Đã liên hệ',
    completed: 'Hoàn tất',
    cancelled: 'Đã huỷ',
  };

  const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
  const showMessage = (node, text = '', type = '') => {
    if (!node) return;
    node.textContent = text;
    node.className = `admin-message${type ? ` admin-message--${type}` : ''}`;
  };
  const normalizeText = (value = '') => String(value).trim();
  const normalizeSearchText = (value = '') => String(value || '')
    .toLocaleLowerCase('vi-VN')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, ' ')
    .trim();
  const slugify = (value = '') => normalizeText(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const generateProductId = (brand, model, size) => slugify(`${brand} ${model} ${size}`);
  const sanitizeFileName = (name = '') => {
    const parts = name.split('.');
    const extension = parts.length > 1 ? `.${slugify(parts.pop())}` : '';
    const base = slugify(parts.join('.') || 'anh-minh-store') || `anh-minh-store-${Date.now()}`;
    return `${base}-${Date.now()}${extension}`;
  };
  const sanitizeBannerFileName = (name = '') => {
    const parts = name.split('.');
    const extension = parts.length > 1 ? `.${slugify(parts.pop())}` : '';
    const base = slugify(parts.join('.') || 'anh-minh-store-banner') || 'anh-minh-store-banner';
    return `${Date.now()}-${base}${extension}`;
  };
  const getBannerStorageObjectPath = (storagePath = '') => normalizeText(storagePath).replace(/^site-banners\//, '');
  const getFormField = (name) => dom.form?.elements?.[name] || dom.form?.[name] || null;
  const parseLines = (value = '') => value.split('\n').map((line) => line.trim()).filter(Boolean);
  const overviewHeadingNames = [
    'Thiết kế',
    'Công nghệ hình ảnh',
    'Công nghệ âm thanh',
    'Tiện ích thông minh',
    'Hệ điều hành',
    'Trải nghiệm giải trí',
    'Trải nghiệm chơi game',
    'Kết nối',
    'Lắp đặt',
    'Bảo hành',
    'Tổng quan',
    'Tổng quan sản phẩm',
    'Đặc điểm nổi bật',
  ];
  const normalizeHeadingKey = (value = '') => normalizeText(value).replace(/:$/, '').toLocaleLowerCase('vi-VN');
  const normalizedOverviewHeadings = new Map(overviewHeadingNames.map((heading) => [normalizeHeadingKey(heading), heading]));
  const cleanOverviewContent = (lines = []) => lines
    .join('\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  const tryParseJsonArray = (value = '') => {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : null;
    } catch (error) {
      return null;
    }
  };
  const normalizeOverviewSections = (overview = []) => {
    if (!Array.isArray(overview)) return [];
    return overview
      .map((section) => {
        const title = normalizeText(section?.title || section?.heading || 'Tổng quan sản phẩm').replace(/:$/, '').trim() || 'Tổng quan sản phẩm';
        const content = cleanOverviewContent(Array.isArray(section?.paragraphs) ? section.paragraphs : String(section?.content || '').split('\n'));
        return { title, content };
      })
      .filter((section) => section.content);
  };
  const isSentenceLikeLine = (line = '') => /[.!?…]$/.test(normalizeText(line));
  const findNextOverviewLine = (lines, startIndex) => {
    for (let index = startIndex + 1; index < lines.length; index += 1) {
      if (normalizeText(lines[index])) return index;
    }
    return -1;
  };
  const getOverviewHeading = (line = '', lines = [], index = 0) => {
    const text = normalizeText(line);
    if (!text) return '';
    const headingText = text.replace(/:$/, '').trim();
    const knownHeading = normalizedOverviewHeadings.get(normalizeHeadingKey(text));
    const nextIndex = findNextOverviewLine(lines, index);
    if (nextIndex === -1) return '';
    if (knownHeading) return headingText;
    if (text.length > 80 || isSentenceLikeLine(text) || text.includes('|')) return '';
    return headingText;
  };
  const parseOverview = (rawText = '') => {
    const text = String(rawText || '').replace(/\r\n?/g, '\n').trim();
    if (!text) return [];
    const jsonOverview = tryParseJsonArray(text);
    if (jsonOverview) return normalizeOverviewSections(jsonOverview);

    const lines = text.split('\n').map((line) => line.trim());
    const sections = [];
    let currentTitle = '';
    let currentLines = [];

    const flushSection = () => {
      const content = cleanOverviewContent(currentLines);
      if (content) sections.push({ title: currentTitle || 'Tổng quan sản phẩm', content });
      currentLines = [];
    };

    lines.forEach((line, index) => {
      const heading = getOverviewHeading(line, lines, index);
      if (heading) {
        flushSection();
        currentTitle = heading;
        return;
      }

      if (!normalizeText(line)) {
        if (currentLines.length && currentLines[currentLines.length - 1] !== '') currentLines.push('');
        return;
      }
      currentLines.push(line);
    });

    flushSection();
    return normalizeOverviewSections(sections);
  };
  const specificationGroupNames = [
    'Tổng quan',
    'Tổng quan sản phẩm',
    'Công nghệ hình ảnh',
    'Tiện ích',
    'Công nghệ âm thanh',
    'Cổng kết nối',
    'Thông tin lắp đặt',
    'Xuất xứ và bảo hành',
    'Truyền hình và phát sóng',
    'Kết nối',
    'Thiết kế và lắp đặt',
    'Điện năng và tiết kiệm năng lượng',
    'Phụ kiện',
  ];
  const normalizedSpecificationGroups = new Map(specificationGroupNames.map((group) => [group.toLocaleLowerCase('vi-VN'), group]));
  const stripValueMarker = (line = '') => normalizeText(line).replace(/^[-–—•*]+\s*/, '');
  const isSpecificationGroupHeading = (line = '') => {
    const text = normalizeText(line);
    if (!text || text.endsWith(':') || text.includes('|')) return '';
    return normalizedSpecificationGroups.get(text.toLocaleLowerCase('vi-VN')) || '';
  };
  const formatSpecificationValue = (lines = []) => {
    const values = lines.map(stripValueMarker).filter(Boolean);
    if (values.length <= 1) return values[0] || '';
    return values.map((line) => `• ${line}`).join('\n');
  };
  const parseSpecifications = (rawText = '') => {
    const lines = parseLines(rawText);
    if (!lines.length) return [];

    const groups = [];
    let currentGroup = 'Tổng quan';
    let currentLabel = '';
    let currentValueLines = [];

    const ensureGroup = (groupName) => {
      const group = normalizeText(groupName) || 'Tổng quan';
      let target = groups.find((item) => item.group === group);
      if (!target) {
        target = { group, rows: [] };
        groups.push(target);
      }
      return target;
    };

    const addRow = (groupName, label, value) => {
      const cleanLabel = normalizeText(label).replace(/:$/, '').trim();
      const cleanValue = normalizeText(value);
      if (!cleanLabel || !cleanValue) return;
      ensureGroup(groupName).rows.push({ label: cleanLabel, value: cleanValue });
    };

    const flushCurrentRow = () => {
      if (!currentLabel) return;
      addRow(currentGroup, currentLabel, formatSpecificationValue(currentValueLines));
      currentLabel = '';
      currentValueLines = [];
    };

    lines.forEach((line) => {
      const pipeParts = line.split('|').map((part) => part.trim());
      if (pipeParts.length >= 3 && pipeParts[0] && pipeParts[1] && pipeParts.slice(2).join(' | ').trim()) {
        flushCurrentRow();
        addRow(pipeParts[0], pipeParts[1], pipeParts.slice(2).join(' | '));
        return;
      }

      const groupHeading = isSpecificationGroupHeading(line);
      if (groupHeading) {
        flushCurrentRow();
        currentGroup = groupHeading;
        ensureGroup(currentGroup);
        return;
      }

      const labelMatch = line.match(/^(.+?):\s*(.*)$/);
      if (labelMatch) {
        flushCurrentRow();
        currentLabel = labelMatch[1];
        currentValueLines = labelMatch[2] ? [labelMatch[2]] : [];
        return;
      }

      if (currentLabel) currentValueLines.push(line);
    });

    flushCurrentRow();
    return groups.filter((group) => group.rows.length);
  };
  const stringifySpecificationsForAdmin = (specifications = []) => {
    if (typeof specifications === 'string') return specifications;
    if (!Array.isArray(specifications)) return '';
    return specifications
      .map((group) => {
        const rows = Array.isArray(group?.rows) ? group.rows : [];
        const rowText = rows
          .map((row) => {
            const label = normalizeText(row?.label || row?.name || '');
            const rawValue = Array.isArray(row?.value) ? row.value.map((item) => `• ${stripValueMarker(item)}`).join('\n') : normalizeText(row?.value || '');
            if (!label || !rawValue) return '';
            return `${label}:\n${rawValue}`;
          })
          .filter(Boolean)
          .join('\n');
        if (!rowText) return '';
        return `${normalizeText(group?.group || group?.title || 'Tổng quan')}\n${rowText}`;
      })
      .filter(Boolean)
      .join('\n\n');
  };
  const stringifyOverviewForAdmin = (overview = []) => {
    const sections = typeof overview === 'string' ? parseOverview(overview) : normalizeOverviewSections(overview);
    if (!sections.length) return '';
    return sections
      .map((section) => {
        const title = normalizeText(section?.title || 'Tổng quan sản phẩm');
        const content = cleanOverviewContent(String(section?.content || '').split('\n'));
        if (!title && !content) return '';
        return [title, content].filter(Boolean).join('\n');
      })
      .filter(Boolean)
      .join('\n\n');
  };

  const requireSupabase = () => {
    if (!supabaseState.isConfigured || !client) {
      showLoginOnly();
      showMessage(dom.loginMessage, supabaseState.missingMessage || 'Chưa cấu hình Supabase. Vui lòng kiểm tra supabase-config.js.', 'error');
      return false;
    }
    return true;
  };
  const showLoginOnly = () => { if (dom.loginSection) dom.loginSection.hidden = false; if (dom.dashboard) dom.dashboard.hidden = true; };
  const showDashboard = () => { if (dom.loginSection) dom.loginSection.hidden = true; if (dom.dashboard) dom.dashboard.hidden = false; };

  const isAdmin = async () => {
    const { data: { user } } = await client.auth.getUser();
    if (!user) return false;
    const { data, error } = await client.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (error) throw error;
    return data?.role === 'admin';
  };

  const loadProducts = async () => {
    showMessage(dom.adminMessage, 'Đang tải danh sách sản phẩm...');
    try {
      const { data, error } = await client.from('products').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false });
      if (error) throw error;
      products = Array.isArray(data) ? data : [];
      renderProducts();
      showMessage(dom.adminMessage, '');
    } catch (error) {
      console.warn(error);
      showMessage(dom.adminMessage, 'Không thể kết nối dữ liệu. Vui lòng thử lại.', 'error');
    }
  };

  const serializeSearchValue = (value) => {
    if (Array.isArray(value)) return value.map(serializeSearchValue).join(' ');
    if (value && typeof value === 'object') return Object.values(value).map(serializeSearchValue).join(' ');
    return normalizeText(value);
  };

  const getProductSearchText = (product = {}) => normalizeSearchText([
    product.id,
    product.brand,
    product.model,
    product.full_name || product.fullName,
    product.size,
    product.type,
    product.condition,
    product.warranty,
    product.price,
    product.old_price || product.oldPrice,
    product.badge,
    product.description,
    serializeSearchValue(product.features),
    serializeSearchValue(product.overview),
    serializeSearchValue(product.specifications),
  ].filter(Boolean).join(' '));

  const getFilteredProducts = () => {
    const term = normalizeSearchText(productSearchTerm);
    if (!term) return products;
    return products.filter((product) => getProductSearchText(product).includes(term));
  };

  const updateProductSearchCount = (count) => {
    if (dom.productSearchCount) dom.productSearchCount.textContent = `Đang hiển thị ${count}/${products.length} sản phẩm`;
    if (dom.productSearchClear) dom.productSearchClear.disabled = !normalizeText(productSearchTerm);
  };

  const renderProducts = () => {
    if (!dom.products) return;
    const filteredProducts = getFilteredProducts();
    updateProductSearchCount(filteredProducts.length);
    if (!products.length) {
      dom.products.innerHTML = '<p class="admin-empty">Chưa có sản phẩm nào.</p>';
      return;
    }
    if (!filteredProducts.length) {
      dom.products.innerHTML = '<p class="admin-empty">Không tìm thấy sản phẩm phù hợp.</p>';
      return;
    }
    dom.products.innerHTML = filteredProducts.map((product) => `
      <article class="admin-product-card" data-product-id="${escapeHtml(product.id)}">
        <div>
          <p class="admin-product-card__brand">${escapeHtml(product.brand)} · ${escapeHtml(product.model)}</p>
          <h2>${escapeHtml(product.full_name || product.fullName || product.model)}</h2>
          <p>${escapeHtml(product.size)} · ${escapeHtml(product.type)} · ${escapeHtml(product.price)}</p>
          <span class="admin-status ${product.is_active ? 'is-active' : 'is-hidden'}">${product.is_active ? 'Hiển thị' : 'Ẩn'}</span>
          <span class="admin-status ${product.is_featured ? 'is-active' : 'is-hidden'}">${product.is_featured ? 'Nổi bật' : 'Không nổi bật'}</span>
        </div>
        <div class="admin-product-card__actions">
          <button type="button" class="btn btn--secondary" data-edit-product="${escapeHtml(product.id)}">Sửa</button>
          <button type="button" class="btn btn--secondary admin-duplicate-button" data-duplicate-product="${escapeHtml(product.id)}">Nhân bản</button>
          <button type="button" class="btn btn--ghost" data-toggle-product="${escapeHtml(product.id)}">${product.is_active ? 'Ẩn' : 'Hiện'}</button>
          <button type="button" class="btn btn--danger" data-delete-product="${escapeHtml(product.id)}">Xoá</button>
        </div>
      </article>`).join('');
  };


  const formatDateTime = (value = '') => {
    if (!value) return 'Chưa có thời gian';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return normalizeText(value);
    return date.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
  };

  const loadOrders = async () => {
    if (!dom.orders) return;
    try {
      const { data, error } = await client.from('orders').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      orders = Array.isArray(data) ? data : [];
      renderOrders();
    } catch (error) {
      console.warn(error);
      dom.orders.innerHTML = '<p class="admin-empty">Không thể tải đơn hàng. Vui lòng kiểm tra bảng orders.</p>';
    }
  };

  const renderOrders = () => {
    if (!dom.orders) return;
    if (!orders.length) {
      dom.orders.innerHTML = '<p class="admin-empty">Chưa có đơn hàng nào.</p>';
      return;
    }

    dom.orders.innerHTML = orders.map((order) => {
      const status = order.status || 'new';
      const productText = [order.product_name, order.product_model].filter(Boolean).join(' · ') || 'Sản phẩm chưa cập nhật';
      return `
        <article class="admin-order-card" data-order-id="${escapeHtml(order.id)}">
          <div class="admin-order-card__main">
            <p class="admin-product-card__brand">${escapeHtml(order.customer_name || 'Khách hàng')}</p>
            <h2>${escapeHtml(productText)}</h2>
            <dl class="admin-order-meta">
              <div><dt>Số điện thoại</dt><dd>${escapeHtml(order.customer_phone || 'Chưa có')}</dd></div>
              <div><dt>Giá bán</dt><dd>${escapeHtml(order.product_price || 'Chưa cập nhật')}</dd></div>
              <div><dt>Ghi chú</dt><dd>${escapeHtml(order.customer_note || 'Không có')}</dd></div>
              <div><dt>Thời gian</dt><dd>${escapeHtml(formatDateTime(order.created_at))}</dd></div>
            </dl>
          </div>
          <div class="admin-order-card__status">
            <label for="order-status-${escapeHtml(order.id)}">Trạng thái</label>
            <select id="order-status-${escapeHtml(order.id)}" data-order-status="${escapeHtml(order.id)}">
              ${Object.entries(orderStatusLabels).map(([value, label]) => `<option value="${value}"${value === status ? ' selected' : ''}>${label}</option>`).join('')}
            </select>
          </div>
        </article>`;
    }).join('');
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const { error } = await client.from('orders').update({ status }).eq('id', orderId);
      if (error) throw error;
      const order = orders.find((item) => String(item.id) === String(orderId));
      if (order) order.status = status;
      showMessage(dom.adminMessage, 'Đã cập nhật trạng thái đơn hàng.', 'success');
    } catch (error) {
      console.warn(error);
      showMessage(dom.adminMessage, 'Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại.', 'error');
      await loadOrders();
    }
  };


  const loadBanners = async () => {
    if (!dom.banners) return;
    try {
      const { data, error } = await client
        .from('hero_banners')
        .select('*')
        .eq('placement', 'home_main_carousel')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });
      if (error) throw error;
      banners = Array.isArray(data) ? data : [];
      renderBanners();
    } catch (error) {
      console.warn(error);
      showMessage(dom.adminMessage, 'Không thể tải danh sách banner. Vui lòng kiểm tra bảng hero_banners.', 'error');
    }
  };

  const renderBanners = () => {
    if (!dom.banners) return;
    if (!banners.length) {
      dom.banners.innerHTML = '<p class="admin-empty">Chưa có ảnh banner nào.</p>';
      return;
    }
    dom.banners.innerHTML = banners.map((banner) => `
      <article class="admin-banner-card" data-banner-id="${escapeHtml(banner.id)}">
        <div class="admin-banner-card__thumb">
          <img src="${escapeHtml(banner.image_url)}" alt="${escapeHtml(banner.alt_text || banner.title || 'Ảnh banner trang chủ')}" loading="lazy" />
        </div>
        <div>
          <h3>${escapeHtml(banner.title || 'Ảnh banner trang chủ')}</h3>
          <p>Thứ tự: ${Number(banner.sort_order || 0)} · ${banner.is_active ? 'Đang hiển thị' : 'Đang ẩn'}</p>
          <span class="admin-status ${banner.is_active ? 'is-active' : 'is-hidden'}">${banner.is_active ? 'Hiển thị' : 'Ẩn'}</span>
        </div>
        <div class="admin-banner-card__actions">
          <button type="button" class="btn btn--secondary" data-edit-banner="${escapeHtml(banner.id)}">Sửa</button>
          <button type="button" class="btn btn--ghost" data-toggle-banner="${escapeHtml(banner.id)}">${banner.is_active ? 'Ẩn' : 'Hiện'}</button>
          <button type="button" class="btn btn--danger" data-delete-banner="${escapeHtml(banner.id)}">Xoá</button>
        </div>
      </article>`).join('');
  };

  const openBannerForm = (banner = null) => {
    editingBanner = banner;
    dom.bannerForm?.reset();
    showMessage(dom.bannerMessage, '');
    if (dom.bannerForm) {
      dom.bannerForm.hidden = false;
      dom.bannerForm.bannerId.value = banner?.id || '';
      dom.bannerForm.existingImageUrl.value = banner?.image_url || '';
      dom.bannerForm.existingStoragePath.value = banner?.storage_path || '';
      dom.bannerForm.title.value = banner?.title || '';
      dom.bannerForm.altText.value = banner?.alt_text || '';
      dom.bannerForm.sortOrder.value = banner?.sort_order ?? 0;
      dom.bannerForm.isActive.value = String(banner ? Boolean(banner.is_active) : true);
      setTimeout(() => dom.bannerForm?.title?.focus(), 0);
    }
  };

  const closeBannerForm = () => {
    if (dom.bannerForm) dom.bannerForm.hidden = true;
    editingBanner = null;
    showMessage(dom.bannerMessage, '');
  };

  const validateBannerFile = (file) => {
    if (!file) return true;
    if (!allowedBannerTypes.has(file.type) || file.size > maxBannerFileSize) {
      showMessage(dom.bannerMessage, 'Ảnh banner phải là JPG, PNG hoặc WebP và dung lượng tối đa khoảng 10MB.', 'error');
      return false;
    }
    return true;
  };

  const uploadBannerFile = async (file) => {
    const objectPath = sanitizeBannerFileName(file.name);
    const { error } = await client.storage.from(bannerBucketName).upload(objectPath, file, { cacheControl: '3600', upsert: false });
    if (error) throw error;
    const { data } = client.storage.from(bannerBucketName).getPublicUrl(objectPath);
    return { imageUrl: data?.publicUrl || '', storagePath: `${bannerBucketName}/${objectPath}` };
  };

  const handleBannerSave = async (event) => {
    event.preventDefault();
    const form = dom.bannerForm;
    if (!form) return;
    const file = form.bannerImage.files?.[0];
    if (!editingBanner && !file) {
      showMessage(dom.bannerMessage, 'Vui lòng chọn ảnh banner.', 'error');
      form.bannerImage.focus();
      return;
    }
    if (!validateBannerFile(file)) return;
    dom.saveBannerButton.disabled = true;
    try {
      let imageUrl = form.existingImageUrl.value;
      let storagePath = form.existingStoragePath.value;
      if (file) {
        showMessage(dom.bannerMessage, 'Đang tải ảnh banner lên...', 'info');
        const uploaded = await uploadBannerFile(file);
        imageUrl = uploaded.imageUrl;
        storagePath = uploaded.storagePath;
      }
      const payload = {
        title: normalizeText(form.title.value) || null,
        image_url: imageUrl,
        storage_path: storagePath || null,
        alt_text: normalizeText(form.altText.value) || normalizeText(form.title.value) || 'Ảnh banner trang chủ Anh Minh Store',
        sort_order: Number(form.sortOrder.value || 0),
        is_active: form.isActive.value === 'true',
        placement: 'home_main_carousel',
        updated_at: new Date().toISOString(),
      };
      const { error } = editingBanner
        ? await client.from('hero_banners').update(payload).eq('id', editingBanner.id)
        : await client.from('hero_banners').insert(payload);
      if (error) throw error;
      showMessage(dom.adminMessage, 'Đã lưu ảnh banner.', 'success');
      closeBannerForm();
      await loadBanners();
      await loadRightBanner();
    } catch (error) {
      console.warn(error);
      showMessage(dom.bannerMessage, 'Không thể tải ảnh banner lên. Vui lòng thử lại.', 'error');
    } finally {
      dom.saveBannerButton.disabled = false;
    }
  };

  const toggleBanner = async (banner) => {
    try {
      const { error } = await client.from('hero_banners').update({ is_active: !banner.is_active, updated_at: new Date().toISOString() }).eq('id', banner.id);
      if (error) throw error;
      await loadBanners();
      await loadRightBanner();
    } catch (error) {
      console.warn(error);
      showMessage(dom.adminMessage, 'Không thể cập nhật trạng thái banner. Vui lòng thử lại.', 'error');
    }
  };

  const deleteBanner = async (banner) => {
    if (!window.confirm('Bạn có chắc muốn xoá ảnh banner này không?')) return;
    try {
      const { error } = await client.from('hero_banners').delete().eq('id', banner.id);
      if (error) throw error;
      let storageWarning = false;
      if (banner.storage_path) {
        const { error: storageError } = await client.storage.from(bannerBucketName).remove([getBannerStorageObjectPath(banner.storage_path)]);
        storageWarning = Boolean(storageError);
        if (storageError) console.warn(storageError);
      }
      await loadBanners();
      showMessage(dom.adminMessage, storageWarning ? 'Đã xoá banner khỏi danh sách, nhưng chưa xoá được file trong Storage.' : 'Đã xoá ảnh banner.', storageWarning ? 'info' : 'success');
    } catch (error) {
      console.warn(error);
      showMessage(dom.adminMessage, 'Không thể xoá ảnh banner. Vui lòng thử lại.', 'error');
    }
  };


  const renderRightBannerPreview = (imageUrl = '') => {
    if (!dom.rightBannerPreview) return;
    if (imageUrl) {
      dom.rightBannerPreview.innerHTML = `<img src="${escapeHtml(imageUrl)}" alt="Xem trước banner dọc trang chủ" />`;
      return;
    }
    dom.rightBannerPreview.innerHTML = '<div class="admin-right-banner-preview__placeholder">Chưa có banner dọc</div>';
  };

  const fillRightBannerForm = (banner = null) => {
    const form = dom.rightBannerForm;
    rightBanner = banner;
    if (!form) return;
    form.reset();
    form.bannerId.value = banner?.id || '';
    form.existingImageUrl.value = banner?.image_url || '';
    form.existingStoragePath.value = banner?.storage_path || '';
    form.title.value = banner?.title || '';
    form.linkUrl.value = banner?.link_url || '';
    form.sortOrder.value = banner?.sort_order ?? 0;
    form.isActive.value = String(banner ? Boolean(banner.is_active) : true);
    dom.deleteRightBannerButton.hidden = !banner?.id;
    renderRightBannerPreview(banner?.image_url || '');
  };

  const renderRightBannerCurrent = () => {
    if (!dom.rightBannerCurrent) return;
    if (!rightBanner?.id) {
      dom.rightBannerCurrent.innerHTML = '<p class="admin-empty">Chưa có banner dọc trang chủ. Khi chưa có banner, website sẽ hiển thị khung gợi ý mặc định.</p>';
      return;
    }
    dom.rightBannerCurrent.innerHTML = `
      <article class="admin-banner-card admin-right-banner-current-card">
        <div class="admin-banner-card__thumb admin-banner-card__thumb--vertical">
          <img src="${escapeHtml(rightBanner.image_url)}" alt="${escapeHtml(rightBanner.title || 'Banner dọc trang chủ')}" loading="lazy" />
        </div>
        <div>
          <h3>${escapeHtml(rightBanner.title || 'Banner dọc trang chủ 9:16')}</h3>
          <p>Vị trí: home_right_9_16 · Thứ tự: ${Number(rightBanner.sort_order || 0)}</p>
          <p>${rightBanner.link_url ? `Link: ${escapeHtml(rightBanner.link_url)}` : 'Không có link'}</p>
          <span class="admin-status ${rightBanner.is_active ? 'is-active' : 'is-hidden'}">${rightBanner.is_active ? 'Đang hiển thị' : 'Tạm ẩn'}</span>
        </div>
      </article>`;
  };

  const loadRightBanner = async () => {
    if (!dom.rightBannerForm) return;
    try {
      const { data, error } = await client
        .from('hero_banners')
        .select('*')
        .eq('placement', 'home_right_9_16')
        .order('is_active', { ascending: false })
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      fillRightBannerForm(data || null);
      renderRightBannerCurrent();
    } catch (error) {
      console.warn(error);
      showMessage(dom.rightBannerMessage, 'Không thể tải banner dọc. Vui lòng kiểm tra cột placement/link_url trong bảng hero_banners.', 'error');
      fillRightBannerForm(null);
      renderRightBannerCurrent();
    }
  };

  const validateRightBannerFile = (file) => {
    if (!file) return true;
    if (!allowedBannerTypes.has(file.type) || file.size > maxBannerFileSize) {
      showMessage(dom.rightBannerMessage, 'Ảnh banner dọc phải là JPG, PNG hoặc WebP và dung lượng tối đa khoảng 10MB.', 'error');
      return false;
    }
    return true;
  };

  const handleRightBannerSave = async (event) => {
    event.preventDefault();
    const form = dom.rightBannerForm;
    if (!form) return;
    const file = form.bannerImage.files?.[0];
    if (!rightBanner && !file) {
      showMessage(dom.rightBannerMessage, 'Vui lòng chọn ảnh banner dọc trước khi lưu.', 'error');
      form.bannerImage.focus();
      return;
    }
    if (!validateRightBannerFile(file)) return;
    dom.saveRightBannerButton.disabled = true;
    try {
      let imageUrl = form.existingImageUrl.value;
      let storagePath = form.existingStoragePath.value;
      if (file) {
        showMessage(dom.rightBannerMessage, 'Đang tải ảnh banner dọc lên Supabase Storage...', 'info');
        const uploaded = await uploadBannerFile(file);
        imageUrl = uploaded.imageUrl;
        storagePath = uploaded.storagePath;
      }
      const payload = {
        placement: 'home_right_9_16',
        title: normalizeText(form.title.value) || 'Ưu đãi nổi bật',
        image_url: imageUrl,
        storage_path: storagePath || null,
        link_url: normalizeText(form.linkUrl.value) || null,
        sort_order: Number(form.sortOrder.value || 0),
        is_active: form.isActive.value === 'true',
        updated_at: new Date().toISOString(),
      };
      const { error } = rightBanner?.id
        ? await client.from('hero_banners').update(payload).eq('id', rightBanner.id)
        : await client.from('hero_banners').insert(payload);
      if (error) throw error;
      showMessage(dom.rightBannerMessage, 'Đã lưu banner dọc trang chủ.', 'success');
      await loadRightBanner();
    } catch (error) {
      console.warn(error);
      showMessage(dom.rightBannerMessage, 'Không thể lưu banner dọc. Vui lòng thử lại.', 'error');
    } finally {
      dom.saveRightBannerButton.disabled = false;
    }
  };

  const deleteRightBanner = async () => {
    if (!rightBanner?.id) return;
    if (!window.confirm('Bạn có chắc muốn xoá banner dọc trang chủ này không?')) return;
    try {
      const deletingBanner = rightBanner;
      const { error } = await client.from('hero_banners').delete().eq('id', deletingBanner.id);
      if (error) throw error;
      let storageWarning = false;
      if (deletingBanner.storage_path) {
        const { error: storageError } = await client.storage.from(bannerBucketName).remove([getBannerStorageObjectPath(deletingBanner.storage_path)]);
        storageWarning = Boolean(storageError);
        if (storageError) console.warn(storageError);
      }
      fillRightBannerForm(null);
      renderRightBannerCurrent();
      showMessage(dom.rightBannerMessage, storageWarning ? 'Đã xoá banner dọc khỏi dữ liệu, nhưng chưa xoá được file trong Storage.' : 'Đã xoá banner dọc trang chủ.', storageWarning ? 'info' : 'success');
    } catch (error) {
      console.warn(error);
      showMessage(dom.rightBannerMessage, 'Không thể xoá banner dọc. Vui lòng thử lại.', 'error');
    }
  };


  const getSpecificationCounts = (specifications = []) => ({
    groups: specifications.length,
    rows: specifications.reduce((total, group) => total + (Array.isArray(group.rows) ? group.rows.length : 0), 0),
  });

  const renderPreviewValue = (value = '') => escapeHtml(value).replace(/\n/g, '<br />');

  const updateSpecificationPreview = (specifications = [], { showEmpty = true } = {}) => {
    if (!dom.specificationsPreview || !dom.specificationsCount) return;
    const counts = getSpecificationCounts(specifications);
    dom.specificationsCount.textContent = counts.rows ? `Đã nhận diện ${counts.groups} nhóm thông số, ${counts.rows} dòng thông số.` : '';

    if (!counts.rows) {
      dom.specificationsPreview.hidden = !showEmpty;
      dom.specificationsPreview.innerHTML = showEmpty ? '<p>Chưa có thông số để xem trước.</p>' : '';
      return;
    }

    dom.specificationsPreview.hidden = false;
    dom.specificationsPreview.innerHTML = specifications.map((group) => `
      <section class="admin-spec-preview__group">
        <h3>${escapeHtml(group.group)}</h3>
        <dl>
          ${(group.rows || []).map((row) => `
            <div class="admin-spec-preview__row">
              <dt>${escapeHtml(row.label)}</dt>
              <dd>${renderPreviewValue(row.value)}</dd>
            </div>`).join('')}
        </dl>
      </section>`).join('');
  };

  const clearSpecificationPreview = () => {
    if (dom.specificationsPreview) {
      dom.specificationsPreview.hidden = true;
      dom.specificationsPreview.innerHTML = '';
    }
    if (dom.specificationsCount) dom.specificationsCount.textContent = '';
  };

  const renderOverviewPreview = (overview = [], { showEmpty = true } = {}) => {
    if (!dom.overviewPreview || !dom.overviewCount) return;
    const sections = normalizeOverviewSections(overview);
    dom.overviewCount.textContent = sections.length ? `Đã nhận diện ${sections.length} mục tổng quan.` : '';

    if (!sections.length) {
      dom.overviewPreview.hidden = !showEmpty;
      dom.overviewPreview.innerHTML = showEmpty ? '<p>Chưa có nội dung tổng quan để xem trước.</p>' : '';
      return;
    }

    dom.overviewPreview.hidden = false;
    dom.overviewPreview.innerHTML = `
      <h3 class="admin-overview-preview__heading">Xem trước tổng quan</h3>
      ${sections.map((section) => `
      <section class="admin-overview-preview__section overview-preview-section overview-section">
        ${section.title ? `<h4 class="overview-preview-title overview-section-title">${escapeHtml(section.title)}</h4>` : ''}
        <div class="overview-preview-content overview-section-content">${escapeHtml(section.content || '')}</div>
      </section>`).join('')}
    `;
  };

  const clearOverviewPreview = () => {
    if (dom.overviewPreview) {
      dom.overviewPreview.hidden = true;
      dom.overviewPreview.innerHTML = '';
    }
    if (dom.overviewCount) dom.overviewCount.textContent = '';
  };

  const handleOverviewAction = ({ format = false } = {}) => {
    const textarea = getFormField('overview');
    if (!textarea) return [];
    try {
      if (!normalizeText(textarea.value)) {
        clearOverviewPreview();
        showMessage(dom.formMessage, 'Vui lòng nhập nội dung tổng quan trước.', 'error');
        textarea.focus();
        return [];
      }
      const overview = parseOverview(textarea.value);
      if (!overview.length) throw new Error('Không nhận diện được tổng quan.');
      if (format) textarea.value = stringifyOverviewForAdmin(overview);
      renderOverviewPreview(overview);
      if (format) showMessage(dom.formMessage, 'Đã tự động căn tổng quan sản phẩm.', 'success');
      return overview;
    } catch (error) {
      console.warn(error);
      showMessage(dom.formMessage, 'Không thể tự động căn tổng quan. Vui lòng kiểm tra lại nội dung nhập.', 'error');
      return null;
    }
  };

  const handleAutoFormatOverview = (event) => {
    event?.preventDefault();
    return handleOverviewAction({ format: true });
  };

  const handlePreviewOverview = (event) => {
    event?.preventDefault();
    return handleOverviewAction();
  };

  const handleSpecificationAction = ({ format = false } = {}) => {
    const textarea = dom.form?.specifications;
    if (!textarea) return [];
    try {
      const specifications = parseSpecifications(textarea.value);
      if (format) textarea.value = stringifySpecificationsForAdmin(specifications);
      updateSpecificationPreview(specifications);
      if (format) showMessage(dom.formMessage, 'Đã tự động căn thông số chi tiết.', 'success');
      return specifications;
    } catch (error) {
      console.warn(error);
      showMessage(dom.formMessage, 'Không thể tự động căn thông số. Vui lòng kiểm tra lại nội dung nhập.', 'error');
      return null;
    }
  };

  const getUniqueProductImages = (product = {}) => Array.from(new Set([product?.image, ...(Array.isArray(product?.images) ? product.images : [])].filter(Boolean)));

  const openForm = (product = null) => {
    editingProduct = product;
    productIdManuallyEdited = Boolean(product);
    removedProductImages = new Set();
    currentProductImages = product ? getUniqueProductImages(product) : [];
    dom.form?.reset();
    showMessage(dom.formMessage, '');
    clearOverviewPreview();
    clearSpecificationPreview();
    if (dom.formTitle) dom.formTitle.textContent = product ? 'Sửa sản phẩm' : 'Thêm sản phẩm';
    if (dom.modal) dom.modal.hidden = false;
    document.body.classList.add('admin-modal-open');
    const form = dom.form;
    if (form && !product) {
      form.isFeatured.value = 'false';
      form.isActive.value = 'true';
      form.sortOrder.value = getNextProductSortOrder();
    }
    if (form && product) {
      form.editingOriginalId.value = product.id || '';
      form.brand.value = product.brand || '';
      form.model.value = product.model || '';
      form.fullName.value = product.full_name || product.fullName || '';
      form.size.value = product.size || '';
      form.type.value = product.type || '';
      form.id.value = product.id || '';
      form.condition.value = product.condition || '';
      form.warranty.value = product.warranty || '';
      form.oldPrice.value = product.old_price || product.oldPrice || '';
      form.price.value = product.price || '';
      form.badge.value = product.badge || '';
      form.sortOrder.value = product.sort_order ?? getNextProductSortOrder();
      form.isFeatured.value = product.is_featured === true ? 'true' : 'false';
      form.description.value = product.description || '';
      form.features.value = Array.isArray(product.features) ? product.features.join('\n') : '';
      form.overview.value = stringifyOverviewForAdmin(product.overview || []);
      renderOverviewPreview(parseOverview(form.overview.value), { showEmpty: false });
      form.specifications.value = stringifySpecificationsForAdmin(product.specifications ?? product.specificationsText ?? []);
      updateSpecificationPreview(parseSpecifications(form.specifications.value), { showEmpty: false });
      form.isActive.value = String(product.is_active !== false);
    }
    renderExistingImages();
    setTimeout(() => form?.brand?.focus(), 0);
  };

  const closeForm = () => {
    if (dom.modal) dom.modal.hidden = true;
    document.body.classList.remove('admin-modal-open');
    editingProduct = null;
    removedProductImages = new Set();
    currentProductImages = [];
  };

  const renderExistingImages = () => {
    if (!dom.existingImages) return;
    const unique = Array.from(new Set(currentProductImages.filter(Boolean)));
    dom.existingImages.innerHTML = unique.length ? unique.map((src) => `
      <div class="admin-existing-image-item">
        <img src="${escapeHtml(src)}" alt="Ảnh sản phẩm hiện có" loading="lazy" />
        <button class="admin-existing-image-remove" type="button" data-remove-existing-image="${escapeHtml(src)}" aria-label="Xoá ảnh sản phẩm hiện có">Xoá</button>
      </div>`).join('') : 'Chưa có ảnh.';
  };

  const removeExistingImage = (imageUrl = '') => {
    const url = normalizeText(imageUrl);
    if (!url) return;
    currentProductImages = currentProductImages.filter((image) => image !== url);
    removedProductImages.add(url);
    renderExistingImages();
    showMessage(dom.formMessage, 'Đã bỏ ảnh khỏi sản phẩm. Bấm Lưu sản phẩm để lưu thay đổi.', 'info');
  };

  const validateForm = (form) => {
    const checks = [
      ['brand', 'Vui lòng nhập hãng.'],
      ['model', 'Vui lòng nhập model.'],
      ['fullName', 'Vui lòng nhập tên sản phẩm.'],
      ['size', 'Vui lòng chọn kích thước.'],
      ['type', 'Vui lòng chọn loại sản phẩm.'],
      ['price', 'Vui lòng nhập giá bán.'],
    ];
    for (const [name, message] of checks) {
      if (!normalizeText(form[name].value)) {
        showMessage(dom.formMessage, message, 'error');
        form[name].focus();
        return false;
      }
    }
    return true;
  };

  const uploadFile = async (file, productId) => {
    const path = `${productId}/${sanitizeFileName(file.name)}`;
    const { error } = await client.storage.from(bucketName).upload(path, file, { cacheControl: '3600', upsert: false });
    if (error) throw error;
    const { data } = client.storage.from(bucketName).getPublicUrl(path);
    return data?.publicUrl || '';
  };

  const uploadImages = async (form, productId) => {
    const mainFile = form.mainImage.files?.[0];
    const galleryFiles = Array.from(form.galleryImages.files || []);
    const removedImages = removedProductImages;
    let images = Array.from(new Set(currentProductImages.filter((url) => url && !removedImages.has(url))));
    if (mainFile || galleryFiles.length) showMessage(dom.formMessage, 'Đang tải ảnh lên...', 'info');
    try {
      if (mainFile) {
        const image = await uploadFile(mainFile, productId);
        images = [image, ...images.filter((url) => url !== image)];
      }
      for (const file of galleryFiles) {
        const url = await uploadFile(file, productId);
        if (url && !images.includes(url)) images.push(url);
      }
      images = Array.from(new Set(images.filter((url) => url && !removedImages.has(url))));
      return { image: images[0] || '', images };
    } catch (error) {
      console.warn(error);
      throw new Error('Không thể tải ảnh lên. Vui lòng thử lại.');
    }
  };

  const commonTvSizes = ['32', '40', '43', '49', '50', '55', '58', '65', '70', '75', '85', '86', '98', '100'];
  const escapeRegExp = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parseSizeNumber = (sizeText = '') => {
    const text = normalizeText(sizeText);
    if (!text) return '';
    const sizeMatch = text.match(/(?:^|\b)(\d{2,3})(?:\s*(?:-|–|—)?\s*(?:inch|in)\b|\s*["”″]|\b)/i);
    return sizeMatch?.[1] || '';
  };
  const buildSizeReplacementPatterns = (oldSizeNumber = '') => {
    const oldSize = escapeRegExp(oldSizeNumber);
    if (!oldSize) return [];
    return [
      new RegExp(`\\b${oldSize}\\s*(?:-|–|—)?\\s*inch\\b`, 'gi'),
      new RegExp(`\\b${oldSize}\\s*in\\b`, 'gi'),
      new RegExp(`\\b${oldSize}\\s*["”″]`, 'gi'),
    ];
  };
  const replaceSizeText = (value = '', oldSizeNumber = '', newSizeNumber = '') => {
    if (value === null || value === undefined) return value;
    const text = String(value);
    if (!oldSizeNumber || !newSizeNumber) return text;
    return buildSizeReplacementPatterns(oldSizeNumber).reduce(
      (updated, pattern) => updated.replace(pattern, `${newSizeNumber} inch`),
      text,
    );
  };
  const replaceModelSizeNumber = (value = '', oldSizeNumber = '', newSizeNumber = '') => {
    if (value === null || value === undefined) return value;
    const text = String(value);
    if (!oldSizeNumber || !newSizeNumber) return text;
    const oldSize = escapeRegExp(oldSizeNumber);
    const modelTokenPattern = /\b(?=[A-Z0-9]*[A-Z])[A-Z0-9]+\b/g;
    const oldSizeInModelPattern = new RegExp(`(?<!\\d)${oldSize}(?!\\d)`, 'g');

    return text.replace(modelTokenPattern, (token) => {
      if (!oldSizeInModelPattern.test(token)) {
        oldSizeInModelPattern.lastIndex = 0;
        return token;
      }
      oldSizeInModelPattern.lastIndex = 0;
      return token.replace(oldSizeInModelPattern, (match, offset) => {
        const previousChar = token[offset - 1] || '';
        const nextChar = token[offset + match.length] || '';
        const hasSafePrefix = !previousChar || /[A-Z]/.test(previousChar);
        const hasSafeSuffix = /[A-Z]/.test(nextChar);
        return hasSafePrefix && hasSafeSuffix ? newSizeNumber : match;
      });
    });
  };
  const replaceSizeAndModelEverywhere = (value, oldSizeNumber = '', newSizeNumber = '') => {
    if (Array.isArray(value)) return value.map((item) => replaceSizeAndModelEverywhere(item, oldSizeNumber, newSizeNumber));
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([key, item]) => {
        if (['price', 'old_price', 'oldPrice', 'image', 'images'].includes(key)) return [key, item];
        return [key, replaceSizeAndModelEverywhere(item, oldSizeNumber, newSizeNumber)];
      }));
    }
    if (typeof value === 'string') {
      return replaceModelSizeNumber(replaceSizeText(value, oldSizeNumber, newSizeNumber), oldSizeNumber, newSizeNumber);
    }
    return value;
  };
  const deepCloneProduct = (value) => {
    if (typeof structuredClone === 'function') return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
  };
  const getModelSizeNumber = (value = '') => {
    const text = normalizeText(value);
    const tokens = text.match(/\b(?=[A-Z0-9]*[A-Z])[A-Z0-9]+\b/g) || [];
    for (const token of tokens) {
      for (const size of commonTvSizes) {
        const matches = Array.from(token.matchAll(new RegExp(`(?<!\\d)${escapeRegExp(size)}(?!\\d)`, 'g')));
        const hasSafeMatch = matches.some((match) => {
          const previousChar = token[match.index - 1] || '';
          const nextChar = token[match.index + size.length] || '';
          return (!previousChar || /[A-Z]/.test(previousChar)) && /[A-Z]/.test(nextChar);
        });
        if (hasSafeMatch) return size;
      }
    }
    return '';
  };
  const detectProductSizeNumber = (product = {}) => {
    const fields = [product.size, product.full_name || product.fullName, product.model, product.id, product.description, serializeSearchValue(product.specifications)];
    for (const field of fields) {
      const number = parseSizeNumber(field) || getModelSizeNumber(field);
      if (number && commonTvSizes.includes(number)) return number;
    }
    return '';
  };
  const normalizeDuplicateSizeText = (sizeText = '') => {
    const sizeNumber = parseSizeNumber(sizeText);
    return sizeNumber ? `${sizeNumber} inch` : normalizeText(sizeText);
  };
  const generateUniqueProductId = (brand = '', model = '', size = '') => {
    const baseId = generateProductId(brand, model, size) || `san-pham-${Date.now()}`;
    const existingIds = new Set(products.map((product) => product.id));
    if (!existingIds.has(baseId)) return baseId;
    const copyId = `${baseId}-copy`;
    if (!existingIds.has(copyId)) return copyId;
    let suffix = 2;
    while (existingIds.has(`${baseId}-${suffix}`)) suffix += 1;
    return `${baseId}-${suffix}`;
  };
  const getDuplicateSize = (form) => {
    const selectedSize = normalizeText(form.duplicateSize.value);
    return selectedSize === 'custom' ? normalizeText(form.duplicateCustomSize.value) : selectedSize;
  };
  const openDuplicateModal = (product) => {
    duplicatingProduct = product;
    dom.duplicateForm?.reset();
    showMessage(dom.duplicateMessage, '');
    if (dom.duplicateSource) dom.duplicateSource.textContent = `Sản phẩm gốc: ${[product.brand, product.model, product.size].filter(Boolean).join(' · ')}`;
    if (dom.duplicateForm?.duplicateCustomSize) dom.duplicateForm.duplicateCustomSize.disabled = true;
    if (dom.duplicateModal) dom.duplicateModal.hidden = false;
    document.body.classList.add('admin-modal-open');
    setTimeout(() => dom.duplicateForm?.duplicateSize?.focus(), 0);
  };
  const closeDuplicateModal = () => {
    if (dom.duplicateModal) dom.duplicateModal.hidden = true;
    document.body.classList.remove('admin-modal-open');
    duplicatingProduct = null;
  };
  const buildDuplicatedProduct = (source, newSize, newPrice, newOldPrice) => {
    const oldSizeNumber = detectProductSizeNumber(source);
    const newSizeNumber = parseSizeNumber(newSize);
    const normalizedNewSize = normalizeDuplicateSizeText(newSize);
    const duplicate = replaceSizeAndModelEverywhere(deepCloneProduct(source), oldSizeNumber, newSizeNumber);
    duplicate.size = normalizedNewSize;
    duplicate.model = replaceModelSizeNumber(duplicate.model || source.model || '', oldSizeNumber, newSizeNumber);
    duplicate.id = generateUniqueProductId(duplicate.brand, duplicate.model, normalizedNewSize);
    duplicate.price = newPrice;
    duplicate.old_price = newOldPrice || '';
    duplicate.image = source.image || '';
    duplicate.images = Array.isArray(source.images) ? [...source.images] : [];
    duplicate.is_active = false;
    duplicate.is_featured = false;
    duplicate.sort_order = getNextProductSortOrder();
    duplicate.created_at = undefined;
    duplicate.updated_at = new Date().toISOString();
    return Object.fromEntries(Object.entries(duplicate).filter(([, value]) => value !== undefined));
  };
  const handleDuplicateSave = async (event) => {
    event.preventDefault();
    if (!duplicatingProduct || !dom.duplicateForm) return;
    const form = dom.duplicateForm;
    const newSize = normalizeDuplicateSizeText(getDuplicateSize(form));
    const newSizeNumber = parseSizeNumber(newSize);
    const newPrice = normalizeText(form.duplicatePrice.value);
    const newOldPrice = normalizeText(form.duplicateOldPrice.value);
    if (!newSize || !newSizeNumber) {
      showMessage(dom.duplicateMessage, 'Vui lòng chọn hoặc nhập kích thước mới hợp lệ.', 'error');
      (form.duplicateSize.value === 'custom' ? form.duplicateCustomSize : form.duplicateSize).focus();
      return;
    }
    if (!newPrice) {
      showMessage(dom.duplicateMessage, 'Vui lòng nhập giá bán mới thủ công.', 'error');
      form.duplicatePrice.focus();
      return;
    }
    dom.createDuplicateButton.disabled = true;
    try {
      const duplicate = buildDuplicatedProduct(duplicatingProduct, newSize, newPrice, newOldPrice);
      const { error } = await client.from('products').insert(duplicate);
      if (error) throw error;
      closeDuplicateModal();
      showMessage(dom.adminMessage, 'Đã nhân bản sản phẩm. Vui lòng kiểm tra lại thông tin, kích thước, khối lượng và giá trước khi bật hiển thị.', 'success');
      await loadProducts();
      const createdProduct = products.find((product) => product.id === duplicate.id) || duplicate;
      openForm(createdProduct);
      showMessage(dom.formMessage, 'Đã nhân bản sản phẩm. Vui lòng kiểm tra lại kích thước, khối lượng và thông số lắp đặt cho size mới.', 'info');
    } catch (error) {
      console.warn(error);
      showMessage(dom.duplicateMessage, error.message || 'Không thể nhân bản sản phẩm. Vui lòng thử lại.', 'error');
    } finally {
      dom.createDuplicateButton.disabled = false;
    }
  };

  const getParsedOverviewForSave = (form) => {
    try {
      const overview = parseOverview(form.overview.value);
      renderOverviewPreview(overview, { showEmpty: false });
      return overview;
    } catch (error) {
      console.warn(error);
      throw new Error('Không thể tự động căn tổng quan. Vui lòng kiểm tra lại nội dung nhập.');
    }
  };

  const getParsedSpecificationsForSave = (form) => {
    try {
      const specifications = parseSpecifications(form.specifications.value);
      updateSpecificationPreview(specifications, { showEmpty: false });
      return specifications;
    } catch (error) {
      console.warn(error);
      throw new Error('Không thể tự động căn thông số. Vui lòng kiểm tra lại nội dung nhập.');
    }
  };

  const buildProduct = (form, imageData) => ({
    id: normalizeText(form.id.value) || generateProductId(form.brand.value, form.model.value, form.size.value),
    brand: normalizeText(form.brand.value),
    model: normalizeText(form.model.value),
    full_name: normalizeText(form.fullName.value),
    size: normalizeText(form.size.value),
    type: normalizeText(form.type.value),
    condition: normalizeText(form.condition.value),
    warranty: normalizeText(form.warranty.value),
    old_price: normalizeText(form.oldPrice.value),
    price: normalizeText(form.price.value),
    badge: normalizeText(form.badge.value),
    description: normalizeText(form.description.value),
    features: parseLines(form.features.value),
    overview: getParsedOverviewForSave(form),
    specifications: getParsedSpecificationsForSave(form),
    image: imageData.image || '',
    images: imageData.images || [],
    is_featured: form.isFeatured.value === 'true',
    is_active: form.isActive.value === 'true',
    sort_order: Number(form.sortOrder.value || 0),
    updated_at: new Date().toISOString(),
  });

  const handleSave = async (event) => {
    event.preventDefault();
    const form = dom.form;
    if (!form || !validateForm(form)) return;
    const productId = normalizeText(form.id.value) || generateProductId(form.brand.value, form.model.value, form.size.value);
    form.id.value = productId;
    dom.saveButton.disabled = true;
    try {
      if (!editingProduct || editingProduct.id !== productId) {
        const { data: existing, error: existingError } = await client.from('products').select('id').eq('id', productId).maybeSingle();
        if (existingError) throw existingError;
        if (existing) {
          showMessage(dom.formMessage, 'Mã sản phẩm đã tồn tại. Vui lòng đổi model hoặc mã sản phẩm.', 'error');
          return;
        }
      }
      const imageData = await uploadImages(form, productId);
      const product = buildProduct(form, imageData);
      const { error } = editingProduct
        ? await client.from('products').update(product).eq('id', editingProduct.id)
        : await client.from('products').insert(product);
      if (error) throw error;
      showMessage(dom.adminMessage, 'Đã lưu sản phẩm thành công.', 'success');
      await loadProducts();
      closeForm();
    } catch (error) {
      console.warn(error);
      showMessage(dom.formMessage, error.message || 'Không thể kết nối dữ liệu. Vui lòng thử lại.', 'error');
    } finally {
      dom.saveButton.disabled = false;
    }
  };

  const toggleProduct = async (product) => {
    try {
      const { error } = await client.from('products').update({ is_active: !product.is_active, updated_at: new Date().toISOString() }).eq('id', product.id);
      if (error) throw error;
      await loadProducts();
    } catch (error) {
      console.warn(error);
      showMessage(dom.adminMessage, 'Không thể kết nối dữ liệu. Vui lòng thử lại.', 'error');
    }
  };

  const deleteProduct = async (product) => {
    if (!window.confirm('Bạn có chắc muốn xoá sản phẩm này không?')) return;
    try {
      const { error } = await client.from('products').delete().eq('id', product.id);
      if (error) throw error;
      await loadProducts();
    } catch (error) {
      console.warn(error);
      showMessage(dom.adminMessage, 'Không thể kết nối dữ liệu. Vui lòng thử lại.', 'error');
    }
  };

  const init = async () => {
    if (!requireSupabase()) return;
    const { data: { session } } = await client.auth.getSession();
    if (!session) { showLoginOnly(); return; }
    try {
      if (!(await isAdmin())) {
        showLoginOnly();
        showMessage(dom.loginMessage, 'Tài khoản này không có quyền quản trị.', 'error');
        await client.auth.signOut();
        return;
      }
      showDashboard();
      await loadProducts();
      await loadOrders();
      await loadBanners();
      await loadRightBanner();
    } catch (error) {
      console.warn(error);
      showLoginOnly();
      showMessage(dom.loginMessage, 'Không thể kết nối dữ liệu. Vui lòng thử lại.', 'error');
    }
  };

  dom.loginForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!requireSupabase()) return;
    showMessage(dom.loginMessage, 'Đang đăng nhập...', 'info');
    dom.loginButton.disabled = true;
    const form = new FormData(dom.loginForm);
    try {
      const { error } = await client.auth.signInWithPassword({ email: normalizeText(form.get('email')), password: String(form.get('password') || '') });
      if (error) throw error;
      if (!(await isAdmin())) {
        await client.auth.signOut();
        showMessage(dom.loginMessage, 'Tài khoản này không có quyền quản trị.', 'error');
        return;
      }
      showDashboard();
      await loadProducts();
      await loadOrders();
      await loadBanners();
      await loadRightBanner();
    } catch (error) {
      console.warn(error);
      showMessage(dom.loginMessage, 'Sai tài khoản hoặc mật khẩu. Vui lòng thử lại.', 'error');
    } finally {
      dom.loginButton.disabled = false;
    }
  });

  dom.logoutButton?.addEventListener('click', async () => { await client?.auth.signOut(); showLoginOnly(); });
  dom.openFormButton?.addEventListener('click', () => openForm());
  dom.openBannerFormButton?.addEventListener('click', () => openBannerForm());
  dom.cancelBannerFormButton?.addEventListener('click', closeBannerForm);
  dom.bannerForm?.addEventListener('submit', handleBannerSave);
  dom.rightBannerForm?.addEventListener('submit', handleRightBannerSave);
  dom.deleteRightBannerButton?.addEventListener('click', deleteRightBanner);
  dom.rightBannerForm?.bannerImage?.addEventListener('change', () => {
    const file = dom.rightBannerForm.bannerImage.files?.[0];
    if (!file) { renderRightBannerPreview(dom.rightBannerForm.existingImageUrl.value); return; }
    if (!validateRightBannerFile(file)) { dom.rightBannerForm.bannerImage.value = ''; return; }
    renderRightBannerPreview(URL.createObjectURL(file));
  });
  dom.formatOverviewButton?.addEventListener('click', handleAutoFormatOverview);
  dom.previewOverviewButton?.addEventListener('click', handlePreviewOverview);
  dom.clearOverviewButton?.addEventListener('click', () => {
    const textarea = getFormField('overview');
    if (textarea) textarea.value = '';
    clearOverviewPreview();
    showMessage(dom.formMessage, 'Đã xoá tổng quan sản phẩm.', 'success');
  });
  dom.formatSpecificationsButton?.addEventListener('click', () => handleSpecificationAction({ format: true }));
  dom.previewSpecificationsButton?.addEventListener('click', () => handleSpecificationAction());
  dom.clearSpecificationsButton?.addEventListener('click', () => {
    if (dom.form?.specifications) dom.form.specifications.value = '';
    clearSpecificationPreview();
    showMessage(dom.formMessage, 'Đã xoá thông số chi tiết.', 'success');
  });
  dom.form?.addEventListener('submit', handleSave);
  dom.duplicateForm?.addEventListener('submit', handleDuplicateSave);
  dom.duplicateForm?.duplicateSize?.addEventListener('change', () => {
    const isCustom = dom.duplicateForm.duplicateSize.value === 'custom';
    dom.duplicateForm.duplicateCustomSize.disabled = !isCustom;
    if (isCustom) dom.duplicateForm.duplicateCustomSize.focus();
    if (!isCustom) dom.duplicateForm.duplicateCustomSize.value = '';
  });
  dom.productSearchInput?.addEventListener('input', (event) => {
    window.clearTimeout(productSearchTimer);
    productSearchTimer = window.setTimeout(() => {
      productSearchTerm = event.target.value;
      renderProducts();
    }, 150);
  });
  dom.productSearchClear?.addEventListener('click', () => {
    productSearchTerm = '';
    if (dom.productSearchInput) dom.productSearchInput.value = '';
    renderProducts();
    dom.productSearchInput?.focus();
  });
  document.querySelectorAll('[data-close-product-form]').forEach((button) => button.addEventListener('click', closeForm));
  document.querySelectorAll('[data-close-duplicate-modal]').forEach((button) => button.addEventListener('click', closeDuplicateModal));
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (!dom.duplicateModal?.hidden) closeDuplicateModal();
    else if (!dom.modal?.hidden) closeForm();
  });
  dom.modal?.addEventListener('click', (event) => { if (event.target.matches('.admin-modal__backdrop')) closeForm(); });
  dom.duplicateModal?.addEventListener('click', (event) => { if (event.target.matches('.admin-modal__backdrop')) closeDuplicateModal(); });
  dom.existingImages?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-remove-existing-image]');
    if (!button) return;
    removeExistingImage(button.dataset.removeExistingImage);
  });
  dom.form?.addEventListener('input', (event) => {
    if (event.target?.name === 'id') {
      productIdManuallyEdited = true;
      return;
    }
    if (editingProduct || productIdManuallyEdited) return;
    const form = dom.form;
    form.id.value = generateProductId(form.brand.value, form.model.value, form.size.value);
  });
  dom.products?.addEventListener('click', (event) => {
    const actionButton = event.target.closest('[data-edit-product], [data-duplicate-product], [data-toggle-product], [data-delete-product]');
    if (!actionButton) return;
    const id = actionButton.dataset.editProduct || actionButton.dataset.duplicateProduct || actionButton.dataset.toggleProduct || actionButton.dataset.deleteProduct;
    if (!id) return;
    const product = products.find((item) => item.id === id);
    if (!product) return;
    if (actionButton.dataset.editProduct) openForm(product);
    if (actionButton.dataset.duplicateProduct) openDuplicateModal(product);
    if (actionButton.dataset.toggleProduct) toggleProduct(product);
    if (actionButton.dataset.deleteProduct) deleteProduct(product);
  });
  dom.orders?.addEventListener('change', (event) => {
    const orderId = event.target?.dataset?.orderStatus;
    if (!orderId) return;
    updateOrderStatus(orderId, event.target.value);
  });
  dom.banners?.addEventListener('click', (event) => {
    const id = event.target.dataset.editBanner || event.target.dataset.toggleBanner || event.target.dataset.deleteBanner;
    if (!id) return;
    const banner = banners.find((item) => item.id === id);
    if (!banner) return;
    if (event.target.dataset.editBanner) openBannerForm(banner);
    if (event.target.dataset.toggleBanner) toggleBanner(banner);
    if (event.target.dataset.deleteBanner) deleteBanner(banner);
  });

  init();
})();
