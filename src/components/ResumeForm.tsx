
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  PlusCircle, Trash2, BriefcaseIcon, GraduationCapIcon,
  User, FolderIcon, TrophyIcon, Mail, Phone, MapPin,
  Linkedin, Github, ChevronDown, ChevronUp, Sparkles,
  Zap, Tag,
} from 'lucide-react';

/* ─── types ─────────────────────────────────────────────────────── */
interface ResumeFormProps {
  onUpdateResume: (data: any) => void;
  initialData?: any;
}

/* ─── helpers ────────────────────────────────────────────────────── */
const defaultResumeData = {
  personalInfo: { name: '', title: '', email: '', phone: '', location: '', summary: '', linkedin: '', github: '' },
  experience:   [{ id: '1', title: '', company: '', location: '', startDate: '', endDate: '', description: '' }],
  education:    [{ id: '1', degree: '', school: '', location: '', startDate: '', endDate: '', description: '' }],
  skills:       [{ id: '1', name: '', level: '' }],
  projects:     [{ id: '1', name: '', description: '', technologies: '', startDate: '', endDate: '', url: '' }],
  achievements: [{ id: '1', name: '', description: '', technologies: '', url: '' }],
};

const TABS = [
  { id: 'personal',     label: 'Personal',     Icon: User },
  { id: 'experience',   label: 'Experience',   Icon: BriefcaseIcon },
  { id: 'education',    label: 'Education',    Icon: GraduationCapIcon },
  { id: 'skills',       label: 'Skills',       Icon: Zap },
  { id: 'projects',     label: 'Projects',     Icon: FolderIcon },
  { id: 'achievements', label: 'Awards',       Icon: TrophyIcon },
];

const COMMON_SKILL_CATS = [
  { name: 'Languages',    items: 'Python, JavaScript, TypeScript, Go, Java' },
  { name: 'Frameworks',   items: 'React, Node.js, FastAPI, Spring Boot' },
  { name: 'Tools',        items: 'Git, Docker, Kubernetes, AWS' },
  { name: 'Databases',    items: 'PostgreSQL, MongoDB, Redis, MySQL' },
];

function countFilled(obj: Record<string, string>) {
  return Object.values(obj).filter((v) => v && v.trim()).length;
}

/* ─── sub-components ─────────────────────────────────────────────── */

// Floating label input with optional leading icon
const Field: React.FC<{
  label: string;
  icon?: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
  cols?: number;
}> = ({ label, icon, required, children, hint, cols = 1 }) => (
  <div className={`space-y-1.5 ${cols === 2 ? 'md:col-span-2' : ''}`}>
    <Label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
      {icon && <span className="text-slate-400">{icon}</span>}
      {label}
      {required && <span className="text-rose-400 ml-0.5">*</span>}
    </Label>
    {children}
    {hint && <p className="text-[11px] text-slate-400 leading-tight">{hint}</p>}
  </div>
);

// Collapsible card for repeating items (experience / education / projects / achievements)
const ItemCard: React.FC<{
  heading: string;
  subheading?: string;
  onRemove?: () => void;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ heading, subheading, onRemove, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Card header */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer select-none hover:bg-slate-50 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{heading || <span className="text-slate-400 italic font-normal">Untitled</span>}</p>
          {subheading && <p className="text-xs text-slate-400 truncate mt-0.5">{subheading}</p>}
        </div>
        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
          {onRemove && (
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
              title="Remove"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
          <button className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
            {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

// Section completion badge
const CompletionDot: React.FC<{ filled: boolean }> = ({ filled }) => (
  <span
    className="inline-block w-1.5 h-1.5 rounded-full ml-1 mb-0.5"
    style={{ backgroundColor: filled ? '#22c55e' : '#d1d5db' }}
  />
);

/* ─── main component ─────────────────────────────────────────────── */
const ResumeForm: React.FC<ResumeFormProps> = ({ onUpdateResume, initialData }) => {
  const [activeTab, setActiveTab] = useState('personal');
  const [resumeData, setResumeData] = useState(() => {
    const d = initialData || defaultResumeData;
    if (!d.achievements) d.achievements = [{ id: '1', name: '', description: '', technologies: '', url: '' }];
    return d;
  });

  useEffect(() => {
    if (initialData) {
      const d = { ...initialData };
      if (!d.achievements) d.achievements = [{ id: '1', name: '', description: '', technologies: '', url: '' }];
      setResumeData(d);
    }
  }, [initialData]);

  /* generic update helper */
  const update = (next: any) => { setResumeData(next); onUpdateResume(next); };

  const setPersonal = (name: string, value: string) => {
    const next = { ...resumeData, personalInfo: { ...resumeData.personalInfo, [name]: value } };
    update(next);
  };

  const setArrayItem = (
    arr: 'experience' | 'education' | 'skills' | 'projects' | 'achievements',
    index: number,
    field: string,
    value: string,
  ) => {
    const items = [...resumeData[arr]];
    items[index] = { ...items[index], [field]: value };
    update({ ...resumeData, [arr]: items });
  };

  const addItem = (arr: 'experience' | 'education' | 'skills' | 'projects' | 'achievements', blank: object) => {
    update({ ...resumeData, [arr]: [...resumeData[arr], { id: `${arr}-${Date.now()}`, ...blank }] });
  };

  const removeItem = (arr: 'experience' | 'education' | 'skills' | 'projects' | 'achievements', index: number) => {
    if (resumeData[arr].length === 1) return;
    update({ ...resumeData, [arr]: resumeData[arr].filter((_: any, i: number) => i !== index) });
  };

  /* completion indicators */
  const pi = resumeData.personalInfo;
  const sectionFilled: Record<string, boolean> = {
    personal:     !!(pi.name && pi.email),
    experience:   resumeData.experience.some((e: any) => e.title || e.company),
    education:    resumeData.education.some((e: any) => e.school || e.degree),
    skills:       resumeData.skills.some((s: any) => s.name),
    projects:     resumeData.projects.some((p: any) => p.name),
    achievements: resumeData.achievements.some((a: any) => a.name),
  };

  /* overall progress */
  const filledCount = Object.values(sectionFilled).filter(Boolean).length;
  const progress = Math.round((filledCount / TABS.length) * 100);

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-indigo-100">
            <Sparkles className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-sm leading-none">Resume Details</h2>
            <p className="text-xs text-slate-400 mt-0.5">{filledCount} of {TABS.length} sections complete</p>
          </div>
          <div className="ml-auto text-xs font-semibold text-indigo-600">{progress}%</div>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}
          />
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="flex gap-0.5 px-3 pt-3 pb-0 overflow-x-auto scrollbar-hide">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          const filled = sectionFilled[tab.id];
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-medium whitespace-nowrap transition-all"
              style={
                active
                  ? { backgroundColor: '#fff', borderBottom: '2px solid #6366f1', color: '#6366f1', boxShadow: '0 -1px 4px rgba(0,0,0,0.06)' }
                  : { color: '#94a3b8', borderBottom: '2px solid transparent' }
              }
            >
              <tab.Icon className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{tab.label}</span>
              <CompletionDot filled={filled} />
            </button>
          );
        })}
      </div>

      {/* ── Tab content ── */}
      <div className="px-5 py-5 bg-slate-50/50">

        {/* ════ PERSONAL ════ */}
        {activeTab === 'personal' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Full Name" required icon={<User className="h-3.5 w-3.5" />}>
                <Input
                  name="name"
                  placeholder="e.g. Riya Sharma"
                  value={pi.name}
                  onChange={(e) => setPersonal('name', e.target.value)}
                  className="bg-white"
                />
              </Field>
              <Field label="Professional Title" icon={<Tag className="h-3.5 w-3.5" />} hint="Shows below your name on the resume">
                <Input
                  name="title"
                  placeholder="e.g. Senior Software Engineer"
                  value={pi.title}
                  onChange={(e) => setPersonal('title', e.target.value)}
                  className="bg-white"
                />
              </Field>
              <Field label="Email" required icon={<Mail className="h-3.5 w-3.5" />}>
                <Input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={pi.email}
                  onChange={(e) => setPersonal('email', e.target.value)}
                  className="bg-white"
                />
              </Field>
              <Field label="Phone" icon={<Phone className="h-3.5 w-3.5" />}>
                <Input
                  name="phone"
                  placeholder="+91 98765 43210"
                  value={pi.phone}
                  onChange={(e) => setPersonal('phone', e.target.value)}
                  className="bg-white"
                />
              </Field>
              <Field label="Location" icon={<MapPin className="h-3.5 w-3.5" />} cols={2} hint="City, State or City, Country">
                <Input
                  name="location"
                  placeholder="e.g. Mumbai, India"
                  value={pi.location}
                  onChange={(e) => setPersonal('location', e.target.value)}
                  className="bg-white"
                />
              </Field>
              <Field label="LinkedIn Username" icon={<Linkedin className="h-3.5 w-3.5" />} hint="linkedin.com/in/your-username">
                <Input
                  name="linkedin"
                  placeholder="your-username"
                  value={pi.linkedin ?? ''}
                  onChange={(e) => setPersonal('linkedin', e.target.value)}
                  className="bg-white"
                />
              </Field>
              <Field label="GitHub Username" icon={<Github className="h-3.5 w-3.5" />} hint="github.com/your-username">
                <Input
                  name="github"
                  placeholder="your-username"
                  value={pi.github ?? ''}
                  onChange={(e) => setPersonal('github', e.target.value)}
                  className="bg-white"
                />
              </Field>
            </div>
            {/* Summary */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-slate-600">Professional Summary</Label>
                <span className="text-[11px] text-slate-400">{(pi.summary || '').length} chars</span>
              </div>
              <Textarea
                name="summary"
                placeholder="Write 2–3 sentences: who you are, your strongest skills, and what value you bring. e.g. 'Results-driven full-stack engineer with 5+ years building scalable SaaS products…'"
                rows={4}
                value={pi.summary}
                onChange={(e) => setPersonal('summary', e.target.value)}
                className="bg-white resize-none text-sm"
              />
              <p className="text-[11px] text-slate-400">Tip: Start with your title, mention 2 key skills, and end with a goal. AI can generate this for you below.</p>
            </div>
          </div>
        )}

        {/* ════ EXPERIENCE ════ */}
        {activeTab === 'experience' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 mb-1">List your most recent role first. Use bullet points in descriptions for best results.</p>
            {resumeData.experience.map((exp: any, i: number) => (
              <ItemCard
                key={exp.id}
                heading={exp.title || exp.company || `Experience ${i + 1}`}
                subheading={exp.company && exp.title ? `${exp.company}${exp.startDate ? ' · ' + exp.startDate : ''}` : undefined}
                onRemove={resumeData.experience.length > 1 ? () => removeItem('experience', i) : undefined}
                defaultOpen={i === 0}
              >
                <Field label="Job Title" required>
                  <Input placeholder="Software Engineer" value={exp.title} onChange={(e) => setArrayItem('experience', i, 'title', e.target.value)} className="bg-white" />
                </Field>
                <Field label="Company">
                  <Input placeholder="Google, Inc." value={exp.company} onChange={(e) => setArrayItem('experience', i, 'company', e.target.value)} className="bg-white" />
                </Field>
                <Field label="Location">
                  <Input placeholder="Bangalore, India" value={exp.location} onChange={(e) => setArrayItem('experience', i, 'location', e.target.value)} className="bg-white" />
                </Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Start Date">
                    <Input placeholder="Jan 2022" value={exp.startDate} onChange={(e) => setArrayItem('experience', i, 'startDate', e.target.value)} className="bg-white" />
                  </Field>
                  <Field label="End Date">
                    <Input placeholder="Present" value={exp.endDate} onChange={(e) => setArrayItem('experience', i, 'endDate', e.target.value)} className="bg-white" />
                  </Field>
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-slate-600">Key Responsibilities & Achievements</Label>
                    <span className="text-[11px] text-slate-400">{(exp.description || '').length} chars</span>
                  </div>
                  <Textarea
                    placeholder={"• Led migration of monolith to microservices, reducing p99 latency by 40%\n• Built CI/CD pipeline cutting deploy time from 30 min to 4 min\n• Mentored 3 junior engineers and conducted weekly code reviews"}
                    rows={4}
                    value={exp.description}
                    onChange={(e) => setArrayItem('experience', i, 'description', e.target.value)}
                    className="bg-white resize-none text-sm"
                  />
                  <p className="text-[11px] text-slate-400">Use one bullet per line. Start each with an action verb and include a metric where possible.</p>
                </div>
              </ItemCard>
            ))}
            <button
              onClick={() => addItem('experience', { title: '', company: '', location: '', startDate: '', endDate: '', description: '' })}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 text-sm font-medium hover:border-indigo-300 hover:text-indigo-500 transition-colors"
            >
              <PlusCircle className="h-4 w-4" /> Add Experience
            </button>
          </div>
        )}

        {/* ════ EDUCATION ════ */}
        {activeTab === 'education' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 mb-1">Include GPA if 3.5+, relevant coursework, honours, or activities.</p>
            {resumeData.education.map((edu: any, i: number) => (
              <ItemCard
                key={edu.id}
                heading={edu.school || `Education ${i + 1}`}
                subheading={edu.degree || undefined}
                onRemove={resumeData.education.length > 1 ? () => removeItem('education', i) : undefined}
                defaultOpen={i === 0}
              >
                <Field label="Degree / Qualification" required>
                  <Input placeholder="B.Tech in Computer Science" value={edu.degree} onChange={(e) => setArrayItem('education', i, 'degree', e.target.value)} className="bg-white" />
                </Field>
                <Field label="School / University">
                  <Input placeholder="IIT Bombay" value={edu.school} onChange={(e) => setArrayItem('education', i, 'school', e.target.value)} className="bg-white" />
                </Field>
                <Field label="Location">
                  <Input placeholder="Mumbai, India" value={edu.location} onChange={(e) => setArrayItem('education', i, 'location', e.target.value)} className="bg-white" />
                </Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Start Date">
                    <Input placeholder="Aug 2018" value={edu.startDate} onChange={(e) => setArrayItem('education', i, 'startDate', e.target.value)} className="bg-white" />
                  </Field>
                  <Field label="End Date">
                    <Input placeholder="May 2022" value={edu.endDate} onChange={(e) => setArrayItem('education', i, 'endDate', e.target.value)} className="bg-white" />
                  </Field>
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-600">Additional Details</Label>
                  <Textarea
                    placeholder="GPA: 9.1/10 · Dean's List · Relevant coursework: Algorithms, Distributed Systems, ML"
                    rows={2}
                    value={edu.description}
                    onChange={(e) => setArrayItem('education', i, 'description', e.target.value)}
                    className="bg-white resize-none text-sm"
                  />
                </div>
              </ItemCard>
            ))}
            <button
              onClick={() => addItem('education', { degree: '', school: '', location: '', startDate: '', endDate: '', description: '' })}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 text-sm font-medium hover:border-indigo-300 hover:text-indigo-500 transition-colors"
            >
              <PlusCircle className="h-4 w-4" /> Add Education
            </button>
          </div>
        )}

        {/* ════ SKILLS ════ */}
        {activeTab === 'skills' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">Organise skills by category. Comma-separate items — they'll appear as tags in your resume.</p>
            {/* Quick-add chips */}
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Quick add a category</p>
              <div className="flex flex-wrap gap-2">
                {COMMON_SKILL_CATS.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => addItem('skills', { name: cat.name, level: cat.items })}
                    className="px-2.5 py-1 rounded-full border border-slate-200 text-xs text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    + {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              {resumeData.skills.map((skill: any, i: number) => (
                <div key={skill.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="flex gap-2 items-start">
                    <div className="flex-1 space-y-2">
                      <Field label="Category Name" icon={<Tag className="h-3.5 w-3.5" />}>
                        <Input
                          placeholder="e.g. Programming Languages"
                          value={skill.name}
                          onChange={(e) => setArrayItem('skills', i, 'name', e.target.value)}
                          className="bg-slate-50"
                        />
                      </Field>
                      <Field label="Skills (comma-separated)" hint="e.g. Python, JavaScript, TypeScript, Go">
                        <Input
                          placeholder="Python, JavaScript, TypeScript, Go"
                          value={skill.level}
                          onChange={(e) => setArrayItem('skills', i, 'level', e.target.value)}
                          className="bg-slate-50"
                        />
                      </Field>
                      {/* Live tag preview */}
                      {skill.level && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {skill.level.split(',').map((s: string, j: number) => s.trim() && (
                            <span key={j} className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {s.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {resumeData.skills.length > 1 && (
                      <button
                        onClick={() => removeItem('skills', i)}
                        className="mt-5 p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => addItem('skills', { name: '', level: '' })}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 text-sm font-medium hover:border-indigo-300 hover:text-indigo-500 transition-colors"
            >
              <PlusCircle className="h-4 w-4" /> Add Skill Category
            </button>
          </div>
        )}

        {/* ════ PROJECTS ════ */}
        {activeTab === 'projects' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 mb-1">Include side projects, open source contributions, or notable academic work.</p>
            {resumeData.projects.map((proj: any, i: number) => (
              <ItemCard
                key={proj.id}
                heading={proj.name || `Project ${i + 1}`}
                subheading={proj.technologies || undefined}
                onRemove={resumeData.projects.length > 1 ? () => removeItem('projects', i) : undefined}
                defaultOpen={i === 0}
              >
                <Field label="Project Name" required>
                  <Input placeholder="SmartResumeGenie" value={proj.name} onChange={(e) => setArrayItem('projects', i, 'name', e.target.value)} className="bg-white" />
                </Field>
                <Field label="Project URL" hint="GitHub, deployed link, etc.">
                  <Input placeholder="https://github.com/you/project" value={proj.url} onChange={(e) => setArrayItem('projects', i, 'url', e.target.value)} className="bg-white" />
                </Field>
                <Field label="Technologies Used" cols={2} hint="e.g. React, Spring Boot, MongoDB">
                  <Input placeholder="React, Spring Boot, MongoDB" value={proj.technologies} onChange={(e) => setArrayItem('projects', i, 'technologies', e.target.value)} className="bg-white" />
                </Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Start Date">
                    <Input placeholder="Jan 2024" value={proj.startDate} onChange={(e) => setArrayItem('projects', i, 'startDate', e.target.value)} className="bg-white" />
                  </Field>
                  <Field label="End Date">
                    <Input placeholder="Present" value={proj.endDate} onChange={(e) => setArrayItem('projects', i, 'endDate', e.target.value)} className="bg-white" />
                  </Field>
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-slate-600">Description</Label>
                    <span className="text-[11px] text-slate-400">{(proj.description || '').length} chars</span>
                  </div>
                  <Textarea
                    placeholder={"• Built an AI-powered resume builder used by 500+ users\n• Implemented LaTeX-to-HTML converter with 95% accuracy\n• Deployed on AWS with auto-scaling, handling 1k req/day"}
                    rows={3}
                    value={proj.description}
                    onChange={(e) => setArrayItem('projects', i, 'description', e.target.value)}
                    className="bg-white resize-none text-sm"
                  />
                </div>
              </ItemCard>
            ))}
            <button
              onClick={() => addItem('projects', { name: '', description: '', technologies: '', startDate: '', endDate: '', url: '' })}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 text-sm font-medium hover:border-indigo-300 hover:text-indigo-500 transition-colors"
            >
              <PlusCircle className="h-4 w-4" /> Add Project
            </button>
          </div>
        )}

        {/* ════ ACHIEVEMENTS ════ */}
        {activeTab === 'achievements' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 mb-1">Awards, scholarships, hackathon wins, certifications, publications, or press mentions.</p>
            {resumeData.achievements.map((ach: any, i: number) => (
              <ItemCard
                key={ach.id}
                heading={ach.name || `Achievement ${i + 1}`}
                subheading={ach.technologies || undefined}
                onRemove={resumeData.achievements.length > 1 ? () => removeItem('achievements', i) : undefined}
                defaultOpen={i === 0}
              >
                <Field label="Title / Award Name" required>
                  <Input placeholder="1st Place · Smart India Hackathon 2024" value={ach.name} onChange={(e) => setArrayItem('achievements', i, 'name', e.target.value)} className="bg-white" />
                </Field>
                <Field label="Link / URL" hint="Certificate link, article, or proof">
                  <Input placeholder="https://credential.net/..." value={ach.url} onChange={(e) => setArrayItem('achievements', i, 'url', e.target.value)} className="bg-white" />
                </Field>
                <Field label="Technologies / Tags" hint="Optional — e.g. Python, ML, Computer Vision">
                  <Input placeholder="Python, ML, Computer Vision" value={ach.technologies} onChange={(e) => setArrayItem('achievements', i, 'technologies', e.target.value)} className="bg-white" />
                </Field>
                <div className="md:col-span-2 space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-600">Description</Label>
                  <Textarea
                    placeholder="Brief context: what was the competition / award, what did you build or achieve, and what was the outcome?"
                    rows={2}
                    value={ach.description}
                    onChange={(e) => setArrayItem('achievements', i, 'description', e.target.value)}
                    className="bg-white resize-none text-sm"
                  />
                </div>
              </ItemCard>
            ))}
            <button
              onClick={() => addItem('achievements', { name: '', description: '', technologies: '', url: '' })}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 text-sm font-medium hover:border-indigo-300 hover:text-indigo-500 transition-colors"
            >
              <PlusCircle className="h-4 w-4" /> Add Achievement
            </button>
          </div>
        )}

      </div>

      {/* ── Tab navigation footer ── */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-white">
        <button
          onClick={() => {
            const idx = TABS.findIndex((t) => t.id === activeTab);
            if (idx > 0) setActiveTab(TABS[idx - 1].id);
          }}
          disabled={activeTab === TABS[0].id}
          className="text-xs font-medium text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ← Previous
        </button>
        <span className="text-[11px] text-slate-400">
          {TABS.findIndex((t) => t.id === activeTab) + 1} / {TABS.length}
        </span>
        <button
          onClick={() => {
            const idx = TABS.findIndex((t) => t.id === activeTab);
            if (idx < TABS.length - 1) setActiveTab(TABS[idx + 1].id);
          }}
          disabled={activeTab === TABS[TABS.length - 1].id}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default ResumeForm;
