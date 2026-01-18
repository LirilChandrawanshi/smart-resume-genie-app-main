
import React from 'react';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';

interface ResumePreviewProps {
  resumeData: any;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ resumeData }) => {
  const { personalInfo, experience, education, skills, projects } = resumeData;

  return (
    <Card className="w-full shadow-lg border-t-4 border-t-resume-primary resume-preview bg-white">
      <CardContent className="p-6 space-y-6">
        {/* Header Section */}
        <div className="text-center pb-4 border-b">
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
            <h2 className="text-lg font-semibold text-resume-primary mb-2">PROFESSIONAL SUMMARY</h2>
            <p className="text-sm">{personalInfo.summary}</p>
          </div>
        )}
        
        {/* Experience Section */}
        {experience.some(exp => exp.title || exp.company) && (
          <div className="resume-section">
            <h2 className="text-lg font-semibold text-resume-primary mb-3">EXPERIENCE</h2>
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
            <h2 className="text-lg font-semibold text-resume-primary mb-3">EDUCATION</h2>
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
            <h2 className="text-lg font-semibold text-resume-primary mb-3">PROJECTS</h2>
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
                        <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-resume-primary hover:underline">
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
            <h2 className="text-lg font-semibold text-resume-primary mb-3">SKILLS</h2>
            <div className="grid grid-cols-1 gap-2">
              {skills.map((skill, index) => (
                skill.name && (
                  <div key={skill.id || index} className="flex flex-col">
                    <div className="flex justify-between text-sm">
                      <span>{skill.name}</span>
                      <span>{skill.level}%</span>
                    </div>
                    <Progress value={parseInt(skill.level)} className="h-2 mt-1" />
                  </div>
                )
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResumePreview;
