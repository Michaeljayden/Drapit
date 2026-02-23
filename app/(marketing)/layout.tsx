export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[var(--drapit-gray-50)]">
            {children}
        </div>
    );
}
