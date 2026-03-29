# Smart Resume Genie — Project Context

> This file is the single source of truth for any AI tool working on this project.
> Read this before making any changes.

---

## What This App Does

Smart Resume Genie is a full-stack resume builder SaaS with:

- **Resume builder** — form-based editor with real-time side-by-side preview
- **ATS optimization** — scores resumes 0–100 and gives AI-powered suggestions to beat Applicant Tracking Systems
- **LaTeX PDF export** — professional PDFs compiled server-side via `pdflatex`, with a client-side html2canvas fallback
- **Template system** — auto-discovers any `.tex` file added to the templates folder (no code changes needed)
- **User auth** — JWT-based login/signup with role-based access (ROLE_USER, ROLE_ADMIN)
- **Admin dashboard** — stats, user management, resume management
- **Freemium pricing page** — UI exists (Free / Pro $9.99 / Enterprise $19.99), but payment is NOT wired up yet

---

## Tech Stack

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | React 18.3.1 + TypeScript |
| Build tool | Vite 5.4.1 |
| Routing | React Router DOM 6.26.2 |
| Server state | TanStack React Query 5.56.2 |
| Styling | Tailwind CSS 3.4.11 |
| Component library | shadcn/ui (48+ components, Radix UI based) |
| Icons | Lucide React |
| Forms | React Hook Form 7.53.0 + Zod 3.23.8 |
| PDF (client-side) | jsPDF 3.0.1 + html2canvas 1.4.1 |
| Charts | Recharts 2.12.7 |
| AI | OpenAI SDK 6.16.0 (calls Hugging Face Router API) |
| Notifications | Sonner (toasts) |
| Theming | next-themes (dark mode) |
| Deployment | Vercel (`vercel.json` configured) |

### Backend
| Layer | Technology |
|-------|-----------|
| Framework | Spring Boot 3.2.0 |
| Language | Java 17 |
| Database | MongoDB (Spring Data MongoDB) |
| Auth | JWT via jjwt 0.11.5 |
| Security | Spring Security (role-based) |
| Build | Maven |
| PDF (server-side) | `pdflatex` subprocess |
| Deployment | Render (`render.yaml`) + Docker (multi-stage) |

---

## Project Structure

```
smart-resume-genie-app-main/
├── src/                              # React frontend
│   ├── pages/
│   │   ├── Index.tsx                 # Main builder page (form + preview + ATS)
│   │   ├── Templates.tsx             # Template gallery
│   │   ├── Pricing.tsx               # Pricing page (UI only, no payment)
│   │   ├── About.tsx                 # About page
│   │   ├── NotFound.tsx
│   │   └── admin/
│   │       ├── AdminDashboard.tsx    # Stats & charts
│   │       ├── AdminUsers.tsx        # User management table
│   │       └── AdminResumes.tsx      # Resume management table
│   ├── components/
│   │   ├── ResumeForm.tsx            # Multi-section form (personal, experience, education, skills, projects, achievements)
│   │   ├── ResumePreview.tsx         # Live preview panel
│   │   ├── AiSuggestions.tsx         # ATS score display + suggestion cards
│   │   ├── DownloadOptions.tsx       # PDF download (server + client fallback)
│   │   ├── TemplateSelector.tsx      # Template picker with LaTeX badge
│   │   ├── LoginDialog.tsx           # Auth modal
│   │   ├── AdminGuard.tsx            # Protected route wrapper
│   │   ├── AdminLayout.tsx           # Admin sidebar layout
│   │   ├── Layout.tsx                # Main app layout
│   │   └── ui/                       # 48+ shadcn/ui components
│   ├── contexts/
│   │   └── AuthContext.tsx           # Auth state (user, token, login, logout)
│   ├── lib/
│   │   ├── api.ts                    # All API calls (auth, resumes, templates, PDFs, admin)
│   │   ├── atsSuggestions.ts         # ATS engine — 740 lines (scoring + suggestions)
│   │   └── utils.ts
│   ├── hooks/
│   │   └── use-mobile.ts
│   └── App.tsx                       # Routes definition
│
├── spring-boot-backend/
│   └── src/main/java/com/resumebuilder/
│       ├── ResumeBuilderApplication.java
│       ├── controller/
│       │   ├── AuthController.java         # POST /api/auth/signin, /signup, /seed-admin
│       │   ├── ResumeController.java       # GET/POST/PUT/DELETE /api/resumes
│       │   ├── TemplateController.java     # GET /api/templates
│       │   ├── PdfController.java          # POST /api/pdf/generate
│       │   ├── AdminController.java        # GET /api/admin/stats, /users, /resumes
│       │   └── HealthController.java       # GET /api/health (unauthenticated)
│       ├── model/
│       │   ├── Resume.java                 # Nested: PersonalInfo, Experience, Education, Skill, Project, Achievement
│       │   └── User.java                   # Roles: ROLE_USER, ROLE_ADMIN
│       ├── repository/
│       │   ├── ResumeRepository.java
│       │   └── UserRepository.java
│       ├── service/
│       │   ├── LatexTemplateService.java   # Loads .tex files, substitutes placeholders
│       │   └── LatexPdfService.java        # Runs pdflatex subprocess
│       ├── security/
│       │   ├── WebSecurityConfig.java
│       │   └── jwt/                        # JwtUtils, AuthTokenFilter, AuthEntryPointJwt
│       ├── payload/
│       │   ├── request/                    # LoginRequest, SignupRequest, AdminRolesRequest
│       │   └── response/                   # JwtResponse, MessageResponse, Admin*Response
│       └── exception/
│           └── GlobalExceptionHandler.java
│
└── spring-boot-backend/src/main/resources/
    ├── application.properties
    └── templates/latex/
        ├── jake.tex                        # Only LaTeX template currently (Jake's Resume)
        └── README.md                       # Placeholder convention docs
```

---

## Environment Variables

### Frontend (`/.env`)
```env
VITE_API_BASE_URL=http://localhost:8080/api   # Backend URL
VITE_HF_TOKEN=                               # Hugging Face token (optional — enables AI suggestions)
```

### Backend (`/spring-boot-backend/.env`)
```env
MONGODB_URI=mongodb+srv://...               # MongoDB Atlas connection string
JWT_SECRET=<64+ char random string>         # HS512 JWT signing key
CORS_ALLOWED_ORIGINS=http://localhost:5173  # Comma-separated allowed origins
```

> **Security note:** Both `.env` files are currently tracked by git. Move secrets to environment variables in your hosting provider (Vercel / Render) and add `.env` to `.gitignore`.

---

## API Endpoints Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | None | Health check |
| POST | `/api/auth/signup` | None | Register new user |
| POST | `/api/auth/signin` | None | Login, returns JWT |
| POST | `/api/auth/seed-admin` | None | Create default admin (admin123) |
| GET | `/api/resumes` | JWT | Get all resumes for current user |
| POST | `/api/resumes` | JWT | Create resume |
| PUT | `/api/resumes/{id}` | JWT | Update resume |
| DELETE | `/api/resumes/{id}` | JWT | Delete resume |
| GET | `/api/templates` | None | List all templates (auto-discovers .tex files) |
| POST | `/api/pdf/generate` | JWT | Generate PDF from LaTeX template |
| GET | `/api/admin/stats` | ADMIN | Summary stats |
| GET | `/api/admin/stats/extended` | ADMIN | Extended stats with charts |
| GET | `/api/admin/users` | ADMIN | Paginated user list |
| GET | `/api/admin/resumes` | ADMIN | Paginated resume list |
| PUT | `/api/admin/users/{id}/roles` | ADMIN | Change user roles |

---

## ATS Engine — How It Works

File: `src/lib/atsSuggestions.ts` (740 lines)

### Scoring (0–100)
Checks performed:
- Professional summary: present, 50–300 chars
- Keyword density: action verbs, technical terms
- Skills section: populated with recognizable skills
- Experience: has descriptions with action verbs
- Education: section present
- Overall formatting signals

### Suggestion Tiers (in order of priority)
1. **Dataset-based** — pattern matching against resume-ats-score-v1-en dataset (if loaded)
2. **Hugging Face API** — calls HF Router via `VITE_HF_TOKEN` for AI-generated improvements
3. **Rule-based fallback** — always available, no API needed

### ⚠️ Known Bug — Suggestion Application Gap
Suggestions are generated for: summary, skills, experience, education, format, keywords.

**Only these actually update the resume state when "Apply" is clicked:**
- Professional summary
- Skills list
- Experience bullet descriptions

**These show as "applied" in the UI but do NOT update the resume:**
- Education suggestions
- Format suggestions
- Keyword density suggestions
- Dataset-pattern suggestions

This is a UX trust issue — users think changes are saved when they are not. Documented in `docs/AI_SUGGESTIONS_FLOW.md`.

---

## LaTeX Template System

### How to Add a New Template
1. Create `spring-boot-backend/src/main/resources/templates/latex/yourname.tex`
2. Use the placeholder convention (see `templates/latex/README.md`):
   - `{{personalInfo.name}}`, `{{personalInfo.email}}`, etc.
   - `{{#experience}} ... {{/experience}}` for loops
3. Restart the backend — the template is auto-discovered. No code changes needed.

### PDF Generation Flow
```
User clicks Download PDF
    └── Has LaTeX template selected?
        ├── YES → POST /api/pdf/generate
        │           └── pdflatex installed?
        │               ├── YES → compile .tex → return PDF binary
        │               └── NO  → return JSON error → frontend fallback
        └── NO  → client-side html2canvas → jsPDF → download
```

---

## Pricing & Monetization (Current State)

The pricing page (`/pricing`) exists with these tiers:

| Plan | Price | Key Limits |
|------|-------|-----------|
| Free | $0 | 2 resumes, basic templates, PDF |
| Pro | $9.99/mo | Unlimited resumes, all templates, DOCX, no watermark, AI suggestions |
| Enterprise | $19.99/mo | Team collaboration, custom branding, API access |

**Nothing is wired up.** The buttons don't do anything. No payment provider is integrated.

---

## Known Issues & Gaps (Prioritized)

### P0 — Bugs (Breaks User Trust)
- [ ] **ATS suggestion "apply" bug** — education/format/keyword suggestions show as applied but don't modify resume data. Fix: update `AiSuggestions.tsx` to call the correct state setters for each suggestion type.

### P1 — Security
- [ ] **`.env` committed to git** — rotate all secrets and add `.env` to `.gitignore`
- [ ] **Seed admin uses hardcoded password** (`admin123`) — remove `/seed-admin` endpoint or add a one-time-use guard
- [ ] **No API rate limiting** — auth endpoints are open to brute force

### P2 — Missing Features (Needed for Monetization)
- [ ] **Payment integration** — Pricing page buttons go nowhere. Integrate Stripe or Lemon Squeezy.
- [ ] **Paywall enforcement** — No backend logic checks if a user is Free vs Pro. The plan limits (2 resumes, template access, watermark) are not enforced anywhere.
- [ ] **Watermark on Free tier** — Mentioned in pricing but not implemented in `ResumePreview.tsx` or PDF output.
- [ ] **More LaTeX templates** — Only "jake.tex" exists. Add 3–5 more (modern, minimal, academic, creative).
- [ ] **DOCX export** — Listed as Pro feature but not implemented.

### P3 — UX Improvements
- [ ] **No pagination** on admin user/resume tables — will be slow with large datasets.
- [ ] **No LinkedIn import** — users must enter everything manually.
- [ ] **Template gallery has no search/filter** — becomes unusable as templates grow.
- [ ] **No rich text editor** — experience/achievement descriptions are plain text only.
- [ ] **No resume duplication** — users can't clone an existing resume.

### P4 — Nice to Have
- [ ] **Cover letter generator** — natural upsell from resume builder.
- [ ] **Resume analytics** — track views/downloads per resume.
- [ ] **Email verification** on signup.
- [ ] **Forgot password / reset password** flow.

---

## How to Run Locally

### Prerequisites
- Node.js 18+
- Java 17+
- Maven
- MongoDB (local or Atlas)
- Optional: `pdflatex` (for LaTeX PDF compilation)

### Frontend
```sh
npm install
cp .env.example .env   # fill in VITE_API_BASE_URL
npm run dev            # http://localhost:5173
```

### Backend
```sh
cd spring-boot-backend
cp .env.example .env   # fill in MONGODB_URI and JWT_SECRET
mvn spring-boot:run    # http://localhost:8080
```

### Create Admin User
```sh
curl -X POST http://localhost:8080/api/auth/seed-admin
# Login: admin / admin123
```

---

## Deployment

| Service | Platform | Config file |
|---------|----------|-------------|
| Frontend | Vercel | `vercel.json` |
| Backend | Render | `render.yaml` |
| Backend (Docker) | Any Docker host | `spring-boot-backend/Dockerfile` |

Vercel is configured with SPA rewrites so all routes return `index.html`.

---

## Component Conventions

- Use **shadcn/ui** components from `src/components/ui/` — do not install alternative UI libraries.
- Use **Tailwind CSS** for all styling — no inline styles, no CSS modules.
- Use **Zod + React Hook Form** for any new form fields.
- Use **React Query** for any new API calls — do not use raw `useEffect` + `fetch`.
- New API functions go in `src/lib/api.ts`.
- New backend endpoints follow the existing controller pattern with `@RestController` + `@RequestMapping`.

---

## Resume Data Model

```typescript
// Frontend types (inferred from ResumeForm.tsx and api.ts)
interface Resume {
  id?: string;
  template: string;           // e.g. "default" | "jake"
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;      // Bullet points, newline-separated
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    gpa?: string;
  }>;
  skills: Array<{
    category: string;
    items: string[];
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    url?: string;
  }>;
  achievements: Array<{
    title: string;
    description: string;
  }>;
}
```

---

## What NOT to Change Without Reading First

- `src/lib/atsSuggestions.ts` — complex multi-tier scoring logic, easy to break
- `spring-boot-backend/src/main/java/.../service/LatexPdfService.java` — subprocess management, pdflatex path handling
- `spring-boot-backend/src/main/java/.../security/WebSecurityConfig.java` — changing CORS or security rules can break auth
- `src/contexts/AuthContext.tsx` — auth state flows through the entire app
