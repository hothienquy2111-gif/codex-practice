import test from 'node:test';
import assert from 'node:assert/strict';
import { assertCatalogContinuity, calculateCatalogContinuity } from './product-catalog-guard.mjs';

const products = (start, count, prefix = 'product') => Array.from(
  { length: count },
  (_, index) => ({ id: `${prefix}-${start + index}` }),
);

const guard = (previousProducts, currentProducts, env = {}) => assertCatalogContinuity({
  previousProducts,
  currentProducts,
  env,
});

test('bootstrap without a previous manifest passes', () => {
  const result = guard([], products(1, 12));
  assert.equal(result.status, 'bootstrap');
  assert.equal(result.currentCount, 12);
});

test('same 107-product catalog passes with full retention', () => {
  const catalog = products(1, 107);
  const result = guard(catalog, catalog);
  assert.deepEqual(calculateCatalogContinuity({ previousProducts: catalog, currentProducts: catalog }), {
    previousCount: 107, currentCount: 107, retainedCount: 107, removedCount: 0, addedCount: 0,
    retentionRatio: 1, removalRatio: 0, countDropRatio: 0,
  });
  assert.equal(result.status, 'pass');
});

test('107 to 106 passes', () => {
  assert.equal(guard(products(1, 107), products(1, 106)).removedCount, 1);
});

test('107 to 100 passes', () => {
  assert.equal(guard(products(1, 107), products(1, 100)).removedCount, 7);
});

test('107 to 70 is blocked as material removal and identity churn', () => {
  assert.throws(() => guard(products(1, 107), products(1, 70)), { code: 'CATALOG_CONTINUITY_BLOCKED' });
});

test('107 to 5 is blocked as severe collapse', () => {
  assert.throws(() => guard(products(1, 107), products(1, 5)), { code: 'CATALOG_CONTINUITY_BLOCKED' });
});

test('20 to 10 is blocked', () => {
  assert.throws(() => guard(products(1, 20), products(1, 10)), { code: 'CATALOG_CONTINUITY_BLOCKED' });
});

test('same count with high ID churn is blocked', () => {
  const previous = products(1, 20);
  const current = [...products(1, 5), ...products(1, 15, 'replacement')];
  assert.throws(() => guard(previous, current), { code: 'CATALOG_CONTINUITY_BLOCKED' });
});

test('107 to 110 additions pass', () => {
  const result = guard(products(1, 107), products(1, 110));
  assert.equal(result.addedCount, 3);
  assert.equal(result.countDropRatio, 0);
});

test('intentional collapse passes with explicit valid override', () => {
  const result = guard(products(1, 107), products(1, 20), {
    SEO_ALLOW_CATALOG_COLLAPSE: 'yes',
    SEO_CATALOG_OVERRIDE_REASON: 'Approved catalog retirement batch',
  });
  assert.equal(result.overrideUsed, true);
  assert.equal(result.status, 'override');
  assert.equal(result.overrideReason, 'Approved catalog retirement batch');
});

test('override with an empty reason fails', () => {
  assert.throws(() => guard(products(1, 107), products(1, 20), {
    SEO_ALLOW_CATALOG_COLLAPSE: 'true',
    SEO_CATALOG_OVERRIDE_REASON: '   ',
  }), { code: 'CATALOG_OVERRIDE_REASON_REQUIRED' });
});

test('current catalog of zero always fails, even with override', () => {
  assert.throws(() => guard(products(1, 107), [], {
    SEO_ALLOW_CATALOG_COLLAPSE: '1',
    SEO_CATALOG_OVERRIDE_REASON: 'Approved but empty catalog',
  }), { code: 'CATALOG_EMPTY' });
});

test('a blocked guard cannot reach a subsequent write stage', () => {
  let writeReached = false;
  const guardedWrite = () => {
    guard(products(1, 107), products(1, 5));
    writeReached = true;
  };
  assert.throws(guardedWrite, { code: 'CATALOG_CONTINUITY_BLOCKED' });
  assert.equal(writeReached, false);
});
