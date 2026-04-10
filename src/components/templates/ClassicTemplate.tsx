/**
 * Classic Template — Jake's Resume style
 * Black & white · centered header · small-caps section headings · pipe separators
 * Matches the original LaTeX Jake resume output pixel-accurately
 */
import React from 'react';
import type { ResumeData } from './types';
import { MailIcon, PhoneIcon, GitHubIcon, LinkedInIcon, LeetCodeIcon, buildProfileUrl } from './ContactIcons';
import { type LayoutConfig, DEFAULT_LAYOUT, type SectionKey } from '@/lib/layoutConfig';

const toLines = (s: string) =>
  s.split('\n').map((l) => l.replace(/^[\s•\-–]+/, '').trim()).filter(Boolean);

const SectionHead: React.FC<{ title: string }> = ({ title }) => (
  <div className="mt-4 mb-1.5">
    <h2
      className="text-[13px] font-bold leading-tight"
      style={{ fontVariant: 'small-caps', color: '#111' }}
    >
      {title}
    </h2>
    <div style={{ height: '0.5px', backgroundColor: '#888', marginTop: '2px' }} />
  </div>
);

export const ClassicTemplate: React.FC<{ data: ResumeData; layoutConfig?: LayoutConfig }> = ({ data, layoutConfig }) => {
  const { personalInfo: p, experience, education, skills, projects, achievements = [] } = data;
  const layout = layoutConfig ?? DEFAULT_LAYOUT;

  type ContactItem = { label: string; href?: string; icon: React.ReactNode };
  const contactItems: ContactItem[] = [
    p.phone ? { label: p.phone, icon: <PhoneIcon size={10} /> } : null,
    p.email ? { label: p.email, href: `mailto:${p.email}`, icon: <MailIcon size={10} /> } : null,
    p.linkedin ? { label: 'LinkedIn', href: buildProfileUrl('https://linkedin.com/in/', 'linkedin.com', p.linkedin), icon: <LinkedInIcon size={10} /> } : null,
    p.github ? { label: 'GitHub', href: buildProfileUrl('https://github.com/', 'github.com', p.github), icon: <GitHubIcon size={10} /> } : null,
    (p as any).leetcode ? { label: 'LeetCode', href: buildProfileUrl('https://leetcode.com/u/', 'leetcode.com', (p as any).leetcode), icon: <LeetCodeIcon size={10} /> } : null,
  ].filter(Boolean) as ContactItem[];

  /* ── Section renderers ── */
  const renderSection = (key: SectionKey) => {
    const extraSpacing = layout.sectionSpacing[key] ?? 0;
    const spacingStyle: React.CSSProperties = extraSpacing !== 0 ? { marginTop: extraSpacing } : {};

    switch (key) {
      case 'education':
        if (!education.some((e) => e.school || e.degree)) return null;
        return (
          <section key={key} style={spacingStyle}>
            <SectionHead title="Education" />
            {education.map((edu, i) =>
              edu.school || edu.degree ? (
                <div key={i} style={{ marginBottom: '6px' }}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold" style={{ fontSize: '11px' }}>{edu.school}</span>
                    <span style={{ fontSize: '10.5px' }}>{edu.location}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span style={{ fontStyle: 'italic', fontSize: '10.5px' }}>{edu.degree}</span>
                    <span style={{ fontStyle: 'italic', fontSize: '10.5px' }}>
                      {edu.startDate && `${edu.startDate} – ${edu.endDate || 'Present'}`}
                    </span>
                  </div>
                  {edu.description && (
                    <div className="mt-0.5 pl-2">
                      {toLines(edu.description).map((l, j) => (
                        <div key={j} style={{ fontSize: '10.5px', display: 'flex', alignItems: 'flex-start', gap: '5px', marginBottom: '1px' }}>
                          <span style={{ flexShrink: 0 }}>•</span><span>{l}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null
            )}
          </section>
        );

      case 'experience':
        if (!experience.some((e) => e.title || e.company)) return null;
        return (
          <section key={key} style={spacingStyle}>
            <SectionHead title="Experience" />
            {experience.map((exp, i) =>
              exp.title || exp.company ? (
                <div key={i} style={{ marginBottom: '8px' }}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold" style={{ fontSize: '11px' }}>{exp.title}</span>
                    <span style={{ fontSize: '10.5px' }}>
                      {exp.startDate && `${exp.startDate} – ${exp.endDate || 'Present'}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span style={{ fontStyle: 'italic', fontSize: '10.5px' }}>{exp.company}</span>
                    <span style={{ fontStyle: 'italic', fontSize: '10.5px' }}>{exp.location}</span>
                  </div>
                  {exp.description && (
                    <div className="mt-0.5 pl-2">
                      {toLines(exp.description).map((l, j) => (
                        <div key={j} style={{ fontSize: '10.5px', display: 'flex', alignItems: 'flex-start', gap: '5px', marginBottom: '1px' }}>
                          <span style={{ flexShrink: 0 }}>•</span><span>{l}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null
            )}
          </section>
        );

      case 'projects':
        if (!projects.some((p) => p.name)) return null;
        return (
          <section key={key} style={spacingStyle}>
            <SectionHead title="Projects" />
            {projects.map((proj, i) =>
              proj.name ? (
                <div key={i} style={{ marginBottom: '6px' }}>
                  <div className="flex justify-between items-baseline">
                    <span style={{ fontSize: '11px' }}>
                      <strong>{proj.name}</strong>
                      {proj.technologies && (
                        <span style={{ fontStyle: 'italic', fontWeight: 'normal' }}>
                          {' '}| {proj.technologies}
                        </span>
                      )}
                    </span>
                    <span style={{ fontSize: '10.5px' }}>
                      {proj.startDate && `${proj.startDate} – ${proj.endDate || 'Present'}`}
                    </span>
                  </div>
                  {proj.description && (
                    <div className="mt-0.5 pl-2">
                      {toLines(proj.description).map((l, j) => (
                        <div key={j} style={{ fontSize: '10.5px', display: 'flex', alignItems: 'flex-start', gap: '5px', marginBottom: '1px' }}>
                          <span style={{ flexShrink: 0 }}>•</span><span>{l}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null
            )}
          </section>
        );

      case 'skills':
        if (!skills.some((s) => s.name)) return null;
        return (
          <section key={key} style={spacingStyle}>
            <SectionHead title="Technical Skills" />
            <div style={{ paddingLeft: '4px' }}>
              {skills.map((sk, i) => {
                if (!sk.name) return null;
                const levelText = sk.level && !/^\d+$/.test(sk.level.trim()) ? sk.level : null;
                return (
                  <p key={i} style={{ fontSize: '10.5px', marginBottom: '2px' }}>
                    <strong>{sk.name}</strong>
                    {levelText ? `: ${levelText}` : ''}
                  </p>
                );
              })}
            </div>
          </section>
        );

      case 'summary':
        if (!p.summary) return null;
        return (
          <section key={key} style={spacingStyle}>
            <SectionHead title="Professional Summary" />
            <p style={{ fontSize: '10.5px' }}>{p.summary}</p>
          </section>
        );

      case 'achievements':
        if (!achievements.some((a) => a.name)) return null;
        return (
          <section key={key} style={spacingStyle}>
            <SectionHead title="Achievements / Extracurricular" />
            {achievements.map((ach, i) =>
              ach.name ? (
                <div key={i} style={{ marginBottom: '6px' }}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold" style={{ fontSize: '11px' }}>{ach.name}</span>
                    <span style={{ fontSize: '10.5px', fontStyle: 'italic' }}>{ach.technologies}</span>
                  </div>
                  {ach.description && (
                    <div className="mt-0.5 pl-2">
                      {toLines(ach.description).map((l, j) => (
                        <div key={j} style={{ fontSize: '10.5px', display: 'flex', alignItems: 'flex-start', gap: '5px', marginBottom: '1px' }}>
                          <span style={{ flexShrink: 0 }}>•</span><span>{l}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null
            )}
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="bg-white text-gray-900 px-10 py-8"
      style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: '11px', lineHeight: '1.5' }}
    >
      {/* ── Header ── */}
      <div className="text-center mb-1">
        <h1
          className="font-bold leading-none mb-1"
          style={{ fontSize: '22px', fontVariant: 'small-caps', letterSpacing: '0.02em' }}
        >
          {p.name || 'Your Name'}
        </h1>
        {p.location && (
          <p style={{ fontSize: '11px', color: '#444', marginBottom: '2px', fontWeight: 'bold' }}>{p.location}</p>
        )}
        {contactItems.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 10px', fontSize: '10px', color: '#444' }}>
            {contactItems.map((item, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span style={{ color: '#888' }}>|</span>}
                {item.href ? (
                  <a href={item.href} style={{ color: '#444', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    {item.icon}{item.label}
                  </a>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>{item.icon}{item.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* ── Sections in configured order ── */}
      {layout.sectionOrder.map((key) => renderSection(key))}
    </div>
  );
};
