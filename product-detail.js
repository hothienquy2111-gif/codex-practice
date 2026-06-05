const productDetailRoot = document.querySelector('#product-detail-root');
const detailParams = new URLSearchParams(window.location.search);
const productId = detailParams.get('id');
const detailProducts = Array.isArray(window.products) ? window.products : [];

const escapeDetailHtml = (value = '') =>
  String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);

const normalizeDetailProduct = (product = {}) => ({
  id: product.id || '',
  brand: product.brand || 'Anh Minh Store',
  model: product.model || 'Tivi đang cập nhật',
  size: product.size || 'Liên hệ tư vấn',
  type: product.type || 'Tivi',
  condition: product.condition || 'Liên hệ kiểm tra tình trạng',
  features: Array.isArray(product.features) && product.features.length ? product.features : ['Thông tin đang được cập nhật'],
  oldPrice: product.oldPrice || '',
  price: product.price || 'Giá đang cập nhật',
  image: product.image || '',
  badge: product.badge || 'Tư vấn',
  description: product.description || 'Vui lòng liên hệ Anh Minh Store để được tư vấn chi tiết.',
});

const renderTvMedia = (product) => {
  const label = `${product.brand} ${product.model}`.trim();
  if (product.image) {
    return `<img class="product-detail__image" src="${escapeDetailHtml(product.image)}" alt="${escapeDetailHtml(label)}" decoding="async" />`;
  }

  return `
    <div class="product-detail__placeholder" role="img" aria-label="Ảnh minh họa tivi ${escapeDetailHtml(label)}">
      <div class="product-detail__screen"></div>
      <div class="product-detail__stand"></div>
      <div class="product-detail__base"></div>
    </div>`;
};

const renderMissingProduct = () => {
  if (!productDetailRoot) return;
  productDetailRoot.classList.add('product-detail-card--message');
  productDetailRoot.innerHTML = `
    <div class="detail-message">
      <span class="detail-message__icon" aria-hidden="true">!</span>
      <h1 id="product-detail-title">Không tìm thấy sản phẩm</h1>
      <p>Không tìm thấy sản phẩm. Vui lòng quay lại trang chủ.</p>
      <a class="btn btn--primary" href="index.html">Quay lại trang chủ</a>
    </div>`;
};

const renderProductDetail = (rawProduct) => {
  if (!productDetailRoot) return;
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

  productDetailRoot.innerHTML = `
    <div class="product-detail__media">
      ${renderTvMedia(product)}
    </div>
    <article class="product-detail__info">
      <span class="product-detail__badge">${escapeDetailHtml(product.badge)}</span>
      <p class="product-detail__brand">${escapeDetailHtml(product.brand)}</p>
      <h1 id="product-detail-title">${escapeDetailHtml(product.model)}</h1>
      <p class="product-detail__description">${escapeDetailHtml(product.description)}</p>

      <dl class="product-specs">
        <div><dt>Thương hiệu</dt><dd>${escapeDetailHtml(product.brand)}</dd></div>
        <div><dt>Model</dt><dd>${escapeDetailHtml(product.model)}</dd></div>
        <div><dt>Kích thước</dt><dd>${escapeDetailHtml(product.size)}</dd></div>
        <div><dt>Loại sản phẩm</dt><dd>${escapeDetailHtml(product.type)}</dd></div>
        <div><dt>Tình trạng</dt><dd>${escapeDetailHtml(product.condition)}</dd></div>
      </dl>

      <div class="product-detail__features">
        <h2>Đặc điểm nổi bật</h2>
        <ul>${features}</ul>
      </div>

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
};

const selectedProduct = detailProducts.find((product) => String(product.id || '') === productId);

if (!productId || !selectedProduct) {
  renderMissingProduct();
} else {
  renderProductDetail(selectedProduct);
}
