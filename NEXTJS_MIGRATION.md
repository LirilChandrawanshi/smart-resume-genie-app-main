# Smart Resume Genie — Next.js Migration Plan

## Overview

This document outlines the full plan to migrate **Smart Resume Genie** from its current stack (Vite + React 18 + React Router v6) to **Next.js 14 with the App Router**.

---

## Current Stack vs Target Stack

| Area | Current | Target |
|---|---|---|
| Framework | Vite + React 18 | Next.js 14 (App Router) |
| Routing | React Router v6 | Next.js App Router (file-based) |
| Rendering | Client-side SPA | SSR / SSG / CSR (per page) |
| Build tool | Vite | Next.js (Turbopack) |
| Entry point | `src/main.tsx` | `app/layout.tsx` |
| Env vars | `VITE_*` | `NEXT_PUBLIC_*` |
| 404 page | `pages/NotFound.tsx` | `app/not-found.tsx` |
| Route guards | `AdminGuard.tsx` component | `middleware.ts` |
| Image optimization | `<img>` tags | `next/image` |
| Font loading | CSS / Tailwind | `next/font` |

---

## Project Structure — Before vs After

### Current (`src/`)
```
src/
├── App.tsx                        # React Router setup
├── main.tsx                       # ReactDOM.createRoot entry
├── index.css                      # Global styles
├── pages/
│   ├── Index.tsx                  # /
│   ├── Templates.tsx              # /templates
│   ├── Pricing.tsx                # /pricing
│   ├── About.tsx                  # /about
│   ├── Share.tsx                  # /share
│   ├── NotFound.tsx               # 404
│   └── admin/
│       ├── AdminDashboard.tsx     # /admin
│       ├── AdminUsers.tsx         # /admin/users
│       └── AdminResumes.tsx       # /admin/resumes
├── components/
│   ├── Layout.tsx
│   ├── AdminLayout.tsx
│   ├── AdminGuard.tsx
│   ├── ResumeForm.tsx
│   ├── ResumePreview.tsx
│   ├── TemplateSelector.tsx
│   ├── DownloadOptions.tsx
│   ├── AiSuggestions.tsx
│   ├── LoginDialog.tsx
│   ├── CustomTemplateRenderer.tsx
│   ├── LatexTemplateImporter.tsx
│   ├── templates/
│   │   ├── ClassicTemplate.tsx
│   │   ├── ModernTemplate.tsx
│   │   ├── ExecutiveTemplate.tsx
│   │   ├── MinimalTemplate.tsx
│   │   ├── CreativeTemplate.tsx
│   │   ├── ProfessionalTemplate.tsx
│   │   ├── index.ts
│   │   └── types.ts
│   └── ui/                        # 52 shadcn/ui components
├── contexts/
│   └── AuthContext.tsx
├── lib/
│   ├── api.ts
│   ├── atsSuggestions.ts
│   ├── latexTemplateParser.ts
│   ├── shareResume.ts
│   ├── resumePageSize.ts
│   └── utils.ts
├── hooks/
│   ├── use-mobile.tsx
│   └── use-toast.ts
└── data/
    └── sampleResumeData.ts
```

### Target (`app/` — Next.js App Router)
```
smart-resume-genie-nextjs/
├── app/
│   ├── layout.tsx                 # Root layout (replaces main.tsx + Layout.tsx)
│   ├── page.tsx                   # / (Index)
│   ├── not-found.tsx              # 404 (replaces NotFound.tsx)
│   ├── globals.css                # Global styles (replaces index.css)
│   ├── templates/
│   │   └── page.tsx               # /templates
│   ├── pricing/
│   │   └── page.tsx               # /pricing (static)
│   ├── about/
│   │   └── page.tsx               # /about (static)
│   ├── share/
│   │   └── page.tsx               # /share
│   ├── admin/
│   │   ├── layout.tsx             # Admin layout (replaces AdminLayout.tsx)
│   │   ├── page.tsx               # /admin (dashboard)
│   │   ├── users/
│   │   │   └── page.tsx           # /admin/users
│   │   └── resumes/
│   │       └── page.tsx           # /admin/resumes
│   └── api/
│       └── pdf/
│           └── route.ts           # API route for server-side PDF
├── components/
│   ├── resume-form.tsx            # "use client"
│   ├── resume-preview.tsx         # "use client"
│   ├── template-selector.tsx      # "use client"
│   ├── download-options.tsx       # "use client"
│   ├── ai-suggestions.tsx         # "use client"
│   ├── login-dialog.tsx           # "use client"
│   ├── navbar.tsx                 # "use client" (theme toggle)
│   ├── custom-template-renderer.tsx # "use client"
│   ├── latex-template-importer.tsx  # "use client"
│   ├── providers.tsx              # QueryClient + AuthContext wrapper
│   ├── templates/
│   │   ├── classic-template.tsx
│   │   ├── modern-template.tsx
│   │   ├── executive-template.tsx
│   │   ├── minimal-template.tsx
│   │   ├── creative-template.tsx
│   │   ├── professional-template.tsx
│   │   ├── index.ts
│   │   └── types.ts
│   └── ui/                        # 52 shadcn/ui components (copy as-is)
├── contexts/
│   └── auth-context.tsx           # "use client"
├── lib/
│   ├── api.ts
│   ├── ats-suggestions.ts
│   ├── latex-template-parser.ts
│   ├── share-resume.ts
│   ├── resume-page-size.ts
│   └── utils.ts
├── hooks/
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── data/
│   └── sample-resume-data.ts
├── middleware.ts                   # Admin route protection
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Phase-by-Phase Migration

---

### Phase 1 — Initialize Next.js Project

```bash
npx create-next-app@latest smart-resume-genie-nextjs \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*"
```

#### Install all existing dependencies

```bash
npm install \
  @hookform/resolvers \
  @radix-ui/react-accordion \
  @radix-ui/react-alert-dialog \
  @radix-ui/react-aspect-ratio \
  @radix-ui/react-avatar \
  @radix-ui/react-checkbox \
  @radix-ui/react-collapsible \
  @radix-ui/react-context-menu \
  @radix-ui/react-dialog \
  @radix-ui/react-dropdown-menu \
  @radix-ui/react-hover-card \
  @radix-ui/react-label \
  @radix-ui/react-menubar \
  @radix-ui/react-navigation-menu \
  @radix-ui/react-popover \
  @radix-ui/react-progress \
  @radix-ui/react-radio-group \
  @radix-ui/react-scroll-area \
  @radix-ui/react-select \
  @radix-ui/react-separator \
  @radix-ui/react-slider \
  @radix-ui/react-slot \
  @radix-ui/react-switch \
  @radix-ui/react-tabs \
  @radix-ui/react-toast \
  @radix-ui/react-toggle \
  @radix-ui/react-toggle-group \
  @radix-ui/react-tooltip \
  @tanstack/react-query \
  class-variance-authority \
  clsx \
  cmdk \
  date-fns \
  embla-carousel-react \
  html2canvas \
  input-otp \
  jspdf \
  lucide-react \
  next-themes \
  openai \
  react-day-picker \
  react-hook-form \
  react-resizable-panels \
  recharts \
  sonner \
  tailwind-merge \
  tailwindcss-animate \
  vaul \
  zod
```

#### `next.config.ts`

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },
};

export default nextConfig;
```

#### `.env.local`

```env
# Rename from VITE_API_BASE_URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
NEXT_PUBLIC_OPENAI_API_KEY=your_key_here
```

---

### Phase 2 — Global Styles & Tailwind

Copy `src/index.css` → `app/globals.css`. Remove Vite-specific directives, keep Tailwind base/components/utilities and all CSS custom properties:

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --resume-primary: ...;
    --resume-secondary: ...;
    --resume-accent: ...;
    --resume-light: ...;
    --resume-dark: ...;
    /* all existing CSS variables */
  }
  .dark {
    /* dark mode overrides */
  }
}
```

`tailwind.config.ts` — copy existing config from `tailwind.config.js`, adding Next.js content paths:

```ts
content: [
  './app/**/*.{ts,tsx}',
  './components/**/*.{ts,tsx}',
  './lib/**/*.{ts,tsx}',
],
```

---

### Phase 3 — Root Layout

Replace `src/main.tsx` + `src/App.tsx` + `src/components/Layout.tsx` with:

#### `app/layout.tsx`

```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Navbar } from '@/components/navbar';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Smart Resume Genie',
  description: 'AI-powered resume builder with ATS optimization',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
```

#### `components/providers.tsx` — wrap all client-side providers

```tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/auth-context';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
```

#### `components/navbar.tsx`

```tsx
'use client';
// Move navbar JSX from src/components/Layout.tsx here
// Replace <Link> from react-router-dom with next/link
// Replace useNavigate with useRouter from next/navigation
```

---

### Phase 4 — Page Migration

Each page becomes an `app/.../page.tsx` file. Pages with no interactivity (Pricing, About) are Server Components by default. Pages with forms, state, or browser APIs need `'use client'`.

#### 4.1 Home Page — `app/page.tsx`

```tsx
// Copy content from src/pages/Index.tsx
// Add 'use client' (uses useState, useEffect)
// Remove react-router-dom imports (no useNavigate needed here)
```

#### 4.2 Templates Page — `app/templates/page.tsx`

```tsx
// Copy from src/pages/Templates.tsx
// Add 'use client' (template selection state)
// Remove react-router-dom Link → next/link
```

#### 4.3 Pricing Page — `app/pricing/page.tsx`

```tsx
// Copy from src/pages/Pricing.tsx
// Server Component — no 'use client' needed
// Add page metadata:
export const metadata = {
  title: 'Pricing — Smart Resume Genie',
};
// Replace Link from react-router-dom → next/link
```

#### 4.4 About Page — `app/about/page.tsx`

```tsx
// Copy from src/pages/About.tsx
// Server Component — no 'use client' needed
export const metadata = {
  title: 'About — Smart Resume Genie',
};
```

#### 4.5 Share Page — `app/share/page.tsx`

```tsx
'use client';
// Copy from src/pages/Share.tsx
// Replace useSearchParams from react-router-dom:
//   Before: const [searchParams] = useSearchParams();
//   After:  const searchParams = useSearchParams(); // from 'next/navigation'
```

#### 4.6 404 Page — `app/not-found.tsx`

```tsx
// Copy from src/pages/NotFound.tsx
// Replace useNavigate → useRouter from 'next/navigation'
// Replace <Link to="/"> → <Link href="/">
```

---

### Phase 5 — Admin Section

#### `app/admin/layout.tsx`

```tsx
// Copy from src/components/AdminLayout.tsx
// Becomes a nested layout — wraps all /admin/* pages
// Add 'use client' (uses sidebar state)
```

#### `app/admin/page.tsx` — Dashboard

```tsx
'use client';
// Copy from src/pages/admin/AdminDashboard.tsx
// Replace useNavigate → useRouter
```

#### `app/admin/users/page.tsx`

```tsx
'use client';
// Copy from src/pages/admin/AdminUsers.tsx
```

#### `app/admin/resumes/page.tsx`

```tsx
'use client';
// Copy from src/pages/admin/AdminResumes.tsx
```

---

### Phase 6 — Route Protection (Middleware)

Replace `src/components/AdminGuard.tsx` with Next.js middleware for server-side route protection.

#### `middleware.ts` (project root)

```ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const user = request.cookies.get('user')?.value;

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');

  if (isAdminRoute) {
    if (!token || !user) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    try {
      const parsedUser = JSON.parse(user);
      if (!parsedUser.roles?.includes('ROLE_ADMIN')) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
```

> **Note:** For middleware to read auth state, store the JWT token in a cookie (not just localStorage). Update `AuthContext` to set a cookie on login in addition to localStorage.

#### Updated `contexts/auth-context.tsx`

```tsx
'use client';
// Copy from src/contexts/AuthContext.tsx
// On login(), also set a cookie:
//   document.cookie = `token=${jwtResponse.token}; path=/; SameSite=Strict`;
//   document.cookie = `user=${JSON.stringify(user)}; path=/; SameSite=Strict`;
// On logout(), clear the cookies:
//   document.cookie = 'token=; Max-Age=0; path=/';
//   document.cookie = 'user=; Max-Age=0; path=/';
```

---

### Phase 7 — Components Migration

All components are copied from `src/components/` to `components/`. Most interactive ones need `'use client'`.

| Component | `'use client'` | Notes |
|---|---|---|
| `resume-form.tsx` | Yes | useState, react-hook-form |
| `resume-preview.tsx` | Yes | useState, template rendering |
| `template-selector.tsx` | Yes | useState |
| `download-options.tsx` | Yes | html2canvas, jspdf, fetch |
| `ai-suggestions.tsx` | Yes | useEffect, API calls |
| `login-dialog.tsx` | Yes | useState, form, auth |
| `custom-template-renderer.tsx` | Yes | dangerouslySetInnerHTML, state |
| `latex-template-importer.tsx` | Yes | file upload, state |
| `navbar.tsx` | Yes | theme toggle, auth state |
| `templates/*` | No | Pure render functions |

#### Import changes in all components

```tsx
// Before
import { Link, useNavigate, useLocation } from 'react-router-dom';

// After
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
```

---

### Phase 8 — Lib & Utilities

Copy the following files as-is (no changes needed):

- `lib/utils.ts` — `cn()` utility
- `lib/ats-suggestions.ts` — ATS engine
- `lib/latex-template-parser.ts` — LaTeX parser
- `lib/share-resume.ts` — Base64url encode/decode
- `lib/resume-page-size.ts` — Paper dimensions
- `data/sample-resume-data.ts` — Static sample data
- `hooks/use-mobile.tsx` — Add `'use client'`
- `hooks/use-toast.ts` — Add `'use client'`

#### `lib/api.ts` — Update env var prefix

```ts
// Before
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// After
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
```

---

### Phase 9 — API Routes (Optional Server-Side PDF)

Add a Next.js API route as a server-side PDF generation endpoint.

#### `app/api/pdf/[id]/route.ts`

```ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = request.headers.get('Authorization');
  const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const response = await fetch(`${backendUrl}/pdf/${params.id}`, {
    headers: { Authorization: token || '' },
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'PDF not found' }, { status: 404 });
  }

  const pdfBlob = await response.blob();
  return new NextResponse(pdfBlob, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="resume-${params.id}.pdf"`,
    },
  });
}
```

---

### Phase 10 — SEO & Metadata

Add `metadata` exports to all static pages for improved SEO (Next.js built-in).

```tsx
// app/page.tsx
export const metadata = {
  title: 'Smart Resume Genie — AI Resume Builder',
  description: 'Build professional resumes with AI-powered ATS optimization, 6+ templates, and instant PDF export.',
};

// app/templates/page.tsx
export const metadata = {
  title: 'Resume Templates — Smart Resume Genie',
  description: 'Choose from 6+ professional resume templates. Classic, Modern, Executive, Creative, and more.',
};

// app/pricing/page.tsx
export const metadata = {
  title: 'Pricing — Smart Resume Genie',
  description: 'Free and Pro plans for individuals, professionals, and enterprises.',
};

// app/about/page.tsx
export const metadata = {
  title: 'About — Smart Resume Genie',
  description: 'Learn about our mission to make professional resumes accessible to everyone.',
};
```

---

### Phase 11 — Image Optimization

Replace all `<img>` tags with `next/image` where the image source is known at build time.

```tsx
// Before
<img src="/logo.png" alt="Logo" width={40} height={40} />

// After
import Image from 'next/image';
<Image src="/logo.png" alt="Logo" width={40} height={40} />
```

For dynamic/user-generated images (resume previews, template thumbnails) where dimensions vary, `<img>` is acceptable.

---

### Phase 12 — `package.json` Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "backend": "cd spring-boot-backend && mvn spring-boot:run",
    "dev:full": "concurrently \"npm run dev\" \"npm run backend\""
  }
}
```

---

## Key Differences Summary

### React Router → Next.js Navigation

| React Router | Next.js Equivalent |
|---|---|
| `<Link to="/path">` | `<Link href="/path">` |
| `useNavigate()` | `useRouter()` from `next/navigation` |
| `useLocation()` | `usePathname()` from `next/navigation` |
| `useSearchParams()` | `useSearchParams()` from `next/navigation` |
| `useParams()` | `useParams()` from `next/navigation` |
| `<Navigate to="/" />` | `redirect('/')` (server) or `router.push('/')` (client) |
| `<Route path="*">` | `app/not-found.tsx` |

### Vite → Next.js Environment Variables

| Vite | Next.js |
|---|---|
| `import.meta.env.VITE_*` | `process.env.NEXT_PUBLIC_*` |
| `import.meta.env.DEV` | `process.env.NODE_ENV === 'development'` |
| `.env` / `.env.local` | `.env.local` (same file) |

### Client vs Server Components

| Component type | Directive needed | Why |
|---|---|---|
| Has `useState` / `useEffect` | `'use client'` | React hooks |
| Has browser APIs (`window`, `document`) | `'use client'` | No SSR access |
| Has event handlers (`onClick`, etc.) | `'use client'` | DOM events |
| Fetches data on server | None (default) | Server Component |
| Pure render / static UI | None (default) | Server Component |

---

## Rendering Strategy per Page

| Page | Strategy | Reason |
|---|---|---|
| `/` (Builder) | CSR (`'use client'`) | Form state, real-time preview |
| `/templates` | CSR (`'use client'`) | Template selection state |
| `/pricing` | SSG (static) | No dynamic data |
| `/about` | SSG (static) | No dynamic data |
| `/share` | CSR (`'use client'`) | URL params, decoded resume |
| `/admin` | CSR (`'use client'`) | Auth-guarded, dynamic data |
| `/admin/users` | CSR (`'use client'`) | Paginated table, mutations |
| `/admin/resumes` | CSR (`'use client'`) | Paginated table, mutations |

---

## Migration Checklist

### Setup
- [ ] Create Next.js 14 project with App Router
- [ ] Install all dependencies
- [ ] Configure `next.config.ts`
- [ ] Copy `.env.local` with `NEXT_PUBLIC_` prefix

### Styles
- [ ] Migrate `index.css` → `app/globals.css`
- [ ] Update `tailwind.config.ts` content paths
- [ ] Verify custom CSS variables work in dark mode

### Layouts
- [ ] Create `app/layout.tsx` (root layout)
- [ ] Create `components/providers.tsx` (QueryClient + AuthProvider + ThemeProvider)
- [ ] Create `components/navbar.tsx` from Layout.tsx
- [ ] Create `app/admin/layout.tsx` from AdminLayout.tsx

### Pages
- [ ] `app/page.tsx` — Home / Resume Builder
- [ ] `app/templates/page.tsx` — Templates gallery
- [ ] `app/pricing/page.tsx` — Pricing
- [ ] `app/about/page.tsx` — About
- [ ] `app/share/page.tsx` — Share
- [ ] `app/not-found.tsx` — 404
- [ ] `app/admin/page.tsx` — Admin dashboard
- [ ] `app/admin/users/page.tsx` — Admin users
- [ ] `app/admin/resumes/page.tsx` — Admin resumes

### Auth & Middleware
- [ ] Update `AuthContext` to set cookies on login/logout
- [ ] Create `middleware.ts` for admin route protection

### Components
- [ ] Add `'use client'` to all interactive components
- [ ] Replace `react-router-dom` imports with `next/link` / `next/navigation`
- [ ] Copy all `components/ui/` shadcn files as-is
- [ ] Copy all `components/templates/` files as-is

### Lib & Hooks
- [ ] Update `lib/api.ts` env var prefix
- [ ] Copy remaining lib files unchanged
- [ ] Add `'use client'` to hooks

### API Routes
- [ ] `app/api/pdf/[id]/route.ts` — optional server-side PDF proxy

### Optimization
- [ ] Replace `<img>` with `next/image` where applicable
- [ ] Add `metadata` exports to all pages
- [ ] Set up `next/font` for typography

### Final
- [ ] Run `npm run dev` and verify all routes load
- [ ] Test auth flow (login, logout, admin access)
- [ ] Test resume builder (form → preview → download)
- [ ] Test share link encode/decode
- [ ] Test admin dashboard CRUD operations
- [ ] Run `npm run build` and fix any SSR/build errors

---

## Common Migration Pitfalls

### 1. `localStorage` / `window` in Server Components
If a component accesses `localStorage` or `window` at module level, it will crash during SSR.

```tsx
// Bad — runs on server, window doesn't exist
const theme = localStorage.getItem('theme');

// Good — check for browser environment
const theme = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
// Or: mark the component 'use client' and move to useEffect
```

### 2. `useSearchParams` must be wrapped in Suspense
In Next.js 14, `useSearchParams()` on a Client Component requires a `<Suspense>` boundary.

```tsx
// app/share/page.tsx
import { Suspense } from 'react';
import { ShareContent } from '@/components/share-content';

export default function SharePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ShareContent />
    </Suspense>
  );
}
```

### 3. React Query `QueryClientProvider` must be client-side
Wrap it in a `'use client'` component (`providers.tsx`). Never put it directly in a Server Component layout.

### 4. `html2canvas` / `jsPDF` — browser-only libraries
Dynamic import them inside event handlers or `useEffect` to prevent SSR errors:

```tsx
const handleDownload = async () => {
  const html2canvas = (await import('html2canvas')).default;
  const jsPDF = (await import('jspdf')).default;
  // ...
};
```

### 5. Middleware cookie vs localStorage
Next.js middleware runs on the Edge and cannot read `localStorage`. Store auth tokens in cookies (alongside localStorage) so middleware can perform server-side route protection.

---

## Backend — No Changes Required

The Spring Boot backend (`spring-boot-backend/`) remains unchanged. Next.js frontend continues to call the same REST API endpoints at `http://localhost:8080/api`.

Only the frontend env var name changes:
- `VITE_API_BASE_URL` → `NEXT_PUBLIC_API_BASE_URL`

---

## Estimated Effort

| Phase | Effort |
|---|---|
| Setup & config | ~1 hour |
| Styles & Tailwind | ~30 min |
| Root layout & providers | ~1 hour |
| Page migrations (8 pages) | ~4 hours |
| Admin section | ~2 hours |
| Auth + middleware | ~1.5 hours |
| Component updates | ~3 hours |
| Lib / hooks / data | ~30 min |
| API routes | ~30 min |
| SEO metadata | ~30 min |
| Image optimization | ~30 min |
| Testing & bug fixes | ~3 hours |
| **Total** | **~18 hours** |
