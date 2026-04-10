'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import ResumeForm from '@/components/ResumeForm';
import ResumePreview from '@/components/ResumePreview';
import AiSuggestions from '@/components/AiSuggestions';
import DownloadOptions from '@/components/DownloadOptions';
import TemplateSelector from '@/components/TemplateSelector';
import { useToast } from '@/components/ui/use-toast';
import { Sparkles, Eye, EyeOff, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { resumeApi, Resume } from '@/lib/api';
import { SAMPLE_RESUME } from '@/data/sampleResumeData';
import {
  RESUME_PAGE_WIDTH_PX,
  RESUME_PAGE_HEIGHT_PX,
  RESUME_PAGE_SIZE_LABEL,
} from '@/lib/resumePageSize';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/* ─── Letter paper preview wrapper — up to 2 pages ─── */
const PAGE_GAP = 12;         // px gap between pages (unscaled)
const PAGE_TOP_PADDING = 28; // px breathing room at top of page 2+ (unscaled)

const LetterPreviewWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef  = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.6);
  const [pages, setPages] = useState(1);

  // Track container width → scale
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setScale(el.offsetWidth / RESUME_PAGE_WIDTH_PX);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Measure natural content height via off-screen div
  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const update = () =>
      setPages(el.scrollHeight > RESUME_PAGE_HEIGHT_PX ? 2 : 1);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Shadow lives on a non-clipping wrapper so it isn't cut off at page edges
  const pageShadow = '0 2px 16px rgba(0,0,0,0.35), 0 1px 4px rgba(0,0,0,0.18)';

  const renderPage = (pageIndex: number) => (
    /* Shadow wrapper — must NOT clip so the shadow bleeds naturally */
    <div style={{ borderRadius: 2, boxShadow: pageShadow }}>
      {/* Clip box — hides content outside this page's bounds */}
      <div style={{ overflow: 'hidden', height: RESUME_PAGE_HEIGHT_PX * scale, borderRadius: 2 }}>
        {/* Scale + position wrapper */}
        <div
          style={{
            width: RESUME_PAGE_WIDTH_PX,
            height: RESUME_PAGE_HEIGHT_PX,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            background: '#fff',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {pageIndex === 0 ? (
            <>
              {children}
              {/* Gradient fade at the bottom of page 1 so cut-off text isn't visible */}
              {pages === 2 && (
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  height: PAGE_TOP_PADDING + 8,
                  background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 70%)',
                  zIndex: 5,
                  pointerEvents: 'none',
                }} />
              )}
            </>
          ) : (
            <>
              {/* Shift content up by exactly one page — no overlap */}
              <div style={{ position: 'absolute', top: -(RESUME_PAGE_HEIGHT_PX * pageIndex), left: 0, width: '100%' }}>
                {children}
              </div>
              {/* White top-padding overlay so content doesn't start flush at the edge */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: PAGE_TOP_PADDING, background: '#fff', zIndex: 5, pointerEvents: 'none' }} />
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      {/* Off-screen measurement clone (same width, unconstrained height) */}
      <div
        ref={measureRef}
        aria-hidden
        style={{
          position: 'fixed',
          top: '-9999px',
          left: '-9999px',
          width: RESUME_PAGE_WIDTH_PX,
          overflow: 'visible',
          visibility: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {children}
      </div>

      {renderPage(0)}

      {pages === 2 && (
        <>
          {/* Gap between pages — matches the dark viewer background */}
          <div style={{ height: PAGE_GAP * scale }} />
          {renderPage(1)}
        </>
      )}
    </div>
  );
};

interface ResumeData {
  personalInfo: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
    linkedin?: string;
    github?: string;
  };
  experience: {
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  education: {
    id: string;
    degree: string;
    school: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  skills: {
    id: string;
    name: string;
    level: string;
  }[];
  projects: {
    id: string;
    name: string;
    description: string;
    technologies: string;
    startDate: string;
    endDate: string;
    url?: string;
  }[];
  achievements: {
    id: string;
    name: string;
    description: string;
    technologies: string;
    url?: string;
  }[];
}

const BLANK_RESUME_DATA: ResumeData = {
  personalInfo: { name: '', title: '', email: '', phone: '', location: '', summary: '', linkedin: '', github: '' },
  experience: [{ id: '1', title: '', company: '', location: '', startDate: '', endDate: '', description: '' }],
  education: [{ id: '1', degree: '', school: '', location: '', startDate: '', endDate: '', description: '' }],
  skills: [{ id: '1', name: '', level: '' }],
  projects: [{ id: '1', name: '', description: '', technologies: '', startDate: '', endDate: '', url: '' }],
  achievements: [{ id: '1', name: '', description: '', technologies: '', url: '' }],
};

function mergeSharedResume(raw: unknown, blank: ResumeData): ResumeData {
  if (!raw || typeof raw !== 'object') return structuredClone(blank);
  const d = raw as Record<string, unknown>;
  const pi = (d.personalInfo && typeof d.personalInfo === 'object' ? d.personalInfo : {}) as ResumeData['personalInfo'];
  return {
    personalInfo: { ...blank.personalInfo, ...pi },
    experience:
      Array.isArray(d.experience) && d.experience.length
        ? (d.experience as ResumeData['experience'])
        : structuredClone(blank.experience),
    education:
      Array.isArray(d.education) && d.education.length
        ? (d.education as ResumeData['education'])
        : structuredClone(blank.education),
    skills:
      Array.isArray(d.skills) && d.skills.length ? (d.skills as ResumeData['skills']) : structuredClone(blank.skills),
    projects:
      Array.isArray(d.projects) && d.projects.length
        ? (d.projects as ResumeData['projects'])
        : structuredClone(blank.projects),
    achievements:
      Array.isArray(d.achievements) && d.achievements.length
        ? (d.achievements as ResumeData['achievements'])
        : structuredClone(blank.achievements),
  };
}

const SHARE_IMPORT_KEY = 'resumeBuilder_shareImport';

export function HomePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [showPreview, setShowPreview] = useState(!isMobile);
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [currentResumeId, setCurrentResumeId] = useState<string | undefined>();
  const [savedResumes, setSavedResumes] = useState<Resume[]>([]);
  const [isLoadingResumes, setIsLoadingResumes] = useState(false);

  const initialResumeData: ResumeData = SAMPLE_RESUME;
  const [resumeData, setResumeData] = useState(initialResumeData);

  useEffect(() => { setMounted(true); }, []);

  const RESUMED_ID_STORAGE_KEY = 'resumeBuilder_currentResumeId';
  useEffect(() => {
    if (currentResumeId) {
      sessionStorage.setItem(RESUMED_ID_STORAGE_KEY, currentResumeId);
    } else {
      sessionStorage.removeItem(RESUMED_ID_STORAGE_KEY);
    }
  }, [currentResumeId]);

  // Sync template and resume from URL (e.g. from Templates page "Use This Template" with a resume selected)
  // Wait for auth to settle so we know whether we can load the resume (auth may restore from localStorage after first paint)
  useEffect(() => {
    const templateFromUrl = searchParams.get('template');
    const resumeIdFromUrl = searchParams.get('resumeId');
    const hasTemplate = templateFromUrl != null && templateFromUrl.trim() !== '';
    const hasResumeId = resumeIdFromUrl && resumeIdFromUrl.trim() !== '';

    if (!hasTemplate && !hasResumeId) return;

    if (hasTemplate) {
      setSelectedTemplate(templateFromUrl);
    }

    const clearUrlParams = () => {
      const next = new URLSearchParams(searchParams.toString());
      next.delete('template');
      next.delete('resumeId');
      const q = next.toString();
      router.replace(q ? `${pathname}?${q}` : pathname);
    };

    if (hasResumeId && isAuthenticated) {
      resumeApi
        .getById(resumeIdFromUrl)
        .then((resume) => {
          setCurrentResumeId(resume.id);
          setResumeData({
            personalInfo: resume.personalInfo || initialResumeData.personalInfo,
            experience: resume.experience?.length ? resume.experience : initialResumeData.experience,
            education: resume.education?.length ? resume.education : initialResumeData.education,
            skills: resume.skills?.length ? resume.skills : initialResumeData.skills,
            projects: resume.projects?.length ? resume.projects : initialResumeData.projects,
            achievements: resume.achievements?.length ? resume.achievements : initialResumeData.achievements,
          });
          if (hasTemplate) {
            setSelectedTemplate(templateFromUrl);
          } else if (resume.template) {
            setSelectedTemplate(resume.template);
          }
        })
        .catch(() => {
          toast({
            title: 'Error loading resume',
            description: 'Could not load the selected resume. You may need to sign in again.',
            variant: 'destructive',
          });
        })
        .finally(clearUrlParams);
    } else if (hasResumeId && !isAuthenticated && !isAuthLoading) {
      // Auth settled and user is not logged in – can't load resume, clear stale params
      clearUrlParams();
    } else if (!hasResumeId) {
      // Only template in URL, no resume to restore
      clearUrlParams();
    }
    // When hasResumeId && !isAuthenticated && isAuthLoading: do nothing – wait for auth to settle, then effect runs again
  }, [searchParams, isAuthenticated, isAuthLoading, pathname, router, toast]);

  // Import resume from /share via sessionStorage (one-time)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SHARE_IMPORT_KEY);
      if (!raw) return;
      sessionStorage.removeItem(SHARE_IMPORT_KEY);
      const parsed = JSON.parse(raw) as { data: unknown; template: string };
      if (!parsed?.data) return;
      const merged = mergeSharedResume(parsed.data, BLANK_RESUME_DATA);
      setResumeData(merged);
      setSelectedTemplate(parsed.template?.trim() || 'classic');
      setCurrentResumeId(undefined);
      toast({
        title: 'Resume loaded from share link',
        description: 'You can edit and save it to your account.',
      });
      router.replace('/');
    } catch {
      /* ignore */
    }
  }, [router, toast]);

  // Load saved resumes when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadSavedResumes();
    } else {
      setSavedResumes([]);
      setCurrentResumeId(undefined);
    }
  }, [isAuthenticated]);

  const loadSavedResumes = async () => {
    setIsLoadingResumes(true);
    try {
      const resumes = await resumeApi.getAll();
      setSavedResumes(resumes);
    } catch (error: any) {
      console.error('Error loading resumes:', error);
      toast({
        title: "Error loading resumes",
        description: error.message || "Failed to load your saved resumes.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingResumes(false);
    }
  };

  const handleSelectResume = async (resumeId: string) => {
    if (resumeId === 'new') {
      setCurrentResumeId(undefined);
      setResumeData(structuredClone(BLANK_RESUME_DATA));
      return;
    }

    try {
      const resume = await resumeApi.getById(resumeId);
      setCurrentResumeId(resume.id);
      setResumeData({
        personalInfo: resume.personalInfo || initialResumeData.personalInfo,
        experience: resume.experience && resume.experience.length > 0 
          ? resume.experience 
          : initialResumeData.experience,
        education: resume.education && resume.education.length > 0 
          ? resume.education 
          : initialResumeData.education,
        skills: resume.skills && resume.skills.length > 0 
          ? resume.skills 
          : initialResumeData.skills,
        projects: resume.projects && resume.projects.length > 0 
          ? resume.projects 
          : initialResumeData.projects,
        achievements: resume.achievements && resume.achievements.length > 0 
          ? resume.achievements 
          : initialResumeData.achievements,
      });
      if (resume.template) {
        setSelectedTemplate(resume.template);
      }
      toast({
        title: "Resume loaded",
        description: "Your resume has been loaded successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error loading resume",
        description: error.message || "Failed to load the resume.",
        variant: "destructive"
      });
    }
  };

  const handleResumeSaved = (savedResume: Resume) => {
    setCurrentResumeId(savedResume.id);
    loadSavedResumes(); // Refresh the list
  };

  const handleUpdateResume = (data: any) => {
    setResumeData(data);
  };

  const handleApplyTailoredResume = (tailoredResume: any) => {
    setResumeData((prev: any) => ({
      ...prev,
      ...tailoredResume,
      personalInfo: { ...prev.personalInfo, ...tailoredResume.personalInfo },
    }));
  };

  const handleApplySuggestion = (field: string, value: string) => {
    if (field === 'summary') {
      setResumeData({
        ...resumeData,
        personalInfo: {
          ...resumeData.personalInfo,
          summary: value
        }
      });
    } else if (field === 'newSkill') {
      setResumeData({
        ...resumeData,
        skills: [
          ...resumeData.skills,
          { id: `skill-${Date.now()}`, name: value, level: '' }
        ]
      });
    } else if (field.startsWith('experience-')) {
      const parts = field.split('-');
      const expIndex = parseInt(parts[1]);
      
      const updatedExperience = [...resumeData.experience];
      if (parts[2] === 'description') {
        updatedExperience[expIndex] = {
          ...updatedExperience[expIndex],
          description: value
        };
      }
      
      setResumeData({
        ...resumeData,
        experience: updatedExperience
      });
    }
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  return (
    <>
      <div className="container px-4 md:px-6 py-8">
        <div className="flex flex-col items-center justify-center mb-8 text-center">
          <div className="inline-flex items-center justify-center p-2 bg-resume-accent rounded-full mb-4">
            <Sparkles className="w-5 h-5 text-resume-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Smart Resume Builder</h1>
          <p className="text-muted-foreground max-w-xl">
            Create a professional resume in minutes with our AI-powered resume builder. Get tailored suggestions to help your resume stand out.
          </p>
        </div>

        {/* Resume Selector for Authenticated Users */}
        {isAuthenticated && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <span>My Resumes</span>
              </CardTitle>
              <CardDescription>
                Select a saved resume or create a new one
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingResumes ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Loading resumes...</span>
                </div>
              ) : (
                <Select
                  value={currentResumeId || 'new'}
                  onValueChange={handleSelectResume}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a resume" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">+ Create New Resume</SelectItem>
                    {savedResumes.map((resume) => (
                      <SelectItem key={resume.id} value={resume.id || ''}>
                        {resume.name || 'Untitled Resume'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column: Form & Tools */}
          <div className={`w-full ${showPreview ? 'lg:w-1/2' : 'lg:w-2/3'} space-y-6 animate-fade-in`}>
            <div className="flex justify-end mb-2 lg:hidden">
              <Button variant="outline" size="sm" onClick={togglePreview} className="flex items-center gap-1">
                {showPreview ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    <span>Hide Preview</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    <span>Show Preview</span>
                  </>
                )}
              </Button>
            </div>
            
            <ResumeForm onUpdateResume={handleUpdateResume} initialData={resumeData} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AiSuggestions resumeData={resumeData} onApplySuggestion={handleApplySuggestion} onApplyTailoredResume={handleApplyTailoredResume} />
              <div className="space-y-6">
                <TemplateSelector selectedTemplate={selectedTemplate} onSelectTemplate={setSelectedTemplate} currentResumeId={currentResumeId} />
                <DownloadOptions 
                  resumeData={resumeData} 
                  resumeId={currentResumeId}
                  selectedTemplate={selectedTemplate}
                  onResumeSaved={handleResumeSaved}
                />
              </div>
            </div>
          </div>
          
          {/* Right Column: Letter-size preview */}
          {(showPreview || !isMobile) && (
            <div className={`w-full ${showPreview ? 'lg:w-1/2' : 'lg:w-1/3'} animate-fade-in`}>
              <div className="sticky top-24">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h2 className="text-base font-semibold">Live Preview</h2>
                    <p className="text-xs text-muted-foreground">{RESUME_PAGE_SIZE_LABEL}</p>
                  </div>
                  <Button variant="outline" size="sm" className="hidden lg:flex items-center gap-1" onClick={togglePreview}>
                    {showPreview ? (
                      <>
                        <EyeOff className="h-4 w-4" />
                        <span className="hidden md:inline">Hide</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" />
                        <span className="hidden md:inline">Show</span>
                      </>
                    )}
                  </Button>
                </div>
                {/* PDF-viewer style container */}
                <div
                  style={{
                    background: '#525659',
                    borderRadius: '10px',
                    padding: '20px 16px',
                    overflowY: 'auto',
                    maxHeight: 'calc(100vh - 160px)',
                  }}
                >
                  <LetterPreviewWrapper>
                    <ResumePreview resumeData={resumeData} selectedTemplate={selectedTemplate} />
                  </LetterPreviewWrapper>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Print portal — rendered directly into <body> so @media print can target it with body > .resume-print-portal */}
      {mounted && createPortal(
        <div
          aria-hidden
          className="resume-print-portal"
          style={{
            position: 'fixed',
            left: '-10000px',
            top: 0,
            zIndex: -1,
            pointerEvents: 'none',
            visibility: 'hidden',
          }}
        >
          <div
            className="resume-print-source"
            style={{ width: RESUME_PAGE_WIDTH_PX, height: RESUME_PAGE_HEIGHT_PX }}
          >
            <ResumePreview resumeData={resumeData} selectedTemplate={selectedTemplate} />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
