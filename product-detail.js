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
      overview: Array.isArray(product.overview) ? product.overview : [],
      specifications: Array.isArray(product.specifications) ? product.specifications : [],
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
          const heading = headingText ? `<h3>${escapeDetailHtml(headingText)}</h3>` : '';
          const sourceParagraphs = Array.isArray(section.paragraphs) ? section.paragraphs : (section.content ? String(section.content).split(/\n+/).filter(Boolean) : []);
          const paragraphs = sourceParagraphs.map((paragraph) => `<p>${escapeDetailHtml(paragraph)}</p>`).join('');
          return `<section>${heading}${paragraphs}</section>`;
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
                  <dd>${renderModalValue(row.value)}</dd>
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
    const warrantySpec = product.warranty ? `<div><dt>Bảo hành</dt><dd>${escapeDetailHtml(product.warranty)}</dd></div>` : '';

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
          <div><dt>Thương hiệu</dt><dd>${escapeDetailHtml(product.brand)}</dd></div>
          <div><dt>Model</dt><dd>${escapeDetailHtml(product.model)}</dd></div>
          <div><dt>Kích thước</dt><dd>${escapeDetailHtml(product.size)}</dd></div>
          <div><dt>Loại sản phẩm</dt><dd>${escapeDetailHtml(product.type)}</dd></div>
          <div><dt>Tình trạng</dt><dd>${escapeDetailHtml(product.condition)}</dd></div>
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
          <a class="btn btn--primary" href="tel:0905111223" aria-label="Gọi tư vấn sản phẩm ${escapeDetailHtml(label)}">Gọi tư vấn</a>
          <a class="btn btn--zalo" href="#" aria-label="Nhắn Zalo hỏi sản phẩm ${escapeDetailHtml(label)}">Nhắn Zalo</a>
          <a class="btn btn--secondary" href="index.html#san-pham">Quay lại danh sách</a>
        </div>
      </article>`;

    bindProductGallery();
    bindProductModalButtons(product);
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
