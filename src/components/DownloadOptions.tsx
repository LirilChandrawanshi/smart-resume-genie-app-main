
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { FileText, Download, Share2, Save } from 'lucide-react';
import { useToast } from './ui/use-toast';
import { resumeApi, pdfApi, Resume } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { encodeSharePayload, isSharePayloadTooLarge } from '@/lib/shareResume';
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, BorderStyle, Table, TableRow, TableCell,
  WidthType, VerticalAlign, ShadingType,
} from 'docx';
import { saveAs } from 'file-saver';

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

      // Try backend PDF first for authenticated + saved resumes
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
          toast({ title: "PDF Downloaded", description: "Your resume has been downloaded successfully." });
          setIsDownloading(false);
          return;
        } catch (error) {
          console.warn('Backend PDF generation failed, falling back to print:', error);
        }
      }

      // Use browser print — pixel-perfect, identical to the live preview
      window.print();
      setIsDownloading(false);
    } else if (format === 'docx') {
      setIsDownloading(true);
      try {
        await generateDocx(resumeData);
        toast({ title: 'DOCX Downloaded', description: 'Your resume has been downloaded as a Word document.' });
      } catch (err) {
        console.error('DOCX generation error:', err);
        toast({ title: 'Download Failed', description: 'Could not generate DOCX. Please try again.', variant: 'destructive' });
      } finally {
        setIsDownloading(false);
      }
    }
  };

  const generateDocx = async (data: any) => {
    const p = data.personalInfo;
    const toLines = (s: string): string[] =>
      (s || '').split('\n').map((l: string) => l.replace(/^[\s•\-–]+/, '').trim()).filter(Boolean);

    const sectionHeading = (title: string) =>
      new Paragraph({
        text: title.toUpperCase(),
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 60 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '888888' } },
      });

    const bulletLine = (text: string) =>
      new Paragraph({
        children: [new TextRun({ text, size: 20 })],
        bullet: { level: 0 },
        spacing: { after: 40 },
      });

    const twoCol = (left: string, right: string, leftBold = false) =>
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NONE, size: 0 },
          bottom: { style: BorderStyle.NONE, size: 0 },
          left: { style: BorderStyle.NONE, size: 0 },
          right: { style: BorderStyle.NONE, size: 0 },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 70, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.TOP,
                shading: { type: ShadingType.CLEAR, fill: 'FFFFFF' },
                borders: {
                  top: { style: BorderStyle.NONE, size: 0 },
                  bottom: { style: BorderStyle.NONE, size: 0 },
                  left: { style: BorderStyle.NONE, size: 0 },
                  right: { style: BorderStyle.NONE, size: 0 },
                },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: left, bold: leftBold, size: 20 })],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 30, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.TOP,
                shading: { type: ShadingType.CLEAR, fill: 'FFFFFF' },
                borders: {
                  top: { style: BorderStyle.NONE, size: 0 },
                  bottom: { style: BorderStyle.NONE, size: 0 },
                  left: { style: BorderStyle.NONE, size: 0 },
                  right: { style: BorderStyle.NONE, size: 0 },
                },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [new TextRun({ text: right, size: 20 })],
                  }),
                ],
              }),
            ],
          }),
        ],
      });

    const children: any[] = [];

    // ── Header ──
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        children: [new TextRun({ text: p.name || 'Your Name', bold: true, size: 36, allCaps: true })],
      })
    );
    if (p.location) {
      children.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        children: [new TextRun({ text: p.location, size: 20 })],
      }));
    }
    const contactParts = [p.phone, p.email, p.linkedin && `linkedin.com/in/${p.linkedin}`, p.github && `github.com/${p.github}`].filter(Boolean);
    if (contactParts.length) {
      children.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [new TextRun({ text: contactParts.join(' | '), size: 18 })],
      }));
    }

    // ── Education ──
    const edu = (data.education || []).filter((e: any) => e.school || e.degree);
    if (edu.length) {
      children.push(sectionHeading('Education'));
      for (const e of edu) {
        children.push(twoCol(e.school || '', e.location || '', true));
        children.push(twoCol(e.degree || '', e.startDate ? `${e.startDate} – ${e.endDate || 'Present'}` : ''));
        for (const l of toLines(e.description)) children.push(bulletLine(l));
        children.push(new Paragraph({ spacing: { after: 80 } }));
      }
    }

    // ── Experience ──
    const exp = (data.experience || []).filter((e: any) => e.title || e.company);
    if (exp.length) {
      children.push(sectionHeading('Experience'));
      for (const e of exp) {
        children.push(twoCol(e.company || '', e.startDate ? `${e.startDate} – ${e.endDate || 'Present'}` : '', true));
        children.push(twoCol(e.title || '', e.location || ''));
        for (const l of toLines(e.description)) children.push(bulletLine(l));
        children.push(new Paragraph({ spacing: { after: 80 } }));
      }
    }

    // ── Projects ──
    const proj = (data.projects || []).filter((e: any) => e.name);
    if (proj.length) {
      children.push(sectionHeading('Projects'));
      for (const e of proj) {
        children.push(twoCol(
          e.name + (e.technologies ? ` | ${e.technologies}` : ''),
          e.startDate ? `${e.startDate}${e.endDate ? ` – ${e.endDate}` : ''}` : '',
          true
        ));
        for (const l of toLines(e.description)) children.push(bulletLine(l));
        children.push(new Paragraph({ spacing: { after: 80 } }));
      }
    }

    // ── Skills ──
    const skills = (data.skills || []).filter((s: any) => s.name);
    if (skills.length) {
      children.push(sectionHeading('Technical Skills'));
      for (const s of skills) {
        const levelText = s.level && !/^\d+$/.test(s.level.trim()) ? s.level : null;
        children.push(new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: s.name, bold: true, size: 20 }),
            ...(levelText ? [new TextRun({ text: `: ${levelText}`, size: 20 })] : []),
          ],
        }));
      }
    }

    // ── Summary ──
    if (p.summary) {
      children.push(sectionHeading('Professional Summary'));
      children.push(new Paragraph({ children: [new TextRun({ text: p.summary, size: 20 })], spacing: { after: 80 } }));
    }

    // ── Achievements ──
    const ach = (data.achievements || []).filter((a: any) => a.name);
    if (ach.length) {
      children.push(sectionHeading('Leadership / Extracurricular'));
      for (const a of ach) {
        children.push(twoCol(a.name, a.technologies || '', true));
        for (const l of toLines(a.description)) children.push(bulletLine(l));
        children.push(new Paragraph({ spacing: { after: 80 } }));
      }
    }

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 900, right: 900 },
          },
        },
        children,
      }],
      styles: {
        paragraphStyles: [
          {
            id: 'Heading2',
            name: 'Heading 2',
            basedOn: 'Normal',
            run: { bold: true, size: 22, allCaps: true, color: '111111' },
            paragraph: { spacing: { before: 240, after: 60 } },
          },
        ],
      },
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${p.name || 'Resume'}.docx`);
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
          description: 'Shorten long sections or remove entries, then try again.',
          variant: 'destructive',
        });
        return;
      }

      const shareLink = `${window.location.origin}/share?d=${encodeURIComponent(encoded)}`;

      // 1. Try modern clipboard API
      let copied = false;
      try {
        await navigator.clipboard.writeText(shareLink);
        copied = true;
      } catch {
        // Clipboard API unavailable (HTTP, permissions) — try legacy fallback
        try {
          const ta = document.createElement('textarea');
          ta.value = shareLink;
          ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
          document.body.appendChild(ta);
          ta.focus();
          ta.select();
          copied = document.execCommand('copy');
          document.body.removeChild(ta);
        } catch {
          copied = false;
        }
      }

      if (copied) {
        toast({
          title: 'Link copied!',
          description: 'Paste it anywhere — anyone with the link can view and edit their own copy.',
        });
      } else {
        // Both APIs failed — show the link so the user can copy manually
        toast({
          title: 'Copy this link manually',
          description: shareLink,
        });
      }
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
          <Button variant="outline" onClick={() => handleDownload('docx')} disabled={isDownloading}>
            <Download className="h-4 w-4 mr-2" />
            {isDownloading ? 'Processing...' : 'DOCX'}
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
