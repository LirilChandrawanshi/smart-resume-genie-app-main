import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const templates = [
  {
    id: 'modern',
    name: 'Modern',
    color: 'bg-blue-500',
    description: 'Clean and contemporary design with a focus on readability and modern aesthetics.'
  },
  {
    id: 'classic',
    name: 'Classic',
    color: 'bg-gray-700',
    description: 'Traditional resume layout perfect for conventional industries and formal applications.'
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    color: 'bg-indigo-500',
    description: 'Simple and elegant design with minimal elements for a clean, distraction-free presentation.'
  },
  {
    id: 'creative',
    name: 'Creative',
    color: 'bg-purple-500',
    description: 'Unique and eye-catching design for creative professionals and modern industries.'
  },
  {
    id: 'professional',
    name: 'Professional',
    color: 'bg-green-500',
    description: 'Polished design with emphasis on experience and skills for seasoned professionals.'
  },
  {
    id: 'academic',
    name: 'Academic',
    color: 'bg-red-500',
    description: 'Structured format ideal for academic CVs, featuring publications and research experience.'
  }
];

const RESUMED_ID_STORAGE_KEY = 'resumeBuilder_currentResumeId';

const Templates = () => {
  const [searchParams] = useSearchParams();
  const resumeIdFromUrl = searchParams.get('resumeId') || '';
  const resumeIdFromStorage = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(RESUMED_ID_STORAGE_KEY) : null;
  const resumeId = resumeIdFromUrl || resumeIdFromStorage || '';

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Professional Resume Templates</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose from our collection of professionally designed templates to create your perfect resume. Each template is fully customizable to fit your personal style.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => {
            const builderUrl = resumeId ? `/?template=${template.id}&resumeId=${resumeId}` : `/?template=${template.id}`;
            return (
              <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className={`${template.color} h-12`}></div>
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
      </div>
    </Layout>
  );
};

export default Templates;
