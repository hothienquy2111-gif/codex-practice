(() => {
  const root = document.querySelector('[data-v2-showcase]');
  if (!root) return;

  const normalizeCampaignProduct = (product = {}) => ({
    ...product,
    fullName: product.fullName || product.full_name || product.name || product.model || 'Sản phẩm đang cập nhật',
    oldPrice: product.oldPrice || product.old_price || '',
    stockStatus: product.stockStatus || product.stock_status || 'available',
    capacityOrSize: product.capacityOrSize || product.capacity_or_size || product.size || '',
  });
  const resolvePreviewCampaign = () => {
    const ids = Array.isArray(window.TET2027_CAMPAIGN_PREVIEW_IDS) ? window.TET2027_CAMPAIGN_PREVIEW_IDS : [];
    const all = Array.isArray(window.V2Products) ? window.V2Products : [];
    return ids.map((id) => all.find((product) => product.id === id)).filter(Boolean);
  };
  let source = (Array.isArray(window.Tet2027CampaignProducts) ? window.Tet2027CampaignProducts : resolvePreviewCampaign())
    .map(normalizeCampaignProduct)
    .filter((product) => product?.id && product?.fullName && product?.image && product?.stockStatus !== 'hidden' && product.isActive !== false && product.is_active !== false);
  const grid = root.querySelector('[data-v2-grid]');
  const viewport = root.querySelector('.v2-showcase__viewport');
  const filterRoot = root.querySelector('[data-v2-filters]');
  const status = root.querySelector('[data-v2-status]');
  const previousButton = root.querySelector('[data-v2-prev]');
  const nextButton = root.querySelector('[data-v2-next]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const AUTO_SPEED = 18;
  const MANUAL_DURATION = 360;
  const state = {
    size: '',
    category: '',
    start: 0,
    offset: 0,
    visible: 5,
    manual: null,
    lastFrame: 0,
    animationFrame: 0,
    pointer: null,
    suppressClickUntil: 0,
  };

  const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[char]);
  const sizeNumber = (value = '') => Number.parseInt(String(value).match(/\d+/)?.[0] || '0', 10);
  const getVisibleCount = () => {
    if (window.innerWidth < 680) return 2;
    if (window.innerWidth < 1080) return 3;
    return 5;
  };
  const normalizeCategoryKey = (value = '') => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
  const getCategory = (product = {}) => {
    const category = normalizeCategoryKey(product.category);
    const subcategory = normalizeCategoryKey(product.subcategory);
    const type = normalizeCategoryKey(product.type);
    if (category === 'tivi' || type.includes('tivi') || type.includes('tv')) return 'Tivi';
    if (subcategory === 'may-giat' || type.includes('may giat')) return 'Máy giặt';
    if (subcategory === 'tu-lanh' || type.includes('tu lanh')) return 'Tủ lạnh';
    if (subcategory === 'dieu-hoa' || type.includes('dieu hoa')) return 'Điều hòa';
    if (subcategory === 'do-gia-dung' || type.includes('gia dung')) return 'Đồ gia dụng';
    return product.category || product.subcategory || product.type || 'Sản phẩm khác';
  };
  const getFiltered = () => source.filter((product) =>
    (!state.category || getCategory(product) === state.category)
    && (!state.size || (state.category === 'Tivi' && sizeNumber(product.size) === Number(state.size)))
  );
  const getProductUrl = (product) => `product-detail.html?id=${encodeURIComponent(product.id)}`;
  const syncImagePresentation = (image) => {
    if (!image?.naturalWidth || !image?.naturalHeight) return;
    const sourceRatio = image.naturalWidth / image.naturalHeight;
    image.classList.toggle('is-square-source', sourceRatio >= 0.85 && sourceRatio <= 1.15);
  };

  const renderCard = (product, isBuffer = false) => {
    const oldPrice = product.oldPrice ? `<del>${escapeHtml(product.oldPrice)}</del>` : '';
    const accessibility = isBuffer ? ' aria-hidden="true" tabindex="-1"' : '';
    return `
      <a class="v2-product-card" href="${getProductUrl(product)}" data-product-id="${escapeHtml(product.id)}" aria-label="Xem ${escapeHtml(product.fullName)}"${accessibility}>
        <div class="v2-product-card__media" data-product-id="${escapeHtml(product.id)}">
          <img src="${escapeHtml(product.image)}" data-product-id="${escapeHtml(product.id)}" alt="${escapeHtml(product.fullName)}" width="700" height="394" loading="lazy" decoding="async">
          <span class="v2-product-card__image-fallback" aria-hidden="true">Ảnh sản phẩm đang cập nhật</span>
          <span class="v2-product-card__type">${escapeHtml(product.type || 'Tivi')}</span>
        </div>
        <div class="v2-product-card__body">
          <div class="v2-product-card__meta"><strong>${escapeHtml(product.brand)}</strong><span>${escapeHtml(product.model)}</span></div>
          <h3>${escapeHtml(product.fullName)}</h3>
          <p>${escapeHtml(product.capacityOrSize || product.size || 'Liên hệ tư vấn')}${product.condition ? ` · ${escapeHtml(product.condition)}` : ''}</p>
          <div class="v2-product-card__price"><strong>${escapeHtml(product.price || 'Liên hệ')}</strong>${oldPrice}</div>
        </div>
      </a>`;
  };

  function renderFilters() {
    const categories = [...new Set(source.map(getCategory).filter(Boolean))];
    const tvSource = source.filter((product) => getCategory(product) === 'Tivi');
    const sizes = [...new Set(tvSource.map((product) => sizeNumber(product.size)).filter(Boolean))].sort((a, b) => a - b);
    if (state.category !== 'Tivi' || (state.size && !sizes.includes(Number(state.size)))) state.size = '';
    const categoryButtons = [''].concat(categories).map((category) => {
      const active = category ? state.category === category : !state.category;
      return `<button type="button" class="v2-filter${active ? ' is-active' : ''}" data-v2-category="${escapeHtml(category)}" aria-pressed="${active}">${escapeHtml(category || 'Tất cả')}</button>`;
    });
    const sizeButtons = [0, ...sizes].map((size) => {
      const active = size ? Number(state.size) === size : !state.size;
      return `<button type="button" class="v2-filter${active ? ' is-active' : ''}" data-v2-size="${size || ''}" aria-pressed="${active}">${size ? `${size} inch` : 'Tất cả kích thước'}</button>`;
    });
    filterRoot.innerHTML = `<div class="v2-showcase__filter-group"><span class="v2-showcase__filter-label">Danh mục</span><div class="v2-showcase__filter-row">${categoryButtons.join('')}</div></div>${state.category === 'Tivi' && sizes.length ? `<div class="v2-showcase__filter-group v2-showcase__filter-group--sizes"><span class="v2-showcase__filter-label">Kích thước</span><div class="v2-showcase__filter-row v2-showcase__filter-row--sizes">${sizeButtons.join('')}</div></div>` : ''}`;
  }

  function updateStatus(filtered) {
    if (!filtered.length) {
      status.textContent = 'Không có sản phẩm';
      return;
    }
    const shown = Math.min(state.visible, filtered.length);
    status.textContent = `Đang hiển thị ${shown} / ${filtered.length} mẫu`;
  }

  function setTransform() {
    grid.style.transform = `translate3d(${-state.offset}px, 0, 0)`;
  }

  function createCardElement(product, isBuffer = false) {
    const template = document.createElement('template');
    template.innerHTML = renderCard(product, isBuffer).trim();
    return template.content.firstElementChild;
  }

  function syncCardAccessibility() {
    [...grid.querySelectorAll('.v2-product-card')].forEach((card, index) => {
      const isBuffer = index >= state.visible;
      if (isBuffer) {
        card.setAttribute('aria-hidden', 'true');
        card.setAttribute('tabindex', '-1');
      } else {
        card.removeAttribute('aria-hidden');
        card.removeAttribute('tabindex');
      }
      const image = card.querySelector('.v2-product-card__media img');
      if (image?.complete) syncImagePresentation(image);
    });
  }

  function renderTrack() {
    state.visible = getVisibleCount();
    const filtered = getFiltered();
    state.start = filtered.length ? ((state.start % filtered.length) + filtered.length) % filtered.length : 0;
    const canMove = filtered.length > state.visible;
    const staticSlots = Math.min(state.visible, Math.max(filtered.length, Math.min(3, state.visible)));
    grid.style.setProperty('--v2-visible-cards', String(canMove ? state.visible : staticSlots));
    grid.classList.toggle('is-static', !canMove);

    if (!filtered.length) {
      grid.innerHTML = '<p class="v2-showcase__empty">Campaign Tết 2027 hiện chưa có sản phẩm phù hợp. Vui lòng quay lại sau hoặc liên hệ Anh Minh Store để được tư vấn.</p>';
    } else {
      const cardCount = canMove ? state.visible + 1 : filtered.length;
      grid.innerHTML = Array.from({ length: cardCount }, (_, index) => {
        const product = filtered[(state.start + index) % filtered.length];
        return renderCard(product, index >= state.visible);
      }).join('');
    }

    previousButton.disabled = !canMove;
    nextButton.disabled = !canMove;
    syncCardAccessibility();
    updateStatus(filtered);
    setTransform();
  }

  function getStep() {
    const card = grid.querySelector('.v2-product-card');
    if (!card) return 0;
    const styles = window.getComputedStyle(grid);
    return card.getBoundingClientRect().width + Number.parseFloat(styles.columnGap || styles.gap || '0');
  }

  function advanceTrack() {
    const filtered = getFiltered();
    const step = getStep();
    if (!step || filtered.length <= state.visible) {
      state.offset = 0;
      return;
    }
    while (state.offset >= step) {
      state.offset -= step;
      state.start = (state.start + 1) % filtered.length;
      grid.firstElementChild?.remove();
      const nextProduct = filtered[(state.start + state.visible) % filtered.length];
      grid.append(createCardElement(nextProduct, true));
      syncCardAccessibility();
      updateStatus(filtered);
    }
    setTransform();
  }

  function easeInOutCubic(value) {
    return value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
  }

  function frame(timestamp) {
    const filtered = getFiltered();
    const step = getStep();
    const canMove = filtered.length > state.visible && step > 0;
    const delta = state.lastFrame ? Math.min(timestamp - state.lastFrame, 48) : 0;
    state.lastFrame = timestamp;

    if (state.manual) {
      const progress = Math.min(1, (timestamp - state.manual.startedAt) / MANUAL_DURATION);
      state.offset = state.manual.from + (state.manual.to - state.manual.from) * easeInOutCubic(progress);
      setTransform();
      if (progress >= 1) {
        const completion = state.manual.onComplete;
        state.manual = null;
        completion();
      }
    } else if (!state.pointer && canMove && !document.hidden && !reducedMotion.matches) {
      state.offset += AUTO_SPEED * delta / 1000;
      advanceTrack();
    }

    state.animationFrame = window.requestAnimationFrame(frame);
  }

  function moveNext() {
    const filtered = getFiltered();
    const step = getStep();
    if (filtered.length <= state.visible || !step || state.manual) return;
    if (reducedMotion.matches) {
      state.start = (state.start + 1) % filtered.length;
      state.offset = 0;
      renderTrack();
      return;
    }
    state.manual = {
      from: state.offset,
      to: step,
      startedAt: performance.now(),
      onComplete: () => {
        state.offset = step;
        advanceTrack();
      },
    };
  }

  function movePrevious() {
    const filtered = getFiltered();
    const step = getStep();
    if (filtered.length <= state.visible || !step || state.manual) return;
    const previousIndex = (state.start - 1 + filtered.length) % filtered.length;
    grid.prepend(createCardElement(filtered[previousIndex]));
    if (grid.children.length > state.visible + 1) grid.lastElementChild?.remove();
    state.start = previousIndex;
    state.offset += step;
    syncCardAccessibility();
    setTransform();
    if (reducedMotion.matches) {
      state.offset = 0;
      setTransform();
      return;
    }
    state.manual = {
      from: state.offset,
      to: 0,
      startedAt: performance.now(),
      onComplete: () => {
        state.offset = 0;
        syncCardAccessibility();
        setTransform();
      },
    };
  }

  function preparePreviousCard() {
    const filtered = getFiltered();
    const step = getStep();
    if (filtered.length <= state.visible || !step) return false;
    const previousIndex = (state.start - 1 + filtered.length) % filtered.length;
    grid.prepend(createCardElement(filtered[previousIndex]));
    if (grid.children.length > state.visible + 1) grid.lastElementChild?.remove();
    state.start = previousIndex;
    state.offset += step;
    syncCardAccessibility();
    setTransform();
    return true;
  }

  function settlePointerDrag() {
    const pointer = state.pointer;
    if (!pointer) return;
    state.pointer = null;
    if (pointer.captureId !== undefined && viewport.hasPointerCapture?.(pointer.captureId)) {
      viewport.releasePointerCapture(pointer.captureId);
    }
    if (!pointer.moved) return;
    // Release in place: never snap to a card boundary or normalize the loop
    // just because the pointer was released. Autoplay resumes from this exact
    // physical offset on the next animation frame.
    state.lastFrame = performance.now();
    state.suppressClickUntil = performance.now() + 350;
  }

  root.addEventListener('click', (event) => {
    const category = event.target.closest('[data-v2-category]');
    if (category) {
      state.category = category.dataset.v2Category || '';
      state.size = '';
      state.start = 0;
      state.offset = 0;
      state.manual = null;
      renderFilters();
      renderTrack();
      return;
    }
    const size = event.target.closest('[data-v2-size]');
    if (!size) return;
    state.size = size.dataset.v2Size;
    state.start = 0;
    state.offset = 0;
    state.manual = null;
    renderFilters();
    renderTrack();
  });

  previousButton.addEventListener('click', movePrevious);
  nextButton.addEventListener('click', moveNext);
  grid.addEventListener('error', (event) => {
    const image = event.target.closest?.('.v2-product-card__media img');
    if (!image) return;
    image.closest('.v2-product-card__media')?.classList.add('is-image-error');
  }, true);
  grid.addEventListener('load', (event) => {
    const image = event.target.closest?.('.v2-product-card__media img');
    if (!image) return;
    syncImagePresentation(image);
    image.closest('.v2-product-card__media')?.classList.remove('is-image-error');
  }, true);

  if (window.matchMedia('(max-width: 767px)').matches && viewport) {
    viewport.style.touchAction = 'pan-y';
    viewport.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      const step = getStep();
      if (!step || getFiltered().length <= state.visible) return;
      state.manual = null;
      state.pointer = {
        captureId: event.pointerId,
        startX: event.clientX,
        startOffset: state.offset,
        moved: false,
        preparedPrevious: false,
      };
      viewport.setPointerCapture?.(event.pointerId);
    }, { passive: true });
    viewport.addEventListener('pointermove', (event) => {
      const pointer = state.pointer;
      if (!pointer) return;
      const delta = pointer.startX - event.clientX;
      if (Math.abs(delta) < 6 && !pointer.moved) return;
      pointer.moved = true;
      if (delta < 0 && !pointer.preparedPrevious && preparePreviousCard()) {
        pointer.preparedPrevious = true;
        pointer.startOffset = state.offset;
      }
      const step = getStep();
      state.offset = Math.max(0, Math.min(step, pointer.startOffset + delta));
      setTransform();
      event.preventDefault();
    }, { passive: false });
    viewport.addEventListener('pointerup', settlePointerDrag, { passive: true });
    viewport.addEventListener('pointercancel', settlePointerDrag, { passive: true });
    grid.addEventListener('click', (event) => {
      if (performance.now() < state.suppressClickUntil) {
        event.preventDefault();
        event.stopPropagation();
      }
    }, true);
  }
  viewport.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'ArrowRight') moveNext();
    else movePrevious();
  });
  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      const nextVisible = getVisibleCount();
      if (nextVisible !== state.visible) {
        state.start = 0;
        state.offset = 0;
        state.manual = null;
        renderTrack();
      } else {
        setTransform();
      }
    }, reducedMotion.matches ? 0 : 100);
  }, { passive: true });
  reducedMotion.addEventListener('change', () => {
    state.offset = 0;
    state.manual = null;
    renderTrack();
  });

  window.addEventListener('tet2027campaignchange', (event) => {
    const next = Array.isArray(event.detail?.products) ? event.detail.products : [];
    source = next.map(normalizeCampaignProduct).filter((product) => product?.id && product?.fullName && product?.image && product?.stockStatus !== 'hidden' && product.isActive !== false && product.is_active !== false);
    state.category = '';
    state.size = '';
    state.start = 0;
    state.offset = 0;
    state.manual = null;
    renderFilters();
    renderTrack();
  });

  renderFilters();
  renderTrack();
  state.animationFrame = window.requestAnimationFrame(frame);
})();

