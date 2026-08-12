# SEO V3 Implementation - 2026-08

## Scope

SEO V3 is a focused correction on top of the merged SEO V2 baseline. It does not change admin, Supabase, SQL, CNAME, workflows, DNS, or production data.

## Implemented

- `product-detail.html` no longer emits a blanket raw `noindex` for every product URL.
- A synchronous bootstrap adds `noindex,follow` only when the `id` query parameter is missing or malformed.
- Valid-format IDs remain eligible for client rendering; `product-detail.js` applies product title, description, canonical, social metadata, Product/Breadcrumb JSON-LD, and H1 after a valid record is loaded.
- Unknown, inactive/hidden, malformed, missing, and network-error states fail closed: `noindex,follow`, no canonical, and no Product JSON-LD.
- Product schema cleanup now removes every stale product-schema block before replacing or clearing metadata.
- The SEO validator now enforces the product bootstrap and runtime cleanup contract while continuing to validate all 14 public HTML pages.
- Menu links for repair service now point to the canonical `sua-tivi.html` page instead of a noindex placeholder category.
- Four above-the-fold service/local hero images are no longer lazy-loaded and use `fetchpriority="high"`.

## Indexation Decision

| State | Initial/runtime result |
|---|---|
| Valid-format ID, loading | No blanket raw `noindex`; crawler may render |
| Valid active product | `index,follow,max-image-preview:large` plus canonical/schema |
| Missing or malformed ID | Immediate `noindex,follow` |
| Unknown, inactive, or hidden product | Runtime `noindex,follow`; canonical/schema removed |
| Fetch/network error | Runtime `noindex,follow`; canonical/schema removed |

## Known Limits

- Product metadata remains client-rendered. Google may render it, but social crawlers may retain generic HTML metadata.
- GitHub Pages returns HTTP 200 for query-string product routes, including unknown IDs; runtime `noindex` does not create a true HTTP 404.
- Product prerendering and URL migration remain a separate architecture phase.
- Production currently has no `products.stock_status` column; V3 does not add or require it.
