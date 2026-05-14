import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Bot, X, Sparkles, TrendingUp, AlertCircle, 
  MessageSquare, Send, ChevronRight, Zap, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RecruiterDashboardAgent = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isPulsing, setIsPulsing] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [message, setMessage] = useState('');
  const chatEndRef = useRef(null);

  const fetchInsights = async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const res = await axios.get('/api/users/recruiter/insights', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setInsights(res.data);
      setLastUpdated(new Date());
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 5000); // Stop pulsing after 5s
    } catch (err) {
      console.error("Failed to fetch recruiter insights:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'recruiter') {
      fetchInsights();
      const interval = setInterval(fetchInsights, 60000); // Poll every 1 minute
      return () => clearInterval(interval);
    }
  }, [user?.token, user?.role]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    const userMsg = message.trim();
    setMessage('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await axios.post('/api/match/skilly-chat', {
        message: userMsg,
        history: chatHistory.slice(-5),
        context: {
          role: 'recruiter',
          insights: insights
        }
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      setChatHistory(prev => [...prev, { role: 'skilly', content: res.data.content }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'skilly', content: "I'm having trouble analyzing the pool right now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'recruiter') return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      
      {/* Agent Panel */}
      {isOpen && (
        <div className="mb-4 w-[380px] md:w-[450px] h-[600px] bg-white dark:bg-dark-card rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden animate-slide-up">
          
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-black text-lg tracking-tight">Recruiter Intel Agent</h3>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-xs text-indigo-100 font-medium uppercase tracking-wider">Autonomous Monitor Active</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 dark:bg-dark-bg/30">
            
            {/* Insights Section */}
            {insights && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center">
                    <Sparkles className="w-3 h-3 mr-2 text-yellow-500" /> Latest Autonomous Insights
                  </h4>
                  <span className="text-[10px] text-gray-400">
                    {lastUpdated && `Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                  </span>
                </div>
                
                <div className="card bg-white dark:bg-dark-card p-4 border-l-4 border-l-indigo-500 shadow-sm">
                  <h5 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-indigo-500" /> {insights.headline}
                  </h5>
                  <div className="space-y-3">
                    {insights.insights.map((insight, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`p-3 rounded-xl flex items-center gap-3 border ${
                  insights.priority === 'high' 
                    ? 'bg-red-50 border-red-100 text-red-700 dark:bg-red-900/10 dark:border-red-900/20 dark:text-red-400' 
                    : 'bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-900/10 dark:border-blue-900/20 dark:text-blue-400'
                }`}>
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-xs font-bold uppercase tracking-wide">Priority: {insights.priority} Attention Required</p>
                </div>
              </div>
            )}

            {/* Chat History */}
            {chatHistory.length > 0 && (
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[90%] p-3 rounded-2xl text-sm ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-md' 
                        : 'bg-white dark:bg-dark-card text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-gray-800 shadow-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {loading && !insights && (
              <div className="flex flex-col items-center justify-center h-40 space-y-4">
                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                <p className="text-sm font-medium text-gray-500 animate-pulse">Analyzing hiring pipeline...</p>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Action Footer */}
          <div className="p-4 bg-white dark:bg-dark-card border-t border-gray-100 dark:border-gray-800">
            <form onSubmit={handleSend} className="relative">
              <input 
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about candidate trends..."
                className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
              />
              <button 
                type="submit"
                disabled={!message.trim() || loading}
                className={`absolute right-2 top-1.5 p-1.5 rounded-xl transition-all ${
                  !message.trim() || loading 
                    ? 'text-gray-300' 
                    : 'text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Bubble */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative w-20 h-20 rounded-3xl shadow-2xl flex items-center justify-center transition-all duration-500 active:scale-95 overflow-hidden border-4 ${
          isOpen 
            ? 'bg-white dark:bg-dark-card text-gray-600 rotate-90 border-gray-200 dark:border-gray-700' 
            : `bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 border-white dark:border-dark-bg hover:scale-110 hover:-translate-y-2 ${isPulsing ? 'animate-bounce shadow-indigo-500/50 shadow-[0_0_25px]' : ''}`
        }`}
      >
        {isOpen ? <X className="w-10 h-10" /> : (
          <div className="relative">
            <Bot className="w-10 h-10 text-white group-hover:scale-110 transition-transform" />
            {isPulsing && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-yellow-400"></span>
              </span>
            )}
          </div>
        )}

        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute right-full mr-6 px-4 py-3 bg-gray-900/95 backdrop-blur-md text-white text-xs font-black rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none shadow-2xl translate-x-4 group-hover:translate-x-0 border border-white/10">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              Recruiter Intel: {insights ? 'New Insights Ready' : 'Monitoring Pipeline...'}
            </div>
            <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 bg-gray-900 rotate-45"></div>
          </div>
        )}
      </button>
    </div>
  );
};

export default RecruiterDashboardAgent;
