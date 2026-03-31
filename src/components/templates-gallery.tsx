'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { templatesApi, TemplateInfo } from '@/lib/api';
import LatexTemplateImporter from '@/components/LatexTemplateImporter';
import { loadCustomTemplates } from '@/lib/latexTemplateParser';
import {
  ClassicTemplate, ModernTemplate, ExecutiveTemplate,
  MinimalTemplate, CreativeTemplate, ProfessionalTemplate,
  TEMPLATE_META,
} from '@/components/templates';
import { SAMPLE_RESUME } from '@/data/sampleResumeData';
import { RESUME_PAGE_WIDTH_PX } from '@/lib/resumePageSize';
import { Eye, Upload, Zap, Check, X } from 'lucide-react';

const RESUMED_ID_STORAGE_KEY = 'resumeBuilder_currentResumeId';

// ─────────────────────────────────────────────────────────────────────────────
// Live scaled template preview (renders the real component, scales it to fit)
// ─────────────────────────────────────────────────────────────────────────────
const PREVIEW_W = RESUME_PAGE_WIDTH_PX; // Letter width @ 96dpi (21.59 cm)

const TemplatePreview: React.FC<{ templateId: string }> = ({ templateId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.32);

  useEffect(() => {
    if (containerRef.current) {
      const w = containerRef.current.offsetWidth;
      setScale(w / PREVIEW_W);
    }
  }, []);

  const props = { data: SAMPLE_RESUME };
  const componentMap: Record<string, React.ReactNode> = {
    classic:      <ClassicTemplate {...props} />,
    jake:         <ClassicTemplate {...props} />,
    modern:       <ModernTemplate {...props} />,
    executive:    <ExecutiveTemplate {...props} />,
    academic:     <ExecutiveTemplate {...props} />,
    minimalist:   <MinimalTemplate {...props} />,
    creative:     <CreativeTemplate {...props} />,
    professional: <ProfessionalTemplate {...props} />,
    default:      <ProfessionalTemplate {...props} />,
  };
  const component = componentMap[templateId] ?? componentMap.default;

  const visibleH = 260; // px height of card preview area
  const innerH   = visibleH / scale;

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: visibleH, overflow: 'hidden', position: 'relative', background: '#fff' }}
    >
      <div
        style={{
          width: PREVIEW_W,
          minHeight: innerH,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        {component}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Full-screen modal preview
// ─────────────────────────────────────────────────────────────────────────────
const PreviewModal: React.FC<{
  templateId: string;
  name: string;
  builderUrl: string;
  onClose: () => void;
}> = ({ templateId, name, builderUrl, onClose }) => {
  const props = { data: SAMPLE_RESUME };
  const componentMap: Record<string, React.ReactNode> = {
    classic:      <ClassicTemplate {...props} />,
    jake:         <ClassicTemplate {...props} />,
    modern:       <ModernTemplate {...props} />,
    executive:    <ExecutiveTemplate {...props} />,
    academic:     <ExecutiveTemplate {...props} />,
    minimalist:   <MinimalTemplate {...props} />,
    creative:     <CreativeTemplate {...props} />,
    professional: <ProfessionalTemplate {...props} />,
    default:      <ProfessionalTemplate {...props} />,
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative flex flex-col"
        style={{ width: 'min(860px, 95vw)', maxHeight: '93vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5 rounded-t-xl"
          style={{ backgroundColor: '#0f172a' }}>
          <span className="text-white font-semibold text-sm">{name} — Preview</span>
          <div className="flex gap-2">
            <Link href={builderUrl}>
              <Button size="sm" style={{ backgroundColor: '#4f46e5', color: '#fff', border: 'none' }}>
                <Check className="h-3.5 w-3.5 mr-1" /> Use Template
              </Button>
            </Link>
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/10" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {/* Resume preview */}
        <div className="overflow-y-auto rounded-b-xl shadow-2xl bg-white" style={{ maxHeight: 'calc(93vh - 48px)' }}>
          {componentMap[templateId] ?? componentMap.default}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Template card
// ─────────────────────────────────────────────────────────────────────────────
const TemplateCard: React.FC<{
  id: string;
  name: string;
  description: string;
  category: string;
  accentColor: string;
  hasLatex?: boolean;
  isCustom?: boolean;
  builderUrl: string;
}> = ({ id, name, description, accentColor, hasLatex, isCustom, builderUrl }) => {
  const [hovered, setHovered] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <>
      <div
        className="group flex flex-col rounded-xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-300 bg-white"
        style={{ boxShadow: hovered ? `0 8px 32px rgba(0,0,0,0.12)` : '0 1px 6px rgba(0,0,0,0.06)' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Live preview area */}
        <div className="relative overflow-hidden" style={{ backgroundColor: '#f8fafc' }}>
          {/* Accent top bar */}
          <div style={{ height: '4px', backgroundColor: accentColor }} />

          {/* Scaled template */}
          <TemplatePreview templateId={id} />

          {/* Hover overlay */}
          <div
            className="absolute inset-0 flex items-center justify-center gap-2 transition-opacity duration-200"
            style={{ backgroundColor: 'rgba(0,0,0,0.45)', opacity: hovered ? 1 : 0, top: 4 }}
          >
            <button
              onClick={() => setPreviewOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(4px)' }}
            >
              <Eye className="h-3.5 w-3.5" /> Preview
            </button>
            <Link href={builderUrl}>
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold"
                style={{ backgroundColor: accentColor }}
              >
                <Check className="h-3.5 w-3.5" /> Use this
              </button>
            </Link>
          </div>

          {/* Badges */}
          <div className="absolute top-2 right-2 flex gap-1" style={{ top: 10 }}>
            {hasLatex && !isCustom && (
              <Badge className="text-[9px] px-1.5 py-0.5" style={{ backgroundColor: accentColor, color: '#fff', border: 'none' }}>
                LaTeX
              </Badge>
            )}
            {isCustom && (
              <Badge className="text-[9px] px-1.5 py-0.5" style={{ backgroundColor: '#7c3aed', color: '#fff', border: 'none' }}>
                Custom
              </Badge>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 flex items-center justify-between" style={{ borderTop: '1px solid #f1f5f9' }}>
          <div>
            <p className="font-semibold text-sm text-gray-900">{name}</p>
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{description}</p>
          </div>
          <Link href={builderUrl} tabIndex={-1}>
            <Button
              size="sm"
              className="text-xs h-7 px-3 ml-3 flex-shrink-0"
              style={{ backgroundColor: accentColor, color: '#fff', border: 'none' }}
            >
              Use
            </Button>
          </Link>
        </div>
      </div>

      {previewOpen && (
        <PreviewModal
          templateId={id}
          name={name}
          builderUrl={builderUrl}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
type CategoryFilter = 'all' | 'classic' | 'modern' | 'creative' | 'minimal';

export function TemplatesGallery() {
  const searchParams = useSearchParams();
  const resumeIdFromUrl = searchParams.get('resumeId') || '';
  const resumeIdFromStorage =
    typeof sessionStorage !== 'undefined'
      ? sessionStorage.getItem(RESUMED_ID_STORAGE_KEY)
      : null;
  const resumeId = resumeIdFromUrl || resumeIdFromStorage || '';

  const [templates, setTemplates] = useState<TemplateInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [customTemplates, setCustomTemplates] = useState(() => loadCustomTemplates());
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [showImporter, setShowImporter] = useState(false);

  useEffect(() => {
    templatesApi
      .getTemplates()
      .then((res) => setTemplates(res.templates || []))
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false));
  }, []);

  const handleTemplateAdded = () => setCustomTemplates(loadCustomTemplates());

  const builderUrl = (id: string) =>
    resumeId ? `/?template=${id}&resumeId=${resumeId}` : `/?template=${id}`;

  // Build display list from API templates
  const displayTemplates = templates.map((t) => {
    const meta = TEMPLATE_META[t.id];
    return {
      id: t.id,
      name: meta?.label ?? t.name,
      description: meta?.description ?? t.description ?? '',
      category: meta?.category ?? 'modern',
      accentColor: meta?.accentColor ?? '#4f46e5',
      hasLatex: t.hasLatex,
      isCustom: false,
    };
  });

  // Add custom templates
  const allTemplates = [
    ...displayTemplates,
    ...customTemplates.map((t) => ({
      id: t.id,
      name: t.name,
      description: `Custom LaTeX import · ${t.headerLayout} header`,
      category: 'classic' as const,
      accentColor: t.accentColor,
      hasLatex: true,
      isCustom: true,
    })),
  ];

  const filtered =
    filter === 'all'
      ? allTemplates
      : allTemplates.filter((t) => t.category === filter);

  const FILTERS: { key: CategoryFilter; label: string }[] = [
    { key: 'all', label: 'All Templates' },
    { key: 'classic', label: 'Classic' },
    { key: 'modern', label: 'Modern' },
    { key: 'creative', label: 'Creative' },
    { key: 'minimal', label: 'Minimal' },
  ];

  return (
    <>
      {/* ── Hero ── */}
      <div
        className="w-full py-16 px-4 text-center"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
          style={{ backgroundColor: 'rgba(79,70,229,0.25)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }}>
          <Zap className="h-3 w-3" /> {allTemplates.length} professional templates
        </div>
        <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
          Pick your perfect resume
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto text-base mb-8">
          Every template is ATS-optimised, professionally designed, and renders pixel-perfectly as a PDF.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => setShowImporter((v) => !v)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white border border-white/20 hover:bg-white/10 transition-colors"
          >
            <Upload className="h-4 w-4" />
            Import LaTeX Template
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">

        {/* ── LaTeX Importer panel ── */}
        {showImporter && (
          <div className="mb-10 max-w-xl mx-auto">
            <LatexTemplateImporter onTemplateAdded={handleTemplateAdded} />
          </div>
        )}

        {/* ── Category filter tabs ── */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
              style={
                filter === f.key
                  ? { backgroundColor: '#4f46e5', color: '#fff' }
                  : { backgroundColor: '#f1f5f9', color: '#64748b' }
              }
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* ── Template grid ── */}
        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Loading templates…</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((t) => (
                <TemplateCard
                  key={t.id}
                  {...t}
                  builderUrl={builderUrl(t.id)}
                />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                No templates in this category yet.
              </div>
            )}
          </>
        )}

        {/* ── Import CTA at bottom ── */}
        <div
          className="mt-16 rounded-2xl p-10 text-center"
          style={{ background: 'linear-gradient(135deg, #eef2ff, #f5f3ff)' }}
        >
          <Upload className="h-10 w-10 mx-auto mb-3 text-indigo-400" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Bring your own LaTeX template</h2>
          <p className="text-gray-500 max-w-md mx-auto text-sm mb-6">
            Upload any <code className="bg-white px-1.5 py-0.5 rounded text-xs border">.tex</code> resume file — or paste the code directly — and we&apos;ll generate an exact HTML/CSS replica in seconds.
          </p>
          <Button
            onClick={() => { setShowImporter(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="px-6"
            style={{ backgroundColor: '#4f46e5', color: '#fff', border: 'none' }}
          >
            Import Template
          </Button>
        </div>
      </div>
    </>
  );
}
