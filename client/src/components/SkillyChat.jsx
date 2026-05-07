import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  MessageSquare, X, Send, 
  Sparkles, User, Info, AlertCircle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SkillyLogo from '../assets/Gemini_Generated_Image_u55csxu55csxu55c.png';

const SkillyChat = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const chatEndRef = useRef(null);

  // Proactive Welcome
  useEffect(() => {
    const welcomeShown = sessionStorage.getItem('skilly_welcome_shown');
    if (!welcomeShown) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem('skilly_welcome_shown', 'true');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Initial greeting
  useEffect(() => {
    if (isOpen && history.length === 0) {
      setHistory([{
        role: 'skilly',
        content: "Hi! I'm Skilly. Ask me anything about your resume, job search, or how to use the app. How can I help you today?"
      }]);
    }
  }, [isOpen, history.length]);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Idle prompt logic
  useEffect(() => {
    let timer;
    if (isOpen && history.length === 1) {
      timer = setTimeout(() => {
        setShowPrompt(true);
      }, 10000);
    }
    return () => clearTimeout(timer);
  }, [isOpen, history.length]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    const userMsg = message.trim();
    setMessage('');
    setHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    setShowPrompt(false);

    if (!user?.token) {
      setHistory(prev => [...prev, { 
        role: 'skilly', 
        content: "Please log in so I can help you with your resume and job search context!" 
      }]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      // Collect context
      const context = {
        hasResume: !!sessionStorage.getItem('last_resume_text'),
        hasJD: !!sessionStorage.getItem('last_jd_text'),
        matchScore: sessionStorage.getItem('last_match_score'),
        resumeText: sessionStorage.getItem('last_resume_text'),
        jdText: sessionStorage.getItem('last_jd_text'),
      };

      const res = await axios.post('/api/match/skilly-chat', {
        message: userMsg,
        history: history.slice(-10), // Keep last 10 messages for context
        context
      }, {
        headers: { Authorization: `Bearer ${user.token}` },
        signal: controller.signal
      });

      setHistory(prev => [...prev, { role: 'skilly', content: res.data.content }]);
    } catch (err) {
      const isTimeout = err.code === 'ERR_CANCELED' || err.name === 'AbortError';
      setHistory(prev => [...prev, { 
        role: 'skilly', 
        content: isTimeout 
          ? "Sorry, that took too long. Can you try a shorter or simpler question?"
          : "I'm a bit overwhelmed right now. Can you try asking that again in a second?" 
      }]);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[350px] md:w-[400px] h-[500px] bg-white dark:bg-dark-card rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden animate-slide-up">
          
          {/* Header */}
          <div className="p-4 bg-primary-600 text-white flex items-center justify-between shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-white/20">
                <img src={SkillyLogo} alt="Skilly" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Skilly</h3>
                <div className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-[10px] text-primary-100">Doubt Solver</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
            {history.map((msg, i) => (
              <div 
                key={i} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-primary-600 text-white rounded-tr-none' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none'
                }`}>
                  {msg.content.split('\n').map((line, j) => (
                    <p key={j} className={j > 0 ? 'mt-2' : ''}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}

            {showPrompt && !loading && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-primary-50 dark:bg-primary-900/20 p-3 rounded-2xl rounded-tl-none border border-primary-100 dark:border-primary-800 text-xs text-primary-700 dark:text-primary-400 font-medium italic">
                  Need help with something? You can ask me anything — I'm Skilly!
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <form 
            onSubmit={handleSend}
            className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-dark-bg/50"
          >
            <div className="relative">
              <input 
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask me a doubt..."
                className="w-full pl-4 pr-12 py-3 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white"
              />
              <button 
                type="submit"
                disabled={!message.trim() || loading}
                className={`absolute right-2 top-1.5 p-1.5 rounded-lg transition-all ${
                  !message.trim() || loading 
                    ? 'text-gray-300' 
                    : 'text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-2 font-medium">
              Powered by Skilly AI
            </p>
          </form>
        </div>
      )}

      {/* Bubble */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 active:scale-95 overflow-hidden border-2 ${
          isOpen 
            ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rotate-90 border-gray-200 dark:border-gray-700' 
            : 'bg-white border-primary-500 hover:scale-110 hover:-translate-y-1'
        }`}
      >
        {isOpen ? <X className="w-8 h-8" /> : (
          <img src={SkillyLogo} alt="Skilly" className="w-full h-full object-cover group-hover:animate-pulse" />
        )}
        
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-dark-bg animate-pulse"></div>
        )}

        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute right-full mr-4 px-3 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
            Skilly: Ask me anything!
            <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
          </div>
        )}
      </button>
    </div>
  );
};

export default SkillyChat;
