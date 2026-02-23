'use client';

import { colors } from '@/lib/design-tokens';

interface DateRangePickerProps {
    value: number;
    onChange: (days: number) => void;
}

const options = [
    { label: '7 dagen', value: 7 },
    { label: '30 dagen', value: 30 },
    { label: '90 dagen', value: 90 },
];

export default function DateRangePicker({ value, onChange }: DateRangePickerProps) {
    return (
        <div
            className="inline-flex rounded-xl p-1"
            style={{ backgroundColor: colors.gray100 }}
        >
            {options.map((opt) => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                    style={{
                        backgroundColor: value === opt.value ? colors.white : 'transparent',
                        color: value === opt.value ? colors.gray900 : colors.gray500,
                        boxShadow: value === opt.value
                            ? '0 1px 3px rgba(15, 39, 68, 0.08)'
                            : 'none',
                    }}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}
