import React from 'react';
import type { ResumeData } from './types';

const Dot: React.FC = () => <span style={{ width: '4px', height: '4px', borderRadius: '999px', background: '#a855f7', display: 'inline-block' }} />;

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section style={{ marginTop: '12px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
      <Dot />
      <h2 className="font-bold uppercase" style={{ fontSize: '9px', letterSpacing: '0.14em', color: '#6d28d9' }}>{title}</h2>
    </div>
    {children}
  </section>
);

export const NeoMinimalTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const p = data.personalInfo || {};
  return (
    <div
      style={{
        width: '100%',
        minHeight: '1056px',
        background: 'linear-gradient(180deg,#ffffff 0%, #faf5ff 100%)',
        color: '#111827',
        fontFamily: 'Space Grotesk, Inter, Arial, sans-serif',
        padding: '20px 24px',
      }}
    >
      <header style={{ paddingBottom: '10px', borderBottom: '1px solid #e9d5ff' }}>
        <h1 className="font-black" style={{ fontSize: '26px', lineHeight: 1.1 }}>{p.name || 'Your Name'}</h1>
        <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>{p.title || 'Professional Title'}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '8px', fontSize: '9px', color: '#374151' }}>
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>{p.phone}</span>}
          {p.location && <span>{p.location}</span>}
          {p.linkedin && <span>{p.linkedin}</span>}
          {p.github && <span>{p.github}</span>}
        </div>
      </header>

      <Section title="Summary">
        <p style={{ fontSize: '10px', lineHeight: 1.55 }}>{p.summary || 'Craft a concise summary with impact and role alignment.'}</p>
      </Section>

      <Section title="Experience">
        {(data.experience || []).slice(0, 4).map((e, i) => (
          <div key={e.id || i} style={{ marginBottom: '7px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
              <strong style={{ fontSize: '10px' }}>{e.title || 'Role'} · {e.company || 'Company'}</strong>
              <span style={{ fontSize: '8.5px', color: '#6b7280' }}>{[e.startDate, e.endDate].filter(Boolean).join(' - ')}</span>
            </div>
            {e.description && <p style={{ fontSize: '9.5px', lineHeight: 1.45 }}>{e.description}</p>}
          </div>
        ))}
      </Section>

      <Section title="Skills">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 12px' }}>
          {(data.skills || []).slice(0, 14).map((s, i) => (
            <div key={s.id || i} style={{ fontSize: '9px' }}>
              <strong>{s.name || 'Skill'}</strong>{s.level ? ` - ${s.level}` : ''}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Projects">
        {(data.projects || []).slice(0, 3).map((pr, i) => (
          <div key={pr.id || i} style={{ marginBottom: '6px' }}>
            <strong style={{ fontSize: '10px' }}>{pr.name || 'Project'}</strong>
            {pr.technologies && <span style={{ fontSize: '8.5px', color: '#6b7280' }}> · {pr.technologies}</span>}
            <p style={{ fontSize: '9.5px', lineHeight: 1.4 }}>{pr.description || 'Project details.'}</p>
          </div>
        ))}
      </Section>
    </div>
  );
};

