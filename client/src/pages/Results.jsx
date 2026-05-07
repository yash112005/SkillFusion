import { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  ArrowLeft, Download, RefreshCw, CheckCircle, AlertTriangle,
  Zap, FileText, ThumbsUp, ThumbsDown, Lock, Crown, Clock, TrendingUp, Medal, Award
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

  const displayMatch = latestMatch || history[0];

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

  const reportData = {
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
    createdAt: displayMatch?.createdAt
  };

  const [pdfInstance] = usePDF({
    document: displayMatch ? <PDFReport data={reportData} /> : null
  });

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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {jobTitle} <span className="text-gray-400 font-normal">@</span> {company}
              </h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 ml-8">
              {timeLabel} • AI-powered analysis
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
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <Link 
                to="/candidate-feedback" 
                state={{ score, jobTitle, companyName: company }}
                className="inline-flex items-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all no-underline"
              >
                <Medal className="w-5 h-5 mr-2" />
                View Achievement Badge
              </Link>
              <button 
                onClick={handleDownload}
                className="inline-flex items-center px-5 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                <Download className="w-5 h-5 mr-2 text-primary-500" />
                Download Full Report
              </button>
            </div>
          </div>
        </div>

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
              to="/results"
              onClick={(e) => { e.preventDefault(); navigate('/results'); }}
              className="flex-1 sm:flex-none flex items-center justify-center px-5 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Clock className="w-4 h-4 mr-2" />
              History dekho
            </Link>

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

    </div>
  );
};

export default Results;
