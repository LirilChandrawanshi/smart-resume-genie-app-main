import React, { useEffect, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle2 } from 'lucide-react';
import { templatesApi, TemplateInfo } from '@/lib/api';

interface TemplateSelectorProps {
  selectedTemplate: string;
  onSelectTemplate: (template: string) => void;
  currentResumeId?: string;
}

const TEMPLATE_COLORS: Record<string, string> = {
  default: 'bg-blue-500',
  jake: 'bg-indigo-600',
  modern: 'bg-blue-500',
  classic: 'bg-gray-700',
  minimalist: 'bg-indigo-500',
  creative: 'bg-purple-500',
  professional: 'bg-green-500',
  academic: 'bg-red-500',
  executive: 'bg-slate-600',
};

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ selectedTemplate, onSelectTemplate, currentResumeId }) => {
  const [templates, setTemplates] = useState<TemplateInfo[]>([]);
  const templatesUrl = currentResumeId ? `/templates?resumeId=${currentResumeId}` : '/templates';

  useEffect(() => {
    templatesApi.getTemplates()
      .then((res) => setTemplates(res.templates || []))
      .catch(() => setTemplates([]));
  }, []);

  const displayTemplates = templates.length > 0 ? templates.slice(0, 4) : [
    { id: 'default', name: 'Default', description: '', hasLatex: false },
    { id: 'jake', name: 'Jake', description: '', hasLatex: true },
    { id: 'modern', name: 'Modern', description: '', hasLatex: false },
    { id: 'professional', name: 'Professional', description: '', hasLatex: false },
  ];

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium">Choose Template</h3>
          <Button variant="link" size="sm" className="p-0 h-auto text-resume-primary" onClick={() => window.open(templatesUrl, '_blank')}>
            View all
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {displayTemplates.map((template) => {
            const color = TEMPLATE_COLORS[template.id] ?? 'bg-gray-500';
            return (
              <div
                key={template.id}
                className={`relative cursor-pointer rounded-md overflow-hidden border-2 hover:shadow-md transition-shadow ${
                  selectedTemplate === template.id ? 'border-resume-primary' : 'border-transparent'
                }`}
                onClick={() => onSelectTemplate(template.id)}
              >
                <div className="flex flex-col h-28">
                  <div className={`relative ${color} h-8`}>
                    {template.hasLatex && (
                      <Badge variant="secondary" className="absolute top-0.5 right-0.5 text-[10px] px-1 py-0">
                        LaTeX
                      </Badge>
                    )}
                  </div>
                  <div className="bg-white p-2 flex-1">
                    <div className="w-full h-2 bg-gray-200 rounded mb-1"></div>
                    <div className="w-3/4 h-2 bg-gray-200 rounded mb-3"></div>
                    <div className="w-full h-1 bg-gray-100 rounded mb-1"></div>
                    <div className="w-full h-1 bg-gray-100 rounded mb-1"></div>
                    <div className="w-2/3 h-1 bg-gray-100 rounded"></div>
                  </div>
                </div>
                {selectedTemplate === template.id && (
                  <div className="absolute top-1 right-1">
                    <CheckCircle2 className="h-5 w-5 text-resume-primary" />
                  </div>
                )}
                <div className="text-center text-xs py-1 bg-gray-50 border-t">
                  {template.name}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateSelector;
