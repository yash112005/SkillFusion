import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, Plus, Trash2, Zap, Trophy, AlertCircle, ChevronDown, ChevronUp, 
  ArrowRight, Upload, CheckCircle2, Sparkles, Building2, Briefcase, Target
} from 'lucide-react';
import Loader from '../components/Loader';

const MultiMatch = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jds, setJds] = useState([
    { id: 1, company: '', role: '', text: '' },
    { id: 2, company: '', role: '', text: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [expandedJD, setExpandedJD] = useState(null);
  const fileInputRef = useRef(null);

  const handleAddJD = () => {
    setJds([...jds, { id: Date.now(), company: '', role: '', text: '' }]);
  };

  const handleRemoveJD = (id) => {
    if (jds.length > 2) {
      setJds(jds.filter(jd => jd.id !== id));
    }
  };

  const handleJDChange = (id, field, value) => {
    setJds(jds.map(jd => jd.id === id ? { ...jd, [field]: value } : jd));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResumeFile(file);
      setResumeText(''); // Clear text if file is selected
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!resumeFile && !resumeText.trim()) {
      alert('Please upload a resume or paste your resume text.');
      return;
    }

    if (jds.some(jd => !jd.text.trim())) {
      alert('Please provide text for all job descriptions.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      if (resumeFile) {
        formData.append('resume', resumeFile);
      } else {
        formData.append('resumeText', resumeText);
      }
      
      formData.append('jds', JSON.stringify(jds));

      const response = await axios.post('/api/match/multi-compare', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user?.token || ''}`
        }
      });

      setResults(response.data);
      // Automatically expand the top result
      if (response.data.comparisons?.length > 0) {
        setExpandedJD(0);
      }
    } catch (err) {
      console.error('Multi-JD comparison failed:', err);
      alert(err.response?.data?.message || 'Failed to compare JDs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-emerald-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getScoreBg = (score) => {
    if (score >= 75) return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800';
    if (score >= 50) return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
    return 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800';
  };

  if (loading) return <Loader fullScreen={true} />;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            Multi-JD <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Comparison</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Upload your resume and compare it against multiple roles simultaneously to find your best fit.
          </p>
        </div>

        {!results ? (
          <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
            {/* Resume Section */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none p-8 border border-slate-100 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" /> Step 1: Your Resume
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div 
                  onClick={() => fileInputRef.current.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                    resumeFile 
                      ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10' 
                      : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:bg-blue-50/50'
                  }`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                  />
                  {resumeFile ? (
                    <>
                      <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-3" />
                      <span className="text-emerald-700 dark:text-emerald-400 font-medium">{resumeFile.name}</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-slate-400 mb-3" />
                      <span className="text-slate-600 dark:text-slate-400 font-medium text-center">Click to upload PDF or DOCX</span>
                    </>
                  )}
                </div>

                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Or paste plain text</span>
                  <textarea 
                    value={resumeText}
                    onChange={(e) => {
                      setResumeText(e.target.value);
                      setResumeFile(null);
                    }}
                    placeholder="Paste your resume content here..."
                    className="flex-1 w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none min-h-[150px]"
                  />
                </div>
              </div>
            </div>

            {/* JDs Section */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none p-8 border border-slate-100 dark:border-slate-700">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-indigo-600" /> Step 2: Job Descriptions
                </h2>
                <button 
                  type="button" 
                  onClick={handleAddJD}
                  className="flex items-center text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-xl transition-all"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Another JD
                </button>
              </div>

              <div className="space-y-6">
                {jds.map((jd) => (
                  <div key={jd.id} className="relative p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 group animate-slide-up">
                    {jds.length > 2 && (
                      <button 
                        type="button"
                        onClick={() => handleRemoveJD(jd.id)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase mb-1 block px-1">Role Title</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Senior Frontend Engineer"
                          value={jd.role}
                          onChange={(e) => handleJDChange(jd.id, 'role', e.target.value)}
                          className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase mb-1 block px-1">Company</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Google"
                          value={jd.company}
                          onChange={(e) => handleJDChange(jd.id, 'company', e.target.value)}
                          className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase mb-1 block px-1">Job Description Content</label>
                      <textarea 
                        value={jd.text}
                        onChange={(e) => handleJDChange(jd.id, 'text', e.target.value)}
                        placeholder="Paste the full job description here..."
                        className="w-full p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none min-h-[120px] focus:border-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black text-xl rounded-3xl shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all flex items-center justify-center group"
            >
              Analyze & Compare
              <Zap className="w-6 h-6 ml-2 group-hover:scale-125 transition-transform" />
            </button>
          </form>
        ) : (
          <div className="space-y-8 animate-fade-in">
            {/* Comparison Table */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
              <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-amber-500" /> Comparison Ranking
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 dark:border-slate-700/50">
                      <th className="px-6 py-4">Rank</th>
                      <th className="px-6 py-4">Role / Company</th>
                      <th className="px-6 py-4 text-center">Match Score</th>
                      <th className="px-6 py-4">Seniority Fit</th>
                      <th className="px-6 py-4">Quick Verdict</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-700/30">
                    {results.comparisons.map((item, idx) => (
                      <tr 
                        key={idx} 
                        className={`hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors cursor-pointer ${expandedJD === idx ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                        onClick={() => setExpandedJD(idx)}
                      >
                        <td className="px-6 py-5">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            idx === 0 ? 'bg-amber-100 text-amber-600' : 
                            idx === 1 ? 'bg-slate-100 text-slate-600' : 
                            'bg-orange-100 text-orange-600'
                          }`}>
                            #{idx + 1}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="font-bold text-slate-900 dark:text-white">{item.role}</div>
                          <div className="text-sm text-slate-500">{item.company}</div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className={`text-2xl font-black ${getScoreColor(item.score)}`}>
                            {item.score}<span className="text-xs opacity-60 ml-0.5">%</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            item.seniority === 'match' ? 'bg-emerald-100 text-emerald-700' :
                            item.seniority === 'over' ? 'bg-blue-100 text-blue-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {item.seniority}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-sm text-slate-600 dark:text-slate-400 italic line-clamp-1">{item.quickVerdict}</p>
                        </td>
                        <td className="px-6 py-5 text-right">
                          {expandedJD === idx ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="space-y-6">
              {results.comparisons.map((item, idx) => (
                <div key={idx} className={`bg-white dark:bg-slate-800 rounded-3xl shadow-lg border-2 transition-all ${
                  expandedJD === idx ? 'border-blue-400 dark:border-blue-600 ring-4 ring-blue-500/10' : 'border-transparent'
                }`}>
                  <button 
                    onClick={() => setExpandedJD(expandedJD === idx ? null : idx)}
                    className="w-full text-left p-6 flex justify-between items-center"
                  >
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-4 ${getScoreBg(item.score)}`}>
                        <Building2 className={`w-6 h-6 ${getScoreColor(item.score)}`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{item.role} @ {item.company}</h3>
                        <p className="text-sm text-slate-500 font-medium">Detailed Analysis — {item.score}/100 Match</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {idx === 0 && (
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-black uppercase tracking-tighter animate-pulse">
                          Top Choice
                        </span>
                      )}
                      {expandedJD === idx ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                    </div>
                  </button>

                  {expandedJD === idx && (
                    <div className="px-6 pb-8 space-y-8 animate-slide-up">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                            <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" /> Matched Skills
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {item.matchedSkills.map((skill, sidx) => (
                              <span key={sidx} className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm font-semibold border border-emerald-100 dark:border-emerald-800">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-2 text-amber-500" /> Missing Skills / Gaps
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {item.missingSkills.map((skill, sidx) => (
                              <span key={sidx} className="px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-xl text-sm font-semibold border border-amber-100 dark:border-amber-800">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100 dark:border-slate-700">
                        <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                            <Target className="w-4 h-4 mr-2 text-blue-500" /> ATS Red Flags to Add
                          </h4>
                          <ul className="space-y-2">
                            {item.atsRedFlags.map((flag, fidx) => (
                              <li key={fidx} className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-2" />
                                {flag}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                            <Sparkles className="w-4 h-4 mr-2 text-purple-500" /> Tailoring Tip
                          </h4>
                          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-900 dark:to-slate-900 border border-indigo-100 dark:border-slate-700 shadow-inner">
                            <p className="text-sm text-indigo-900 dark:text-indigo-300 font-medium leading-relaxed">
                              {item.tailoringTip}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Best Bet Recommendation */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-2xl shadow-blue-500/30 overflow-hidden relative group">
              <Sparkles className="absolute top-[-20px] right-[-20px] w-40 h-40 text-white/10 group-hover:rotate-12 transition-transform duration-1000" />
              <div className="relative z-10">
                <div className="inline-flex items-center px-4 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-widest mb-6">
                  <Target className="w-4 h-4 mr-2" /> Final Recommendation
                </div>
                <h2 className="text-3xl font-black mb-4">Your Best Bet: {results.bestBet.recommendation}</h2>
                <p className="text-blue-100 text-lg mb-8 max-w-2xl leading-relaxed">
                  {results.bestBet.reason}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => navigate('/upload')}
                    className="px-8 py-4 bg-white text-blue-700 font-black rounded-2xl hover:bg-blue-50 transition-all flex items-center justify-center shadow-lg"
                  >
                    Analyze Again
                  </button>
                  <Link 
                    to="/resume-builder"
                    className="px-8 py-4 bg-blue-500/20 backdrop-blur-sm border-2 border-white/30 text-white font-black rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center"
                  >
                    Tailor Resume Now <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.5s ease-out forwards;
        }
        .animate-fade-in {
          animation: opacity 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default MultiMatch;
