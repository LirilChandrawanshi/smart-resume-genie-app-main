import React, { useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import ResumePreview from '@/components/ResumePreview';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { decodeSharePayload } from '@/lib/shareResume';
import { FileEdit, Home, Link2 } from 'lucide-react';

const Share = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const decoded = useMemo(() => {
    const d = searchParams.get('d');
    if (!d) return null;
    return decodeSharePayload(d);
  }, [searchParams]);

  if (!decoded) {
    return (
      <Layout>
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
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  Go to builder
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const { data, template } = decoded;

  const handleEditInBuilder = () => {
    navigate('/', {
      replace: false,
      state: { shareImport: { data, template: template || 'default' } },
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Shared resume</h1>
              <p className="text-sm text-muted-foreground">View-only preview. Open in the builder to edit or save.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleEditInBuilder} className="bg-resume-primary hover:bg-resume-secondary">
                <FileEdit className="mr-2 h-4 w-4" />
                Edit in builder
              </Button>
              <Button variant="outline" asChild>
                <Link to="/">Home</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <ResumePreview resumeData={data} selectedTemplate={template || 'default'} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Share;
