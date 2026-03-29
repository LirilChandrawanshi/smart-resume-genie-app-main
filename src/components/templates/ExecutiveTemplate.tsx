/**
 * Executive Template
 * Full-width dark navy header · clean white body · arrow-bullet sections
 * Designed for senior professionals and leadership roles
 */
import React from 'react';
import type { ResumeData } from './types';

const NAVY   = '#0f172a';
const TEAL   = '#0d9488';

const toLines = (s: string) =>
  s.split('\n').map((l) => l.replace(/^[\s•\-–]+/, '').trim()).filter(Boolean);

const SectionHead: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '14px 0 6px' }}>
    <span style={{ display: 'inline-block', width: 3, height: 14, backgroundColor: TEAL, borderRadius: 2, flexShrink: 0 }} />
    <h2
      className="font-bold tracking-wider uppercase"
      style={{ fontSize: '9.5px', color: NAVY, letterSpacing: '0.12em' }}
    >
      {title}
    </h2>
    <div style={{ flex: 1, height: '0.5px', backgroundColor: '#cbd5e1' }} />
  </div>
);

export const ExecutiveTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personalInfo: p, experience, education, skills, projects, achievements = [] } = data;

  const contactParts = [
    p.email, p.phone, p.location,
    p.linkedin ? `linkedin.com/in/${p.linkedin}` : null,
    p.github ? `github.com/${p.github}` : null,
  ].filter(Boolean) as string[];

  return (
    <div
      className="bg-white"
      style={{ fontFamily: '"Arial", "Helvetica", sans-serif', fontSize: '10.5px' }}
    >
      {/* ── Header ── */}
      <div style={{ backgroundColor: NAVY, padding: '28px 36px 22px', color: '#fff' }}>
        <h1
          className="font-bold tracking-wide"
          style={{ fontSize: '26px', letterSpacing: '0.03em', marginBottom: '3px' }}
        >
          {p.name || 'Your Name'}
        </h1>
        {p.title && (
          <p style={{ fontSize: '11.5px', color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '10px' }}>
            {p.title}
          </p>
        )}
        {contactParts.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 12px' }}>
            {contactParts.map((c, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span style={{ color: TEAL }}>·</span>}
                <span style={{ fontSize: '9.5px', color: '#cbd5e1' }}>{c}</span>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* ── Teal accent bar ── */}
      <div style={{ height: '3px', backgroundColor: TEAL }} />

      {/* ── Body ── */}
      <div style={{ padding: '4px 36px 24px' }}>

        {/* Summary */}
        {p.summary && (
          <section>
            <SectionHead title="Executive Summary" />
            <p style={{ fontSize: '10.5px', color: '#334155', lineHeight: 1.6 }}>{p.summary}</p>
          </section>
        )}

        {/* Experience */}
        {experience.some((e) => e.title || e.company) && (
          <section>
            <SectionHead title="Professional Experience" />
            {experience.map((exp, i) =>
              exp.title || exp.company ? (
                <div key={i} style={{ marginBottom: '10px' }}>
                  <div className="flex justify-between items-baseline">
                    <span style={{ fontWeight: 700, fontSize: '11px', color: NAVY }}>{exp.company}</span>
                    <span style={{ fontSize: '9.5px', color: '#64748b', whiteSpace: 'nowrap', marginLeft: '12px' }}>
                      {exp.startDate && `${exp.startDate} – ${exp.endDate || 'Present'}`}
                    </span>
                  </div>
                  <p style={{ fontSize: '10px', color: TEAL, fontWeight: 600, marginBottom: '3px' }}>
                    {exp.title}{exp.location ? ` · ${exp.location}` : ''}
                  </p>
                  {exp.description && (
                    <ul style={{ paddingLeft: '14px', margin: 0 }}>
                      {toLines(exp.description).map((l, j) => (
                        <li key={j} style={{ fontSize: '10px', color: '#475569', marginBottom: '2px', listStyleType: 'disc' }}>{l}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : null
            )}
          </section>
        )}

        {/* Education */}
        {education.some((e) => e.school || e.degree) && (
          <section>
            <SectionHead title="Education" />
            {education.map((edu, i) =>
              edu.school || edu.degree ? (
                <div key={i} style={{ marginBottom: '7px' }}>
                  <div className="flex justify-between items-baseline">
                    <span style={{ fontWeight: 700, fontSize: '11px', color: NAVY }}>{edu.school}</span>
                    <span style={{ fontSize: '9.5px', color: '#64748b' }}>
                      {edu.startDate && `${edu.startDate} – ${edu.endDate || 'Present'}`}
                    </span>
                  </div>
                  <p style={{ fontSize: '10px', color: '#475569', fontStyle: 'italic' }}>
                    {edu.degree}{edu.location ? ` · ${edu.location}` : ''}
                  </p>
                  {edu.description && (
                    <p style={{ fontSize: '9.5px', color: '#64748b', marginTop: '2px' }}>{edu.description}</p>
                  )}
                </div>
              ) : null
            )}
          </section>
        )}

        {/* Projects */}
        {projects.some((p) => p.name) && (
          <section>
            <SectionHead title="Notable Projects" />
            {projects.map((proj, i) =>
              proj.name ? (
                <div key={i} style={{ marginBottom: '7px' }}>
                  <div className="flex justify-between items-baseline">
                    <span style={{ fontWeight: 700, fontSize: '11px', color: NAVY }}>
                      {proj.name}
                      {proj.technologies && (
                        <span style={{ fontWeight: 400, fontStyle: 'italic', color: '#64748b', fontSize: '9.5px' }}>
                          {' '}· {proj.technologies}
                        </span>
                      )}
                    </span>
                    <span style={{ fontSize: '9.5px', color: '#64748b', whiteSpace: 'nowrap', marginLeft: '12px' }}>
                      {proj.startDate && `${proj.startDate}${proj.endDate ? ` – ${proj.endDate}` : ''}`}
                    </span>
                  </div>
                  {proj.description && (
                    <ul style={{ paddingLeft: '14px', margin: '2px 0 0' }}>
                      {toLines(proj.description).map((l, j) => (
                        <li key={j} style={{ fontSize: '10px', color: '#475569', marginBottom: '1px', listStyleType: 'disc' }}>{l}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : null
            )}
          </section>
        )}

        {/* Skills */}
        {skills.some((s) => s.name) && (
          <section>
            <SectionHead title="Core Competencies" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 0' }}>
              {skills.map((sk, i) => {
                if (!sk.name) return null;
                const levelText = sk.level && !/^\d+$/.test(sk.level.trim()) ? sk.level : null;
                return (
                  <div key={i} style={{ width: '100%', marginBottom: '3px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: NAVY }}>{sk.name}</span>
                    {levelText && (
                      <span style={{ fontSize: '9.5px', color: '#475569' }}>
                        {'  ·  '}
                        {levelText.split(',').map((item, j) => (
                          <React.Fragment key={j}>
                            {j > 0 && <span style={{ color: TEAL }}> · </span>}
                            {item.trim()}
                          </React.Fragment>
                        ))}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Achievements */}
        {achievements.some((a) => a.name) && (
          <section>
            <SectionHead title="Awards & Recognition" />
            {achievements.map((ach, i) =>
              ach.name ? (
                <div key={i} style={{ marginBottom: '5px', display: 'flex', gap: '8px' }}>
                  <span style={{ color: TEAL, fontSize: '10px', flexShrink: 0 }}>◆</span>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '10.5px', color: NAVY }}>{ach.name}</span>
                    {ach.technologies && (
                      <span style={{ fontSize: '9.5px', color: '#64748b' }}> · {ach.technologies}</span>
                    )}
                    {ach.description && (
                      <p style={{ fontSize: '9.5px', color: '#475569', marginTop: '1px' }}>{ach.description}</p>
                    )}
                  </div>
                </div>
              ) : null
            )}
          </section>
        )}
      </div>
    </div>
  );
};
