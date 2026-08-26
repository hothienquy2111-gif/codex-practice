import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { join, posix, win32 } from 'node:path';
import {
  dataDirectory,
  filesystemPathToUrlPath,
  isFilesystemPathWithin,
  readJson,
  repositoryRoot,
  urlPathSegments,
  urlPathToFilesystemPath,
} from './product-seo-utils.mjs';

const pathCases = [
  '/san-pham/samsung-ua43u8500f.html',
  '/san-pham/coocaa-32s3u.html',
  '/thuong-hieu/samsung.html',
  '/tivi/43-inch.html',
  '/san-pham/test.html',
  'san-pham/test.html',
];

test('URL paths split into OS-independent forward-slash segments', () => {
  for (const urlPath of pathCases) {
    const expected = urlPath.replace(/^\/+/, '').split('/');
    assert.deepEqual(urlPathSegments(urlPath), expected);
  }
});

test('Windows and POSIX path APIs resolve the same logical URL segments', () => {
  const urlPath = '/san-pham/samsung-ua43u8500f.html';
  assert.equal(
    urlPathToFilesystemPath(urlPath, { root: 'C:\\repo', pathApi: win32 }),
    'C:\\repo\\san-pham\\samsung-ua43u8500f.html',
  );
  assert.equal(
    urlPathToFilesystemPath(urlPath, { root: '/repo', pathApi: posix }),
    '/repo/san-pham/samsung-ua43u8500f.html',
  );
});

test('Windows and POSIX filesystem paths produce identical forward-slash URL paths', () => {
  assert.equal(
    filesystemPathToUrlPath('C:\\repo\\tivi\\43-inch.html', { root: 'C:\\repo', pathApi: win32 }),
    '/tivi/43-inch.html',
  );
  assert.equal(
    filesystemPathToUrlPath('/repo/tivi/43-inch.html', { root: '/repo', pathApi: posix }),
    '/tivi/43-inch.html',
  );
  assert.equal(isFilesystemPathWithin('C:\\repo\\san-pham', 'C:\\repo\\san-pham\\test.html', { pathApi: win32 }), true);
  assert.equal(isFilesystemPathWithin('/repo/san-pham', '/repo/san-pham/test.html', { pathApi: posix }), true);
  assert.equal(isFilesystemPathWithin('/repo/san-pham', '/repo/secret.html', { pathApi: posix }), false);
});

test('traversal, encoded traversal, drive paths, UNC paths and null bytes are rejected', () => {
  const unsafePaths = [
    '/san-pham/../secret.html',
    '/san-pham/%2e%2e/secret.html',
    'C:/secret.html',
    '\\\\server\\share\\secret.html',
    '/san-pham/test.html\0.txt',
  ];
  for (const urlPath of unsafePaths) assert.throws(() => urlPathToFilesystemPath(urlPath));
});

test('a true missing file remains detectable', async () => {
  const missingPath = urlPathToFilesystemPath('/san-pham/file-that-does-not-exist.html');
  await assert.rejects(access(missingPath), { code: 'ENOENT' });
});

test('all current runtime product URL paths resolve to existing files', async () => {
  const map = await readJson(join(dataDirectory, 'product-url-map.generated.json'), null);
  assert.ok(map);
  const entries = Object.values(map);
  assert.equal(entries.length, 107);
  for (const entry of entries) {
    assert.match(entry.url, /^\/san-pham\/[a-z0-9-]+\.html$/);
    assert.equal(entry.url.includes('\\'), false);
    await access(urlPathToFilesystemPath(entry.url));
  }
});

test('representative generated hub paths exist', async () => {
  const hubs = [
    '/san-pham/index.html',
    '/san-pham/trang-2.html',
    '/thuong-hieu/samsung.html',
    '/tivi/43-inch.html',
    '/tivi/tivi-moi.html',
  ];
  for (const hub of hubs) await access(urlPathToFilesystemPath(hub));
});

test('product sitemap keeps 107 canonical forward-slash URLs', async () => {
  const sitemap = await readFile(join(repositoryRoot, 'sitemap-products.xml'), 'utf8');
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  assert.equal(urls.length, 107);
  assert.equal(urls.some((url) => url.includes('\\')), false);
});
