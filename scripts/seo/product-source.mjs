import { readFile } from 'node:fs/promises';

const PRODUCT_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
const REQUEST_TIMEOUT_MS = 20_000;
const PAGE_SIZE = 1_000;

const extractConstant = (source, name) => {
  const pattern = new RegExp(`(?:const|let|var)\\s+${name}\\s*=\\s*(["'])(.*?)\\1\\s*;`);
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
  if (!key || key.includes('YOUR_SUPABASE')) throw new Error('Thiếu public/publishable Supabase key.');
  if (key.startsWith('sb_secret_')) throw new Error('Từ chối secret Supabase key.');
  if (decodeJwtPayload(key)?.role === 'service_role') throw new Error('Từ chối service-role key.');
  if (!key.startsWith('sb_publishable_') && decodeJwtPayload(key)?.role !== 'anon') {
    throw new Error('Key không được nhận diện là publishable/anon.');
  }
};

export const normalizeText = (value = '') => String(value)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/\s+/g, ' ')
  .trim();

export const isMeaningfulProductName = (value = '') => {
  const normalized = normalizeText(value);
  return Boolean(normalized)
    && !normalized.includes('dang cap nhat')
    && !normalized.includes('san pham dang cap nhat');
};

export const normalizeExternalUrl = (value = '') => {
  try {
    const url = new URL(String(value || '').trim());
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
};

export const parsePrice = (value = '') => {
  const source = String(value || '').trim();
  if (!source || normalizeText(source).includes('lien he')) return null;
  const digits = source.replace(/[^\d]/g, '');
  if (!digits) return null;
  const price = Number.parseInt(digits, 10);
  return Number.isSafeInteger(price) && price > 0 ? price : null;
};

const normalizeImages = (product = {}) => {
  const candidates = Array.isArray(product.images) && product.images.length
    ? product.images
    : product.image ? [product.image] : [];
  return [...new Set(candidates.map(normalizeExternalUrl).filter(Boolean))];
};

const normalizeSpecifications = (specifications) => {
  if (!Array.isArray(specifications)) return [];
  return specifications.map((group) => ({
    group: String(group?.group || group?.title || '').trim(),
    rows: Array.isArray(group?.rows) ? group.rows.map((row) => ({
      label: String(row?.label || row?.name || '').trim(),
      value: Array.isArray(row?.value)
        ? row.value.map((item) => String(item || '').trim()).filter(Boolean).join(', ')
        : String(row?.value || '').trim(),
    })).filter((row) => row.label && row.value) : [],
  })).filter((group) => group.group && group.rows.length);
};

const conditionFromType = (type = '') => {
  const normalized = normalizeText(type);
  if (normalized.includes('tivi moi') || normalized.includes('tv moi')) return 'new';
  if (normalized.includes('tivi cu') || normalized.includes('tv cu') || normalized.includes('da qua su dung')) return 'used';
  return '';
};

const normalizedRecord = (product = {}) => {
  const id = String(product.id || '').trim();
  const fullName = String(product.full_name || product.fullName || product.name || product.model || '').trim();
  const brand = String(product.brand || '').trim();
  const model = String(product.model || '').trim();
  const type = String(product.type || '').trim();
  const stockStatus = String(product.stock_status || product.stockStatus || '').trim().toLowerCase();
  const isActive = product.is_active !== false && product.isActive !== false;
  const images = normalizeImages(product);
  const description = String(product.description || '').replace(/\s+/g, ' ').trim();
  const features = Array.isArray(product.features)
    ? product.features.map((value) => String(value || '').trim()).filter(Boolean)
    : [];

  return {
    id,
    fullName,
    brand,
    model,
    size: String(product.size || product.capacity_or_size || product.capacityOrSize || '').trim(),
    type,
    condition: String(product.condition || '').trim(),
    conditionType: conditionFromType(type),
    category: String(product.category || '').trim(),
    subcategory: String(product.subcategory || '').trim(),
    price: String(product.price || '').trim(),
    priceValue: parsePrice(product.price),
    oldPrice: String(product.old_price || product.oldPrice || '').trim(),
    description,
    features,
    images,
    warranty: String(product.warranty || '').trim(),
    specifications: normalizeSpecifications(product.specifications),
    isActive,
    stockStatus,
    updatedAt: String(product.updated_at || product.updatedAt || '').trim(),
  };
};

export const isIndexableProduct = (product) => (
  PRODUCT_ID_PATTERN.test(product.id)
  && product.isActive
  && product.stockStatus !== 'hidden'
  && isMeaningfulProductName(product.fullName)
);

export const fetchPublicProducts = async ({ configPath } = {}) => {
  const configSource = await readFile(configPath, 'utf8');
  const supabaseUrl = extractConstant(configSource, 'SUPABASE_URL');
  const publicKey = extractConstant(configSource, 'SUPABASE_PUBLISHABLE_KEY') || extractConstant(configSource, 'SUPABASE_ANON_KEY');
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(supabaseUrl)) throw new Error('Supabase URL không hợp lệ.');
  assertPublicKey(publicKey);

  const endpoint = new URL('/rest/v1/products', supabaseUrl);
  endpoint.searchParams.set('select', '*');
  endpoint.searchParams.set('is_active', 'eq.true');
  endpoint.searchParams.set('order', 'id.asc');
  const fetchPage = async (from, to) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(endpoint, {
        headers: { Accept: 'application/json', apikey: publicKey, Authorization: `Bearer ${publicKey}`, Prefer: 'count=exact', Range: `${from}-${to}` },
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`Public catalog trả HTTP ${response.status}.`);
      return response;
    } finally {
      clearTimeout(timeout);
    }
  };
  const firstResponse = await fetchPage(0, PAGE_SIZE - 1);
  const totalMatch = (firstResponse.headers.get('content-range') || '').match(/\/(\d+)$/);
  if (!totalMatch) throw new Error('Public catalog không trả exact count.');
  const total = Number.parseInt(totalMatch[1], 10);
  const rows = await firstResponse.json();
  if (!Array.isArray(rows)) throw new Error('Public catalog không trả danh sách hợp lệ.');
  for (let from = rows.length; from < total; from += PAGE_SIZE) {
    const response = await fetchPage(from, Math.min(from + PAGE_SIZE - 1, total - 1));
    const page = await response.json();
    if (!Array.isArray(page) || !page.length) throw new Error('Public catalog bị thiếu trang; dừng để giữ output cũ.');
    rows.push(...page);
  }
  if (rows.length !== total) throw new Error('Public catalog không đầy đủ; dừng để giữ output cũ.');
  const ids = new Set();
  const records = rows.map(normalizedRecord).sort((left, right) => left.id.localeCompare(right.id, 'en'));
  for (const product of records) {
    if (!PRODUCT_ID_PATTERN.test(product.id)) throw new Error('Catalog có product ID không hợp lệ; dừng để giữ output cũ.');
    if (ids.has(product.id)) throw new Error('Catalog có product ID trùng; dừng để giữ output cũ.');
    ids.add(product.id);
  }
  return records;
};
