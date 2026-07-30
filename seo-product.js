(() => {
  const BASE_URL = 'https://www.anhminhstore.io.vn';
  const root = document.querySelector('#product-detail-root');
  const params = new URLSearchParams(window.location.search);
  const productId = String(params.get('id') || '').trim();

  const ensureMeta = (selector, attributes) => {
    let element = document.head.querySelector(selector);
    if (!element) {
      element = document.createElement('meta');
      document.head.appendChild(element);
    }
    Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
    return element;
  };

  const ensureCanonical = (href) => {
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = href;
  };

  const absoluteUrl = (value = '') => {
    try {
      return new URL(value, window.location.href).href;
    } catch {
      return '';
    }
  };

  const trimText = (value = '', maxLength = 160) => {
    const text = String(value).replace(/\s+/g, ' ').trim();
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength - 1).trimEnd()}…`;
  };

  const parsePrice = (value = '') => {
    const digits = String(value).replace(/[^0-9]/g, '');
    const price = Number(digits);
    return Number.isFinite(price) && price > 0 ? price : null;
  };

  const getSpecValue = (label) => {
    const rows = Array.from(document.querySelectorAll('.product-specs > div'));
    const row = rows.find((item) => item.querySelector('dt')?.textContent.trim().toLowerCase() === label.toLowerCase());
    return row?.querySelector('dd')?.textContent.trim() || '';
  };

  const mapCondition = (value = '') => {
    const normalized = value.toLowerCase();
    if (normalized.includes('mới')) return 'https://schema.org/NewCondition';
    if (normalized.includes('cũ') || normalized.includes('qua sử dụng')) return 'https://schema.org/UsedCondition';
    return '';
  };

  const getAvailability = () => {
    const statusText = Array.from(document.querySelectorAll('.product-detail__badge--status'))
      .map((item) => item.textContent.trim().toLowerCase())
      .join(' ');
    if (statusText.includes('đã bán')) return 'https://schema.org/OutOfStock';
    if (statusText.includes('sắp về')) return 'https://schema.org/PreOrder';
    if (document.querySelector('[data-order-now][disabled]')) return 'https://schema.org/OutOfStock';
    return 'https://schema.org/InStock';
  };

  const setRobots = (content) => {
    ensureMeta('meta[name="robots"]', { name: 'robots', content });
    ensureMeta('meta[name="googlebot"]', { name: 'googlebot', content });
  };

  const setNoIndex = () => {
    setRobots('noindex,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1');
  };

  const upsertJsonLd = (graph) => {
    document.head.querySelector('script[data-seo-product-schema]')?.remove();
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.seoProductSchema = 'true';
    script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
    document.head.appendChild(script);
  };

  const applyProductSeo = () => {
    if (!root || !productId) {
      setNoIndex();
      return false;
    }

    const heading = root.querySelector('#product-detail-title');
    const brand = root.querySelector('.product-detail__brand')?.textContent.trim() || '';
    const model = root.querySelector('.product-detail__model')?.textContent.trim() || '';
    const descriptionNode = root.querySelector('.product-detail__description');
    const imageNode = root.querySelector('.product-detail__media img');

    if (!heading || !heading.textContent.trim()) return false;

    const fullName = heading.textContent.trim();
    const description = trimText(
      descriptionNode?.textContent || `${fullName} tại Anh Minh Store Đà Nẵng. Xem giá, tình trạng, bảo hành và liên hệ tư vấn.`,
      158,
    );
    const canonicalUrl = `${BASE_URL}/product-detail.html?id=${encodeURIComponent(productId)}`;
    const imageUrl = absoluteUrl(imageNode?.currentSrc || imageNode?.src || '');
    const title = trimText(`${fullName} | Anh Minh Store Đà Nẵng`, 62);
    const currentPriceText = root.querySelector('.product-detail__price strong')?.textContent.trim() || '';
    const currentPrice = parsePrice(currentPriceText);
    const size = getSpecValue('Kích thước');
    const productType = getSpecValue('Loại sản phẩm');
    const conditionText = getSpecValue('Tình trạng');
    const warranty = getSpecValue('Bảo hành');
    const itemCondition = mapCondition(conditionText);

    document.title = title;
    ensureCanonical(canonicalUrl);
    setRobots('index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1');

    ensureMeta('meta[name="description"]', { name: 'description', content: description });
    ensureMeta('meta[property="og:title"]', { property: 'og:title', content: title });
    ensureMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    ensureMeta('meta[property="og:type"]', { property: 'og:type', content: 'product' });
    ensureMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
    ensureMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: 'Anh Minh Store' });
    ensureMeta('meta[property="og:locale"]', { property: 'og:locale', content: 'vi_VN' });
    ensureMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    ensureMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
    ensureMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });

    if (imageUrl) {
      ensureMeta('meta[property="og:image"]', { property: 'og:image', content: imageUrl });
      ensureMeta('meta[property="og:image:alt"]', { property: 'og:image:alt', content: `Ảnh ${fullName}` });
      ensureMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: imageUrl });
    }

    if (currentPrice) {
      ensureMeta('meta[property="product:price:amount"]', { property: 'product:price:amount', content: String(currentPrice) });
      ensureMeta('meta[property="product:price:currency"]', { property: 'product:price:currency', content: 'VND' });
    }

    const organization = {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: 'Anh Minh Store',
      url: `${BASE_URL}/`,
      logo: `${BASE_URL}/Use_the_uploaded_image_as_202605051008.jpeg`,
      contactPoint: [
        { '@type': 'ContactPoint', telephone: '+84-905-111-223', contactType: 'customer service' },
        { '@type': 'ContactPoint', telephone: '+84-702-386-544', contactType: 'sales' },
      ],
    };

    const product = {
      '@type': 'Product',
      '@id': `${canonicalUrl}#product`,
      name: fullName,
      sku: productId,
      url: canonicalUrl,
      description,
      category: productType || 'Tivi',
      brand: brand ? { '@type': 'Brand', name: brand } : undefined,
      model: model || undefined,
      image: imageUrl ? [imageUrl] : undefined,
      itemCondition: itemCondition || undefined,
      additionalProperty: [
        size ? { '@type': 'PropertyValue', name: 'Kích thước', value: size } : null,
        conditionText ? { '@type': 'PropertyValue', name: 'Tình trạng', value: conditionText } : null,
        warranty ? { '@type': 'PropertyValue', name: 'Bảo hành', value: warranty } : null,
      ].filter(Boolean),
      offers: currentPrice
        ? {
            '@type': 'Offer',
            url: canonicalUrl,
            priceCurrency: 'VND',
            price: currentPrice,
            availability: getAvailability(),
            seller: { '@id': `${BASE_URL}/#organization` },
          }
        : undefined,
    };

    const breadcrumbs = {
      '@type': 'BreadcrumbList',
      '@id': `${canonicalUrl}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: `${BASE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Sản phẩm', item: `${BASE_URL}/#san-pham` },
        { '@type': 'ListItem', position: 3, name: fullName, item: canonicalUrl },
      ],
    };

    upsertJsonLd([organization, product, breadcrumbs]);
    return true;
  };

  if (!productId) {
    setNoIndex();
    return;
  }

  if (applyProductSeo()) return;

  const observer = new MutationObserver(() => {
    if (applyProductSeo()) observer.disconnect();
  });

  if (root) observer.observe(root, { childList: true, subtree: true });
  window.setTimeout(() => observer.disconnect(), 15000);
})();
