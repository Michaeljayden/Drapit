'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import InstallationMethodCard from '@/components/dashboard/InstallationMethodCard';
import ComingSoonDialog from '@/components/dashboard/ComingSoonDialog';

export default function InstallationPage() {
  const router = useRouter();
  const t = useTranslations('installation');
  const [showComingSoonDialog, setShowComingSoonDialog] = useState(false);

  const handleShopifyAppClick = () => {
    setShowComingSoonDialog(true);
  };

  const handleStandaloneWidgetClick = () => {
    router.push('/dashboard/widget');
  };

  return (
    <div className="space-y-6 max-w-[900px]">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#0F172A] mb-2">
          {t('title')}
        </h1>
        <p className="text-[#64748B]">
          {t('subtitle')}
        </p>
      </div>

      {/* Installation method cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shopify App Card */}
        <InstallationMethodCard
          title={t('shopifyApp.title')}
          description={t('shopifyApp.description')}
          badge="coming-soon"
          badgeText={t('shopifyApp.badge')}
          features={[
            t('shopifyApp.features.0'),
            t('shopifyApp.features.1'),
            t('shopifyApp.features.2'),
            t('shopifyApp.features.3')
          ]}
          icon={
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          }
          ctaText={t('shopifyApp.badge')}
          onClick={handleShopifyAppClick}
          disabled={true}
        />

        {/* Standalone Widget Card */}
        <InstallationMethodCard
          title={t('standaloneWidget.title')}
          description={t('standaloneWidget.description')}
          badge="available"
          badgeText={t('standaloneWidget.badge')}
          features={[
            t('standaloneWidget.features.0'),
            t('standaloneWidget.features.1'),
            t('standaloneWidget.features.2'),
            t('standaloneWidget.features.3')
          ]}
          icon={
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
          }
          ctaText={t('standaloneWidget.cta')}
          onClick={handleStandaloneWidgetClick}
          disabled={false}
        />
      </div>

      {/* Coming Soon Dialog */}
      <ComingSoonDialog
        isOpen={showComingSoonDialog}
        onClose={() => setShowComingSoonDialog(false)}
      />
    </div>
  );
}
