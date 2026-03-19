export default function DashboardLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header skeleton */}
            <div>
                <div className="h-8 w-48 bg-[#E2E8F0] rounded-lg" />
                <div className="h-4 w-72 bg-[#E2E8F0] rounded-lg mt-2" />
            </div>

            {/* Cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="bg-white rounded-2xl border border-[#F1F5F9] p-6 h-40"
                    />
                ))}
            </div>

            {/* Content skeleton */}
            <div className="bg-white rounded-2xl border border-[#F1F5F9] p-6 h-64" />
        </div>
    );
}
