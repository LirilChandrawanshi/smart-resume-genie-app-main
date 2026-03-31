import type { Metadata } from 'next';
import { Suspense } from 'react';
import { TemplatesGallery } from '@/components/templates-gallery';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Resume Templates — Smart Resume Genie',
  description:
    'Choose from 6+ professional resume templates. Classic, Modern, Executive, Creative, and more.',
};

function TemplatesFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <Suspense fallback={<TemplatesFallback />}>
      <TemplatesGallery />
    </Suspense>
  );
}
