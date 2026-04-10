/**
 * Professional Template
 * Two-column header · left indigo accent bar on sections · skill tags
 * Clean, corporate, versatile — works for any industry
 */
import React from 'react';
import type { ResumeData } from './types';
import { MailIcon, PhoneIcon, GitHubIcon, LinkedInIcon, LeetCodeIcon, buildProfileUrl } from './ContactIcons';

const INDIGO = '#4f46e5';
const LIGHT  = '#eef2ff';

const toLines = (s: string) =>
  s.split('\n').map((l) => l.replace(/^[\s•\-–]+/, '').trim()).filter(Boolean);

const SectionHead: React.FC<{ title: string }> = ({ title }) => (
  <div
    style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', marginBottom: '8px' }}
  >
    <div style={{ width: '3px', height: '14px', backgroundColor: INDIGO, borderRadius: '2px', flexShrink: 0 }} />
    <h2
      className="font-bold uppercase tracking-wider"
      style={{ fontSize: '9px', color: INDIGO, letterSpacing: '0.15em' }}
    >
      {title}
    </h2>
    <div style={{ flex: 1, height: '0.5px', backgroundColor: '#c7d2fe' }} />
  </div>
);

const SkillPill: React.FC<{ name: string }> = ({ name }) => (
  <span
    style={{
      display: 'inline-block',
      fontSize: '8.5px',
      padding: '2px 8px',
      backgroundColor: LIGHT,
      color: '#3730a3',
      borderRadius: '4px',
      marginRight: '4px',
      marginBottom: '3px',
      fontWeight: 500,
      border: '1px solid #c7d2fe',
    }}
  >
    {name}
  </span>
);

export const ProfessionalTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personalInfo: p, experience, education, skills, projects, achievements = [] } = data;

  return (
    <div
      className="bg-white"
      style={{ fontFamily: '"Arial", "Helvetica", sans-serif', fontSize: '10.5px', color: '#1e1b4b' }}
    >
      {/* ── Header ── */}
      <div style={{ padding: '28px 32px 20px', borderBottom: `3px solid ${INDIGO}` }}>
        <div className="flex justify-between items-start">
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e1b4b', letterSpacing: '-0.02em', marginBottom: '2px' }}>
              {p.name || 'Your Name'}
            </h1>
            {p.title && (
              <p style={{ fontSize: '11px', color: INDIGO, fontWeight: 600, letterSpacing: '0.04em' }}>
                {p.title}
              </p>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            {p.location && <p style={{ fontSize: '9.5px', color: '#4b5563', marginBottom: '2px' }}>{p.location}</p>}
            {p.email && <p style={{ fontSize: '9.5px', color: '#4b5563', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'flex-end' }}><MailIcon size={9} /><a href={`mailto:${p.email}`} style={{ color: '#4b5563', textDecoration: 'none' }}>{p.email}</a></p>}
            {p.phone && <p style={{ fontSize: '9.5px', color: '#4b5563', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'flex-end' }}><PhoneIcon size={9} />{p.phone}</p>}
            {p.linkedin && <p style={{ fontSize: '9.5px', color: INDIGO, marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}><LinkedInIcon size={9} /><a href={buildProfileUrl('https://linkedin.com/in/', 'linkedin.com', p.linkedin)} style={{ color: INDIGO, textDecoration: 'none' }}>LinkedIn</a></p>}
            {p.github && <p style={{ fontSize: '9.5px', color: INDIGO, marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}><GitHubIcon size={9} /><a href={buildProfileUrl('https://github.com/', 'github.com', p.github)} style={{ color: INDIGO, textDecoration: 'none' }}>GitHub</a></p>}
            {(p as any).leetcode && <p style={{ fontSize: '9.5px', color: INDIGO, display: 'flex', alignItems: 'center', gap: '3px' }}><LeetCodeIcon size={9} /><a href={buildProfileUrl('https://leetcode.com/u/', 'leetcode.com', (p as any).leetcode)} style={{ color: INDIGO, textDecoration: 'none' }}>LeetCode</a></p>}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: '4px 32px 28px' }}>

        {/* Summary */}
        {p.summary && (
          <>
            <SectionHead title="Professional Summary" />
            <p style={{ fontSize: '10.5px', color: '#374151', lineHeight: 1.7, paddingLeft: '11px' }}>{p.summary}</p>
          </>
        )}

        {/* Experience */}
        {experience.some((e) => e.title || e.company) && (
          <>
            <SectionHead title="Professional Experience" />
            {experience.map((exp, i) =>
              exp.title || exp.company ? (
                <div key={i} style={{ marginBottom: '11px', paddingLeft: '11px' }}>
                  <div className="flex justify-between items-baseline">
                    <span style={{ fontWeight: 700, fontSize: '11px', color: '#1e1b4b' }}>{exp.company}</span>
                    <span
                      style={{ fontSize: '9px', color: '#fff', backgroundColor: INDIGO, padding: '1px 7px', borderRadius: '999px', whiteSpace: 'nowrap', marginLeft: '8px', fontWeight: 500 }}
                    >
                      {exp.startDate && `${exp.startDate} – ${exp.endDate || 'Present'}`}
                    </span>
                  </div>
                  <p style={{ fontSize: '10px', color: INDIGO, fontWeight: 600, fontStyle: 'italic', marginBottom: '4px' }}>
                    {exp.title}{exp.location ? ` · ${exp.location}` : ''}
                  </p>
                  {exp.description && (
                    <div style={{ margin: 0 }}>
                      {toLines(exp.description).map((l, j) => (
                        <div key={j} style={{ fontSize: '10px', color: '#374151', marginBottom: '2px', display: 'flex', alignItems: 'flex-start', gap: '5px' }}>
                          <span style={{ flexShrink: 0 }}>•</span><span>{l}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null
            )}
          </>
        )}

        {/* Education */}
        {education.some((e) => e.school || e.degree) && (
          <>
            <SectionHead title="Education" />
            {education.map((edu, i) =>
              edu.school || edu.degree ? (
                <div key={i} style={{ marginBottom: '8px', paddingLeft: '11px' }}>
                  <div className="flex justify-between items-baseline">
                    <span style={{ fontWeight: 700, fontSize: '11px', color: '#1e1b4b' }}>{edu.school}</span>
                    <span
                      style={{ fontSize: '9px', color: '#fff', backgroundColor: INDIGO, padding: '1px 7px', borderRadius: '999px', whiteSpace: 'nowrap', marginLeft: '8px', fontWeight: 500 }}
                    >
                      {edu.startDate && `${edu.startDate} – ${edu.endDate || 'Present'}`}
                    </span>
                  </div>
                  <p style={{ fontSize: '10px', color: '#4b5563', fontStyle: 'italic' }}>
                    {edu.degree}{edu.location ? ` · ${edu.location}` : ''}
                  </p>
                  {edu.description && (
                    <p style={{ fontSize: '9.5px', color: '#6b7280', marginTop: '2px' }}>{edu.description}</p>
                  )}
                </div>
              ) : null
            )}
          </>
        )}

        {/* Skills */}
        {skills.some((s) => s.name) && (
          <>
            <SectionHead title="Technical Skills" />
            <div style={{ paddingLeft: '11px' }}>
              {skills.map((sk, i) =>
                sk.name ? (
                  <div key={i} style={{ marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, fontSize: '10px', color: '#1e1b4b', marginRight: '8px' }}>{sk.name}:</span>
                    {sk.level && (
                      sk.level.includes(',') || !(/^\d+$/.test(sk.level.trim())) ? (
                        sk.level.split(',').map((item, j) => (
                          <SkillPill key={j} name={item.trim()} />
                        ))
                      ) : (
                        <div style={{ display: 'inline-block', width: '120px', height: '6px', backgroundColor: '#e0e7ff', borderRadius: '3px', verticalAlign: 'middle' }}>
                          <div style={{ width: `${sk.level}%`, height: '100%', backgroundColor: INDIGO, borderRadius: '3px' }} />
                        </div>
                      )
                    )}
                  </div>
                ) : null
              )}
            </div>
          </>
        )}

        {/* Projects */}
        {projects.some((p) => p.name) && (
          <>
            <SectionHead title="Key Projects" />
            {projects.map((proj, i) =>
              proj.name ? (
                <div key={i} style={{ marginBottom: '9px', paddingLeft: '11px' }}>
                  <div className="flex justify-between items-baseline">
                    <span style={{ fontWeight: 700, fontSize: '11px', color: '#1e1b4b' }}>
                      {proj.name}
                      {proj.technologies && (
                        <span style={{ fontWeight: 400, fontStyle: 'italic', color: '#6b7280', fontSize: '9.5px' }}>  · {proj.technologies}</span>
                      )}
                    </span>
                    <span
                      style={{ fontSize: '9px', color: '#fff', backgroundColor: INDIGO, padding: '1px 7px', borderRadius: '999px', whiteSpace: 'nowrap', marginLeft: '8px', fontWeight: 500 }}
                    >
                      {proj.startDate && `${proj.startDate}${proj.endDate ? ` – ${proj.endDate}` : ''}`}
                    </span>
                  </div>
                  {proj.description && (
                    <div style={{ margin: '3px 0 0' }}>
                      {toLines(proj.description).map((l, j) => (
                        <div key={j} style={{ fontSize: '10px', color: '#374151', marginBottom: '1px', display: 'flex', alignItems: 'flex-start', gap: '5px' }}>
                          <span style={{ flexShrink: 0 }}>•</span><span>{l}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null
            )}
          </>
        )}

        {/* Achievements */}
        {achievements.some((a) => a.name) && (
          <>
            <SectionHead title="Awards & Achievements" />
            {achievements.map((ach, i) =>
              ach.name ? (
                <div key={i} style={{ marginBottom: '6px', paddingLeft: '11px', display: 'flex', gap: '8px' }}>
                  <span style={{ color: INDIGO, fontSize: '10px', flexShrink: 0, marginTop: '1px' }}>◆</span>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '10.5px', color: '#1e1b4b' }}>{ach.name}</span>
                    {ach.technologies && <span style={{ fontSize: '9px', color: '#6b7280' }}> · {ach.technologies}</span>}
                    {ach.description && (
                      <p style={{ fontSize: '9.5px', color: '#4b5563', marginTop: '2px' }}>{ach.description}</p>
                    )}
                  </div>
                </div>
              ) : null
            )}
          </>
        )}
      </div>
    </div>
  );
};
