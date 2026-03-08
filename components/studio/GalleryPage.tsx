'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GalleryImage {
  id: string;
  name: string;
  url: string;
  collection_id: string | null;
  created_at: string;
}

interface Collection {
  id: string;
  name: string;
  image_count: number;
  created_at: string;
}

interface GalleryPageProps {
  shopId: string;
}

// ---------------------------------------------------------------------------
// GalleryPage
// ---------------------------------------------------------------------------

export default function GalleryPage({ shopId }: GalleryPageProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Editing states
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [moveImageId, setMoveImageId] = useState<string | null>(null);
  const [moveCollectionId, setMoveCollectionId] = useState<string>('');

  // Collection management
  const [newCollectionName, setNewCollectionName] = useState('');
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(null);
  const [editCollectionName, setEditCollectionName] = useState('');

  // Lightbox
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'image' | 'collection'; id: string; name: string } | null>(null);

  // Suppress unused shopId warning (used for future extensibility)
  void shopId;

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------

  const fetchCollections = useCallback(async () => {
    try {
      const res = await fetch('/api/studio/collections');
      if (res.ok) {
        const data = await res.json();
        setCollections(data.collections ?? []);
      }
    } catch { /* ignore */ }
  }, []);

  const fetchImages = useCallback(async () => {
    try {
      const params = activeFilter === 'all' ? '' : activeFilter === 'none' ? '?collection_id=none' : `?collection_id=${activeFilter}`;
      const res = await fetch(`/api/studio/gallery${params}`);
      if (res.ok) {
        const data = await res.json();
        setImages(data.images ?? []);
      }
    } catch { /* ignore */ }
  }, [activeFilter]);

  useEffect(() => {
    Promise.all([fetchCollections(), fetchImages()]).finally(() => setLoading(false));
  }, [fetchCollections, fetchImages]);

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  async function handleRenameImage(id: string) {
    if (!editName.trim()) return;
    const res = await fetch(`/api/studio/gallery/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName.trim() }),
    });
    if (res.ok) {
      setImages((prev) => prev.map((img) => img.id === id ? { ...img, name: editName.trim() } : img));
      setEditingImageId(null);
    }
  }

  async function handleMoveImage(id: string) {
    const res = await fetch(`/api/studio/gallery/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collection_id: moveCollectionId || null }),
    });
    if (res.ok) {
      await fetchImages();
      await fetchCollections();
      setMoveImageId(null);
    }
  }

  async function handleDeleteImage(id: string) {
    const res = await fetch(`/api/studio/gallery/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setImages((prev) => prev.filter((img) => img.id !== id));
      await fetchCollections();
      setDeleteConfirm(null);
    }
  }

  async function handleCreateCollection() {
    if (!newCollectionName.trim()) return;
    const res = await fetch('/api/studio/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCollectionName.trim() }),
    });
    if (res.ok) {
      await fetchCollections();
      setNewCollectionName('');
      setShowNewCollection(false);
    }
  }

  async function handleRenameCollection(id: string) {
    if (!editCollectionName.trim()) return;
    const res = await fetch(`/api/studio/collections/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editCollectionName.trim() }),
    });
    if (res.ok) {
      setCollections((prev) => prev.map((c) => c.id === id ? { ...c, name: editCollectionName.trim() } : c));
      setEditingCollectionId(null);
    }
  }

  async function handleDeleteCollection(id: string) {
    const res = await fetch(`/api/studio/collections/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await fetchCollections();
      if (activeFilter === id) setActiveFilter('all');
      await fetchImages();
      setDeleteConfirm(null);
    }
  }

  function handleDownload(image: GalleryImage) {
    const a = document.createElement('a');
    a.href = image.url;
    a.download = `${image.name}.jpg`;
    a.target = '_blank';
    a.click();
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Galerij</h1>
          <p className="text-sm text-slate-400 mt-1">Bekijk en beheer je opgeslagen Studio foto&apos;s</p>
        </div>
        <Link
          href="/dashboard/studio"
          className="bg-[#1D6FD8] hover:bg-[#1558B0] text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nieuwe foto
        </Link>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${activeFilter === 'all' ? 'bg-[#1D6FD8] text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/10'}`}
        >
          Alles ({images.length})
        </button>
        <button
          onClick={() => setActiveFilter('none')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${activeFilter === 'none' ? 'bg-[#1D6FD8] text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/10'}`}
        >
          Zonder collectie
        </button>
        {collections.map((c) => (
          <div key={c.id} className="flex items-center gap-1">
            <button
              onClick={() => setActiveFilter(c.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${activeFilter === c.id ? 'bg-[#1D6FD8] text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/10'}`}
            >
              {c.name} ({c.image_count})
            </button>
            {/* Collection actions */}
            <button
              onClick={() => { setEditingCollectionId(c.id); setEditCollectionName(c.name); }}
              className="p-1 text-slate-500 hover:text-white transition-colors"
              title="Hernoemen"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              onClick={() => setDeleteConfirm({ type: 'collection', id: c.id, name: c.name })}
              className="p-1 text-slate-500 hover:text-red-400 transition-colors"
              title="Verwijderen"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}

        {/* New collection */}
        {showNewCollection ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateCollection()}
              placeholder="Collectienaam..."
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#1D6FD8] w-40"
              autoFocus
            />
            <button onClick={handleCreateCollection} className="text-emerald-400 hover:text-emerald-300 p-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button onClick={() => { setShowNewCollection(false); setNewCollectionName(''); }} className="text-slate-500 hover:text-white p-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowNewCollection(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/5 text-[#5BA8FF] hover:bg-white/10 border border-dashed border-white/20 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Collectie
          </button>
        )}
      </div>

      {/* Collection rename inline */}
      {editingCollectionId && (
        <div className="mb-4 flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-3">
          <span className="text-xs text-slate-400 font-bold">Hernoemen:</span>
          <input
            type="text"
            value={editCollectionName}
            onChange={(e) => setEditCollectionName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRenameCollection(editingCollectionId)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#1D6FD8] flex-1"
            autoFocus
          />
          <button onClick={() => handleRenameCollection(editingCollectionId)} className="text-emerald-400 hover:text-emerald-300 text-xs font-bold">
            Opslaan
          </button>
          <button onClick={() => setEditingCollectionId(null)} className="text-slate-500 hover:text-white text-xs">
            Annuleren
          </button>
        </div>
      )}

      {/* Image grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-3 border-white/10 border-t-[#1D6FD8] rounded-full animate-spin" />
        </div>
      ) : images.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="font-semibold text-slate-500 text-sm">Nog geen opgeslagen foto&apos;s</p>
          <p className="text-xs text-slate-600 mt-1 max-w-xs">
            Genereer een foto in de Studio en klik op &quot;Opslaan&quot; om deze hier te bewaren.
          </p>
          <Link
            href="/dashboard/studio"
            className="mt-4 bg-[#1D6FD8] hover:bg-[#1558B0] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
          >
            Naar Studio
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="group bg-white/3 border border-white/8 rounded-2xl overflow-hidden hover:border-white/20 transition-all"
            >
              {/* Image */}
              <button
                onClick={() => setLightboxImage(image)}
                className="w-full aspect-square bg-slate-800 overflow-hidden cursor-pointer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </button>

              {/* Info */}
              <div className="p-3">
                {editingImageId === image.id ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRenameImage(image.id)}
                      className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#1D6FD8] flex-1 min-w-0"
                      autoFocus
                    />
                    <button onClick={() => handleRenameImage(image.id)} className="text-emerald-400 hover:text-emerald-300 shrink-0">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button onClick={() => setEditingImageId(null)} className="text-slate-500 hover:text-white shrink-0">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-white truncate">{image.name}</p>
                )}
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {new Date(image.created_at).toLocaleDateString('nl-NL', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>

                {/* Move to collection */}
                {moveImageId === image.id && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <select
                      value={moveCollectionId}
                      onChange={(e) => setMoveCollectionId(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white focus:outline-none flex-1 appearance-none"
                    >
                      <option value="" className="bg-[#0F2744]">Geen collectie</option>
                      {collections.map((c) => (
                        <option key={c.id} value={c.id} className="bg-[#0F2744]">{c.name}</option>
                      ))}
                    </select>
                    <button onClick={() => handleMoveImage(image.id)} className="text-emerald-400 hover:text-emerald-300 shrink-0">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button onClick={() => setMoveImageId(null)} className="text-slate-500 hover:text-white shrink-0">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setEditingImageId(image.id); setEditName(image.name); }}
                    className="p-1.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    title="Hernoemen"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => { setMoveImageId(image.id); setMoveCollectionId(image.collection_id ?? ''); }}
                    className="p-1.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    title="Verplaatsen"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDownload(image)}
                    className="p-1.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    title="Downloaden"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeleteConfirm({ type: 'image', id: image.id, name: image.name })}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    title="Verwijderen"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setLightboxImage(null)} />
          <div className="relative max-w-4xl max-h-[90vh] mx-4">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-10 right-0 text-white/60 hover:text-white transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightboxImage.url}
              alt={lightboxImage.name}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent rounded-b-2xl p-4">
              <p className="text-white font-bold text-sm">{lightboxImage.name}</p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleDownload(lightboxImage)}
                  className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-lg backdrop-blur-sm transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-[#0F2744] border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-lg font-bold text-white mb-2">
              {deleteConfirm.type === 'image' ? 'Afbeelding verwijderen?' : 'Collectie verwijderen?'}
            </h3>
            <p className="text-sm text-slate-400 mb-1">
              <span className="font-semibold text-white">{deleteConfirm.name}</span>
            </p>
            <p className="text-xs text-slate-500 mb-5">
              {deleteConfirm.type === 'collection'
                ? 'De afbeeldingen in deze collectie worden niet verwijderd, alleen losgekoppeld.'
                : 'Dit kan niet ongedaan gemaakt worden.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm font-bold py-2.5 rounded-xl transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={() => deleteConfirm.type === 'image' ? handleDeleteImage(deleteConfirm.id) : handleDeleteCollection(deleteConfirm.id)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-bold py-2.5 rounded-xl transition-colors"
              >
                Verwijderen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
