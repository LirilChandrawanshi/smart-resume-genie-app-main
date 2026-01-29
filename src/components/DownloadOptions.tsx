
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { FileText, Download, Share2, Save } from 'lucide-react';
import { useToast } from './ui/use-toast';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { resumeApi, pdfApi, Resume } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

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
        
        // Fallback to client-side PDF generation (scale to fit one A4 page)
        const resumeElement = document.querySelector('.resume-preview');
        
        if (!resumeElement) {
          throw new Error('Resume preview element not found');
        }
        
        const canvas = await html2canvas(resumeElement as HTMLElement, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });
        
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        const pageWidth = 210;
        const pageHeight = 297;
        const aspect = canvas.width / canvas.height;
        const pageAspect = pageWidth / pageHeight;
        let imgWidth: number;
        let imgHeight: number;
        if (aspect > pageAspect) {
          imgWidth = pageWidth;
          imgHeight = pageWidth / aspect;
        } else {
          imgHeight = pageHeight;
          imgWidth = pageHeight * aspect;
        }
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
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

  const handleShare = () => {
    // Generate a shareable link (in a real app, this would send data to the backend)
    const shareId = Math.random().toString(36).substring(2, 10);
    const shareLink = `${window.location.origin}/share/${shareId}`;
    
    navigator.clipboard.writeText(shareLink).then(() => {
      toast({
        title: "Share link generated",
        description: "A shareable link has been copied to your clipboard.",
      });
    }).catch(() => {
      toast({
        title: "Sharing failed",
        description: "Could not copy link to clipboard.",
        variant: "destructive"
      });
    });
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
