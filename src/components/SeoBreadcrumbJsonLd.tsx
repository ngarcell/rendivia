import { getSiteOrigin } from "@/lib/site";

export type BreadcrumbItem = {
  name: string;
  href: string;
};

function toAbsoluteUrl(origin: string, href: string) {
  if (href.startsWith("http://") || href.startsWith("https://")) return href;
  if (href === "/") return `${origin}/`;
  return `${origin}${href.startsWith("/") ? href : `/${href}`}`;
}

export function SeoBreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  if (!items.length) return null;

  const origin = getSiteOrigin();
  const itemListElement = items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: toAbsoluteUrl(origin, item.href),
  }));

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
