import { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

import {
  ArrowLeft,
  Download,
  RefreshCw,
  Bookmark,
  CheckCircle,
  AlertTriangle,
  Briefcase,
  Award,
  Zap,
  ChevronRight,
  Building,
  MapPin,
  Clock,
  Search,
  FileText,
  BrainCircuit,
  Medal,
  ArrowRight,
  History,
} from 'lucide-react';

import Loader from '../components/Loader';

const DashboardCandidate = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || 'analytics'
  );

  const latestMatch = location.state?.matchResult;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [historyRes, jobsRes, interviewRes] = await Promise.all([
          axios.get('/api/match/history', {
            headers: {
              Authorization: `Bearer ${user?.token || ''}`,
            },
          }),

          axios.get('/api/jobs', {
            headers: {
              Authorization: `Bearer ${user?.token || ''}`,
            },
          }),

          axios.get('/api/interview/history', {
            headers: {
              Authorization: `Bearer ${user?.token || ''}`,
            },
          }),
        ]);

        setHistory(historyRes.data || []);
        setRecommendedJobs(jobsRes.data || []);
        setInterviewHistory(interviewRes.data || []);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const displayMatch = latestMatch || history[0];

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) {
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
    }

    if (score >= 60) {
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
    }

    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
  };

  const getEmoji = (score) => {
    if (score >= 80) return '🟢';
    if (score >= 60) return '🟡';
    return '🔴';
  };

  const score = displayMatch?.score ?? 85;

  const skillsList =
    displayMatch?.matchedSkills?.length > 0
      ? displayMatch.matchedSkills
      : [
          {
            skill: 'React.js',
            resPercent: 90,
            jdPercent: 100,
            percent: 90,
          },
          {
            skill: 'Node.js',
            resPercent: 85,
            jdPercent: 80,
            percent: 100,
          },
          {
            skill: 'TypeScript',
            resPercent: 60,
            jdPercent: 100,
            percent: 60,
          },
          {
            skill: 'MongoDB',
            resPercent: 95,
            jdPercent: 90,
            percent: 100,
          },
          {
            skill: 'AWS',
            resPercent: 40,
            jdPercent: 80,
            percent: 50,
          },
        ];

  const processedSkills = skillsList.map((s) => ({
    name: s.skill,
    resVal: s.resPercent ?? s.percent,
    jdVal: s.jdPercent ?? 100,
    match: s.percent ?? 0,
  }));

  const strengths = [
    'Strong technical foundation in core required technologies.',
    'Excellent alignment with front-end framework requirements.',
    'Sufficient years of active development experience.',
  ];

  const gaps = [
    'Missing some cloud deployment (AWS) specifics mentioned in JD.',
    'Could highlight leadership or mentorship experience more clearly.',
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

  const renderEmptyState = () => (
    <div className="card text-center py-20 max-w-md mx-auto animate-fade-in mt-12">
      <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-6" />

      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
        No matches yet
      </h3>

      <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
        Upload your resume and a job description to generate your first
        comprehensive match report.
      </p>

      <Link
        to="/upload"
        className="btn-primary w-full py-4 text-lg inline-block text-center"
      >
        Go to Upload
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {/* HEADER */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => navigate('/upload')}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium group"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Upload
            </button>

            <button
              onClick={() => navigate('/resume-builder')}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-bold shadow-sm"
            >
              <Briefcase className="w-5 h-5 mr-2" />
              Build Resume
            </button>
          </div>

          <div className="flex bg-gray-200 dark:bg-gray-800 p-1 rounded-xl shadow-inner">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${
                activeTab === 'analytics'
                  ? 'bg-white dark:bg-dark-card text-primary-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              My Analytics
            </button>

            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${
                activeTab === 'jobs'
                  ? 'bg-white dark:bg-dark-card text-primary-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Recommended Jobs
            </button>
          </div>
        </header>

        {/* ANALYTICS */}
        {activeTab === 'analytics' && (
          <>
            {!displayMatch ? (
              renderEmptyState()
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT */}
                <div className="lg:col-span-2 space-y-8">
                  {/* SCORE */}
                  <div
                    className={`px-6 py-4 rounded-xl border-2 font-black text-xl flex justify-center items-center shadow-sm ${getScoreBgColor(
                      score
                    )}`}
                  >
                    OVERALL MATCH SCORE: {score}% {getEmoji(score)}
                  </div>

                  {/* SKILLS */}
                  <section className="card p-0 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-dark-card/50">
                      <h2 className="text-xl font-bold flex items-center text-gray-900 dark:text-white">
                        <Zap className="w-5 h-5 mr-2 text-primary-500" />
                        Skills Match Analysis
                      </h2>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800/50">
                          <tr className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            <th className="px-6 py-4">Skill Name</th>
                            <th className="px-6 py-4 text-center">
                              Resume %
                            </th>
                            <th className="px-6 py-4 text-center">JD %</th>
                            <th className="px-6 py-4 w-1/3">
                              Match Score
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {processedSkills.map((item, i) => (
                            <tr
                              key={i}
                              className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                            >
                              <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-200">
                                {item.name}
                              </td>

                              <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">
                                {item.resVal}%
                              </td>

                              <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">
                                {item.jdVal}%
                              </td>

                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <div className="flex-1 h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mr-3">
                                    <div
                                      className={`h-full rounded-full ${
                                        item.match >= 80
                                          ? 'bg-green-500'
                                          : item.match >= 60
                                          ? 'bg-yellow-500'
                                          : 'bg-red-500'
                                      }`}
                                      style={{
                                        width: `${item.match}%`,
                                      }}
                                    />
                                  </div>

                                  <span
                                    className={`text-sm font-bold ${getScoreColor(
                                      item.match
                                    )} w-10 text-right`}
                                  >
                                    {item.match}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  {/* RESUME BUILDER */}
                  <Link
                    to="/resume-builder"
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary-300 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center mr-3">
                        <FileText className="w-4 h-4" />
                      </div>

                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Build Resume
                      </span>
                    </div>

                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                  </Link>

                  {/* MOCK INTERVIEW */}
                  <div className="rounded-2xl overflow-hidden shadow-lg border border-purple-200 dark:border-purple-800/50 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-900/20 dark:via-indigo-900/20 dark:to-blue-900/20">
                    <div className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md">
                          <BrainCircuit className="w-6 h-6 text-white" />
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-gray-900 dark:text-white">
                            AI Mock Interview
                          </h3>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Practice with AI-generated interview questions and get
                        real-time feedback.
                      </p>

                      <Link
                        to="/mock/interview"
                        className="w-full btn-primary flex items-center justify-center gap-2 py-3 no-underline"
                      >
                        Start Practicing
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* INTERVIEW HISTORY */}
                  {interviewHistory.length > 0 && (
                    <section className="card p-0 overflow-hidden">
                      <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-dark-card/50">
                        <h2 className="text-xl font-bold flex items-center text-gray-900 dark:text-white">
                          <History className="w-5 h-5 mr-2 text-primary-500" />
                          Recent Mock Interviews
                        </h2>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="bg-gray-50 dark:bg-gray-800/50">
                            <tr className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              <th className="px-6 py-4">Role</th>
                              <th className="px-6 py-4">Type</th>
                              <th className="px-6 py-4 text-center">
                                Score
                              </th>
                              <th className="px-6 py-4">Date</th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {interviewHistory.slice(0, 5).map((item, i) => (
                              <tr key={i}>
                                <td className="px-6 py-4">
                                  {item.role}
                                </td>

                                <td className="px-6 py-4">
                                  {item.type}
                                </td>

                                <td className="px-6 py-4 text-center font-bold">
                                  {item.overallScore}%
                                </td>

                                <td className="px-6 py-4 text-sm text-gray-500">
                                  {new Date(
                                    item.createdAt
                                  ).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  )}
                </div>

                {/* RIGHT */}
                <div className="lg:col-span-1">
                  <section className="card p-6 h-full flex flex-col">
                    <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
                      Insights
                    </h2>

                    {/* STRENGTHS */}
                    <div className="mb-6">
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
                        Top Strengths
                      </h3>

                      <ul className="space-y-3">
                        {strengths.map((str, idx) => (
                          <li key={idx} className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />

                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {str}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* GAPS */}
                    <div className="mb-6">
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
                        Areas for Improvement
                      </h3>

                      <ul className="space-y-3">
                        {gaps.map((gap, idx) => (
                          <li key={idx} className="flex items-start">
                            <AlertTriangle className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />

                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {gap}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* RADAR */}
                    <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800">
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 text-center">
                        Fit Profile
                      </h3>

                      <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart
                            cx="50%"
                            cy="50%"
                            outerRadius="70%"
                            data={radarData}
                          >
                            <PolarGrid />

                            <PolarAngleAxis
                              dataKey="subject"
                              tick={{
                                fill: '#6b7280',
                                fontSize: 11,
                              }}
                            />

                            <PolarRadiusAxis
                              angle={30}
                              domain={[0, 100]}
                              tick={false}
                              axisLine={false}
                            />

                            <Radar
                              name="Candidate"
                              dataKey="A"
                              stroke="#3b82f6"
                              fill="#3b82f6"
                              fillOpacity={0.4}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            )}
          </>
        )}

        {/* JOBS TAB */}
        {activeTab === 'jobs' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                  Recommended For You
                </h2>

                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Jobs matched to your profile based on AI scoring.
                </p>
              </div>

              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />

                <input
                  type="text"
                  placeholder="Search jobs..."
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white outline-none"
                />
              </div>
            </div>

            {recommendedJobs.length === 0 ? (
              <div className="card text-center py-20 max-w-md mx-auto">
                <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />

                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  No jobs found
                </h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedJobs.map((job) => (
                  <div
                    key={job._id}
                    className="card p-6 flex flex-col hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {job.title}
                      </h3>

                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                        <Building className="w-4 h-4 mr-1" />
                        {job.company}
                      </p>
                    </div>

                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4 space-x-4">
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {job.location}
                      </span>
                    </div>

                    <div className="mb-6 flex-1">
                      <div className="flex flex-wrap gap-2">
                        {job.skills?.slice(0, 3).map((skill, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Link
                      to={`/jobs/${job._id}`}
                      className="w-full py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-bold rounded-lg hover:bg-primary-600 hover:text-white transition-colors flex items-center justify-center text-sm"
                    >
                      View Details
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* BOTTOM ACTION BAR */}
      {activeTab === 'analytics' && displayMatch && (
        <div className="fixed bottom-0 left-0 w-full bg-white/90 dark:bg-dark-card/90 backdrop-blur-md border-t border-gray-200 dark:border-dark-border py-4 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400 hidden md:block">
              Report generated on {new Date().toLocaleDateString()}
            </div>

            <div className="flex items-center w-full sm:w-auto gap-3">
              <button
                onClick={handleDownload}
                className="flex items-center justify-center px-5 py-2.5 rounded-lg border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </button>

              <button
                onClick={() => alert('Results saved to your profile!')}
                className="flex items-center justify-center px-5 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-semibold"
              >
                <Bookmark className="w-4 h-4 mr-2" />
                Save
              </button>

              <button
                onClick={() => navigate('/upload')}
                className="flex items-center justify-center px-6 py-2.5 rounded-lg bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-bold"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Analyze Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardCandidate;