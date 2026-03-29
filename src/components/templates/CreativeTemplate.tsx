/**
 * Creative Template
 * Bold large name · vertical emerald accent line · timeline-style experience
 * Designed for designers, product managers, and creative tech roles
 */
import React from 'react';
import type { ResumeData } from './types';

const EMERALD = '#059669';
const LIGHT   = '#ecfdf5';

const toLines = (s: string) =>
  s.split('\n').map((l) => l.replace(/^[\s•\-–]+/, '').trim()).filter(Boolean);

const SectionHead: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ marginBottom: '10px', marginTop: '18px' }}>
    <h2
      className="font-bold uppercase tracking-widest"
      style={{ fontSize: '8.5px', color: EMERALD, letterSpacing: '0.2em' }}
    >
      {title}
    </h2>
  </div>
);

const Tag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    style={{
      display: 'inline-block',
      fontSize: '8.5px',
      padding: '1px 7px',
      backgroundColor: LIGHT,
      color: '#065f46',
      borderRadius: '999px',
      fontWeight: 500,
      marginRight: '4px',
      marginBottom: '3px',
      border: `1px solid #a7f3d0`,
    }}
  >
    {children as string}
  </span>
);

export const CreativeTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personalInfo: p, experience, education, skills, projects, achievements = [] } = data;

  return (
    <div
      className="bg-white flex"
      style={{ fontFamily: '"Arial", "Helvetica", sans-serif', fontSize: '10.5px', minHeight: '100%' }}
    >
      {/* ── Left accent strip ── */}
      <div style={{ width: '5px', backgroundColor: EMERALD, flexShrink: 0 }} />

      {/* ── Main ── */}
      <div style={{ flex: 1, padding: '32px 32px 24px 28px' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `2px solid ${LIGHT}` }}>
          <h1
            style={{ fontSize: '32px', fontWeight: 800, color: '#064e3b', letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: '2px' }}
          >
            {(p.name || 'Your Name').split(' ').slice(0, 1).join('')}
            <br />
            <span style={{ color: EMERALD }}>
              {(p.name || '').split(' ').slice(1).join(' ')}
            </span>
          </h1>
          {p.title && (
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#374151', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px' }}>
              {p.title}
            </p>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', fontSize: '9.5px', color: '#6b7280' }}>
            {p.email && <span>✉ {p.email}</span>}
            {p.phone && <span>☎ {p.phone}</span>}
            {p.location && <span>📍 {p.location}</span>}
            {p.linkedin && <span>🔗 linkedin.com/in/{p.linkedin}</span>}
            {p.github && <span>⌨ github.com/{p.github}</span>}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '24px' }}>

          {/* ── Left column (60%) ── */}
          <div style={{ flex: 3 }}>

            {p.summary && (
              <>
                <SectionHead title="Profile" />
                <p style={{ fontSize: '10.5px', color: '#374151', lineHeight: 1.7, borderLeft: `3px solid ${EMERALD}`, paddingLeft: '10px' }}>
                  {p.summary}
                </p>
              </>
            )}

            {/* Experience — timeline style */}
            {experience.some((e) => e.title || e.company) && (
              <>
                <SectionHead title="Experience" />
                <div style={{ position: 'relative' }}>
                  {experience.map((exp, i) =>
                    exp.title || exp.company ? (
                      <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                        {/* Timeline dot */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                          <div style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: EMERALD, border: `2px solid white`, outline: `2px solid ${EMERALD}`, flexShrink: 0, marginTop: '3px' }} />
                          {i < experience.filter(e => e.title || e.company).length - 1 && (
                            <div style={{ width: 1.5, flex: 1, backgroundColor: '#d1fae5', minHeight: '16px', marginTop: '2px' }} />
                          )}
                        </div>
                        <div style={{ flex: 1, paddingBottom: '4px' }}>
                          <div className="flex justify-between items-baseline">
                            <span style={{ fontWeight: 700, fontSize: '11px', color: '#064e3b' }}>{exp.title}</span>
                            <span style={{ fontSize: '9px', color: '#9ca3af', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                              {exp.startDate && `${exp.startDate} – ${exp.endDate || 'Present'}`}
                            </span>
                          </div>
                          <p style={{ fontSize: '9.5px', color: EMERALD, fontWeight: 600, marginBottom: '3px' }}>
                            {exp.company}{exp.location ? ` · ${exp.location}` : ''}
                          </p>
                          {exp.description && (
                            <ul style={{ paddingLeft: '12px', margin: 0 }}>
                              {toLines(exp.description).map((l, j) => (
                                <li key={j} style={{ fontSize: '9.5px', color: '#4b5563', marginBottom: '1px', listStyleType: 'disc' }}>{l}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    ) : null
                  )}
                </div>
              </>
            )}

            {/* Projects */}
            {projects.some((p) => p.name) && (
              <>
                <SectionHead title="Projects" />
                {projects.map((proj, i) =>
                  proj.name ? (
                    <div key={i} style={{ marginBottom: '9px', padding: '8px 10px', backgroundColor: LIGHT, borderRadius: '6px', borderLeft: `3px solid ${EMERALD}` }}>
                      <div className="flex justify-between items-baseline">
                        <span style={{ fontWeight: 700, fontSize: '10.5px', color: '#064e3b' }}>{proj.name}</span>
                        <span style={{ fontSize: '9px', color: '#9ca3af', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                          {proj.startDate && `${proj.startDate}${proj.endDate ? ` – ${proj.endDate}` : ''}`}
                        </span>
                      </div>
                      {proj.description && toLines(proj.description).slice(0, 2).map((l, j) => (
                        <p key={j} style={{ fontSize: '9.5px', color: '#374151', marginTop: '2px' }}>{l}</p>
                      ))}
                      {proj.technologies && (
                        <p style={{ fontSize: '8.5px', color: '#059669', marginTop: '4px', fontStyle: 'italic' }}>{proj.technologies}</p>
                      )}
                    </div>
                  ) : null
                )}
              </>
            )}
          </div>

          {/* ── Right column (40%) ── */}
          <div style={{ flex: 2 }}>

            {/* Education */}
            {education.some((e) => e.school || e.degree) && (
              <>
                <SectionHead title="Education" />
                {education.map((edu, i) =>
                  edu.school || edu.degree ? (
                    <div key={i} style={{ marginBottom: '10px', padding: '8px 10px', border: '1px solid #d1fae5', borderRadius: '6px' }}>
                      <p style={{ fontWeight: 700, fontSize: '10.5px', color: '#064e3b', marginBottom: '2px' }}>{edu.school}</p>
                      <p style={{ fontSize: '9.5px', color: '#4b5563', fontStyle: 'italic', marginBottom: '2px' }}>{edu.degree}</p>
                      <p style={{ fontSize: '9px', color: '#9ca3af' }}>
                        {edu.startDate && `${edu.startDate} – ${edu.endDate || 'Present'}`}
                        {edu.location ? ` · ${edu.location}` : ''}
                      </p>
                      {edu.description && (
                        <p style={{ fontSize: '8.5px', color: '#6b7280', marginTop: '3px' }}>{edu.description}</p>
                      )}
                    </div>
                  ) : null
                )}
              </>
            )}

            {/* Skills */}
            {skills.some((s) => s.name) && (
              <>
                <SectionHead title="Skills" />
                {skills.map((sk, i) => {
                  if (!sk.name) return null;
                  const isNumeric = /^\d+$/.test((sk.level ?? '').trim());
                  const items = !isNumeric && sk.level
                    ? sk.level.split(',').map((x: string) => x.trim()).filter(Boolean)
                    : [];
                  return (
                    <div key={i} style={{ marginBottom: '8px' }}>
                      <p style={{ fontWeight: 600, fontSize: '9.5px', color: '#064e3b', marginBottom: '3px' }}>{sk.name}</p>
                      {/* Comma-separated → pill tags */}
                      {items.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                          {items.map((item: string, j: number) => <Tag key={j}>{item}</Tag>)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}

            {/* Achievements */}
            {achievements.some((a) => a.name) && (
              <>
                <SectionHead title="Recognition" />
                {achievements.map((ach, i) =>
                  ach.name ? (
                    <div key={i} style={{ marginBottom: '7px', paddingLeft: '8px', borderLeft: `2px solid ${EMERALD}` }}>
                      <p style={{ fontWeight: 600, fontSize: '10px', color: '#064e3b' }}>{ach.name}</p>
                      {ach.technologies && (
                        <p style={{ fontSize: '9px', color: '#9ca3af' }}>{ach.technologies}</p>
                      )}
                      {ach.description && (
                        <p style={{ fontSize: '9.5px', color: '#4b5563', marginTop: '1px' }}>{ach.description}</p>
                      )}
                    </div>
                  ) : null
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
