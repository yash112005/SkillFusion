import React, { forwardRef } from 'react';

const ResumePreview = forwardRef(({ data }, ref) => {
  const { personalInfo, summary, experience, education, skills, projects, customOverrides } = data;

  const fontStyle = {
    fontFamily: customOverrides?.font || 'Arial, sans-serif'
  };

  const accentColor = customOverrides?.color || '#000000';
  const marginSize = customOverrides?.margins || '1in';

  // Make sure sections fall back to default order if not provided
  const renderOrder = customOverrides?.sectionOrder || ['summary', 'experience', 'education', 'skills', 'projects'];
  const visibleSections = customOverrides?.visibleSections || renderOrder;

  const renderSection = (sectionId) => {
    if (!visibleSections.includes(sectionId)) return null;

    switch (sectionId) {
      case 'summary':
        if (!summary) return null;
        return (
          <section key="summary" className="mb-6">
            <h2 className="text-lg font-bold uppercase border-b-2 mb-2 pb-1" style={{ borderColor: accentColor, color: accentColor }}>
              Professional Summary
            </h2>
            <p className="text-sm leading-relaxed">{summary}</p>
          </section>
        );

      case 'experience':
        if (!experience || experience.length === 0 || !experience.some(e => e.title || e.company)) return null;
        return (
          <section key="experience" className="mb-6">
            <h2 className="text-lg font-bold uppercase border-b-2 mb-2 pb-1" style={{ borderColor: accentColor, color: accentColor }}>
              Experience
            </h2>
            {experience.map((exp, idx) => (
              <div key={idx} className="mb-4">
                <div className="flex justify-between font-bold text-sm">
                  <span style={{ color: accentColor }}>{exp.title}</span>
                  <span>{exp.startDate} {exp.endDate ? `- ${exp.endDate}` : ''}</span>
                </div>
                <div className="italic text-sm mb-1">{exp.company}</div>
                <div className="text-sm whitespace-pre-wrap leading-relaxed">{exp.description}</div>
              </div>
            ))}
          </section>
        );

      case 'education':
        if (!education || education.length === 0 || !education.some(e => e.degree || e.school)) return null;
        return (
          <section key="education" className="mb-6">
            <h2 className="text-lg font-bold uppercase border-b-2 mb-2 pb-1" style={{ borderColor: accentColor, color: accentColor }}>
              Education
            </h2>
            {education.map((edu, idx) => (
              <div key={idx} className="mb-2">
                <div className="flex justify-between font-bold text-sm">
                  <span style={{ color: accentColor }}>{edu.degree}</span>
                  <span>{edu.startDate} {edu.endDate ? `- ${edu.endDate}` : ''}</span>
                </div>
                <div className="text-sm">
                  <span className="italic">{edu.school}</span> {edu.gpa ? `| GPA: ${edu.gpa}` : ''}
                </div>
              </div>
            ))}
          </section>
        );

      case 'skills':
        if (!skills || skills.length === 0) return null;
        return (
          <section key="skills" className="mb-6">
            <h2 className="text-lg font-bold uppercase border-b-2 mb-2 pb-1" style={{ borderColor: accentColor, color: accentColor }}>
              Skills
            </h2>
            <p className="text-sm leading-relaxed">{skills.join(', ')}</p>
          </section>
        );

      case 'projects':
        if (!projects || projects.length === 0 || !projects.some(p => p.name)) return null;
        return (
          <section key="projects" className="mb-6">
            <h2 className="text-lg font-bold uppercase border-b-2 mb-2 pb-1" style={{ borderColor: accentColor, color: accentColor }}>
              Projects
            </h2>
            {projects.map((proj, idx) => (
              <div key={idx} className="mb-2">
                <div className="font-bold text-sm">
                  <span style={{ color: accentColor }}>{proj.name}</span> {proj.link && <span className="font-normal text-blue-600">({proj.link})</span>}
                </div>
                <div className="text-sm whitespace-pre-wrap">{proj.description}</div>
              </div>
            ))}
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      ref={ref} 
      className="bg-white text-black shadow-lg max-w-[800px] mx-auto w-full min-h-[1056px]"
      style={{ padding: marginSize, ...fontStyle }}
    >
      {/* Header */}
      <header className="text-center mb-6">
        <h1 className="text-3xl font-bold uppercase tracking-wider mb-2" style={{ color: accentColor }}>
          {personalInfo.name || 'Your Name'}
        </h1>
        <div className="text-sm space-x-2">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.email && personalInfo.phone && <span>|</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>| {personalInfo.location}</span>}
        </div>
        <div className="text-sm space-x-2 mt-1">
          {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
          {personalInfo.linkedin && personalInfo.portfolio && <span>|</span>}
          {personalInfo.portfolio && <span>{personalInfo.portfolio}</span>}
        </div>
      </header>

      {/* Render Sections in Custom Order */}
      {renderOrder.map(section => renderSection(section))}

    </div>
  );
});

ResumePreview.displayName = 'ResumePreview';

export default ResumePreview;
