type LogoSize = 'sm' | 'md' | 'lg';

interface LogoProps {
    size?: LogoSize;
    className?: string;
}

const sizeMap: Record<LogoSize, number> = {
    sm: 80,
    md: 100,
    lg: 130,
};

export default function Logo({ size = 'md', className = '' }: LogoProps) {
    const height = sizeMap[size];

    return (
        <img
            src="/images/2.png"
            alt="Drapit"
            height={height}
            className={className}
            style={{ height, width: 'auto', objectFit: 'contain' }}
        />
    );
}
