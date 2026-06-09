(() => {
  const productDetailRoot = document.querySelector('#product-detail-root');
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');
  let activeModal = null;

  const escapeDetailHtml = (value = '') =>
    String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);

  const setDetailMessage = (title, message) => {
    if (!productDetailRoot) {
      console.warn('Không tìm thấy vùng hiển thị chi tiết sản phẩm.');
      return;
    }

    productDetailRoot.classList.add('product-detail-card--message');
    productDetailRoot.innerHTML = `
      <div class="detail-message">
        <span class="detail-message__icon" aria-hidden="true">!</span>
        <h1 id="product-detail-title">${escapeDetailHtml(title)}</h1>
        <p>${escapeDetailHtml(message)}</p>
        <a class="btn btn--primary" href="index.html">Quay lại trang chủ</a>
      </div>`;
  };

  const renderMissingProduct = () => {
    setDetailMessage('Không tìm thấy sản phẩm', 'Không tìm thấy sản phẩm. Vui lòng quay lại trang chủ.');
  };

  const renderProductsUpdating = () => {
    setDetailMessage('Dữ liệu sản phẩm đang được cập nhật', 'Dữ liệu sản phẩm đang được cập nhật.');
  };

  const parseSpecificationText = (value = '') => {
    const groups = new Map();
    String(value)
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .forEach((line) => {
        const [group, label, ...rest] = line.split('|').map((part) => part.trim());
        const specValue = rest.join(' | ').trim();
        if (!group || !label || !specValue) return;
        if (!groups.has(group)) groups.set(group, []);
        groups.get(group).push({ label, value: specValue });
      });

    return Array.from(groups, ([group, rows]) => ({ group, rows }));
  };

  const normalizeSpecificationValue = (value) => {
    if (Array.isArray(value)) {
      return value.map((item) => String(item).trim()).filter(Boolean);
    }

    return String(value || '').trim();
  };

  const getSpecificationSource = (product = {}) => {
    const candidates = [product.specifications, product.specificationsText];
    return candidates.find((candidate) => {
      if (typeof candidate === 'string') return candidate.trim();
      if (Array.isArray(candidate)) return candidate.length;
      return candidate != null;
    }) ?? '';
  };

  const normalizeSpecifications = (product = {}) => {
    const source = getSpecificationSource(product);

    if (typeof source === 'string') {
      return parseSpecificationText(source);
    }

    if (!Array.isArray(source)) return [];

    return source
      .map((group) => {
        const groupName = String(group?.group || group?.title || '').trim();
        const rows = Array.isArray(group?.rows)
          ? group.rows
              .map((row) => ({
                label: String(row?.label || row?.name || '').trim(),
                value: normalizeSpecificationValue(row?.value),
              }))
              .filter((row) => row.label && (Array.isArray(row.value) ? row.value.length : row.value))
          : [];

        return { group: groupName, rows };
      })
      .filter((group) => group.group && group.rows.length);
  };

  const normalizeOverviewSections = (overview = []) => {
    if (!Array.isArray(overview)) return [];

    return overview
      .map((section) => ({
        title: String(section?.title || section?.heading || 'Tổng quan sản phẩm').trim(),
        content: String(section?.content || (Array.isArray(section?.paragraphs) ? section.paragraphs.join('\n\n') : '')).trim(),
      }))
      .filter((section) => section.title && section.content);
  };

  const normalizeOverview = (overview) => {
    if (Array.isArray(overview)) return normalizeOverviewSections(overview);
    if (typeof overview === 'string' && overview.trim()) {
      try {
        const parsed = JSON.parse(overview);
        if (Array.isArray(parsed)) return normalizeOverviewSections(parsed);
      } catch (error) {
        // Nội dung cũ có thể là văn bản thường, không phải JSON.
      }
      return [{ title: 'Tổng quan sản phẩm', content: overview.trim() }];
    }
    return [];
  };

  const normalizeDetailProduct = (product = {}) => {
    const imageList = Array.isArray(product.images) && product.images.length ? product.images : product.image ? [product.image] : [];
    return {
      id: product.id || '',
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
      image: product.image || imageList[0] || '',
      images: imageList,
      badge: product.badge || 'Tư vấn',
      description: product.description || 'Vui lòng liên hệ Anh Minh Store để được tư vấn chi tiết.',
      overview: normalizeOverview(product.overview),
      specifications: normalizeSpecifications(product),
    };
  };

  const renderTvPlaceholder = (label = 'Tivi Anh Minh Store') => `
    <div class="product-detail__placeholder" role="img" aria-label="Ảnh minh họa tivi ${escapeDetailHtml(label)}">
      <div class="product-detail__screen"></div>
      <div class="product-detail__stand"></div>
      <div class="product-detail__base"></div>
    </div>`;

  const renderImageGallery = (product) => {
    const label = `${product.fullName} ${product.model}`.trim();
    const mainImage = product.image || product.images[0] || '';

    if (!mainImage) {
      return `<div class="product-detail__main-media">${renderTvPlaceholder(label)}</div>`;
    }

    const thumbnails = product.images
      .map((image, index) => `
        <button class="product-gallery__thumb${index === 0 ? ' is-active' : ''}" type="button" data-gallery-thumb data-image-src="${escapeDetailHtml(image)}" aria-label="Xem ảnh ${index + 1} của ${escapeDetailHtml(label)}" aria-pressed="${index === 0 ? 'true' : 'false'}">
          <img src="${escapeDetailHtml(image)}" alt="Ảnh nhỏ ${index + 1} ${escapeDetailHtml(label)}" loading="lazy" decoding="async" />
        </button>`)
      .join('');

    return `
      <div class="product-gallery" data-product-gallery>
        <div class="product-detail__main-media">
          <img class="product-detail__image" src="${escapeDetailHtml(mainImage)}" alt="${escapeDetailHtml(label)}" decoding="async" data-gallery-main />
          <div class="product-detail__fallback" aria-hidden="true">${renderTvPlaceholder(label)}</div>
        </div>
        <div class="product-gallery__thumbs" aria-label="Thư viện ảnh sản phẩm">
          ${thumbnails}
        </div>
      </div>`;
  };

  const renderModalValue = (value) => {
    if (Array.isArray(value)) {
      return `<ul class="product-modal__value-list">${value.map((item) => `<li>${escapeDetailHtml(item)}</li>`).join('')}</ul>`;
    }

    return escapeDetailHtml(value);
  };

  const renderOverviewContent = (overview = []) => {
    if (!overview.length) return '';

    return `
      <div class="product-overview-modal">
        ${overview.map((section) => {
          const headingText = section.heading || section.title || '';
          const heading = headingText ? `<h3 class="overview-section-title">${escapeDetailHtml(headingText)}</h3>` : '';
          const content = section.content || (Array.isArray(section.paragraphs) ? section.paragraphs.join('\n\n') : '');
          return `
            <section class="overview-section">
              ${heading}
              <div class="overview-section-content">${escapeDetailHtml(content)}</div>
            </section>`;
        }).join('')}
      </div>`;
  };

  const renderSpecificationsContent = (specifications = []) => {
    if (!specifications.length) return '';

    return `
      <div class="product-specification-modal">
        ${specifications.map((group) => `
          <section class="product-specification-group">
            <h3>${escapeDetailHtml(group.group)}</h3>
            <dl class="product-specification-table">
              ${(Array.isArray(group.rows) ? group.rows : []).map((row) => `
                <div class="product-specification-row">
                  <dt>${escapeDetailHtml(row.label)}</dt>
                  <dd class="product-specification-value product-spec-value">${renderModalValue(row.value)}</dd>
                </div>`).join('')}
            </dl>
          </section>`).join('')}
      </div>`;
  };

  const openProductModal = ({ title, content }) => {
    if (!content) return;

    if (activeModal) activeModal.remove();

    const titleId = `product-modal-title-${Date.now()}`;
    const modal = document.createElement('div');
    modal.className = 'product-modal';
    modal.innerHTML = `
      <div class="product-modal__backdrop" data-product-modal-close></div>
      <section class="product-modal__card" role="dialog" aria-modal="true" aria-labelledby="${titleId}">
        <header class="product-modal__header">
          <h2 id="${titleId}">${escapeDetailHtml(title)}</h2>
          <button class="product-modal__close" type="button" aria-label="Đóng cửa sổ ${escapeDetailHtml(title)}" data-product-modal-close><span aria-hidden="true">×</span></button>
        </header>
        <div class="product-modal__content">
          ${content}
        </div>
      </section>`;

    const closeModal = () => {
      modal.remove();
      document.body.classList.remove('product-modal-open');
      document.removeEventListener('keydown', handleEscape);
      activeModal = null;
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') closeModal();
    };

    modal.addEventListener('click', (event) => {
      if (event.target.closest('[data-product-modal-close]')) closeModal();
    });

    document.body.appendChild(modal);
    document.body.classList.add('product-modal-open');
    document.addEventListener('keydown', handleEscape);
    activeModal = modal;
    modal.querySelector('.product-modal__close')?.focus();
  };

  const renderDetailModalButtons = (product) => {
    const buttons = [];

    if (product.overview.length) {
      buttons.push('<button class="btn product-detail__modal-button product-detail__modal-button--overview" type="button" data-product-modal-trigger="overview">Tổng quan sản phẩm</button>');
    }

    if (product.specifications.length) {
      buttons.push('<button class="btn product-detail__modal-button product-detail__modal-button--specifications" type="button" data-product-modal-trigger="specifications">Thông số chi tiết</button>');
    }

    if (!buttons.length) return '';

    return `<div class="product-detail__modal-actions" aria-label="Thông tin chi tiết sản phẩm">${buttons.join('')}</div>`;
  };

  const bindProductModalButtons = (product) => {
    productDetailRoot?.querySelectorAll('[data-product-modal-trigger]').forEach((button) => {
      button.addEventListener('click', () => {
        const modalType = button.dataset.productModalTrigger;
        if (modalType === 'overview') {
          openProductModal({
            title: 'Tổng quan sản phẩm',
            content: renderOverviewContent(product.overview),
          });
        }

        if (modalType === 'specifications') {
          openProductModal({
            title: 'Thông số chi tiết',
            content: renderSpecificationsContent(product.specifications),
          });
        }
      });
    });
  };

  const renderOrderProductSummary = (product) => {
    const thumbnail = product.image
      ? `<img src="${escapeDetailHtml(product.image)}" alt="Ảnh sản phẩm ${escapeDetailHtml(product.fullName)}" loading="lazy" decoding="async" />`
      : renderTvPlaceholder(product.fullName);
    const oldPrice = product.oldPrice ? `<p class="order-modal__old-price">Giá cũ: <del>${escapeDetailHtml(product.oldPrice)}</del></p>` : '';

    return `
      <div class="order-modal__summary">
        <div class="order-modal__thumb">${thumbnail}</div>
        <div class="order-modal__product">
          <h3>${escapeDetailHtml(product.fullName)}</h3>
          <p>Model: <strong>${escapeDetailHtml(product.model)}</strong></p>
          <p class="order-modal__price">Giá bán: <strong>${escapeDetailHtml(product.price)}</strong></p>
          ${oldPrice}
        </div>
      </div>`;
  };

  const openOrderModal = (product) => {
    if (activeModal) activeModal.remove();

    const titleId = `order-modal-title-${Date.now()}`;
    const modal = document.createElement('div');
    modal.className = 'product-modal order-modal';
    modal.innerHTML = `
      <div class="product-modal__backdrop" data-order-modal-close></div>
      <section class="product-modal__card order-modal__card" role="dialog" aria-modal="true" aria-labelledby="${titleId}">
        <header class="product-modal__header order-modal__header">
          <h2 id="${titleId}">Đặt hàng sản phẩm</h2>
          <button class="product-modal__close" type="button" aria-label="Đóng biểu mẫu đặt hàng" data-order-modal-close><span aria-hidden="true">×</span></button>
        </header>
        <form class="order-modal__form" data-order-form novalidate>
          <div class="product-modal__content order-modal__content">
            ${renderOrderProductSummary(product)}
            <div class="order-modal__notice" role="note">
              <span class="order-modal__notice-icon" aria-hidden="true">ℹ️</span>
              <p>Lưu ý: Anh Minh Store sẽ liên hệ với bạn để xác nhận thông tin đơn hàng trước khi sản phẩm được giao.</p>
            </div>
            <div class="order-modal__fields">
              <div class="order-modal__field">
                <label for="order-customer-name">Họ và tên <span aria-hidden="true">*</span></label>
                <input id="order-customer-name" name="customerName" autocomplete="name" required />
              </div>
              <div class="order-modal__field">
                <label for="order-customer-phone">Số điện thoại <span aria-hidden="true">*</span></label>
                <input id="order-customer-phone" name="customerPhone" type="tel" autocomplete="tel" required />
              </div>
              <div class="order-modal__field">
                <label for="order-customer-address">Địa chỉ nhận hàng</label>
                <input id="order-customer-address" name="customerAddress" autocomplete="street-address" />
              </div>
              <div class="order-modal__field">
                <label for="order-customer-note">Ghi chú thêm</label>
                <textarea id="order-customer-note" name="customerNote" rows="3"></textarea>
              </div>
            </div>
            <p class="order-modal__message" data-order-message aria-live="polite"></p>
          </div>
          <div class="order-modal__actions">
            <button class="btn btn--secondary" type="button" data-order-modal-close>Huỷ</button>
            <button class="btn btn--primary" type="submit" data-order-submit>Gửi đơn đặt hàng</button>
          </div>
        </form>
      </section>`;

    const closeModal = () => {
      modal.remove();
      document.body.classList.remove('product-modal-open');
      document.removeEventListener('keydown', handleEscape);
      activeModal = null;
    };

    const showOrderMessage = (text, type = '') => {
      const message = modal.querySelector('[data-order-message]');
      if (!message) return;
      message.textContent = text;
      message.className = `order-modal__message${type ? ` order-modal__message--${type}` : ''}`;
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') closeModal();
    };

    modal.addEventListener('click', (event) => {
      if (event.target.closest('[data-order-modal-close]')) closeModal();
    });

    modal.querySelector('[data-order-form]')?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const customerName = form.customerName.value.trim();
      const customerPhone = form.customerPhone.value.trim();
      if (!customerName || !customerPhone) {
        showOrderMessage('Vui lòng nhập họ tên và số điện thoại.', 'error');
        (customerName ? form.customerPhone : form.customerName).focus();
        return;
      }

      const storeSupabase = window.AnhMinhSupabase || window.anhMinhSupabase;
      const submitButton = form.querySelector('[data-order-submit]');
      submitButton.disabled = true;
      try {
        if (!storeSupabase?.isConfigured || !storeSupabase.client) throw new Error('Supabase chưa sẵn sàng.');
        const order = {
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_address: form.customerAddress.value.trim(),
          customer_note: form.customerNote.value.trim(),
          product_id: product.id,
          product_name: product.fullName,
          product_model: product.model,
          product_price: product.price,
          product_image: product.image,
          status: 'new',
          created_at: new Date().toISOString(),
        };
        const { error } = await storeSupabase.client.from('orders').insert(order);
        if (error) throw error;
        showOrderMessage('Đã gửi đơn đặt hàng thành công. Anh Minh Store sẽ liên hệ bạn sớm.', 'success');
        form.reset();
        window.setTimeout(closeModal, 1400);
      } catch (error) {
        console.warn('Không thể gửi đơn đặt hàng.', error);
        showOrderMessage('Không thể gửi đơn đặt hàng. Vui lòng thử lại hoặc gọi trực tiếp cho cửa hàng.', 'error');
      } finally {
        submitButton.disabled = false;
      }
    });

    document.body.appendChild(modal);
    document.body.classList.add('product-modal-open');
    document.addEventListener('keydown', handleEscape);
    activeModal = modal;
    modal.querySelector('[name="customerName"]')?.focus();
  };

  const bindOrderButton = (product) => {
    productDetailRoot?.querySelector('[data-order-now]')?.addEventListener('click', () => openOrderModal(product));
  };

  const bindProductGallery = () => {
    const gallery = productDetailRoot?.querySelector('[data-product-gallery]');
    if (!gallery) return;

    const mainImage = gallery.querySelector('[data-gallery-main]');
    const mainMedia = gallery.querySelector('.product-detail__main-media');
    const thumbs = gallery.querySelectorAll('[data-gallery-thumb]');

    mainImage?.addEventListener('error', () => {
      mainMedia?.classList.add('is-image-error');
    });

    thumbs.forEach((thumb) => {
      const thumbImage = thumb.querySelector('img');
      thumbImage?.addEventListener('error', () => {
        thumb.classList.add('is-image-error');
        thumb.textContent = 'Ảnh';
      }, { once: true });

      thumb.addEventListener('click', () => {
        const imageSrc = thumb.dataset.imageSrc;
        if (!imageSrc || !mainImage) return;
        mainMedia?.classList.remove('is-image-error');
        mainImage.src = imageSrc;
        thumbs.forEach((button) => {
          const isActive = button === thumb;
          button.classList.toggle('is-active', isActive);
          button.setAttribute('aria-pressed', String(isActive));
        });
      });
    });
  };

  const renderProductDetail = (rawProduct) => {
    if (!productDetailRoot) {
      console.warn('Không tìm thấy vùng hiển thị chi tiết sản phẩm.');
      return;
    }

    const product = normalizeDetailProduct(rawProduct);
    const label = `${product.brand} ${product.model}`.trim();
    document.title = `${label} - Anh Minh Store`;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', `${label} tại Anh Minh Store Đà Nẵng. Gọi 0905111223 để được tư vấn tivi cũ, tivi mới, thu hư đổi mới và sửa tivi.`);
    }

    const features = product.features.map((feature) => `<li>${escapeDetailHtml(feature)}</li>`).join('');
    const oldPrice = product.oldPrice
      ? `<p class="product-detail__old-price"><span>Giá cũ:</span> <del>${escapeDetailHtml(product.oldPrice)}</del></p>`
      : '';
    const warrantySpec = product.warranty ? `<div><dt>Bảo hành</dt><dd class="product-spec-value">${escapeDetailHtml(product.warranty)}</dd></div>` : '';

    productDetailRoot.classList.remove('product-detail-card--message');
    productDetailRoot.innerHTML = `
      <div class="product-detail__media">
        ${renderImageGallery(product)}
      </div>
      <article class="product-detail__info">
        <span class="product-detail__badge">${escapeDetailHtml(product.badge)}</span>
        <p class="product-detail__brand">${escapeDetailHtml(product.brand)}</p>
        <p class="product-detail__model">${escapeDetailHtml(product.model)}</p>
        <h1 id="product-detail-title">${escapeDetailHtml(product.fullName)}</h1>
        <p class="product-detail__description">${escapeDetailHtml(product.description)}</p>

        <dl class="product-specs">
          <div><dt>Thương hiệu</dt><dd class="product-spec-value">${escapeDetailHtml(product.brand)}</dd></div>
          <div><dt>Model</dt><dd class="product-spec-value">${escapeDetailHtml(product.model)}</dd></div>
          <div><dt>Kích thước</dt><dd class="product-spec-value">${escapeDetailHtml(product.size)}</dd></div>
          <div><dt>Loại sản phẩm</dt><dd class="product-spec-value">${escapeDetailHtml(product.type)}</dd></div>
          <div><dt>Tình trạng</dt><dd class="product-spec-value">${escapeDetailHtml(product.condition)}</dd></div>
          ${warrantySpec}
        </dl>

        <div class="product-detail__features">
          <h2>Đặc điểm nổi bật</h2>
          <ul>${features}</ul>
        </div>

        ${renderDetailModalButtons(product)}

        <div class="product-detail__price-box">
          ${oldPrice}
          <p class="product-detail__price"><span>Giá bán:</span> <strong>${escapeDetailHtml(product.price)}</strong></p>
        </div>

        <div class="product-detail__actions">
          <button class="btn btn--primary product-detail__order-button" type="button" data-order-now aria-label="Đặt hàng ngay sản phẩm ${escapeDetailHtml(label)}">Đặt hàng ngay</button>
          <a class="btn btn--hotline" href="tel:0905111223" aria-label="Gọi tư vấn sản phẩm ${escapeDetailHtml(label)}">Gọi tư vấn</a>
          <a class="btn btn--zalo" href="#" aria-label="Nhắn Zalo hỏi sản phẩm ${escapeDetailHtml(label)}">Nhắn Zalo</a>
          <a class="btn btn--secondary" href="index.html#san-pham">Quay lại danh sách</a>
        </div>
      </article>`;

    bindProductGallery();
    bindProductModalButtons(product);
    bindOrderButton(product);
  };

  const findFallbackProduct = () => (Array.isArray(window.products) ? window.products.find((item) => item.id === productId) : null);

  const loadProductDetail = async () => {
    if (!productId) {
      renderMissingProduct();
      return;
    }

    const storeSupabase = window.AnhMinhSupabase;
    if (storeSupabase?.isConfigured && storeSupabase.client) {
      try {
        const { data, error } = await storeSupabase.client
          .from('products')
          .select('*')
          .eq('id', productId)
          .eq('is_active', true)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          renderProductDetail(data);
          return;
        }
      } catch (error) {
        console.warn('Không thể tải chi tiết sản phẩm từ Supabase, dùng dữ liệu products.js dự phòng.', error);
      }
    }

    const product = findFallbackProduct();
    if (!product) {
      renderMissingProduct();
      return;
    }

    renderProductDetail(product);
  };

  loadProductDetail();
})();
