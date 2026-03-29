export interface ResumeData {
  personalInfo: {
    name?: string;
    title?: string;
    email?: string;
    phone?: string;
    location?: string;
    summary?: string;
    linkedin?: string;
    github?: string;
  };
  experience: Array<{
    id?: string;
    title?: string;
    company?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    current?: boolean;
  }>;
  education: Array<{
    id?: string;
    degree?: string;
    school?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;
  skills: Array<{ id?: string; name?: string; level?: string }>;
  projects: Array<{
    id?: string;
    name?: string;
    description?: string;
    technologies?: string;
    startDate?: string;
    endDate?: string;
    url?: string;
  }>;
  achievements?: Array<{
    id?: string;
    name?: string;
    description?: string;
    technologies?: string;
    url?: string;
  }>;
}
