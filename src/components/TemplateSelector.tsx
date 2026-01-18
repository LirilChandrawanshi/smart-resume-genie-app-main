
import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle2 } from 'lucide-react';

interface TemplateSelectorProps {
  selectedTemplate: string;
  onSelectTemplate: (template: string) => void;
}

const templates = [
  {
    id: 'default',
    name: 'Default',
    color: 'bg-blue-500'
  },
  {
    id: 'jake',
    name: 'Jake',
    color: 'bg-indigo-600'
  },
  {
    id: 'modern',
    name: 'Modern',
    color: 'bg-blue-500'
  },
  {
    id: 'classic',
    name: 'Classic',
    color: 'bg-gray-700'
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    color: 'bg-indigo-500'
  },
  {
    id: 'creative',
    name: 'Creative',
    color: 'bg-purple-500'
  },
  {
    id: 'professional',
    name: 'Professional',
    color: 'bg-green-500'
  },
  {
    id: 'academic',
    name: 'Academic',
    color: 'bg-red-500'
  }
];

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ selectedTemplate, onSelectTemplate }) => {
  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium">Choose Template</h3>
          <Button variant="link" size="sm" className="p-0 h-auto text-resume-primary" onClick={() => window.open('/templates', '_blank')}>
            View all
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {templates.slice(0, 4).map((template) => (
            <div 
              key={template.id}
              className={`relative cursor-pointer rounded-md overflow-hidden border-2 hover:shadow-md transition-shadow ${
                selectedTemplate === template.id ? 'border-resume-primary' : 'border-transparent'
              }`}
              onClick={() => onSelectTemplate(template.id)}
            >
              <div className="flex flex-col h-28">
                <div className={`${template.color} h-8`}></div>
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateSelector;
