import { mkdir, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fetchPublicProducts, isIndexableProduct, parsePrice } from './product-source.mjs';
import { assertCatalogContinuity, logCatalogContinuity } from './product-catalog-guard.mjs';
import {
  SITE_ORIGIN, buildDescription, buildSlugBase, buildTitle, dataDirectory, escapeHtml,
  getBrandSlug, getSizeSlug, productDirectory, readJson, repositoryRoot, safeJson,
  stableHash, toAbsoluteProductUrl, toRelativeProductUrl,
} from './product-seo-utils.mjs';

const PAGE_SIZE = 24;
const HUB_THRESHOLD = 3;
const GENERATED_HEADER = '<!-- GENERATED FILE: DO NOT EDIT MANUALLY. Run node scripts/seo/run-product-seo.mjs -->';
const configPath = join(repositoryRoot, 'supabase-config.js');
const mapPath = join(dataDirectory, 'product-url-map.generated.json');
const snapshotPath = join(dataDirectory, 'products.generated.json');
const manifestPath = join(dataDirectory, 'generated-products-manifest.json');
const reportPath = join(dataDirectory, 'product-data-quality-report.json');
const overridesPath = join(dataDirectory, 'product-overrides.json');

const xmlEscape = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&apos;', '"': '&quot;' })[char]);
const byName = (left, right) => left.fullName.localeCompare(right.fullName, 'vi');

const productTitle = (product) => product.seoTitle || buildTitle(product);
const productDescription = (product) => product.seoDescription || buildDescription(product);
const productHeading = (product) => {
  const model = String(product.model || '').trim();
  if (!model || product.fullName.includes(model)) return product.fullName;
  return `${product.fullName} ${model}`;
};

const assignUniqueTitles = (products) => {
  const groups = new Map();
  products.forEach((product) => {
    const title = buildTitle(product);
    groups.set(title, [...(groups.get(title) || []), product]);
  });
  return products.map((product) => {
    const defaultTitle = buildTitle(product);
    if ((groups.get(defaultTitle) || []).length === 1) return { ...product, seoTitle: defaultTitle };
    const factualIdentity = [product.fullName, product.model || product.id].filter(Boolean).join(' ');
    return { ...product, seoTitle: `${factualIdentity} - Anh Minh Store` };
  });
};

const assignUniqueDescriptions = (products) => {
  const groups = new Map();
  products.forEach((product) => {
    const description = buildDescription(product);
    groups.set(description, [...(groups.get(description) || []), product]);
  });
  return products.map((product) => {
    const description = buildDescription(product);
    if ((groups.get(description) || []).length === 1) return product;
    const identity = [product.model, product.size, product.id].filter(Boolean).join(' ');
    const suffix = ` Thông tin mẫu ${identity}.`;
    const base = description.replace(/\.\.\.$/, '').trim();
    const available = Math.max(24, 160 - suffix.length - 3);
    return { ...product, seoDescription: `${base.slice(0, available).trimEnd()}...${suffix}` };
  });
};

const buildMap = (products, existingMap, overrides) => {
  const map = { ...existingMap };
  const claimed = new Map();
  Object.entries(map).forEach(([id, entry]) => {
    if (entry?.slug) claimed.set(entry.slug, id);
  });

  for (const product of products) {
    const override = overrides[product.id] || {};
    const stableExisting = map[product.id]?.slug;
    let slug = String(override.slug || stableExisting || buildSlugBase(product)).trim();
    const owner = claimed.get(slug);
    if (owner && owner !== product.id) {
      const suffix = String(product.id).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      slug = `${slug}-${suffix}`.slice(0, 110).replace(/-+$/g, '');
    }
    let uniqueSlug = slug;
    let counter = 2;
    while (claimed.has(uniqueSlug) && claimed.get(uniqueSlug) !== product.id) {
      uniqueSlug = `${slug}-${counter}`;
      counter += 1;
    }
    claimed.set(uniqueSlug, product.id);
    map[product.id] = { slug: uniqueSlug, url: toRelativeProductUrl(uniqueSlug) };
  }
  return map;
};

const getRelatedProducts = (product, products) => products
  .filter((candidate) => candidate.id !== product.id)
  .map((candidate) => {
    let score = 0;
    if (candidate.brand && candidate.brand === product.brand) score += 50;
    if (candidate.size && candidate.size === product.size) score += 20;
    if (candidate.type && candidate.type === product.type) score += 12;
    const price = parsePrice(product.price);
    const candidatePrice = parsePrice(candidate.price);
    if (price && candidatePrice && Math.max(price, candidatePrice) / Math.min(price, candidatePrice) <= 1.3) score += 8;
    return { candidate, score };
  })
  .sort((left, right) => right.score - left.score || byName(left.candidate, right.candidate))
  .slice(0, 6)
  .map(({ candidate }) => candidate);

const specificationProperties = (product) => {
  const rows = product.specifications.flatMap((group) => group.rows).slice(0, 12);
  const direct = [
    product.size ? { name: 'Kích thước', value: product.size } : null,
    product.type ? { name: 'Loại sản phẩm', value: product.type } : null,
  ].filter(Boolean);
  return [...direct, ...rows.map((row) => ({ name: row.label, value: row.value }))].slice(0, 14);
};

const renderPrice = (product) => product.price
  ? `<div class="product-seo-price"><span>Giá bán</span><strong>${escapeHtml(product.price)}</strong>${product.oldPrice ? `<del>${escapeHtml(product.oldPrice)}</del>` : ''}</div>`
  : '<p class="product-seo-contact-note">Liên hệ Anh Minh Store để được tư vấn giá và tình trạng sản phẩm.</p>';

const renderSpecs = (product) => {
  const identity = [
    ['Thương hiệu', product.brand], ['Model', product.model], ['Kích thước', product.size], ['Loại sản phẩm', product.type], ['Tình trạng', product.condition], ['Bảo hành', product.warranty],
  ].filter(([, value]) => value);
  const identityMarkup = identity.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('');
  const detailed = product.specifications.map((group) => `
    <section class="product-seo-spec-group">
      <h2>${escapeHtml(group.group)}</h2>
      <dl>${group.rows.map((row) => `<div><dt>${escapeHtml(row.label)}</dt><dd>${escapeHtml(row.value)}</dd></div>`).join('')}</dl>
    </section>`).join('');
  return `<section class="product-seo-specs" aria-labelledby="product-specs-title"><h2 id="product-specs-title">Thông tin sản phẩm</h2><dl>${identityMarkup}</dl>${detailed}</section>`;
};

const renderGallery = (product) => {
  if (!product.images.length) return '<div class="product-seo-image-placeholder">Ảnh sản phẩm đang được cập nhật</div>';
  const [primary, ...secondary] = product.images;
  const images = [primary, ...secondary].slice(0, 6);
  const label = product.model || product.fullName;
  return `<figure class="product-seo-gallery" data-static-gallery><img class="product-seo-gallery__main" data-static-gallery-main src="${escapeHtml(primary)}" alt="${escapeHtml(label)}" width="700" height="467" fetchpriority="high" decoding="async" />${images.length > 1 ? `<figcaption><ul>${images.map((image, index) => `<li><button type="button" data-static-gallery-thumb data-image="${escapeHtml(image)}" data-alt="${escapeHtml(`${label} góc nhìn ${index + 1}`)}"${index === 0 ? ' aria-current="true"' : ''} aria-label="Xem ${escapeHtml(`${label} góc nhìn ${index + 1}`)}"><img src="${escapeHtml(image)}" alt="" width="160" height="108" loading="lazy" decoding="async" /></button></li>`).join('')}</ul></figcaption>` : ''}</figure>`;
};

const renderRelated = (product, related, map) => {
  if (!related.length) return '';
  return `<section class="product-seo-related" aria-labelledby="related-products-title"><h2 id="related-products-title">Sản phẩm liên quan</h2><ul>${related.map((item) => `<li><a href="${escapeHtml(map[item.id].url)}">${escapeHtml(item.fullName)}</a>${item.model ? `<span>${escapeHtml(item.model)}</span>` : ''}</li>`).join('')}</ul></section>`;
};

const buildSchema = (product, map) => {
  const url = toAbsoluteProductUrl(map[product.id].slug);
  const description = productDescription(product);
  const productSchema = {
    '@type': 'Product', '@id': `${url}#product`, name: product.fullName, description, sku: product.id, url,
    ...(product.images.length ? { image: product.images } : {}),
    ...(product.brand ? { brand: { '@type': 'Brand', name: product.brand } } : {}),
    ...(product.model ? { model: product.model } : {}),
    ...(product.category ? { category: product.category } : {}),
    ...(specificationProperties(product).length ? { additionalProperty: specificationProperties(product).map((property) => ({ '@type': 'PropertyValue', ...property })) } : {}),
  };
  const price = parsePrice(product.price);
  if (price) {
    productSchema.offers = { '@type': 'Offer', url, priceCurrency: 'VND', price, seller: { '@id': `${SITE_ORIGIN}/#organization` } };
  }
  if (product.conditionType === 'new') productSchema.itemCondition = 'https://schema.org/NewCondition';
  if (product.conditionType === 'used') productSchema.itemCondition = 'https://schema.org/UsedCondition';
  return { '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: productTitle(product), description, isPartOf: { '@id': `${SITE_ORIGIN}/#website` }, mainEntity: { '@id': `${url}#product` }, inLanguage: 'vi-VN' },
    productSchema,
    { '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`, itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: `${SITE_ORIGIN}/` },
      { '@type': 'ListItem', position: 2, name: 'Sản phẩm', item: `${SITE_ORIGIN}/san-pham/` },
      ...(product.brand && map.brandHubs?.[product.brand] ? [{ '@type': 'ListItem', position: 3, name: product.brand, item: `${SITE_ORIGIN}${map.brandHubs[product.brand]}` }] : []),
      { '@type': 'ListItem', position: product.brand && map.brandHubs?.[product.brand] ? 4 : 3, name: product.fullName, item: url },
    ] },
  ] };
};

const staticShell = ({ title, description, canonical, body, schema, payload = null, robots = 'index,follow,max-image-preview:large' }) => `${GENERATED_HEADER}
<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="robots" content="${robots}" />
  <link rel="canonical" href="${escapeHtml(canonical)}" />
  <meta property="og:type" content="product" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${escapeHtml(canonical)}" />
  ${payload?.images?.[0] ? `<meta property="og:image" content="${escapeHtml(payload.images[0])}" /><meta property="og:image:alt" content="${escapeHtml(payload.model || payload.fullName)}" />` : ''}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  ${payload?.images?.[0] ? `<meta name="twitter:image" content="${escapeHtml(payload.images[0])}" />` : ''}
  <link rel="stylesheet" href="/styles.css" />
  <link rel="stylesheet" href="/product-static.css" />
  <script type="application/ld+json">${safeJson(schema)}</script>
</head>
<body class="product-seo-page">
  <header class="product-seo-header"><div><a class="product-seo-brand" href="/">Anh Minh Store</a><nav aria-label="Điều hướng chính"><a href="/san-pham/">Sản phẩm</a><a href="/tivi-cu-da-nang.html">Tivi cũ</a><a href="/sua-tivi.html">Sửa tivi</a><a href="/lien-he.html">Liên hệ</a></nav></div></header>
  ${body}
  <footer class="product-seo-footer"><p>Anh Minh Store - tư vấn tivi và thiết bị điện tử tại Đà Nẵng.</p><a href="tel:0905111223">Gọi tư vấn: 0905 111 223</a> <a href="/lien-he.html">Liên hệ cửa hàng</a></footer>
  ${payload ? `<script id="product-static-data" type="application/json">${safeJson(payload)}</script><script src="/product-url-map.js" defer></script><script src="/product-detail.js" defer></script><script src="/product-static.js" defer></script>` : ''}
</body>
</html>
`.replace(/^[ \t]+$/gm, '');

const buildProductPage = (product, products, map) => {
  const relativeUrl = map[product.id].url;
  const canonical = `${SITE_ORIGIN}${relativeUrl}`;
  const title = productTitle(product);
  const description = productDescription(product);
  const related = getRelatedProducts(product, products);
  const breadcrumb = `<nav class="product-seo-breadcrumb" aria-label="Breadcrumb"><a href="/">Trang chủ</a><span>/</span><a href="/san-pham/">Sản phẩm</a>${product.brand && map.brandHubs?.[product.brand] ? `<span>/</span><a href="${escapeHtml(map.brandHubs[product.brand])}">${escapeHtml(product.brand)}</a>` : ''}<span>/</span><span aria-current="page">${escapeHtml(product.fullName)}</span></nav>`;
  const highlights = product.features.length ? `<section class="product-seo-highlights"><h2>Điểm nổi bật</h2><ul>${product.features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join('')}</ul></section>` : '';
  const body = `<main class="product-seo-main"><article class="product-seo-product">${breadcrumb}<div class="product-seo-layout"><div class="product-seo-gallery-column">${renderGallery(product)}</div><header class="product-seo-identity"><p class="product-seo-brand-label">${escapeHtml(product.brand || 'Sản phẩm')}</p>${product.model ? `<p class="product-seo-model">Model: ${escapeHtml(product.model)}</p>` : ''}<h1>${escapeHtml(productHeading(product))}</h1>${renderPrice(product)}<p class="product-seo-description">${escapeHtml(product.description || description)}</p><div class="product-seo-actions"><a href="tel:0905111223">Gọi tư vấn</a><a href="/lien-he.html">Nhắn Anh Minh Store</a></div></header></div>${renderSpecs(product)}${highlights}${renderRelated(product, related, map)}</article></main>`;
  return staticShell({ title, description, canonical, body, schema: buildSchema(product, map), payload: product });
};

const buildRetiredProductPage = (entry) => {
  const canonical = toAbsoluteProductUrl(entry.slug);
  const title = 'Sản phẩm không còn hiển thị - Anh Minh Store';
  const description = 'Mẫu sản phẩm này hiện không còn hiển thị trong catalog công khai. Liên hệ Anh Minh Store để được tư vấn sản phẩm phù hợp.';
  const body = `<main class="product-seo-main"><article class="product-seo-hub"><nav class="product-seo-breadcrumb" aria-label="Breadcrumb"><a href="/">Trang chủ</a><span>/</span><a href="/san-pham/">Sản phẩm</a><span>/</span><span aria-current="page">Sản phẩm không còn hiển thị</span></nav><h1>Sản phẩm không còn hiển thị</h1><p>${escapeHtml(description)}</p><div class="product-seo-actions"><a href="/san-pham/">Xem sản phẩm hiện có</a><a href="tel:0905111223">Gọi tư vấn</a></div></article></main>`;
  const schema = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebPage', '@id': `${canonical}#webpage`, url: canonical, name: title, description, isPartOf: { '@id': `${SITE_ORIGIN}/#website` }, inLanguage: 'vi-VN' },
    { '@type': 'BreadcrumbList', '@id': `${canonical}#breadcrumb`, itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Trang chủ', item: `${SITE_ORIGIN}/` }, { '@type': 'ListItem', position: 2, name: 'Sản phẩm', item: `${SITE_ORIGIN}/san-pham/` }] },
  ] };
  return staticShell({ title, description, canonical, body, schema, robots: 'noindex,follow' });
};

const buildHubPage = ({ title, description, canonicalPath, products, map, page = 1, pageCount = 1 }) => {
  const canonical = `${SITE_ORIGIN}${canonicalPath}`;
  const list = products.map((product) => `<li><a href="${escapeHtml(map[product.id].url)}"><span>${escapeHtml(product.brand)}</span>${escapeHtml(product.fullName)}</a>${product.model ? `<small>${escapeHtml(product.model)}</small>` : ''}${product.price ? `<strong>${escapeHtml(product.price)}</strong>` : ''}</li>`).join('');
  const pages = pageCount > 1 ? `<nav class="product-seo-pagination" aria-label="Phân trang">${Array.from({ length: pageCount }, (_, index) => { const number = index + 1; const href = number === 1 ? '/san-pham/' : `/san-pham/trang-${number}.html`; return `<a href="${href}"${number === page ? ' aria-current="page"' : ''}>${number}</a>`; }).join('')}</nav>` : '';
  const body = `<main class="product-seo-main"><article class="product-seo-hub"><nav class="product-seo-breadcrumb" aria-label="Breadcrumb"><a href="/">Trang chủ</a><span>/</span><span aria-current="page">${escapeHtml(title)}</span></nav><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p><ul class="product-seo-list">${list}</ul>${pages}</article></main>`;
  const schema = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'CollectionPage', '@id': `${canonical}#webpage`, url: canonical, name: title, description, isPartOf: { '@id': `${SITE_ORIGIN}/#website` }, inLanguage: 'vi-VN' },
    { '@type': 'BreadcrumbList', '@id': `${canonical}#breadcrumb`, itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Trang chủ', item: `${SITE_ORIGIN}/` }, { '@type': 'ListItem', position: 2, name: title, item: canonical }] },
    { '@type': 'ItemList', itemListElement: products.map((product, index) => ({ '@type': 'ListItem', position: index + 1, url: `${SITE_ORIGIN}${map[product.id].url}`, name: product.fullName })) },
  ] };
  return staticShell({ title: `${title} - Anh Minh Store`, description, canonical, body, schema });
};

const createWritePlan = (products, map) => {
  const files = new Map();
  const pages = products.length ? Math.ceil(products.length / PAGE_SIZE) : 0;
  const brandHubs = {};
  const brands = new Map();
  products.forEach((product) => { if (product.brand) brands.set(product.brand, [...(brands.get(product.brand) || []), product]); });
  for (const [brand, brandProducts] of brands) {
    if (brandProducts.length < HUB_THRESHOLD) continue;
    brandHubs[brand] = `/thuong-hieu/${getBrandSlug(brand)}.html`;
  }
  map.brandHubs = brandHubs;
  products.forEach((product) => files.set(join(productDirectory, `${map[product.id].slug}.html`), buildProductPage(product, products, map)));
  for (let index = 0; index < pages; index += 1) {
    const page = index + 1;
    const pageProducts = products.slice(index * PAGE_SIZE, (index + 1) * PAGE_SIZE);
    const path = page === 1 ? join(productDirectory, 'index.html') : join(productDirectory, `trang-${page}.html`);
    files.set(path, buildHubPage({ title: page === 1 ? 'Sản phẩm tivi và điện tử' : `Sản phẩm tivi và điện tử - Trang ${page}`, description: 'Danh sách sản phẩm công khai tại Anh Minh Store. Chọn mẫu phù hợp để xem thông tin, hình ảnh và tư vấn.', canonicalPath: page === 1 ? '/san-pham/' : `/san-pham/trang-${page}.html`, products: pageProducts, map, page, pageCount: pages }));
  }
  for (const [brand, brandProducts] of brands) {
    const path = brandHubs[brand];
    if (!path) continue;
    files.set(join(repositoryRoot, path.slice(1)), buildHubPage({ title: `Tivi ${brand}`, description: `Các sản phẩm ${brand} công khai tại Anh Minh Store. Xem model, hình ảnh, thông tin và tư vấn chọn sản phẩm phù hợp.`, canonicalPath: path, products: brandProducts.sort(byName), map }));
  }
  const sizes = new Map();
  products.forEach((product) => { if (product.size) sizes.set(product.size, [...(sizes.get(product.size) || []), product]); });
  for (const [size, sizeProducts] of sizes) {
    if (sizeProducts.length < HUB_THRESHOLD) continue;
    const path = `/tivi/${getSizeSlug(size)}.html`;
    files.set(join(repositoryRoot, path.slice(1)), buildHubPage({ title: `Tivi ${size}`, description: `Các mẫu tivi ${size} công khai tại Anh Minh Store. Xem thông tin model, giá khi có và tư vấn lựa chọn phù hợp.`, canonicalPath: path, products: sizeProducts.sort(byName), map }));
  }
  for (const [key, title] of [['new', 'Tivi mới'], ['used', 'Tivi cũ']]) {
    const typeProducts = products.filter((product) => product.conditionType === key);
    if (typeProducts.length < HUB_THRESHOLD) continue;
    const path = key === 'new' ? '/tivi/tivi-moi.html' : '/tivi/tivi-cu.html';
    files.set(join(repositoryRoot, path.slice(1)), buildHubPage({ title, description: `${title} công khai tại Anh Minh Store. Xem model, hình ảnh, thông tin và tư vấn chọn sản phẩm phù hợp.`, canonicalPath: path, products: typeProducts.sort(byName), map }));
  }
  return { files, pageCount: pages, brandHubCount: Object.keys(brandHubs).length, sizeHubCount: [...sizes.values()].filter((items) => items.length >= HUB_THRESHOLD).length };
};

const buildProductSitemap = (products, map) => ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', ...products.map((product) => ['  <url>', `    <loc>${xmlEscape(toAbsoluteProductUrl(map[product.id].slug))}</loc>`, product.updatedAt ? `    <lastmod>${xmlEscape(product.updatedAt)}</lastmod>` : '', '  </url>'].filter(Boolean).join('\n')), '</urlset>', ''].join('\n');
const buildHubSitemap = (files) => ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', ...[...files.keys()].filter((path) => !path.startsWith(productDirectory + '\\') || /(?:index|trang-\d+)\.html$/i.test(path)).map((path) => {
  const relative = path.slice(repositoryRoot.length).replace(/\\/g, '/');
  return `  <url>\n    <loc>${xmlEscape(`${SITE_ORIGIN}${relative.endsWith('/index.html') ? relative.slice(0, -10) : relative}`)}</loc>\n  </url>`;
}), '</urlset>', ''].join('\n');

const writeAtomically = async (path, content) => {
  await mkdir(dirname(path), { recursive: true });
  const temp = `${path}.tmp-${process.pid}`;
  await writeFile(temp, content, 'utf8');
  await rename(temp, path);
};

export const runGeneration = async () => {
  const allProducts = await fetchPublicProducts({ configPath });
  const eligible = assignUniqueDescriptions(assignUniqueTitles(allProducts.filter(isIndexableProduct)));
  const previousManifest = await readJson(manifestPath, { products: [] });
  const continuity = assertCatalogContinuity({
    previousProducts: previousManifest.products,
    currentProducts: eligible,
    env: process.env,
  });
  logCatalogContinuity(continuity);
  const previousMap = await readJson(mapPath, {});
  const overrides = await readJson(overridesPath, {});
  const map = buildMap(eligible, previousMap, overrides);
  const urls = new Set(eligible.map((product) => map[product.id]?.url));
  if (urls.size !== eligible.length) throw new Error('Slug/canonical trùng; dừng trước khi ghi output.');
  const { files, pageCount, brandHubCount, sizeHubCount } = createWritePlan(eligible, map);
  const eligibleIds = new Set(eligible.map((product) => product.id));
  const retired = (previousManifest.products || []).filter((entry) => entry?.id && entry?.slug && !eligibleIds.has(entry.id) && /^[a-z0-9-]+$/.test(entry.slug));
  retired.forEach((entry) => files.set(join(productDirectory, `${entry.slug}.html`), buildRetiredProductPage(entry)));
  const titles = new Set();
  for (const product of eligible) { const title = productTitle(product); if (titles.has(title)) throw new Error('Title SEO trùng sau khi chuẩn hóa; dừng trước khi ghi output.'); titles.add(title); }
  const dataWarnings = {
    missingBrand: eligible.filter((product) => !product.brand).map((product) => product.id),
    missingModel: eligible.filter((product) => !product.model).map((product) => product.id),
    missingImage: eligible.filter((product) => !product.images.length).map((product) => product.id),
    missingPrice: eligible.filter((product) => !product.priceValue).map((product) => product.id),
    skipped: allProducts.filter((product) => !isIndexableProduct(product)).map((product) => product.id),
  };
  const manifest = { version: 1, products: eligible.map((product) => ({ id: product.id, slug: map[product.id].slug, url: map[product.id].url, sourceHash: stableHash(product) })).sort((left, right) => left.id.localeCompare(right.id, 'en')) };
  const runtimeMap = Object.fromEntries(eligible.map((product) => [product.id, map[product.id]]));
  const artifacts = new Map([
    [snapshotPath, `${JSON.stringify({ version: 1, products: eligible }, null, 2)}\n`],
    [mapPath, `${JSON.stringify(runtimeMap, null, 2)}\n`],
    [manifestPath, `${JSON.stringify(manifest, null, 2)}\n`],
    [reportPath, `${JSON.stringify({ discovered: allProducts.length, eligible: eligible.length, generated: eligible.length, continuity, retired: retired.map(({ id, slug, url }) => ({ id, slug, url })), ...dataWarnings }, null, 2)}\n`],
    [join(repositoryRoot, 'product-url-map.js'), `${GENERATED_HEADER}\nwindow.AnhMinhProductUrlMap = Object.freeze(${safeJson(runtimeMap)});\n`],
    [join(repositoryRoot, 'sitemap-products.xml'), buildProductSitemap(eligible, map)],
    [join(repositoryRoot, 'sitemap-product-hubs.xml'), buildHubSitemap(files)],
  ]);
  if (!(await readJson(overridesPath, null))) artifacts.set(overridesPath, '{\n}\n');
  for (const [path, content] of [...files, ...artifacts]) await writeAtomically(path, content);
  console.log(JSON.stringify({ discovered: allProducts.length, eligible: eligible.length, generated: eligible.length, continuity, retired: retired.length, skipped: dataWarnings.skipped.length, sitemapUrls: eligible.length, productIndexPages: pageCount, brandHubs: brandHubCount, sizeHubs: sizeHubCount, merchantFeedEligible: 0, warnings: Object.fromEntries(Object.entries(dataWarnings).filter(([key]) => key !== 'skipped').map(([key, value]) => [key, value.length])) }, null, 2));
};

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}`) {
  runGeneration().catch((error) => { console.error(`SEO product generation FAIL: ${error.message}`); process.exitCode = 1; });
}
