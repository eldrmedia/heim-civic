import Link from "next/link";

import { JsonLd } from "@/components/atoms/json-ld";
import { toSiteUrl } from "@/lib/site-url";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const structuredItems = items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.label,
    ...(item.href ? { item: toSiteUrl(item.href) } : {}),
  }));

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: structuredItems,
        }}
      />
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <ol className="breadcrumbs__list">
          {items.map((item, index) => {
            const current = index === items.length - 1;
            return (
              <li className="breadcrumbs__item" key={`${item.label}-${index}`}>
                {item.href && !current ? (
                  <Link href={item.href}>{item.label}</Link>
                ) : (
                  <span aria-current={current ? "page" : undefined}>
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
