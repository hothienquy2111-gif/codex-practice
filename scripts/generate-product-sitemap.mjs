import { readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_ORIGIN = 'https://www.anhminhstore.io.vn';
const PRODUCT_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
const MAX_SITEMAP_URLS = 50_000;
const REQUEST_TIMEOUT_MS = 20_000;
const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, '..');
const configPath = join(repositoryRoot, 'supabase-config.js');
const outputPath = join(repositoryRoot, 'sitemap-products.xml');
const temporaryPath = join(
  repositoryRoot,
  `sitemap-products.xml.tmp-${process.pid}-${Date.now()}`,
);

const extractConstant = (source, name) => {
  const pattern = new RegExp(`(?:const|let|var)\\s+${name}\\s*=\\s*([\"'])(.*?)\\1\\s*;`);
  return source.match(pattern)?.[2]?.trim() || '';
};

const decodeJwtPayload = (token) => {
  const payload = token.split('.')[1];
  if (!payload) return null;
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
};

const assertPublicKey = (key) => {
  if (!key || key.includes('YOUR_SUPABASE')) {
    throw new Error('Thiếu public/publishable Supabase key; sitemap cũ được giữ nguyên.');
  }
  if (key.startsWith('sb_secret_')) {
    throw new Error('Từ chối secret Supabase key; generator chỉ chấp nhận public/publishable key.');
  }
  const jwtPayload = decodeJwtPayload(key);
  if (jwtPayload?.role === 'service_role') {
    throw new Error('Từ chối service-role key; generator chỉ chấp nhận anon/public key.');
  }
  if (!key.startsWith('sb_publishable_') && jwtPayload?.role !== 'anon') {
    throw new Error('Key không được nhận diện là publishable/anon; sitemap cũ được giữ nguyên.');
  }
};

const escapeXml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

const normalizeLastmod = (value) => {
  if (value == null || value === '') return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('Phát hiện updated_at không hợp lệ; sitemap cũ được giữ nguyên.');
  }
  return parsed.toISOString();
};

const buildXml = (products) => {
  const rows = products.map((product) => {
    const productUrl = `${SITE_ORIGIN}/product-detail.html?id=${encodeURIComponent(product.id)}`;
    const lastmod = normalizeLastmod(product.updated_at);
    return [
      '  <url>',
      `    <loc>${escapeXml(productUrl)}</loc>`,
      ...(lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : []),
      '  </url>',
    ].join('\n');
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...rows,
    '</urlset>',
    '',
  ].join('\n');
};

const validateGeneratedXml = (xml, products) => {
  if (!xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')) {
    throw new Error('XML declaration không hợp lệ; sitemap cũ được giữ nguyên.');
  }
  if (!xml.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')) {
    throw new Error('XML namespace không hợp lệ; sitemap cũ được giữ nguyên.');
  }

  const locations = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  if (locations.length !== products.length || locations.length === 0) {
    throw new Error('Số URL trong XML không khớp dữ liệu; sitemap cũ được giữ nguyên.');
  }

  products.forEach((product, index) => {
    const expected = escapeXml(
      `${SITE_ORIGIN}/product-detail.html?id=${encodeURIComponent(product.id)}`,
    );
    if (locations[index] !== expected) {
      throw new Error('Thứ tự hoặc URL sản phẩm không deterministic; sitemap cũ được giữ nguyên.');
    }
  });
};

const readActiveProducts = async (supabaseUrl, publicKey) => {
  const endpoint = new URL('/rest/v1/products', supabaseUrl);
  endpoint.searchParams.set('select', 'id,updated_at');
  endpoint.searchParams.set('is_active', 'eq.true');
  endpoint.searchParams.set('order', 'id.asc');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response;
  try {
    response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        apikey: publicKey,
        Authorization: `Bearer ${publicKey}`,
        Prefer: 'count=exact',
        Range: `0-${MAX_SITEMAP_URLS - 1}`,
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new Error(`Supabase trả HTTP ${response.status}; sitemap cũ được giữ nguyên.`);
  }

  const contentRange = response.headers.get('content-range') || '';
  const totalMatch = contentRange.match(/\/(\d+)$/);
  if (!totalMatch) {
    throw new Error('Supabase không trả exact count; sitemap cũ được giữ nguyên.');
  }
  const expectedCount = Number.parseInt(totalMatch[1], 10);
  if (!Number.isSafeInteger(expectedCount) || expectedCount < 1) {
    throw new Error('Danh sách sản phẩm active rỗng bất thường; sitemap cũ được giữ nguyên.');
  }
  if (expectedCount > MAX_SITEMAP_URLS) {
    throw new Error('Sản phẩm vượt giới hạn 50.000 URL; cần chia thêm sitemap trước khi ghi.');
  }

  const payload = await response.json();
  if (!Array.isArray(payload) || payload.length !== expectedCount) {
    throw new Error('Số bản ghi không khớp exact count; sitemap cũ được giữ nguyên.');
  }
  return payload;
};

const normalizeProducts = (payload) => {
  const seenIds = new Set();
  const products = payload.map((row) => {
    const id = String(row?.id || '').trim();
    if (!PRODUCT_ID_PATTERN.test(id)) {
      throw new Error('Phát hiện product id thiếu hoặc sai định dạng; sitemap cũ được giữ nguyên.');
    }
    if (seenIds.has(id)) {
      throw new Error('Phát hiện product id trùng; sitemap cũ được giữ nguyên.');
    }
    seenIds.add(id);
    return {
      id,
      updated_at: row?.updated_at ?? null,
    };
  });

  return products.sort((left, right) => (
    left.id < right.id ? -1 : left.id > right.id ? 1 : 0
  ));
};

const removeTemporaryFile = async () => {
  if (!temporaryPath.startsWith(`${repositoryRoot}\\`) && !temporaryPath.startsWith(`${repositoryRoot}/`)) {
    throw new Error('Từ chối dọn file tạm ngoài repository.');
  }
  try {
    await unlink(temporaryPath);
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
};

const main = async () => {
  const configSource = await readFile(configPath, 'utf8');
  const supabaseUrl = extractConstant(configSource, 'SUPABASE_URL');
  const publicKey = (
    extractConstant(configSource, 'SUPABASE_PUBLISHABLE_KEY')
    || extractConstant(configSource, 'SUPABASE_ANON_KEY')
  );
  if (!supabaseUrl || !/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(supabaseUrl)) {
    throw new Error('Supabase URL không hợp lệ; sitemap cũ được giữ nguyên.');
  }
  assertPublicKey(publicKey);

  const payload = await readActiveProducts(supabaseUrl, publicKey);
  const products = normalizeProducts(payload);
  const xml = buildXml(products);

  await writeFile(temporaryPath, xml, { encoding: 'utf8', flag: 'wx' });
  const stagedXml = await readFile(temporaryPath, 'utf8');
  validateGeneratedXml(stagedXml, products);
  await rename(temporaryPath, outputPath);

  console.log(`Đã tạo sitemap-products.xml với ${products.length} URL sản phẩm active.`);
};

main()
  .catch(async (error) => {
    await removeTemporaryFile();
    console.error(error.message);
    process.exitCode = 1;
  });
