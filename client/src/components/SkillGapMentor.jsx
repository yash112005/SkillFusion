import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Sparkles, 
  ExternalLink, 
  GitFork, 
  Award, 
  BookOpen, 
  Lightbulb,
  BrainCircuit,
  RefreshCw,
  X,
  TrendingUp as Target
} from 'lucide-react';

const SkillGapMentor = ({ matchId, isOpen, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && matchId) {
      fetchAdvice();
    }
  }, [isOpen, matchId]);

  const fetchAdvice = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/match/${matchId}/mentor`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      console.error("Mentor error:", err);
      setError("Dost, AI Mentor thoda busy hai. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in" 
        onClick={onClose}
      />
      
      {/* Container */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-dark-card rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scale-up">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gradient-to-r from-primary-600/10 to-indigo-600/10 dark:from-primary-900/20 dark:to-indigo-900/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <BrainCircuit className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white leading-tight">Skill Gap Mentor Agent</h2>
              <p className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest">Autonomous Learning Assistant</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 border-4 border-primary-500/20 border-t-primary-600 rounded-full animate-spin mb-6" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Analyzing your skill gaps...</h3>
              <p className="text-gray-500 dark:text-gray-400">Our AI is designing a custom roadmap just for you.</p>
            </div>
          ) : error ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <RefreshCw className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{error}</h3>
              <button onClick={fetchAdvice} className="btn-primary mt-4">Try Again</button>
            </div>
          ) : (
            <>
              {/* Mentor Intro */}
              <div className="flex gap-4 items-start bg-primary-50 dark:bg-primary-900/10 p-6 rounded-2xl border-l-4 border-l-primary-600">
                <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center flex-shrink-0 shadow-sm border border-primary-100 dark:border-primary-900/30">
                  <Sparkles className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-gray-700 dark:text-gray-200 text-lg font-medium leading-relaxed">
                    {data.mentorMessage}
                  </p>
                </div>
              </div>

              {/* Roadmaps */}
              <div className="grid grid-cols-1 gap-8">
                {data.roadmaps.map((item, idx) => (
                  <div key={idx} className="relative group">
                    {/* Roadmap Header */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center font-black">
                        {idx + 1}
                      </div>
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white">{item.skill}</h3>
                      <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest border border-gray-200 dark:border-gray-700">
                        {item.timeframe} Roadmap
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Timeline */}
                      <div className="space-y-4">
                        <div className="relative pl-8 border-l-2 border-dashed border-gray-200 dark:border-gray-700 space-y-6">
                          <div className="relative">
                            <div className="absolute -left-[37px] top-0 w-4 h-4 rounded-full bg-primary-600 ring-4 ring-primary-100 dark:ring-primary-900/30" />
                            <h4 className="text-sm font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-1">Week 1: Fundamentals</h4>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.week1}</p>
                          </div>
                          <div className="relative">
                            <div className="absolute -left-[37px] top-0 w-4 h-4 rounded-full bg-indigo-600 ring-4 ring-indigo-100 dark:ring-indigo-900/30" />
                            <h4 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Week 2: Advanced & Projects</h4>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.week2}</p>
                          </div>
                        </div>
                        
                        <div className="bg-amber-50 dark:bg-amber-900/10 p-5 rounded-xl border border-amber-200/50 dark:border-amber-900/30">
                          <h5 className="text-xs font-black text-amber-700 dark:text-amber-500 uppercase tracking-widest mb-2 flex items-center">
                            <Lightbulb className="w-4 h-4 mr-2" /> Mentor's Secret Tip
                          </h5>
                          <p className="text-sm text-amber-800 dark:text-amber-200 italic">"{item.mentorTip}"</p>
                        </div>
                      </div>

                      {/* Resources */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Autonomous Learning Path</h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-all group/res cursor-default shadow-sm">
                            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600">
                              <BookOpen className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Top Course</p>
                              <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{item.resources.course}</p>
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-300 group-hover/res:text-primary-500 transition-colors" />
                          </div>

                          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all group/res cursor-default shadow-sm">
                            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600">
                              <Award className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Certification</p>
                              <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{item.resources.certification}</p>
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-300 group-hover/res:text-emerald-500 transition-colors" />
                          </div>

                          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white transition-all group/res cursor-default shadow-sm">
                            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
                              <GitFork className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Practice Repo</p>
                              <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{item.resources.github}</p>
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-300 group-hover/res:text-gray-900 dark:group-hover/res:text-white transition-colors" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {data.roadmaps.length === 0 && (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Award className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">No Gaps Found!</h3>
                    <p className="text-gray-500">You already possess all the key skills required for this role.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <Target className="w-4 h-4 text-primary-500" />
            Personalized Roadmap Generated by SkillFusion AI
          </div>
          <button 
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold hover:scale-105 transition-all shadow-lg active:scale-95"
          >
            Got it, thanks!
          </button>
        </div>

      </div>
    </div>
  );
};

export default SkillGapMentor;
