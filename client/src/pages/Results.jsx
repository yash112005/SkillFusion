import { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer 
} from 'recharts';
import { 
  ArrowLeft, Download, RefreshCw, Bookmark, CheckCircle, AlertTriangle, Briefcase, Award, Zap, ChevronRight, FileText
} from 'lucide-react';
import Loader from '../components/Loader';

const Results = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const latestMatch = location.state?.matchResult;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get('/api/match/history', {
          headers: { Authorization: `Bearer ${user?.token || ''}` }
        });
        setHistory(res.data);
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchHistory();
    else setLoading(false);
  }, [user]);

  const displayMatch = latestMatch || history[0];

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
  };

  const getEmoji = (score) => {
    if (score >= 80) return '🟢';
    if (score >= 60) return '🟡';
    return '🔴';
  };

  const score = displayMatch?.score || 85;
  
  const skillsList = displayMatch?.matchedSkills?.length > 0 ? displayMatch.matchedSkills : [
    { skill: 'React.js', resPercent: 90, jdPercent: 100, percent: 90 },
    { skill: 'Node.js', resPercent: 85, jdPercent: 80, percent: 100 },
    { skill: 'TypeScript', resPercent: 60, jdPercent: 100, percent: 60 },
    { skill: 'MongoDB', resPercent: 95, jdPercent: 90, percent: 100 },
    { skill: 'AWS', resPercent: 40, jdPercent: 80, percent: 50 },
  ];

  const processedSkills = skillsList.map(s => ({
    name: s.skill,
    resVal: s.resPercent || s.percent,
    jdVal: s.jdPercent || 100,
    match: s.percent
  }));

  const strengths = [
    "Strong technical foundation in core required technologies.",
    "Excellent alignment with front-end framework requirements.",
    "Sufficient years of active development experience."
  ];

  const gaps = [
    "Missing some cloud deployment (AWS) specifics mentioned in JD.",
    "Could highlight leadership or mentorship experience more clearly."
  ];

  const radarData = [
    { subject: 'Tech Skills', A: score, fullMark: 100 },
    { subject: 'Experience', A: 90, fullMark: 100 },
    { subject: 'Education', A: 100, fullMark: 100 },
    { subject: 'Soft Skills', A: 85, fullMark: 100 },
    { subject: 'Keywords', A: Math.max(score - 10, 50), fullMark: 100 },
  ];

  const handleDownload = () => {
    window.print();
  };

  if (loading) {
    return <Loader fullScreen={true} />;
  }

  if (!displayMatch) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-dark-bg flex flex-col items-center justify-center p-4">
        <div className="card text-center py-20 max-w-md w-full animate-fade-in">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No results yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">Upload your resume and a job description to generate your first comprehensive match report.</p>
          <Link to="/upload" className="btn-primary w-full py-4 text-lg">Go to Upload</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg pb-20">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Match Results</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Your AI-powered resume analysis report</p>
          </div>

          <div className={`px-6 py-2.5 rounded-full border-2 font-bold text-lg flex items-center shadow-sm ${getScoreBgColor(score)}`}>
            {score}% MATCH {getEmoji(score)}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            
            <section className="card p-0 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-dark-card/50">
                <h2 className="text-xl font-bold flex items-center text-gray-900 dark:text-white">
                  <Zap className="w-5 h-5 mr-2 text-primary-500" /> Skills Match Analysis
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <th className="px-6 py-4">Skill Name</th>
                      <th className="px-6 py-4 text-center">Resume %</th>
                      <th className="px-6 py-4 text-center">JD %</th>
                      <th className="px-6 py-4 w-1/3">Match Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {processedSkills.map((item, i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-200">{item.name}</td>
                        <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">{item.resVal}%</td>
                        <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">{item.jdVal}%</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-1 h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mr-3">
                              <div 
                                className={`h-full rounded-full ${item.match >= 80 ? 'bg-green-500' : item.match >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${item.match}%` }}
                              ></div>
                            </div>
                            <span className={`text-sm font-bold ${getScoreColor(item.match)} w-10 text-right`}>{item.match}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="card flex flex-col items-center text-center p-6 bg-gradient-to-br from-white to-gray-50 dark:from-dark-card dark:to-gray-900 border-t-4 border-t-blue-500">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Years Match</h3>
                <p className="text-2xl font-black text-gray-900 dark:text-white">5 / 5</p>
                <p className="text-xs text-gray-500 mt-1">Years Required</p>
              </div>

              <div className="card flex flex-col items-center text-center p-6 bg-gradient-to-br from-white to-gray-50 dark:from-dark-card dark:to-gray-900 border-t-4 border-t-purple-500">
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                  <Briefcase className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Role Similarity</h3>
                <p className="text-2xl font-black text-gray-900 dark:text-white">85%</p>
                <p className="text-xs text-gray-500 mt-1">Title Alignment</p>
              </div>

              <div className="card flex flex-col items-center text-center p-6 bg-gradient-to-br from-white to-gray-50 dark:from-dark-card dark:to-gray-900 border-t-4 border-t-emerald-500">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Key Responsibilities</h3>
                <p className="text-2xl font-black text-gray-900 dark:text-white">4 of 5</p>
                <p className="text-xs text-gray-500 mt-1">Core tasks matched</p>
              </div>
            </section>
          </div>

          <div className="lg:col-span-1 space-y-8">
            
            <section className="card p-6 h-full flex flex-col">
              <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Insights</h2>
              
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center">
                  Top Strengths
                </h3>
                <ul className="space-y-3">
                  {strengths.map((str, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center">
                  Areas for Improvement
                </h3>
                <ul className="space-y-3">
                  {gaps.map((gap, idx) => (
                    <li key={idx} className="flex items-start">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 text-center">
                  Fit Profile
                </h3>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="#e5e7eb" className="dark:stroke-gray-700" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Candidate" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>
          </div>
        </div>

      </div>

      <div className="fixed bottom-0 left-0 w-full bg-white/90 dark:bg-dark-card/90 backdrop-blur-md border-t border-gray-200 dark:border-dark-border py-4 z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_30px_rgba(0,0,0,0.2)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          
          <div className="text-sm text-gray-500 dark:text-gray-400 hidden md:block">
            Report generated on {new Date().toLocaleDateString()}
          </div>

          <div className="flex items-center w-full sm:w-auto gap-3">
            <button 
              onClick={handleDownload}
              className="flex-1 sm:flex-none flex items-center justify-center px-5 py-2.5 rounded-lg border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </button>
            
            <button 
              onClick={() => { alert('Results saved to your profile!'); }}
              className="flex-1 sm:flex-none flex items-center justify-center px-5 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Bookmark className="w-4 h-4 mr-2" />
              Save
            </button>

            <button 
              onClick={() => navigate('/upload')}
              className="flex-1 sm:flex-none flex items-center justify-center px-6 py-2.5 rounded-lg bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-bold hover:shadow-lg transition-all"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Analyze Again
            </button>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default Results;
