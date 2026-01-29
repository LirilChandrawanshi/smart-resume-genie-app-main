import React from 'react';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';

interface ResumePreviewProps {
  resumeData: any;
  selectedTemplate?: string;
}

// Template-specific accent colors and styles
const TEMPLATE_STYLES: Record<string, { border: string; heading: string; link: string; progress: string; headerBg?: string; font?: string }> = {
  default: { border: 'border-t-blue-500', heading: 'text-blue-600', link: 'text-blue-600 hover:underline', progress: '[&_.bg-primary]:!bg-blue-500', font: 'font-sans' },
  jake: { border: 'border-t-indigo-600', heading: 'text-indigo-600', link: 'text-indigo-600 hover:underline', progress: '[&_.bg-primary]:!bg-indigo-600', headerBg: 'bg-indigo-50', font: 'font-sans' },
  modern: { border: 'border-t-slate-600', heading: 'text-slate-700 uppercase tracking-wider', link: 'text-slate-600 hover:underline', progress: '[&_.bg-primary]:!bg-slate-600', font: 'font-sans' },
  classic: { border: 'border-t-gray-700', heading: 'text-gray-800 font-serif', link: 'text-gray-700 hover:underline', progress: '[&_.bg-primary]:!bg-gray-700', font: 'font-serif' },
  minimalist: { border: 'border-t-slate-400', heading: 'text-slate-600 text-sm font-medium tracking-widest', link: 'text-slate-500 hover:underline', progress: '[&_.bg-primary]:!bg-slate-400', font: 'font-sans' },
  creative: { border: 'border-t-purple-600', heading: 'text-purple-600', link: 'text-purple-600 hover:underline', progress: '[&_.bg-primary]:!bg-purple-500', headerBg: 'bg-purple-50', font: 'font-sans' },
  professional: { border: 'border-t-emerald-600', heading: 'text-emerald-700', link: 'text-emerald-600 hover:underline', progress: '[&_.bg-primary]:!bg-emerald-600', font: 'font-sans' },
  academic: { border: 'border-t-red-800', heading: 'text-red-800', link: 'text-red-700 hover:underline', progress: '[&_.bg-primary]:!bg-red-700', font: 'font-sans' },
};

const getTemplateStyles = (template: string) => TEMPLATE_STYLES[template] || TEMPLATE_STYLES.default;

const ResumePreview: React.FC<ResumePreviewProps> = ({ resumeData, selectedTemplate = 'default' }) => {
  const { personalInfo, experience, education, skills, projects, achievements = [] } = resumeData;
  const styles = getTemplateStyles(selectedTemplate);

  return (
    <div className="resume-preview-wrapper">
      <p className="text-xs text-muted-foreground mb-1">PDF downloads as one page (content scaled to fit).</p>
      <Card className={`w-full shadow-lg border-t-4 resume-preview bg-white ${styles.border} ${styles.font}`}>
      <CardContent className="p-5 space-y-3">
        {/* Header Section */}
        <div className={`text-center pb-4 border-b ${styles.headerBg || ''}`}>
          <h1 className="text-2xl font-bold mb-1">{personalInfo.name || 'Your Name'}</h1>
          <p className="text-lg text-muted-foreground">{personalInfo.title || 'Professional Title'}</p>
          
          <div className="flex flex-wrap justify-center gap-3 mt-2 text-sm text-muted-foreground">
            {personalInfo.email && (
              <div className="flex items-center">
                <span className="ml-1">{personalInfo.email}</span>
              </div>
            )}
            
            {personalInfo.phone && (
              <div className="flex items-center">
                <span className="mx-1">•</span>
                <span className="ml-1">{personalInfo.phone}</span>
              </div>
            )}
            
            {personalInfo.location && (
              <div className="flex items-center">
                <span className="mx-1">•</span>
                <span className="ml-1">{personalInfo.location}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Summary Section */}
        {personalInfo.summary && (
          <div className="resume-section">
            <h2 className={`text-base font-semibold mb-2 ${styles.heading}`}>PROFESSIONAL SUMMARY</h2>
            <p className="text-sm">{personalInfo.summary}</p>
          </div>
        )}
        
        {/* Experience Section */}
        {experience.some(exp => exp.title || exp.company) && (
          <div className="resume-section">
            <h2 className={`text-base font-semibold mb-3 ${styles.heading}`}>EXPERIENCE</h2>
            <div className="space-y-4">
              {experience.map((exp, index) => (
                (exp.title || exp.company) && (
                  <div key={exp.id || index} className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{exp.title || 'Position Title'}</h3>
                        <p className="text-sm text-muted-foreground">{exp.company || 'Company Name'}{exp.location ? `, ${exp.location}` : ''}</p>
                      </div>
                      {(exp.startDate || exp.endDate) && (
                        <p className="text-sm text-muted-foreground whitespace-nowrap">
                          {exp.startDate || 'Start Date'} - {exp.endDate || 'Present'}
                        </p>
                      )}
                    </div>
                    {exp.description && <p className="text-sm mt-1">{exp.description}</p>}
                  </div>
                )
              ))}
            </div>
          </div>
        )}
        
        {/* Education Section */}
        {education.some(edu => edu.degree || edu.school) && (
          <div className="resume-section">
            <h2 className={`text-lg font-semibold mb-3 ${styles.heading}`}>EDUCATION</h2>
            <div className="space-y-4">
              {education.map((edu, index) => (
                (edu.degree || edu.school) && (
                  <div key={edu.id || index} className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{edu.degree || 'Degree'}</h3>
                        <p className="text-sm text-muted-foreground">{edu.school || 'School Name'}{edu.location ? `, ${edu.location}` : ''}</p>
                      </div>
                      {(edu.startDate || edu.endDate) && (
                        <p className="text-sm text-muted-foreground whitespace-nowrap">
                          {edu.startDate || 'Start Date'} - {edu.endDate || 'End Date'}
                        </p>
                      )}
                    </div>
                    {edu.description && <p className="text-sm mt-1">{edu.description}</p>}
                  </div>
                )
              ))}
            </div>
          </div>
        )}
        
        {/* Projects Section */}
        {projects.some(project => project.name) && (
          <div className="resume-section">
            <h2 className={`text-lg font-semibold mb-3 ${styles.heading}`}>PROJECTS</h2>
            <div className="space-y-4">
              {projects.map((project, index) => (
                project.name && (
                  <div key={project.id || index} className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{project.name}</h3>
                        {project.technologies && (
                          <p className="text-sm text-muted-foreground">{project.technologies}</p>
                        )}
                      </div>
                      {(project.startDate || project.endDate) && (
                        <p className="text-sm text-muted-foreground whitespace-nowrap">
                          {project.startDate || 'Start Date'} - {project.endDate || 'Present'}
                        </p>
                      )}
                    </div>
                    {project.description && <p className="text-sm mt-1">{project.description}</p>}
                    {project.url && (
                      <p className="text-sm mt-1">
                        <a href={project.url} target="_blank" rel="noopener noreferrer" className={styles.link}>
                          View Project
                        </a>
                      </p>
                    )}
                  </div>
                )
              ))}
            </div>
          </div>
        )}
        
        {/* Skills Section */}
        {skills.some(skill => skill.name) && (
          <div className="resume-section">
            <h2 className={`text-lg font-semibold mb-3 ${styles.heading}`}>SKILLS</h2>
            <div className="grid grid-cols-1 gap-2">
              {skills.map((skill, index) => (
                skill.name && (
                  <div key={skill.id || index} className="flex flex-col">
                    <div className="flex justify-between text-sm">
                      <span>{skill.name}</span>
                      <span>{skill.level}%</span>
                    </div>
                    <div className={styles.progress}>
                      <Progress value={parseInt(skill.level)} className="h-2 mt-1" />
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        )}
        
        {/* Achievements Section */}
        {achievements && achievements.length > 0 && achievements.some(achievement => achievement.name) && (
          <div className="resume-section">
            <h2 className={`text-lg font-semibold mb-3 ${styles.heading}`}>ACHIEVEMENTS</h2>
            <div className="space-y-4">
              {achievements.map((achievement, index) => (
                achievement.name && (
                  <div key={achievement.id || index} className="pb-2">
                    <div>
                      <h3 className="font-medium">{achievement.name}</h3>
                      {achievement.technologies && (
                        <p className="text-sm text-muted-foreground">{achievement.technologies}</p>
                      )}
                    </div>
                    {achievement.description && <p className="text-sm mt-1">{achievement.description}</p>}
                    {achievement.url && (
                      <p className="text-sm mt-1">
                        <a href={achievement.url} target="_blank" rel="noopener noreferrer" className={styles.link}>
                          View Achievement
                        </a>
                      </p>
                    )}
                  </div>
                )
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  );
};

export default ResumePreview;
