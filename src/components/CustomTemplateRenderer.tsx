/**
 * CustomTemplateRenderer
 *
 * A data-driven resume renderer that uses a ParsedTemplate config object
 * (produced by latexTemplateParser.ts) to faithfully reproduce the visual
 * style of any uploaded LaTeX resume template.
 *
 * No eval(), no dynamic imports — purely declarative React.
 */

import React from 'react';
import { ParsedTemplate, SectionKey } from '@/lib/latexTemplateParser';

interface ResumeData {
  personalInfo: {
    name?: string;
    title?: string;
    email?: string;
    phone?: string;
    location?: string;
    summary?: string;
    linkedin?: string;
    github?: string;
  };
  experience: Array<{
    id?: string;
    title?: string;
    company?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;
  education: Array<{
    id?: string;
    degree?: string;
    school?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;
  skills: Array<{ id?: string; name?: string; level?: string }>;
  projects: Array<{
    id?: string;
    name?: string;
    description?: string;
    technologies?: string;
    startDate?: string;
    endDate?: string;
    url?: string;
  }>;
  achievements?: Array<{
    id?: string;
    name?: string;
    description?: string;
    technologies?: string;
    url?: string;
  }>;
}

interface Props {
  resumeData: ResumeData;
  template: ParsedTemplate;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const c = (color: string) => ({ color });
const bg = (color: string) => ({ backgroundColor: color });
const border = (color: string) => ({ borderColor: color });

const SECTION_SIZE: Record<ParsedTemplate['sectionFontSize'], string> = {
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

const LETTER_SPACING: Record<ParsedTemplate['sectionLetterSpacing'], string> = {
  normal: 'tracking-normal',
  wide: 'tracking-wide',
  wider: 'tracking-wider',
  widest: 'tracking-widest',
};

// Split a description string into bullet lines
function toLines(desc: string): string[] {
  return desc
    .split(/\n|\\\\|\\newline/)
    .map((l) => l.replace(/^[\s•\-–—*]+/, '').trim())
    .filter(Boolean);
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

const SectionHeading: React.FC<{ title: string; t: ParsedTemplate }> = ({ title, t }) => {
  const display = t.sectionUppercase ? title.toUpperCase() : title;

  return (
    <div className="mb-1 mt-3">
      <h2
        className={`
          ${SECTION_SIZE[t.sectionFontSize]}
          ${t.sectionBold ? 'font-bold' : 'font-semibold'}
          ${LETTER_SPACING[t.sectionLetterSpacing]}
          leading-tight
        `}
        style={{
          color: t.accentColor,
          fontVariant: t.sectionSmallCaps ? 'small-caps' : undefined,
        }}
      >
        {display}
      </h2>
      {t.sectionUnderline && (
        <div className="w-full mt-0.5" style={{ height: '0.5px', backgroundColor: '#aaa' }} />
      )}
    </div>
  );
};

/**
 * Two-row entry header used by experience, education, and achievements.
 *
 * row1Left  → always bold (company, school, or job title depending on template)
 * row1Right → normal weight (date or location)
 * row2Left  → italic (title, degree, or company depending on template)
 * row2Right → italic (location or date depending on template)
 */
const EntryHeader: React.FC<{
  row1Left: string;
  row1Right?: string;
  row2Left?: string;
  row2Right?: string;
  t: ParsedTemplate;
}> = ({ row1Left, row1Right, row2Left, row2Right, t }) => (
  <div className="mb-1">
    {/* Row 1 */}
    <div className="flex justify-between items-baseline gap-2">
      <span className="font-bold text-sm leading-snug">{row1Left}</span>
      {row1Right && (
        <span className="text-xs font-normal whitespace-nowrap flex-shrink-0">{row1Right}</span>
      )}
    </div>
    {/* Row 2 */}
    {(row2Left || row2Right) && (
      <div className="flex justify-between items-baseline gap-2">
        {row2Left && (
          <span className={`text-xs leading-snug ${t.entrySubtitleItalic ? 'italic' : ''}`}>
            {row2Left}
          </span>
        )}
        {row2Right && (
          <span className={`text-xs flex-shrink-0 ${t.entrySubtitleItalic ? 'italic' : ''}`}>
            {row2Right}
          </span>
        )}
      </div>
    )}
  </div>
);

const BulletList: React.FC<{ lines: string[]; t: ParsedTemplate }> = ({ lines, t }) => (
  <ul className="mt-1 space-y-0.5 pl-4">
    {lines.map((line, i) => (
      <li
        key={i}
        className="text-xs leading-relaxed"
        style={{
          listStyleType: t.entryBulletStyle === 'dash' ? 'none' : 'disc',
        }}
      >
        {t.entryBulletStyle === 'dash' && (
          <span className="mr-1 select-none">–</span>
        )}
        {line}
      </li>
    ))}
  </ul>
);

// ─────────────────────────────────────────────
// Section renderers
// ─────────────────────────────────────────────

function renderSummary(resumeData: ResumeData, t: ParsedTemplate) {
  const summary = resumeData.personalInfo.summary;
  if (!summary) return null;
  return (
    <div key="summary">
      <SectionHeading title="Professional Summary" t={t} />
      <p className="text-xs leading-relaxed">{summary}</p>
    </div>
  );
}

function renderExperience(resumeData: ResumeData, t: ParsedTemplate) {
  const items = resumeData.experience.filter((e) => e.title || e.company);
  if (!items.length) return null;
  return (
    <div key="experience">
      <SectionHeading title="Experience" t={t} />
      <div className="space-y-2.5">
        {items.map((exp, i) => {
          const dateRange = exp.startDate
            ? `${exp.startDate} – ${(exp as any).current ? 'Present' : exp.endDate || 'Present'}`
            : undefined;
          const lines = exp.description ? toLines(exp.description) : [];

          // experiencePrimaryField controls which field is bold (row 1 left)
          // 'title' → job title bold, company italic (Jake original style)
          // 'company' → company bold, title italic
          const isTitle = t.experiencePrimaryField === 'title';
          return (
            <div key={exp.id || i}>
              <EntryHeader
                row1Left={isTitle ? (exp.title || '') : (exp.company || '')}
                row1Right={t.entryDatePosition === 'right' ? dateRange : undefined}
                row2Left={isTitle ? (exp.company || '') : (exp.title || '')}
                row2Right={exp.location}
                t={t}
              />
              {t.entryDatePosition === 'below' && dateRange && (
                <p className="text-xs text-gray-500 mt-0.5">{dateRange}</p>
              )}
              {lines.length > 0 && <BulletList lines={lines} t={t} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function renderEducation(resumeData: ResumeData, t: ParsedTemplate) {
  const items = resumeData.education.filter((e) => e.degree || e.school);
  if (!items.length) return null;
  return (
    <div key="education">
      <SectionHeading title="Education" t={t} />
      <div className="space-y-2.5">
        {items.map((edu, i) => {
          const dateRange =
            edu.startDate ? `${edu.startDate} – ${edu.endDate || 'Present'}` : undefined;
          const lines = edu.description ? toLines(edu.description) : [];

          // educationRow1Right controls what goes on the RIGHT of row 1
          // 'location' → school + location (row 1), degree + date (row 2)  ← Jake original
          // 'date'     → school + date (row 1), degree + location (row 2)
          const locationOnRow1 = t.educationRow1Right === 'location';
          return (
            <div key={edu.id || i}>
              <EntryHeader
                row1Left={edu.school || ''}
                row1Right={locationOnRow1 ? edu.location : dateRange}
                row2Left={edu.degree}
                row2Right={locationOnRow1 ? dateRange : edu.location}
                t={t}
              />
              {lines.length > 0 && <BulletList lines={lines} t={t} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function renderProjects(resumeData: ResumeData, t: ParsedTemplate) {
  const items = resumeData.projects.filter((p) => p.name);
  if (!items.length) return null;
  return (
    <div key="projects">
      <SectionHeading title="Projects" t={t} />
      <div className="space-y-2.5">
        {items.map((proj, i) => {
          const dateRange =
            proj.startDate || proj.endDate
              ? `${proj.startDate || ''} – ${proj.endDate || 'Present'}`
              : undefined;
          const lines = proj.description ? toLines(proj.description) : [];
          return (
            <div key={proj.id || i}>
              {/* Project heading: bold name | italic tech  +  date right */}
              <div className="flex justify-between items-baseline gap-2 mb-0.5">
                <span className="text-sm leading-snug">
                  <strong>{proj.name}</strong>
                  {proj.technologies && (
                    <span className="font-normal italic"> | {proj.technologies}</span>
                  )}
                </span>
                {t.entryDatePosition === 'right' && dateRange && (
                  <span className="text-xs font-semibold whitespace-nowrap flex-shrink-0">
                    {dateRange}
                  </span>
                )}
              </div>
              {lines.length > 0 && <BulletList lines={lines} t={t} />}
              {proj.url && (
                <a
                  href={proj.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs underline mt-0.5 block"
                  style={c(t.accentColor)}
                >
                  {proj.url}
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function renderSkills(resumeData: ResumeData, t: ParsedTemplate) {
  const items = resumeData.skills.filter((s) => s.name);
  if (!items.length) return null;
  return (
    <div key="skills">
      <SectionHeading title="Technical Skills" t={t} />
      {t.skillsLayout === 'inline-bold' && (
        <div className="space-y-0.5">
          {items.map((skill, i) => (
            <p key={skill.id || i} className="text-xs leading-relaxed">
              <strong>{skill.name}</strong>
              {skill.level ? `: ${skill.level}` : ''}
            </p>
          ))}
        </div>
      )}
      {t.skillsLayout === 'tags' && (
        <div className="flex flex-wrap gap-1 mt-1">
          {items.map((skill, i) => (
            <span
              key={skill.id || i}
              className="text-xs px-1.5 py-0.5 rounded border"
              style={border(t.accentColor)}
            >
              {skill.name}
            </span>
          ))}
        </div>
      )}
      {t.skillsLayout === 'progress' && (
        <div className="space-y-1 mt-1">
          {items.map((skill, i) => (
            <div key={skill.id || i}>
              <div className="flex justify-between text-xs mb-0.5">
                <span>{skill.name}</span>
                {skill.level && <span>{skill.level}%</span>}
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${skill.level || 0}%`, ...bg(t.accentColor) }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
      {t.skillsLayout === 'list' && (
        <BulletList
          lines={items.map((s) => s.name + (s.level ? ` (${s.level}%)` : ''))}
          t={t}
        />
      )}
    </div>
  );
}

function renderAchievements(resumeData: ResumeData, t: ParsedTemplate) {
  const items = (resumeData.achievements ?? []).filter((a) => a.name);
  if (!items.length) return null;
  return (
    <div key="achievements">
      <SectionHeading title="Leadership / Extracurricular" t={t} />
      <div className="space-y-2.5">
        {items.map((ach, i) => {
          const lines = ach.description ? toLines(ach.description) : [];
          return (
            <div key={ach.id || i}>
              <EntryHeader
                row1Left={ach.name || ''}
                row2Left={ach.technologies}
                t={t}
              />
              {lines.length > 0 && <BulletList lines={lines} t={t} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const SECTION_RENDERERS: Record<
  SectionKey,
  (data: ResumeData, t: ParsedTemplate) => React.ReactNode
> = {
  summary: renderSummary,
  experience: renderExperience,
  education: renderEducation,
  projects: renderProjects,
  skills: renderSkills,
  achievements: renderAchievements,
};

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

const CustomTemplateRenderer: React.FC<Props> = ({ resumeData, template: t }) => {
  const { personalInfo } = resumeData;
  const fontStyle: React.CSSProperties = {
    fontFamily: t.fontFamily === 'serif' ? '"Georgia", "Times New Roman", serif' : '"Arial", "Helvetica", sans-serif',
  };

  return (
    <div className="bg-white p-6 text-gray-900 text-[13px]" style={fontStyle}>
      {/* ── Header ── */}
      {t.headerLayout === 'center' ? (
        <div className="text-center mb-3">
          <h1
            className="text-2xl font-bold leading-tight"
            style={{ fontVariant: t.sectionSmallCaps ? 'small-caps' : undefined }}
          >
            {personalInfo.name || 'Your Name'}
          </h1>

          {/* Contact line — all on one row, separated by the template's separator character */}
          {(() => {
            const sep = ` ${t.headerSeparator ?? '|'} `;
            const parts: string[] = [];
            if (personalInfo.phone)    parts.push(personalInfo.phone);
            if (personalInfo.email)    parts.push(personalInfo.email);
            if (personalInfo.location) parts.push(personalInfo.location);
            if (personalInfo.linkedin) parts.push(`linkedin.com/in/${personalInfo.linkedin}`);
            if (personalInfo.github)   parts.push(`github.com/${personalInfo.github}`);
            return parts.length > 0 ? (
              <p className="text-xs mt-1 text-gray-700 leading-relaxed">
                {parts.join(sep)}
              </p>
            ) : null;
          })()}
        </div>
      ) : (
        <div className="flex justify-between items-start mb-3">
          <div>
            <h1 className="text-2xl font-bold leading-tight">
              {personalInfo.name || 'Your Name'}
            </h1>
            {personalInfo.title && (
              <p className="text-sm text-gray-600 mt-0.5">{personalInfo.title}</p>
            )}
          </div>
          <div className="text-right text-xs text-gray-600 space-y-0.5">
            {personalInfo.email && <p>{personalInfo.email}</p>}
            {personalInfo.phone && <p>{personalInfo.phone}</p>}
            {personalInfo.location && <p>{personalInfo.location}</p>}
            {personalInfo.linkedin && <p>linkedin.com/in/{personalInfo.linkedin}</p>}
            {personalInfo.github && <p>github.com/{personalInfo.github}</p>}
          </div>
        </div>
      )}

      {/* ── Sections in detected order ── */}
      <div className="space-y-0.5">
        {t.sectionOrder.map((key) => {
          const renderer = SECTION_RENDERERS[key];
          return renderer ? (
            <React.Fragment key={key}>{renderer(resumeData, t)}</React.Fragment>
          ) : null;
        })}
      </div>
    </div>
  );
};

export default CustomTemplateRenderer;
