import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Sparkles,
  FileText,
  LayoutTemplate,
  Target,
  ArrowRight,
  Heart,
  Code2,
  Zap,
} from 'lucide-react';

const highlights = [
  {
    icon: LayoutTemplate,
    title: 'Templates that fit',
    description: 'Multiple layouts so you can match your industry and personality without starting from scratch.',
  },
  {
    icon: Sparkles,
    title: 'AI-assisted polish',
    description: 'Suggestions for summaries, skills, and experience copy so your resume reads sharper and clearer.',
  },
  {
    icon: FileText,
    title: 'Export-ready output',
    description: 'Download a clean PDF that fits on one page and looks professional on any screen.',
  },
  {
    icon: Zap,
    title: 'Fast workflow',
    description: 'Edit in the browser, preview live, and save your work when you sign in—no desktop software required.',
  },
];

const values = [
  {
    icon: Target,
    title: 'Clarity first',
    text: 'We focus on structure and readability so recruiters see what matters in seconds.',
  },
  {
    icon: Heart,
    title: 'Access for everyone',
    text: 'Strong tools should not be locked behind complexity. ResumeGenie stays approachable.',
  },
  {
    icon: Code2,
    title: 'Built with care',
    text: 'Modern web tech, thoughtful UX, and steady improvements driven by real job seekers.',
  },
];

const About = () => {
  return (
    <Layout>
      <div className="relative overflow-hidden">
        {/* Hero */}
        <section className="relative border-b bg-gradient-to-b from-resume-accent/40 via-background to-background dark:from-resume-dark/30 dark:via-background">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.15),transparent)]" />
          <div className="container relative mx-auto px-4 py-16 md:py-24">
            <div className="mx-auto max-w-3xl text-center animate-fade-in">
              <Badge variant="secondary" className="mb-4 border-resume-primary/20 bg-resume-primary/10 text-resume-primary dark:bg-resume-primary/20">
                About ResumeGenie
              </Badge>
              <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                Resumes that open doors
              </h1>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
                The smart way to build a professional resume—templates, live preview, and AI hints so you can
                apply with confidence.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="bg-resume-primary hover:bg-resume-secondary">
                  <Link to="/">
                    Start building
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/templates">Browse templates</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Feature grid */}
        <section className="container mx-auto px-4 py-16 md:py-20">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">What you get</h2>
            <p className="mt-3 text-muted-foreground">
              Everything in one place—from first draft to a PDF you are proud to send.
            </p>
          </div>
          <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map(({ icon: Icon, title, description }) => (
              <Card
                key={title}
                className="group border-border/60 bg-card/50 transition-shadow hover:shadow-md dark:bg-card/30"
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-resume-primary/10 text-resume-primary transition-colors group-hover:bg-resume-primary/15">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="mb-2 font-semibold">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Story + founder */}
        <section className="border-y bg-muted/30 py-16 dark:bg-muted/10 md:py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-6 text-2xl font-semibold tracking-tight md:text-3xl">Our story</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  ResumeGenie started with a simple mission: help people create professional, memorable resumes without
                  fighting clunky tools. Founded in 2025 by{' '}
                  <span className="font-medium text-foreground">Liril Chandrawanshi</span>, the platform pairs intuitive
                  design with helpful AI so building a resume feels straightforward—not overwhelming.
                </p>
                <p>
                  Job hunting is hard enough. Your resume should work for you: clear sections, strong wording, and a
                  layout that reads well on paper and on screen. That is the experience we keep refining.
                </p>
              </div>
            </div>

            <Card className="mx-auto mt-14 max-w-4xl overflow-hidden border-border/80 shadow-lg">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-[minmax(0,280px)_1fr]">
                  <div className="relative flex flex-col items-center justify-center bg-gradient-to-br from-resume-primary/10 via-resume-accent/30 to-background p-10 dark:from-resume-primary/20 dark:via-resume-dark/40">
                    <div className="relative">
                      <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-resume-primary to-resume-secondary opacity-60 blur-sm" />
                      <div className="relative h-44 w-44 overflow-hidden rounded-full border-4 border-background shadow-xl ring-2 ring-resume-primary/20">
                        <img
                          src="https://storage.googleapis.com/univest-applications.appspot.com/pn_images/1770446184620_Picsart_23-10-14_17-19-08-104.webp"
                          alt="Liril Chandrawanshi"
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </div>
                    <p className="mt-6 text-center text-sm font-medium text-muted-foreground">Founder &amp; lead developer</p>
                  </div>
                  <div className="p-8 md:p-10">
                    <h3 className="text-2xl font-bold tracking-tight">Liril Chandrawanshi</h3>
                    <p className="mt-1 text-resume-primary dark:text-resume-secondary">Building tools that empower job seekers</p>
                    <Separator className="my-6" />
                    <div className="space-y-4 text-muted-foreground leading-relaxed">
                      <p>
                        Liril is a full-stack developer focused on React, Spring Boot, and practical uses of AI. He
                        cares about UX detail and performance so the product feels fast and trustworthy.
                      </p>
                      <p>
                        Away from the keyboard, he enjoys hiking, science fiction, and open source. The goal is simple:
                        make technology more accessible and help people present their best professional selves.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Mission & values */}
        <section className="container mx-auto px-4 py-16 md:py-20">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight md:text-3xl">Our mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                Everyone deserves tools that help them tell their career story clearly. We want to level the playing
                field with accessible, high-quality resume building—backed by modern tech and shaped by feedback from
                real users.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                ResumeGenie will keep evolving with hiring trends and your input, so staying interview-ready stays within
                reach.
              </p>
            </div>
            <div className="space-y-4">
              {values.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="flex gap-4 rounded-xl border border-border/60 bg-card/50 p-5 dark:bg-card/30"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="border-t bg-muted/20 py-14 dark:bg-muted/10">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-xl font-semibold md:text-2xl">Ready to upgrade your resume?</h2>
            <p className="mx-auto mt-2 max-w-lg text-muted-foreground">
              Jump into the builder, pick a template, and see your updates in real time.
            </p>
            <Button asChild size="lg" className="mt-6 bg-resume-primary hover:bg-resume-secondary">
              <Link to="/">
                Get started free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default About;
