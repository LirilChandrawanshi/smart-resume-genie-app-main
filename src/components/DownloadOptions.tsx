
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { FileText, Download, Share2, Save } from 'lucide-react';
import { useToast } from './ui/use-toast';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { resumeApi, pdfApi, Resume } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { encodeSharePayload, isSharePayloadTooLarge } from '@/lib/shareResume';
import {
  RESUME_PAGE_WIDTH_MM,
  RESUME_PAGE_HEIGHT_MM,
  RESUME_PAGE_WIDTH_PX,
  RESUME_PAGE_HEIGHT_PX,
} from '@/lib/resumePageSize';

interface DownloadOptionsProps {
  resumeData: any;
  resumeId?: string;
  selectedTemplate?: string;
  onResumeSaved?: (resume: Resume) => void;
}

const DownloadOptions: React.FC<DownloadOptionsProps> = ({ resumeData, resumeId, selectedTemplate = 'default', onResumeSaved }) => {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [isSaving, setSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const handleDownload = async (format: string) => {
    if (format === 'pdf') {
      setIsDownloading(true);
      
      toast({
        title: "Preparing PDF download",
        description: "Your resume will be downloaded in a few seconds.",
      });
      
      try {
        // If resume is saved and user is authenticated, try backend PDF generation first
        if (resumeId && isAuthenticated) {
          try {
            const blob = await pdfApi.generate(resumeId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${resumeData.personalInfo.name || 'Resume'}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            toast({
              title: "PDF Downloaded",
              description: "Your resume has been downloaded successfully.",
            });
            setIsDownloading(false);
            return;
          } catch (error) {
            console.warn('Backend PDF generation failed, falling back to client-side:', error);
            // Fall through to client-side generation
          }
        }
        
        // Capture the hidden Letter frame only (same 816×1056 + overflow as live preview)
        const printRoot = document.querySelector('.resume-print-portal') as HTMLElement | null;
        const resumeElement = (
          document.querySelector('.resume-print-source') ??
          document.querySelector('.resume-preview')
        ) as HTMLElement | null;

        if (!resumeElement) {
          throw new Error('Resume preview element not found');
        }

        const prevPortalVisibility = printRoot?.style.visibility ?? '';
        const prevPortalPointer = printRoot?.style.pointerEvents ?? '';
        if (printRoot) {
          printRoot.style.visibility = 'visible';
          printRoot.style.pointerEvents = 'none';
        }

        const canvas = await html2canvas(resumeElement, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: RESUME_PAGE_WIDTH_PX,
          height: RESUME_PAGE_HEIGHT_PX,
          windowWidth: RESUME_PAGE_WIDTH_PX,
          windowHeight: RESUME_PAGE_HEIGHT_PX,
          scrollX: 0,
          scrollY: 0,
          x: 0,
          y: 0,
          onclone: (clonedDoc) => {
            const root = clonedDoc.documentElement;
            root.classList.remove('dark');
            root.style.colorScheme = 'light';
            root.style.backgroundColor = '#ffffff';
            const body = clonedDoc.body;
            if (body) {
              body.style.backgroundColor = '#ffffff';
              body.style.color = '#0f172a';
            }
          },
        });

        if (printRoot) {
          printRoot.style.visibility = prevPortalVisibility;
          printRoot.style.pointerEvents = prevPortalPointer;
        }

        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'letter',
        });

        const pageW = RESUME_PAGE_WIDTH_MM;
        const pageH = RESUME_PAGE_HEIGHT_MM;
        const aspect = canvas.width / canvas.height;
        const pageAspect = pageW / pageH;
        let imgW: number;
        let imgH: number;
        if (aspect > pageAspect) {
          imgW = pageW;
          imgH = pageW / aspect;
        } else {
          imgH = pageH;
          imgW = pageH * aspect;
        }

        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, imgW, imgH);
        pdf.save(`${resumeData.personalInfo.name || 'Resume'}.pdf`);
        
        toast({
          title: "PDF Downloaded",
          description: "Your resume has been downloaded successfully.",
        });
      } catch (error) {
        console.error('PDF generation error:', error);
        toast({
          title: "Download Failed",
          description: "There was an error generating your PDF. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsDownloading(false);
      }
    } else if (format === 'docx') {
      toast({
        title: `Preparing ${format.toUpperCase()} download`,
        description: "DOCX export is coming soon.",
      });
    }
  };

  const handleShare = async () => {
    try {
      const encoded = encodeSharePayload({
        v: 1,
        template: selectedTemplate,
        data: resumeData as Record<string, unknown>,
      });

      if (isSharePayloadTooLarge(encoded)) {
        toast({
          title: 'Resume too large to share',
          description:
            'Shorten long sections or remove entries, then try again. You can still save and export PDF.',
          variant: 'destructive',
        });
        return;
      }

      const shareLink = `${window.location.origin}/share?d=${encodeURIComponent(encoded)}`;

      const copy = async () => {
        await navigator.clipboard.writeText(shareLink);
        toast({
          title: 'Link copied',
          description: 'Anyone with the link can open a read-only preview and edit their own copy.',
        });
      };

      if (typeof navigator.share === 'function') {
        try {
          await navigator.share({
            title: 'Shared resume',
            text: 'Open this link to view the resume.',
            url: shareLink,
          });
          toast({
            title: 'Shared',
            description: 'If you still need the URL, use Share again and copy from your device.',
          });
          return;
        } catch (e) {
          if ((e as Error).name === 'AbortError') return;
        }
      }

      await copy();
    } catch {
      toast({
        title: 'Could not create share link',
        description: 'Try again or use Save and PDF export instead.',
        variant: 'destructive',
      });
    }
  };
  
  const handleSaveToAccount = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to save your resume.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    
    try {
      const resumeToSave: Resume = {
        name: resumeData.personalInfo.name ? `${resumeData.personalInfo.name}'s Resume` : 'My Resume',
        personalInfo: resumeData.personalInfo,
        experience: resumeData.experience,
        education: resumeData.education,
        skills: resumeData.skills,
        projects: resumeData.projects,
        achievements: resumeData.achievements ?? [],
        template: selectedTemplate
      };

      let savedResume: Resume;
      
      if (resumeId) {
        // Update existing resume
        savedResume = await resumeApi.update(resumeId, resumeToSave);
        toast({
          title: "Resume updated",
          description: "Your resume has been updated successfully.",
        });
      } else {
        // Create new resume
        savedResume = await resumeApi.create(resumeToSave);
        toast({
          title: "Resume saved",
          description: "Your resume has been saved to your account.",
        });
      }
      
      if (onResumeSaved) {
        onResumeSaved(savedResume);
      }
    } catch (error: any) {
      console.error('Error saving resume:', error);
      toast({
        title: "Error saving resume",
        description: error.message || "There was an error saving your resume. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <span>Export Resume</span>
        </CardTitle>
        <CardDescription>Download your resume in different formats</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Button 
            className="bg-resume-primary hover:bg-resume-secondary" 
            onClick={() => handleDownload('pdf')}
            disabled={isDownloading}
          >
            <Download className="h-4 w-4 mr-2" />
            {isDownloading ? 'Processing...' : 'PDF'}
          </Button>
          <Button variant="outline" onClick={() => handleDownload('docx')}>
            <Download className="h-4 w-4 mr-2" />
            DOCX
          </Button>
        </div>
        <Button variant="secondary" className="w-full" onClick={handleShare}>
          <Share2 className="h-4 w-4 mr-2" />
          Share Link
        </Button>
        <Button 
          variant="default" 
          className="w-full" 
          onClick={handleSaveToAccount} 
          disabled={isSaving || !isAuthenticated}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : resumeId ? "Update Resume" : "Save to Account"}
        </Button>
        {!isAuthenticated && (
          <p className="text-xs text-muted-foreground text-center">
            Please log in to save your resume
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default DownloadOptions;
