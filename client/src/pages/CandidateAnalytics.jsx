import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, Mail, Phone, Briefcase, CheckCircle, 
  XCircle, Award, Star, Activity, ChevronRight, UserCheck, UserX 
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, Tooltip 
} from 'recharts';
import Loader from '../components/Loader';

const CandidateAnalytics = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const res = await axios.get(`/api/users/recruiter/candidate/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setCandidate(res.data);
      } catch (err) {
        console.error("Failed to fetch candidate analytics:", err);
        setError("Candidate not found or error loading data.");
      } finally {
        setLoading(false);
      }
    };
    fetchCandidate();
  }, [id, user.token]);

  if (loading) return <Loader fullScreen={true} />;
  
  if (error || !candidate) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
        <p className="text-gray-500 dark:text-gray-400">{error || "Could not load candidate details."}</p>
        <button onClick={() => navigate(-1)} className="btn-primary mt-6">Go Back</button>
      </div>
    );
  }

  // Format data for Recharts Radar Chart
  const radarData = candidate.skillsList.map(item => ({
    subject: item.skill,
    A: item.percent,
    fullMark: 100,
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-4 sm:p-8 pb-20">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 bg-white dark:bg-dark-card rounded-full shadow-sm hover:shadow-md transition-all text-gray-500 dark:text-gray-400"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white">{candidate.name}</h1>
                <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
                  candidate.status === 'Interview' ? 'bg-blue-100 text-blue-700' :
                  candidate.status === 'Reviewed' ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {candidate.status}
                </span>
              </div>
              <p className="text-primary-600 dark:text-primary-400 font-semibold mt-1">{candidate.role}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center px-6 py-3 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
              <UserX className="w-5 h-5 mr-2" /> Reject
            </button>
            <button className="flex items-center px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-primary-600 to-indigo-600 shadow-lg shadow-primary-200 dark:shadow-none hover:scale-105 transition-transform">
              <UserCheck className="w-5 h-5 mr-2" /> Shortlist Candidate
            </button>
          </div>
        </div>

        {/* Top Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card md:col-span-1 p-6 space-y-6">
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Contact & Info</h3>
            <div className="space-y-4">
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <Mail className="w-5 h-5 mr-3 text-gray-400" /> {candidate.email}
              </div>
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <Phone className="w-5 h-5 mr-3 text-gray-400" /> {candidate.phone}
              </div>
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <Briefcase className="w-5 h-5 mr-3 text-gray-400" /> {candidate.experience}
              </div>
            </div>
          </div>

          <div className="card md:col-span-3 p-6 bg-gradient-to-br from-white to-indigo-50/50 dark:from-dark-card dark:to-indigo-900/10">
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6">Candidate Hierarchy & Fit</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div>
                <div className="w-16 h-16 mx-auto bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-full flex items-center justify-center mb-3">
                  <Activity className="w-8 h-8" />
                </div>
                <div className="text-3xl font-black text-gray-900 dark:text-white">{candidate.score}%</div>
                <div className="text-xs font-bold text-gray-500 uppercase mt-1">Overall Match</div>
              </div>
              <div>
                <div className="w-16 h-16 mx-auto bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 rounded-full flex items-center justify-center mb-3">
                  <Award className="w-8 h-8" />
                </div>
                <div className="text-3xl font-black text-gray-900 dark:text-white">{candidate.atsScore}%</div>
                <div className="text-xs font-bold text-gray-500 uppercase mt-1">ATS Compatibility</div>
              </div>
              <div className="relative">
                <div className="w-16 h-16 mx-auto bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 rounded-full flex items-center justify-center mb-3">
                  <Star className="w-8 h-8" />
                </div>
                <div className="text-3xl font-black text-gray-900 dark:text-white">#{candidate.ranking}</div>
                <div className="text-xs font-bold text-gray-500 uppercase mt-1">
                  Out of {candidate.totalApplicants} Applicants
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Radar Chart */}
          <div className="card p-6 h-[400px] flex flex-col">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Skill Gap Analysis</h3>
            <p className="text-sm text-gray-500 mb-6">Visual mapping of candidate's proficiency vs. JD requirements.</p>
            <div className="flex-1 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 'bold' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Candidate" dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.4} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ color: '#4f46e5', fontWeight: 'bold' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Keyword Match Details */}
          <div className="space-y-6">
            <div className="card p-6 border-l-4 border-l-green-500">
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Matched Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {candidate.matchedKeywords.map((kw, i) => (
                  <span key={i} className="px-3 py-1.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm font-bold">
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            <div className="card p-6 border-l-4 border-l-red-500">
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                <XCircle className="w-5 h-5 text-red-500 mr-2" /> Missing Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {candidate.missingKeywords.length > 0 ? candidate.missingKeywords.map((kw, i) => (
                  <span key={i} className="px-3 py-1.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-sm font-bold">
                    {kw}
                  </span>
                )) : (
                  <span className="text-gray-500 dark:text-gray-400 text-sm italic">No major missing keywords!</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Skills Table */}
        <div className="card p-0 overflow-hidden border-t-4 border-t-primary-500">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Detailed Skill Match</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Skill Required</th>
                  <th className="px-6 py-4">Requirement Level</th>
                  <th className="px-6 py-4">Match Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {candidate.skillsList.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{item.skill}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{item.jd_req}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center max-w-xs">
                        <div className="flex-1 h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mr-3">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${
                              item.percent >= 80 ? 'bg-green-500' : item.percent >= 50 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${item.percent}%` }}
                          />
                        </div>
                        <span className={`text-sm font-bold w-12 text-right ${
                          item.percent >= 80 ? 'text-green-500' : item.percent >= 50 ? 'text-amber-500' : 'text-red-500'
                        }`}>{item.percent}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CandidateAnalytics;
