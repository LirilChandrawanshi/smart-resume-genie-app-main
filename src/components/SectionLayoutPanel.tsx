'use client';
import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Plus, Minus, LayoutList } from 'lucide-react';
import { type LayoutConfig, type SectionKey, SECTION_LABELS } from '@/lib/layoutConfig';

interface Props {
  layout: LayoutConfig;
  onChange: (layout: LayoutConfig) => void;
}

const MAX_SPACING = 80;
const MIN_SPACING = -80;
const STEP = 4;

export const SectionLayoutPanel: React.FC<Props> = ({ layout, onChange }) => {
  const [open, setOpen] = useState(false);

  const moveSection = (index: number, dir: -1 | 1) => {
    const next = [...layout.sectionOrder];
    const swapIndex = index + dir;
    if (swapIndex < 0 || swapIndex >= next.length) return;
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    onChange({ ...layout, sectionOrder: next });
  };

  const adjustSpacing = (key: SectionKey, delta: number) => {
    const current = layout.sectionSpacing[key] ?? 0;
    const next = Math.min(MAX_SPACING, Math.max(MIN_SPACING, current + delta));
    onChange({
      ...layout,
      sectionSpacing: { ...layout.sectionSpacing, [key]: next },
    });
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <LayoutList className="h-4 w-4 text-indigo-500" />
          <span className="text-sm font-semibold text-slate-700">Section Layout</span>
          <span className="text-[10px] text-slate-400 font-normal">reorder · spacing</span>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        )}
      </button>

      {open && (
        <div className="border-t border-slate-100 divide-y divide-slate-50">
          {layout.sectionOrder.map((key, index) => {
            const spacing = layout.sectionSpacing[key] ?? 0;
            return (
              <div key={key} className="flex items-center gap-2 px-4 py-2.5">
                {/* Up / Down arrows */}
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveSection(index, -1)}
                    disabled={index === 0}
                    className="p-0.5 rounded hover:bg-slate-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronUp className="h-3.5 w-3.5 text-slate-500" />
                  </button>
                  <button
                    onClick={() => moveSection(index, 1)}
                    disabled={index === layout.sectionOrder.length - 1}
                    className="p-0.5 rounded hover:bg-slate-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                  </button>
                </div>

                {/* Section label */}
                <span className="flex-1 text-xs font-medium text-slate-700 truncate">
                  {SECTION_LABELS[key]}
                </span>

                {/* Spacing control */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] w-16 text-right" style={{ color: spacing < 0 ? '#f97316' : '#94a3b8' }}>
                    {spacing > 0 ? `+${spacing}px` : spacing < 0 ? `${spacing}px` : 'no gap'}
                  </span>
                  <button
                    onClick={() => adjustSpacing(key, -STEP)}
                    disabled={spacing <= MIN_SPACING}
                    className="p-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="h-3 w-3 text-slate-500" />
                  </button>
                  <button
                    onClick={() => adjustSpacing(key, STEP)}
                    disabled={spacing >= MAX_SPACING}

                    className="p-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="h-3 w-3 text-slate-500" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
