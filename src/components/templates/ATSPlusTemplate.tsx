import React from 'react';
import type { ResumeData } from './types';

const Row: React.FC<{ k: string; v?: string }> = ({ k, v }) =>
  v ? (
    <span style={{ fontSize: '9px', color: '#334155' }}>
      <strong>{k}:</strong> {v}
    </span>
  ) : null;

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ marginTop: '12px', marginBottom: '6px' }}>
    <h2
      className="font-bold uppercase"
      style={{ fontSize: '10px', color: '#0f172a', letterSpacing: '0.12em' }}
    >
      {title}
    </h2>
    <div style={{ height: '1px', backgroundColor: '#cbd5e1', marginTop: '4px' }} />
  </div>
);

export const ATSPlusTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const p = data.personalInfo || {};
  return (
    <div
      style={{
        width: '100%',
        minHeight: '1056px',
        background: '#fff',
        color: '#0f172a',
        fontFamily: 'Arial, Helvetica, sans-serif',
        padding: '22px 26px',
      }}
    >
      <header style={{ marginBottom: '8px' }}>
        <h1 className="font-black" style={{ fontSize: '28px', lineHeight: 1.1 }}>
          {p.name || 'Your Name'}
        </h1>
        <p style={{ fontSize: '12px', color: '#334155', marginTop: '2px' }}>{p.title || 'Professional Title'}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '8px' }}>
          <Row k="Email" v={p.email} />
          <Row k="Phone" v={p.phone} />
          <Row k="Location" v={p.location} />
          <Row k="LinkedIn" v={p.linkedin} />
          <Row k="GitHub" v={p.github} />
        </div>
      </header>

      <SectionTitle title="Summary" />
      <p style={{ fontSize: '10px', lineHeight: 1.55, color: '#1e293b' }}>{p.summary || 'Add a concise professional summary.'}</p>

      <SectionTitle title="Experience" />
      {(data.experience || []).slice(0, 4).map((e, i) => (
        <div key={e.id || i} style={{ marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
            <strong style={{ fontSize: '10px' }}>{e.title || 'Role'} · {e.company || 'Company'}</strong>
            <span style={{ fontSize: '9px', color: '#475569' }}>
              {[e.startDate, e.endDate].filter(Boolean).join(' - ') || 'Dates'}
            </span>
          </div>
          {e.location && <div style={{ fontSize: '9px', color: '#64748b' }}>{e.location}</div>}
          {e.description && (
            <p style={{ fontSize: '9.5px', lineHeight: 1.5, marginTop: '2px' }}>{e.description}</p>
          )}
        </div>
      ))}

      <SectionTitle title="Projects" />
      {(data.projects || []).slice(0, 3).map((pr, i) => (
        <div key={pr.id || i} style={{ marginBottom: '6px' }}>
          <strong style={{ fontSize: '10px' }}>{pr.name || 'Project'}</strong>
          {pr.technologies && <span style={{ fontSize: '9px', color: '#475569' }}> · {pr.technologies}</span>}
          <p style={{ fontSize: '9.5px', lineHeight: 1.45 }}>{pr.description || 'Project details.'}</p>
        </div>
      ))}

      <SectionTitle title="Skills" />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
        {(data.skills || []).slice(0, 14).map((s, i) => (
          <span
            key={s.id || i}
            style={{
              fontSize: '8.5px',
              padding: '2px 7px',
              borderRadius: '999px',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              background: '#f8fafc',
            }}
          >
            {s.name || 'Skill'}{s.level ? `: ${s.level}` : ''}
          </span>
        ))}
      </div>

      <SectionTitle title="Education" />
      {(data.education || []).slice(0, 2).map((ed, i) => (
        <div key={ed.id || i} style={{ marginBottom: '6px' }}>
          <strong style={{ fontSize: '10px' }}>{ed.degree || 'Degree'}</strong>
          <div style={{ fontSize: '9px', color: '#334155' }}>
            {ed.school || 'Institution'} {ed.location ? `· ${ed.location}` : ''}
          </div>
        </div>
      ))}
    </div>
  );
};

