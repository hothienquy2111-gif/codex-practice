# SEO V4 QA Evidence

## Catalog and generation

- Public catalog discovered: 107 active products.
- Eligible and generated: 107 of 107.
- Skipped: 0.
- Product sitemap URLs: 107.
- Product index pages: 5.
- Brand hubs: 8; size hubs: 9.
- Merchant feed candidates: 0. The current public catalog does not expose verified availability for every item, so no feed is emitted.

## Automated checks

The following commands passed locally after generation:

```powershell
node scripts/seo/run-product-seo.mjs
node scripts/validate-seo.mjs
```

The generator was run twice against the same catalog snapshot and produced the same output hashes. The product validator checks static page coverage, unique canonical/title/description values, exact model presence in title/H1/body/schema, valid numeric `Offer` values, no fabricated ratings, sitemap coverage, internal linking and URL map integrity.

## Raw HTML and browser QA

`/san-pham/samsung-ua43u8500f.html` returned HTTP 200 before client JavaScript with H1, exact model, Product JSON-LD, numeric VND Offer and no rating/review markup.

Playwright containment checks passed at 1366x768, 1440x900, 1600x900, 768x1024, 430x932 and 390x844: `documentElement.scrollWidth` matched the viewport width, one H1 was present, and the static payload was detected. Gallery thumbnail selection changed the primary image and maintained one selected thumbnail.

## Scope confirmation

No Supabase write, SQL, service-role credential, product-data mutation, admin change or deployment was performed during this QA. The scheduled workflow only creates or updates a Draft PR for review.

For a future inactive/removed product, the generator retains its prior static slug as a `noindex,follow` archive page, while removing it from active sitemaps and the runtime URL map. No current public product was retired in this generation.
