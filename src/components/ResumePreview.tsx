import React from 'react';
import { getCustomTemplate } from '@/lib/latexTemplateParser';
import CustomTemplateRenderer from './CustomTemplateRenderer';
import {
  ClassicTemplate,
  ModernTemplate,
  ExecutiveTemplate,
  MinimalTemplate,
  CreativeTemplate,
  ProfessionalTemplate,
} from './templates';

interface ResumePreviewProps {
  resumeData: any;
  selectedTemplate?: string;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ resumeData, selectedTemplate = 'default' }) => {
  // Custom imported LaTeX template
  const customTemplate = getCustomTemplate(selectedTemplate);
  if (customTemplate) {
    return (
      <div className="resume-preview-wrapper">
      
        <div
          className="w-full shadow-lg resume-preview bg-white overflow-hidden rounded-sm"
          style={{ borderTop: `4px solid ${customTemplate.accentColor}` }}
        >
          <CustomTemplateRenderer resumeData={resumeData} template={customTemplate} />
        </div>
      </div>
    );
  }

  const props = { data: resumeData };

  const templateMap: Record<string, React.ReactNode> = {
    classic:      <ClassicTemplate {...props} />,
    jake:         <ClassicTemplate {...props} />,
    modern:       <ModernTemplate {...props} />,
    executive:    <ExecutiveTemplate {...props} />,
    academic:     <ExecutiveTemplate {...props} />,
    minimalist:   <MinimalTemplate {...props} />,
    creative:     <CreativeTemplate {...props} />,
    professional: <ProfessionalTemplate {...props} />,
    default:      <ProfessionalTemplate {...props} />,
  };

  const content = templateMap[selectedTemplate] ?? templateMap.default;

  return (
    <div className="resume-preview-wrapper">
   
      <div className="w-full shadow-lg resume-preview bg-white overflow-hidden rounded-sm">
        {content}
      </div>
    </div>
  );
};

export default ResumePreview;
