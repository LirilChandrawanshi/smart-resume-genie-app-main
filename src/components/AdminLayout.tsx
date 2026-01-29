import React from 'react';
import { NavLink, Link, Outlet } from 'react-router-dom';
import { Button } from './ui/button';
import { LayoutDashboard, Users, FileText, ArrowLeft } from 'lucide-react';

const AdminLayout: React.FC = () => {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
    }`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="container mx-auto py-4 px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to app
              </Button>
            </Link>
            <span className="text-muted-foreground">|</span>
            <nav className="flex items-center gap-1">
              <NavLink to="/admin" end className={navLinkClass}>
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </NavLink>
              <NavLink to="/admin/users" className={navLinkClass}>
                <Users className="h-4 w-4" />
                Users
              </NavLink>
              <NavLink to="/admin/resumes" className={navLinkClass}>
                <FileText className="h-4 w-4" />
                Resumes
              </NavLink>
            </nav>
          </div>
          <h1 className="text-lg font-semibold text-muted-foreground">Admin</h1>
        </div>
      </header>
      <main className="flex-1 container mx-auto py-6 px-4 md:px-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
