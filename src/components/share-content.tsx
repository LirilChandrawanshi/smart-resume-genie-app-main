'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import ResumePreview from '@/components/ResumePreview';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { decodeSharePayload } from '@/lib/shareResume';
import { FileEdit, Home, Link2 } from 'lucide-react';

const SHARE_IMPORT_KEY = 'resumeBuilder_shareImport';

export function ShareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const decoded = useMemo(() => {
    const d = searchParams.get('d');
    if (!d) return null;
    return decodeSharePayload(d);
  }, [searchParams]);

  if (!decoded) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-20 text-center">
        <Card>
          <CardContent className="space-y-4 pt-8 pb-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Link2 className="h-7 w-7 text-muted-foreground" />
            </div>
            <h1 className="text-xl font-semibold">Invalid or missing share link</h1>
            <p className="text-sm text-muted-foreground">
              This link is incomplete or expired. Ask the sender to generate a new share link from Export → Share
              link.
            </p>
            <Button asChild className="bg-resume-primary hover:bg-resume-secondary">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go to builder
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data, template } = decoded;

  const handleEditInBuilder = () => {
    try {
      sessionStorage.setItem(
        SHARE_IMPORT_KEY,
        JSON.stringify({ data, template: template || 'default' })
      );
    } catch {
      /* ignore */
    }
    router.push('/');
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Shared resume</h1>
              <p className="text-sm text-muted-foreground">View-only preview.</p>
            </div>
            <div className="flex flex-wrap gap-2">
             
             
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <ResumePreview resumeData={data} selectedTemplate={template || 'default'} />
          </div>
        </div>
      </div>
  );
}
