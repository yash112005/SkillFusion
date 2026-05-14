import React from 'react';
import { 
  ShieldCheck, AlertTriangle, Info, Sparkles, 
  Copy, Check, RefreshCw, Zap, TrendingUp, Heart
} from 'lucide-react';

const JDBiasAnalyzer = ({ analysis, loading, onFix, originalDescription }) => {
  const [copied, setCopied] = React.useState(false);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSeverityColor = (sev) => {
    switch (sev.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      default: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(originalDescription);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!analysis && !loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-gray-50/50 dark:bg-dark-bg/30 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
        <div className="w-16 h-16 bg-white dark:bg-dark-card rounded-2xl shadow-xl flex items-center justify-center mb-4 animate-bounce">
          <Zap className="w-8 h-8 text-indigo-500" />
        </div>
        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">Bias Analysis Ready</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[200px]">
          Type your job description to see real-time inclusivity insights.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6 animate-fade-in">
      
      {/* Top Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card bg-white dark:bg-dark-card p-4 border-0 shadow-xl flex flex-col items-center text-center group hover:scale-105 transition-transform">
          <div className="relative w-20 h-20 mb-2">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path className="text-gray-100 dark:text-gray-800" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
              <path className={`${getScoreColor(analysis?.inclusiveScore || 0)} transition-all duration-1000`} strokeDasharray={`${analysis?.inclusiveScore || 0}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-xl font-black ${getScoreColor(analysis?.inclusiveScore || 0)}`}>
                {loading ? '...' : (analysis?.inclusiveScore || 0)}
              </span>
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Inclusive Score</p>
        </div>

        <div className="card bg-white dark:bg-dark-card p-4 border-0 shadow-xl flex flex-col items-center text-center group hover:scale-105 transition-transform">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${
            analysis?.biasRiskLevel === 'High' ? 'bg-red-100 text-red-600' : analysis?.biasRiskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'
          }`}>
            <ShieldCheck className="w-7 h-7" />
          </div>
          <span className={`text-lg font-black ${
            analysis?.biasRiskLevel === 'High' ? 'text-red-600' : analysis?.biasRiskLevel === 'Medium' ? 'text-yellow-600' : 'text-green-600'
          }`}>
            {loading ? 'Analyzing...' : (analysis?.biasRiskLevel || 'Safe')}
          </span>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Bias Risk Level</p>
        </div>
      </div>

      {/* Summary Card */}
      <div className="card bg-gradient-to-br from-indigo-600 to-purple-600 p-5 text-white border-0 shadow-indigo-200 dark:shadow-none">
        <h4 className="text-xs font-black uppercase tracking-widest opacity-80 mb-2 flex items-center">
          <TrendingUp className="w-3 h-3 mr-2" /> Diversity Friendliness
        </h4>
        <div className="w-full h-2 bg-white/20 rounded-full mb-3 overflow-hidden">
          <div 
            className="h-full bg-white transition-all duration-1000 ease-out" 
            style={{ width: `${analysis?.inclusiveScore || 0}%` }}
          ></div>
        </div>
        <p className="text-sm font-medium leading-relaxed italic">
          "{loading ? 'Re-evaluating JD content...' : (analysis?.summary || 'Your job description is being analyzed for inclusive best practices.')}"
        </p>
      </div>

      {/* Findings List */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center px-1">
          <AlertTriangle className="w-3 h-3 mr-2 text-yellow-500" /> Language Alerts ({analysis?.findings?.length || 0})
        </h4>
        
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2].map(i => (
              <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl"></div>
            ))}
          </div>
        ) : (
          analysis?.findings?.map((item, idx) => (
            <div key={idx} className="card bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-800 p-4 shadow-sm group hover:shadow-md transition-all animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className="flex justify-between items-start mb-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter border ${getSeverityColor(item.severity)}`}>
                  {item.severity} Risk
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.category} Bias</span>
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white mb-1 flex items-center">
                <span className="px-1.5 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded mr-2 line-through decoration-2">
                  {item.phrase}
                </span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">{item.explanation}</p>
              
              <div className="p-3 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 rounded-xl flex items-center justify-between group/alt">
                <div className="flex items-center">
                  <Sparkles className="w-3 h-3 mr-2 text-green-500" />
                  <span className="text-xs font-bold text-green-700 dark:text-green-400">Try: {item.alternative}</span>
                </div>
                <button className="opacity-0 group-hover/alt:opacity-100 transition-opacity p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded">
                  <Check className="w-3 h-3 text-green-600" />
                </button>
              </div>
            </div>
          ))
        )}

        {analysis?.findings?.length === 0 && !loading && (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-green-600" />
            </div>
            <h5 className="font-bold text-gray-900 dark:text-white">Clean & Inclusive</h5>
            <p className="text-xs text-gray-500">No problematic language detected.</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
        <button 
          onClick={onFix}
          disabled={loading || !analysis?.findings?.length}
          className="flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50 disabled:grayscale"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
          Auto Fix
        </button>
        <button 
          onClick={copyToClipboard}
          className="flex items-center justify-center px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-2xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
        >
          {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
          {copied ? 'Copied!' : 'Copy JD'}
        </button>
      </div>

    </div>
  );
};

export default JDBiasAnalyzer;
