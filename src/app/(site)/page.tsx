import type { Metadata } from 'next';
import { Suspense } from 'react';
import { HomePage } from '@/components/home-page';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Smart Resume Genie — AI Resume Builder',
  description:
    'Build professional resumes with AI-powered ATS optimization, 6+ templates, and instant PDF export.',
};

function HomeFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<HomeFallback />}>
      <HomePage />
    </Suspense>
  );
}
