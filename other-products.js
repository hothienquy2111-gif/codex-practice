(() => {
  const CATEGORY_MAP = {
    loa: 'Loa',
    'dieu-khien-tivi': 'Điều khiển tivi',
    'gia-treo-tivi': 'Giá treo tivi',
    'phu-kien-tivi': 'Phụ kiện tivi',
    'day-hdmi': 'Dây HDMI',
    'san-pham-gia-dinh': 'Sản phẩm gia đình',
    'dich-vu-sua-chua': 'Dịch vụ sửa chữa',
    'thu-hu-doi-moi': 'Thu hư đổi mới',
  };

  const params = new URLSearchParams(window.location.search);
  const categoryKey = params.get('category') || '';
  const categoryTitle = CATEGORY_MAP[categoryKey] || 'Sản phẩm khác';
  const titleElement = document.querySelector('[data-category-title]');
  const subtitleElement = document.querySelector('[data-category-subtitle]');
  const familyPlaceholder = document.querySelector('[data-family-placeholder]');

  if (titleElement) titleElement.textContent = categoryTitle;
  document.title = `${categoryTitle} - Anh Minh Store`;

  if (subtitleElement) {
    subtitleElement.textContent = 'Danh mục này đang được Anh Minh Store cập nhật. Vui lòng quay lại sau hoặc liên hệ cửa hàng để được tư vấn nhanh.';
  }

  if (familyPlaceholder) {
    familyPlaceholder.hidden = categoryKey !== 'san-pham-gia-dinh';
  }
})();
