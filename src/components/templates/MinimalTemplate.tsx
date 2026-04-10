/**
 * Minimal Template
 * Ultra-clean · hairline dividers · maximum whitespace · lowercase section labels
 * Inspired by Swiss/Bauhaus design principles
 */
import React from 'react';
import type { ResumeData } from './types';
import { MailIcon, PhoneIcon, GitHubIcon, LinkedInIcon, LeetCodeIcon, buildProfileUrl } from './ContactIcons';

const toLines = (s: string) =>
  s.split('\n').map((l) => l.replace(/^[\s•\-–]+/, '').trim()).filter(Boolean);

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p
    className="uppercase tracking-widest"
    style={{ fontSize: '7.5px', color: '#9ca3af', fontWeight: 600, letterSpacing: '0.18em', marginBottom: '8px', marginTop: '20px' }}
  >
    {children as string}
  </p>
);

const HR = () => (
  <div style={{ height: '0.5px', backgroundColor: '#e5e7eb', margin: '0 0 8px' }} />
);

export const MinimalTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personalInfo: p, experience, education, skills, projects, achievements = [] } = data;

  type ContactItem = { label: string; href?: string; icon: React.ReactNode };
  const contactItems: ContactItem[] = [
    p.email ? { label: p.email, href: `mailto:${p.email}`, icon: <MailIcon size={9} /> } : null,
    p.phone ? { label: p.phone, icon: <PhoneIcon size={9} /> } : null,
    p.linkedin ? { label: 'LinkedIn', href: buildProfileUrl('https://linkedin.com/in/', 'linkedin.com', p.linkedin), icon: <LinkedInIcon size={9} /> } : null,
    p.github ? { label: 'GitHub', href: buildProfileUrl('https://github.com/', 'github.com', p.github), icon: <GitHubIcon size={9} /> } : null,
    (p as any).leetcode ? { label: 'LeetCode', href: buildProfileUrl('https://leetcode.com/u/', 'leetcode.com', (p as any).leetcode), icon: <LeetCodeIcon size={9} /> } : null,
  ].filter(Boolean) as ContactItem[];

  return (
    <div
      className="bg-white"
      style={{ fontFamily: '"Arial", "Helvetica", sans-serif', fontSize: '10.5px', padding: '40px 44px', color: '#111827' }}
    >
      {/* ── Header ── */}
      <div style={{ marginBottom: '20px' }}>
        <h1
          style={{ fontSize: '28px', fontWeight: 300, letterSpacing: '-0.02em', color: '#111827', marginBottom: '4px', lineHeight: 1.1 }}
        >
          {p.name || 'Your Name'}
        </h1>
        {p.title && (
          <p style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginBottom: '8px' }}>
            {p.title}
          </p>
        )}
        <div style={{ height: '1px', backgroundColor: '#111827', marginBottom: '8px' }} />
        {contactItems.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', fontSize: '9px', color: '#6b7280' }}>
            {contactItems.map((item, i) => (
              item.href ? (
                <a key={i} href={item.href} style={{ color: '#6b7280', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  {item.icon}{item.label}
                </a>
              ) : (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>{item.icon}{item.label}</span>
              )
            ))}
          </div>
        )}
      </div>

      {/* ── Summary ── */}
      {p.summary && (
        <>
          <Label>Profile</Label>
          <HR />
          <p style={{ fontSize: '10.5px', color: '#374151', lineHeight: 1.7, marginBottom: '4px' }}>{p.summary}</p>
        </>
      )}

      {/* ── Experience ── */}
      {experience.some((e) => e.title || e.company) && (
        <>
          <Label>Experience</Label>
          <HR />
          {experience.map((exp, i) =>
            exp.title || exp.company ? (
              <div key={i} style={{ marginBottom: '12px' }}>
                <div className="flex justify-between items-baseline">
                  <span style={{ fontWeight: 600, fontSize: '11px', color: '#111827' }}>{exp.company}</span>
                  <span style={{ fontSize: '9.5px', color: '#9ca3af', whiteSpace: 'nowrap', marginLeft: '12px' }}>
                    {exp.startDate && `${exp.startDate} – ${exp.endDate || 'Present'}`}
                  </span>
                </div>
                <p style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>
                  {exp.title}{exp.location ? `  ·  ${exp.location}` : ''}
                </p>
                {exp.description && (
                  <div>
                    {toLines(exp.description).map((l, j) => (
                      <p key={j} style={{ fontSize: '10px', color: '#4b5563', lineHeight: 1.6, paddingLeft: '8px', borderLeft: '1.5px solid #e5e7eb', marginBottom: '2px' }}>
                        {l}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ) : null
          )}
        </>
      )}

      {/* ── Education ── */}
      {education.some((e) => e.school || e.degree) && (
        <>
          <Label>Education</Label>
          <HR />
          {education.map((edu, i) =>
            edu.school || edu.degree ? (
              <div key={i} style={{ marginBottom: '10px' }}>
                <div className="flex justify-between items-baseline">
                  <span style={{ fontWeight: 600, fontSize: '11px', color: '#111827' }}>{edu.school}</span>
                  <span style={{ fontSize: '9.5px', color: '#9ca3af' }}>
                    {edu.startDate && `${edu.startDate} – ${edu.endDate || 'Present'}`}
                  </span>
                </div>
                <p style={{ fontSize: '10px', color: '#6b7280' }}>
                  {edu.degree}{edu.location ? `  ·  ${edu.location}` : ''}
                </p>
                {edu.description && (
                  <p style={{ fontSize: '9.5px', color: '#9ca3af', marginTop: '2px' }}>{edu.description}</p>
                )}
              </div>
            ) : null
          )}
        </>
      )}

      {/* ── Projects ── */}
      {projects.some((p) => p.name) && (
        <>
          <Label>Projects</Label>
          <HR />
          {projects.map((proj, i) =>
            proj.name ? (
              <div key={i} style={{ marginBottom: '10px' }}>
                <div className="flex justify-between items-baseline">
                  <span style={{ fontWeight: 600, fontSize: '11px', color: '#111827' }}>
                    {proj.name}
                    {proj.technologies && (
                      <span style={{ fontWeight: 400, color: '#9ca3af', fontSize: '9.5px' }}>  ·  {proj.technologies}</span>
                    )}
                  </span>
                  <span style={{ fontSize: '9.5px', color: '#9ca3af', whiteSpace: 'nowrap', marginLeft: '12px' }}>
                    {proj.startDate && `${proj.startDate}${proj.endDate ? ` – ${proj.endDate}` : ''}`}
                  </span>
                </div>
                {proj.description && (
                  <div style={{ marginTop: '3px' }}>
                    {toLines(proj.description).map((l, j) => (
                      <p key={j} style={{ fontSize: '10px', color: '#4b5563', lineHeight: 1.6, paddingLeft: '8px', borderLeft: '1.5px solid #e5e7eb', marginBottom: '2px' }}>
                        {l}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ) : null
          )}
        </>
      )}

      {/* ── Skills ── */}
      {skills.some((s) => s.name) && (
        <>
          <Label>Skills</Label>
          <HR />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {skills.map((sk, i) => {
              if (!sk.name) return null;
              const levelText = sk.level && !/^\d+$/.test(sk.level.trim()) ? sk.level : null;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '10px', color: '#374151', minWidth: '100px', fontWeight: 600, flexShrink: 0 }}>
                    {sk.name}
                  </span>
                  {levelText && (
                    <span style={{ fontSize: '9.5px', color: '#6b7280' }}>{levelText}</span>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── Achievements ── */}
      {achievements.some((a) => a.name) && (
        <>
          <Label>Recognition</Label>
          <HR />
          {achievements.map((ach, i) =>
            ach.name ? (
              <div key={i} style={{ marginBottom: '6px' }}>
                <div className="flex justify-between">
                  <span style={{ fontWeight: 600, fontSize: '10.5px', color: '#111827' }}>{ach.name}</span>
                  {ach.technologies && (
                    <span style={{ fontSize: '9.5px', color: '#9ca3af' }}>{ach.technologies}</span>
                  )}
                </div>
                {ach.description && (
                  <p style={{ fontSize: '10px', color: '#6b7280', marginTop: '1px' }}>{ach.description}</p>
                )}
              </div>
            ) : null
          )}
        </>
      )}
    </div>
  );
};
