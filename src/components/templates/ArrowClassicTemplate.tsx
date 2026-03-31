import React from 'react';
import type { ResumeData } from './types';

const BG = '#6b7280';
const SECT = '#5a5a78';
const SOFT = '#e5e7eb';

const Arrow: React.FC<{ color?: string }> = ({ color = BG }) => (
  <span
    style={{
      width: 0,
      height: 0,
      borderTop: '6px solid transparent',
      borderBottom: '6px solid transparent',
      borderLeft: `10px solid ${color}`,
      display: 'inline-block',
      marginRight: '5px',
      transform: 'translateY(1px)',
    }}
  />
);

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <div
    style={{
      marginTop: '10px',
      marginBottom: '6px',
      backgroundColor: SECT,
      color: '#fff',
      padding: '3px 8px',
      fontSize: '10px',
      fontWeight: 800,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      display: 'flex',
      alignItems: 'center',
    }}
  >
    <Arrow />
    <Arrow />
    <span>{title}</span>
  </div>
);

const Event: React.FC<{
  time: string;
  title: string;
  org: string;
  details?: string;
}> = ({ time, title, org, details }) => (
  <div style={{ marginBottom: '6px' }}>
    <div style={{ display: 'grid', gridTemplateColumns: '23% 52% 25%', columnGap: '8px', alignItems: 'baseline' }}>
      <span style={{ fontSize: '9px', color: BG }}>{time}</span>
      <strong style={{ fontSize: '10px' }}>{title}</strong>
      <span style={{ fontSize: '9px', color: SECT, textAlign: 'right' }}>{org}</span>
    </div>
    <div style={{ height: '1px', backgroundColor: SOFT, marginTop: '2px', marginBottom: '3px' }} />
    {details && (
      <div style={{ display: 'flex', alignItems: 'flex-start', fontSize: '9px', color: '#374151' }}>
        <Arrow color={BG} />
        <span style={{ lineHeight: 1.4 }}>{details}</span>
      </div>
    )}
  </div>
);

export const ArrowClassicTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const p = data.personalInfo || {};
  const experience = data.experience || [];
  const education = data.education || [];
  const projects = data.projects || [];
  const skills = data.skills || [];

  return (
    <div
      style={{
        width: '100%',
        minHeight: '1056px',
        background: '#fff',
        color: '#111827',
        fontFamily: 'Raleway, Arial, sans-serif',
        padding: '18px 22px 16px',
        fontSize: '9.5px',
        lineHeight: 1.35,
      }}
    >
      <header style={{ marginBottom: '8px' }}>
        <div
          style={{
            backgroundColor: BG,
            color: '#fff',
            padding: '6px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <h1 className="font-black" style={{ fontSize: '24px', textTransform: 'uppercase' }}>
            {p.name || 'Your Name'}
          </h1>
          <div style={{ width: '1px', height: '22px', backgroundColor: SECT }} />
          <span style={{ fontSize: '18px', textTransform: 'uppercase', fontWeight: 800 }}>Resume</span>
        </div>

        <div style={{ marginTop: '6px', fontSize: '9px', color: '#4b5563' }}>
          {[p.name, p.title, p.location, p.email, p.phone].filter(Boolean).join(' · ')}
        </div>
      </header>

      <SectionHeader title="Status / Meta" />
      <div style={{ fontSize: '9px', color: '#334155' }}>
        <div style={{ marginBottom: '2px' }}><strong>Status:</strong> {p.title || 'Software Developer'}</div>
        <div style={{ marginBottom: '2px' }}>
          <strong>Skills:</strong> {(skills || []).slice(0, 10).map((s) => s.name).filter(Boolean).join(', ') || 'Java, Python, React, SQL'}
        </div>
        <div><strong>Links:</strong> {[p.linkedin, p.github].filter(Boolean).join(' · ') || 'LinkedIn · GitHub'}</div>
      </div>

      <SectionHeader title="Summary" />
      <div style={{ fontSize: '9.3px' }}>
        {p.summary || 'Experienced software engineer with strong focus on building robust products, clean architecture, and measurable business impact.'}
      </div>

      <SectionHeader title="Experience" />
      {experience.slice(0, 4).map((e, i) => (
        <Event
          key={e.id || i}
          time={[e.startDate, e.endDate].filter(Boolean).join(' - ') || 'Dates'}
          title={e.title || 'Developer'}
          org={e.company || 'Company'}
          details={e.description || 'Implemented scalable features and collaborated with cross-functional teams to improve quality and delivery speed.'}
        />
      ))}

      <SectionHeader title="Education" />
      {education.slice(0, 3).map((ed, i) => (
        <Event
          key={ed.id || i}
          time={[ed.startDate, ed.endDate].filter(Boolean).join(' - ') || 'Dates'}
          title={ed.degree || "Bachelor's Degree"}
          org={ed.school || 'University'}
          details={ed.description || 'Relevant coursework and thesis/project highlights.'}
        />
      ))}

      {projects.length > 0 && (
        <>
          <SectionHeader title="Projects" />
          {projects.slice(0, 3).map((pr, i) => (
            <Event
              key={pr.id || i}
              time={[pr.startDate, pr.endDate].filter(Boolean).join(' - ') || 'Year'}
              title={pr.name || 'Project'}
              org={pr.technologies || 'Tech Stack'}
              details={pr.description || 'Project impact and implementation details.'}
            />
          ))}
        </>
      )}

      <div style={{ marginTop: '14px', backgroundColor: BG, color: '#fff', padding: '4px 8px', fontSize: '9px' }}>
        {[p.linkedin, p.github].filter(Boolean).join(' · ') || 'linkedin.com/in/your-profile · github.com/your-username'}
      </div>
    </div>
  );
};

