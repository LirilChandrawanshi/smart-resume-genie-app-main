import React from 'react';
import type { ResumeData } from './types';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section style={{ marginTop: '8px' }}>
    <h2
      className="font-bold uppercase"
      style={{ fontSize: '11px', letterSpacing: '0.04em', color: '#111827', marginBottom: '2px' }}
    >
      {title}
    </h2>
    <div style={{ height: '1px', backgroundColor: '#111827', marginBottom: '5px' }} />
    {children}
  </section>
);

const SubHeading: React.FC<{
  leftTop: string;
  rightTop?: string;
  leftBottom?: string;
  rightBottom?: string;
}> = ({ leftTop, rightTop, leftBottom, rightBottom }) => (
  <div style={{ marginBottom: '4px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', fontSize: '10px' }}>
      <strong>{leftTop}</strong>
      <span>{rightTop}</span>
    </div>
    {(leftBottom || rightBottom) && (
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', fontSize: '9px', color: '#374151' }}>
        <em>{leftBottom}</em>
        <em>{rightBottom}</em>
      </div>
    )}
  </div>
);

const BulletList: React.FC<{ text?: string }> = ({ text }) => {
  if (!text) return null;
  const parts = text
    .split('\n')
    .map((p) => p.replace(/^[\s•\-–]+/, '').trim())
    .filter(Boolean);
  return (
    <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '9px', lineHeight: 1.35 }}>
      {(parts.length ? parts : [text]).slice(0, 4).map((p, i) => (
        <li key={i} style={{ marginBottom: '2px' }}>{p}</li>
      ))}
    </ul>
  );
};

export const DeveloperProTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const p = data.personalInfo || {};
  const exp = data.experience || [];
  const edu = data.education || [];
  const skills = data.skills || [];
  const projects = data.projects || [];
  const achievements = data.achievements || [];

  return (
    <div
      style={{
        width: '100%',
        minHeight: '1056px',
        backgroundColor: '#fff',
        color: '#111827',
        fontFamily: 'Arial, Helvetica, sans-serif',
        padding: '20px 22px',
        lineHeight: 1.3,
      }}
    >
      <header style={{ marginBottom: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
          <h1 className="font-black" style={{ fontSize: '26px', lineHeight: 1.05 }}>
            {p.name || 'Your Name'}
          </h1>
          <div style={{ fontSize: '9px', textAlign: 'right' }}>
            {p.email && <div>Email: {p.email}</div>}
            {p.phone && <div>Mobile: {p.phone}</div>}
            {p.linkedin && <div>LinkedIn: {p.linkedin}</div>}
          </div>
        </div>
        <div style={{ fontSize: '9px', color: '#374151', marginTop: '2px' }}>
          {p.github && <span>GitHub: {p.github}</span>}
          {p.location && <span>{p.github ? ' · ' : ''}{p.location}</span>}
        </div>
      </header>

      <Section title="Education">
        {edu.slice(0, 2).map((e, i) => (
          <div key={e.id || i} style={{ marginBottom: '4px' }}>
            <SubHeading
              leftTop={e.school || 'University'}
              rightTop={e.location || ''}
              leftBottom={e.degree || 'Degree'}
              rightBottom={[e.startDate, e.endDate].filter(Boolean).join(' - ')}
            />
            {e.description && <div style={{ fontSize: '8.8px', color: '#4b5563' }}>{e.description}</div>}
          </div>
        ))}
      </Section>

      <Section title="Skills Summary">
        <div style={{ fontSize: '9px' }}>
          {skills.slice(0, 12).map((s, i) => (
            <span key={s.id || i}>
              <strong>{s.name || 'Skill'}</strong>
              {s.level ? `: ${s.level}` : ''}
              {i < Math.min(11, skills.length - 1) ? ' · ' : ''}
            </span>
          ))}
        </div>
      </Section>

      <Section title="Experience">
        {exp.slice(0, 4).map((e, i) => (
          <div key={e.id || i} style={{ marginBottom: '5px' }}>
            <SubHeading
              leftTop={e.company || 'Company'}
              rightTop={e.location || ''}
              leftBottom={e.title || 'Role'}
              rightBottom={[e.startDate, e.endDate].filter(Boolean).join(' - ') || ''}
            />
            <BulletList text={e.description} />
          </div>
        ))}
      </Section>

      <Section title="Projects">
        {projects.slice(0, 4).map((pr, i) => (
          <div key={pr.id || i} style={{ marginBottom: '5px' }}>
            <div style={{ fontSize: '9.5px' }}>
              <strong>{pr.name || 'Project'}</strong>
              {pr.technologies && <span style={{ color: '#374151' }}> ({pr.technologies})</span>}
            </div>
            {pr.description && <div style={{ fontSize: '8.8px', color: '#4b5563' }}>{pr.description}</div>}
          </div>
        ))}
      </Section>

      {achievements.length > 0 && (
        <Section title="Honors and Awards">
          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '9px' }}>
            {achievements.slice(0, 5).map((a, i) => (
              <li key={a.id || i} style={{ marginBottom: '2px' }}>
                <strong>{a.name || 'Award'}</strong>{a.description ? ` — ${a.description}` : ''}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {p.summary && (
        <Section title="Summary">
          <div style={{ fontSize: '9px', color: '#374151' }}>{p.summary}</div>
        </Section>
      )}
    </div>
  );
};

