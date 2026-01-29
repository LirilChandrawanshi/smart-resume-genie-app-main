import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { templatesApi, TemplateInfo } from '@/lib/api';

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

const RESUMED_ID_STORAGE_KEY = 'resumeBuilder_currentResumeId';

const Templates = () => {
  const [searchParams] = useSearchParams();
  const resumeIdFromUrl = searchParams.get('resumeId') || '';
  const resumeIdFromStorage = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(RESUMED_ID_STORAGE_KEY) : null;
  const resumeId = resumeIdFromUrl || resumeIdFromStorage || '';
  const [templates, setTemplates] = useState<TemplateInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    templatesApi.getTemplates()
      .then((res) => setTemplates(res.templates || []))
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Professional Resume Templates</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose from our collection of professionally designed templates to create your perfect resume. Each template is fully customizable to fit your personal style.
          </p>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground py-12">Loading templates...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => {
              const builderUrl = resumeId ? `/?template=${template.id}&resumeId=${resumeId}` : `/?template=${template.id}`;
              const color = TEMPLATE_COLORS[template.id] ?? 'bg-gray-500';
              return (
                <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <div className={`${color} h-12`}></div>
                    {template.hasLatex && (
                      <Badge variant="secondary" className="absolute top-2 right-2 text-xs">
                        LaTeX
                      </Badge>
                    )}
                  </div>
                  <div className="p-2">
                    <div className="bg-white p-4 space-y-1">
                      <div className="w-full h-3 bg-gray-200 rounded"></div>
                      <div className="w-3/4 h-3 bg-gray-200 rounded"></div>
                      <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
                      <div className="mt-4 space-y-1">
                        <div className="w-full h-2 bg-gray-100 rounded"></div>
                        <div className="w-full h-2 bg-gray-100 rounded"></div>
                        <div className="w-3/4 h-2 bg-gray-100 rounded"></div>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-2">{template.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{template.description}</p>
                    <Link to={builderUrl}>
                      <Button className="w-full bg-resume-primary hover:bg-resume-secondary">
                        Use This Template
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Templates;
