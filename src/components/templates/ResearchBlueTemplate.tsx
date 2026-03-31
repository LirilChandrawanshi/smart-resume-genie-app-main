import React from 'react';
import type { ResumeData } from './types';

const TITLE_BLUE = '#00199e';
const SUBTITLE_BLUE = '#2ec1e0';
const TEXT = '#222222';

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ marginTop: '10px', marginBottom: '5px' }}>
    <h2
      className="font-bold"
      style={{
        fontSize: '13px',
        color: TITLE_BLUE,
        lineHeight: 1.1,
      }}
    >
      {title}
    </h2>
    <div style={{ height: '1px', backgroundColor: '#dbeafe', marginTop: '3px' }} />
  </div>
);

const BlueItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ color: SUBTITLE_BLUE, fontWeight: 700, fontSize: '10px' }}>{children}</div>
);

export const ResearchBlueTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const p = data.personalInfo || {};
  const experience = data.experience || [];
  const education = data.education || [];
  const projects = data.projects || [];
  const skills = data.skills || [];
  const achievements = data.achievements || [];

  return (
    <div
      style={{
        width: '100%',
        minHeight: '1056px',
        backgroundColor: '#ffffff',
        color: TEXT,
        fontFamily: 'Source Sans Pro, Arial, sans-serif',
        fontSize: '9.5px',
        lineHeight: 1.35,
        padding: '22px',
      }}
    >
      <header style={{ marginBottom: '8px' }}>
        <h1 className="font-black" style={{ fontSize: '30px', color: TITLE_BLUE, lineHeight: 1.05 }}>
          {p.name || 'Your Name'}
        </h1>
        <div style={{ marginTop: '4px', color: '#334155' }}>
          {p.location && <div>{p.location}</div>}
          {p.phone && <div>Mobile: {p.phone}</div>}
          {p.email && <div>Email: {p.email}</div>}
          {p.linkedin && <div>LinkedIn: {p.linkedin}</div>}
          {p.github && <div>GitHub: {p.github}</div>}
        </div>
      </header>

      <SectionTitle title="Personal Profile" />
      <p>{p.summary || 'Robotics researcher specializing in Vision-Language-Action models and robot learning.'}</p>

      <SectionTitle title="Education" />
      {education.slice(0, 3).map((ed, i) => (
        <div key={ed.id || i} style={{ marginBottom: '6px' }}>
          <BlueItem>
            {[ed.startDate, ed.endDate].filter(Boolean).join(' - ') || 'Dates'}: {ed.degree || 'Degree'}
          </BlueItem>
          <div style={{ fontStyle: 'italic' }}>{ed.school || 'University'}{ed.location ? `, ${ed.location}` : ''}</div>
          {ed.description && <div style={{ marginTop: '1px' }}>{ed.description}</div>}
        </div>
      ))}

      <SectionTitle title="Experience" />
      {experience.slice(0, 4).map((exp, i) => (
        <div key={exp.id || i} style={{ marginBottom: '7px' }}>
          <BlueItem>
            {[exp.startDate, exp.endDate].filter(Boolean).join(' - ') || 'Dates'}: {exp.title || 'Role'}
          </BlueItem>
          <div style={{ fontStyle: 'italic' }}>{exp.company || 'Organization'}{exp.location ? `, ${exp.location}` : ''}</div>
          {exp.description && <div style={{ marginTop: '2px' }}>{exp.description}</div>}
        </div>
      ))}

      {achievements.length > 0 && (
        <>
          <SectionTitle title="Academic Publications" />
          {achievements.slice(0, 3).map((a, i) => (
            <div key={a.id || i} style={{ marginBottom: '5px' }}>
              <BlueItem>{a.name || 'Publication title'}</BlueItem>
              <div>{a.description || 'Publication details'}</div>
            </div>
          ))}
        </>
      )}

      <SectionTitle title="Projects / Research" />
      {projects.slice(0, 3).map((pr, i) => (
        <div key={pr.id || i} style={{ marginBottom: '6px' }}>
          <BlueItem>
            {pr.name || 'Project'} {pr.startDate || pr.endDate ? `| ${[pr.startDate, pr.endDate].filter(Boolean).join(' - ')}` : ''}
          </BlueItem>
          <div style={{ fontStyle: 'italic' }}>{pr.technologies || 'Research Lab / Stack'}</div>
          <div>{pr.description || 'Project summary and impact.'}</div>
        </div>
      ))}

      <SectionTitle title="Skills" />
      <div>
        {skills.slice(0, 12).map((s, i) => (
          <span key={s.id || i}>
            {s.name || 'Skill'}{s.level ? ` (${s.level})` : ''}{i < Math.min(11, skills.length - 1) ? ', ' : ''}
          </span>
        ))}
      </div>
    </div>
  );
};

