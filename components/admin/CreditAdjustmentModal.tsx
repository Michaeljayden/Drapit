'use client';

import { useState } from 'react';
import Dialog from '@/components/ui/Dialog';

interface ShopForModal {
    id: string;
    name: string;
    email: string;
    plan: string;
    tryons_this_month: number;
    monthly_tryon_limit: number;
    rollover_tryons: number;
    extra_tryons: number;
    studio_credits_used: number;
    studio_credits_limit: number;
    studio_extra_credits: number;
}

interface CreditAdjustmentModalProps {
    shop: ShopForModal | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (shopId: string, newExtraTryons: number, newStudioExtraCredits: number) => void;
}

export default function CreditAdjustmentModal({ shop, isOpen, onClose, onSuccess }: CreditAdjustmentModalProps) {
    const [tryonsAmount, setTryonsAmount] = useState(0);
    const [studioCreditsAmount, setStudioCreditsAmount] = useState(0);
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const resetForm = () => {
        setTryonsAmount(0);
        setStudioCreditsAmount(0);
        setReason('');
        setError(null);
        setSuccess(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async () => {
        if (!shop || (tryonsAmount === 0 && studioCreditsAmount === 0)) return;

        setSubmitting(true);
        setError(null);

        try {
            const res = await fetch('/api/admin/shops/credits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shop_id: shop.id,
                    tryons_amount: tryonsAmount,
                    studio_credits_amount: studioCreditsAmount,
                    reason: reason || undefined,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Onbekende fout');
            }

            const data = await res.json();
            setSuccess(true);
            onSuccess(shop.id, data.new_extra_tryons, data.new_studio_extra_credits);

            setTimeout(() => {
                handleClose();
            }, 1200);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (!shop) return null;

    const effectiveVtonLimit = shop.monthly_tryon_limit + (shop.rollover_tryons || 0) + (shop.extra_tryons || 0);
    const effectiveStudioLimit = (shop.studio_credits_limit || 0) + (shop.studio_extra_credits || 0);

    return (
        <Dialog isOpen={isOpen} onClose={handleClose} maxWidth="sm">
            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-[#0F172A]">Credits toekennen</h2>
                    <div className="mt-1 flex items-center gap-2">
                        <p className="text-sm text-[#64748B]">{shop.name}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            shop.plan === 'growth' ? 'bg-[#DBEAFE] text-[#1D6FD8]' :
                            shop.plan === 'trial' ? 'bg-[#F1F5F9] text-[#64748B]' :
                            'bg-[#DCFCE7] text-[#16A34A]'
                        }`}>
                            {shop.plan.charAt(0).toUpperCase() + shop.plan.slice(1)}
                        </span>
                    </div>
                    <p className="text-xs text-[#94A3B8] mt-0.5">{shop.email}</p>
                </div>

                {/* Current stats */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-[#F8FAFC] rounded-xl p-3">
                        <p className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">VTON Try-ons</p>
                        <p className="text-sm font-bold text-[#0F172A] mt-1">
                            {shop.tryons_this_month} / {effectiveVtonLimit}
                        </p>
                        <p className="text-[10px] text-[#94A3B8] mt-0.5">
                            {shop.extra_tryons || 0} extra
                        </p>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-xl p-3">
                        <p className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">Studio Credits</p>
                        <p className="text-sm font-bold text-[#0F172A] mt-1">
                            {shop.studio_credits_used || 0} / {effectiveStudioLimit}
                        </p>
                        <p className="text-[10px] text-[#94A3B8] mt-0.5">
                            {shop.studio_extra_credits || 0} extra
                        </p>
                    </div>
                </div>

                {/* Form */}
                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                            Extra try-ons toevoegen
                        </label>
                        <input
                            type="number"
                            min={0}
                            value={tryonsAmount}
                            onChange={(e) => setTryonsAmount(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D6FD8] bg-[#F8FAFC]"
                            placeholder="0"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                            Extra studio credits toevoegen
                        </label>
                        <input
                            type="number"
                            min={0}
                            value={studioCreditsAmount}
                            onChange={(e) => setStudioCreditsAmount(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D6FD8] bg-[#F8FAFC]"
                            placeholder="0"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                            Reden <span className="font-normal text-[#94A3B8]">(optioneel)</span>
                        </label>
                        <input
                            type="text"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D6FD8] bg-[#F8FAFC]"
                            placeholder="bijv. compensatie, test, etc."
                            maxLength={500}
                        />
                    </div>
                </div>

                {/* Error / Success */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
                        Credits succesvol toegekend!
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={handleClose}
                        className="flex-1 px-4 py-2.5 text-sm font-semibold text-[#64748B] bg-[#F1F5F9] rounded-xl hover:bg-[#E2E8F0] transition-colors"
                    >
                        Annuleren
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || (tryonsAmount === 0 && studioCreditsAmount === 0) || success}
                        className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-[#1D6FD8] rounded-xl hover:bg-[#1A5FC0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? 'Bezig...' : 'Credits toevoegen'}
                    </button>
                </div>
            </div>
        </Dialog>
    );
}
