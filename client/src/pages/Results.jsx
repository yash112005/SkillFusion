import { useEffect, useState, useMemo } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from 'recharts';
import {
  ArrowLeft, Download, RefreshCw, CheckCircle, AlertTriangle,
  Zap, FileText, ThumbsUp, ThumbsDown, Lock, Crown, Clock, TrendingUp, Medal, Award, Briefcase, Search, BrainCircuit, X, History, Plus
} from 'lucide-react';
import Loader from '../components/Loader';
import { usePDF } from '@react-pdf/renderer';
import PDFReport from '../components/PDFReport';

const ScoreRing = ({ score, size = 180 }) => {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s) => {
    if (s >= 71) return { stroke: '#22c55e', bg: 'rgba(34,197,94,0.1)', text: 'text-green-500', label: 'Great Match!' };
    if (s >= 41) return { stroke: '#f59e0b', bg: 'rgba(245,158,11,0.1)', text: 'text-amber-500', label: 'Decent Fit' };
    return { stroke: '#ef4444', bg: 'rgba(239,68,68,0.1)', text: 'text-red-500', label: 'Needs Work' };
  };

  const color = getColor(score);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke="currentColor"
            className="text-gray-200 dark:text-gray-700"
            strokeWidth={strokeWidth} fill="none"
          />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke={color.stroke}
            strokeWidth={strokeWidth} fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-5xl font-black ${color.text}`}>{score}%</span>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">Match</span>
        </div>
      </div>
      <span className={`mt-3 text-sm font-bold ${color.text}`}>{color.label}</span>
    </div>
  );
};

const UsageBar = ({ used, limit, isPro }) => {
  if (isPro) return null;
  const percentage = (used / limit) * 100;
  const isLow = limit - used <= 1;

  return (
    <div className="card p-5 border-l-4 border-l-amber-500 mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center">
          <Clock className="w-4 h-4 mr-2 text-amber-500" />
          Matches Used This Month
        </span>
        <span className={`text-sm font-black ${isLow ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'}`}>
          {used} / {limit}
        </span>
      </div>
      <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isLow ? 'bg-gradient-to-r from-red-400 to-red-600' : 'bg-gradient-to-r from-amber-400 to-amber-600'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      {isLow && (
        <p className="text-xs text-red-500 mt-2 font-medium">
          ⚠️ Unlimited matches chahiye? <Link to="/pricing" className="underline font-bold hover:text-red-600">Upgrade to Pro →</Link>
        </p>
      )}
    </div>
  );
};

const ProLockBanner = () => (
  <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-primary-300 dark:border-primary-700 bg-gradient-to-br from-primary-50 via-indigo-50 to-purple-50 dark:from-primary-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 p-8 text-center">
    <div className="absolute inset-0 backdrop-blur-[2px]" />
    <div className="relative z-10">
      <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 dark:bg-primary-900/40 rounded-full flex items-center justify-center">
        <Lock className="w-8 h-8 text-primary-600 dark:text-primary-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Unlock Detailed Analysis</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto text-sm">
        Get ATS Score breakdown, detailed skill gap analysis, and personalized improvement suggestions with Pro.
      </p>
      <Link
        to="/pricing"
        className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
      >
        <Crown className="w-5 h-5 mr-2" />
        Upgrade to Pro
      </Link>
    </div>
  </div>
);

const Results = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackSent, setFeedbackSent] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [usageInfo, setUsageInfo] = useState({ usage_count: 0, limit: 5, isPro: false });
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistoryMatch, setSelectedHistoryMatch] = useState(null);

  const latestMatch = location.state?.matchResult;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${user?.token || ''}` };

        const [historyRes, usageRes] = await Promise.all([
          axios.get('/api/match/history', { headers }),
          axios.get('/api/match/usage', { headers })
        ]);

        setHistory(historyRes.data);
        setUsageInfo(usageRes.data);
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchData();
    else setLoading(false);
  }, [user]);

  const displayMatch = selectedHistoryMatch || latestMatch || history[0];

  const isPro = usageInfo.isPro || latestMatch?.isPro;

  const score = displayMatch?.score || 0;
  const jobTitle = displayMatch?.jobTitle || displayMatch?.job_title || 'Position';
  const company = displayMatch?.company || 'Company';
  const summary = displayMatch?.summary || '';
  const matchedKeywords = displayMatch?.matchedKeywords || displayMatch?.matched_keywords || [];
  const missingKeywords = displayMatch?.missingKeywords || displayMatch?.missing_keywords || [];
  const suggestions = displayMatch?.suggestions || '';
  const atsScore = displayMatch?.atsScore || 0;
  const matchId = displayMatch?._id;
  const createdAt = displayMatch?.createdAt ? new Date(displayMatch.createdAt) : new Date();
  const timeAgo = Math.floor((Date.now() - createdAt.getTime()) / 60000);
  const timeLabel = timeAgo < 1 ? 'Just now' : timeAgo < 60 ? `${timeAgo} min ago` : `${Math.floor(timeAgo / 60)}h ago`;

  const skillsList = displayMatch?.matchedSkills?.length > 0 ? displayMatch.matchedSkills : [];

  const strengths = [
    "Strong technical foundation in core required technologies.",
    "Excellent alignment with front-end framework requirements.",
    "Sufficient years of active development experience."
  ];

  const gaps = [
    "Missing some specific cloud deployment mentions in JD.",
    "Could highlight leadership or mentorship experience more clearly.",
    "Incorporating more outcome-based metrics in bullets."
  ];

  const radarData = [
    { subject: 'Tech Skills', A: score, fullMark: 100 },
    { subject: 'Experience', A: 90, fullMark: 100 },
    { subject: 'Education', A: 100, fullMark: 100 },
    { subject: 'Soft Skills', A: 85, fullMark: 100 },
    { subject: 'Keywords', A: Math.max(score - 10, 50), fullMark: 100 },
  ];

  const handleFeedback = async (type) => {
    if (!matchId || feedbackLoading) return;
    setFeedbackLoading(true);
    try {
      await axios.post('/api/match/feedback',
        { matchId, feedback: type },
        { headers: { Authorization: `Bearer ${user?.token || ''}` } }
      );
      setFeedbackSent(type);
    } catch (err) {
      console.error('Feedback failed', err);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const reportData = useMemo(() => ({
    jobTitle,
    company,
    score,
    summary,
    matchedKeywords,
    missingKeywords,
    skillsList,
    isPro,
    atsScore,
    suggestions,
    createdAt: displayMatch?.createdAt,
    candidateName: user?.name || 'User'
  }), [
    jobTitle, company, score, summary, matchedKeywords, 
    missingKeywords, skillsList, isPro, atsScore, 
    suggestions, displayMatch?.createdAt, user?.name
  ]);

  const pdfDocument = useMemo(() => (
    displayMatch ? <PDFReport data={reportData} /> : null
  ), [displayMatch, reportData]);

  const [pdfInstance, updatePdf] = usePDF({
    document: pdfDocument
  });

  useEffect(() => {
    if (pdfDocument) {
      updatePdf(pdfDocument);
    }
  }, [pdfDocument, updatePdf]);

  const handleDownload = () => {
    if (!pdfInstance || pdfInstance.loading) return;
    
    if (pdfInstance.error) {
      setError('Error generating PDF report. Please try again.');
      return;
    }
    
    if (pdfInstance.url) {
      const link = document.createElement('a');
      link.href = pdfInstance.url;
      const dateStr = new Date().toISOString().split('T')[0];
      link.download = `SkillFusion-Report-${dateStr}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) return <Loader fullScreen={true} />;

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

  if (error) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-dark-bg flex flex-col items-center justify-center p-4">
        <div className="card text-center py-16 max-w-md w-full animate-fade-in">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Something went wrong</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-8">{error}</p>
          <button onClick={() => navigate('/upload')} className="btn-primary w-full py-4 text-lg">
            <RefreshCw className="w-5 h-5 mr-2" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg pb-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">

        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {user?.name || 'Candidate Analysis'}
              </h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 ml-8 flex items-center gap-2">
              <span className="font-semibold text-primary-600 dark:text-primary-400">
                {jobTitle !== 'Position' && jobTitle !== 'Not specified' ? jobTitle : ''}
                {jobTitle !== 'Position' && jobTitle !== 'Not specified' && company !== 'Company' && company !== 'Unknown' ? ' @ ' : ''}
                {company !== 'Company' && company !== 'Unknown' ? company : ''}
                {(jobTitle === 'Position' || jobTitle === 'Not specified') && (company === 'Company' || company === 'Unknown') ? 'General Skill Analysis' : ''}
              </span>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <span>{timeLabel}</span>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <span className="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">AI Powered</span>
            </p>
          </div>

          {/* Usage Counter Badge */}
          {!isPro && (
            <div className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 border ${
              usageInfo.limit - (latestMatch?.usage_count || usageInfo.usage_count) <= 1
                ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
            }`}>
              <TrendingUp className="w-4 h-4" />
              {latestMatch?.usage_count || usageInfo.usage_count} / {usageInfo.limit} matches used
            </div>
          )}
        </header>

        {/* Usage Progress Bar */}
        <UsageBar
          used={latestMatch?.usage_count || usageInfo.usage_count}
          limit={usageInfo.limit || 5}
          isPro={isPro}
        />

        {/* Score Section */}
        <div className="card p-8 mb-6 flex flex-col md:flex-row items-center gap-8">
          <ScoreRing score={score} />
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Match Summary</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              {summary || `Your resume has a ${score}% match with the ${jobTitle} role at ${company}.`}
            </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <Link 
                  to="/candidate-feedback" 
                  state={{ score, jobTitle, companyName: company }}
                  className="inline-flex items-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 no-underline"
                >
                  <Medal className="w-5 h-5 mr-2" />
                  View Badge
                </Link>
                <Link 
                  to="/resume-builder" 
                  className="inline-flex items-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 no-underline"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Build Resume
                </Link>
                {user?.role === 'candidate' && (
                  <Link 
                    to="/dashboard/candidate" 
                    state={{ activeTab: 'jobs' }}
                    className="inline-flex items-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 no-underline"
                  >
                    <Briefcase className="w-5 h-5 mr-2" />
                    Recommended Jobs
                  </Link>
                )}
                <button 
                  onClick={handleDownload}
                  className="inline-flex items-center px-5 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
                >
                  <Download className="w-5 h-5 mr-2 text-primary-500" />
                  Download Report
                </button>
              </div>
          </div>
        </div>

        {/* Metrics Row */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <div className="card flex flex-col items-center text-center p-6 bg-gradient-to-br from-white to-gray-50 dark:from-dark-card dark:to-gray-900 border-t-4 border-t-blue-500 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
              <Award className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Years Match</h3>
            <p className="text-2xl font-black text-gray-900 dark:text-white">5 / 5</p>
            <p className="text-xs text-gray-500 mt-1">Experience Required</p>
          </div>

          <div className="card flex flex-col items-center text-center p-6 bg-gradient-to-br from-white to-gray-50 dark:from-dark-card dark:to-gray-900 border-t-4 border-t-purple-500 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
              <Briefcase className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Role Similarity</h3>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{Math.max(score - 5, 40)}%</p>
            <p className="text-xs text-gray-500 mt-1">Title Alignment</p>
          </div>

          <div className="card flex flex-col items-center text-center p-6 bg-gradient-to-br from-white to-gray-50 dark:from-dark-card dark:to-gray-900 border-t-4 border-t-emerald-500 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Key Responsibilities</h3>
            <p className="text-2xl font-black text-gray-900 dark:text-white">4 of 5</p>
            <p className="text-xs text-gray-500 mt-1">Core tasks matched</p>
          </div>
        </section>

        {/* Keyword Tags Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Matched Keywords */}
          <div className="card p-6">
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              Matched Keywords ({matchedKeywords.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {matchedKeywords.length > 0 ? matchedKeywords.map((kw, i) => (
                <span key={i} className="px-3 py-1.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm font-medium">
                  {kw}
                </span>
              )) : (
                <p className="text-gray-400 text-sm">No matched keywords found</p>
              )}
            </div>
          </div>

          {/* Missing Keywords */}
          <div className="card p-6">
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center">
              <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
              Missing Keywords ({missingKeywords.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {missingKeywords.length > 0 ? missingKeywords.map((kw, i) => (
                <span key={i} className="px-3 py-1.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-sm font-medium">
                  {kw}
                </span>
              )) : (
                <p className="text-gray-400 text-sm">No missing keywords — great job!</p>
              )}
            </div>
          </div>
        </div>

        {/* AI Insights & Fit Profile Graph */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 space-y-6">
            <section className="card p-6 h-full">
              <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
                <BrainCircuit className="w-6 h-6 mr-2 text-primary-500" /> AI Insights
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                    Top Strengths
                  </h3>
                  <ul className="space-y-4">
                    {strengths.map((str, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                    Areas to Improve
                  </h3>
                  <ul className="space-y-4">
                    {gaps.map((gap, idx) => (
                      <li key={idx} className="flex items-start">
                        <AlertTriangle className="w-5 h-5 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-1">
            <section className="card p-6 h-full flex flex-col items-center justify-center">
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6 text-center">
                Fit Profile Breakdown
              </h3>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#e5e7eb" className="dark:stroke-gray-700" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar 
                      name="Candidate" 
                      dataKey="A" 
                      stroke="#4f46e5" 
                      fill="#4f46e5" 
                      fillOpacity={0.4} 
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-gray-400 mt-4 text-center">
                *Visual representation of skills vs job expectations
              </p>
            </section>
          </div>
        </div>

        {/* Skills Match Table */}
        {skillsList.length > 0 && (
          <section className="card p-0 overflow-hidden mb-6">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-dark-card/50">
              <h2 className="text-lg font-bold flex items-center text-gray-900 dark:text-white">
                <Zap className="w-5 h-5 mr-2 text-primary-500" /> Skills Match Breakdown
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Skill</th>
                    <th className="px-6 py-4">JD Requirement</th>
                    <th className="px-6 py-4 w-1/3">Match %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {skillsList.map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-200">{item.skill}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{item.jd_req || '—'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-1 h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mr-3">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                item.percent >= 70 ? 'bg-green-500' : item.percent >= 40 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${item.percent}%` }}
                            />
                          </div>
                          <span className={`text-sm font-bold w-10 text-right ${
                            item.percent >= 70 ? 'text-green-500' : item.percent >= 40 ? 'text-amber-500' : 'text-red-500'
                          }`}>{item.percent}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Pro Upsell Lock Banner OR Detailed Suggestions */}
        {isPro ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* ATS Score Card */}
            <div className="card p-6 border-t-4 border-t-purple-500">
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">ATS Score</h3>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-black text-purple-600 dark:text-purple-400">{atsScore}%</div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Your resume's compatibility with Applicant Tracking Systems.</p>
              </div>
            </div>

            {/* Suggestions Card */}
            <div className="card p-6 border-t-4 border-t-blue-500">
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">AI Suggestions</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {suggestions || 'No specific suggestions at this time. Your resume looks strong!'}
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <ProLockBanner />
          </div>
        )}

        {/* Feedback Section */}
        <div className="card p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-center">
            Was this analysis helpful?
          </h3>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => handleFeedback('positive')}
              disabled={feedbackSent !== null || feedbackLoading}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                feedbackSent === 'positive'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 ring-2 ring-green-500 scale-105'
                  : feedbackSent !== null
                    ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed'
                    : 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 hover:scale-105'
              }`}
            >
              <ThumbsUp className="w-5 h-5" />
              Haan, helpful tha 👍
            </button>
            <button
              onClick={() => handleFeedback('negative')}
              disabled={feedbackSent !== null || feedbackLoading}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                feedbackSent === 'negative'
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 ring-2 ring-red-500 scale-105'
                  : feedbackSent !== null
                    ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed'
                    : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 hover:scale-105'
              }`}
            >
              <ThumbsDown className="w-5 h-5" />
              Improve karo 👎
            </button>
          </div>
          {feedbackSent && (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-3 animate-fade-in">
              Thanks for your feedback! 🙏
            </p>
          )}
        </div>

      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white/90 dark:bg-dark-card/90 backdrop-blur-md border-t border-gray-200 dark:border-dark-border py-4 z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_30px_rgba(0,0,0,0.2)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">

          <div className="text-sm text-gray-500 dark:text-gray-400 hidden md:block">
            Report generated on {createdAt.toLocaleDateString()}
          </div>

          <div className="flex items-center w-full sm:w-auto gap-3">
            <button
              onClick={handleDownload}
              disabled={!pdfInstance || pdfInstance.loading}
              className={`flex-1 sm:flex-none flex items-center justify-center px-5 py-2.5 rounded-lg border-2 border-gray-200 dark:border-gray-700 font-semibold transition-colors ${
                !pdfInstance || pdfInstance.loading 
                  ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed bg-gray-50 dark:bg-gray-800/50' 
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {pdfInstance?.loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </>
              )}
            </button>

            <Link
              to="/dashboard/candidate"
              state={{ activeTab: 'jobs' }}
              className="flex-1 sm:flex-none flex items-center justify-center px-5 py-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Jobs Recommended
            </Link>

            <button
              onClick={() => setShowHistory(true)}
              className="flex-1 sm:flex-none flex items-center justify-center px-5 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <History className="w-4 h-4 mr-2" />
              History
            </button>

            <button
              onClick={() => navigate('/upload')}
              className="flex-1 sm:flex-none flex items-center justify-center px-6 py-2.5 rounded-lg bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-bold hover:shadow-lg transition-all"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              New match karo
            </button>
          </div>
        </div>
      </div>

      {/* History Side Drawer */}
      {showHistory && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] animate-fade-in"
            onClick={() => setShowHistory(false)}
          />
          
          {/* Drawer */}
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-dark-card z-[101] shadow-2xl animate-slide-left overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Match History</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Select a past match to view details</p>
              </div>
              <button 
                onClick={() => setShowHistory(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {history.length === 0 ? (
                <div className="text-center py-20">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No past matches found.</p>
                </div>
              ) : (
                history.map((match, idx) => (
                  <button
                    key={match._id || idx}
                    onClick={() => {
                      setSelectedHistoryMatch(match);
                      setShowHistory(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all group ${
                      displayMatch?._id === match._id 
                        ? 'border-primary-500 bg-primary-50/30 dark:bg-primary-900/10' 
                        : 'border-transparent bg-gray-50 dark:bg-gray-800/50 hover:border-gray-200 dark:hover:border-gray-700'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        match.score >= 80 ? 'bg-green-100 text-green-700' : 
                        match.score >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {match.score}% Match
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {new Date(match.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors truncate">
                      {match.jobTitle || match.job_title || 'Position'}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {match.company || 'Company'}
                    </p>
                  </button>
                ))
              )}
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
              <button 
                onClick={() => navigate('/upload')}
                className="w-full py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Match Karo
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default Results;
