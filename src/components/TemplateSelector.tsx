import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle2, ExternalLink } from 'lucide-react';
import { templatesApi } from '@/lib/api';
import { loadCustomTemplates } from '@/lib/latexTemplateParser';
import {
  ClassicTemplate, ModernTemplate, ExecutiveTemplate,
  MinimalTemplate, CreativeTemplate, ProfessionalTemplate,
  ATSPlusTemplate, CompactSidebarTemplate, NeoMinimalTemplate, ResearchBlueTemplate,
  ArrowClassicTemplate,
  TwoColumnCVTemplate,
  DeveloperProTemplate,
  TEMPLATE_META,
} from './templates';
import { SAMPLE_RESUME } from '@/data/sampleResumeData';
import { RESUME_PAGE_WIDTH_PX } from '@/lib/resumePageSize';

interface TemplateSelectorProps {
  selectedTemplate: string;
  onSelectTemplate: (template: string) => void;
  currentResumeId?: string;
}

const PREVIEW_W = RESUME_PAGE_WIDTH_PX;

// Scaled mini resume preview for each template
const MiniPreview: React.FC<{ templateId: string }> = ({ templateId }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.18);

  useEffect(() => {
    if (ref.current) setScale(ref.current.offsetWidth / PREVIEW_W);
  }, []);

  const props = { data: SAMPLE_RESUME };
  const map: Record<string, React.ReactNode> = {
    classic:      <ClassicTemplate {...props} />,
    jake:         <ClassicTemplate {...props} />,
    modern:       <ModernTemplate {...props} />,
    executive:    <ExecutiveTemplate {...props} />,
    academic:     <ExecutiveTemplate {...props} />,
    minimalist:   <MinimalTemplate {...props} />,
    creative:     <CreativeTemplate {...props} />,
    professional: <ProfessionalTemplate {...props} />,
    atsplus:      <ATSPlusTemplate {...props} />,
    compact:      <CompactSidebarTemplate {...props} />,
    neominimal:   <NeoMinimalTemplate {...props} />,
    researchblue: <ResearchBlueTemplate {...props} />,
    arrowclassic: <ArrowClassicTemplate {...props} />,
    twocolumncv:  <TwoColumnCVTemplate {...props} />,
    developerpro: <DeveloperProTemplate {...props} />,
    default:      <ProfessionalTemplate {...props} />,
  };
  const component = map[templateId] ?? map.default;
  const visibleH  = 88; // px
  const innerH    = visibleH / scale;

  return (
    <div
      ref={ref}
      style={{ width: '100%', height: visibleH, overflow: 'hidden', background: '#fff', position: 'relative' }}
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

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onSelectTemplate,
  currentResumeId,
}) => {
  const [allTemplates, setAllTemplates] = useState<
    Array<{ id: string; name: string; accentColor: string; isCustom?: boolean }>
  >([]);

  const templatesPageUrl = currentResumeId
    ? `/templates?resumeId=${currentResumeId}`
    : '/templates';

  useEffect(() => {
    templatesApi
      .getTemplates()
      .then((res) => {
        const api = (res.templates || []).map((t) => ({
          id: t.id,
          name: TEMPLATE_META[t.id]?.label ?? t.name,
          accentColor: TEMPLATE_META[t.id]?.accentColor ?? '#4f46e5',
        }));
        const custom = loadCustomTemplates().map((t) => ({
          id: t.id,
          name: t.name,
          accentColor: t.accentColor,
          isCustom: true,
        }));
        const localBuiltIns = Object.entries(TEMPLATE_META)
          .filter(([id]) => id !== 'default')
          .map(([id, meta]) => ({
            id,
            name: meta.label,
            accentColor: meta.accentColor,
          }));
        const merged = new Map<string, { id: string; name: string; accentColor: string; isCustom?: boolean }>();
        [...localBuiltIns, ...api, ...custom].forEach((t) => merged.set(t.id, t));
        setAllTemplates(Array.from(merged.values()));
      })
      .catch(() => {
        const localBuiltIns = Object.entries(TEMPLATE_META)
          .filter(([id]) => id !== 'default')
          .map(([id, meta]) => ({
            id,
            name: meta.label,
            accentColor: meta.accentColor,
          }));
        setAllTemplates(localBuiltIns);
      });
  }, []);

  const displayTemplates = allTemplates.slice(0, 6);

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-sm">Choose Template</h3>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground gap-1"
            onClick={() => window.open(templatesPageUrl, '_blank')}
          >
            View all <ExternalLink className="h-3 w-3" />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {displayTemplates.map((t) => {
            const isSelected = selectedTemplate === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onSelectTemplate(t.id)}
                className="relative text-left rounded-lg overflow-hidden border-2 transition-all duration-150 hover:shadow-md focus:outline-none"
                style={{
                  borderColor: isSelected ? t.accentColor : 'transparent',
                  boxShadow: isSelected ? `0 0 0 1px ${t.accentColor}` : undefined,
                }}
              >
                {/* Accent top strip */}
                <div style={{ height: '3px', backgroundColor: t.accentColor }} />

                {/* Mini preview */}
                <div style={{ border: '1px solid #f1f5f9', borderTop: 0 }}>
                  <MiniPreview templateId={t.id} />
                </div>

                {/* Name bar */}
                <div
                  className="text-center py-1 text-[10px] font-medium"
                  style={{ backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9', color: isSelected ? t.accentColor : '#64748b' }}
                >
                  {t.name}
                </div>

                {/* Selected checkmark */}
                {isSelected && (
                  <div className="absolute top-1.5 right-1" style={{ top: 7 }}>
                    <CheckCircle2 className="h-4 w-4 drop-shadow" style={{ color: t.accentColor }} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateSelector;
