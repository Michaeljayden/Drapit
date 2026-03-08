'use client';

import React, { useState, useEffect } from 'react';

interface Collection {
  id: string;
  name: string;
  image_count: number;
}

interface SaveImageDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  imageDataUrl: string;
}

export default function SaveImageDialog({ open, onClose, onSaved, imageDataUrl }: SaveImageDialogProps) {
  const [name, setName] = useState('');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('');
  const [newCollectionName, setNewCollectionName] = useState('');
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Set default name on open
  useEffect(() => {
    if (open) {
      const now = new Date();
      const dateStr = now.toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const timeStr = now.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
      setName(`Studio foto ${dateStr} ${timeStr}`);
      setError('');
      setShowNewCollection(false);
      setNewCollectionName('');
      fetchCollections();
    }
  }, [open]);

  async function fetchCollections() {
    try {
      const res = await fetch('/api/studio/collections');
      if (res.ok) {
        const data = await res.json();
        setCollections(data.collections ?? []);
      }
    } catch { /* ignore */ }
  }

  async function handleSave() {
    if (!name.trim()) {
      setError('Geef de afbeelding een naam.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      let collectionId = selectedCollectionId || null;

      // Create new collection if needed
      if (showNewCollection && newCollectionName.trim()) {
        const colRes = await fetch('/api/studio/collections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newCollectionName.trim() }),
        });
        if (colRes.ok) {
          const colData = await colRes.json();
          collectionId = colData.collection.id;
        } else {
          setError('Kon collectie niet aanmaken.');
          setSaving(false);
          return;
        }
      }

      // Save image
      const res = await fetch('/api/studio/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageDataUrl,
          name: name.trim(),
          collection_id: collectionId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Opslaan mislukt.');
        setSaving(false);
        return;
      }

      onSaved();
      onClose();
    } catch {
      setError('Er ging iets mis. Probeer opnieuw.');
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-[#0F2744] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Afbeelding opslaan</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Preview */}
        <div className="rounded-xl overflow-hidden bg-slate-800 mb-5 aspect-square max-h-48 mx-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageDataUrl} alt="Preview" className="w-full h-full object-contain" />
        </div>

        {/* Name field */}
        <div className="mb-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
            Naam
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Bijv. Zomer collectie — look 1"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#1D6FD8] focus:ring-1 focus:ring-[#1D6FD8]/30 transition-colors"
            autoFocus
          />
        </div>

        {/* Collection select */}
        <div className="mb-5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
            Collectie (optioneel)
          </label>

          {!showNewCollection ? (
            <div className="space-y-2">
              <select
                value={selectedCollectionId}
                onChange={(e) => setSelectedCollectionId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#1D6FD8] focus:ring-1 focus:ring-[#1D6FD8]/30 transition-colors appearance-none"
              >
                <option value="" className="bg-[#0F2744]">Geen collectie</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#0F2744]">
                    {c.name} ({c.image_count})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowNewCollection(true)}
                className="text-xs text-[#5BA8FF] hover:text-[#82C0FF] font-medium transition-colors flex items-center gap-1"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Nieuwe collectie
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="Naam van nieuwe collectie"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#1D6FD8] focus:ring-1 focus:ring-[#1D6FD8]/30 transition-colors"
              />
              <button
                type="button"
                onClick={() => { setShowNewCollection(false); setNewCollectionName(''); }}
                className="text-xs text-slate-400 hover:text-white font-medium transition-colors"
              >
                Annuleren — bestaande collectie kiezen
              </button>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs text-red-400 mb-4 font-medium">{error}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm font-bold py-2.5 rounded-xl transition-colors"
          >
            Annuleren
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-[#1D6FD8] hover:bg-[#1558B0] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Opslaan...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                Opslaan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
