import React from 'react';
import { BrandWordmark } from '../components/BrandWordmark';
import { SiteShell } from '../components/SiteShell';
import { useLocale } from '../i18n/LocaleContext';
import { TranslationKey } from '../i18n/translations';

export function PublicDocPage({
  titleKey,
  ledeKey,
  sections,
}: {
  titleKey: TranslationKey;
  ledeKey?: TranslationKey;
  sections: { heading: TranslationKey; body: TranslationKey }[];
}) {
  const { t } = useLocale();

  return (
    <SiteShell>
      <article className="min-w-0 space-y-8">
        <header>
          <BrandWordmark size="md" plate className="mb-3" />
          <h1 className="page-title">{t(titleKey)}</h1>
          {ledeKey ? <p className="page-lede mt-2">{t(ledeKey)}</p> : null}
        </header>
        {sections.map((section) => (
          <section key={section.heading} className="min-w-0 space-y-2">
            <h2 className="section-title border-0 pb-0">
              {t(section.heading)}
            </h2>
            <p className="whitespace-pre-line break-words text-sm leading-relaxed text-muted-foreground sm:text-base">
              {t(section.body)}
            </p>
          </section>
        ))}
      </article>
    </SiteShell>
  );
}
