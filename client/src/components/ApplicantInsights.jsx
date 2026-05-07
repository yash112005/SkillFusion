import { useState } from 'react';
import { 
  Users, TrendingUp, AlertTriangle, CheckCircle2, 
  BarChart3, Lightbulb, Info, X 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

const ApplicantInsights = ({ insights, onDismiss }) => {
  if (!insights) return null;

  if (!insights.activated) {
    return (
      <div className="card bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800 p-6 flex items-center justify-between mb-8 animate-fade-in">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-4">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-blue-900 dark:text-blue-200">Applicant Insights</h3>
            <p className="text-sm text-blue-700 dark:text-blue-400">{insights.message}</p>
          </div>
        </div>
        <div className="text-xs font-bold text-blue-500 bg-white dark:bg-dark-card px-3 py-1 rounded-full shadow-sm">
          {insights.total} / 3 Applicants
        </div>
      </div>
    );
  }

  const { metrics, topSkills, missingSkills, distribution, suggestions, poolNote, hasStructuredSkills } = insights;

  return (
    <section className="space-y-8 mb-12 animate-fade-in">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center">
          <BarChart3 className="w-6 h-6 mr-3 text-primary-600" /> Applicant Insights
        </h2>
        <button 
          onClick={onDismiss}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400"
          title="Dismiss for this session"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {poolNote && (
        <div className={`p-4 rounded-xl flex items-center ${
          insights.metrics.avgScore > 85 
            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800' 
            : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800'
        }`}>
          <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
          <p className="text-sm font-bold">{poolNote}</p>
        </div>
      )}

      {/* 1. Pool Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Total Applicants" value={metrics.total} icon={<Users />} color="blue" />
        <MetricCard label="Avg Match Score" value={`${metrics.avgScore}%`} icon={<TrendingUp />} color="indigo" />
        <MetricCard 
          label="Strong Fits" 
          value={metrics.strongFits.count} 
          subValue={`${metrics.strongFits.percent}% of pool`}
          icon={<CheckCircle2 />} 
          color="emerald" 
        />
        <MetricCard 
          label="Weak Fits" 
          value={metrics.weakFits.count} 
          subValue={`${metrics.weakFits.percent}% of pool`}
          icon={<AlertTriangle />} 
          color="rose" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 2. Top Skills */}
        <div className="card p-6 border-0 shadow-lg bg-white dark:bg-dark-card">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Top Skills Across Applicants</h3>
          <div className="space-y-5">
            {topSkills.map((skill, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-gray-700 dark:text-gray-300">{skill.name}</span>
                  <span className="text-gray-500 dark:text-gray-400">{skill.count} / {metrics.total} applicants</span>
                </div>
                <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-500 rounded-full transition-all duration-1000"
                    style={{ width: `${skill.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Missing Skill Trends */}
        <div className="card p-6 border-0 shadow-lg bg-white dark:bg-dark-card">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Missing Skill Trends (Gap Heatmap)</h3>
          <div className="space-y-4">
            {missingSkills.map((skill, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 ${
                    skill.severity === 'Critical' ? 'bg-rose-500' : 
                    skill.severity === 'Common' ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                  <span className="font-bold text-gray-700 dark:text-gray-200">{skill.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-500">{skill.percent}% missing</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${
                    skill.severity === 'Critical' ? 'bg-rose-100 text-rose-700' : 
                    skill.severity === 'Common' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {skill.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 4. Score Distribution */}
        <div className="lg:col-span-2 card p-6 border-0 shadow-lg bg-white dark:bg-dark-card h-[350px]">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Match Score Distribution</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-800" />
              <XAxis 
                dataKey="range" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 700 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 700 }}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  backgroundColor: '#1f2937',
                  color: '#fff'
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {distribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(index)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 5. JD Refinement Suggestions */}
        <div className="card p-6 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-dark-card dark:to-gray-900">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center">
            <Lightbulb className="w-4 h-4 mr-2 text-amber-500" /> JD Refinement Suggestions
          </h3>
          <ul className="space-y-4">
            {suggestions.map((suggestion, i) => (
              <li key={i} className="flex items-start group">
                <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center flex-shrink-0 mr-3 mt-0.5 group-hover:scale-110 transition-transform">
                  <span className="text-[10px] font-black">{i + 1}</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {suggestion}
                </p>
              </li>
            ))}
          </ul>
          
          {!hasStructuredSkills && (
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-amber-600 dark:text-amber-500 font-bold bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl border border-amber-100 dark:border-amber-800">
                Tip: Add explicit skill requirements to your JD for more accurate insights.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const MetricCard = ({ label, value, subValue, icon, color }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-100 dark:border-blue-800',
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 border-rose-100 dark:border-rose-800',
  };

  return (
    <div className={`card p-4 border shadow-sm ${colorMap[color]} flex flex-col items-center text-center transition-transform hover:-translate-y-1`}>
      <div className="mb-2 opacity-80">{icon}</div>
      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{label}</p>
      <h4 className="text-xl font-black">{value}</h4>
      {subValue && <p className="text-[10px] font-bold mt-1 opacity-70">{subValue}</p>}
    </div>
  );
};

const getBarColor = (index) => {
  const colors = [
    '#f43f5e', // rose-500
    '#fb923c', // orange-400
    '#fbbf24', // amber-400
    '#60a5fa', // blue-400
    '#818cf8', // indigo-400
    '#34d399', // emerald-400
    '#10b981', // emerald-500
  ];
  return colors[index];
};

export default ApplicantInsights;
