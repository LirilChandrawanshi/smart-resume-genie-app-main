import React from 'react';
import type { ResumeData } from './types';

const Head: React.FC<{ t: string }> = ({ t }) => (
  <h3 className="font-bold uppercase" style={{ fontSize: '9px', letterSpacing: '0.12em', color: '#e2e8f0', marginBottom: '6px' }}>
    {t}
  </h3>
);

export const CompactSidebarTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const p = data.personalInfo || {};
  return (
    <div style={{ width: '100%', minHeight: '1056px', display: 'grid', gridTemplateColumns: '30% 70%', fontFamily: 'Inter, Arial, sans-serif' }}>
      <aside style={{ background: '#0f172a', color: '#f8fafc', padding: '20px 16px' }}>
        <div style={{ marginBottom: '14px' }}>
          <h1 className="font-black" style={{ fontSize: '18px', lineHeight: 1.2 }}>{p.name || 'Your Name'}</h1>
          <p style={{ fontSize: '10px', color: '#cbd5e1', marginTop: '3px' }}>{p.title || 'Professional Title'}</p>
        </div>

        <Head t="Contact" />
        <div style={{ fontSize: '9px', lineHeight: 1.5, color: '#cbd5e1', marginBottom: '12px' }}>
          {p.email && <div>{p.email}</div>}
          {p.phone && <div>{p.phone}</div>}
          {p.location && <div>{p.location}</div>}
          {p.linkedin && <div>{p.linkedin}</div>}
          {p.github && <div>{p.github}</div>}
        </div>

        <Head t="Skills" />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '12px' }}>
          {(data.skills || []).slice(0, 18).map((s, i) => (
            <span key={s.id || i} style={{ fontSize: '8px', padding: '2px 6px', borderRadius: '999px', border: '1px solid #334155', color: '#e2e8f0' }}>
              {s.name || 'Skill'}
            </span>
          ))}
        </div>

        <Head t="Education" />
        {(data.education || []).slice(0, 2).map((ed, i) => (
          <div key={ed.id || i} style={{ marginBottom: '8px' }}>
            <div style={{ fontSize: '9px', fontWeight: 700 }}>{ed.degree || 'Degree'}</div>
            <div style={{ fontSize: '8.5px', color: '#cbd5e1' }}>{ed.school || 'School'}</div>
          </div>
        ))}
      </aside>

      <main style={{ background: '#ffffff', color: '#0f172a', padding: '20px 20px 16px' }}>
        <section>
          <h2 className="font-bold uppercase" style={{ fontSize: '9px', letterSpacing: '0.12em', color: '#2563eb' }}>Summary</h2>
          <p style={{ fontSize: '10px', lineHeight: 1.55, marginTop: '4px' }}>{p.summary || 'Write a concise professional summary.'}</p>
        </section>

        <section style={{ marginTop: '12px' }}>
          <h2 className="font-bold uppercase" style={{ fontSize: '9px', letterSpacing: '0.12em', color: '#2563eb' }}>Experience</h2>
          {(data.experience || []).slice(0, 4).map((e, i) => (
            <div key={e.id || i} style={{ marginTop: '7px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                <strong style={{ fontSize: '10px' }}>{e.title || 'Role'} · {e.company || 'Company'}</strong>
                <span style={{ fontSize: '8.5px', color: '#64748b' }}>{[e.startDate, e.endDate].filter(Boolean).join(' - ')}</span>
              </div>
              {e.description && <p style={{ fontSize: '9.5px', lineHeight: 1.45 }}>{e.description}</p>}
            </div>
          ))}
        </section>

        <section style={{ marginTop: '12px' }}>
          <h2 className="font-bold uppercase" style={{ fontSize: '9px', letterSpacing: '0.12em', color: '#2563eb' }}>Projects</h2>
          {(data.projects || []).slice(0, 3).map((pr, i) => (
            <div key={pr.id || i} style={{ marginTop: '6px' }}>
              <strong style={{ fontSize: '10px' }}>{pr.name || 'Project'}</strong>
              <p style={{ fontSize: '9.5px', lineHeight: 1.4 }}>{pr.description || 'Project summary.'}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

