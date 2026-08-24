import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { repositoryRoot } from './product-seo-utils.mjs';

const workflowPath = join(repositoryRoot, '.github', 'workflows', 'product-seo-sync.yml');
const FULL_SHA = /^[0-9a-f]{40}$/;
const EXPECTED_ACTIONS = new Map([
  ['actions/checkout', '11d5960a326750d5838078e36cf38b85af677262'],
  ['actions/setup-node', '49933ea5288caeca8642d1e84afbd3f7d6820020'],
  ['peter-evans/create-pull-request', '22a9089034f40e5a961c8808d113e2c98fb63676'],
]);

const blockBetween = (source, start, end) => source.match(new RegExp(`^${start}:\\s*\\n([\\s\\S]*?)(?=^${end}:)`, 'm'))?.[1] || '';

export const validateProductSeoWorkflowSource = (source) => {
  const errors = [];
  const triggerBlock = blockBetween(source, 'on', 'permissions');
  const triggerNames = [...triggerBlock.matchAll(/^  ([a-z_]+):/gm)].map((match) => match[1]);
  if (triggerNames.sort().join(',') !== 'schedule,workflow_dispatch') {
    errors.push('Workflow chỉ được có schedule và workflow_dispatch triggers.');
  }
  if (!/cron:\s*['"]17 \*\/6 \* \* \*['"]/.test(triggerBlock)) errors.push('Cadence 6 giờ tại phút 17 đã bị thay đổi.');
  if (!/allow_catalog_collapse:\s*\n\s+description:.*\n\s+required:\s*false\s*\n\s+type:\s*boolean\s*\n\s+default:\s*false/m.test(triggerBlock)) {
    errors.push('Thiếu manual boolean input allow_catalog_collapse mặc định false.');
  }
  if (!/catalog_override_reason:\s*\n\s+description:.*\n\s+required:\s*false\s*\n\s+type:\s*string/m.test(triggerBlock)) {
    errors.push('Thiếu manual string input catalog_override_reason.');
  }

  const permissionBlock = blockBetween(source, 'permissions', 'concurrency');
  const permissions = [...permissionBlock.matchAll(/^  ([a-z-]+):\s*([^\s#]+)/gm)]
    .map((match) => `${match[1]}:${match[2]}`)
    .sort();
  if (permissions.join(',') !== 'contents:write,pull-requests:write') {
    errors.push('Workflow permissions phải giữ đúng contents:write và pull-requests:write.');
  }

  const actionUses = [...source.matchAll(/^\s*-?\s*uses:\s*([^@\s#]+)@([^\s#]+)/gm)]
    .map((match) => ({ action: match[1], ref: match[2] }));
  if (actionUses.length !== EXPECTED_ACTIONS.size) errors.push('Số lượng action uses trong workflow không như dự kiến.');
  for (const { action, ref } of actionUses) {
    if (!FULL_SHA.test(ref)) errors.push(`${action} chưa pin bằng full 40-character SHA.`);
    if (!EXPECTED_ACTIONS.has(action)) errors.push(`Action ngoài allowlist: ${action}.`);
    if (EXPECTED_ACTIONS.has(action) && EXPECTED_ACTIONS.get(action) !== ref) errors.push(`${action} không khớp SHA đã xác minh.`);
  }
  for (const action of EXPECTED_ACTIONS.keys()) {
    if (!actionUses.some((entry) => entry.action === action)) errors.push(`Thiếu action bắt buộc: ${action}.`);
  }

  const requiredChecks = [
    [/persist-credentials:\s*false/, 'Checkout phải tắt persist-credentials.'],
    [/token:\s*\$\{\{\s*github\.token\s*\}\}/, 'create-pull-request phải dùng explicit github.token.'],
    [/branch:\s*seo\/automated-product-sync/, 'Draft sync branch phải cố định.'],
    [/draft:\s*true/, 'Automated pull request phải luôn là Draft.'],
    [/SEO_ALLOW_CATALOG_COLLAPSE:\s*\$\{\{\s*github\.event_name == 'workflow_dispatch' && inputs\.allow_catalog_collapse && 'true' \|\| 'false'\s*\}\}/, 'Override boolean phải bị khóa theo workflow_dispatch.'],
    [/SEO_CATALOG_OVERRIDE_REASON:\s*\$\{\{\s*github\.event_name == 'workflow_dispatch' && inputs\.catalog_override_reason \|\| ''\s*\}\}/, 'Override reason phải được truyền qua env và khóa theo workflow_dispatch.'],
  ];
  requiredChecks.forEach(([pattern, message]) => { if (!pattern.test(source)) errors.push(message); });

  const forbiddenPatterns = [
    [/pull_request_target\s*:/, 'Không được dùng pull_request_target.'],
    [/\$\{\{\s*secrets\./, 'Workflow không được đọc repository secret.'],
    [/service[_-]?role/i, 'Workflow không được chứa service-role credential/path.'],
    [/SEO_ALLOW_CATALOG_COLLAPSE:\s*(?:true|1|yes)\b/i, 'Workflow không được bật override mặc định.'],
  ];
  forbiddenPatterns.forEach(([pattern, message]) => { if (pattern.test(source)) errors.push(message); });
  return errors;
};

export const validateProductSeoWorkflow = async () => validateProductSeoWorkflowSource(
  await readFile(workflowPath, 'utf8'),
);

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const errors = await validateProductSeoWorkflow();
  if (errors.length) {
    console.error(`Product SEO workflow validation FAIL (${errors.length} lỗi):\n${errors.map((error) => `- ${error}`).join('\n')}`);
    process.exitCode = 1;
  } else {
    console.log('Product SEO workflow validation PASS: triggers, permissions, action pins và override scope hợp lệ.');
  }
}
