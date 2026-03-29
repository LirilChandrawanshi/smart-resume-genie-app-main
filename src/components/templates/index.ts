export { ClassicTemplate }    from './ClassicTemplate';
export { ModernTemplate }     from './ModernTemplate';
export { ExecutiveTemplate }  from './ExecutiveTemplate';
export { MinimalTemplate }    from './MinimalTemplate';
export { CreativeTemplate }   from './CreativeTemplate';
export { ProfessionalTemplate } from './ProfessionalTemplate';

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
