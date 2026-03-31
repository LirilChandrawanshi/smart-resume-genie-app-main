'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';
import { LayoutDashboard, Users, FileText, ArrowLeft } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const linkClass = (active: boolean) =>
  `flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
    active ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
  }`;

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="container mx-auto py-4 px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to app
              </Button>
            </Link>
            <span className="text-muted-foreground">|</span>
            <nav className="flex items-center gap-1">
              <Link href="/admin" className={linkClass(pathname === '/admin')}>
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link href="/admin/users" className={linkClass(pathname.startsWith('/admin/users'))}>
                <Users className="h-4 w-4" />
                Users
              </Link>
              <Link href="/admin/resumes" className={linkClass(pathname.startsWith('/admin/resumes'))}>
                <FileText className="h-4 w-4" />
                Resumes
              </Link>
            </nav>
          </div>
          <h1 className="text-lg font-semibold text-muted-foreground">Admin</h1>
        </div>
      </header>
      <main className="flex-1 container mx-auto py-6 px-4 md:px-6">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
