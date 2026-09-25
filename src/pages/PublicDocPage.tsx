import React from 'react';
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
      <article className="animate-rise-in space-y-8">
        <header>
          <h1 className="page-title">{t(titleKey)}</h1>
          {ledeKey ? <p className="page-lede mt-2">{t(ledeKey)}</p> : null}
        </header>
        {sections.map((section) => (
          <section key={section.heading} className="space-y-2">
            <h2 className="font-display text-xl font-semibold tracking-tight">
              {t(section.heading)}
            </h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base">
              {t(section.body)}
            </p>
          </section>
        ))}
      </article>
    </SiteShell>
  );
}
