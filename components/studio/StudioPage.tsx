'use client';

// =============================================================================
// Drapit Studio — Main client component
// =============================================================================

import React, { useState, useCallback, useRef, useEffect } from 'react';
import SaveImageDialog from '@/components/studio/SaveImageDialog';
import {
  STUDIO_MODELS, STUDIO_ETHNICITIES, STUDIO_BODY_TYPES, STUDIO_POSES,
  STUDIO_EXPRESSIONS, STUDIO_FRAMINGS, STUDIO_BACKGROUNDS, STUDIO_LIGHTING,
  STUDIO_TIME_OF_DAY, STUDIO_LENSES, type StudioMode, type LensType,
  type WatermarkPosition,
} from '@/lib/studio/constants';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ClothingSlot {
  front?: { file: File; preview: string };
  back?: { file: File; preview: string };
}

interface WatermarkSettings {
  enabled: boolean;
  text: string;
  logoDataUrl: string | null;
  position: WatermarkPosition;
  opacity: number;
  size: number;
}

interface CustomModel {
  id: string;
  name: string;
  image_url: string;
}

interface StudioPageProps {
  shopId: string;
  creditsUsed: number;
  creditsLimit: number;
  studioExtraCredits: number;
  hasStudio: boolean;
}

// ---------------------------------------------------------------------------
// Small UI helpers
// ---------------------------------------------------------------------------

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
      {children}
    </p>
  );
}

function AccordionSection({
  title,
  icon,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-white/8 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-3.5 text-left group"
      >
        <div className="flex items-center gap-3">
          <span className={`transition-colors ${isOpen ? 'text-[#1D6FD8]' : 'text-slate-500 group-hover:text-slate-300'}`}>{icon}</span>
          <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
            {title}
          </span>
        </div>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${isOpen ? 'bg-[#1D6FD8]/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#1D6FD8]' : 'text-slate-500'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100 pb-5' : 'max-h-0 opacity-0'}`}>
        {children}
      </div>
    </div>
  );
}

function OptionGrid<T extends { id: string; label: string; description?: string }>({
  options,
  selected,
  onSelect,
  cols = 3,
}: {
  options: readonly T[];
  selected: string;
  onSelect: (id: string) => void;
  cols?: 2 | 3 | 4;
}) {
  const gridClass = cols === 2 ? 'grid-cols-2' : cols === 4 ? 'grid-cols-4' : 'grid-cols-3';
  return (
    <div className={`grid ${gridClass} gap-2`}>
      {options.map((opt) => (
        <div key={opt.id} className="relative group/tooltip">
          <button
            onClick={() => onSelect(opt.id)}
            className={`w-full px-2 py-2 rounded-lg text-xs font-semibold text-center transition-all border ${selected === opt.id
              ? 'bg-[#1D6FD8] border-[#1D6FD8] text-white shadow-[0_0_12px_rgba(29,111,216,0.4)]'
              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
              }`}
          >
            {opt.label}
          </button>
          {opt.description && (
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-[#1a2b4b] text-white text-[10px] rounded-lg opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-all duration-200 z-[100] w-40 text-center shadow-2xl border border-white/10 leading-tight scale-95 group-hover/tooltip:scale-100 origin-bottom">
              {opt.description}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1a2b4b]" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function SliderInput({
  label,
  value,
  min,
  max,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-400">{label}</span>
        <span className="text-xs font-bold text-[#1D6FD8]">
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 rounded-full appearance-none cursor-pointer accent-[#1D6FD8] bg-white/10"
      />
    </div>
  );
}

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

// ---------------------------------------------------------------------------
// Export format presets
// ---------------------------------------------------------------------------

interface ExportFormat {
  id: string;
  label: string;
  sublabel: string;
  width: number | null;
  height: number | null;
  icon: string;
}

const EXPORT_FORMATS: ExportFormat[] = [
  { id: 'original', label: 'Origineel', sublabel: 'Ongewijzigd', width: null, height: null, icon: '✦' },
  { id: 'webshop-square', label: 'Webshop Vierkant', sublabel: '1000 × 1000 px', width: 1000, height: 1000, icon: '🛍️' },
  { id: 'webshop-portrait', label: 'Webshop Portret', sublabel: '1000 × 1333 px', width: 1000, height: 1333, icon: '🛍️' },
  { id: 'instagram-post', label: 'Instagram Post', sublabel: '1080 × 1080 px', width: 1080, height: 1080, icon: '📷' },
  { id: 'instagram-story', label: 'Instagram Story', sublabel: '1080 × 1920 px', width: 1080, height: 1920, icon: '📷' },
  { id: 'tiktok', label: 'TikTok', sublabel: '1080 × 1920 px', width: 1080, height: 1920, icon: '🎵' },
  { id: 'facebook-ad', label: 'Facebook Advertentie', sublabel: '1200 × 628 px', width: 1200, height: 628, icon: '👤' },
  { id: 'pinterest', label: 'Pinterest', sublabel: '1000 × 1500 px', width: 1000, height: 1500, icon: '📌' },
  { id: 'custom', label: 'Aangepast', sublabel: 'Eigen afmetingen', width: null, height: null, icon: '⚙️' },
];

/**
 * Resize a base64/data-URL image to the given pixel dimensions using canvas.
 * Returns a high-quality JPEG data URL.
 */
async function resizeImageForExport(
  dataUrl: string,
  width: number,
  height: number
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      // Fill with white background first (for transparent PNGs)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      // Draw image scaled to fit while maintaining aspect ratio with letterboxing
      const scale = Math.min(width / img.width, height / img.height);
      const scaledW = img.width * scale;
      const scaledH = img.height * scale;
      const offsetX = (width - scaledW) / 2;
      const offsetY = (height - scaledH) / 2;
      ctx.drawImage(img, offsetX, offsetY, scaledW, scaledH);
      resolve(canvas.toDataURL('image/jpeg', 0.95));
    };
    img.src = dataUrl;
  });
}

// ---------------------------------------------------------------------------
// Product uploader
// ---------------------------------------------------------------------------

function ClothingUploader({
  label,
  slot,
  onChange,
}: {
  label: string;
  slot: ClothingSlot;
  onChange: (updated: ClothingSlot) => void;
}) {
  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>, view: 'front' | 'back') {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    onChange({ ...slot, [view]: { file, preview } });
    e.target.value = '';
  }

  function removeView(view: 'front' | 'back') {
    const updated = { ...slot };
    delete updated[view];
    onChange(updated);
  }

  return (
    <div className="space-y-2">
      <SectionLabel>{label}</SectionLabel>
      <div className="grid grid-cols-2 gap-2">
        {(['front', 'back'] as const).map((view) => {
          const hasImage = !!slot[view];
          return (
            <div key={view}>
              {hasImage ? (
                <div className="relative group rounded-xl overflow-hidden border border-white/10 aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slot[view]!.preview}
                    alt={`${label} ${view}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => removeView(view)}
                      className="bg-red-500 text-white rounded-full p-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <span className="absolute bottom-1 left-1 text-[9px] bg-black/60 text-white px-1.5 py-0.5 rounded font-bold uppercase">
                    {view}
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => (view === 'front' ? frontRef : backRef).current?.click()}
                  className="w-full aspect-square rounded-xl border-2 border-dashed border-white/20 hover:border-[#1D6FD8]/60 hover:bg-[#1D6FD8]/5 transition-all flex flex-col items-center justify-center gap-1.5 text-slate-500 hover:text-[#1D6FD8]"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-[9px] font-bold uppercase">{view}</span>
                </button>
              )}
              <input
                ref={view === 'front' ? frontRef : backRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e, view)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Result display
// ---------------------------------------------------------------------------

function ResultDisplay({
  images,
  isLoading,
  loadingMessage,
  loadingTip,
  error,
  mode,
  exportFormat,
  customExportWidth,
  customExportHeight,
  onSave,
}: {
  images: string[];
  isLoading: boolean;
  loadingMessage: string;
  loadingTip: string;
  error: string | null;
  mode: StudioMode;
  exportFormat: ExportFormat;
  customExportWidth: number;
  customExportHeight: number;
  onSave: (imageDataUrl: string) => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (mode !== 'video-360' || images.length < 2) return;
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || mode !== 'video-360') return;
    const delta = e.clientX - startX;
    // Sensitivity threshold
    if (Math.abs(delta) > 50) {
      const direction = delta > 0 ? -1 : 1;
      setActiveIndex((prev) => (prev + direction + images.length) % images.length);
      setStartX(e.clientX);
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (mode !== 'video-360' || images.length < 2) return;
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || mode !== 'video-360') return;
    const delta = e.touches[0].clientX - startX;
    if (Math.abs(delta) > 40) {
      const direction = delta > 0 ? -1 : 1;
      setActiveIndex((prev) => (prev + direction + images.length) % images.length);
      setStartX(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => setIsDragging(false);

  /**
   * Trigger download for a single image, applying resize if needed.
   */
  const handleDownload = async (imgDataUrl: string, index?: number) => {
    let finalUrl = imgDataUrl;
    const suffix = index !== undefined ? `-${index + 1}` : '';
    const filename = `drapit-studio-${Date.now()}${suffix}.jpg`;

    if (exportFormat.id === 'original') {
      // No resize needed
    } else if (exportFormat.id === 'custom') {
      if (customExportWidth > 0 && customExportHeight > 0) {
        finalUrl = await resizeImageForExport(imgDataUrl, customExportWidth, customExportHeight);
      }
    } else if (exportFormat.width && exportFormat.height) {
      finalUrl = await resizeImageForExport(imgDataUrl, exportFormat.width, exportFormat.height);
    }

    const a = document.createElement('a');
    a.href = finalUrl;
    a.download = filename;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 min-h-[300px]">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-[#1D6FD8] animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-white/5 border-t-white/30 animate-spin" style={{ animationDirection: 'reverse' }} />
          </div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-sm font-bold text-white">{loadingMessage}</p>
          <div className="bg-[#1D6FD8]/10 border border-[#1D6FD8]/20 rounded-xl px-4 py-2.5 max-w-xs mx-auto animate-pulse">
            <p className="text-xs text-[#5BA8FF] font-medium leading-relaxed italic">
              {loadingTip}
            </p>
          </div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black pt-2">Gemini AI is aan het werk...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 min-h-[300px] p-6">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center">
          <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-red-400">Generatie mislukt</p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">{error}</p>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-8 min-h-[300px] p-8">
        <div className="text-center">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-[#1D6FD8]/10 border border-[#1D6FD8]/20 items-center justify-center mb-4">
            <svg className="w-8 h-8 text-[#1D6FD8]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="font-semibold text-slate-500 text-sm">Nog geen resultaat</p>
          <p className="text-xs text-slate-600 mt-1 max-w-[200px] leading-relaxed mx-auto">
            {mode === 'video-360' ? '360° modus genereert 4 foto\'s vanuit verschillende hoeken.' : 'Upload kleding, stel je opties in en klik op Genereren.'}
          </p>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          {[
            { step: '1', text: 'Upload kleding (voor- en achterkant)', done: false },
            { step: '2', text: 'Kies model, omgeving & stijl', done: false },
            { step: '3', text: 'Klik op Genereren', done: false },
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full border border-slate-700 bg-white/3 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-slate-600">{item.step}</span>
              </div>
              <span className="text-xs text-slate-600">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const activeImage = images[activeIndex] ?? images[0];

  return (
    <div className="flex-1 flex flex-col gap-4">
      {/* Main image */}
      <div
        className={`relative rounded-2xl overflow-hidden bg-slate-100 flex-1 min-h-[350px] group transition-all ${isDragging ? 'cursor-grabbing' : mode === 'video-360' ? 'cursor-grab' : 'cursor-default'
          }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeImage}
          alt="Studio resultaat"
          className="w-full h-full object-contain pointer-events-none select-none"
        />
        {mode === 'video-360' && (
          <>
            <div className="absolute top-3 left-3 bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide flex items-center gap-1.5 backdrop-blur-sm border border-white/10">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              {['Front', '3/4 Rechts', 'Zijkant', 'Achterkant'][activeIndex] ?? 'View'}
            </div>
            {/* 360 Instruction overlay */}
            <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-500 ${images.length > 1 ? 'opacity-100' : 'opacity-0'}`}>
              <div className="bg-black/40 backdrop-blur-md text-white rounded-full px-4 py-2 flex items-center gap-3 border border-white/10 shadow-2xl scale-90 md:scale-100 translate-y-24 group-hover:translate-y-20 transition-transform">
                <svg className="w-5 h-5 animate-bounce-horizontal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7l-4 4m0 0l4 4m-4-4h18" />
                </svg>
                <span className="text-[11px] font-bold uppercase tracking-widest">Sleep om te draaien</span>
                <svg className="w-5 h-5 animate-bounce-horizontal-reverse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 17l4-4m0 0l-4-4m4 4H2" />
                </svg>
              </div>
            </div>
          </>
        )}
        {/* Download + Save overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-end justify-end p-3 gap-2 opacity-0 group-hover:opacity-100">
          <button
            onClick={(e) => { e.stopPropagation(); onSave(activeImage); }}
            className="bg-white/90 text-[#0F2744] text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-2 shadow-xl hover:bg-blue-50 transition-colors pointer-events-auto"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            Opslaan
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDownload(activeImage); }}
            className="bg-white text-[#0F2744] text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-2 shadow-xl hover:bg-blue-50 transition-colors pointer-events-auto"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
        </div>
      </div>

      {/* Thumbnail strip (multiple images) */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${activeIndex === i ? 'border-[#1D6FD8] shadow-[0_0_8px_rgba(29,111,216,0.5)]' : 'border-white/10 hover:border-white/30'
                }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt={`Variatie ${i + 1}`} className="w-full h-full object-cover" />
              {mode === 'video-360' && (
                <span className="absolute bottom-0 left-0 right-0 text-center text-[8px] bg-black/70 text-white py-0.5 font-bold">
                  {['V', '3/4', 'Z', 'A'][i]}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onSave(activeImage)}
          className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold py-2.5 px-4 rounded-xl transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          Opslaan
        </button>
        <button
          onClick={() => handleDownload(activeImage)}
          className="flex-1 flex items-center justify-center gap-2 bg-[#1D6FD8] hover:bg-[#1558B0] text-white text-xs font-bold py-2.5 rounded-xl transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {exportFormat.id !== 'original'
            ? `Download · ${exportFormat.id === 'custom' ? `${customExportWidth}×${customExportHeight}` : exportFormat.sublabel}`
            : 'Download'
          }
        </button>
        {images.length > 1 && (
          <button
            onClick={async () => {
              for (let i = 0; i < images.length; i++) {
                await handleDownload(images[i], i);
                // small delay to avoid browser blocking multiple downloads
                await new Promise(r => setTimeout(r, 200));
              }
            }}
            className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold py-2.5 px-4 rounded-xl transition-colors"
          >
            Alle ({images.length})
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Watermark controls (applied client-side via canvas)
// ---------------------------------------------------------------------------

function WatermarkControls({
  settings,
  onChange,
}: {
  settings: WatermarkSettings;
  onChange: (s: WatermarkSettings) => void;
}) {
  const logoRef = useRef<HTMLInputElement>(null);

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange({ ...settings, logoDataUrl: ev.target?.result as string });
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  const POSITIONS: { id: WatermarkPosition; label: string }[] = [
    { id: 'top-left', label: 'L-Boven' },
    { id: 'top-center', label: 'M-Boven' },
    { id: 'top-right', label: 'R-Boven' },
    { id: 'middle-left', label: 'L-Midden' },
    { id: 'center', label: 'Midden' },
    { id: 'middle-right', label: 'R-Midden' },
    { id: 'bottom-left', label: 'L-Onder' },
    { id: 'bottom-center', label: 'M-Onder' },
    { id: 'bottom-right', label: 'R-Onder' },
  ];

  return (
    <div className="space-y-4">
      {/* Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-300">Watermark</span>
        <button
          onClick={() => onChange({ ...settings, enabled: !settings.enabled })}
          className={`relative w-10 h-5 rounded-full transition-colors ${settings.enabled ? 'bg-[#1D6FD8]' : 'bg-white/10'}`}
        >
          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${settings.enabled ? 'left-5.5 translate-x-0.5' : 'left-0.5'}`} />
        </button>
      </div>

      {settings.enabled && (
        <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
          {/* Text */}
          <div>
            <SectionLabel>Tekst</SectionLabel>
            <input
              type="text"
              value={settings.text}
              onChange={(e) => onChange({ ...settings, text: e.target.value })}
              placeholder="Merknaam of copyright..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#1D6FD8]/50"
            />
          </div>

          {/* Logo upload */}
          <div>
            <SectionLabel>Logo (optioneel)</SectionLabel>
            <div className="flex gap-2 items-center">
              {settings.logoDataUrl ? (
                <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={settings.logoDataUrl} alt="Logo" className="w-full h-full object-contain bg-white" />
                </div>
              ) : null}
              <button
                onClick={() => logoRef.current?.click()}
                className="flex-1 py-1.5 rounded-lg border border-dashed border-white/20 text-[10px] text-slate-500 hover:text-slate-300 hover:border-white/30 transition-colors"
              >
                {settings.logoDataUrl ? 'Vervangen' : 'Logo uploaden'}
              </button>
              {settings.logoDataUrl && (
                <button
                  onClick={() => onChange({ ...settings, logoDataUrl: null })}
                  className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </div>
          </div>

          {/* Position grid */}
          <div>
            <SectionLabel>Positie</SectionLabel>
            <div className="grid grid-cols-3 gap-1">
              {POSITIONS.map((pos) => (
                <button
                  key={pos.id}
                  onClick={() => onChange({ ...settings, position: pos.id })}
                  className={`py-1.5 rounded-lg text-[9px] font-bold transition-all ${settings.position === pos.id
                    ? 'bg-[#1D6FD8] text-white'
                    : 'bg-white/5 text-slate-500 hover:bg-white/10'
                    }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>

          {/* Opacity */}
          <SliderInput
            label="Doorzichtigheid"
            value={Math.round(settings.opacity * 100)}
            min={10}
            max={100}
            unit="%"
            onChange={(v) => onChange({ ...settings, opacity: v / 100 })}
          />

          {/* Size */}
          <SliderInput
            label="Grootte"
            value={settings.size}
            min={1}
            max={10}
            onChange={(v) => onChange({ ...settings, size: v })}
          />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Clothing logo position options
// ---------------------------------------------------------------------------

const LOGO_POSITIONS = [
  { id: 'left_chest', label: 'Links Borst' },
  { id: 'right_chest', label: 'Rechts Borst' },
  { id: 'center_chest', label: 'Midden' },
  { id: 'left_sleeve', label: 'Links Mouw' },
  { id: 'right_sleeve', label: 'Rechts Mouw' },
  { id: 'back_neck', label: 'Nek Label' },
  { id: 'bottom_hem', label: 'Onderzoom' },
] as const;

// ---------------------------------------------------------------------------
// Apply watermark via canvas (client-side)
// ---------------------------------------------------------------------------

async function applyWatermarkToImage(
  imageDataUrl: string,
  settings: WatermarkSettings
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      const baseFontSize = Math.max(16, Math.round((img.width / 100) * settings.size));
      ctx.globalAlpha = settings.opacity;

      // Position calculation
      const padding = baseFontSize * 1.5;
      let x = 0;
      let y = 0;

      const pos = settings.position;
      if (pos.includes('left')) x = padding;
      else if (pos.includes('right')) x = img.width - padding;
      else x = img.width / 2;

      if (pos.includes('top')) y = padding;
      else if (pos.includes('bottom')) y = img.height - padding;
      else y = img.height / 2;

      ctx.textAlign = pos.includes('left') ? 'left' : pos.includes('right') ? 'right' : 'center';
      ctx.textBaseline = pos.includes('top') ? 'top' : pos.includes('bottom') ? 'bottom' : 'middle';

      // Shadow for readability
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      // Draw logo if present
      if (settings.logoDataUrl) {
        const logoImg = new Image();
        logoImg.onload = () => {
          const logoSize = baseFontSize * 2.5;
          const logoOffset = settings.text ? logoSize + 4 : 0;
          ctx.drawImage(
            logoImg,
            pos.includes('left') ? x : pos.includes('right') ? x - logoSize : x - logoSize / 2,
            pos.includes('top') ? y : pos.includes('bottom') ? y - logoSize - logoOffset : y - logoSize / 2 - logoOffset / 2,
            logoSize,
            logoSize
          );
          if (settings.text) {
            ctx.font = `bold ${baseFontSize}px Inter, sans-serif`;
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            ctx.fillText(settings.text, x, y + (pos.includes('top') ? logoSize + 4 : -logoOffset));
          }
          resolve(canvas.toDataURL('image/jpeg', 0.92));
        };
        logoImg.src = settings.logoDataUrl;
      } else if (settings.text) {
        ctx.font = `bold ${baseFontSize}px Inter, sans-serif`;
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fillText(settings.text, x, y);
        resolve(canvas.toDataURL('image/jpeg', 0.92));
      } else {
        resolve(imageDataUrl);
      }
    };
    img.src = imageDataUrl;
  });
}

// ---------------------------------------------------------------------------
// Main StudioPage component
// ---------------------------------------------------------------------------

const LOADING_MSGS = [
  'Drapit Studio stelt de set samen...',
  'Drapit Studio kiest de beste hoek...',
  'Drapit Studio verzorgt de belichting...',
  'Drapit Studio verfijnt de AI details...',
  'Drapit Studio legt de laatste hand...',
];

const LOADING_TIPS = [
  'Wist je dat? Hoge kwaliteit foto\'s zorgen voor een scherper resultaat.',
  'Probeer eens een andere achtergrond voor een compleet nieuwe vibe.',
  'De 360° modus genereert direct een complete set voor je webshop.',
  'Voeg je eigen logo toe via "Batch & Branding" voor een professionele look.',
  'Speel met de Bokeh schuifregelaar voor een natuurlijke dieptewerking.',
];

export default function StudioPage({ shopId, creditsUsed, creditsLimit, studioExtraCredits, hasStudio }: StudioPageProps) {
  // Mode
  const [mode, setMode] = useState<StudioMode>('virtual-model');

  // Clothing
  const [topSlot, setTopSlot] = useState<ClothingSlot>({});
  const [bottomSlot, setBottomSlot] = useState<ClothingSlot>({});
  const [outerwearSlot, setOuterwearSlot] = useState<ClothingSlot>({});

  // Model settings
  const [gender, setGender] = useState('female');
  const [ethnicity, setEthnicity] = useState('caucasian');
  const [age, setAge] = useState(25);
  const [weight, setWeight] = useState(60);
  const [height, setHeight] = useState(175);
  const [bodyType, setBodyType] = useState('slim');
  const [customModelPrompt, setCustomModelPrompt] = useState('');
  const [customModels, setCustomModels] = useState<CustomModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [isUploadingModel, setIsUploadingModel] = useState(false);
  const modelUploadRef = useRef<HTMLInputElement>(null);

  // Pose & expression
  const [pose, setPose] = useState('standing-straight');
  const [expression, setExpression] = useState('natural-smile');
  const [framing, setFraming] = useState('full-body');
  const [rotation] = useState(0);

  // Environment
  const [background, setBackground] = useState('white-studio');
  const [lighting, setLighting] = useState('studio-softbox');
  const [timeOfDay, setTimeOfDay] = useState('none');
  const [propText, setPropText] = useState('');
  const [inspirationFile, setInspirationFile] = useState<File | null>(null);
  const [inspirationPreview, setInspirationPreview] = useState<string | null>(null);
  const inspirationRef = useRef<HTMLInputElement>(null);

  // Camera
  const [lens, setLens] = useState<LensType>('50mm');
  const [bokeh, setBokeh] = useState(5);

  // Extras
  const [numVariations, setNumVariations] = useState(1);
  const [clothingLogoFile, setClothingLogoFile] = useState<File | null>(null);
  const [clothingLogoPosition, setClothingLogoPosition] = useState('left_chest');
  const [watermark, setWatermark] = useState<WatermarkSettings>({
    enabled: false,
    text: '',
    logoDataUrl: null,
    position: 'bottom-right',
    opacity: 0.7,
    size: 4,
  });

  // Export format
  const [exportFormatId, setExportFormatId] = useState('original');
  const [customExportWidth, setCustomExportWidth] = useState(1080);
  const [customExportHeight, setCustomExportHeight] = useState(1080);
  const activeExportFormat = EXPORT_FORMATS.find(f => f.id === exportFormatId) ?? EXPORT_FORMATS[0];

  // UI state
  const [openSection, setOpenSection] = useState<string>('clothing');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [loadingTip, setLoadingTip] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [localCreditsUsed, setLocalCreditsUsed] = useState(creditsUsed);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [imageToSave, setImageToSave] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);

  const logoRef = useRef<HTMLInputElement>(null);

  const toggle = (s: string) => setOpenSection(openSection === s ? '' : s);

  // Fetch custom models
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await fetch('/api/studio/models');
        const data = await res.json();
        if (data.models) setCustomModels(data.models);
      } catch (err) {
        console.error('[StudioPage] Fetch models error:', err);
      }
    };
    fetchModels();
  }, []);

  const handleModelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingModel(true);
    try {
      const base64 = await toBase64(file);
      const res = await fetch('/api/studio/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: file.name, image: base64 }),
      });
      const data = await res.json();
      if (data.model) {
        setCustomModels(prev => [data.model, ...prev]);
        setSelectedModelId(data.model.id);
      }
    } catch (err) {
      console.error('[StudioPage] Model upload error:', err);
    } finally {
      setIsUploadingModel(false);
    }
  };

  const deleteModel = async (id: string) => {
    if (!confirm('Weet je zeker dat je dit model wilt verwijderen?')) return;
    try {
      await fetch(`/api/studio/models?id=${id}`, { method: 'DELETE' });
      setCustomModels(prev => prev.filter(m => m.id !== id));
      if (selectedModelId === id) setSelectedModelId(null);
    } catch (err) {
      console.error('[StudioPage] Delete model error:', err);
    }
  };

  // Credit calculation
  const COST_MAP: Record<StudioMode, number> = { 'virtual-model': 2, 'product-only': 1, 'video-360': 4 };
  const baseCost = COST_MAP[mode];
  const totalCost = mode === 'video-360' ? baseCost : baseCost * numVariations;
  const totalLimit = creditsLimit + studioExtraCredits;
  const remaining = totalLimit - localCreditsUsed;
  const canGenerate = remaining >= totalCost;

  const hasClothing =
    topSlot.front || bottomSlot.front || outerwearSlot.front;

  // Convert file to base64
  const toBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Strip data URL prefix to get raw base64
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  const handleGenerate = async () => {
    if (!hasClothing) { setError('Upload minimaal één kledingstuk.'); return; }
    if (!canGenerate) { window.location.href = '/dashboard/billing'; return; }

    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);

    let msgIdx = 0;
    setLoadingMsg(LOADING_MSGS[0]);
    setLoadingTip(LOADING_TIPS[0]);
    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % LOADING_MSGS.length;
      setLoadingMsg(LOADING_MSGS[msgIdx]);
      setLoadingTip(LOADING_TIPS[msgIdx]);
    }, 3000);

    try {
      // Build clothing images
      const clothing: Record<string, unknown> = {};

      if (topSlot.front || topSlot.back) {
        clothing.top = {
          front: topSlot.front ? await toBase64(topSlot.front.file) : undefined,
          back: topSlot.back ? await toBase64(topSlot.back.file) : undefined,
        };
      }
      if (bottomSlot.front) {
        clothing.bottom = { front: await toBase64(bottomSlot.front.file) };
      }
      if (outerwearSlot.front) {
        clothing.outerwear = { front: await toBase64(outerwearSlot.front.file) };
      }

      // Build inspiration image
      let inspirationImagePayload: string | undefined;
      if (inspirationFile) {
        inspirationImagePayload = await toBase64(inspirationFile);
      }

      // Build clothing logo
      let clothingLogoPayload: { image: string; position: string } | undefined;
      if (clothingLogoFile) {
        clothingLogoPayload = {
          image: await toBase64(clothingLogoFile),
          position: clothingLogoPosition,
        };
      }

      // Find prompts
      const ethnicityOpt = STUDIO_ETHNICITIES.find(e => e.id === ethnicity);
      const bodyTypeOpt = STUDIO_BODY_TYPES.find(b => b.id === bodyType);
      const poseOpt = STUDIO_POSES.find(p => p.id === pose);
      const expressionOpt = STUDIO_EXPRESSIONS.find(e => e.id === expression);
      const framingOpt = STUDIO_FRAMINGS.find(f => f.id === framing);
      const bgOpt = STUDIO_BACKGROUNDS.find(b => b.id === background);
      const lightingOpt = STUDIO_LIGHTING.find(l => l.id === lighting);
      const timeOpt = STUDIO_TIME_OF_DAY.find(t => t.id === timeOfDay);
      const lensOpt = STUDIO_LENSES.find(l => l.id === lens);
      const genderOpt = STUDIO_MODELS.find(m => m.id === gender);

      const payload = {
        mode,
        clothing,
        gender: genderOpt?.prompt ?? 'female model',
        ethnicityPrompt: ethnicityOpt?.prompt ?? '',
        age, weight, height,
        bodyType: bodyTypeOpt?.prompt ?? '',
        customModelPrompt,
        customModelId: selectedModelId || undefined,
        posePrompt: poseOpt?.prompt ?? '',
        expressionPrompt: expressionOpt?.prompt ?? '',
        framingPrompt: framingOpt?.prompt ?? '',
        rotationAngle: rotation,
        backgroundPrompt: bgOpt?.prompt ?? 'white studio background',
        lightingPrompt: lightingOpt?.prompt ?? 'studio lighting',
        timeOfDayPrompt: timeOpt?.prompt || undefined,
        propText: propText || undefined,
        inspirationImage: inspirationImagePayload,
        lensPrompt: lensOpt?.prompt ?? '',
        bokeh,
        clothingLogo: clothingLogoPayload,
        numVariations: mode === 'video-360' ? 1 : numVariations,
      };

      const res = await fetch('/api/studio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Generatie mislukt.');
        return;
      }

      // Apply watermark client-side if enabled
      let images: string[] = data.images ?? [];
      if (watermark.enabled && (watermark.text || watermark.logoDataUrl)) {
        images = await Promise.all(images.map((img: string) => applyWatermarkToImage(img, watermark)));
      }

      setGeneratedImages(images);
      setLocalCreditsUsed(prev => prev + (data.creditsUsed ?? totalCost));

    } catch (err) {
      console.error('[studio] Generation error:', err);
      setError('Er is een fout opgetreden. Probeer het opnieuw.');
    } finally {
      setIsLoading(false);
      clearInterval(interval);
    }
  };

  // ---------------------------------------------------------------------------
  // No hard paywall — everyone always sees the Studio.
  // When credits run out, show a soft upgrade banner inside the UI.
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // Main Studio UI
  // ---------------------------------------------------------------------------

  return (
    <div className="flex flex-col min-h-screen -m-4 md:-m-8 pt-14 md:pt-8">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-4 bg-gradient-to-b from-white to-slate-50 border-b border-slate-100 shadow-[0_1px_3px_rgba(15,39,68,0.05)]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-[#1D6FD8] to-[#1558B0] flex items-center justify-center shadow-[0_4px_10px_rgba(29,111,216,0.35)]">
            <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-slate-900 leading-tight">Drapit Studio</h1>
            <p className="text-[11px] text-slate-400 font-medium leading-tight">AI productfotografie</p>
          </div>
        </div>
        {/* Credits badge */}
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap ${remaining < 10
            ? 'bg-red-50 text-red-600 border-red-100'
            : 'bg-[#EBF3FF] text-[#1D6FD8] border-blue-100'
            }`}>
            <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            {remaining} credits
          </div>
        </div>
      </div>

      {/* Mode selector */}
      <div className="px-4 md:px-6 py-3.5 bg-slate-50/80 border-b border-slate-100">
        <div className="flex gap-2 max-w-xl">
          {[
            {
              id: 'virtual-model' as StudioMode, label: 'Virtueel Model', cost: 2,
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              )
            },
            {
              id: 'product-only' as StudioMode, label: 'Product Foto', cost: 1,
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm5.625 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              )
            },
            {
              id: 'video-360' as StudioMode, label: '360° Rotatie', cost: 4,
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.990" />
                </svg>
              )
            },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all text-xs font-semibold ${mode === m.id
                ? 'border-[#1D6FD8] bg-[#1D6FD8] text-white shadow-[0_4px_12px_rgba(29,111,216,0.3)]'
                : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600'
                }`}
            >
              <span>{m.icon}</span>
              <span className="hidden sm:block leading-tight">{m.label}</span>
              <span className={`text-[9px] font-bold uppercase tracking-wide ${mode === m.id ? 'text-white/60' : 'text-slate-300'
                }`}>
                {m.cost === 4 ? '4 credits' : `${m.cost} credit${m.cost > 1 ? 's' : ''}`}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Left panel — Controls */}
        <div className="w-full md:w-80 lg:w-96 bg-[#0B1E38] flex flex-col overflow-y-auto shrink-0 max-h-[50vh] md:max-h-none">
          <div className="flex-1 p-4 space-y-0 divide-y divide-white/10">

            {/* — CLOTHING — */}
            <AccordionSection
              title="Kleding uploaden"
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              }
              isOpen={openSection === 'clothing'}
              onToggle={() => toggle('clothing')}
            >
              <div className="space-y-5">
                <ClothingUploader label="Bovenkleding (Top)" slot={topSlot} onChange={setTopSlot} />
                <ClothingUploader label="Onderkleding (Bottom)" slot={bottomSlot} onChange={setBottomSlot} />
                <ClothingUploader label="Bovenlaag (Jas / Vest)" slot={outerwearSlot} onChange={setOuterwearSlot} />
              </div>
            </AccordionSection>

            {/* — MODEL — (only for virtual-model) */}
            {mode === 'virtual-model' && (
              <AccordionSection
                title="Model & Fysiek"
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                }
                isOpen={openSection === 'model'}
                onToggle={() => toggle('model')}
              >
                <div className="space-y-6">
                  {/* Custom Model Library */}
                  <div className="space-y-3">
                    <SectionLabel>Modellen Bibliotheek</SectionLabel>
                    <div className="grid grid-cols-3 gap-2">
                      {/* Upload Button */}
                      <button
                        onClick={() => modelUploadRef.current?.click()}
                        disabled={isUploadingModel}
                        className="aspect-square rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 hover:border-white/20 hover:bg-white/5 transition-all group"
                      >
                        {isUploadingModel ? (
                          <div className="w-5 h-5 border-2 border-slate-500 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#1D6FD8]/20 group-hover:text-[#1D6FD8] transition-colors">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                              </svg>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-300">Nieuw</span>
                          </>
                        )}
                      </button>
                      <input
                        ref={modelUploadRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleModelUpload}
                      />

                      {/* Model List */}
                      {customModels.map((m) => (
                        <div key={m.id} className="relative group aspect-square">
                          <button
                            onClick={() => setSelectedModelId(selectedModelId === m.id ? null : m.id)}
                            className={`w-full h-full rounded-xl overflow-hidden border-2 transition-all ${selectedModelId === m.id ? 'border-[#1D6FD8] ring-2 ring-[#1D6FD8]/20' : 'border-transparent hover:border-white/10'
                              }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={m.image_url} alt={m.name} className="w-full h-full object-cover" />
                          </button>
                          {/* Selected Badge */}
                          {selectedModelId === m.id && (
                            <div className="absolute top-1 right-1 bg-[#1D6FD8] text-white rounded-full p-0.5 shadow-sm">
                              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            </div>
                          )}
                          {/* Delete Button */}
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteModel(m.id); }}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:scale-110 active:scale-95"
                          >
                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-white/5 my-2" />

                  {/* Generic Model Settings (only show or emphasize if no custom model selected?) */}
                  <div className={selectedModelId ? 'opacity-40 grayscale pointer-events-none' : ''}>
                    <div>
                      <SectionLabel>Fysieke Kenmerken (Generiek)</SectionLabel>
                      <div className="space-y-4 pt-2">
                        <div>
                          <SectionLabel>Model Selectie</SectionLabel>
                          <OptionGrid options={STUDIO_MODELS} selected={gender} onSelect={setGender} cols={2} />
                        </div>

                        <div>
                          <SectionLabel>Etniciteit</SectionLabel>
                          <OptionGrid options={STUDIO_ETHNICITIES} selected={ethnicity} onSelect={setEthnicity} cols={2} />
                        </div>

                        <div>
                          <SectionLabel>Lichaamsbouw</SectionLabel>
                          <OptionGrid options={STUDIO_BODY_TYPES} selected={bodyType} onSelect={setBodyType} cols={2} />
                        </div>

                        <div className="space-y-3 bg-white/5 rounded-xl p-3">
                          <SliderInput label="Leeftijd" value={age} min={18} max={65} unit=" jr" onChange={setAge} />
                          <SliderInput label="Gewicht" value={weight} min={45} max={130} unit=" kg" onChange={setWeight} />
                          <SliderInput label="Lengte" value={height} min={155} max={200} unit=" cm" onChange={setHeight} />
                        </div>

                        <div>
                          <SectionLabel>Extra modelomschrijving (optioneel)</SectionLabel>
                          <textarea
                            value={customModelPrompt}
                            onChange={(e) => setCustomModelPrompt(e.target.value)}
                            placeholder="Bv. sproetjes, kort rood haar, tatoeage op arm..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#1D6FD8]/50 min-h-[64px] resize-none"
                          />
                        </div>

                        <div>
                          <SectionLabel>Houding (Pose)</SectionLabel>
                          <OptionGrid options={STUDIO_POSES} selected={pose} onSelect={setPose} cols={2} />
                        </div>

                        <div>
                          <SectionLabel>Gezichtsuitdrukking</SectionLabel>
                          <OptionGrid options={STUDIO_EXPRESSIONS} selected={expression} onSelect={setExpression} cols={2} />
                        </div>

                        <div>
                          <SectionLabel>Kadrering</SectionLabel>
                          <OptionGrid options={STUDIO_FRAMINGS} selected={framing} onSelect={setFraming} cols={2} />
                        </div>

                        <div>
                          <SectionLabel>Rekwisiet (optioneel)</SectionLabel>
                          <input
                            type="text"
                            value={propText}
                            onChange={(e) => setPropText(e.target.value)}
                            placeholder="Bv. koffiekopje, zonnebril, boek..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#1D6FD8]/50"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionSection>
            )}

            {/* — ENVIRONMENT — */}
            <AccordionSection
              title="Omgeving & Licht"
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              }
              isOpen={openSection === 'environment'}
              onToggle={() => toggle('environment')}
            >
              <div className="space-y-5">
                {/* Inspiration image upload */}
                <div className="space-y-2">
                  <SectionLabel>Inspiratiebeeld (optioneel)</SectionLabel>
                  <p className="text-[10px] text-slate-500 leading-relaxed mb-2">
                    Upload een referentiefoto en de AI kopieert de stijl: achtergrond, belichting, sfeer en kleurgrading.
                  </p>
                  <div className="flex gap-2 items-center">
                    {inspirationPreview && (
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={inspirationPreview} alt="Inspiratie" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <button
                      onClick={() => inspirationRef.current?.click()}
                      className="flex-1 py-2 rounded-lg border border-dashed border-white/20 text-[10px] text-slate-500 hover:border-white/30 hover:text-slate-400 transition-colors"
                    >
                      {inspirationFile ? 'Beeld vervangen' : 'Referentiefoto uploaden'}
                    </button>
                    {inspirationFile && (
                      <button
                        onClick={() => {
                          setInspirationFile(null);
                          if (inspirationPreview) URL.revokeObjectURL(inspirationPreview);
                          setInspirationPreview(null);
                        }}
                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                    <input
                      ref={inspirationRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setInspirationFile(file);
                        if (inspirationPreview) URL.revokeObjectURL(inspirationPreview);
                        setInspirationPreview(URL.createObjectURL(file));
                        e.target.value = '';
                      }}
                    />
                  </div>
                  {inspirationFile && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-[#1D6FD8]/10 rounded-xl border border-[#1D6FD8]/20">
                      <svg className="w-3 h-3 text-[#1D6FD8] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <p className="text-[10px] text-[#5BA8FF] font-semibold">
                        Stijl wordt overgenomen uit je referentiefoto
                      </p>
                    </div>
                  )}
                </div>

                {inspirationFile && <div className="h-px bg-[#1D6FD8]/20 my-1" />}

                {/* Environment presets — dimmed when inspiration is active */}
                <div className={inspirationFile ? 'opacity-40 grayscale pointer-events-none' : ''}>
                  <div>
                    <SectionLabel>Achtergrond</SectionLabel>
                    <OptionGrid options={STUDIO_BACKGROUNDS} selected={background} onSelect={setBackground} cols={2} />
                  </div>
                  <div className="mt-5">
                    <SectionLabel>Belichting</SectionLabel>
                    <OptionGrid options={STUDIO_LIGHTING} selected={lighting} onSelect={setLighting} cols={2} />
                  </div>
                  <div className="mt-5">
                    <SectionLabel>Tijdstip (optioneel)</SectionLabel>
                    <OptionGrid options={STUDIO_TIME_OF_DAY} selected={timeOfDay} onSelect={setTimeOfDay} cols={2} />
                  </div>
                </div>
              </div>
            </AccordionSection>

            {/* — CAMERA — (not for 360°) */}
            {mode !== 'video-360' && (
              <AccordionSection
                title="Camera & Optiek"
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                  </svg>
                }
                isOpen={openSection === 'camera'}
                onToggle={() => toggle('camera')}
              >
                <div className="space-y-5">
                  <div>
                    <SectionLabel>Lens (brandpuntsafstand)</SectionLabel>
                    <div className="grid grid-cols-3 gap-2">
                      {STUDIO_LENSES.map((l) => (
                        <div key={l.id} className="relative group/tooltip">
                          <button
                            onClick={() => setLens(l.id)}
                            className={`w-full flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all ${lens === l.id
                              ? 'border-[#1D6FD8] bg-[#1D6FD8]/10 text-[#1D6FD8]'
                              : 'border-white/10 text-slate-400 hover:border-white/20'
                              }`}
                          >
                            <span className="text-sm font-bold">{l.label}</span>
                            <span className="text-[9px] font-medium opacity-70">{l.description}</span>
                          </button>
                          {l.detailDescription && (
                            <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-[#1a2b4b] text-white text-[10px] rounded-lg opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-all duration-200 z-[100] w-40 text-center shadow-2xl border border-white/10 leading-tight scale-95 group-hover/tooltip:scale-100 origin-bottom">
                              {l.detailDescription}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1a2b4b]" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <SliderInput
                      label={`Diepte / Bokeh — ${bokeh <= 3 ? 'Onscherpe achtergrond' : bokeh >= 8 ? 'Scherpe achtergrond' : 'Naturlijk'}`}
                      value={bokeh}
                      min={1}
                      max={10}
                      onChange={setBokeh}
                    />
                    <div className="flex justify-between text-[9px] text-slate-600 mt-1.5">
                      <span>f/1.4</span><span>f/2.8</span><span>f/5.6</span><span>f/11</span>
                    </div>
                  </div>
                </div>
              </AccordionSection>
            )}

            {/* — EXPORT FORMAT — */}
            <AccordionSection
              title="Export Formaat"
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
              }
              isOpen={openSection === 'export'}
              onToggle={() => toggle('export')}
            >
              <div className="space-y-3">
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Kies het platform waarvoor je de afbeelding wilt opslaan. De afbeelding wordt automatisch naar de juiste resolutie geschaald bij het downloaden.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {EXPORT_FORMATS.map((fmt) => (
                    <button
                      key={fmt.id}
                      onClick={() => setExportFormatId(fmt.id)}
                      className={`flex flex-col items-start gap-0.5 px-3 py-2.5 rounded-xl border-2 text-left transition-all ${exportFormatId === fmt.id
                        ? 'border-[#1D6FD8] bg-[#1D6FD8]/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'
                        }`}
                    >
                      <span className="text-base leading-none">{fmt.icon}</span>
                      <span className={`text-[10px] font-bold leading-tight mt-1 ${exportFormatId === fmt.id ? 'text-[#5BA8FF]' : 'text-slate-300'
                        }`}>{fmt.label}</span>
                      <span className="text-[9px] text-slate-600 font-medium">{fmt.sublabel}</span>
                    </button>
                  ))}
                </div>

                {/* Custom dimensions */}
                {exportFormatId === 'custom' && (
                  <div className="space-y-2 p-3 bg-white/5 rounded-xl animate-in slide-in-from-top-2 duration-200">
                    <SectionLabel>Eigen afmetingen (pixels)</SectionLabel>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <label className="text-[9px] text-slate-500 font-bold uppercase mb-1 block">Breedte</label>
                        <input
                          type="number"
                          min={100}
                          max={8000}
                          value={customExportWidth}
                          onChange={(e) => setCustomExportWidth(Math.max(100, Number(e.target.value)))}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#1D6FD8]/50 text-center"
                        />
                      </div>
                      <span className="text-slate-600 font-bold text-sm mt-4">×</span>
                      <div className="flex-1">
                        <label className="text-[9px] text-slate-500 font-bold uppercase mb-1 block">Hoogte</label>
                        <input
                          type="number"
                          min={100}
                          max={8000}
                          value={customExportHeight}
                          onChange={(e) => setCustomExportHeight(Math.max(100, Number(e.target.value)))}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#1D6FD8]/50 text-center"
                        />
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-600 text-center">
                      Verhouding: {customExportWidth > 0 && customExportHeight > 0
                        ? (customExportWidth / customExportHeight).toFixed(2)
                        : '—'
                      } : 1
                    </p>
                  </div>
                )}

                {/* Active format badge */}
                {exportFormatId !== 'original' && exportFormatId !== 'custom' && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-[#1D6FD8]/10 rounded-xl border border-[#1D6FD8]/20">
                    <svg className="w-3 h-3 text-[#1D6FD8] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <p className="text-[10px] text-[#5BA8FF] font-semibold">
                      Opslaan als {activeExportFormat.sublabel}
                    </p>
                  </div>
                )}
              </div>
            </AccordionSection>

            {/* — EXTRAS — */}
            <AccordionSection
              title="Batch & Branding"
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                </svg>
              }
              isOpen={openSection === 'extras'}
              onToggle={() => toggle('extras')}
            >
              <div className="space-y-5">
                {/* Batch variations */}
                {mode !== 'video-360' && (
                  <div>
                    <SectionLabel>Variaties</SectionLabel>
                    <div className="flex gap-2">
                      {[1, 2, 4].map((n) => (
                        <button
                          key={n}
                          onClick={() => setNumVariations(n)}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${numVariations === n
                            ? 'bg-[#1D6FD8] border-[#1D6FD8] text-white shadow-md'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                            }`}
                        >
                          {n}×
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-600 mt-1.5">Kost {totalCost} credit{totalCost > 1 ? 's' : ''} totaal</p>
                  </div>
                )}

                {/* Clothing logo */}
                <div className="space-y-2">
                  <SectionLabel>Kledinglogo (optioneel)</SectionLabel>
                  <div className="flex gap-2 items-center">
                    {clothingLogoFile && (
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-white/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={URL.createObjectURL(clothingLogoFile)} alt="Logo" className="w-full h-full object-contain bg-white" />
                      </div>
                    )}
                    <button
                      onClick={() => logoRef.current?.click()}
                      className="flex-1 py-2 rounded-lg border border-dashed border-white/20 text-[10px] text-slate-500 hover:border-white/30 hover:text-slate-400 transition-colors"
                    >
                      {clothingLogoFile ? 'Logo vervangen' : 'Logo uploaden'}
                    </button>
                    {clothingLogoFile && (
                      <button
                        onClick={() => setClothingLogoFile(null)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                    <input
                      ref={logoRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setClothingLogoFile(e.target.files?.[0] ?? null)}
                    />
                  </div>
                  {clothingLogoFile && (
                    <div>
                      <SectionLabel>Logo positie</SectionLabel>
                      <div className="grid grid-cols-2 gap-1.5">
                        {LOGO_POSITIONS.map((pos) => (
                          <button
                            key={pos.id}
                            onClick={() => setClothingLogoPosition(pos.id)}
                            className={`py-1.5 rounded-lg text-[10px] font-semibold transition-all ${clothingLogoPosition === pos.id
                              ? 'bg-[#1D6FD8] text-white'
                              : 'bg-white/5 text-slate-400 hover:bg-white/10'
                              }`}
                          >
                            {pos.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Watermark */}
                <WatermarkControls settings={watermark} onChange={setWatermark} />
              </div>
            </AccordionSection>
          </div>

          {/* Generate button */}
          <div className="p-4 border-t border-white/8 bg-[#071426]">
            {/* Credits bar */}
            <div className="mb-3">
              <div className="flex justify-between text-[10px] mb-1.5">
                <span className="text-slate-500 font-medium">Studio credits</span>
                <span className="text-slate-400 font-semibold">{localCreditsUsed} <span className="text-slate-600">/ {totalLimit}</span></span>
              </div>
              <div className="w-full h-1.5 bg-white/8 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((localCreditsUsed / Math.max(totalLimit, 1)) * 100, 100)}%`,
                    background: remaining < 10
                      ? 'linear-gradient(90deg, #EF4444, #DC2626)'
                      : 'linear-gradient(90deg, #1D6FD8, #3B9AF0)',
                  }}
                />
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading || !hasClothing}
              className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all ${isLoading || !hasClothing
                ? 'bg-white/8 text-slate-500 cursor-not-allowed'
                : !canGenerate
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_4px_16px_rgba(245,158,11,0.4)] hover:shadow-[0_4px_24px_rgba(245,158,11,0.55)] active:scale-[0.98] transform'
                  : 'bg-gradient-to-r from-[#1D6FD8] to-[#1558B0] text-white shadow-[0_4px_16px_rgba(29,111,216,0.4)] hover:shadow-[0_4px_24px_rgba(29,111,216,0.55)] active:scale-[0.98] transform'
                }`}
            >
              {isLoading
                ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Genereren...
                  </span>
                )
                : !canGenerate
                  ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Credits op · Abonnement kiezen →
                    </span>
                  )
                  : mode === 'video-360'
                    ? `360° Genereren · ${totalCost} credits`
                    : numVariations > 1
                      ? `${numVariations}× Genereren · ${totalCost} credits`
                      : `Genereren · ${totalCost} credit${totalCost > 1 ? 's' : ''}`
              }
            </button>

            {!hasClothing && (
              <p className="text-center text-[10px] text-slate-600 mt-2">
                Upload eerst een kledingstuk ↑
              </p>
            )}
            {!canGenerate && hasClothing && (
              <p className="text-center text-[10px] text-amber-500/70 mt-2">
                Je gratis credits zijn op — klik hierboven om te upgraden
              </p>
            )}
          </div>
        </div>

        {/* Right panel — Result */}
        <div className="flex-1 bg-[#F8FAFC] flex flex-col p-4 md:p-6 overflow-y-auto min-h-[400px] md:min-h-0">
          <ResultDisplay
            images={generatedImages}
            isLoading={isLoading}
            loadingMessage={loadingMsg}
            loadingTip={loadingTip}
            error={error}
            mode={mode}
            exportFormat={activeExportFormat}
            customExportWidth={customExportWidth}
            customExportHeight={customExportHeight}
            onSave={(imgDataUrl) => {
              setImageToSave(imgDataUrl);
              setShowSaveDialog(true);
            }}
          />

          {/* Saved notice */}
          {savedNotice && (
            <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Opgeslagen in galerij
            </div>
          )}
        </div>
      </div>

      {/* Save dialog */}
      <SaveImageDialog
        open={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onSaved={() => {
          setSavedNotice(true);
          setTimeout(() => setSavedNotice(false), 3000);
        }}
        imageDataUrl={imageToSave}
      />
    </div>
  );
}
