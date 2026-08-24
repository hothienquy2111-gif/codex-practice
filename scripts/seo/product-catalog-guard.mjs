const TRUE_VALUES = new Set(['1', 'true', 'yes']);
const MIN_OVERRIDE_REASON_LENGTH = 8;

export const CATALOG_CONTINUITY_LIMITS = Object.freeze({
  severeMinimumPrevious: 10,
  severeMaximumCurrentRatio: 0.5,
  materialMinimumPrevious: 20,
  materialMinimumRemoved: 10,
  materialRemovalRatio: 0.2,
  identityChurnRetentionRatio: 0.8,
  minimumOverrideReasonLength: MIN_OVERRIDE_REASON_LENGTH,
});

export class CatalogContinuityError extends Error {
  constructor(message, { code, metrics, triggeredRules = [] } = {}) {
    super(message);
    this.name = 'CatalogContinuityError';
    this.code = code;
    this.metrics = metrics;
    this.triggeredRules = triggeredRules;
  }
}

const roundedRatio = (value) => Number(value.toFixed(6));

const productIds = (products, label) => {
  const ids = (Array.isArray(products) ? products : [])
    .map((product) => String(product?.id || '').trim())
    .filter(Boolean);
  if (new Set(ids).size !== ids.length) {
    throw new CatalogContinuityError(`${label} có product ID trùng; dừng trước khi ghi output.`, {
      code: 'CATALOG_DUPLICATE_ID',
    });
  }
  return ids;
};

export const calculateCatalogContinuity = ({ previousProducts = [], currentProducts = [] } = {}) => {
  const previousIds = new Set(productIds(previousProducts, 'Previous manifest'));
  const currentIds = new Set(productIds(currentProducts, 'Current catalog'));
  const retainedCount = [...currentIds].filter((id) => previousIds.has(id)).length;
  const removedCount = [...previousIds].filter((id) => !currentIds.has(id)).length;
  const addedCount = [...currentIds].filter((id) => !previousIds.has(id)).length;
  const previousCount = previousIds.size;
  const currentCount = currentIds.size;

  return {
    previousCount,
    currentCount,
    retainedCount,
    removedCount,
    addedCount,
    retentionRatio: previousCount ? roundedRatio(retainedCount / previousCount) : 1,
    removalRatio: previousCount ? roundedRatio(removedCount / previousCount) : 0,
    countDropRatio: previousCount ? roundedRatio(Math.max(0, previousCount - currentCount) / previousCount) : 0,
  };
};

const getTriggeredRules = (metrics) => {
  const rules = [];
  if (
    metrics.previousCount >= CATALOG_CONTINUITY_LIMITS.severeMinimumPrevious
    && metrics.currentCount <= metrics.previousCount * CATALOG_CONTINUITY_LIMITS.severeMaximumCurrentRatio
  ) rules.push('severe-count-collapse');
  if (
    metrics.previousCount >= CATALOG_CONTINUITY_LIMITS.materialMinimumPrevious
    && metrics.removedCount >= CATALOG_CONTINUITY_LIMITS.materialMinimumRemoved
    && metrics.removalRatio > CATALOG_CONTINUITY_LIMITS.materialRemovalRatio
  ) rules.push('material-removal');
  if (
    metrics.previousCount >= CATALOG_CONTINUITY_LIMITS.materialMinimumPrevious
    && metrics.removedCount >= CATALOG_CONTINUITY_LIMITS.materialMinimumRemoved
    && metrics.retentionRatio < CATALOG_CONTINUITY_LIMITS.identityChurnRetentionRatio
  ) rules.push('identity-churn');
  return rules;
};

const overrideRequested = (value) => TRUE_VALUES.has(String(value || '').trim().toLowerCase());
const sanitizeReason = (value) => String(value || '')
  .replace(/[\u0000-\u001f\u007f]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .slice(0, 240);

const metricsSummary = (metrics) => [
  `previous=${metrics.previousCount}`,
  `current=${metrics.currentCount}`,
  `retained=${metrics.retainedCount}`,
  `removed=${metrics.removedCount}`,
  `added=${metrics.addedCount}`,
  `retention=${metrics.retentionRatio}`,
  `removal=${metrics.removalRatio}`,
  `countDrop=${metrics.countDropRatio}`,
].join(', ');

export const assertCatalogContinuity = ({ previousProducts = [], currentProducts = [], env = process.env } = {}) => {
  const metrics = calculateCatalogContinuity({ previousProducts, currentProducts });
  const requested = overrideRequested(env?.SEO_ALLOW_CATALOG_COLLAPSE);
  const reason = sanitizeReason(env?.SEO_CATALOG_OVERRIDE_REASON);

  if (requested && reason.length < MIN_OVERRIDE_REASON_LENGTH) {
    throw new CatalogContinuityError(
      `Catalog override cần SEO_CATALOG_OVERRIDE_REASON tối thiểu ${MIN_OVERRIDE_REASON_LENGTH} ký tự. ${metricsSummary(metrics)}`,
      { code: 'CATALOG_OVERRIDE_REASON_REQUIRED', metrics },
    );
  }
  if (metrics.currentCount === 0) {
    throw new CatalogContinuityError(
      `Current eligible catalog rỗng; override không được phép. Giữ nguyên toàn bộ output cũ. ${metricsSummary(metrics)}`,
      { code: 'CATALOG_EMPTY', metrics, triggeredRules: ['empty-current-catalog'] },
    );
  }

  const triggeredRules = getTriggeredRules(metrics);
  if (triggeredRules.length && !requested) {
    throw new CatalogContinuityError(
      `Catalog continuity guard chặn generation (${triggeredRules.join(', ')}). Giữ nguyên toàn bộ output cũ. Chỉ manual dispatch có override và lý do hợp lệ mới được tiếp tục. ${metricsSummary(metrics)}`,
      { code: 'CATALOG_CONTINUITY_BLOCKED', metrics, triggeredRules },
    );
  }

  return {
    ...metrics,
    status: triggeredRules.length ? 'override' : metrics.previousCount ? 'pass' : 'bootstrap',
    triggeredRules,
    overrideUsed: triggeredRules.length > 0 && requested,
    ...(triggeredRules.length > 0 && requested ? { overrideReason: reason } : {}),
  };
};

export const logCatalogContinuity = (continuity, logger = console) => {
  const summary = metricsSummary(continuity);
  if (continuity.overrideUsed) {
    logger.warn('='.repeat(78));
    logger.warn(`[SEO CATALOG OVERRIDE] ${summary}`);
    logger.warn(`[SEO CATALOG OVERRIDE] rules=${continuity.triggeredRules.join(', ')} reason=${continuity.overrideReason}`);
    logger.warn('='.repeat(78));
    return;
  }
  logger.log(`[SEO CATALOG CONTINUITY] ${continuity.status.toUpperCase()} ${summary}`);
};
