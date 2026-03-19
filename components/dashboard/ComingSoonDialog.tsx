'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Dialog from '@/components/ui/Dialog';

interface ComingSoonDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ComingSoonDialog({ isOpen, onClose }: ComingSoonDialogProps) {
  const router = useRouter();
  const t = useTranslations('installation.shopifyApp.comingSoon');
  const tButtons = useTranslations('buttons');

  const handleUseWidget = () => {
    onClose();
    router.push('/dashboard/widget');
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="p-8">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-amber-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-[#0F172A] text-center mb-3">
          {t('title')}
        </h2>

        {/* Description */}
        <p className="text-[#64748B] text-center mb-8">
          {t('description')}
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          {/* Primary CTA */}
          <button
            onClick={handleUseWidget}
            className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#1D6FD8] to-[#3B9AF0] text-white hover:shadow-lg transition-all duration-200"
          >
            {t('cta')}
          </button>

          {/* Secondary button */}
          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-[#64748B] hover:bg-[#F1F5F9] transition-all duration-200"
          >
            {tButtons('close')}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
