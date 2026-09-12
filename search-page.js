(() => {
  'use strict';

  const runtime = window.AnhMinhSearchRuntime;
  if (!runtime) {
    console.error('SEARCH_PAGE_RUNTIME_MISSING');
    return;
  }

  const dom = {
    input: document.querySelector('#search-input'),
    clearInput: document.querySelector('[data-search-clear]'),
    title: document.querySelector('[data-search-page-title]'),
    summary: document.querySelector('[data-search-page-summary]'),
    backButton: document.querySelector('[data-search-page-back]'),
    count: document.querySelector('[data-search-result-count]'),
    grid: document.querySelector('[data-search-results-grid]'),
    loadMore: document.querySelector('[data-search-load-more]'),
    sort: document.querySelector('[data-search-sort]'),
    activeFilters: document.querySelector('[data-search-active-filters]'),
    facetContainers: new Map(Array.from(document.querySelectorAll('[data-search-facet]')).map((element) => [element.dataset.searchFacet, element])),
    filterPanel: document.querySelector('[data-search-filter-panel]'),
    filterToggle: document.querySelector('[data-search-filter-toggle]'),
    filterClose: document.querySelector('[data-search-filter-close]'),
    filterOverlay: document.querySelector('[data-search-filter-overlay]'),
    filterApply: document.querySelector('[data-search-filter-apply]'),
    filterClear: document.querySelector('[data-search-filter-clear]'),
    activeFilterCount: document.querySelector('[data-active-filter-count]'),
  };

  const BATCH_SIZE = 12;
  const mobileFilters = window.matchMedia('(max-width: 767px)');
  const facetTitles = {
    brand: 'Hãng',
    size: 'Kích thước',
    technology: 'Công nghệ / phân khúc',
    condition: 'Tình trạng',
  };
  const emptyFilters = () => ({ brand: [], size: [], technology: [], condition: [] });
  const cloneFilters = (source) => Object.fromEntries(Object.entries(source).map(([key, values]) => [key, [...values]]));
  const escapeHtml = (value = '') => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
  const normalizeFacetValue = (value = '') => runtime.normalizeText(value);

  let searchQuery = '';
  let baseResults = [];
  let filteredResults = [];
  let appliedFilters = emptyFilters();
  let draftFilters = emptyFilters();
  let sortMode = 'relevance';
  let visibleCount = BATCH_SIZE;
  let drawerReturnFocus = null;

  const getUrlState = () => {
    const params = new URL(window.location.href).searchParams;
    const filters = emptyFilters();
    Object.keys(filters).forEach((key) => {
      filters[key] = params.getAll(key).map(normalizeFacetValue).filter(Boolean);
    });
    const requestedSort = params.get('sort') || 'relevance';
    return {
      query: params.get('search')?.trim() || '',
      filters,
      sort: ['relevance', 'price-asc', 'price-desc'].includes(requestedSort) ? requestedSort : 'relevance',
    };
  };

  const updateUrl = ({ push = false } = {}) => {
    const url = new URL(window.location.href);
    url.search = '';
    if (searchQuery) url.searchParams.set('search', searchQuery);
    Object.entries(appliedFilters).forEach(([key, values]) => {
      values.forEach((value) => url.searchParams.append(key, value));
    });
    if (sortMode !== 'relevance') url.searchParams.set('sort', sortMode);
    const encodedSearch = url.search.replace(/\+/g, '%20');
    window.history[push ? 'pushState' : 'replaceState'](
      { search: searchQuery },
      '',
      `${url.pathname}${encodedSearch}`,
    );
  };

  const getFacetData = () => {
    const maps = {
      brand: new Map(),
      size: new Map(),
      technology: new Map(),
      condition: new Map(),
    };
    const add = (group, value, label = value) => {
      const key = normalizeFacetValue(value);
      if (!key) return;
      const current = maps[group].get(key) || { value: key, label: String(label).trim(), count: 0 };
      current.count += 1;
      maps[group].set(key, current);
    };

    baseResults.forEach((product) => {
      add('brand', product.brand, product.brand);
      add('size', product.size, product.size);
      runtime.getTechnologies(product).forEach((technology) => add('technology', technology, runtime.technologyLabels[technology] || technology));
      const condition = runtime.normalizeProductType(product);
      add('condition', condition, condition);
    });

    const byLabel = (left, right) => left.label.localeCompare(right.label, 'vi', { numeric: true });
    return Object.fromEntries(Object.entries(maps).map(([key, map]) => [key, [...map.values()].sort(byLabel)]));
  };

  const countSelectedFilters = (filters = appliedFilters) => Object.values(filters).reduce((total, values) => total + values.length, 0);

  const productMatchesFilters = (product) => {
    const productBrand = normalizeFacetValue(product.brand);
    const productSize = normalizeFacetValue(product.size);
    const productTechnologies = runtime.getTechnologies(product).map(normalizeFacetValue);
    const productCondition = normalizeFacetValue(runtime.normalizeProductType(product));
    if (appliedFilters.brand.length && !appliedFilters.brand.includes(productBrand)) return false;
    if (appliedFilters.size.length && !appliedFilters.size.includes(productSize)) return false;
    if (appliedFilters.technology.length && !appliedFilters.technology.some((value) => productTechnologies.includes(value))) return false;
    if (appliedFilters.condition.length && !appliedFilters.condition.includes(productCondition)) return false;
    return true;
  };

  const parsePrice = (product) => {
    const digits = String(product.price || '').replace(/[^0-9]/g, '');
    return digits ? Number(digits) : Number.POSITIVE_INFINITY;
  };

  const sortResults = (products) => {
    if (sortMode === 'relevance') return [...products];
    return products.map((product, index) => ({ product, index, price: parsePrice(product) }))
      .sort((left, right) => {
        if (left.price === right.price) return left.index - right.index;
        if (!Number.isFinite(left.price)) return 1;
        if (!Number.isFinite(right.price)) return -1;
        return sortMode === 'price-asc' ? left.price - right.price : right.price - left.price;
      })
      .map(({ product }) => product);
  };

  const getFacetLabel = (group, value) => {
    const item = getFacetData()[group]?.find((entry) => entry.value === value);
    return item?.label || runtime.technologyLabels[value] || value;
  };

  const renderFacets = () => {
    const facetData = getFacetData();
    const selectedState = mobileFilters.matches ? draftFilters : appliedFilters;
    Object.entries(facetTitles).forEach(([group, title]) => {
      const container = dom.facetContainers.get(group);
      if (!container) return;
      const items = facetData[group] || [];
      container.hidden = items.length === 0;
      const options = items.map((item) => `
        <label class="search-facet__option">
          <input type="checkbox" value="${escapeHtml(item.value)}" data-search-facet-input="${group}"${selectedState[group].includes(item.value) ? ' checked' : ''} />
          <span class="search-facet__label">${escapeHtml(item.label)}</span>
          <span class="search-facet__count">${item.count}</span>
        </label>`).join('');
      container.innerHTML = `<fieldset><legend>${escapeHtml(title)}</legend><div class="search-facet__options">${options}</div></fieldset>`;
    });
    const selectedCount = countSelectedFilters(selectedState);
    if (dom.activeFilterCount) {
      dom.activeFilterCount.textContent = String(selectedCount);
      dom.activeFilterCount.hidden = selectedCount === 0;
    }
  };

  const renderActiveFilters = () => {
    if (!dom.activeFilters) return;
    const chips = Object.entries(appliedFilters).flatMap(([group, values]) => values.map((value) => `
      <button class="search-filter-chip" type="button" data-remove-filter-group="${group}" data-remove-filter-value="${escapeHtml(value)}" aria-label="Xóa bộ lọc ${escapeHtml(getFacetLabel(group, value))}">${escapeHtml(getFacetLabel(group, value))}</button>`));
    if (chips.length) chips.push('<button class="search-filter-clear-all" type="button" data-clear-all-filters>Xóa tất cả bộ lọc</button>');
    dom.activeFilters.innerHTML = chips.join('');
    dom.activeFilters.hidden = chips.length === 0;
  };

  const renderEmptyState = () => {
    if (!dom.grid) return;
    if (!searchQuery) {
      dom.grid.innerHTML = '<div class="search-results-empty"><strong>Nhập tên hãng, model hoặc kích thước để tìm sản phẩm.</strong><p>Ví dụ: Samsung 55, QLED, LG 43 hoặc QA65Q6.</p><div class="search-results-empty__actions"><a class="btn btn--secondary" href="index.html">Quay lại trang chủ</a></div></div>';
      return;
    }
    if (baseResults.length && !filteredResults.length) {
      dom.grid.innerHTML = '<div class="search-results-empty"><strong>Không có sản phẩm phù hợp với bộ lọc.</strong><p>Hãy xóa bớt một hoặc nhiều bộ lọc để xem lại kết quả.</p><div class="search-results-empty__actions"><button class="btn btn--primary" type="button" data-clear-all-filters>Xóa tất cả bộ lọc</button></div></div>';
      return;
    }
    dom.grid.innerHTML = '<div class="search-results-empty"><strong>Không tìm thấy sản phẩm phù hợp.</strong><p>Hãy thử tên hãng, model hoặc kích thước khác.</p><div class="search-results-empty__actions"><button class="btn btn--primary" type="button" data-clear-search-page>Xóa tìm kiếm</button><a class="btn btn--secondary" href="index.html">Quay lại trang chủ</a></div></div>';
  };

  const renderResults = () => {
    filteredResults = sortResults(baseResults.filter(productMatchesFilters));
    const selectedCount = countSelectedFilters();
    if (dom.title) dom.title.textContent = searchQuery ? `Kết quả tìm kiếm cho “${searchQuery}”` : 'Tìm kiếm sản phẩm';
    if (dom.summary) dom.summary.textContent = searchQuery
      ? `Tìm thấy ${filteredResults.length} sản phẩm${selectedCount ? ' sau khi lọc' : ''}`
      : 'Tìm theo hãng, model, kích thước hoặc công nghệ.';
    if (dom.count) dom.count.textContent = `${filteredResults.length} sản phẩm`;
    if (dom.sort) dom.sort.value = sortMode;

    if (!filteredResults.length) renderEmptyState();
    else {
      const visibleProducts = filteredResults.slice(0, visibleCount);
      dom.grid.innerHTML = visibleProducts.map(runtime.renderProductCard).join('');
      runtime.bindProductImages(dom.grid);
      runtime.updateCompareButtons(dom.grid);
    }
    if (dom.loadMore) {
      const canLoadMore = visibleCount < filteredResults.length;
      dom.loadMore.hidden = !canLoadMore;
      dom.loadMore.disabled = !canLoadMore;
    }
    renderActiveFilters();
  };

  const renderSearch = () => {
    if (!runtime.isReady()) {
      if (dom.title) dom.title.textContent = searchQuery ? `Kết quả tìm kiếm cho “${searchQuery}”` : 'Tìm kiếm sản phẩm';
      if (dom.summary) dom.summary.textContent = 'Đang tải sản phẩm...';
      return;
    }
    baseResults = searchQuery ? runtime.searchProducts(searchQuery) : [];
    renderFacets();
    renderResults();
  };

  const syncSearchInput = () => {
    if (dom.input) dom.input.value = searchQuery;
    if (dom.clearInput) dom.clearInput.hidden = !searchQuery;
  };

  const setSearchQuery = (query, { push = true, resetFilters = true } = {}) => {
    searchQuery = String(query || '').trim();
    visibleCount = BATCH_SIZE;
    if (resetFilters) {
      appliedFilters = emptyFilters();
      draftFilters = emptyFilters();
      sortMode = 'relevance';
    }
    syncSearchInput();
    updateUrl({ push });
    renderSearch();
  };

  const closeFilterDrawer = ({ restoreFocus = true } = {}) => {
    document.body.classList.remove('search-filter-open');
    dom.filterToggle?.setAttribute('aria-expanded', 'false');
    if (dom.filterOverlay) dom.filterOverlay.hidden = true;
    if (restoreFocus) drawerReturnFocus?.focus({ preventScroll: true });
  };

  const openFilterDrawer = () => {
    draftFilters = cloneFilters(appliedFilters);
    renderFacets();
    drawerReturnFocus = document.activeElement;
    document.body.classList.add('search-filter-open');
    dom.filterToggle?.setAttribute('aria-expanded', 'true');
    if (dom.filterOverlay) dom.filterOverlay.hidden = false;
    dom.filterClose?.focus({ preventScroll: true });
  };

  const applyFilterState = ({ updateHistory = true } = {}) => {
    visibleCount = BATCH_SIZE;
    renderFacets();
    renderResults();
    if (updateHistory) updateUrl();
  };

  const clearFilters = ({ draftOnly = false } = {}) => {
    if (draftOnly) {
      draftFilters = emptyFilters();
      renderFacets();
      return;
    }
    appliedFilters = emptyFilters();
    draftFilters = emptyFilters();
    applyFilterState();
  };

  document.addEventListener('change', (event) => {
    const input = event.target.closest('[data-search-facet-input]');
    if (!input) return;
    const group = input.dataset.searchFacetInput;
    const targetFilters = mobileFilters.matches ? draftFilters : appliedFilters;
    const values = new Set(targetFilters[group]);
    input.checked ? values.add(input.value) : values.delete(input.value);
    targetFilters[group] = [...values];
    if (mobileFilters.matches) {
      renderFacets();
      return;
    }
    draftFilters = cloneFilters(appliedFilters);
    applyFilterState();
  });

  dom.activeFilters?.addEventListener('click', (event) => {
    const removeButton = event.target.closest('[data-remove-filter-group]');
    if (removeButton) {
      const group = removeButton.dataset.removeFilterGroup;
      appliedFilters[group] = appliedFilters[group].filter((value) => value !== removeButton.dataset.removeFilterValue);
      draftFilters = cloneFilters(appliedFilters);
      applyFilterState();
      return;
    }
    if (event.target.closest('[data-clear-all-filters]')) clearFilters();
  });

  dom.grid?.addEventListener('click', (event) => {
    if (event.target.closest('[data-clear-all-filters]')) clearFilters();
    if (event.target.closest('[data-clear-search-page]')) setSearchQuery('', { push: true });
  });

  dom.filterToggle?.addEventListener('click', openFilterDrawer);
  dom.backButton?.addEventListener('click', () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    window.location.assign('index.html');
  });
  dom.filterClose?.addEventListener('click', () => closeFilterDrawer());
  dom.filterOverlay?.addEventListener('click', () => closeFilterDrawer());
  dom.filterApply?.addEventListener('click', () => {
    appliedFilters = cloneFilters(draftFilters);
    applyFilterState();
    closeFilterDrawer();
  });
  dom.filterClear?.addEventListener('click', () => clearFilters({ draftOnly: mobileFilters.matches }));
  dom.loadMore?.addEventListener('click', () => {
    visibleCount += BATCH_SIZE;
    renderResults();
  });
  dom.sort?.addEventListener('change', () => {
    sortMode = dom.sort.value;
    visibleCount = BATCH_SIZE;
    renderResults();
    updateUrl();
  });

  window.addEventListener('storefrontsearchsubmit', (event) => setSearchQuery(event.detail?.query || '', { push: true }));
  window.addEventListener('storefrontproductsready', renderSearch);
  window.addEventListener('popstate', () => {
    const state = getUrlState();
    searchQuery = state.query;
    appliedFilters = state.filters;
    draftFilters = cloneFilters(appliedFilters);
    sortMode = state.sort;
    visibleCount = BATCH_SIZE;
    syncSearchInput();
    renderSearch();
    closeFilterDrawer({ restoreFocus: false });
  });
  window.addEventListener('resize', () => {
    if (!mobileFilters.matches) closeFilterDrawer({ restoreFocus: false });
  });
  document.addEventListener('keydown', (event) => {
    if (!document.body.classList.contains('search-filter-open')) return;
    if (event.key === 'Escape') {
      closeFilterDrawer();
      return;
    }
    if (event.key !== 'Tab' || !dom.filterPanel) return;
    const focusable = [...dom.filterPanel.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')]
      .filter((element) => !element.hidden && element.getClientRects().length);
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

  const initialState = getUrlState();
  searchQuery = initialState.query;
  appliedFilters = initialState.filters;
  draftFilters = cloneFilters(appliedFilters);
  sortMode = initialState.sort;
  syncSearchInput();
  renderSearch();
})();
