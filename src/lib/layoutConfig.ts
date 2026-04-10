export type SectionKey = 'education' | 'experience' | 'projects' | 'skills' | 'summary' | 'achievements';

export interface LayoutConfig {
  sectionOrder: SectionKey[];
  sectionSpacing: Record<SectionKey, number>; // extra px of top-margin before each section (0–40)
}

export const DEFAULT_LAYOUT: LayoutConfig = {
  sectionOrder: ['education', 'experience', 'projects', 'skills', 'summary', 'achievements'],
  sectionSpacing: {
    education: 0,
    experience: 0,
    projects: 0,
    skills: 0,
    summary: 0,
    achievements: 0,
  },
};

export const SECTION_LABELS: Record<SectionKey, string> = {
  education: 'Education',
  experience: 'Experience',
  projects: 'Projects',
  skills: 'Technical Skills',
  summary: 'Professional Summary',
  achievements: 'Achievements',
};
