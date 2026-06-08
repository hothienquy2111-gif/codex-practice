(() => {
  const supabaseState = window.anhMinhSupabase || window.AnhMinhSupabase || {};
  const client = supabaseState.isReady ? supabaseState.client : null;
  const bucketName = supabaseState.bucketName || 'product-images';

  const dom = {
    loginSection: document.querySelector('[data-admin-login]'),
    dashboard: document.querySelector('[data-admin-dashboard]'),
    loginForm: document.querySelector('[data-login-form]'),
    loginButton: document.querySelector('[data-login-button]'),
    loginMessage: document.querySelector('[data-login-message]'),
    adminMessage: document.querySelector('[data-admin-message]'),
    products: document.querySelector('[data-admin-products]'),
    logoutButton: document.querySelector('[data-logout-button]'),
    openFormButton: document.querySelector('[data-open-product-form]'),
    modal: document.querySelector('[data-product-modal]'),
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
  };

  let products = [];
  let editingProduct = null;
  let productIdManuallyEdited = false;

  const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
  const showMessage = (node, text = '', type = '') => {
    if (!node) return;
    node.textContent = text;
    node.className = `admin-message${type ? ` admin-message--${type}` : ''}`;
  };
  const normalizeText = (value = '') => String(value).trim();
  const slugify = (value = '') => normalizeText(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const generateProductId = (brand, model, size) => slugify(`${brand} ${model} ${size}`);
  const sanitizeFileName = (name = '') => {
    const parts = name.split('.');
    const extension = parts.length > 1 ? `.${slugify(parts.pop())}` : '';
    const base = slugify(parts.join('.') || 'anh-minh-store') || `anh-minh-store-${Date.now()}`;
    return `${base}-${Date.now()}${extension}`;
  };
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

  const renderProducts = () => {
    if (!dom.products) return;
    if (!products.length) {
      dom.products.innerHTML = '<p class="admin-empty">Chưa có sản phẩm nào.</p>';
      return;
    }
    dom.products.innerHTML = products.map((product) => `
      <article class="admin-product-card" data-product-id="${escapeHtml(product.id)}">
        <div>
          <p class="admin-product-card__brand">${escapeHtml(product.brand)} · ${escapeHtml(product.model)}</p>
          <h2>${escapeHtml(product.full_name || product.fullName || product.model)}</h2>
          <p>${escapeHtml(product.size)} · ${escapeHtml(product.type)} · ${escapeHtml(product.price)}</p>
          <span class="admin-status ${product.is_active ? 'is-active' : 'is-hidden'}">${product.is_active ? 'Hiển thị' : 'Ẩn'}</span>
        </div>
        <div class="admin-product-card__actions">
          <button type="button" class="btn btn--secondary" data-edit-product="${escapeHtml(product.id)}">Sửa</button>
          <button type="button" class="btn btn--ghost" data-toggle-product="${escapeHtml(product.id)}">${product.is_active ? 'Ẩn' : 'Hiện'}</button>
          <button type="button" class="btn btn--danger" data-delete-product="${escapeHtml(product.id)}">Xoá</button>
        </div>
      </article>`).join('');
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

  const openForm = (product = null) => {
    editingProduct = product;
    productIdManuallyEdited = Boolean(product);
    dom.form?.reset();
    showMessage(dom.formMessage, '');
    clearOverviewPreview();
    clearSpecificationPreview();
    if (dom.formTitle) dom.formTitle.textContent = product ? 'Sửa sản phẩm' : 'Thêm sản phẩm';
    if (dom.modal) dom.modal.hidden = false;
    document.body.classList.add('admin-modal-open');
    const form = dom.form;
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
      form.sortOrder.value = product.sort_order ?? 0;
      form.description.value = product.description || '';
      form.features.value = Array.isArray(product.features) ? product.features.join('\n') : '';
      form.overview.value = stringifyOverviewForAdmin(product.overview || []);
      renderOverviewPreview(parseOverview(form.overview.value), { showEmpty: false });
      form.specifications.value = stringifySpecificationsForAdmin(product.specifications ?? product.specificationsText ?? []);
      updateSpecificationPreview(parseSpecifications(form.specifications.value), { showEmpty: false });
      form.isActive.value = String(Boolean(product.is_active));
    }
    renderExistingImages(product);
    setTimeout(() => form?.brand?.focus(), 0);
  };

  const closeForm = () => {
    if (dom.modal) dom.modal.hidden = true;
    document.body.classList.remove('admin-modal-open');
    editingProduct = null;
  };

  const renderExistingImages = (product) => {
    const images = [product?.image, ...(Array.isArray(product?.images) ? product.images : [])].filter(Boolean);
    const unique = Array.from(new Set(images));
    dom.existingImages.innerHTML = unique.length ? unique.map((src) => `<img src="${escapeHtml(src)}" alt="Ảnh sản phẩm hiện có" loading="lazy" />`).join('') : 'Chưa có ảnh.';
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
    let image = editingProduct?.image || '';
    let images = Array.isArray(editingProduct?.images) ? [...editingProduct.images] : [];
    if (mainFile || galleryFiles.length) showMessage(dom.formMessage, 'Đang tải ảnh lên...', 'info');
    try {
      if (mainFile) {
        image = await uploadFile(mainFile, productId);
        if (!images.includes(image)) images.unshift(image);
      }
      for (const file of galleryFiles) {
        const url = await uploadFile(file, productId);
        if (url && !images.includes(url)) images.push(url);
      }
      return { image, images };
    } catch (error) {
      console.warn(error);
      throw new Error('Không thể tải ảnh lên. Vui lòng thử lại.');
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
    } catch (error) {
      console.warn(error);
      showMessage(dom.loginMessage, 'Sai tài khoản hoặc mật khẩu. Vui lòng thử lại.', 'error');
    } finally {
      dom.loginButton.disabled = false;
    }
  });

  dom.logoutButton?.addEventListener('click', async () => { await client?.auth.signOut(); showLoginOnly(); });
  dom.openFormButton?.addEventListener('click', () => openForm());
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
  document.querySelectorAll('[data-close-product-form]').forEach((button) => button.addEventListener('click', closeForm));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !dom.modal?.hidden) closeForm(); });
  dom.modal?.addEventListener('click', (event) => { if (event.target.matches('.admin-modal__backdrop')) closeForm(); });
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
    const id = event.target.dataset.editProduct || event.target.dataset.toggleProduct || event.target.dataset.deleteProduct;
    if (!id) return;
    const product = products.find((item) => item.id === id);
    if (!product) return;
    if (event.target.dataset.editProduct) openForm(product);
    if (event.target.dataset.toggleProduct) toggleProduct(product);
    if (event.target.dataset.deleteProduct) deleteProduct(product);
  });

  init();
})();
