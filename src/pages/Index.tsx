
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ResumeData {
  personalInfo: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
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
}

const Index = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { isAuthenticated } = useAuth();
  const [showPreview, setShowPreview] = useState(!isMobile);
  const [selectedTemplate, setSelectedTemplate] = useState('default');
  const [currentResumeId, setCurrentResumeId] = useState<string | undefined>();
  const [savedResumes, setSavedResumes] = useState<Resume[]>([]);
  const [isLoadingResumes, setIsLoadingResumes] = useState(false);
  
  const initialResumeData: ResumeData = {
    personalInfo: {
      name: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      summary: '',
    },
    experience: [
      { id: '1', title: '', company: '', location: '', startDate: '', endDate: '', description: '' }
    ],
    education: [
      { id: '1', degree: '', school: '', location: '', startDate: '', endDate: '', description: '' }
    ],
    skills: [
      { id: '1', name: '', level: '80' }
    ],
    projects: [
      { id: '1', name: '', description: '', technologies: '', startDate: '', endDate: '', url: '' }
    ]
  };
  
  const [resumeData, setResumeData] = useState(initialResumeData);

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
      setResumeData(initialResumeData);
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
          { id: `skill-${Date.now()}`, name: value, level: '80' }
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
    <Layout>
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
              <AiSuggestions resumeData={resumeData} onApplySuggestion={handleApplySuggestion} />
              <div className="space-y-6">
                <TemplateSelector selectedTemplate={selectedTemplate} onSelectTemplate={setSelectedTemplate} />
                <DownloadOptions 
                  resumeData={resumeData} 
                  resumeId={currentResumeId}
                  selectedTemplate={selectedTemplate}
                  onResumeSaved={handleResumeSaved}
                />
              </div>
            </div>
          </div>
          
          {/* Right Column: Preview */}
          {(showPreview || !isMobile) && (
            <div className={`w-full ${showPreview ? 'lg:w-1/2' : 'lg:w-1/3'} animate-fade-in`}>
              <div className="sticky top-24">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">Resume Preview</h2>
                  <Button variant="outline" size="sm" className="hidden lg:flex items-center gap-1" onClick={togglePreview}>
                    {showPreview ? (
                      <>
                        <EyeOff className="h-4 w-4" />
                        <span className="hidden md:inline">Hide Preview</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" />
                        <span className="hidden md:inline">Expand Preview</span>
                      </>
                    )}
                  </Button>
                </div>
                <div className="bg-gray-100 p-6 rounded-lg">
                  <ResumePreview resumeData={resumeData} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Index;
