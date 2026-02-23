import { colors } from '@/lib/design-tokens';
import type { TryOnStatus } from '@/lib/supabase/types';

const config: Record<TryOnStatus, { bg: string; text: string; label: string }> = {
    pending: { bg: colors.amberLight, text: colors.amber, label: 'Pending' },
    processing: { bg: colors.blueLight, text: colors.blue, label: 'Processing' },
    succeeded: { bg: colors.greenLight, text: colors.green, label: 'Succeeded' },
    failed: { bg: colors.redLight, text: colors.red, label: 'Failed' },
};

export default function StatusBadge({ status }: { status: TryOnStatus }) {
    const { bg, text, label } = config[status];

    return (
        <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            style={{ backgroundColor: bg, color: text }}
        >
            {label}
        </span>
    );
}
