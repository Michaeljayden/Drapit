import { Suspense } from 'react';
import LoginForm from '@/components/dashboard/LoginForm';

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                <div className="animate-pulse text-sm text-[#64748B]">Laden...</div>
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
