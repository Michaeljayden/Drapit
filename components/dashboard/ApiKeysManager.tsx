'use client';

import { useState } from 'react';

interface ApiKeyItem {
    id: string;
    keyPreview: string;
    name: string;
    isActive: boolean;
    createdAt: string;
}

interface ApiKeysManagerProps {
    initialKeys: ApiKeyItem[];
    shopId: string;
}

export default function ApiKeysManager({ initialKeys, shopId }: ApiKeysManagerProps) {
    const [keys, setKeys] = useState<ApiKeyItem[]>(initialKeys);
    const [creating, setCreating] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [showNewKeyModal, setShowNewKeyModal] = useState(false);
    const [newKeyValue, setNewKeyValue] = useState<string | null>(null);
    const [newKeyCopied, setNewKeyCopied] = useState(false);
    const [revoking, setRevoking] = useState<string | null>(null);

    async function handleCreateKey() {
        if (!newKeyName.trim()) return;
        setCreating(true);

        try {
            const res = await fetch('/api/keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newKeyName, shop_id: shopId }),
            });

            if (!res.ok) throw new Error('Fout bij aanmaken');

            const data = await res.json();
            setNewKeyValue(data.key);
            setShowNewKeyModal(true);
            setKeys(prev => [{
                id: data.id,
                keyPreview: data.key.slice(0, 8) + '••••••••••••••••',
                name: newKeyName,
                isActive: true,
                createdAt: new Date().toISOString(),
            }, ...prev]);
            setNewKeyName('');
        } catch {
            alert('Er ging iets mis bij het aanmaken van de sleutel.');
        } finally {
            setCreating(false);
        }
    }

    async function handleRevoke(keyId: string) {
        if (!confirm('Weet je zeker dat je deze sleutel wilt intrekken? Dit kan niet ongedaan worden gemaakt.')) return;

        setRevoking(keyId);
        try {
            const res = await fetch(`/api/keys/${keyId}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Fout bij intrekken');

            setKeys(prev => prev.map(k => k.id === keyId ? { ...k, isActive: false } : k));
        } catch {
            alert('Er ging iets mis bij het intrekken van de sleutel.');
        } finally {
            setRevoking(null);
        }
    }

    async function handleCopyKey(text: string) {
        try {
            await navigator.clipboard.writeText(text);
            setNewKeyCopied(true);
            setTimeout(() => setNewKeyCopied(false), 2000);
        } catch {
            // fallback
        }
    }

    return (
        <>
            {/* Create new key */}
            <div className="bg-white rounded-2xl border border-[#F1F5F9] shadow-[0_1px_2px_rgba(15,39,68,0.06)] p-6">
                <h2 className="text-base font-bold text-[#0F172A] mb-4">Nieuwe sleutel aanmaken</h2>
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        placeholder="Naam (bijv. 'Productie' of 'Test')"
                        className="flex-1 border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D6FD8] focus:border-transparent placeholder:text-[#94A3B8]"
                    />
                    <button
                        onClick={handleCreateKey}
                        disabled={creating || !newKeyName.trim()}
                        className="bg-[#1D6FD8] hover:bg-[#1558B0] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors duration-150 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                        {creating ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Bezig...
                            </span>
                        ) : (
                            '+ Aanmaken'
                        )}
                    </button>
                </div>
            </div>

            {/* Active keys list */}
            <div className="bg-white rounded-2xl border border-[#F1F5F9] shadow-[0_1px_2px_rgba(15,39,68,0.06)] p-6">
                <h2 className="text-base font-bold text-[#0F172A] mb-4">Actieve sleutels</h2>

                {keys.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="w-12 h-12 bg-[#EBF3FF] rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M12.5 2.5l5 5-1.5 1.5-1-1-1.5 1.5-1-1-1.5 1.5-2.5-2.5a5 5 0 11-1.41-1.41L12.5 2.5z" stroke="#1D6FD8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="6.5" cy="13.5" r="1.5" stroke="#1D6FD8" strokeWidth="1.5" />
                            </svg>
                        </div>
                        <p className="text-sm text-[#64748B]">Nog geen API-sleutels. Maak er een aan om te beginnen.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {keys.map((key) => (
                            <div
                                key={key.id}
                                className={`flex items-center justify-between p-4 rounded-xl border transition-colors duration-150 ${key.isActive
                                    ? 'border-[#F1F5F9] bg-[#F8FAFC]'
                                    : 'border-[#FEE2E2] bg-[#FEF2F2] opacity-60'
                                    }`}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`w-2 h-2 rounded-full shrink-0 ${key.isActive ? 'bg-[#16A34A]' : 'bg-[#DC2626]'}`} />
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-[#0F172A]">{key.name}</p>
                                        <p className="text-xs text-[#64748B] font-mono truncate">
                                            {key.keyPreview}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 ml-4">
                                    <span className="text-xs text-[#94A3B8] hidden sm:block">
                                        {new Date(key.createdAt).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                    {key.isActive ? (
                                        <button
                                            onClick={() => handleRevoke(key.id)}
                                            disabled={revoking === key.id}
                                            className="text-xs font-medium text-[#DC2626] hover:bg-[#FEE2E2] px-3 py-1.5 rounded-lg transition-colors duration-150 disabled:opacity-50"
                                        >
                                            {revoking === key.id ? 'Bezig...' : 'Intrekken'}
                                        </button>
                                    ) : (
                                        <span className="text-xs text-[#DC2626] font-medium px-3 py-1.5">Ingetrokken</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Security notice */}
            <div className="bg-[#FEF3C7] border border-[#FCD34D] rounded-2xl p-4 flex gap-3">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0 mt-0.5">
                    <path d="M10 2L2 18h16L10 2z" stroke="#D97706" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
                    <line x1="10" y1="8" x2="10" y2="12" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="10" cy="15" r="0.5" fill="#D97706" stroke="#D97706" strokeWidth="1" />
                </svg>
                <div>
                    <p className="text-sm font-medium text-[#92400E]">Beveiligingsadvies</p>
                    <p className="text-xs text-[#A16207] mt-0.5">
                        API-sleutels worden gehasht opgeslagen. Bewaar je sleutel op een veilige plek —
                        na het sluiten van dit venster kun je de volledige sleutel niet meer inzien.
                    </p>
                </div>
            </div>

            {/* New key modal */}
            {showNewKeyModal && newKeyValue && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-[#DCFCE7] rounded-full flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M5 10l4 4 6-6" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#0F172A]">Sleutel aangemaakt!</h3>
                                <p className="text-xs text-[#64748B]">Kopieer en bewaar deze sleutel veilig</p>
                            </div>
                        </div>

                        <div className="bg-[#0F172A] rounded-xl p-4 mb-4 relative">
                            <code className="text-xs text-[#E2E8F0] font-mono break-all">{newKeyValue}</code>
                            <button
                                onClick={() => handleCopyKey(newKeyValue)}
                                className="absolute top-2 right-2 text-white/50 hover:text-white text-xs px-2 py-1 rounded transition-colors"
                            >
                                {newKeyCopied ? '✓ Gekopieerd' : 'Kopiëren'}
                            </button>
                        </div>

                        <p className="text-xs text-[#DC2626] bg-[#FEE2E2] px-3 py-2 rounded-xl mb-4 font-medium">
                            ⚠️ Dit is de enige keer dat je de volledige sleutel kunt zien.
                        </p>

                        <button
                            onClick={() => { setShowNewKeyModal(false); setNewKeyValue(null); }}
                            className="w-full bg-[#1D6FD8] hover:bg-[#1558B0] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors duration-200 shadow-sm"
                        >
                            Sluiten
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
