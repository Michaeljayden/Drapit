import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export const locales = ['nl', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'nl';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = (cookieStore.get('NEXT_LOCALE')?.value || defaultLocale) as Locale;

  // Load all translation files
  const [common, forms, marketing] = await Promise.all([
    import(`../locales/${locale}/common.json`),
    import(`../locales/${locale}/forms.json`),
    import(`../locales/${locale}/marketing.json`),
  ]);

  return {
    locale,
    messages: {
      ...common.default,
      ...forms.default,
      ...marketing.default,
    },
  };
});
