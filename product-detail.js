const productDetailRoot = document.querySelector("#product-detail-root");
const detailProducts = Array.isArray(window.products) ? window.products : [];
const detailParams = new URLSearchParams(window.location.search);
const productId = detailParams.get("id");

const renderTvMedia = (product) => {
  if (product.image) {
    return `<img class="product-detail__image" src="${product.image}" alt="${product.brand} ${product.model}" />`;
  }

  return `
    <div class="product-detail__placeholder" role="img" aria-label="Ảnh minh họa tivi ${product.brand} ${product.model}">
      <div class="product-detail__screen"></div>
      <div class="product-detail__stand"></div>
      <div class="product-detail__base"></div>
    </div>`;
};

const renderMissingProduct = () => {
  if (!productDetailRoot) return;

  productDetailRoot.classList.add("product-detail-card--message");
  productDetailRoot.innerHTML = `
    <div class="detail-message">
      <span class="detail-message__icon" aria-hidden="true">!</span>
      <h1 id="product-detail-title">Không tìm thấy sản phẩm</h1>
      <p>Không tìm thấy sản phẩm. Vui lòng quay lại trang chủ.</p>
      <a class="btn btn--primary" href="index.html">Quay lại trang chủ</a>
    </div>`;
};

const renderProductDetail = (product) => {
  if (!productDetailRoot) return;

  document.title = `${product.brand} ${product.model} - Anh Minh Store`;
  const features = product.features.map((feature) => `<li>${feature}</li>`).join("");
  const oldPrice = product.oldPrice
    ? `<p class="product-detail__old-price"><span>Giá cũ:</span> <del>${product.oldPrice}</del></p>`
    : "";

  productDetailRoot.innerHTML = `
    <div class="product-detail__media">
      ${renderTvMedia(product)}
    </div>
    <article class="product-detail__info">
      <span class="product-detail__badge">${product.badge}</span>
      <p class="product-detail__brand">${product.brand}</p>
      <h1 id="product-detail-title">${product.model}</h1>
      <p class="product-detail__description">${product.description}</p>

      <dl class="product-specs">
        <div><dt>Thương hiệu</dt><dd>${product.brand}</dd></div>
        <div><dt>Model</dt><dd>${product.model}</dd></div>
        <div><dt>Kích thước</dt><dd>${product.size}</dd></div>
        <div><dt>Loại sản phẩm</dt><dd>${product.type}</dd></div>
        <div><dt>Tình trạng</dt><dd>${product.condition}</dd></div>
      </dl>

      <div class="product-detail__features">
        <h2>Đặc điểm nổi bật</h2>
        <ul>${features}</ul>
      </div>

      <div class="product-detail__price-box">
        ${oldPrice}
        <p class="product-detail__price"><span>Giá bán:</span> <strong>${product.price}</strong></p>
      </div>

      <div class="product-detail__actions">
        <a class="btn btn--primary" href="tel:0905111223">Gọi tư vấn</a>
        <a class="btn btn--zalo" href="#">Nhắn Zalo</a>
        <a class="btn btn--secondary" href="index.html#san-pham">Quay lại danh sách</a>
      </div>
    </article>`;
};

const selectedProduct = detailProducts.find((product) => product.id === productId);

if (!productId || !selectedProduct) {
  renderMissingProduct();
} else {
  renderProductDetail(selectedProduct);
}
