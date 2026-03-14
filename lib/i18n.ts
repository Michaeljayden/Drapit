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

  // Deep merge function to avoid namespace collisions (e.g. 'nav')
  function deepMerge(target: any, source: any) {
    const output = Object.assign({}, target);
    if (itemIsObject(target) && itemIsObject(source)) {
      Object.keys(source).forEach(key => {
        if (itemIsObject(source[key])) {
          if (!(key in target))
            Object.assign(output, { [key]: source[key] });
          else
            output[key] = deepMerge(target[key], source[key]);
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    return output;
  }

  function itemIsObject(item: any) {
    return (item && typeof item === 'object' && !Array.isArray(item));
  }

  const messages = deepMerge(
    deepMerge(common.default, forms.default),
    marketing.default
  );

  return {
    locale,
    messages,
  };
});
