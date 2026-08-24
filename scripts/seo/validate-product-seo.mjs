import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { dataDirectory, productDirectory, readJson, repositoryRoot, SITE_ORIGIN, toAbsoluteProductUrl } from './product-seo-utils.mjs';
import { parsePrice } from './product-source.mjs';

const mapPath = join(dataDirectory, 'product-url-map.generated.json');
const snapshotPath = join(dataDirectory, 'products.generated.json');
const manifestPath = join(dataDirectory, 'generated-products-manifest.json');
const reportPath = join(dataDirectory, 'product-data-quality-report.json');
const errors = [];
const warnings = [];

const extract = (source, pattern) => source.match(pattern)?.[1]?.trim() || '';
const htmlPathFor = (relativeUrl) => join(repositoryRoot, relativeUrl.replace(/^\//, '').replaceAll('/', '\\'));
const getJsonLd = (source) => [...source.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((match) => JSON.parse(match[1]));

export const validateProductSeo = async () => {
  const catalog = await readJson(snapshotPath, null);
  const map = await readJson(mapPath, null);
  const manifest = await readJson(manifestPath, null);
  const report = await readJson(reportPath, null);
  if (!catalog?.products || !map || !manifest?.products) return ['Thiếu catalog/map/manifest SEO V4 đã generate.'];

  const products = catalog.products;
  const ids = new Set(products.map((product) => product.id));
  const urls = products.map((product) => map[product.id]?.url).filter(Boolean);
  if (urls.length !== products.length) errors.push('Không phải mọi product eligible đều có URL map.');
  if (new Set(urls).size !== urls.length) errors.push('Phát hiện canonical URL trùng.');
  if (manifest.products.length !== products.length) errors.push('Manifest không khớp catalog eligible.');
  if (!report?.continuity) {
    errors.push('Báo cáo data quality thiếu catalog continuity evidence.');
  } else {
    if (report.continuity.currentCount !== products.length) errors.push('Continuity currentCount không khớp catalog eligible.');
    if (report.continuity.previousCount < 0 || report.continuity.removedCount < 0 || report.continuity.addedCount < 0) errors.push('Continuity metrics không hợp lệ.');
    if (report.continuity.overrideUsed && !report.continuity.overrideReason) errors.push('Continuity override thiếu lý do audit.');
    if (!report.continuity.overrideUsed && Object.hasOwn(report.continuity, 'overrideReason')) errors.push('Continuity report không được giữ override reason khi override không dùng.');
  }

  const titles = new Set();
  const descriptions = new Set();
  for (const product of products) {
    const entry = map[product.id];
    if (!entry?.slug || !/^\/san-pham\/[a-z0-9-]+\.html$/.test(entry.url || '')) {
      errors.push(`${product.id}: slug hoặc canonical path không hợp lệ.`);
      continue;
    }
    const pagePath = htmlPathFor(entry.url);
    try { await access(pagePath); } catch { errors.push(`${product.id}: thiếu file static ${entry.url}.`); continue; }
    const source = await readFile(pagePath, 'utf8');
    const title = extract(source, /<title>([\s\S]*?)<\/title>/i);
    const description = extract(source, /<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']\s*\/?\s*>/i);
    const canonical = extract(source, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
    const h1s = source.match(/<h1\b/gi) || [];
    if (!title) errors.push(`${entry.url}: thiếu title.`);
    if (titles.has(title)) errors.push(`${entry.url}: title trùng.`);
    titles.add(title);
    if (!description) errors.push(`${entry.url}: thiếu meta description.`);
    if (descriptions.has(description)) errors.push(`${entry.url}: meta description trùng.`);
    descriptions.add(description);
    if (canonical !== toAbsoluteProductUrl(entry.slug)) errors.push(`${entry.url}: canonical không khớp map.`);
    if (canonical.includes('github.io')) errors.push(`${entry.url}: canonical dùng GitHub Pages host.`);
    const expectedHeading = product.model && !product.fullName.includes(product.model)
      ? `${product.fullName} ${product.model}`
      : product.fullName;
    const h1 = extract(source, /<h1>([\s\S]*?)<\/h1>/i);
    if (h1s.length !== 1 || h1 !== expectedHeading) errors.push(`${entry.url}: H1 product identity không hợp lệ.`);
    if (!source.includes('lang="vi"') || !source.includes('name="viewport"')) errors.push(`${entry.url}: thiếu raw HTML locale/viewport.`);
    if (!source.includes('id="product-static-data"')) errors.push(`${entry.url}: thiếu payload progressive enhancement.`);
    if (product.model) {
      if (![title, h1, source].every((value) => value.includes(product.model))) errors.push(`${entry.url}: model không hiện diện trong title/H1/body.`);
    }
    let graphs;
    try { graphs = getJsonLd(source); } catch { errors.push(`${entry.url}: JSON-LD không parse được.`); continue; }
    const graph = graphs.flatMap((item) => item?.['@graph'] || []);
    const productSchema = graph.find((item) => item?.['@type'] === 'Product');
    const breadcrumb = graph.find((item) => item?.['@type'] === 'BreadcrumbList');
    if (!productSchema) errors.push(`${entry.url}: thiếu Product schema.`);
    if (!breadcrumb) errors.push(`${entry.url}: thiếu Breadcrumb schema.`);
    if (product.model && productSchema?.model !== product.model) errors.push(`${entry.url}: schema.model không khớp catalog.`);
    if (JSON.stringify(graph).includes('aggregateRating') || JSON.stringify(graph).includes('reviewCount')) errors.push(`${entry.url}: có rating/review không được xác minh.`);
    const price = parsePrice(product.price);
    if (price && (!productSchema?.offers || productSchema.offers.price !== price || productSchema.offers.priceCurrency !== 'VND')) errors.push(`${entry.url}: Offer không trung thực hoặc thiếu.`);
    if (!price && productSchema?.offers) errors.push(`${entry.url}: có Offer khi không có numeric price.`);
  }

  const productSitemap = await readFile(join(repositoryRoot, 'sitemap-products.xml'), 'utf8');
  const productLocs = [...productSitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const expectedLocs = new Set(products.map((product) => toAbsoluteProductUrl(map[product.id].slug)));
  if (productLocs.length !== expectedLocs.size || productLocs.some((loc) => !expectedLocs.has(loc))) errors.push('sitemap-products.xml không khớp chính xác canonical products.');
  if (productLocs.some((loc) => loc.includes('product-detail.html') || loc.includes('github.io'))) errors.push('sitemap-products.xml còn legacy/GitHub Pages URL.');
  for (const retired of report?.retired || []) {
    if (!retired?.slug || !retired?.url) { errors.push('Báo cáo retirement thiếu slug hoặc URL.'); continue; }
    const retiredPath = htmlPathFor(retired.url);
    try {
      const source = await readFile(retiredPath, 'utf8');
      if (!source.includes('name="robots" content="noindex,follow"')) errors.push(`${retired.url}: archive product phải noindex,follow.`);
      if (productLocs.includes(toAbsoluteProductUrl(retired.slug))) errors.push(`${retired.url}: archive product không được còn trong sitemap.`);
      if (map[retired.id]) errors.push(`${retired.url}: archive product không được còn trong runtime URL map.`);
    } catch { errors.push(`${retired.url}: thiếu static archive page cho product retired.`); }
  }

  const indexPages = [];
  for (let page = 1; ; page += 1) {
    const path = page === 1 ? join(productDirectory, 'index.html') : join(productDirectory, `trang-${page}.html`);
    try { await access(path); indexPages.push(await readFile(path, 'utf8')); } catch { break; }
  }
  if (!indexPages.length) errors.push('Thiếu static product index.');
  const indexLinks = new Set(indexPages.flatMap((source) => [...source.matchAll(/href=["'](\/san-pham\/[a-z0-9-]+\.html)["']/g)].map((match) => match[1])));
  for (const url of urls) if (!indexLinks.has(url)) errors.push(`${url}: orphan, không có link từ static product index.`);
  if (indexPages.some((source) => source.includes('product-detail.html?id='))) errors.push('Static product index còn link legacy query URL.');

  const sitemapIndex = await readFile(join(repositoryRoot, 'sitemap.xml'), 'utf8');
  if (!sitemapIndex.includes(`${SITE_ORIGIN}/sitemap-product-hubs.xml`)) errors.push('sitemap.xml chưa chứa sitemap-product-hubs.xml.');
  const runtimeMap = await readFile(join(repositoryRoot, 'product-url-map.js'), 'utf8');
  if (!runtimeMap.includes('AnhMinhProductUrlMap') || runtimeMap.includes('sb_secret_')) errors.push('Runtime product URL map thiếu hoặc lộ secret.');
  if (ids.size !== products.length) errors.push('Catalog SEO có product ID trùng.');
  if (warnings.length) console.warn(`SEO V4 warnings: ${warnings.join(' | ')}`);
  return errors;
};

const escapeForSearch = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}`) {
  const result = await validateProductSeo();
  if (result.length) {
    console.error(`SEO V4 validation FAIL (${result.length} lỗi):\n${result.map((error) => `- ${error}`).join('\n')}`);
    process.exitCode = 1;
  } else {
    console.log('SEO V4 validation PASS: static pages, schema, sitemap và crawl links hợp lệ.');
  }
}
