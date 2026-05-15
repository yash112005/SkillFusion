import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Sparkles, Save, Download, Share2, FileText, 
  RefreshCw, Layout, Edit3, Eye, ArrowLeft, Zap,
  TrendingUp, BarChart3, Layers, Plus, Check, Copy
} from 'lucide-react';
import { Github } from '../components/SocialIcons';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import PortfolioView from '../components/portfolio/PortfolioView';

const PortfolioBuilder = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { resumeText, jdText } = location.state || {};

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [viewMode, setViewMode] = useState('edit'); // 'edit' or 'preview'
  const [activeTab, setActiveTab] = useState('projects');
  const [copySuccess, setCopySuccess] = useState('');

  const generatePortfolio = async () => {
    if (!resumeText || !jdText) {
      navigate('/dashboard/candidate');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/portfolio/generate', { resumeText, jdText }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setData(res.data);
    } catch (err) {
      console.error("Failed to generate portfolio:", err);
      alert("AI was unable to generate your portfolio. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generatePortfolio();
  }, []);

  const handleExport = (type) => {
    let content = "";
    if (type === 'github') content = data.exports.githubReadme;
    if (type === 'ppt') content = data.exports.pptSkeleton;

    navigator.clipboard.writeText(content);
    setCopySuccess(type);
    setTimeout(() => setCopySuccess(''), 3000);
    alert(`${type.toUpperCase()} template copied to clipboard!`);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-dark-bg space-y-8">
      <div className="relative">
        <div className="w-32 h-32 border-4 border-indigo-200 dark:border-indigo-900/30 rounded-[2.5rem] animate-pulse"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Zap className="w-12 h-12 text-indigo-600 animate-bounce" />
        </div>
      </div>
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">AI Career Agent is Working</h2>
        <div className="flex flex-col space-y-2 text-gray-500 font-medium">
          <p className="animate-pulse">Analyzing project relevance...</p>
          <p className="animate-pulse delay-700">Optimizing descriptions for recruiters...</p>
          <p className="animate-pulse delay-1000">Generating impact metrics...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col">
      
      {/* Premium Header */}
      <header className="bg-white dark:bg-dark-card border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-[100] shadow-sm">
        <div className="flex items-center space-x-6">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-black text-gray-900 dark:text-white leading-none">Portfolio Builder Agent</h1>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Autonomous Showcase Mode</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
            <button 
              onClick={() => setViewMode('edit')}
              className={`flex items-center px-6 py-2 rounded-xl text-xs font-black transition-all ${viewMode === 'edit' ? 'bg-white dark:bg-dark-card text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Edit3 className="w-4 h-4 mr-2" /> BUILDER
            </button>
            <button 
              onClick={() => setViewMode('preview')}
              className={`flex items-center px-6 py-2 rounded-xl text-xs font-black transition-all ${viewMode === 'preview' ? 'bg-white dark:bg-dark-card text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Eye className="w-4 h-4 mr-2" /> PREVIEW
            </button>
          </div>
          
          <button onClick={generatePortfolio} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl text-gray-500 transition-colors group">
            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
          </button>

          <button className="btn-primary px-8 py-3 rounded-2xl flex items-center shadow-lg shadow-indigo-500/20">
            <Share2 className="w-4 h-4 mr-2" /> PUBLISH
          </button>
        </div>
      </header>

      {viewMode === 'edit' ? (
        <div className="flex-1 flex overflow-hidden">
          
          {/* Main Builder Area */}
          <main className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar">
            
            {/* Intro Editor */}
            <section className="space-y-6">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center">
                <User className="w-4 h-4 mr-2" /> Identity & Match Summary
              </h3>
              <div className="card bg-white dark:bg-dark-card p-8 border-0 shadow-2xl space-y-6 rounded-[2.5rem]">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">Headline</label>
                  <input 
                    className="w-full text-4xl font-black bg-transparent border-b-2 border-transparent focus:border-indigo-500 transition-colors outline-none pb-2 dark:text-white"
                    value={data.intro.headline}
                    onChange={(e) => setData({...data, intro: {...data.intro, headline: e.target.value}})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">Why I Fit</label>
                  <textarea 
                    className="w-full text-lg font-medium bg-transparent border-none focus:ring-0 outline-none leading-relaxed dark:text-gray-300 min-h-[100px] resize-none"
                    value={data.intro.fitSummary}
                    onChange={(e) => setData({...data, intro: {...data.intro, fitSummary: e.target.value}})}
                  />
                </div>
              </div>
            </section>

            {/* Projects Editor */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center">
                  <Layers className="w-4 h-4 mr-2" /> Ranked Projects Showcase
                </h3>
                <button className="flex items-center text-xs font-black text-indigo-600 hover:text-indigo-700">
                  <Plus className="w-4 h-4 mr-1" /> ADD PROJECT
                </button>
              </div>

              <div className="space-y-6">
                {data.projects.map((project, idx) => (
                  <div key={idx} className="card bg-white dark:bg-dark-card p-8 border-0 shadow-xl rounded-[2rem] group hover:shadow-2xl transition-all relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 group-hover:text-indigo-600 transition-colors">
                          <Code className="w-6 h-6" />
                        </div>
                        <div>
                          <input 
                            className="text-2xl font-black bg-transparent border-none focus:ring-0 outline-none dark:text-white"
                            value={project.title}
                            onChange={(e) => {
                              const newProjects = [...data.projects];
                              newProjects[idx].title = e.target.value;
                              setData({...data, projects: newProjects});
                            }}
                          />
                          <div className="flex items-center mt-1 space-x-2">
                             <span className="text-[10px] font-black uppercase text-green-500 flex items-center">
                               <TrendingUp className="w-3 h-3 mr-1" /> {project.relevanceScore}% RELEVANT
                             </span>
                             {project.isMostRelevant && (
                               <span className="text-[10px] font-black uppercase bg-indigo-600 text-white px-2 py-0.5 rounded-full">Top Pick</span>
                             )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                         <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-400 hover:text-indigo-600 transition-all">
                           <Sparkles className="w-4 h-4" />
                         </button>
                      </div>
                    </div>

                    <textarea 
                      className="w-full text-gray-600 dark:text-gray-400 font-medium bg-transparent border-none focus:ring-0 outline-none leading-relaxed min-h-[80px] resize-none mb-6"
                      value={project.description}
                      onChange={(e) => {
                        const newProjects = [...data.projects];
                        newProjects[idx].description = e.target.value;
                        setData({...data, projects: newProjects});
                      }}
                    />

                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.techStack.map((tech, i) => (
                        <span key={i} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-lg text-[10px] font-black uppercase tracking-widest">{tech}</span>
                      ))}
                    </div>

                    <div className="p-4 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/20">
                      <p className="text-xs font-bold text-indigo-700 dark:text-indigo-400 flex items-center">
                        <Zap className="w-3 h-3 mr-2" /> Recruiter Attention Strategy:
                      </p>
                      <p className="text-xs text-indigo-600 dark:text-indigo-300 mt-1 italic font-medium">"{project.recruiterImpact}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </main>

          {/* Sidebar Analytics */}
          <aside className="w-[450px] bg-white dark:bg-dark-card border-l border-gray-100 dark:border-gray-800 flex flex-col shadow-2xl">
            <div className="p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
              
              {/* Score Section */}
              <div className="space-y-6">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">AI Portfolio Analytics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-gray-50 dark:bg-dark-bg rounded-3xl text-center space-y-2 border border-gray-100 dark:border-gray-800">
                    <h4 className="text-3xl font-black text-indigo-600">{data.portfolioScore}</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-tight">Portfolio Score</p>
                  </div>
                  <div className="p-6 bg-gray-50 dark:bg-dark-bg rounded-3xl text-center space-y-2 border border-gray-100 dark:border-gray-800">
                    <h4 className="text-3xl font-black text-purple-600">{data.recruiterAttentionScore}</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-tight">Attention score</p>
                  </div>
                </div>
              </div>

              {/* Impact Meter */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Recruiter Impact Meter</span>
                  <span className="text-xs font-black text-gray-900 dark:text-white">{data.analytics.impactMeter}%</span>
                </div>
                <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000" style={{ width: `${data.analytics.impactMeter}%` }}></div>
                </div>
              </div>

              {/* Skill Analysis */}
              <div className="p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-[2rem] border border-indigo-100 dark:border-indigo-900/20">
                <h4 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4 flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2" /> Skill Visibility Analysis
                </h4>
                <p className="text-xs text-indigo-800 dark:text-indigo-300 font-medium leading-relaxed leading-relaxed">
                  {data.analytics.skillVisibility}
                </p>
              </div>

              {/* Exports Section */}
              <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Autonomous Exports</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => handleExport('github')}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-bg hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 transition-all group"
                  >
                    <div className="flex items-center">
                      <Github className="w-5 h-5 mr-3 text-gray-900 dark:text-white" />
                      <div className="text-left">
                        <p className="text-xs font-black text-gray-900 dark:text-white">GitHub README</p>
                        <p className="text-[10px] text-gray-500">AI Profile Template</p>
                      </div>
                    </div>
                    <Copy className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 transition-colors" />
                  </button>
                  
                  <button 
                    onClick={() => handleExport('ppt')}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-bg hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 transition-all group"
                  >
                    <div className="flex items-center">
                      <Layout className="w-5 h-5 mr-3 text-orange-500" />
                      <div className="text-left">
                        <p className="text-xs font-black text-gray-900 dark:text-white">PPT Skeleton</p>
                        <p className="text-[10px] text-gray-500">5-Slide Interview Deck</p>
                      </div>
                    </div>
                    <Copy className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 transition-colors" />
                  </button>

                  <button className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-bg hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 transition-all group">
                    <div className="flex items-center">
                      <Download className="w-5 h-5 mr-3 text-red-500" />
                      <div className="text-left">
                        <p className="text-xs font-black text-gray-900 dark:text-white">PDF Portfolio</p>
                        <p className="text-[10px] text-gray-500">Print Ready</p>
                      </div>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-gray-300 rotate-180 group-hover:text-indigo-600 transition-colors" />
                  </button>
                </div>
              </div>

            </div>
          </aside>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <PortfolioView data={data} theme={data.theme} />
        </div>
      )}
    </div>
  );
};

export default PortfolioBuilder;
