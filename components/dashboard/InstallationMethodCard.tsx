'use client';

interface InstallationMethodCardProps {
  title: string;
  description: string;
  badge: 'available' | 'coming-soon';
  badgeText: string;
  features: string[];
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  ctaText: string;
}

export default function InstallationMethodCard({
  title,
  description,
  badge,
  badgeText,
  features,
  icon,
  onClick,
  disabled = false,
  ctaText
}: InstallationMethodCardProps) {
  const badgeClasses = badge === 'available'
    ? 'bg-emerald-500/10 text-emerald-600'
    : 'bg-amber-500/10 text-amber-600';

  return (
    <div
      className={`relative bg-white rounded-2xl border-2 p-6 transition-all duration-200 ${
        disabled
          ? 'opacity-60 cursor-not-allowed border-[#E2E8F0]'
          : 'cursor-pointer border-[#E2E8F0] hover:border-[#1D6FD8] hover:shadow-lg hover:scale-[1.02]'
      }`}
      onClick={disabled ? onClick : onClick}
    >
      {/* Badge */}
      <div className="absolute top-4 right-4">
        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full ${badgeClasses}`}>
          {badgeText}
        </span>
      </div>

      {/* Icon */}
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1D6FD8] to-[#3B9AF0] flex items-center justify-center mb-4">
        {icon}
      </div>

      {/* Title & Description */}
      <h3 className="text-xl font-bold text-[#0F172A] mb-2">{title}</h3>
      <p className="text-sm text-[#64748B] mb-6">{description}</p>

      {/* Features */}
      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-[#0F172A]">
            <svg
              className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <button
        className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
          disabled
            ? 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
            : 'bg-gradient-to-r from-[#1D6FD8] to-[#3B9AF0] text-white hover:shadow-lg hover:scale-105'
        }`}
        disabled={disabled && badge === 'available'}
      >
        {ctaText}
      </button>
    </div>
  );
}
