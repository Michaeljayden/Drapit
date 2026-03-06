'use client';

import React from 'react';
import {
    STUDIO_MODELS, STUDIO_ETHNICITIES, STUDIO_BODY_TYPES, STUDIO_POSES,
    STUDIO_EXPRESSIONS, STUDIO_FRAMINGS, STUDIO_BACKGROUNDS, STUDIO_LIGHTING,
    STUDIO_TIME_OF_DAY, STUDIO_LENSES
} from '@/lib/studio/constants';

function GuideSection({ title, children, icon }: { title: string; children: React.ReactNode; icon: React.ReactNode }) {
    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-8">
            <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#1D6FD8]">
                    {icon}
                </div>
                <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            </div>
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {children}
                </div>
            </div>
        </div>
    );
}

function GuideCard({ label, description, prompt }: { label: string; description: string; prompt?: string }) {
    return (
        <div className="p-4 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all group">
            <h3 className="text-sm font-bold text-slate-800 group-hover:text-[#1D6FD8] transition-colors">{label}</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">{description}</p>
            {prompt && (
                <div className="mt-3 pt-3 border-t border-slate-50">
                    <p className="text-[10px] text-slate-300 font-mono italic">AI: {prompt}</p>
                </div>
            )}
        </div>
    );
}

export default function GuidePage() {
    return (
        <div className="max-w-6xl mx-auto py-8 px-4 md:px-6">
            <div className="mb-10 text-center max-w-2xl mx-auto">
                <h1 className="text-3xl font-black text-slate-900 mb-4">Drapit Studio Gids</h1>
                <p className="text-slate-500 leading-relaxed">
                    Haal het maximale uit Drapit Studio. In deze gids leggen we alle beschikbare opties uit, zodat je precies weet welke instellingen je moet gebruiken voor de perfecte AI-productfoto.
                </p>
            </div>

            <GuideSection
                title="Belichting (Lighting)"
                icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                    </svg>
                }
            >
                {STUDIO_LIGHTING.map((opt) => (
                    <GuideCard key={opt.id} label={opt.label} description={opt.description} />
                ))}
            </GuideSection>

            <GuideSection
                title="Modellen & Etniciteit"
                icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                }
            >
                {STUDIO_ETHNICITIES.map((opt) => (
                    <GuideCard key={opt.id} label={opt.label} description={opt.description} />
                ))}
            </GuideSection>

            <GuideSection
                title="Houdingen (Poses)"
                icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.459-.553.673-.82.35-.438.546-1.017.546-1.633 0-1.104-.896-2-2-2s-2 .896-2 2c0 .616.196 1.195.546 1.633.214.267.452.53.673.82.215.283.401.604.401.959v.333c0 .355-.186.676-.401.959-.221.29-.459.553-.673.82-.35.438-.546 1.017-.546 1.633 0 1.104.896 2 2 2s2-.896 2-2c0-.616-.196-1.195-.546-1.633-.214-.267-.452-.53-.673-.82-.215-.283-.401-.604-.401-.959v-.333z" />
                    </svg>
                }
            >
                {STUDIO_POSES.map((opt) => (
                    <GuideCard key={opt.id} label={opt.label} description={opt.description} />
                ))}
            </GuideSection>

            <GuideSection
                title="Achtergronden"
                icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                }
            >
                {STUDIO_BACKGROUNDS.map((opt) => (
                    <GuideCard key={opt.id} label={opt.label} description={opt.description} />
                ))}
            </GuideSection>

            <GuideSection
                title="Camera & Optiek"
                icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                    </svg>
                }
            >
                {STUDIO_LENSES.map((opt) => (
                    <GuideCard key={opt.id} label={opt.label} description={opt.detailDescription} />
                ))}
            </GuideSection>

            <div className="bg-blue-600 rounded-3xl p-8 text-center text-white mb-12 shadow-xl shadow-blue-200">
                <h2 className="text-2xl font-bold mb-3">Begin Direct met Creëren</h2>
                <p className="text-blue-100 mb-6 max-w-xl mx-auto">
                    Nu je weet wat alle opties betekenen, kun je met meer precisie je ideale productfoto's genereren.
                </p>
                <a
                    href="/dashboard/studio"
                    className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-3.5 rounded-2xl font-bold hover:bg-blue-50 transition-colors shadow-lg"
                >
                    Terug naar Studio
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                </a>
            </div>
        </div>
    );
}
