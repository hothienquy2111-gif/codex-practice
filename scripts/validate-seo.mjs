import { access, readFile } from 'node:fs/promises';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_ORIGIN = 'https://www.anhminhstore.io.vn';
const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, '..');
const publicPages = [
  'index.html',
  '404.html',
  'chinh-sach-bao-hanh.html',
  'chinh-sach-doi-tra.html',
  'compare.html',
  'lien-he.html',
  'other-products.html',
  'product-detail.html',
  'san-pham-gia-dinh.html',
  'sua-tivi.html',
  'sua-tivi-da-nang.html',
  'thu-hu-doi-moi.html',
  'tivi-cu-da-nang.html',
  'tra-cuu-bao-hanh.html',
];
const noindexPages = new Set([
  '404.html',
  'compare.html',
  'other-products.html',
  'product-detail.html',
  'san-pham-gia-dinh.html',
  'sua-tivi-da-nang.html',
]);
const canonicalOptional = new Set(['404.html', 'product-detail.html']);
const errors = [];

const read = (path) => readFile(join(repositoryRoot, path), 'utf8');
const capture = (source, pattern) => source.match(pattern)?.[1]?.trim() || '';

for (const page of publicPages) {
  const source = await read(page);
  const title = capture(source, /<title>([\s\S]*?)<\/title>/i);
  const description = capture(source, /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  const canonical = capture(source, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  const robots = capture(source, /<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i);
  const h1Count = (source.match(/<h1\b/gi) || []).length;

  if (!/<html\s+lang=["']vi["']/i.test(source)) errors.push(`${page}: thiếu lang="vi".`);
  if (!/<meta\s+charset=["']?utf-8/i.test(source)) errors.push(`${page}: thiếu UTF-8 charset.`);
  if (!/<meta\s+name=["']viewport["']/i.test(source)) errors.push(`${page}: thiếu viewport.`);
  if (!title) errors.push(`${page}: thiếu title.`);
  if (!description) errors.push(`${page}: thiếu meta description.`);
  if (page !== 'product-detail.html' && h1Count !== 1) errors.push(`${page}: cần đúng một H1 tĩnh, hiện có ${h1Count}.`);
  if (!canonicalOptional.has(page) && !canonical.startsWith(SITE_ORIGIN)) errors.push(`${page}: canonical sai hoặc thiếu.`);
  if (canonical.includes('github.io')) errors.push(`${page}: canonical còn dùng GitHub Pages.`);
  if (noindexPages.has(page) && !robots.toLowerCase().includes('noindex')) errors.push(`${page}: thiếu noindex.`);

  const inlineJsonLd = [...source.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  inlineJsonLd.forEach((match, index) => {
    try {
      JSON.parse(match[1]);
    } catch {
      errors.push(`${page}: JSON-LD inline #${index + 1} không parse được.`);
    }
  });

  const localLinks = [...source.matchAll(/(?:href|src)=["']([^"'#?]+)(?:[?#][^"']*)?["']/gi)]
    .map((match) => match[1])
    .filter((value) => value && !/^(?:https?:|tel:|mailto:|data:|javascript:|\/)/i.test(value));
  for (const link of new Set(localLinks)) {
    if (!extname(link) && !link.endsWith('/')) continue;
    try {
      await access(join(repositoryRoot, link));
    } catch {
      errors.push(`${page}: tài nguyên nội bộ không tồn tại: ${link}`);
    }
  }
}

for (const file of ['robots.txt', 'sitemap.xml']) {
  const source = await read(file);
  if (source.includes('hothienquy2111-gif.github.io/codex-practice')) {
    errors.push(`${file}: vẫn công bố host GitHub Pages thay vì domain chính thức.`);
  }
}

if (errors.length) {
  console.error(`SEO validation FAIL (${errors.length} lỗi):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(`SEO validation PASS: ${publicPages.length} trang công khai.`);
}
