import { Navbar } from '@/components/navbar';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 md:px-6 text-center text-sm text-muted-foreground">
          <p>© 2025 ResumeGenie. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
