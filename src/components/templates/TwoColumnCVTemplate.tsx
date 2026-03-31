import React from 'react';
import type { ResumeData } from './types';

const ACCENT = '#4f46e5';
const SOFT = '#eef2ff';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section style={{ marginBottom: '12px' }}>
    <h2
      className="font-bold"
      style={{
        fontSize: '11px',
        color: '#1f2937',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginBottom: '5px',
      }}
    >
      {title}
    </h2>
    <div style={{ height: '1px', backgroundColor: '#e5e7eb', marginBottom: '6px' }} />
    {children}
  </section>
);

const EventRow: React.FC<{
  time?: string;
  org?: string;
  role?: string;
  details?: string;
}> = ({ time, org, role, details }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '34% 66%', columnGap: '8px', marginBottom: '6px' }}>
    <div style={{ fontSize: '8.5px', color: '#6b7280' }}>{time || 'Year / Period'}</div>
    <div>
      <div style={{ fontSize: '9.5px', fontWeight: 700, color: '#111827' }}>{org || 'Organization'}</div>
      <div style={{ fontSize: '9px', color: ACCENT, fontWeight: 700 }}>{role || 'Role / Title'}</div>
      {details && <div style={{ fontSize: '8.8px', color: '#374151', lineHeight: 1.35, marginTop: '1px' }}>{details}</div>}
    </div>
  </div>
);

const FactRow: React.FC<{ k: string; v: string }> = ({ k, v }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '34% 66%', columnGap: '8px', marginBottom: '4px' }}>
    <div style={{ fontSize: '8.8px', color: '#4b5563', fontWeight: 700 }}>{k}</div>
    <div style={{ fontSize: '8.8px', color: '#374151' }}>{v}</div>
  </div>
);

export const TwoColumnCVTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const p = data.personalInfo || {};
  const exp = data.experience || [];
  const edu = data.education || [];
  const projects = data.projects || [];
  const achievements = data.achievements || [];
  const skills = data.skills || [];

  return (
    <div
      style={{
        width: '100%',
        minHeight: '1056px',
        background: '#fff',
        color: '#111827',
        fontFamily: 'Inter, Arial, sans-serif',
        padding: '18px 20px',
      }}
    >
      <header style={{ marginBottom: '10px' }}>
        <h1 className="font-black" style={{ fontSize: '28px', lineHeight: 1.1 }}>
          {p.name || "Patrick O'Hara"}
        </h1>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '66% 34%', columnGap: '12px' }}>
        <div>
          <Section title="Work experience">
            {exp.slice(0, 5).map((e, i) => (
              <EventRow
                key={e.id || i}
                time={[e.startDate, e.endDate].filter(Boolean).join(' -- ') || 'June 2009 -- Present'}
                org={e.company || 'Company'}
                role={e.title || 'Role'}
                details={e.description || 'Describe impact, responsibilities, and notable outcomes.'}
              />
            ))}
          </Section>

          <Section title="Education">
            {edu.slice(0, 4).map((e, i) => (
              <EventRow
                key={e.id || i}
                time={[e.startDate, e.endDate].filter(Boolean).join(' -- ') || '2011 -- 2015'}
                org={e.school || 'University / School'}
                role={e.degree || 'Degree / Program'}
                details={e.description}
              />
            ))}
          </Section>

          <Section title="Extra Curricular Activities">
            {projects.slice(0, 4).map((pr, i) => (
              <EventRow
                key={pr.id || i}
                time={[pr.startDate, pr.endDate].filter(Boolean).join(' -- ') || 'Year'}
                org={pr.technologies || 'Organization'}
                role={pr.name || 'Activity / Project'}
                details={pr.description}
              />
            ))}
          </Section>
        </div>

        <div>
          <div
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px',
              background: '#fafafa',
              marginBottom: '10px',
            }}
          >
            <div style={{ fontSize: '8.8px', color: '#374151', marginBottom: '3px' }}>{p.location || 'Address'}</div>
            <div style={{ fontSize: '8.8px', color: '#374151', marginBottom: '3px' }}>{p.phone || 'Phone'}</div>
            <div style={{ fontSize: '8.8px', color: '#374151', marginBottom: '3px' }}>{p.email || 'Email'}</div>
            {(p.linkedin || p.github) && (
              <div style={{ fontSize: '8.8px', color: ACCENT }}>{[p.linkedin, p.github].filter(Boolean).join(' · ')}</div>
            )}
          </div>

          <Section title="Communication skills">
            <FactRow k="English" v="Fluent / Native" />
            <FactRow k="Second language" v="Intermediate" />
          </Section>

          <Section title="Achievements">
            {(achievements.length ? achievements : [{ name: 'Degree', description: 'Completed with distinction' }]).slice(0, 5).map((a, i) => (
              <EventRow
                key={a.id || i}
                time="Year"
                org={a.name || 'Achievement'}
                role=""
                details={a.description}
              />
            ))}
          </Section>

          <Section title="Computer skills">
            <FactRow
              k="Good level"
              v={skills.slice(0, 5).map((s) => s.name).filter(Boolean).join(', ') || 'Microsoft Office, Email, Collaboration tools'}
            />
            <FactRow
              k="Basic level"
              v={skills.slice(5, 9).map((s) => s.name).filter(Boolean).join(', ') || 'GitHub, HTML'}
            />
          </Section>
        </div>
      </div>

      <div style={{ marginTop: '8px', height: '6px', background: `linear-gradient(90deg, ${ACCENT} 0%, ${SOFT} 100%)` }} />
    </div>
  );
};

