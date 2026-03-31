export { ClassicTemplate }    from './ClassicTemplate';
export { ModernTemplate }     from './ModernTemplate';
export { ExecutiveTemplate }  from './ExecutiveTemplate';
export { MinimalTemplate }    from './MinimalTemplate';
export { CreativeTemplate }   from './CreativeTemplate';
export { ProfessionalTemplate } from './ProfessionalTemplate';
export { ATSPlusTemplate } from './ATSPlusTemplate';
export { CompactSidebarTemplate } from './CompactSidebarTemplate';
export { NeoMinimalTemplate } from './NeoMinimalTemplate';
export { ResearchBlueTemplate } from './ResearchBlueTemplate';
export { ArrowClassicTemplate } from './ArrowClassicTemplate';
export { TwoColumnCVTemplate } from './TwoColumnCVTemplate';
export { DeveloperProTemplate } from './DeveloperProTemplate';

export type { ResumeData } from './types';

export const TEMPLATE_META: Record<string, {
  label: string;
  description: string;
  category: 'classic' | 'modern' | 'creative' | 'minimal';
  accentColor: string;
}> = {
  classic: {
    label: 'Classic',
    description: 'Timeless black & white. Trusted by recruiters worldwide.',
    category: 'classic',
    accentColor: '#1f2937',
  },
  modern: {
    label: 'Modern',
    description: 'Dark sidebar with skill visualization. Makes you stand out.',
    category: 'modern',
    accentColor: '#1e293b',
  },
  professional: {
    label: 'Professional',
    description: 'Indigo accents, pill badges. Perfect for corporate roles.',
    category: 'modern',
    accentColor: '#4f46e5',
  },
  executive: {
    label: 'Executive',
    description: 'Bold navy header. Designed for senior leadership positions.',
    category: 'classic',
    accentColor: '#0f172a',
  },
  minimalist: {
    label: 'Minimal',
    description: 'Ultra-clean with maximum whitespace. Less is more.',
    category: 'minimal',
    accentColor: '#374151',
  },
  creative: {
    label: 'Creative',
    description: 'Timeline experience, emerald accents. For innovators.',
    category: 'creative',
    accentColor: '#059669',
  },
  atsplus: {
    label: 'ATS Plus',
    description: 'Single-column ATS-first layout with clean hierarchy and dense readability.',
    category: 'modern',
    accentColor: '#0f172a',
  },
  compact: {
    label: 'Compact Sidebar',
    description: 'Trending dual-panel resume with strong structure for modern hiring teams.',
    category: 'modern',
    accentColor: '#2563eb',
  },
  neominimal: {
    label: 'Neo Minimal',
    description: 'Soft gradient minimal style with modern typography and clean spacing.',
    category: 'minimal',
    accentColor: '#7c3aed',
  },
  researchblue: {
    label: 'Research Blue',
    description: 'Academic/research resume style with strong section hierarchy and blue headings.',
    category: 'classic',
    accentColor: '#00199e',
  },
  arrowclassic: {
    label: 'Arrow Classic',
    description: 'Classic CV look with dark bars, arrow bullets, and timeline rows.',
    category: 'classic',
    accentColor: '#5a5a78',
  },
  twocolumncv: {
    label: 'Two Column CV',
    description: 'tccv-inspired two-column curriculum vitae with timeline events and fact lists.',
    category: 'classic',
    accentColor: '#4f46e5',
  },
  developerpro: {
    label: 'Developer Pro',
    description: 'Xprilion-inspired compact developer resume with ruled sections and dense content.',
    category: 'modern',
    accentColor: '#111827',
  },
  default: {
    label: 'Default',
    description: 'Clean blue accents. A reliable all-purpose template.',
    category: 'modern',
    accentColor: '#2563eb',
  },
  jake: {
    label: 'Jake',
    description: 'LaTeX-compiled. The gold standard for technical resumes.',
    category: 'classic',
    accentColor: '#4338ca',
  },
};
