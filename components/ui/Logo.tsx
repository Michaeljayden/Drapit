import { colors } from '@/lib/design-tokens';

type LogoSize = 'sm' | 'md' | 'lg';

interface LogoProps {
    size?: LogoSize;
    className?: string;
}

const sizeMap: Record<LogoSize, { icon: number; text: string; gap: string }> = {
    sm: { icon: 14, text: 'text-base', gap: 'gap-1.5' },
    md: { icon: 16, text: 'text-lg', gap: 'gap-2' },
    lg: { icon: 20, text: 'text-xl', gap: 'gap-2.5' },
};

export default function Logo({ size = 'md', className = '' }: LogoProps) {
    const { icon, text, gap } = sizeMap[size];

    return (
        <span className={`inline-flex items-center ${gap} ${className}`}>
            {/* Clothes-hanger icon */}
            <svg
                width={icon}
                height={icon}
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
            >
                {/* Hook */}
                <path
                    d="M9.5 3.5C9.5 2.67 8.83 2 8 2S6.5 2.67 6.5 3.5"
                    stroke={colors.blue}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    fill="none"
                />
                {/* Hanger body */}
                <path
                    d="M8 5L2.5 10.5C2.18 10.77 2 11.15 2 11.56C2 12.35 2.65 13 3.44 13H12.56C13.35 13 14 12.35 14 11.56C14 11.15 13.82 10.77 13.5 10.5L8 5Z"
                    stroke={colors.blue}
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    fill="none"
                />
            </svg>

            {/* Wordmark */}
            <span
                className={`${text} font-bold leading-none`}
                style={{ color: colors.blue }}
            >
                Drapit
            </span>
        </span>
    );
}
