import type { ReactNode } from "react";

import { SiteFooter } from "@/components/organisms/site-footer";
import { SiteHeader } from "@/components/organisms/site-header";

type ContentPageTemplateProps = {
  eyebrow: string;
  title: string;
  introduction: string;
  children: ReactNode;
};

export function ContentPageTemplate({
  children,
  eyebrow,
  introduction,
  title,
}: ContentPageTemplateProps) {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <SiteHeader />
      <main className="content-page" id="main-content">
        <header className="content-page__header">
          <div className="layout-shell">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="content-page__title">{title}</h1>
            <p className="content-page__introduction">{introduction}</p>
          </div>
        </header>
        <article className="layout-shell content-page__body">
          {children}
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
