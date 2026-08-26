import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path, { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeText } from './product-source.mjs';

export const SITE_ORIGIN = 'https://www.anhminhstore.io.vn';
export const scriptDirectory = dirname(fileURLToPath(import.meta.url));
export const repositoryRoot = resolve(scriptDirectory, '..', '..');
export const dataDirectory = join(repositoryRoot, 'data', 'seo');
export const productDirectory = join(repositoryRoot, 'san-pham');

export const urlPathSegments = (urlPath) => {
  const source = String(urlPath || '').trim();
  if (!source || source.includes('\0')) throw new Error('URL path không hợp lệ.');

  let decoded;
  try {
    decoded = decodeURIComponent(source);
  } catch {
    throw new Error('URL path có encoding không hợp lệ.');
  }
  if (decoded.includes('\\') || decoded.includes('?') || decoded.includes('#')) {
    throw new Error('URL path chứa ký tự không hợp lệ.');
  }

  const withoutLeadingSlash = decoded.replace(/^\/+/, '');
  if (/^[A-Za-z]:/.test(withoutLeadingSlash)) throw new Error('URL path không được là drive path.');
  const segments = withoutLeadingSlash.split('/').filter(Boolean);
  if (!segments.length || segments.some((segment) => segment === '.' || segment === '..')) {
    throw new Error('URL path không được chứa traversal segment.');
  }
  return segments;
};

export const urlPathToFilesystemPath = (urlPath, { root = repositoryRoot, pathApi = path } = {}) => {
  const rootPath = pathApi.resolve(root);
  const resolvedPath = pathApi.resolve(rootPath, ...urlPathSegments(urlPath));
  const relativePath = pathApi.relative(rootPath, resolvedPath);
  if (relativePath === '..' || relativePath.startsWith(`..${pathApi.sep}`) || pathApi.isAbsolute(relativePath)) {
    throw new Error('URL path nằm ngoài repository root.');
  }
  return resolvedPath;
};

export const isFilesystemPathWithin = (directory, filePath, { pathApi = path } = {}) => {
  const relativePath = pathApi.relative(pathApi.resolve(directory), pathApi.resolve(filePath));
  return Boolean(relativePath)
    && relativePath !== '..'
    && !relativePath.startsWith(`..${pathApi.sep}`)
    && !pathApi.isAbsolute(relativePath);
};

export const filesystemPathToUrlPath = (filePath, { root = repositoryRoot, pathApi = path } = {}) => {
  if (!isFilesystemPathWithin(root, filePath, { pathApi })) {
    throw new Error('Filesystem path nằm ngoài repository root.');
  }
  return `/${pathApi.relative(pathApi.resolve(root), pathApi.resolve(filePath)).split(pathApi.sep).join('/')}`;
};

export const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
export const safeJson = (data) => JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
export const stableHash = (value) => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');

export const slugify = (value = '') => normalizeText(value)
  .replace(/đ/g, 'd')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 90)
  .replace(/-+$/g, '');

export const buildSlugBase = (product) => {
  const base = [product.brand, product.model].filter(Boolean).join(' ') || product.fullName || product.id;
  return slugify(base) || `san-pham-${slugify(product.id) || 'unknown'}`;
};

export const toRelativeProductUrl = (slug) => `/san-pham/${slug}.html`;
export const toAbsoluteProductUrl = (slug) => `${SITE_ORIGIN}${toRelativeProductUrl(slug)}`;

export const buildTitle = (product) => {
  const full = `${product.fullName} - Anh Minh Store`;
  const model = String(product.model || '').trim();
  if (!model) return full.length <= 68 ? full : `${[product.brand, product.size].filter(Boolean).join(' ') || product.fullName} - Anh Minh Store`;
  if (full.includes(model) && full.length <= 68) return full;
  const concise = [product.brand, model, product.size].filter(Boolean).join(' ');
  return `${concise} - Anh Minh Store`;
};

export const buildDescription = (product) => {
  const source = String(product.description || '').replace(/\s+/g, ' ').trim();
  const fallback = [product.brand, product.model, product.size].filter(Boolean).join(' ') || product.fullName;
  const description = source || `${fallback} tại Anh Minh Store Đà Nẵng. Xem hình ảnh, thông tin sản phẩm và tư vấn lựa chọn phù hợp.`;
  return description.length > 160 ? `${description.slice(0, 157).trimEnd()}...` : description;
};

export const getBrandSlug = (brand) => slugify(brand);
export const getSizeSlug = (size) => slugify(size).replace(/-inch$/, '-inch');

export const readJson = async (path, fallback) => {
  try { return JSON.parse(await readFile(path, 'utf8')); } catch (error) { if (error?.code === 'ENOENT') return fallback; throw error; }
};

export const parseDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
};
