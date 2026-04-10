/**
 * Modern Template
 * Dark slate sidebar (35%) + clean white main content (65%)
 * Skills as filled dots · contact icons · two-column layout
 */
import React from 'react';
import type { ResumeData } from './types';
import { MailIcon, PhoneIcon, GitHubIcon, LinkedInIcon, LeetCodeIcon, buildProfileUrl } from './ContactIcons';

const SIDEBAR = '#1e293b';   // slate-800
const ACCENT  = '#38bdf8';   // sky-400

const toLines = (s: string) =>
  s.split('\n').map((l) => l.replace(/^[\s•\-–]+/, '').trim()).filter(Boolean);

const Dot: React.FC<{ filled: boolean }> = ({ filled }) => (
  <span
    style={{
      display: 'inline-block',
      width: 7,
      height: 7,
      borderRadius: '50%',
      backgroundColor: filled ? ACCENT : 'rgba(255,255,255,0.25)',
      marginRight: 3,
      verticalAlign: 'middle',
    }}
  />
);

const SkillDots: React.FC<{ level: string }> = ({ level }) => {
  const pct = parseInt(level) || 0;
  const filled = Math.round(pct / 20); // 0-5 dots
  return (
    <span>
      {[1, 2, 3, 4, 5].map((d) => (
        <Dot key={d} filled={d <= filled} />
      ))}
    </span>
  );
};

const SectionLabel: React.FC<{ title: string }> = ({ title }) => (
  <h2
    className="font-bold tracking-widest uppercase mb-2"
    style={{ fontSize: '9px', color: '#64748b', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginTop: '14px' }}
  >
    {title}
  </h2>
);

export const ModernTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personalInfo: p, experience, education, skills, projects, achievements = [] } = data;

  return (
    <div
      className="bg-white flex"
      style={{ fontFamily: '"Arial", "Helvetica", sans-serif', fontSize: '10.5px', minHeight: '100%' }}
    >
      {/* ── Sidebar ── */}
      <div
        className="flex-shrink-0 px-5 py-7"
        style={{ width: '34%', backgroundColor: SIDEBAR, color: '#e2e8f0' }}
      >
        {/* Name */}
        <h1
          className="font-bold leading-tight mb-0.5"
          style={{ fontSize: '18px', color: '#fff', lineHeight: 1.2 }}
        >
          {p.name || 'Your Name'}
        </h1>
        {p.title && (
          <p style={{ fontSize: '9.5px', color: ACCENT, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
            {p.title}
          </p>
        )}

        {/* Contact */}
        <div style={{ marginBottom: '14px' }}>
          <h2 style={{ fontSize: '9px', fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Contact</h2>
          {p.email && <p style={{ fontSize: '9px', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}><MailIcon size={9} /><a href={`mailto:${p.email}`} style={{ color: 'inherit', textDecoration: 'none', wordBreak: 'break-all' }}>{p.email}</a></p>}
          {p.phone && <p style={{ fontSize: '9px', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}><PhoneIcon size={9} />{p.phone}</p>}
          {p.location && <p style={{ fontSize: '9px', marginBottom: '3px' }}>📍 {p.location}</p>}
          {p.linkedin && <p style={{ fontSize: '9px', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}><LinkedInIcon size={9} /><a href={buildProfileUrl('https://linkedin.com/in/', 'linkedin.com', p.linkedin)} style={{ color: 'inherit', textDecoration: 'none' }}>LinkedIn</a></p>}
          {p.github && <p style={{ fontSize: '9px', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}><GitHubIcon size={9} /><a href={buildProfileUrl('https://github.com/', 'github.com', p.github)} style={{ color: 'inherit', textDecoration: 'none' }}>GitHub</a></p>}
          {(p as any).leetcode && <p style={{ fontSize: '9px', display: 'flex', alignItems: 'center', gap: '4px' }}><LeetCodeIcon size={9} /><a href={buildProfileUrl('https://leetcode.com/u/', 'leetcode.com', (p as any).leetcode)} style={{ color: 'inherit', textDecoration: 'none' }}>LeetCode</a></p>}
        </div>

        {/* Skills */}
        {skills.some((s) => s.name) && (
          <div style={{ marginBottom: '14px' }}>
            <h2 style={{ fontSize: '9px', fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Skills</h2>
            {skills.map((sk, i) => {
              if (!sk.name) return null;
              const isNumeric = /^\d+$/.test((sk.level ?? '').trim());
              const hasItems = sk.level && !isNumeric;
              const items = hasItems ? sk.level.split(',').map((x: string) => x.trim()).filter(Boolean) : [];
              return (
                <div key={i} style={{ marginBottom: '7px' }}>
                  {/* Category name */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                    <span style={{ fontSize: '9px', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{sk.name}</span>
                    {isNumeric && <SkillDots level={sk.level ?? '0'} />}
                  </div>
                  {/* Comma-separated items as small chips */}
                  {items.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
                      {items.map((item: string, j: number) => (
                        <span
                          key={j}
                          style={{
                            fontSize: '7.5px',
                            padding: '1px 5px',
                            borderRadius: '3px',
                            backgroundColor: 'rgba(56,189,248,0.12)',
                            color: '#7dd3fc',
                            border: '1px solid rgba(56,189,248,0.25)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Summary */}
        {p.summary && (
          <div>
            <h2 style={{ fontSize: '9px', fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>About</h2>
            <p style={{ fontSize: '9px', lineHeight: 1.5, color: 'rgba(226,232,240,0.85)' }}>{p.summary}</p>
          </div>
        )}
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 px-6 py-7" style={{ color: '#1e293b' }}>

        {/* Experience */}
        {experience.some((e) => e.title || e.company) && (
          <section>
            <SectionLabel title="Experience" />
            {experience.map((exp, i) =>
              exp.title || exp.company ? (
                <div key={i} style={{ marginBottom: '10px' }}>
                  <div className="flex justify-between items-baseline">
                    <span style={{ fontWeight: 700, fontSize: '11px', color: '#0f172a' }}>{exp.title}</span>
                    <span style={{ fontSize: '9.5px', color: '#64748b', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                      {exp.startDate && `${exp.startDate} – ${exp.endDate || 'Present'}`}
                    </span>
                  </div>
                  <p style={{ fontSize: '9.5px', color: '#475569', fontStyle: 'italic', marginBottom: '3px' }}>
                    {exp.company}{exp.location ? ` · ${exp.location}` : ''}
                  </p>
                  {exp.description && (
                    <div style={{ margin: 0 }}>
                      {toLines(exp.description).map((l, j) => (
                        <div key={j} style={{ fontSize: '9.5px', color: '#334155', marginBottom: '1px', display: 'flex', alignItems: 'flex-start', gap: '5px' }}>
                          <span style={{ flexShrink: 0 }}>•</span><span>{l}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null
            )}
          </section>
        )}

        {/* Education */}
        {education.some((e) => e.school || e.degree) && (
          <section>
            <SectionLabel title="Education" />
            {education.map((edu, i) =>
              edu.school || edu.degree ? (
                <div key={i} style={{ marginBottom: '8px' }}>
                  <div className="flex justify-between items-baseline">
                    <span style={{ fontWeight: 700, fontSize: '11px', color: '#0f172a' }}>{edu.school}</span>
                    <span style={{ fontSize: '9.5px', color: '#64748b', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                      {edu.startDate && `${edu.startDate} – ${edu.endDate || 'Present'}`}
                    </span>
                  </div>
                  <p style={{ fontSize: '9.5px', color: '#475569', fontStyle: 'italic' }}>
                    {edu.degree}{edu.location ? ` · ${edu.location}` : ''}
                  </p>
                  {edu.description && (
                    <p style={{ fontSize: '9px', color: '#64748b', marginTop: '2px' }}>{edu.description}</p>
                  )}
                </div>
              ) : null
            )}
          </section>
        )}

        {/* Projects */}
        {projects.some((p) => p.name) && (
          <section>
            <SectionLabel title="Projects" />
            {projects.map((proj, i) =>
              proj.name ? (
                <div key={i} style={{ marginBottom: '8px' }}>
                  <div className="flex justify-between items-baseline">
                    <span style={{ fontWeight: 700, fontSize: '11px', color: '#0f172a' }}>
                      {proj.name}
                      {proj.technologies && (
                        <span style={{ fontWeight: 400, fontSize: '9.5px', color: '#64748b', fontStyle: 'italic' }}>
                          {' '}· {proj.technologies}
                        </span>
                      )}
                    </span>
                    <span style={{ fontSize: '9.5px', color: '#64748b', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                      {proj.startDate && `${proj.startDate}${proj.endDate ? ` – ${proj.endDate}` : ''}`}
                    </span>
                  </div>
                  {proj.description && (
                    <div style={{ margin: '2px 0 0' }}>
                      {toLines(proj.description).map((l, j) => (
                        <div key={j} style={{ fontSize: '9.5px', color: '#334155', marginBottom: '1px', display: 'flex', alignItems: 'flex-start', gap: '5px' }}>
                          <span style={{ flexShrink: 0 }}>•</span><span>{l}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null
            )}
          </section>
        )}

        {/* Achievements */}
        {achievements.some((a) => a.name) && (
          <section>
            <SectionLabel title="Achievements" />
            {achievements.map((ach, i) =>
              ach.name ? (
                <div key={i} style={{ marginBottom: '6px' }}>
                  <div className="flex justify-between items-baseline">
                    <span style={{ fontWeight: 700, fontSize: '10.5px', color: '#0f172a' }}>{ach.name}</span>
                    {ach.technologies && (
                      <span style={{ fontSize: '9px', color: '#64748b' }}>{ach.technologies}</span>
                    )}
                  </div>
                  {ach.description && (
                    <p style={{ fontSize: '9.5px', color: '#334155', marginTop: '2px' }}>{ach.description}</p>
                  )}
                </div>
              ) : null
            )}
          </section>
        )}
      </div>
    </div>
  );
};
