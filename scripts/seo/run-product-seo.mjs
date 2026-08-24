import { runGeneration } from './generate-product-pages.mjs';

runGeneration().catch((error) => {
  console.error(`SEO product pipeline FAIL: ${error.message}`);
  process.exitCode = 1;
});
