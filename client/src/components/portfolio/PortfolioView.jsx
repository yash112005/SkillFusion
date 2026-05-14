import React from 'react';
import { 
  ExternalLink, Github, Linkedin, Mail, MapPin, 
  Code, Award, Briefcase, User, Sparkles, Star
} from 'lucide-react';

const PortfolioView = ({ data, theme }) => {
  if (!data) return null;

  const { intro, projects, analytics } = data;
  const primaryColor = theme?.primaryColor || '#4f46e5';
  const secondaryColor = theme?.secondaryColor || '#7c3aed';

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg transition-colors duration-500">
      
      {/* Dynamic Hero Section */}
      <section 
        className="relative py-24 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-white text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-black uppercase tracking-widest mb-6 animate-fade-in">
            <Sparkles className="w-3 h-3 inline mr-2" /> AI Optimized Portfolio
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight animate-slide-up">
            {intro?.headline}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed font-medium animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {intro?.fitSummary}
          </p>
        </div>
      </section>

      {/* Analytics Highlights (Optional for Recruiter Mode) */}
      <div className="container mx-auto px-6 -mt-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card bg-white dark:bg-dark-card p-6 shadow-2xl border-0 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Recruiter Match</p>
              <h4 className="text-xl font-black text-gray-900 dark:text-white">{data.portfolioScore}%</h4>
            </div>
          </div>
          <div className="card bg-white dark:bg-dark-card p-6 shadow-2xl border-0 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Impact Meter</p>
              <h4 className="text-xl font-black text-gray-900 dark:text-white">{analytics?.impactMeter}%</h4>
            </div>
          </div>
          <div className="card bg-white dark:bg-dark-card p-6 shadow-2xl border-0 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Completeness</p>
              <h4 className="text-xl font-black text-gray-900 dark:text-white">{analytics?.completeness}%</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Showcase */}
      <section className="py-24 container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-4">
          <div>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Featured Projects</h2>
            <div className="h-1.5 w-24 rounded-full mt-4" style={{ background: primaryColor }}></div>
          </div>
          <p className="text-gray-500 dark:text-gray-400 max-w-md text-sm font-medium">
            Hand-picked and AI-ranked projects that demonstrate direct relevance to the target role's core requirements.
          </p>
        </div>

        <div className="space-y-12">
          {projects?.map((project, idx) => (
            <div 
              key={idx}
              className={`group relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 rounded-[2.5rem] transition-all duration-500 ${
                project.isMostRelevant 
                  ? 'bg-gray-50 dark:bg-dark-card border-2' 
                  : 'bg-white dark:bg-transparent border border-gray-100 dark:border-gray-800'
              }`}
              style={{ borderColor: project.isMostRelevant ? primaryColor : 'transparent' }}
            >
              {project.isMostRelevant && (
                <div 
                  className="absolute -top-4 left-8 px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-xl animate-pulse"
                  style={{ background: primaryColor }}
                >
                  Most Relevant Project
                </div>
              )}

              {/* Project Preview Placeholder */}
              <div className="lg:col-span-5 aspect-video bg-gray-200 dark:bg-gray-800 rounded-3xl overflow-hidden relative group-hover:scale-[1.02] transition-transform duration-500">
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-600">
                  <Code className="w-16 h-16 opacity-20" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <button className="flex items-center text-white font-bold text-sm">
                    View Demo <ExternalLink className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>

              {/* Project Details */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-3xl font-black text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                    {project.title}
                  </h3>
                  <div className="flex items-center px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-black">
                    {project.relevanceScore}% Match
                  </div>
                </div>

                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {project.techStack?.map((tech, i) => (
                    <span key={i} className="px-4 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl text-xs font-bold border border-transparent hover:border-gray-300 dark:hover:border-gray-700 transition-all">
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center">
                    <Sparkles className="w-3 h-3 mr-2 text-yellow-500" /> Recruiter Impact
                  </h4>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200 bg-yellow-50/50 dark:bg-yellow-900/10 p-4 rounded-2xl border border-yellow-100/50 dark:border-yellow-900/20 italic">
                    "{project.recruiterImpact}"
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Skill Analysis Section */}
      <section className="py-24 bg-gray-50 dark:bg-dark-card/30">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-6">Skill Alignment Analysis</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-16 font-medium">
            {analytics?.skillVisibility}
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
             {/* Dynamic skills could go here */}
          </div>
        </div>
      </section>

      {/* Footer / Call to Action */}
      <footer className="py-24 text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-8">Ready to move forward?</h2>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="#" className="flex items-center px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black transition-transform hover:scale-105 active:scale-95 shadow-2xl">
              <Mail className="w-5 h-5 mr-3" /> Contact Me
            </a>
            <a href="#" className="flex items-center px-8 py-4 bg-white dark:bg-dark-card text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 rounded-2xl font-black transition-transform hover:scale-105 active:scale-95 shadow-xl">
              <Github className="w-5 h-5 mr-3" /> GitHub
            </a>
          </div>
          <p className="mt-16 text-gray-400 text-[10px] font-black uppercase tracking-widest">
            Generated by SkillFusion AI Career Agent &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>

    </div>
  );
};

export default PortfolioView;
