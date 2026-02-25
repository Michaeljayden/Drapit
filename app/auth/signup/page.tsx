import { Suspense } from 'react';
import SignupForm from '@/components/dashboard/SignupForm';

export default function SignupPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                <div className="animate-pulse text-sm text-[#64748B]">Laden...</div>
            </div>
        }>
            <SignupForm />
        </Suspense>
    );
}
