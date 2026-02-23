import { componentStyles, typography } from '@/lib/design-tokens';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description: string;
    action?: {
        label: string;
        href?: string;
        onClick?: () => void;
    };
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className={`${componentStyles.dashboardCard} flex flex-col items-center justify-center py-16 text-center`}>
            {icon && (
                <div className="mb-4 text-[var(--drapit-gray-300)]">
                    {icon}
                </div>
            )}
            <h3 className={`${typography.h3} text-[var(--drapit-gray-900)]`}>{title}</h3>
            <p className="text-sm text-[var(--drapit-gray-500)] mt-1 max-w-sm">{description}</p>
            {action && (
                <a
                    href={action.href}
                    onClick={action.onClick}
                    className={`${componentStyles.buttonPrimary} mt-4`}
                >
                    {action.label}
                </a>
            )}
        </div>
    );
}
