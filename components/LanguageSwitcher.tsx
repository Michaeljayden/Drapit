'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();

  const switchLocale = (newLocale: string) => {
    // Set cookie
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    // Refresh to apply new locale
    router.refresh();
  };

  return (
    <div className="flex gap-2 items-center">
      <button
        onClick={() => switchLocale('nl')}
        className={`text-sm font-medium px-2 py-1 rounded transition-colors ${
          locale === 'nl'
            ? 'text-[#1D6FD8] bg-[#EFF6FF]'
            : 'text-[#64748B] hover:text-[#0F172A]'
        }`}
      >
        NL
      </button>
      <span className="text-[#CBD5E1]">|</span>
      <button
        onClick={() => switchLocale('en')}
        className={`text-sm font-medium px-2 py-1 rounded transition-colors ${
          locale === 'en'
            ? 'text-[#1D6FD8] bg-[#EFF6FF]'
            : 'text-[#64748B] hover:text-[#0F172A]'
        }`}
      >
        EN
      </button>
    </div>
  );
}
