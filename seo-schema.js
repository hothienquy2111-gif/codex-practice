(() => {
  "use strict";

  const script = document.currentScript;
  if (!script) return;

  const SITE_ORIGIN = "https://www.anhminhstore.io.vn";
  const ORGANIZATION_ID = `${SITE_ORIGIN}/#organization`;
  const WEBSITE_ID = `${SITE_ORIGIN}/#website`;
  const path = String(script.dataset.schemaPath || "/").replace(/^\/?/, "/");
  const pageUrl = `${SITE_ORIGIN}${path}`;
  const pageType = script.dataset.schemaType || "WebPage";
  const pageName = script.dataset.schemaName || document.title;
  const description = script.dataset.schemaDescription || "";
  const breadcrumbLabel = script.dataset.breadcrumbLabel || pageName;

  const graph = [
    {
      "@type": pageType,
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: pageName,
      description,
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": ORGANIZATION_ID },
      breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
      inLanguage: "vi-VN",
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${pageUrl}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Trang chủ",
          item: `${SITE_ORIGIN}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: breadcrumbLabel,
          item: pageUrl,
        },
      ],
    },
  ];

  if (script.dataset.serviceName) {
    graph.push({
      "@type": "Service",
      "@id": `${pageUrl}#service`,
      name: script.dataset.serviceName,
      description,
      url: pageUrl,
      provider: { "@id": ORGANIZATION_ID },
      areaServed: {
        "@type": "City",
        name: "Đà Nẵng",
      },
    });
    graph[0].mainEntity = { "@id": `${pageUrl}#service` };
  }

  const jsonLd = document.createElement("script");
  jsonLd.type = "application/ld+json";
  jsonLd.dataset.seoSchema = "page";
  jsonLd.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": graph,
  });
  document.head.appendChild(jsonLd);
})();
